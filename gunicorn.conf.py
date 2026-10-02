import os

# Gunicorn configuration file for Render & production deployment
# Gunicorn automatically loads this configuration file on startup.

port = os.environ.get("PORT", "5000")
bind = f"0.0.0.0:{port}"
# Single worker: quiz history uses SQLite, which cannot stay consistent across
# multiple processes (each worker would lock/diverge on the same file).
workers = 1
timeout = 180  # 180 seconds (3 minutes) for PDF extraction and Gemini AI processing
keepalive = 5
graceful_timeout = 30
capture_output = True
enable_stdio_inheritance = True
