const express = require('express')

const router = express.Router()

const {
  getHospitalDashboard,
  getHospitalRequests,
} = require('../controllers/hospitalController')

const { protect, authorizeRoles } = require('../middleware/authMiddleware')

// Hospital dashboard
router.get(
  '/dashboard',
  protect,
  authorizeRoles('hospital'),
  getHospitalDashboard
)

// Get hospital's blood requests
router.get(
  '/requests',
  protect,
  authorizeRoles('hospital'),
  getHospitalRequests
)

module.exports = router