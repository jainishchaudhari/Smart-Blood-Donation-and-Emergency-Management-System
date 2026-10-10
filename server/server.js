const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const donorRoutes = require('./routes/donorRoutes')
const requestRoutes = require('./routes/requestRoutes')
const hospitalRoutes = require('./routes/hospitalRoutes')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Home route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LifeFlow API is running successfully!',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/hospitals', hospitalRoutes)

// Server port
const PORT = process.env.PORT || 5000

// Start server without MongoDB for now
app.listen(PORT, () => {
  console.log(`LifeFlow server running on port ${PORT}`)
  console.log('MongoDB setup is pending')
})