"""
Unit tests for StudySnap Phase 4: Word Help (/word-help)
"""

import io
import json
import unittest
from unittest.mock import patch, MagicMock
from app import app


class TestWordHelpRoute(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    def test_word_help_missing_term(self):
        """Tests that /word-help returns 400 when term is omitted or whitespace."""
        response = self.client.post(
            "/word-help",
            data={
                "pdf": (io.BytesIO(b"%PDF-1.4 dummy"), "doc.pdf"),
                "term": "   "
            },
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("term", data["error"].lower())

    def test_word_help_missing_pdf(self):
        """Tests that /word-help returns 400 when PDF file is omitted."""
        response = self.client.post(
            "/word-help",
            data={
                "term": "Eigenvalue"
            },
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("please upload a pdf first", data["error"].lower())

    def test_word_help_invalid_file_type(self):
        """Tests that /word-help returns 400 when non-PDF is uploaded."""
        response = self.client.post(
            "/word-help",
            data={
                "pdf": (io.BytesIO(b"Plain text"), "notes.txt"),
                "term": "Mitochondria"
            },
            content_type="multipart/form-data"
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("only pdf", data["error"].lower())

    @patch("app.get_gemini_client")
    @patch("app.call_gemini_with_retry")
    @patch("app.retry_gemini_operation")
    def test_word_help_success(self, mock_retry_op, mock_call_gemini, mock_get_client):
        """Tests successful term explanation with LaTeX math and exact instruction."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_file = MagicMock()
        mock_file.name = "files/mock_wordhelp_pdf"
        mock_retry_op.return_value = mock_file

        expected_explanation = (
            "(1) A mathematical vector that only changes by a scalar factor $\\lambda$ when a linear transformation is applied: $A v = \\lambda v$.\n"
            "(2) In this chapter, eigenvalues determine the stability of differential equation systems.\n"
            "(3) Example: In principal component analysis (PCA), the largest eigenvalue identifies the axis of maximal variance."
        )

        mock_call_gemini.return_value = {
            "success": True,
            "text": expected_explanation,
            "model_used": "gemini-3.1-flash-lite",
            "attempts": 1,
            "error": None
        }

        response = self.client.post(
            "/word-help",
            data={
                "pdf": (io.BytesIO(b"%PDF-1.4 sample content"), "linear_algebra.pdf"),
                "term": "Eigenvalue"
            },
            content_type="multipart/form-data"
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["term"], "Eigenvalue")
        self.assertIn("lambda", data["explanation"])
        self.assertFalse(data["not_found"])

        # Verify exact instruction was passed in Gemini prompt
        call_args = mock_call_gemini.call_args[1]
        contents = call_args["contents"]
        prompt_text = contents[1]
        self.assertIn('Explain this term ONLY in the context of the uploaded PDF.', prompt_text)
        self.assertIn('(1) simple meaning in 1-2 lines, (2) why it matters in this chapter, (3) one example.', prompt_text)
        self.assertIn('If the term is not related to the PDF, say exactly: "This term doesn\'t appear in your document."', prompt_text)
        self.assertIn('Keep any math in LaTeX notation. No extra unrelated information.', prompt_text)

    @patch("app.get_gemini_client")
    @patch("app.call_gemini_with_retry")
    @patch("app.retry_gemini_operation")
    def test_word_help_term_not_found(self, mock_retry_op, mock_call_gemini, mock_get_client):
        """Tests that when term is unrelated, 'This term doesn't appear in your document.' is flagged."""
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_file = MagicMock()
        mock_file.name = "files/mock_wordhelp_pdf"
        mock_retry_op.return_value = mock_file

        mock_call_gemini.return_value = {
            "success": True,
            "text": "This term doesn't appear in your document.",
            "model_used": "gemini-3.1-flash-lite",
            "attempts": 1,
            "error": None
        }

        response = self.client.post(
            "/word-help",
            data={
                "pdf": (io.BytesIO(b"%PDF-1.4 sample content"), "physics.pdf"),
                "term": "Photosynthesis"
            },
            content_type="multipart/form-data"
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["not_found"])
        self.assertEqual(data["explanation"], "This term doesn't appear in your document.")


if __name__ == "__main__":
    unittest.main()
