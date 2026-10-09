const User = require('../models/User')
const BloodRequest = require('../models/BloodRequest')

// Get hospital dashboard
const getHospitalDashboard = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id).select('-password')

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access this dashboard',
      })
    }

    const [totalRequests, pendingRequests, completedRequests] =
      await Promise.all([
        BloodRequest.countDocuments({
          requestedBy: req.user._id,
        }),
        BloodRequest.countDocuments({
          requestedBy: req.user._id,
          status: 'pending',
        }),
        BloodRequest.countDocuments({
          requestedBy: req.user._id,
          status: 'completed',
        }),
      ])

    return res.status(200).json({
      success: true,
      message: 'Hospital dashboard fetched successfully',
      hospital,
      stats: {
        totalRequests,
        pendingRequests,
        completedRequests,
      },
    })
  } catch (error) {
    console.error('Hospital dashboard error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital dashboard',
    })
  }
}

// Get blood requests created by the hospital
const getHospitalRequests = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id)

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access these requests',
      })
    }

    const requests = await BloodRequest.find({
      requestedBy: req.user._id,
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    })
  } catch (error) {
    console.error('Hospital requests error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital requests',
    })
  }
}

module.exports = {
  getHospitalDashboard,
  getHospitalRequests,
}