const express = require('express')

const router = express.Router()

const {
  getDonorProfile,
  updateDonorProfile,
  getDonorDashboard,
  getDonationHistory,
  createDonation,
  getAllDonors,
} = require('../controllers/donorController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

// Find registered donors
router.get(
  '/',
  protect,
  authorizeRoles('user', 'donor', 'hospital', 'admin'),
  getAllDonors
)

// Donor's own profile (view and create/update)
router.get(
  '/profile',
  protect,
  authorizeRoles('donor'),
  getDonorProfile
)

router.put(
  '/profile',
  protect,
  authorizeRoles('donor'),
  updateDonorProfile
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

// Create a new donation
router.post(
  '/',
  protect,
  authorizeRoles('donor'),
  createDonation
)

module.exports = router