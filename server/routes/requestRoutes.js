
const express = require('express')

const router = express.Router()

const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  acceptBloodRequest,
} = require('../controllers/requestController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const allowedRequestRoles = [
  'user',
  'donor',
  'hospital',
  'admin',
]

// Create a new blood request
router.post(
  '/',
  protect,
  authorizeRoles(...allowedRequestRoles),
  createBloodRequest
)

// Get all blood requests
router.get(
  '/',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getAllBloodRequests
)

// Donor accepts a blood request
router.patch(
  '/:id/accept',
  protect,
  authorizeRoles('donor'),
  acceptBloodRequest
)

// Get a single blood request by ID
router.get(
  '/:id',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getBloodRequestById
)

module.exports = router
