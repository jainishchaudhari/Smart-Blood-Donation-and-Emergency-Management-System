
const express = require('express')

const router = express.Router()

const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
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

// Get a single blood request by ID
router.get(
  '/:id',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getBloodRequestById
)

module.exports = router
