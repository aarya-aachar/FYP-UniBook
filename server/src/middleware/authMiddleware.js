/**
 * Security Middleware
 * 
 * These functions act as "Security Guards" for our API routes. 
 * They check the user's ID card (JWT Token) before allowing them to access 
 * sensitive data or protected pages.
 */

const jwt = require('jsonwebtoken');

/**
 * 1. authenticateToken
 * This is the basic check. It looks for a "Token" in the request headers.
 * If the token is valid, it attaches the user's information (ID, Email, Role) 
 * to the request object so other functions can use it.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Tokens are usually sent in the format: "Bearer [TOKEN_STRING]"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If there's no token, the user isn't logged in.
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Decrypt and verify the token using our secret key
  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_unibook_key_12345', (err, user) => {
    if (err) {
      // If the token was tampered with or is expired
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Save the user data into the request so we know who is calling the API
    req.user = user;
    next(); // Move to the next function in the chain
  });
}

/**
 * 2. verifyAdmin
 * A stricter check that only allows access if the user is an Administrator.
 */
function verifyAdmin(req, res, next) {
  console.log('>>> [AUTH] Verifying Admin role for:', req.user?.email);
  
  if (req.user && (req.user.role?.toLowerCase() === 'admin' || req.user.role?.toLowerCase() === 'administrator')) {
    console.log('>>> [AUTH] Success: Role is', req.user.role);
    next();
  } else {
    // Access denied if the user is just a regular client or provider
    console.warn(`>>> [AUTH] DENIED: User role is '${req.user?.role || 'undefined'}'`);
    return res.status(403).json({ message: 'Admin access required' });
  }
}

/**
 * 3. verifyProvider
 * Allows access only to registered Service Providers.
 */
function verifyProvider(req, res, next) {
  if (req.user && req.user.role?.toLowerCase() === 'provider') {
    next();
  } else {
    return res.status(403).json({ message: 'Provider access required' });
  }
}

module.exports = { authenticateToken, verifyAdmin, verifyProvider };
