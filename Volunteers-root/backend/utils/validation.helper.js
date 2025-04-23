const USERNAME_REGEX = /^[A-Za-z0-9._]{5,20}$/;            // 5‑20 allowed chars
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;        // simple RFC‑style check
const MAX_PASSWORD   = 100;
const MAX_EMAIL      = 320;

// Username: 5‑20 chars, letters, numbers, dot, underscore — NO whitespaces / “@”
function isValidUsername(username) {
    return typeof username === 'string' && USERNAME_REGEX.test(username);
}

// E‑mail: syntactically valid + ≤ 320 chars
function isValidEmail(email) {
    return (
        typeof email === 'string' &&
        email.length <= MAX_EMAIL &&
        EMAIL_REGEX.test(email)
    );
}

// Password: 1‑100 chars (adjust min/complexity as you like)
function isValidPassword(password) {
    return typeof password === 'string' && password.length > 0 && password.length <= MAX_PASSWORD;
}

module.exports = {
    isValidUsername,
    isValidEmail,
    isValidPassword,
    MAX_PASSWORD: MAX_PASSWORD,   // exported in case you log/notify limits
    MAX_EMAIL: MAX_EMAIL
};
