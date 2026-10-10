const User = require('../models/User')

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      user,
    })
  } catch (error) {
    console.error('Get user profile error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile',
    })
  }
}

module.exports = {
  getUserProfile,
}