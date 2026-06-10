const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth Header:', authHeader);
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token with secret:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token Verification Error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
