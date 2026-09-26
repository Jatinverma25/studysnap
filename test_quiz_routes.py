"""
Tests for StudySnap Quiz Mode routes (/quiz/generate, /quiz/save, /quiz/history)
"""

import io
import json
import unittest
from unittest.mock import patch, MagicMock
from app import app, DB_PATH, JSON_PATH


class TestQuizRoutes(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    @patch("app.get_gemini_client")
    @patch("app.call_gemini_with_retry")
    @patch("app.retry_gemini_operation")
    def test_quiz_generate_success(self, mock_retry_op, mock_call_gemini, mock_get_client):
        """Tests that /quiz/generate calls Gemini with custom question count and difficulty."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_file = MagicMock()
        mock_file.name = "files/mock_quiz_pdf"
        mock_retry_op.return_value = mock_file

        sample_questions = [
            {
                "id": i + 1,
                "question": f"Question {i + 1} text?",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "B",
                "explanation": f"Explanation for Q{i + 1}"
            }
            for i in range(20)
        ]

        mock_call_gemini.return_value = {
            "success": True,
            "text": json.dumps(sample_questions),
            "model_used": "gemini-3.1-flash-lite",
            "attempts": 1,
            "error": None
        }

        response = self.client.post(
            "/quiz/generate",
            data={
                "pdf": (io.BytesIO(b"%PDF-1.4 sample content"), "test_study.pdf"),
                "num_questions": "20",
                "difficulty": "hard"
            },
            content_type="multipart/form-data"
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["filename"], "test_study.pdf")
        self.assertEqual(data["requested_questions"], 20)
        self.assertEqual(data["difficulty"], "hard")
        self.assertEqual(len(data["questions"]), 20)
        self.assertEqual(data["questions"][0]["question"], "Question 1 text?")
        self.assertEqual(data["questions"][0]["correct_answer"], "B")

        # Verify call_gemini_with_retry was used with the fallback chain
        mock_call_gemini.assert_called_once()
        kwargs = mock_call_gemini.call_args.kwargs
        self.assertEqual(kwargs["primary_model"], "gemini-3.1-flash-lite")
        self.assertIn("gemini-3.5-flash-lite", kwargs["fallback_models"])

    def test_quiz_save_and_history(self):
        """Tests saving a quiz result with difficulty to SQLite / JSON and retrieving it via /quiz/history."""
        payload = {
            "pdf_name": "quantum_physics.pdf",
            "score": 18,
            "total": 20,
            "percentage": 90.0,
            "performance_message": "Outstanding Scholar! - Phenomenal work!",
            "difficulty": "hard",
            "created_at": "2026-09-26 20:00:00"
        }

        save_response = self.client.post(
            "/quiz/save",
            data=json.dumps(payload),
            content_type="application/json"
        )

        self.assertEqual(save_response.status_code, 200)
        save_data = save_response.get_json()
        self.assertTrue(save_data["success"])
        self.assertIn("id", save_data)

        # Retrieve history
        history_response = self.client.get("/quiz/history")
        self.assertEqual(history_response.status_code, 200)
        history_data = history_response.get_json()
        self.assertTrue(history_data["success"])
        self.assertGreaterEqual(len(history_data["history"]), 1)

        latest = history_data["history"][0]
        self.assertEqual(latest["pdf_name"], "quantum_physics.pdf")
        self.assertEqual(latest["score"], 18)
        self.assertEqual(latest["total"], 20)
        self.assertEqual(latest["difficulty"], "hard")


if __name__ == "__main__":
    unittest.main()
