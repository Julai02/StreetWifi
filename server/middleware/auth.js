import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes with JWT authentication
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    // Normalize token payload for controllers: provide both `id` and `_id`
    req.user = {
      ...decoded,
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};
