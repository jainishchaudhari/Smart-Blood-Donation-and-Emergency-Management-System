const express = require('express')

const router = express.Router()

const {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  withdrawInvitation,
} = require('../controllers/invitationController')

const {
  protect,
  authorizeRoles,
} = require('../middleware/authMiddleware')

// Requests sent to the logged-in donor
router.get('/my', protect, authorizeRoles('donor'), getMyInvitations)

// Donor answers a request
router.patch('/:id/accept', protect, authorizeRoles('donor'), acceptInvitation)
router.patch('/:id/reject', protect, authorizeRoles('donor'), rejectInvitation)

router.patch('/:id/withdraw', protect, authorizeRoles('donor'), withdrawInvitation)

module.exports = router