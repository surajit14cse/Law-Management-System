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

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

startServer();
