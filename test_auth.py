"""
Tests for StudySnap accounts & authentication (/signup, /login, /logout, /me)
plus per-user isolation of quiz history.
"""

import json
import os
import tempfile
import unittest
import app as app_module
from app import app, init_db


class TestAuthRoutes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Remember production paths so tests never touch real user data.
        cls._real_db_path = app_module.DB_PATH
        cls._real_json_path = app_module.JSON_PATH

    @classmethod
    def tearDownClass(cls):
        app_module.DB_PATH = cls._real_db_path
        app_module.JSON_PATH = cls._real_json_path
        init_db()

    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()
        # Isolate every test in its own temp database.
        self._tmpdir = tempfile.TemporaryDirectory()
        app_module.DB_PATH = os.path.join(self._tmpdir.name, 'quiz_history.db')
        app_module.JSON_PATH = os.path.join(self._tmpdir.name, 'quiz_history.json')
        init_db()

    def tearDown(self):
        self._tmpdir.cleanup()

    # --- helpers ---------------------------------------------------------
    def signup(self, email, password, name=None, client=None):
        payload = {"email": email, "password": password}
        if name is not None:
            payload["display_name"] = name
        return (client or self.client).post('/signup', json=payload)

    def login(self, email, password, client=None):
        return (client or self.client).post('/login', json={"email": email, "password": password})

    def save_quiz(self, pdf_name, score, total, client=None):
        return (client or self.client).post('/quiz/save', json={
            "pdf_name": pdf_name, "score": score, "total": total
        })

    # --- /me ---------------------------------------------------------------
    def test_me_unauthenticated(self):
        res = self.client.get('/me')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.get_json()['authenticated'])

    # --- /signup -----------------------------------------------------------
    def test_signup_success_and_session(self):
        res = self.signup("alice@example.com", "hunter22", "Alice")
        self.assertEqual(res.status_code, 200)
        body = res.get_json()
        self.assertTrue(body['success'])
        self.assertEqual(body['user']['email'], "alice@example.com")
        self.assertEqual(body['user']['display_name'], "Alice")
        # The session cookie must be set: /me reports authenticated.
        me = self.client.get('/me')
        self.assertTrue(me.get_json()['authenticated'])
        self.assertEqual(me.get_json()['user']['email'], "alice@example.com")

    def test_signup_invalid_email_rejected(self):
        for bad in ["not-an-email", "a@b", "@x.com", ""]:
            res = self.signup(bad, "hunter22")
            self.assertEqual(res.status_code, 400, f"{bad} should be rejected")

    def test_signup_short_password_rejected(self):
        res = self.signup("bob@example.com", "12345")
        self.assertEqual(res.status_code, 400)

    def test_signup_duplicate_email_rejected(self):
        self.signup("carol@example.com", "hunter22")
        res = self.signup("carol@example.com", "different-password")
        self.assertEqual(res.status_code, 409)

    def test_signup_normalizes_email_case(self):
        """EMAIL case must not create a duplicate account."""
        self.signup("Dave@Example.com", "hunter22")
        res = self.signup("dave@example.com", "hunter22")
        self.assertEqual(res.status_code, 409)

    def test_password_is_hashed_not_plaintext(self):
        self.signup("erin@example.com", "plaintext-secret")
        import sqlite3
        conn = sqlite3.connect(app_module.DB_PATH)
        try:
            row = conn.execute(
                "SELECT password_hash FROM users WHERE email = ?", ("erin@example.com",)
            ).fetchone()
            self.assertIsNotNone(row)
            self.assertNotIn("plaintext-secret", row[0])
            self.assertTrue(row[0].startswith(("pbkdf2:", "scrypt:", "argon2:")))
        finally:
            conn.close()

    # --- /login ------------------------------------------------------------
    def test_login_success(self):
        self.signup("frank@example.com", "correct-horse")
        res = self.login("frank@example.com", "correct-horse")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['success'])

    def test_login_wrong_password(self):
        self.signup("grace@example.com", "correct-horse")
        res = self.login("grace@example.com", "wrong-horse")
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.get_json()['error'], "Incorrect email or password.")

    def test_login_unknown_email_same_message(self):
        """Unknown and wrong-password must return the identical message so
        emails cannot be enumerated."""
        res = self.login("nobody@example.com", "anything")
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.get_json()['error'], "Incorrect email or password.")

    def test_login_bad_payload(self):
        res = self.client.post('/login', data="nope", content_type='text/plain')
        self.assertEqual(res.status_code, 400)

    # --- /logout -----------------------------------------------------------
    def test_logout_clears_session(self):
        self.signup("heidi@example.com", "hunter22")
        self.assertTrue(self.client.get('/me').get_json()['authenticated'])
        res = self.client.post('/logout')
        self.assertEqual(res.status_code, 200)
        self.assertFalse(self.client.get('/me').get_json()['authenticated'])

    # --- per-user history isolation ----------------------------------------
    def _signup_fresh_client(self, email, password):
        client = app.test_client()
        res = client.post('/signup', json={"email": email, "password": password})
        self.assertEqual(res.status_code, 200)
        return client

    def test_users_only_see_own_history(self):
        alice = self._signup_fresh_client("alice2@example.com", "hunter22")
        bob = self._signup_fresh_client("bob2@example.com", "hunter22")
        self.assertEqual(self.save_quiz("alice.pdf", 9, 10, alice).status_code, 200)
        self.assertEqual(self.save_quiz("bob.pdf", 4, 10, bob).status_code, 200)

        alice_history = alice.get('/quiz/history').get_json()['history']
        bob_history = bob.get('/quiz/history').get_json()['history']

        self.assertEqual(len(alice_history), 1)
        self.assertEqual(alice_history[0]['pdf_name'], "alice.pdf")
        self.assertEqual(len(bob_history), 1)
        self.assertEqual(bob_history[0]['pdf_name'], "bob.pdf")

    def test_guest_does_not_see_user_history(self):
        """A user's saved results must never leak into the anonymous bucket."""
        client = self._signup_fresh_client("ivan@example.com", "hunter22")
        self.save_quiz("ivan.pdf", 7, 10, client)

        anon_history = self.client.get('/quiz/history').get_json()['history']
        pdfs = [row['pdf_name'] for row in anon_history]
        self.assertNotIn("ivan.pdf", pdfs)

    def test_guest_saves_land_in_guest_bucket(self):
        self.assertEqual(self.save_quiz("guest.pdf", 5, 10).status_code, 200)
        anon_history = self.client.get('/quiz/history').get_json()['history']
        self.assertEqual(len(anon_history), 1)
        self.assertEqual(anon_history[0]['pdf_name'], "guest.pdf")

    def test_stats_scoped_to_user(self):
        client = self._signup_fresh_client("judy@example.com", "hunter22")
        self.save_quiz("judy.pdf", 10, 10, client)
        # Anonymous save that must stay out of Judy's stats.
        self.save_quiz("stranger.pdf", 0, 10)

        stats = client.get('/quiz/stats').get_json()
        self.assertEqual(stats['stats']['total_quizzes'], 1)
        self.assertEqual(stats['history'][0]['pdf_name'], "judy.pdf")
        self.assertEqual(stats['stats']['average_score'], 100.0)

    def test_reset_only_deletes_own_history(self):
        alice = self._signup_fresh_client("kim@example.com", "hunter22")
        bob = self._signup_fresh_client("leo@example.com", "hunter22")
        self.save_quiz("kim.pdf", 5, 10, alice)
        self.save_quiz("leo.pdf", 6, 10, bob)

        res = alice.post('/quiz/reset')
        self.assertEqual(res.status_code, 200)

        self.assertEqual(len(alice.get('/quiz/history').get_json()['history']), 0)
        self.assertEqual(len(bob.get('/quiz/history').get_json()['history']), 1)

    # --- page rendering -----------------------------------------------------
    def test_index_shows_login_for_guest_hides_for_user(self):
        guest_html = self.client.get('/').get_data(as_text=True)
        self.assertIn('id="loginSection"', guest_html)
        self.assertIn('class="login-section"', guest_html)
        self.assertNotIn('class="login-section hidden"', guest_html)

        client = self._signup_fresh_client("mallory@example.com", "hunter22")
        user_html = client.get('/').get_data(as_text=True)
        self.assertIn('class="login-section hidden"', user_html)
        self.assertIn('id="userMenuWrapper"', user_html)
        # Header chip should carry the user's initial.
        self.assertIn('M', user_html)


if __name__ == '__main__':
    unittest.main()
