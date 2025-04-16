require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const otpRoutes = require('./routes/otp.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { scheduleOTPCleanup } = require('./utils/otpCleanup.job');

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        maxAge: 60 * 60 * 1000, // 1 hour
    },
}));

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

scheduleOTPCleanup();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
