const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['user', 'donor', 'hospital', 'admin'],
      default: 'user',
    },

    phone: {
      type: String,
      default: '',
    },

    bloodGroup: {
      type: String,
      enum: [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
        '',
      ],
      default: '',
    },

    city: {
      type: String,
      default: '',
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    // ---- Donor profile fields ----
    dateOfBirth: {
      type: Date,
    },

    area: {
      type: String,
      default: '',
      trim: true,
    },

    address: {
      type: String,
      default: '',
      trim: true,
    },

    // GeoJSON point: coordinates are [longitude, latitude].
    // No defaults on purpose: a half-empty location breaks the 2dsphere index.
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },

    // true once a donor has saved a complete profile (incl. location)
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Needed for "find donors near this point" queries
userSchema.index({ location: '2dsphere' })

const User = mongoose.model('User', userSchema)

module.exports = User