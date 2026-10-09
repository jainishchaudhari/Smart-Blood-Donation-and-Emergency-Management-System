const User = require('../models/User')
const Donation = require('../models/Donation')

// Get donor dashboard information
const getDonorDashboard = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id).select('-password')

    if (!donor || donor.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can access this dashboard',
      })
    }

    const donations = await Donation.find({
      donor: req.user._id,
    }).sort({ donationDate: -1 })

    const completedDonations = donations.filter(
      (donation) => donation.status === 'completed'
    )

    return res.status(200).json({
      success: true,
      message: 'Donor dashboard fetched successfully',
      donor,
      stats: {
        totalDonations: completedDonations.length,
        totalUnitsDonated: completedDonations.reduce(
          (total, donation) => total + donation.units,
          0
        ),
      },
      donations,
    })
  } catch (error) {
    console.error('Donor dashboard error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching donor dashboard',
    })
  }
}

// Get donor donation history
const getDonationHistory = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id)

    if (!donor || donor.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can view donation history',
      })
    }

    const donations = await Donation.find({
      donor: req.user._id,
    }).sort({ donationDate: -1 })

    return res.status(200).json({
      success: true,
      message: 'Donation history fetched successfully',
      count: donations.length,
      donations,
    })
  } catch (error) {
    console.error('Donation history error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching donation history',
    })
  }
}

module.exports = {
  getDonorDashboard,
  getDonationHistory,
}