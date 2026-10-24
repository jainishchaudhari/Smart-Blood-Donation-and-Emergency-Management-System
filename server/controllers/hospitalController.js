const User = require('../models/User')
const BloodRequest = require('../models/BloodRequest')
const Donation = require('../models/Donation')
const mongoose = require('mongoose')

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

    const [totalRequests, pendingRequests, acceptedRequests, completedRequests] =
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
          status: 'accepted',
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
        acceptedRequests,
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

// Get blood requests matching the logged-in hospital
const getHospitalRequests = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id).select('-password')

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can access these requests',
      })
    }

    if (!hospital.name || !hospital.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hospital account name is missing',
      })
    }

    const requests = await BloodRequest.find({
      hospitalName: {
        $regex: `^${hospital.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
        $options: 'i',
      },
      status: 'accepted',
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


const createDonationFromRequest = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood request ID',
      })
    }

    const hospital = await User.findById(req.user._id).select('-password')

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can create donation records',
      })
    }

    if (!hospital.name || !hospital.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hospital account name is missing',
      })
    }

    const bloodRequest = await BloodRequest.findById(id)

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      })
    }

    const hospitalNameMatches =
      bloodRequest.hospitalName.trim().toLowerCase() ===
      hospital.name.trim().toLowerCase()

    if (!hospitalNameMatches) {
      return res.status(403).json({
        success: false,
        message: 'This blood request belongs to another hospital',
      })
    }

    if (bloodRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted blood requests can become donations',
      })
    }

    if (!bloodRequest.acceptedBy) {
      return res.status(400).json({
        success: false,
        message:
          'No accepting donor is recorded. The donor must accept this request again.',
      })
    }

    const existingDonation = await Donation.findOne({
      bloodRequest: bloodRequest._id,
    })

    if (existingDonation) {
      return res.status(409).json({
        success: false,
        message: 'A donation record already exists for this request',
        donation: existingDonation,
      })
    }

    const donation = await Donation.create({
      donor: bloodRequest.acceptedBy,
      bloodRequest: bloodRequest._id,
      bloodGroup: bloodRequest.bloodGroup,
      units: bloodRequest.units,
      hospitalName: bloodRequest.hospitalName,
      city: bloodRequest.city,
      status: 'scheduled',
      notes: bloodRequest.notes || '',
    })

    return res.status(201).json({
      success: true,
      message: 'Donation scheduled successfully',
      donation,
    })
  } catch (error) {
    // A duplicate-key error can occur if two requests are processed together.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A donation record already exists for this request',
      })
    }

    console.error('Create donation from request error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while creating donation',
    })
  }
}


const updateHospitalDonationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation ID',
      })
    }

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be completed or cancelled',
      })
    }

    const hospital = await User.findById(req.user._id).select('-password')

    if (!hospital || hospital.role !== 'hospital') {
      return res.status(403).json({
        success: false,
        message: 'Only hospitals can update donation status',
      })
    }

    const donation = await Donation.findById(id)

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      })
    }

    if (
      donation.hospitalName.trim().toLowerCase() !==
      hospital.name.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'This donation belongs to another hospital',
      })
    }

    if (donation.status !== 'scheduled') {
      return res.status(409).json({
        success: false,
        message: 'Only scheduled donations can be updated',
      })
    }

    // Update only if the donation is still scheduled.
    const updatedDonation = await Donation.findOneAndUpdate(
      { _id: id, status: 'scheduled' },
      { $set: { status } },
      { new: true, runValidators: true }
    )

    if (!updatedDonation) {
      return res.status(409).json({
        success: false,
        message: 'Donation status has already changed',
      })
    }

    // Complete the linked blood request when the donation is completed.
    if (status === 'completed' && updatedDonation.bloodRequest) {
      await BloodRequest.findOneAndUpdate(
        {
          _id: updatedDonation.bloodRequest,
          status: 'accepted',
        },
        { $set: { status: 'completed' } },
        { runValidators: true }
      )
    }

    return res.status(200).json({
      success: true,
      message: `Donation marked as ${status}`,
      donation: updatedDonation,
    })
  } catch (error) {
    console.error('Update hospital donation status error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while updating donation status',
    })
  }
}

// Get donations for the logged-in hospital
const getHospitalDonations = async (req, res) => {
  try {
    const hospital = await User.findById(req.user._id).select("-password");

    if (!hospital || hospital.role !== "hospital") {
      return res.status(403).json({
        success: false,
        message: "Only hospitals can view donations",
      });
    }

    if (!hospital.name || !hospital.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Hospital account name is missing",
      });
    }

    const donations = await Donation.find({
      hospitalName: {
        $regex: `^${hospital.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    })
      .populate("donor", "name email bloodGroup phone")
      .populate("bloodRequest", "patientName bloodGroup units status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get hospital donations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching hospital donations",
    });
  }
};


module.exports = {
  getHospitalDashboard,
  getHospitalRequests,
  getHospitalDonations,
  createDonationFromRequest,
  updateHospitalDonationStatus,
}