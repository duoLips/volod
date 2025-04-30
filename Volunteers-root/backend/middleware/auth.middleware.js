const ADMIN = 1
function isAdmin(req, res, next) {
    if (req.session?.user?.role === ADMIN) return next();
    res.status(403).json({ message: 'Forbidden' });
}

function isAuthenticated(req, res, next) {
    if (req.session?.user) return next();
    res.status(403).json({ message: 'Authentication required' });
}
module.exports = { isAdmin, isAuthenticated};
