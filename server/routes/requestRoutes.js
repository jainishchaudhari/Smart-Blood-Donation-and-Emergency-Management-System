const express = require('express')

const router = express.Router()

const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  acceptBloodRequest,
  getNearbyDonors,
} = require('../controllers/requestController')

const {
  sendInvitations,
  getRequestInvitations,
  updateRequestStatus,
} = require('../controllers/invitationController')

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

// Find nearby compatible donors for a request
router.get(
  '/:id/nearby-donors',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getNearbyDonors
)

// Send the request to the nearest eligible donors / see who was contacted
router.post(
  '/:id/invitations',
  protect,
  authorizeRoles(...allowedRequestRoles),
  sendInvitations
)

router.get(
  '/:id/invitations',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getRequestInvitations
)

// Change request progress: in_progress / completed / cancelled
router.patch(
  '/:id/status',
  protect,
  authorizeRoles(...allowedRequestRoles),
  updateRequestStatus
)

// Get a single blood request by ID
router.get(
  '/:id',
  protect,
  authorizeRoles(...allowedRequestRoles),
  getBloodRequestById
)

module.exports = router