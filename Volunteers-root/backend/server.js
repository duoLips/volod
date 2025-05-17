require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const otpRoutes = require('./routes/otp.routes');
const authRoutes = require('./routes/auth.routes');
const monobankRoutes = require('./routes/monobank.routes');
const mediaRoutes = require('./routes/media.routes');
const newsRoutes = require('./routes/news.routes')
const auctionRoutes = require('./routes/auction.routes')
const reportRoutes  = require('./routes/reports.routes')
const userRoutes = require('./routes/user.routes');
const commRoutes = require('./routes/comments.routes');
const searchRoutes = require('./routes/search.routes');
const adminRoutes = require('./routes/admin.routes')
const pollRoutes = require('./routes/poll.routes')
const { scheduleOTPCleanup } = require('./utils/otpCleanup.job');
const { scheduleJarSync } = require('./utils/jarSync.job');
const { scheduleAuctionAutoClose } = require('./utils/auctionClose.job');



const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
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
        maxAge: 12 * 60 * 60 * 1000 // 12 hours
    },
}));

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/banka', monobankRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commRoutes);
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/poll', pollRoutes)


app.get('/api/test', (req, res) => {
    res.send('API is working');
});

scheduleOTPCleanup();
scheduleJarSync();
scheduleAuctionAutoClose();



const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
