const express = require('express')


const router = express.Router()

const { getUserProfile } = require('../controllers/userController')
const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

// Get logged-in user's profile
router.get('/profile', protect, getUserProfile)

// User dashboard test route
router.get(
  '/dashboard',
  protect,
  authorizeRoles('user'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'User dashboard API is working!',
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