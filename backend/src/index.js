const app = require('./app');
const pool = require('./config/db');
const MorningAlertService = require('./services/morningAlertService');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();

    // Initialize Services
    MorningAlertService.init();

  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error.message);
    console.log('Server will start, but database-dependent features will fail.');
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Global Exception Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err.msg || err);
});

startServer();
