const { validateOTP } = require('../services/otp.service');
const { createUser, userExistsByEmail, userExistsByUsername } = require('../services/user.service');
const bcrypt = require('bcrypt');
const { getOTPByEmail } = require('../services/otp.service'); // add this

async function verifyEmail(req, res, next) {
    const { email, code } = req.body;
    try {
        const result = await validateOTP(email, code);
        if (!result.valid) return res.status(400).json({ message: result.reason });

        res.status(200).json({ message: 'Email verified' }); // frontend can now show full form
    } catch (err) {
        next(err);
    }
}

async function checkUsername(req, res, next)  {
    const { username } = req.body;
    try {
        const exists = await userExistsByUsername(username);
        if (exists) return res.status(400).json({ message: 'Username taken' });
        return res.status(200).json({ message: 'Username available' });
    } catch (err) {
        next(err);
    }
}
async function register(req, res, next) {

    const { firstName, lastName, username, email, password, phone } = req.body;
    const roleId = 2; // USERROLE

    try {
        const otp = await getOTPByEmail(email);
        if (!otp || !otp.status) {
            return res.status(400).json({ message: 'Email not verified' });
        }

        const emailExists = await userExistsByEmail(email);
        if (emailExists) return res.status(400).json({ message: 'Email already registered' });

        const passhash = await bcrypt.hash(password, 10);
        const created_at = new Date();

        await db.query(
            `INSERT INTO users (first_name, last_name, username, passhash, email, phone, role_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [firstName, lastName, username, passhash, email, phone || null, roleId, created_at]
        );

        return res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
}

async function signin(req,res,next) {
    const {email, username, password} = req.body;

    try {
        const query = email
            ? 'SELECT * FROM users WHERE email = $1'
            : 'SELECT * FROM users WHERE username = $1';
        const value = email || username;

        const result = await db.query(query, [value]);
        if (result.rows.length === 0) {
            return res.status(400).json({message: 'User not found'});
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.passhash);
        if (!match) return res.status(400).json({message: 'Incorrect password'});

        req.session.user = {
            id: user.id,
            username: user.username,
            role_id: user.role_id,
        };

        return res.status(200).json({message: 'Login successful'});
    } catch (err) {
        next(err);

    }
}
    async function passwordlessLogin(req, res, next) {
        const {email, code} = req.body;

        try {
            const result = await validateOTP(email, code);
            if (!result.valid) {
                return res.status(400).json({message: result.reason});
            }

            const userRes = await db.query('SELECT id, email, username, role_id FROM users WHERE email = $1', [email]);
            const user = userRes.rows[0];

            if (!user) {
                return res.status(404).json({message: 'No user found with this email'});
            }

            // Save user session
            req.session.user = {
                id: user.id,
                role_id: user.role_id,
                username: user.username,
            };

            res.status(200).json({message: 'Login successful', user: req.session.user});
        } catch (err) {
            next(err);
        }
    }

    async function getSession(req, res) {
        if (req.session?.user) {
            return res.status(200).json({user: req.session.user});
        } else {
            return res.status(401).json({message: 'Not logged in'});
        }
    }
    async function logout(req, res) {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: 'Logout failed' });
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    }
module.exports = {
    verifyEmail,
    register,
    checkUsername,
    signin,
    passwordlessLogin,
    getSession,
    logout
};
