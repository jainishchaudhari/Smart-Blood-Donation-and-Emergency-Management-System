const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register a new user
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      bloodGroup,
      city,
    } = req.body

    // Allow only public registration roles
    const allowedRoles = ['user', 'donor', 'hospital']
    const requestedRole = req.body.role || 'user'

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid role. Admin registration is not allowed.',
      })
    }

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    // Validate password length
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    // Validate email format
    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      })
    }

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: requestedRole,
      phone,
      bloodGroup,
      city,
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        city: user.city,
      },
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    // Handle duplicate email errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      })
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    })
  }
}

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    // Validate email type
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format',
      })
    }

    // Find user
    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({
      email: normalizedEmail,
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        city: user.city,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    })
  }
}

module.exports = {
  registerUser,
  loginUser,
}