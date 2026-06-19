const jwt = require('jsonwebtoken');

// 1. JWT validation middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: Bearer Authorization token is missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Stores decoded payload: { userId, role, rollNumber }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Access Denied: Invalid or expired authentication token' });
  }
};

// 2. Role-gate validation middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Authentication session missing' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Unauthorized privilege level. Required: [${allowedRoles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
