const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const donorRoutes = require('./routes/donorRoutes')
const requestRoutes = require('./routes/requestRoutes')
const invitationRoutes = require('./routes/invitationRoutes')
const hospitalRoutes = require('./routes/hospitalRoutes')

const adminRoutes = require('./routes/adminRoutes')

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
app.use('/api/invitations', invitationRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/admin', adminRoutes)


// Connect MongoDB, then start the server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`LifeFlow server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start LifeFlow server:', error.message)
    process.exit(1)
  }
}

startServer()