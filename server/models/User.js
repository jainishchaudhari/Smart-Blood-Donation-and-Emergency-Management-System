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
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

module.exports = User