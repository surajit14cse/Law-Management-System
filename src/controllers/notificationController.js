const NotificationService = require('../services/notificationService');
const Client = require('../models/clientModel');

exports.sendClientReminder = async (req, res) => {
  try {
    const { clientId, type, message } = req.body;
    const client = await Client.findById(clientId);

    if (!client || !client.phone) {
      return res.status(400).json({ message: 'Client phone number not found' });
    }

    let result;
    if (type === 'whatsapp') {
      result = await NotificationService.sendWhatsApp(client.phone, message);
    } else {
      result = await NotificationService.sendSMS(client.phone, message);
    }

    res.json({ message: `${type.toUpperCase()} sent successfully`, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
