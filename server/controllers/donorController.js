
const User = require('../models/User')
const Donation = require('../models/Donation')

// Get donor dashboard information
const getDonorDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
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

    const donor = await User.findById(req.user._id).select(
      '-password'
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
    if (req.user.role !== 'donor') {
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

// Create a new donation
const createDonation = async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donors can create donations',
      })
    }

    const {
      bloodGroup,
      units,
      donationDate,
      hospitalName,
      city,
      notes,
    } = req.body

    if (
      !bloodGroup ||
      !hospitalName?.trim() ||
      !city?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Blood group, hospital name and city are required',
      })
    }

    const donation = await Donation.create({
      donor: req.user._id,
      bloodGroup,
      units: units === undefined || units === '' ? 1 : Number(units),
      donationDate: donationDate || new Date(),
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      notes: notes || '',
      status: 'scheduled',
    })

    return res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation,
    })
  } catch (error) {
    console.error('Create donation error:', error.message)

    if (
      error.name === 'ValidationError' ||
      error.name === 'CastError'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating donation',
    })
  }
}

// Get all registered donors with optional filters
const getAllDonors = async (req, res) => {
  try {
    const { bloodGroup, city, area } = req.query

    const filters = {
      role: 'donor',
    }

    if (bloodGroup) {
      filters.bloodGroup = bloodGroup
    }

    if (city?.trim()) {
      filters.city = {
        $regex: city.trim(),
        $options: 'i',
      }
    }

    if (area?.trim()) {
      filters.area = {
        $regex: area.trim(),
        $options: 'i',
      }
    }

    const donors = await User.find(filters)
      .select('name bloodGroup city area phone')
      .sort({ name: 1 })

    return res.status(200).json({
      success: true,
      message: 'Registered donors fetched successfully',
      count: donors.length,
      donors,
    })
  } catch (error) {
    console.error('Fetch donors error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching donors',
    })
  }
}

module.exports = {
  getDonorDashboard,
  getDonationHistory,
  createDonation,
  getAllDonors,
}
