"""
Tests for /summarize route integration with retry and fallback logic in app.py
"""

import io
import json
import unittest
from unittest.mock import patch, MagicMock
from google.genai.errors import APIError
from app import app
from gemini_retry import FRIENDLY_BUSY_MESSAGE


class TestSummarizeRouteRetry(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.dummy_pdf = (io.BytesIO(b"%PDF-1.4 sample pdf content"), "sample.pdf")

    @patch("app.get_gemini_client")
    def test_summarize_success_after_transient_503(self, mock_get_gemini_client):
        """Tests that /summarize retries on 503 and returns 200 once successful."""
        mock_genai_client = MagicMock()
        mock_get_gemini_client.return_value = mock_genai_client

        # Mock files.upload
        mock_file = MagicMock()
        mock_file.name = "files/test123"
        mock_genai_client.files.upload.return_value = mock_file

        # Mock models.generate_content: fails with 503 on attempt 1, succeeds on attempt 2
        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "easy": "Easy summary test",
            "deep": "Deep summary test",
            "fun": "Fun summary test"
        })

        mock_genai_client.models.generate_content.side_effect = [
            err_503,
            mock_response
        ]

        # Use fast retry delay for test
        with patch("gemini_retry.time.sleep", return_value=None):
            response = self.client.post(
                "/summarize",
                data={"pdf": (io.BytesIO(b"%PDF-1.4 test"), "test.pdf")},
                content_type="multipart/form-data"
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["attempts"], 2)
        self.assertEqual(data["summaries"]["easy"], "Easy summary test")

    @patch("app.get_gemini_client")
    def test_summarize_falls_back_and_skips_404_model(self, mock_get_gemini_client):
        """Tests that /summarize skips 404 models and succeeds on the next available fallback model."""
        mock_genai_client = MagicMock()
        mock_get_gemini_client.return_value = mock_genai_client

        mock_file = MagicMock()
        mock_file.name = "files/test123"
        mock_genai_client.files.upload.return_value = mock_file

        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        err_404 = APIError(404, {"error": {"message": "models/gemini-3.8-flash-latest is not found", "code": 404, "status": "NOT_FOUND"}})
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "easy": "Fallback summary",
            "deep": "Fallback deep summary",
            "fun": "Fallback fun summary"
        })

        # 4 failures on gemini-3.8-flash, 1 failure on 404 model (skipped), success on gemini-flash-latest
        mock_genai_client.models.generate_content.side_effect = [
            err_503, err_503, err_503, err_503,
            err_404,
            mock_response
        ]

        with patch("gemini_retry.time.sleep", return_value=None):
            response = self.client.post(
                "/summarize",
                data={"pdf": (io.BytesIO(b"%PDF-1.4 test"), "test.pdf")},
                content_type="multipart/form-data"
            )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["model_used"], "gemini-flash-latest")
        self.assertEqual(data["summaries"]["easy"], "Fallback summary")

    @patch("app.get_gemini_client")
    def test_summarize_all_fail_returns_friendly_message(self, mock_get_gemini_client):
        """Tests that when all attempts on primary and backup fail, 503 + friendly message is returned."""
        mock_genai_client = MagicMock()
        mock_get_gemini_client.return_value = mock_genai_client

        mock_file = MagicMock()
        mock_file.name = "files/test123"
        mock_genai_client.files.upload.return_value = mock_file

        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        # All attempts on all models fail with 503
        mock_genai_client.models.generate_content.side_effect = err_503

        with patch("gemini_retry.time.sleep", return_value=None):
            response = self.client.post(
                "/summarize",
                data={"pdf": (io.BytesIO(b"%PDF-1.4 test"), "test.pdf")},
                content_type="multipart/form-data"
            )

        self.assertEqual(response.status_code, 503)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], FRIENDLY_BUSY_MESSAGE)


if __name__ == "__main__":
    unittest.main()
