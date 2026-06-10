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
    console.log(`\n--- [MOCK SMS SIMULATION] ---`);
    console.log(`TO: ${phone}`);
    console.log(`BODY: ${message}`);
    console.log(`--- [END SIMULATION] ---\n`);
    return { success: true, provider: 'MockProvider', timestamp: new Date() };
  }

  /**
   * Send WhatsApp via provider
   */
  static async sendWhatsApp(phone, message) {
    console.log(`\n--- [MOCK WHATSAPP SIMULATION] ---`);
    console.log(`TO: ${phone}`);
    console.log(`BODY: ${message}`);
    console.log(`--- [END SIMULATION] ---\n`);
    return { success: true, provider: 'MockProvider', timestamp: new Date() };
  }
}

module.exports = NotificationService;
