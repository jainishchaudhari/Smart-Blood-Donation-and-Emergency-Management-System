const express = require('express')

const router = express.Router()

const {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
} = require('../controllers/requestController')

const { protect } = require('../middleware/authMiddleware')

// Create a new blood request - login required
router.post('/', protect, createBloodRequest)

// Get all blood requests
router.get('/', getAllBloodRequests)

// Get a single blood request by ID
router.get('/:id', getBloodRequestById)

module.exports = router