/**
 * Notification Service
 * This service handles sending SMS and WhatsApp messages.
 * Currently implemented as a MOCK service. 
 * To go live: Integrate with Twilio, Vonage, or a similar provider.
 */

class NotificationService {
  /**
   * Send SMS via provider (e.g. Twilio)
   */
  static async sendSMS(phone, message) {
    console.log(`[SMS SENT] to ${phone}: ${message}`);
    // REAL INTEGRATION EXAMPLE (Twilio):
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: message, from: '+123456789', to: phone });
    return { success: true, provider: 'MockProvider' };
  }

  /**
   * Send WhatsApp via provider
   */
  static async sendWhatsApp(phone, message) {
    console.log(`[WHATSAPP SENT] to ${phone}: ${message}`);
    // REAL INTEGRATION EXAMPLE (Twilio WhatsApp):
    // await client.messages.create({ body: message, from: 'whatsapp:+14155238886', to: `whatsapp:${phone}` });
    return { success: true, provider: 'MockProvider' };
  }
}

module.exports = NotificationService;
