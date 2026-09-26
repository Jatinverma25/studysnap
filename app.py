import os
import json
import sqlite3
import datetime
import tempfile
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
from google.genai import types
from gemini_retry import (
    call_gemini_with_retry,
    retry_gemini_operation,
    is_temporary_error,
    FRIENDLY_BUSY_MESSAGE,
)

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
# Limit maximum upload size to 30 MB
app.config['MAX_CONTENT_LENGTH'] = 30 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'quiz_history.db')
JSON_PATH = os.path.join(BASE_DIR, 'quiz_history.json')

def init_db():
    """Initializes the SQLite database for quiz results tracking."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pdf_name TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL DEFAULT 10,
            percentage REAL NOT NULL,
            performance_message TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB table on startup
init_db()


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables. Please check your .env file.")
    return genai.Client(api_key=api_key)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/summarize', methods=['POST'])
def summarize():
    # 1. Validate file presence
    if 'pdf' not in request.files:
        return jsonify({"success": False, "error": "No PDF file uploaded."}), 400

    file = request.files['pdf']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"success": False, "error": "Only PDF files are supported."}), 400

    temp_path = None
    uploaded_file = None
    client = None

    try:
        # 2. Initialize Gemini Client
        client = get_gemini_client()

        # 3. Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            file.save(tmp.name)
            temp_path = tmp.name

        # 4. Upload file to Google Gemini Files API with automatic retry logic
        uploaded_file = retry_gemini_operation(
            lambda: client.files.upload(file=temp_path),
            max_attempts=4,
            retry_delay_seconds=3.0,
            operation_name="Files.upload"
        )

        # 5. Formulate prompt requesting all three summary modes in structured JSON
        prompt = """
        You are an expert educational companion and study assistant. Analyze this uploaded PDF document in depth.
        Generate three distinct summaries formatted in Markdown, tailored to different learning styles:

        1. EASY MODE (Beginner-Friendly):
           - Break down the core concepts using simple, plain everyday English.
           - Avoid technical jargon, or explain it immediately with accessible analogies.
           - Provide high-level takeaways, core ideas, and a bulleted review.

        2. DEEP MODE (Technical & Comprehensive):
           - Provide an exhaustive, detailed study breakdown of the paper/document.
           - Retain technical and domain-specific terminology with clear explanations.
           - Cover methodology, architecture, mathematical formulation (if present), nuances, and conclusions.

        3. FUN MODE (Analogies & Emojis):
           - Explain the material using creative, funny, and relatable real-world analogies.
           - Use a conversational, engaging, and lively tone.
           - Sprinkle relevant emojis throughout to make it entertaining and memorable.

        Return your output strictly as a JSON object with this exact structure:
        {
          "easy": "Markdown text for Easy Mode...",
          "deep": "Markdown text for Deep Mode...",
          "fun": "Markdown text for Fun Mode..."
        }
        """

        # 6. Generate content with automatic retry (4 attempts, 3s delay) and updated fallback chain
        result = call_gemini_with_retry(
            client=client,
            contents=[uploaded_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
            primary_model="gemini-3.8-flash",
            fallback_models=[
                "gemini-3.8-flash-latest",
                "gemini-flash-latest",
                "gemini-3-pro",
                "gemini-3.5-flash-lite",
            ],
            max_attempts=4,
            retry_delay_seconds=3.0,
            api_method="generate_content",
        )

        if not result["success"]:
            # If all attempts and fallback fail, return friendly error message
            return jsonify({
                "success": False,
                "error": FRIENDLY_BUSY_MESSAGE
            }), 503

        # 7. Parse JSON output
        response_text = result["text"].strip()
        try:
            summaries = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback cleanup in case markdown code blocks are returned
            cleaned = response_text
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            summaries = json.loads(cleaned.strip())

        return jsonify({
            "success": True,
            "filename": file.filename,
            "model_used": result.get("model_used"),
            "attempts": result.get("attempts"),
            "summaries": {
                "easy": summaries.get("easy", "No easy summary generated."),
                "deep": summaries.get("deep", "No deep summary generated."),
                "fun": summaries.get("fun", "No fun summary generated.")
            }
        })

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        if is_temporary_error(e):
            return jsonify({"success": False, "error": FRIENDLY_BUSY_MESSAGE}), 503
        return jsonify({"success": False, "error": f"Gemini Error: {str(e)}"}), 500
    finally:
        # Cleanup local temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        # Cleanup uploaded file from Gemini server
        if client and uploaded_file and hasattr(uploaded_file, 'name'):
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass


@app.route('/quiz/generate', methods=['POST'])
def generate_quiz():
    """Generates 10 multiple-choice questions from the uploaded PDF content only."""
    # 1. Validate file presence
    if 'pdf' not in request.files:
        return jsonify({"success": False, "error": "No PDF file uploaded for quiz."}), 400

    file = request.files['pdf']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"success": False, "error": "Only PDF files are supported."}), 400

    temp_path = None
    uploaded_file = None
    client = None

    try:
        # 2. Initialize Gemini Client
        client = get_gemini_client()

        # 3. Save uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            file.save(tmp.name)
            temp_path = tmp.name

        # 4. Upload file to Google Gemini Files API with automatic retry logic
        uploaded_file = retry_gemini_operation(
            lambda: client.files.upload(file=temp_path),
            max_attempts=4,
            retry_delay_seconds=3.0,
            operation_name="Files.upload (Quiz)"
        )

        # 5. Formulate prompt requesting exactly 10 MCQs from the PDF content only
        quiz_prompt = """
        You are an expert academic examiner. Analyze the attached PDF document thoroughly.
        Generate exactly 10 multiple-choice questions (MCQs) that rigorously evaluate comprehension of key concepts, factual findings, methods, and insights strictly found in this document.

        STRICT REQUIREMENTS:
        1. Rely ONLY on the information presented in the provided PDF. Do not invent or assume external facts.
        2. Create exactly 10 questions.
        3. Each question must have exactly 4 plausible, distinct options.
        4. "correct_answer" MUST match one of the 4 options verbatim.
        5. "explanation" must clearly explain why the correct answer is right based directly on the document text.

        Return your output STRICTLY as a JSON array of 10 question objects with this exact structure:
        [
          {
            "id": 1,
            "question": "What is the primary mechanism discussed in Section 2?",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "correct_answer": "Option B text",
            "explanation": "According to the document, ..."
          }
        ]
        """

        # 6. Generate content with automatic retry (4 attempts, 3s delay) and updated fallback chain
        result = call_gemini_with_retry(
            client=client,
            contents=[uploaded_file, quiz_prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
            primary_model="gemini-3.8-flash",
            fallback_models=[
                "gemini-3.8-flash-latest",
                "gemini-flash-latest",
                "gemini-3-pro",
                "gemini-3.5-flash-lite",
            ],
            max_attempts=4,
            retry_delay_seconds=3.0,
            api_method="generate_content",
        )

        if not result["success"]:
            return jsonify({
                "success": False,
                "error": FRIENDLY_BUSY_MESSAGE
            }), 503

        # 7. Parse JSON output
        response_text = result["text"].strip()
        try:
            questions = json.loads(response_text)
        except json.JSONDecodeError:
            cleaned = response_text
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            questions = json.loads(cleaned.strip())

        # If model returned an object with a "questions" key instead of direct array:
        if isinstance(questions, dict):
            for key in ["questions", "quiz", "items"]:
                if key in questions and isinstance(questions[key], list):
                    questions = questions[key]
                    break

        if not isinstance(questions, list):
            raise ValueError("Expected a list of 10 questions from Gemini model.")

        return jsonify({
            "success": True,
            "filename": file.filename,
            "model_used": result.get("model_used"),
            "attempts": result.get("attempts"),
            "questions": questions
        })

    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        if is_temporary_error(e):
            return jsonify({"success": False, "error": FRIENDLY_BUSY_MESSAGE}), 503
        return jsonify({"success": False, "error": f"Gemini Error: {str(e)}"}), 500
    finally:
        # Cleanup local temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        # Cleanup uploaded file from Gemini server
        if client and uploaded_file and hasattr(uploaded_file, 'name'):
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass


@app.route('/quiz/save', methods=['POST'])
def save_quiz_result():
    """Saves a quiz score and metadata to SQLite database and JSON file."""
    try:
        data = request.get_json() or {}
        pdf_name = data.get("pdf_name", "document.pdf")
        score = int(data.get("score", 0))
        total = int(data.get("total", 10))
        percentage = float(data.get("percentage", (score / total) * 100 if total > 0 else 0))
        performance_message = data.get("performance_message", "")
        created_at = data.get("created_at") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Save to SQLite database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quiz_results (pdf_name, score, total, percentage, performance_message, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (pdf_name, score, total, percentage, performance_message, created_at)
        )
        record_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # 2. Also append to JSON file for easy data export / inspection
        history_entry = {
            "id": record_id,
            "pdf_name": pdf_name,
            "score": score,
            "total": total,
            "percentage": percentage,
            "performance_message": performance_message,
            "created_at": created_at
        }
        history = []
        if os.path.exists(JSON_PATH):
            try:
                with open(JSON_PATH, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except Exception:
                history = []
        history.append(history_entry)
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

        return jsonify({"success": True, "id": record_id, "saved_at": created_at})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/quiz/history', methods=['GET'])
def get_quiz_history():
    """Retrieves all past quiz attempts from SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quiz_results ORDER BY id DESC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({"success": True, "history": rows})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"success": False, "error": "File size exceeds the 30MB limit."}), 413


if __name__ == '__main__':
    # Run Flask local development server
    print("[*] StudySnap is running on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
