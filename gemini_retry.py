"""
Gemini API Retry & Fallback Module
==================================
Handles automatic retry logic for 503 and transient/temporary errors:
- Waits 3 seconds between retries
- Retries up to 4 attempts per model on 503 / temporary errors
- If any model returns 404 NOT_FOUND, automatically skips to the next fallback model
- Fallback chain:
    1. Primary: 'gemini-3.8-flash'
    2. Fallback: 'gemini-3.8-flash-latest' (skips automatically on 404)
    3. Fallback: 'gemini-flash-latest' (official latest flash endpoint)
    4. Fallback: 'gemini-3-pro' (skips automatically on 404 / free tier restriction)
    5. Fallback: 'gemini-3.5-flash-lite' (cost-effective verified free tier backup)
- Displays friendly message if all attempts fail:
  "Gemini is busy right now, please try again in a minute."
"""

import time
import logging
from typing import Any, Optional, Dict, List, Union, Callable
import httpx
from google import genai
from google.genai.errors import APIError, ServerError

logger = logging.getLogger(__name__)

# Error codes considered transient / temporary
TRANSIENT_STATUS_CODES = {
    429,  # Too Many Requests / Resource Exhausted
    500,  # Internal Server Error
    502,  # Bad Gateway
    503,  # Service Unavailable
    504,  # Gateway Timeout
}

FRIENDLY_BUSY_MESSAGE = "Gemini is busy right now, please try again in a minute."

DEFAULT_PRIMARY_MODEL = "gemini-3.8-flash"
DEFAULT_FALLBACK_MODELS = [
    "gemini-3.8-flash-latest",
    "gemini-flash-latest",
    "gemini-3-pro",
    "gemini-3.5-flash-lite",
]


def is_not_found_error(exception: Exception) -> bool:
    """Determine whether an exception indicates 404 NOT_FOUND."""
    if isinstance(exception, APIError):
        if getattr(exception, "code", None) == 404:
            return True

    status_code = getattr(exception, "status_code", None) or getattr(exception, "code", None)
    if status_code == 404:
        return True

    err_str = str(exception).upper()
    if "404" in err_str and ("NOT_FOUND" in err_str or "NOT FOUND" in err_str):
        return True

    return False


def is_temporary_error(exception: Exception) -> bool:
    """Determine whether an exception represents a 503 or temporary/transient error."""
    # Check Google GenAI API errors
    if isinstance(exception, APIError):
        code = getattr(exception, "code", None)
        if code in TRANSIENT_STATUS_CODES:
            return True

    if isinstance(exception, ServerError):
        return True

    # Check HTTP status code if present on exception
    status_code = getattr(exception, "status_code", None) or getattr(exception, "code", None)
    if status_code in TRANSIENT_STATUS_CODES:
        return True

    # Check network/transport level exceptions
    transient_network_types = (
        TimeoutError,
        ConnectionError,
        httpx.TimeoutException,
        httpx.NetworkError,
        httpx.TransportError,
    )
    if isinstance(exception, transient_network_types):
        return True

    # Check error message strings for keywords
    err_str = str(exception).upper()
    keywords = ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "TIMEOUT", "TEMPORARILY UNAVAILABLE"]
    if any(kw in err_str for kw in keywords):
        return True

    return False


def retry_gemini_operation(
    operation: Callable[[], Any],
    max_attempts: int = 4,
    retry_delay_seconds: float = 3.0,
    operation_name: str = "Gemini operation",
) -> Any:
    """
    Executes an arbitrary Gemini SDK operation with automatic retry logic for 503 and temporary errors.
    Waits 3 seconds between retries, up to 4 attempts.
    """
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"[{operation_name}] Attempt {attempt}/{max_attempts}...")
            return operation()
        except Exception as e:
            last_error = e
            if not is_temporary_error(e):
                print(f"[{operation_name}] Permanent error encountered: {e}. Aborting retries.")
                raise e

            print(f"[{operation_name}] Temporary error (e.g. 503): {e}")
            if attempt < max_attempts:
                print(f"Waiting {retry_delay_seconds} seconds before retrying...")
                time.sleep(retry_delay_seconds)
            else:
                print(f"[{operation_name}] All {max_attempts} attempts failed.")

    raise last_error


def call_gemini_with_retry(
    client: genai.Client,
    prompt: Optional[str] = None,
    contents: Optional[Any] = None,
    config: Optional[Any] = None,
    primary_model: str = DEFAULT_PRIMARY_MODEL,
    fallback_models: Optional[Union[str, List[str]]] = None,
    fallback_model: Optional[str] = None,
    max_attempts: int = 4,
    retry_delay_seconds: float = 3.0,
    api_method: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes a Gemini API request with automatic retry logic and model fallback.

    - Retries on 503 or any temporary error with a 3-second wait, up to 4 attempts.
    - If a model returns 404 NOT_FOUND, immediately skips it and moves to the next fallback model.
    - If all fail, displays and returns: 'Gemini is busy right now, please try again in a minute.'

    Args:
        client: The google.genai.Client instance.
        prompt: Optional text prompt/input to send.
        contents: Optional multimodal contents or prompt list.
        config: Optional generation configuration.
        primary_model: Primary Gemini model (default: 'gemini-3.8-flash').
        fallback_models: Fallback model string or list of models.
        fallback_model: Backwards-compatible single fallback model string.
        max_attempts: Number of attempts per model on temporary errors (default: 4).
        retry_delay_seconds: Seconds to wait before each retry (default: 3).
        api_method: 'interactions' or 'generate_content'. Inferred if None.

    Returns:
        dict with keys: 'success', 'text', 'response', 'model_used', 'attempts', 'error'
    """
    # Determine the payload to send
    payload = contents if contents is not None else prompt

    # Infer api_method if not explicitly provided
    if api_method is None:
        if config is not None or contents is not None:
            api_method = "generate_content"
        else:
            api_method = "interactions"

    # Build model candidate chain
    models_to_try = [primary_model]

    candidates: List[str] = []
    if fallback_models is not None:
        if isinstance(fallback_models, str):
            candidates = [fallback_models]
        else:
            candidates = list(fallback_models)
    elif fallback_model is not None:
        candidates = [fallback_model]
    else:
        candidates = list(DEFAULT_FALLBACK_MODELS)

    for m in candidates:
        if m and m not in models_to_try:
            models_to_try.append(m)

    last_error: Optional[Exception] = None
    total_attempts = 0

    for model_index, current_model in enumerate(models_to_try):
        is_fallback = model_index > 0
        if is_fallback:
            print(f"[Fallback] Switching to backup model '{current_model}'...")

        for attempt in range(1, max_attempts + 1):
            total_attempts += 1
            print(f"[{current_model}] Attempt {attempt}/{max_attempts}...")

            try:
                if api_method == "interactions":
                    # Uses the modern Interactions API
                    response = client.interactions.create(
                        model=current_model,
                        input=payload,
                    )
                    output_text = getattr(response, "output_text", None) or str(response)
                    return {
                        "success": True,
                        "text": output_text,
                        "response": response,
                        "model_used": current_model,
                        "attempts": total_attempts,
                        "error": None,
                    }
                else:
                    # Uses models.generate_content API
                    kwargs = {
                        "model": current_model,
                        "contents": payload,
                    }
                    if config is not None:
                        kwargs["config"] = config

                    response = client.models.generate_content(**kwargs)
                    output_text = getattr(response, "text", None) or str(response)
                    return {
                        "success": True,
                        "text": output_text,
                        "response": response,
                        "model_used": current_model,
                        "attempts": total_attempts,
                        "error": None,
                    }

            except Exception as e:
                last_error = e

                # Check if model returned 404 NOT_FOUND (retired, invalid, or unavailable endpoint)
                if is_not_found_error(e):
                    print(f"[{current_model}] Model returned 404 NOT_FOUND. Automatically skipping to next model in fallback chain...")
                    break  # Immediately advance to next model in chain without retrying!

                # Check if error is due to a Pro model lacking free tier access
                err_msg = str(e).lower()
                if ("quota" in err_msg or "billing" in err_msg) and "pro" in current_model.lower():
                    print(f"[{current_model}] Model is not available for free tier. Skipping to next model in fallback chain...")
                    break

                # Check if it's a 503 or temporary error
                if not is_temporary_error(e):
                    # Permanent/non-transient error (e.g. 400 invalid argument, 401 auth error)
                    print(f"[{current_model}] Permanent error encountered: {e}. Aborting retries.")
                    raise e

                print(f"[{current_model}] Temporary error (e.g. 503): {e}")

                # Wait before next attempt if attempts remain for this model
                if attempt < max_attempts:
                    print(f"Waiting {retry_delay_seconds} seconds before retrying...")
                    time.sleep(retry_delay_seconds)
                else:
                    print(f"[{current_model}] All {max_attempts} attempts failed.")

    # If all models and all attempts fail, show friendly message to the user
    print(f"\nUser Notice: {FRIENDLY_BUSY_MESSAGE}")
    return {
        "success": False,
        "text": FRIENDLY_BUSY_MESSAGE,
        "response": None,
        "model_used": None,
        "attempts": total_attempts,
        "error": last_error,
    }
