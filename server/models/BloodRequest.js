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

    area: {
      type: String,
      required: true,
      trim: true,
    },

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

    patientAge: {
      type: Number,
      min: 0,
      max: 120,
    },

    patientGender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },

    medicalCondition: {
      type: String,
      trim: true,
      default: '',
    },

    hospitalAddress: {
      type: String,
      trim: true,
      default: '',
    },

    attendantName: {
      type: String,
      trim: true,
      default: '',
    },

    alternateContact: {
      type: String,
      trim: true,
      default: '',
    },

    requiredBy: {
      type: Date,
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
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Donor who accepts this blood request
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema)

module.exports = BloodRequest