const express = require('express')

const router = express.Router()

const {
  getDonorDashboard,
  getDonationHistory,
} = require('../controllers/donorController')

const { protect, authorizeRoles } = require('../middleware/authMiddleware')

// Donor dashboard
router.get(
  '/dashboard',
  protect,
  authorizeRoles('donor'),
  getDonorDashboard
)

// Donor donation history
router.get(
  '/history',
  protect,
  authorizeRoles('donor'),
  getDonationHistory
)

module.exports = router