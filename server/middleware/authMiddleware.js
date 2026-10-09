const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protect routes using JWT authentication
const protect = async (req, res, next) => {
  try {
    let token

    // Read token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.',
      })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user from token
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      })
    }

    // Attach user information to request
    req.user = user

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }
}

// Restrict access by role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      })
    }

    next()
  }
}

module.exports = {
  protect,
  authorizeRoles,
}