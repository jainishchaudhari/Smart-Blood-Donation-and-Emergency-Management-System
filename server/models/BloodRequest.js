const mongoose = require('mongoose')

const bloodRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },

    units: {
      type: Number,
      required: true,
      min: 1,
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    // New field for area-wise blood request search
    area: {
      type: String,
      required: true,
      trim: true,
    },

    // Selected map coordinates
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema)

module.exports = BloodRequest