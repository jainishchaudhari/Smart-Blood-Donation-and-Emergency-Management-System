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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Shape of a donor profile sent to the frontend
const formatDonorProfile = (user) => ({
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  bloodGroup: user.bloodGroup || '',
  dateOfBirth: user.dateOfBirth
    ? user.dateOfBirth.toISOString().slice(0, 10)
    : '',
  city: user.city || '',
  area: user.area || '',
  address: user.address || '',
  isAvailable: Boolean(user.isAvailable),
  profileCompleted: Boolean(user.profileCompleted),
  latitude: user.location?.coordinates?.[1] ?? null,
  longitude: user.location?.coordinates?.[0] ?? null,
})

// Get the logged-in donor's own profile
const getDonorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    return res.status(200).json({
      success: true,
      profile: formatDonorProfile(user),
    })
  } catch (error) {
    console.error('Get donor profile error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching donor profile',
    })
  }
}

// Create / update the logged-in donor's own profile
const updateDonorProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      bloodGroup,
      dateOfBirth,
      city,
      area,
      address,
      isAvailable,
      latitude,
      longitude,
    } = req.body

    const fail = (message) =>
      res.status(400).json({ success: false, message })

    if (!name?.trim() || name.trim().length < 2) {
      return fail('Full name is required')
    }

    const cleanPhone = String(phone || '').replace(/[\s-]/g, '')

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      return fail('Enter a valid phone number (10 to 15 digits)')
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return fail('Please select a valid blood group')
    }

    const dob = new Date(dateOfBirth)

    if (!dateOfBirth || Number.isNaN(dob.getTime())) {
      return fail('Please enter a valid date of birth')
    }

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age -= 1
    }

    if (age < 18 || age > 65) {
      return fail('Donors must be between 18 and 65 years old')
    }

    if (!city?.trim()) {
      return fail('City is required')
    }

    if (!address?.trim()) {
      return fail('Address is required')
    }

    const lat = Number(latitude)
    const lng = Number(longitude)

    if (
      latitude === null ||
      latitude === undefined ||
      latitude === '' ||
      longitude === null ||
      longitude === undefined ||
      longitude === '' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return fail('Please select your location on the map')
    }

    if (typeof isAvailable !== 'boolean') {
      return fail('Availability must be true or false')
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name.trim(),
          phone: cleanPhone,
          bloodGroup,
          dateOfBirth: dob,
          city: city.trim(),
          area: (area || '').trim(),
          address: address.trim(),
          isAvailable,
          // GeoJSON order is [longitude, latitude]
          location: { type: 'Point', coordinates: [lng, lat] },
          profileCompleted: true,
        },
      },
      { new: true, runValidators: true }
    ).select('-password')

    return res.status(200).json({
      success: true,
      message: 'Donor profile saved successfully',
      profile: formatDonorProfile(user),
    })
  } catch (error) {
    console.error('Update donor profile error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while saving donor profile',
    })
  }
}

module.exports = {
  getDonorProfile,
  updateDonorProfile,
  getDonorDashboard,
  getDonationHistory,
  createDonation,
  getAllDonors,
}