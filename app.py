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
            difficulty TEXT DEFAULT 'medium',
            created_at TEXT NOT NULL
        )
    ''')
    cursor.execute("PRAGMA table_info(quiz_results)")
    columns = [row[1] for row in cursor.fetchall()]
    if "difficulty" not in columns:
        cursor.execute("ALTER TABLE quiz_results ADD COLUMN difficulty TEXT DEFAULT 'medium'")
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
        prompt = r"""
        You are an expert educational companion and study assistant. Analyze this uploaded PDF document in depth.
        Generate three distinct summaries formatted in Markdown, tailored to different learning styles:

        1. EASY MODE (Beginner-Friendly):
           - Break down the core concepts using simple, plain everyday English.
           - Avoid technical jargon, or explain it immediately with accessible analogies.
           - Provide high-level takeaways, core ideas, and a bulleted review.
           - Write math using LaTeX notation (e.g., $I_a = \sqrt{2} I \cos(\omega t)$) so it can be rendered properly. Keep LaTeX simple and standard.

        2. DEEP MODE (Technical & Comprehensive):
           - Provide an exhaustive, detailed study breakdown of the paper/document.
           - Retain technical and domain-specific terminology with clear explanations.
           - Cover methodology, architecture, mathematical formulation (if present), nuances, and conclusions.
           - Write math using LaTeX notation (e.g., $I_a = \sqrt{2} I \cos(\omega t)$) so it can be rendered properly. Keep LaTeX simple and standard.

        3. FUN MODE (Analogies & Emojis):
           - Explain the material using creative, funny, and relatable real-world analogies.
           - Use a conversational, engaging, and lively tone.
           - Sprinkle relevant emojis throughout to make it entertaining and memorable.
           - Write math using LaTeX notation (e.g., $I_a = \sqrt{2} I \cos(\omega t)$) so it can be rendered properly. Keep LaTeX simple and standard.

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
            primary_model="gemini-3.1-flash-lite",
            fallback_models=[
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.8-flash",
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


@app.route('/word-help', methods=['POST'])
def word_help():
    """Explains a term ONLY in the context of the uploaded PDF using Gemini with retry logic."""
    term = request.form.get('term', '').strip()
    if not term:
        return jsonify({"success": False, "error": "Please enter a term to explain."}), 400

    # 1. Validate file presence
    file = request.files.get('pdf') or request.files.get('file')
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "Please upload a PDF first"}), 400

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
            operation_name="Files.upload (Word Help)"
        )

        # 5. Formulate prompt requesting concise explanation in context of PDF
        instruction = (
            "Explain this term ONLY in the context of the uploaded PDF. "
            "Give: (1) simple meaning in 1-2 lines, (2) why it matters in this chapter, (3) one example. "
            'If the term is not related to the PDF, say exactly: "This term doesn\'t appear in your document." '
            "Keep any math in LaTeX notation. No extra unrelated information."
        )
        prompt = f'Term: "{term}"\n\n{instruction}'

        # 6. Generate content with automatic retry (4 attempts, 3s delay) and fallback chain
        result = call_gemini_with_retry(
            client=client,
            contents=[uploaded_file, prompt],
            primary_model="gemini-3.1-flash-lite",
            fallback_models=[
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.8-flash",
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

        explanation = result["text"].strip()
        is_not_found = "This term doesn't appear in your document." in explanation

        return jsonify({
            "success": True,
            "term": term,
            "explanation": explanation,
            "not_found": is_not_found,
            "filename": file.filename,
            "model_used": result.get("model_used"),
            "attempts": result.get("attempts")
        })

    except Exception as e:
        app.logger.error(f"Error in word_help: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        # Clean up temporary local file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        # Clean up Gemini uploaded file
        if client and uploaded_file:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass


@app.route('/quiz/generate', methods=['POST'])
def generate_quiz():
    """Generates customized multiple-choice questions (10, 20, 30, 40, 50) and difficulty (easy, medium, hard) from the uploaded PDF content only."""
    # 1. Validate file presence
    if 'pdf' not in request.files:
        return jsonify({"success": False, "error": "No PDF file uploaded for quiz."}), 400

    file = request.files['pdf']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"success": False, "error": "Only PDF files are supported."}), 400

    # 1b. Parse user decision parameters: number of questions & difficulty
    num_questions = request.form.get('num_questions', default=10, type=int)
    if num_questions not in [10, 20, 30, 40, 50]:
        num_questions = 10

    difficulty = str(request.form.get('difficulty', 'medium')).lower().strip()
    if difficulty not in ['easy', 'medium', 'hard']:
        difficulty = 'medium'

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

        # 5. Formulate prompt requesting customized MCQs from the PDF content only
        difficulty_instructions = {
            'easy': (
                "DIFFICULTY LEVEL: EASY\n"
                "- Focus on straightforward definitions, explicit factual statements, key vocabulary, and foundational concepts.\n"
                "- Distractors should be clear and distinct, without tricky double negatives or subtle ambiguity."
            ),
            'medium': (
                "DIFFICULTY LEVEL: MEDIUM\n"
                "- Focus on conceptual understanding, cause-and-effect relationships, and practical comprehension of the document.\n"
                "- Distractors should be plausible and test authentic comprehension rather than simple keyword matching."
            ),
            'hard': (
                "DIFFICULTY LEVEL: HARD\n"
                "- Focus on advanced analytical questions, methodology details, technical nuances, edge cases, and cross-section synthesis.\n"
                "- Distractors should be sophisticated, challenging misconceptions and testing thorough document mastery."
            )
        }

        diff_guide = difficulty_instructions.get(difficulty, difficulty_instructions['medium'])

        quiz_prompt = f"""
        You are an expert academic examiner and educator. Analyze the attached PDF document thoroughly.
        Generate exactly {num_questions} multiple-choice questions (MCQs) that evaluate comprehension of key concepts, factual findings, methods, and insights strictly found in this document.

        {diff_guide}

        STRICT REQUIREMENTS:
        1. Rely ONLY on the information presented in the provided PDF. Do not invent or assume external facts.
        2. Create exactly {num_questions} questions numbered 1 to {num_questions}.
        3. Each question must have exactly 4 plausible, distinct options.
        4. "correct_answer" MUST match one of the 4 options verbatim.
        5. "explanation" must clearly explain why the correct answer is right based directly on the document text.
        6. Mathematical notation: Write any mathematical formulas, expressions, variables, or equations strictly using standard LaTeX notation enclosed in dollar signs (e.g., $E = mc^2$, $\\sqrt{{x^2 + y^2}}$, $\\frac{{a}}{{b}}$, $\\theta$, $\\omega$) so they can be rendered properly with KaTeX. Keep LaTeX simple and standard.

        Return your output STRICTLY as a JSON array of {num_questions} question objects with this exact structure:
        [
          {{
            "id": 1,
            "question": "Question text here?",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "correct_answer": "Option B text",
            "explanation": "According to the document, ..."
          }}
        ]
        """

        # 6. Generate content with automatic retry (4 attempts, 3s delay) and updated fallback chain
        result = call_gemini_with_retry(
            client=client,
            contents=[uploaded_file, quiz_prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
            primary_model="gemini-3.1-flash-lite",
            fallback_models=[
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.8-flash",
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
            raise ValueError(f"Expected a list of {num_questions} questions from Gemini model.")

        return jsonify({
            "success": True,
            "filename": file.filename,
            "num_questions": len(questions),
            "requested_questions": num_questions,
            "difficulty": difficulty,
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
        difficulty = str(data.get("difficulty", "medium")).lower().strip()
        created_at = data.get("created_at") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Save to SQLite database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quiz_results (pdf_name, score, total, percentage, performance_message, difficulty, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (pdf_name, score, total, percentage, performance_message, difficulty, created_at)
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
            "difficulty": difficulty,
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


@app.route('/quiz/reset', methods=['POST'])
def reset_quiz_data():
    """Resets all quiz history and progress data so the user can start and record progress from scratch."""
    try:
        # 1. Clear SQLite table
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM quiz_results")
        try:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='quiz_results'")
        except Exception:
            pass
        conn.commit()
        conn.close()

        # 2. Reset JSON backup file to an empty list
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

        return jsonify({
            "success": True,
            "message": "All progress data and quiz history have been reset successfully."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/quiz/stats', methods=['GET'])
def get_quiz_stats():
    """Computes aggregated quiz stats, average score, accuracy, and level progression."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quiz_results ORDER BY id DESC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        total_quizzes = len(rows)
        if total_quizzes == 0:
            return jsonify({
                "success": True,
                "stats": {
                    "total_quizzes": 0,
                    "average_score": 0.0,
                    "best_score": "0%",
                    "best_score_val": 0,
                    "best_score_total": 0,
                    "best_score_pct": 0.0,
                    "total_questions": 0,
                    "total_correct": 0,
                    "overall_accuracy": 0.0,
                    "level": "Beginner",
                    "level_title": "Beginner",
                    "level_emoji": "🌱",
                    "tier_label": "Tier 1: Novice Explorer",
                    "level_desc": "Starting your knowledge journey and building foundation",
                    "next_level": "Learner",
                    "progress_to_next": 0.0,
                    "points_needed": 40.0
                }
            })

        total_questions = sum(int(r.get('total') or 10) for r in rows)
        total_correct = sum(int(r.get('score') or 0) for r in rows)
        overall_accuracy = round((total_correct / total_questions) * 100, 1) if total_questions > 0 else 0.0

        avg_pct = round(sum(float(r.get('percentage') or 0.0) for r in rows) / total_quizzes, 1)

        best_row = max(rows, key=lambda r: float(r.get('percentage') or 0.0))
        best_pct = round(float(best_row.get('percentage') or 0.0), 1)
        best_score_str = f"{best_pct}% ({best_row.get('score')}/{best_row.get('total')})"

        # Level determination based on average score:
        # Beginner (<40%), Learner (40-60%), Scholar (60-80%), Master (80%+)
        if avg_pct < 40.0:
            level = "Beginner"
            level_emoji = "🌱"
            tier_label = "Tier 1: Novice Explorer"
            level_desc = "Starting your knowledge journey and building foundation"
            next_level = "Learner"
            progress_to_next = round(min(100.0, max(0.0, (avg_pct / 40.0) * 100)), 1)
            points_needed = round(max(0.0, 40.0 - avg_pct), 1)
        elif avg_pct < 60.0:
            level = "Learner"
            level_emoji = "⚡"
            tier_label = "Tier 2: Knowledge Builder"
            level_desc = "Building core foundations and solid understanding"
            next_level = "Scholar"
            progress_to_next = round(min(100.0, max(0.0, ((avg_pct - 40.0) / 20.0) * 100)), 1)
            points_needed = round(max(0.0, 60.0 - avg_pct), 1)
        elif avg_pct < 80.0:
            level = "Scholar"
            level_emoji = "🔮"
            tier_label = "Tier 3: Academic Adept"
            level_desc = "Mastering complex concepts and deep technical comprehension"
            next_level = "Master"
            progress_to_next = round(min(100.0, max(0.0, ((avg_pct - 60.0) / 20.0) * 100)), 1)
            points_needed = round(max(0.0, 80.0 - avg_pct), 1)
        elif avg_pct < 100.0:
            level = "Master"
            level_emoji = "👑"
            tier_label = "Tier 4: Apex Grandmaster"
            level_desc = "Exceptional retention and complete document mastery"
            next_level = "Impossible"
            progress_to_next = round(min(100.0, max(0.0, ((avg_pct - 80.0) / 20.0) * 100)), 1)
            points_needed = round(max(0.0, 100.0 - avg_pct), 1)
        else:
            level = "Impossible"
            level_emoji = "♾️"
            tier_label = "Tier 5: Transcendent Godlike"
            level_desc = "Transcendental Perfection! Flawless 100% accuracy — truly impossible mastery achieved!"
            next_level = "Max Level"
            progress_to_next = 100.0
            points_needed = 0.0

        return jsonify({
            "success": True,
            "stats": {
                "total_quizzes": total_quizzes,
                "average_score": avg_pct,
                "best_score": best_score_str,
                "best_score_val": best_row.get('score'),
                "best_score_total": best_row.get('total'),
                "best_score_pct": best_pct,
                "total_questions": total_questions,
                "total_correct": total_correct,
                "overall_accuracy": overall_accuracy,
                "level": level,
                "level_title": level,
                "level_emoji": level_emoji,
                "tier_label": tier_label,
                "level_desc": level_desc,
                "next_level": next_level,
                "progress_to_next": progress_to_next,
                "points_needed": points_needed
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.errorhandler(413)
def file_too_large(e):
    return jsonify({"success": False, "error": "File size exceeds the 30MB limit."}), 413


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"[*] StudySnap is running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
