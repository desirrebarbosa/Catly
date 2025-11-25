const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/error.middleware');

// import routes
const authRoutes = require('./routes/auth.routes');
const catRoutes = require('./routes/cat.routes');

// create Express app
const app = express();

// middleware
app.use(helmet()); // security headers
app.use(cors()); // enable CORS
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/cats', catRoutes);
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Catly API is running!',
    timestamp: new Date().toISOString()
  });
});

// error handling
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found.' 
  });
});

app.use(errorHandler);
module.exports = app;