"""
Example Usage of Gemini Retry & Fallback Logic
==============================================
Demonstrates how to call Gemini with automatic retry and model fallback.
"""

import os
from google import genai
from gemini_retry import call_gemini_with_retry

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[!] Note: GEMINI_API_KEY environment variable not set.")
        print("    Set it via: $env:GEMINI_API_KEY=\"your_api_key\" (PowerShell) or export GEMINI_API_KEY=\"...\"")
        print("    Running mock demonstration instead...\n")
        return

    client = genai.Client(api_key=api_key)

    prompt = "Explain quantum computing in one short sentence."
    print(f"Prompt: {prompt}\n")

    # Call with automatic retry and fallback logic:
    # 1. Tries primary model 'gemini-3.1-flash-lite' (high Requests Per Day quota)
    # 2. Retries up to 4 attempts on 503 or transient errors with 3s sleep
    # 3. If any model returns 404 NOT_FOUND, automatically skips to next model
    # 4. Shows 'Gemini is busy right now, please try again in a minute.' if all fail
    result = call_gemini_with_retry(
        client=client,
        prompt=prompt,
        primary_model="gemini-3.1-flash-lite",
        fallback_models=[
            "gemini-3.5-flash-lite",
            "gemini-flash-latest",
            "gemini-3.8-flash",
        ],
        max_attempts=4,
        retry_delay_seconds=3.0,
    )

    if result["success"]:
        print("\n--- Response Success ---")
        print(f"Model used: {result['model_used']}")
        print(f"Total attempts: {result['attempts']}")
        print(f"Output: {result['text']}")
    else:
        print("\n--- Request Failed ---")
        print(f"Message to user: {result['text']}")

if __name__ == "__main__":
    main()
