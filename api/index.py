import sys
import os

# Add project root directory to sys.path so app and its modules are importable
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app import app


class VercelPathMiddleware:
    """
    Middleware to resolve Vercel Serverless Function routing rewrites.
    Restores the original request URL from Vercel headers (HTTP_X_MATCHED_PATH)
    or cleans /api/index.py prefixes so Flask routes match correctly.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        matched = environ.get('HTTP_X_MATCHED_PATH') or environ.get('HTTP_X_FORWARDED_PATH')
        raw_path = environ.get('PATH_INFO', '')

        if matched and matched not in ('/api/index.py', '/api/index', '/api'):
            environ['PATH_INFO'] = matched
        elif raw_path in ('/api/index.py', '/api/index', '/api', '/api/'):
            environ['PATH_INFO'] = '/'
        elif raw_path.startswith('/api/index.py/'):
            environ['PATH_INFO'] = raw_path[len('/api/index.py'):]
        elif raw_path.startswith('/api/index/'):
            environ['PATH_INFO'] = raw_path[len('/api/index'):]

        return self.wsgi_app(environ, start_response)


app.wsgi_app = VercelPathMiddleware(app.wsgi_app)
