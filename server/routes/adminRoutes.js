
const express = require('express')

const router = express.Router()

const { protect, authorizeRoles } = require('../middleware/authMiddleware')

// Admin dashboard test route
router.get(
  '/dashboard',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin dashboard API is working!',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    })
  }
)

module.exports = router
