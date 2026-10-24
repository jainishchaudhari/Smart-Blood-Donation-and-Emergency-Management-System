
const express = require('express')
const router = express.Router()

const {
  getHospitalDashboard,
  getHospitalRequests,
  createDonationFromRequest,
  updateHospitalDonationStatus,
} = require('../controllers/hospitalController')

const { protect, authorizeRoles } = require('../middleware/authMiddleware')

// Hospital dashboard
router.get(
  '/dashboard',
  protect,
  authorizeRoles('hospital'),
  getHospitalDashboard
)

// Get accepted blood requests for the logged-in hospital
router.get(
  '/requests',
  protect,
  authorizeRoles('hospital'),
  getHospitalRequests
)

// Create a scheduled donation from an accepted blood request
router.post(
  '/requests/:id/donations',
  protect,
  authorizeRoles('hospital'),
  createDonationFromRequest
)

// Update donation status
router.patch(
  '/donations/:id/status',
  protect,
  authorizeRoles('hospital'),
  updateHospitalDonationStatus
)

module.exports = router
