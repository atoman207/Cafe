module.exports = function (req, res, next) {
  if (!req.user || !req.user.membershipStatus === 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}; 