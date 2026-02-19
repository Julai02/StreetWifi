import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user
 * @param {string} id - User ID
 * @param {string} role - User role ('user' or 'admin')
 * @returns {string} JWT token
 */
export const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
  } catch (error) {
    return null;
  }
};

/**
 * Generate basic auth string for API calls
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {string} Base64 encoded auth string
 */
export const generateBasicAuth = (username, password) => {
  return Buffer.from(`${username}:${password}`).toString('base64');
};
