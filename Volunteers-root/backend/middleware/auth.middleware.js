const ADMIN = 1
function isAdmin(req, res, next) {
    if (req.session?.user?.role === ADMIN) return next();
    res.status(403).json({ message: 'Forbidden' });
}

module.exports = { isAdmin };
