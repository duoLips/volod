require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const otpRoutes = require('./routes/otp.routes');
const authRoutes = require('./routes/auth.routes');
const monobankRoutes = require('./routes/monobank.routes')
const { scheduleOTPCleanup } = require('./utils/otpCleanup.job');
const { scheduleJarSync } = require('./utils/jarSync.job');


const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: false,
        secure: false, // set to true in production with HTTPS
        maxAge: 60 * 60 * 1000, // 1 hour
    },
}));

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/banka', monobankRoutes);

app.get('/api/test', (req, res) => {
    res.send('API is working');
});

scheduleOTPCleanup();
scheduleJarSync();


const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
