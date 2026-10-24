const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const { sanitizeRequestForUser } = require("../utils/requestPrivacy");
const {
  getCompatibleDonorGroups,
} = require("../utils/bloodCompatibility");

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
      patientAge,
      patientGender,
      medicalCondition,
      hospitalAddress,
      attendantName,
      alternateContact,
      requiredBy,
    } = req.body;

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

    const parsedUnits = Number(units);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
      return res.status(400).json({
        success: false,
        message: "Units must be a positive whole number",
      });
    }

    // The hospital / emergency location is required and must be valid
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      latitude === undefined ||
      latitude === null ||
      latitude === "" ||
      longitude === undefined ||
      longitude === null ||
      longitude === "" ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select the hospital location on the map",
      });
    }

    let parsedRequiredBy;

    if (requiredBy) {
      parsedRequiredBy = new Date(requiredBy);

      if (Number.isNaN(parsedRequiredBy.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid required-by date and time",
        });
      }
    }

    const bloodRequest = await BloodRequest.create({
      patientName,
      bloodGroup,
      units: parsedUnits,
      hospitalName,
      city,
      area,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      contactNumber,
      urgency,
      notes,
      patientAge: patientAge === '' || patientAge == null ? undefined : Number(patientAge),
      patientGender,
      medicalCondition,
      hospitalAddress,
      attendantName,
      alternateContact,
      requiredBy: parsedRequiredBy,
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
    const {
      city,
      area,
      bloodGroup,
      urgency,
      status,
      myAccepted,
    } = req.query;

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

    if (myAccepted === "true") {
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          message: "Please log in to view your accepted requests",
        });
      }

      filter.status = "accepted";
      filter.acceptedBy = req.user._id;
    } else if (status) {
      filter.status = status;
    }

    const requests = await BloodRequest.find(filter)
      .populate("requestedBy", "name email role")
      .populate("acceptedBy", "name email bloodGroup")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map((item) =>
        sanitizeRequestForUser(item, req.user)
      ),
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    const bloodRequest = await BloodRequest.findById(id)
      .populate("requestedBy", "name email role")
      .populate("acceptedBy", "name email bloodGroup");

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request: sanitizeRequestForUser(bloodRequest, req.user),
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This blood request is no longer available",
      });
    }

    const acceptedRequest = await BloodRequest.findOneAndUpdate(
      {
        _id: id,
        status: "pending",
      },
      {
        $set: {
          status: "accepted",
          acceptedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("requestedBy", "name email role")
      .populate("acceptedBy", "name email bloodGroup");

    if (!acceptedRequest) {
      return res.status(409).json({
        success: false,
        message: "This blood request has already been accepted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blood request accepted successfully",
      request: acceptedRequest,
    });
  } catch (error) {
    console.error("Accept blood request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while accepting blood request",
    });
  }
};

const ALLOWED_RADII_KM = [5, 10, 25, 50];

// Find available, compatible donors near a blood request (nearest first)
const getNearbyDonors = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood request ID",
      });
    }

    const bloodRequest = await BloodRequest.findById(id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    // Only the requester, hospitals and admins may search for donors
    const isOwner =
      String(bloodRequest.requestedBy) === String(req.user._id);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You can only search donors for your own requests",
      });
    }

    if (!["pending", "accepted"].includes(bloodRequest.status)) {
      return res.status(400).json({
        success: false,
        message: "This request is no longer active",
      });
    }

    if (
      typeof bloodRequest.latitude !== "number" ||
      typeof bloodRequest.longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "This request has no map location",
      });
    }

    const radiusKm = Number(req.query.radius || 10);

    if (!ALLOWED_RADII_KM.includes(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: `Radius must be one of: ${ALLOWED_RADII_KM.join(", ")} km`,
      });
    }

    const compatibleGroups = getCompatibleDonorGroups(
      bloodRequest.bloodGroup
    );

    const donors = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [bloodRequest.longitude, bloodRequest.latitude],
          },
          key: "location",
          distanceField: "distanceMeters",
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            role: "donor",
            isAvailable: true,
            profileCompleted: true,
            bloodGroup: { $in: compatibleGroups },
            _id: { $ne: req.user._id },
          },
        },
      },
      { $limit: 50 },
      {
        // Never send phone, email, address or exact location here
        $project: {
          name: 1,
          bloodGroup: 1,
          city: 1,
          area: 1,
          isAvailable: 1,
          distanceMeters: 1,
          "location.coordinates": 1,
        },
      },
    ]);

    const result = donors.map((donor) => ({
      _id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      area: donor.area,
      isAvailable: donor.isAvailable,
      distanceKm: Math.round((donor.distanceMeters / 1000) * 10) / 10,
      // Rounded to 2 decimals (about 1 km) so exact home location stays private
      approxLatitude: Math.round(donor.location.coordinates[1] * 100) / 100,
      approxLongitude: Math.round(donor.location.coordinates[0] * 100) / 100,
    }));

    return res.status(200).json({
      success: true,
      radiusKm,
      compatibleGroups,
      count: result.length,
      donors: result,
    });
  } catch (error) {
    console.error("Nearby donors error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while searching nearby donors",
    });
  }
};

module.exports = {
  getNearbyDonors,
  createBloodRequest,
  getAllBloodRequests,
  getBloodRequestById,
  acceptBloodRequest,
};