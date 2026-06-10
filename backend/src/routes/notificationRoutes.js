const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/send-reminder', authMiddleware, notificationController.sendClientReminder);

module.exports = router;
