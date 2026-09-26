"""
Unit / Simulation Tests for Gemini Retry and Fallback Logic
"""

import unittest
from unittest.mock import MagicMock
from google.genai.errors import APIError, ServerError, ClientError
from gemini_retry import (
    call_gemini_with_retry,
    is_temporary_error,
    is_not_found_error,
    FRIENDLY_BUSY_MESSAGE,
    TRANSIENT_STATUS_CODES,
)


class TestGeminiRetry(unittest.TestCase):

    def test_temporary_error_detection(self):
        # 503 API error
        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        self.assertTrue(is_temporary_error(err_503))

        # 429 Rate limit error
        err_429 = APIError(429, {"error": {"message": "Resource Exhausted", "code": 429}})
        self.assertTrue(is_temporary_error(err_429))

        # 500 Server error
        err_500 = ServerError(500, {"error": {"message": "Internal Server Error"}})
        self.assertTrue(is_temporary_error(err_500))

        # 400 Bad request (not temporary)
        err_400 = APIError(400, {"error": {"message": "Bad Request", "code": 400}})
        self.assertFalse(is_temporary_error(err_400))

    def test_404_not_found_error_detection(self):
        err_404 = ClientError(404, {"error": {"message": "models/gemini-old is not found", "code": 404, "status": "NOT_FOUND"}})
        self.assertTrue(is_not_found_error(err_404))

        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        self.assertFalse(is_not_found_error(err_503))

    def test_retry_on_503_and_success_before_exhaustion(self):
        """Simulates 503 on attempt 1 & 2, then success on attempt 3."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.output_text = "Successful answer on attempt 3"

        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})

        mock_client.interactions.create.side_effect = [
            err_503,
            err_503,
            mock_response,
        ]

        result = call_gemini_with_retry(
            client=mock_client,
            prompt="Hello",
            primary_model="gemini-3.8-flash",
            fallback_models=["gemini-flash-latest"],
            max_attempts=4,
            retry_delay_seconds=0.01,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["text"], "Successful answer on attempt 3")
        self.assertEqual(result["model_used"], "gemini-3.8-flash")
        self.assertEqual(result["attempts"], 3)
        self.assertEqual(mock_client.interactions.create.call_count, 3)

    def test_404_not_found_skips_immediately_to_next_model(self):
        """Simulates 404 NOT_FOUND on a model: skips immediately without retrying and calls next model."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.output_text = "Response from backup model"

        err_404 = ClientError(404, {"error": {"message": "models/gemini-3.8-flash-latest is not found", "code": 404, "status": "NOT_FOUND"}})

        # primary fails with 404, backup succeeds immediately
        mock_client.interactions.create.side_effect = [
            err_404,        # gemini-3.8-flash-latest returns 404 -> immediately skipped!
            mock_response,  # gemini-3.5-flash-lite succeeds
        ]

        result = call_gemini_with_retry(
            client=mock_client,
            prompt="Hello",
            primary_model="gemini-3.8-flash-latest",
            fallback_models=["gemini-3.5-flash-lite"],
            max_attempts=4,
            retry_delay_seconds=0.01,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["text"], "Response from backup model")
        self.assertEqual(result["model_used"], "gemini-3.5-flash-lite")
        # Notice: only 2 calls total! 1 call for gemini-3.8-flash-latest (skipped immediately on 404) + 1 call for backup
        self.assertEqual(mock_client.interactions.create.call_count, 2)

    def test_fallback_chain_through_multiple_models(self):
        """Simulates primary failing 4 times with 503, fallback 1 failing with 404, fallback 2 succeeding."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.output_text = "Response from working fallback"

        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})
        err_404 = ClientError(404, {"error": {"message": "models/gemini-3-pro is not found", "code": 404, "status": "NOT_FOUND"}})

        # 4 x 503 on gemini-3.8-flash
        # 1 x 404 on gemini-3-pro (skipped immediately)
        # success on gemini-3.5-flash-lite
        mock_client.interactions.create.side_effect = [
            err_503, err_503, err_503, err_503,
            err_404,
            mock_response,
        ]

        result = call_gemini_with_retry(
            client=mock_client,
            prompt="Hello",
            primary_model="gemini-3.8-flash",
            fallback_models=["gemini-3-pro", "gemini-3.5-flash-lite"],
            max_attempts=4,
            retry_delay_seconds=0.01,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["text"], "Response from working fallback")
        self.assertEqual(result["model_used"], "gemini-3.5-flash-lite")
        self.assertEqual(mock_client.interactions.create.call_count, 6)

    def test_all_attempts_fail_shows_friendly_message(self):
        """Simulates all models failing -> friendly message."""
        mock_client = MagicMock()
        err_503 = APIError(503, {"error": {"message": "Service Unavailable", "code": 503}})

        mock_client.interactions.create.side_effect = [err_503] * 8

        result = call_gemini_with_retry(
            client=mock_client,
            prompt="Hello",
            primary_model="gemini-3.8-flash",
            fallback_models=["gemini-3.5-flash-lite"],
            max_attempts=4,
            retry_delay_seconds=0.01,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["text"], FRIENDLY_BUSY_MESSAGE)
        self.assertIsNone(result["model_used"])
        self.assertEqual(result["attempts"], 8)
        self.assertEqual(mock_client.interactions.create.call_count, 8)

    def test_non_temporary_error_raises_immediately(self):
        """Non-temporary errors like 400 Bad Request should not be retried."""
        mock_client = MagicMock()
        err_400 = APIError(400, {"error": {"message": "Invalid argument", "code": 400}})
        mock_client.interactions.create.side_effect = err_400

        with self.assertRaises(APIError):
            call_gemini_with_retry(
                client=mock_client,
                prompt="Hello",
                max_attempts=4,
                retry_delay_seconds=0.01,
            )

        # Should fail on attempt 1 without retrying
        self.assertEqual(mock_client.interactions.create.call_count, 1)


if __name__ == "__main__":
    unittest.main()
