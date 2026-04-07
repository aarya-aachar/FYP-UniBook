const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_unibook_key_12345', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function verifyAdmin(req, res, next) {
  console.log('>>> [AUTH] Verifying Admin role for:', req.user?.email);
  if (req.user && (req.user.role?.toLowerCase() === 'admin' || req.user.role?.toLowerCase() === 'administrator')) {
    console.log('>>> [AUTH] Success: Role is', req.user.role);
    next();
  } else {
    console.warn(`>>> [AUTH] DENIED: User role is '${req.user?.role || 'undefined'}'`);
    return res.status(403).json({ message: 'Admin access required' });
  }
}

module.exports = { authenticateToken, verifyAdmin };
