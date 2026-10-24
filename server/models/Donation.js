const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema(
  {
    // Donor linked to this donation, if assigned
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Blood request that this donation fulfills
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
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
      default: 1,
    },

    donationDate: {
      type: Date,
      required: true,
      default: Date.now,
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

    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
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

// Prevent multiple donation records for the same blood request.
// Existing donations without a bloodRequest reference are unaffected.
donationSchema.index(
  { bloodRequest: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bloodRequest: { $type: 'objectId' },
    },
  }
)

const Donation = mongoose.model('Donation', donationSchema)

module.exports = Donation