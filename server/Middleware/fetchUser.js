const jwt = require('jsonwebtoken');
const AppError = require('../Utils/AppError');

const fetchUser = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.header('AuthToken');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id: decoded.id || decoded.user };
    next();
  } catch (err) {
    return next(new AppError('Invalid token', 401));
  }
};

module.exports = fetchUser;