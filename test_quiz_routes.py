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

        # Verify LaTeX instruction is present in the Gemini prompt
        prompt_content = kwargs["contents"][1]
        self.assertIn("LaTeX", prompt_content)

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

    def test_quiz_stats_endpoint(self):
        """Tests /quiz/stats returns aggregated metrics and level progression."""
        response = self.client.get("/quiz/stats")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("stats", data)
        stats = data["stats"]
        self.assertIn("total_quizzes", stats)
        self.assertIn("average_score", stats)
        self.assertIn("best_score", stats)
        self.assertIn("total_questions", stats)
        self.assertIn("overall_accuracy", stats)
        self.assertIn("level", stats)
        self.assertIn(stats["level"], ["Beginner", "Learner", "Scholar", "Master", "Impossible"])
        self.assertIn("progress_to_next", stats)
        self.assertGreaterEqual(stats["total_quizzes"], 1)

    def test_impossible_tier_at_100_percent(self):
        """Tests that reaching 100% average score unlocks Tier 5: Impossible."""
        # Reset data first for clean calculation
        self.client.post("/quiz/reset")
        payload = {
            "pdf_name": "perfect_score_doc.pdf",
            "score": 10,
            "total": 10,
            "percentage": 100.0,
            "performance_message": "Flawless!",
            "difficulty": "hard",
            "created_at": "2026-09-27 12:00:00"
        }
        save_res = self.client.post("/quiz/save", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(save_res.status_code, 200)

        # Query stats
        stats_res = self.client.get("/quiz/stats")
        self.assertEqual(stats_res.status_code, 200)
        data = stats_res.get_json()
        stats = data["stats"]
        self.assertEqual(stats["average_score"], 100.0)
        self.assertEqual(stats["level"], "Impossible")
        self.assertEqual(stats["level_emoji"], "♾️")
        self.assertEqual(stats["tier_label"], "Tier 5: Transcendent Godlike")
        self.assertEqual(stats["next_level"], "Max Level")
        self.assertEqual(stats["progress_to_next"], 100.0)
        self.assertEqual(stats["points_needed"], 0.0)

    def test_quiz_reset_endpoint(self):
        """Tests that POST /quiz/reset wipes all data, resetting stats and history to starting baseline."""
        # 1. First ensure at least one quiz record is saved
        payload = {
            "pdf_name": "reset_test_doc.pdf",
            "score": 9,
            "total": 10,
            "percentage": 90.0,
            "performance_message": "Grandmaster!",
            "difficulty": "medium",
            "created_at": "2026-09-27 12:00:00"
        }
        save_res = self.client.post("/quiz/save", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(save_res.status_code, 200)

        # Confirm data exists
        history_before = self.client.get("/quiz/history").get_json()
        self.assertGreaterEqual(len(history_before["history"]), 1)

        # 2. Call /quiz/reset
        reset_res = self.client.post("/quiz/reset")
        self.assertEqual(reset_res.status_code, 200)
        reset_data = reset_res.get_json()
        self.assertTrue(reset_data["success"])
        self.assertIn("reset", reset_data["message"].lower())

        # 3. Verify history is empty
        history_after = self.client.get("/quiz/history").get_json()
        self.assertTrue(history_after["success"])
        self.assertEqual(len(history_after["history"]), 0)

        # 4. Verify stats return to initial Beginner state
        stats_after = self.client.get("/quiz/stats").get_json()
        self.assertTrue(stats_after["success"])
        stats = stats_after["stats"]
        self.assertEqual(stats["total_quizzes"], 0)
        self.assertEqual(stats["average_score"], 0.0)
        self.assertEqual(stats["best_score"], "0%")
        self.assertEqual(stats["total_questions"], 0)
        self.assertEqual(stats["overall_accuracy"], 0.0)
        self.assertEqual(stats["level"], "Beginner")
        self.assertEqual(stats["progress_to_next"], 0.0)


if __name__ == "__main__":
    unittest.main()
