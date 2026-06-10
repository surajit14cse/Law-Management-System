const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Ensure upload directory exists
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads/clients');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created upload directory:', uploadDir);
}

// Middleware
app.use((req, res, next) => {
  console.log(`>>> ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Basic Health Check Route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  try {
    const connection = await require('./config/db').getConnection();
    dbStatus = 'Connected';
    connection.release();
  } catch (err) {
    dbStatus = 'Error: ' + err.message;
  }
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Law Management System API is running',
    database: dbStatus,
    time: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/hearings', require('./routes/hearingRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

module.exports = app;
