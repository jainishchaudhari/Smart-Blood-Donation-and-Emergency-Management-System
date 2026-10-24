const mongoose = require('mongoose')

// One document = one emergency request sent to one donor.
// The database is the source of truth for every donor response.
const donorInvitationSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'expired',
        'cancelled',
        'withdrawn',
      ],
      default: 'pending',
    },

    // Distance (km) from the emergency location when the request was sent
    distanceKm: {
      type: Number,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    // After this time a pending invitation counts as "no response"
    expiresAt: {
      type: Date,
      required: true,
    },

    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// A donor can never be invited twice for the same emergency.
// This also stops us contacting a donor who already rejected.
donorInvitationSchema.index({ request: 1, donor: 1 }, { unique: true })
donorInvitationSchema.index({ donor: 1, status: 1 })

module.exports = mongoose.model('DonorInvitation', donorInvitationSchema)