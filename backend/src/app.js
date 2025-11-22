const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// import routes
const authRoutes = require('./routes/auth.routes');

// create Express app
const app = express();

// middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// routes
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Catly API is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);

// error handling
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found.' 
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

module.exports = app;