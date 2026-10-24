
const express = require('express')

const router = express.Router()

const {
  getDonorDashboard,
  getDonationHistory,
  getAllDonors,
} = require('../controllers/donorController')

const { protect, authorizeRoles } = require('../middleware/authMiddleware')

// Find registered donors
router.get(
  '/',
  protect,
  authorizeRoles('user', 'donor', 'hospital', 'admin'),
  getAllDonors
)

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
