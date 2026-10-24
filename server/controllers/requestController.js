const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");

// Create a new blood request
const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      units,
      hospitalName,
      city,
      area,
      latitude,
      longitude,
      contactNumber,
      urgency,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !patientName ||
      !bloodGroup ||
      units === undefined ||
      units === null ||
      units === "" ||
      !hospitalName ||
      !city ||
      !area ||
      !contactNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required blood request details",
      });
    }

    // Validate units
    const parsedUnits = Number(units);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
      return res.status(400).json({
        success: false,
        message: "Units must be a positive whole number",
      });
    }

    // Create blood request
    const bloodRequest = await BloodRequest.create({
      patientName,
      bloodGroup,
      units: parsedUnits,
      hospitalName,
      city,
      area,
      latitude,
      longitude,
      contactNumber,
      urgency,
      notes,
      requestedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request: bloodRequest,
    });
  } catch (error) {
    console.error("Create blood request error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating blood request",
    });
  }
};

// Get all blood requests
const getAllBloodRequests = async (req, res) => {
  try {
    const { city, area, bloodGroup, urgency, status } = req.query;

    // Build search filters dynamically
    const filter = {};

    if (city && city.trim()) {
      filter.city = {
        $regex: city.trim(),
        $options: "i",
      };
    }

    if (area && area.trim()) {
      filter.area = {
        $regex: area.trim(),
        $options: "i",
      };
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (urgency) {
      filter.urgency = urgency;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await BloodRequest.find(filter)
      .populate("requestedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get blood requests error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching blood requests",
    });
  }
};

// Get a single blood request by ID
const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    const bloodRequest = await BloodRequest.findById(id).populate(
      "requestedBy",
      "name email role",
    );

    // Check whether request exists
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request: bloodRequest,
    });
  } catch (error) {
    console.error("Get blood request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching blood request",
    });
  }
};

// Donor accepts a pending blood request

const acceptBloodRequest = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood request ID',
      })
    }

    const request = await BloodRequest.findById(id)

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      })
    }

    if (request.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'This blood request is no longer available',
      })
    }

    const acceptedRequest = await BloodRequest.findOneAndUpdate(
      {
        _id: id,
        status: 'pending',
      },
      {
        $set: {
          status: 'accepted',
          acceptedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('acceptedBy', 'name email bloodGroup')

    if (!acceptedRequest) {
      return res.status(409).json({
        success: false,
        message: 'This blood request has already been accepted',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Blood request accepted successfully',
      request: acceptedRequest,
    })
  } catch (error) {
    console.error('Accept blood request error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while accepting blood request',
    })
  }
}


module.exports = {
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  acceptBloodRequest,
};
