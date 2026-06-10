const cron = require('node-cron');
const Hearing = require('../models/hearingModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const NotificationService = require('./notificationService');
const pool = require('../config/db');

/**
 * Morning Alert Service
 * Schedules and sends daily morning docket summaries to legal staff.
 */
class MorningAlertService {
  static init() {
    // Schedule for 7:00 AM every day
    cron.schedule('0 7 * * *', () => {
      console.log('[CRON] Running Morning Docket generation at 07:00 AM');
      this.sendDailyDockets();
    });

    console.log('Morning Alert Scheduler initialized (7:00 AM Daily)');
  }

  /**
   * Generates and sends personalized summaries to users with registered phone numbers
   */
  static async sendDailyDockets() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Fetch all users who have a registered phone number
      const [users] = await pool.query('SELECT id, name, phone FROM users WHERE phone IS NOT NULL AND phone != ""');

      if (users.length === 0) {
        console.log('[CRON] No users with phone numbers found. Skipping.');
        return;
      }

      for (const user of users) {
        // 2. Fetch today's hearings for THIS user
        const hearings = await Hearing.findByDate(today, user.id);
        
        // 3. Fetch today's pending tasks for THIS user
        const allTasks = await Task.findAll(user.id);
        const todayTasks = allTasks.filter(t => 
          t.due_date && 
          new Date(t.due_date).toISOString().split('T')[0] === today && 
          t.status === 'Pending'
        );

        if (hearings.length === 0 && todayTasks.length === 0) {
          console.log(`[CRON] No items for ${user.name} today, skipping.`);
          continue;
        }

        const summary = this.formatSummary(user.name, today, hearings, todayTasks);

        console.log(`[CRON] Sending personalized morning docket to ${user.name} (${user.phone})`);
        await NotificationService.sendWhatsApp(user.phone, summary);
      }
    } catch (error) {
      console.error('[CRON ERROR] Failed to generate morning dockets:', error);
    }
  }

  static formatSummary(userName, date, hearings, tasks) {
    let msg = `📅 MORNING DOCKET - ${date}\n`;
    msg += `Good morning, ${userName}!\n\n`;
    
    if (hearings.length > 0) {
      msg += `⚖️ TODAY'S HEARINGS (${hearings.length}):\n`;
      hearings.forEach((h, i) => {
        msg += `${i+1}. ${h.case_number} - ${h.court_name} (${h.hearing_time || 'TBD'})\n`;
      });
    } else {
      msg += `✅ No hearings scheduled for today.\n`;
    }

    if (tasks.length > 0) {
      msg += `\n📝 URGENT TASKS:\n`;
      tasks.forEach((t, i) => {
        msg += `• ${t.title} (${t.priority})\n`;
      });
    }

    msg += `\nHave a productive day! - LawConnect`;
    return msg;
  }
}

module.exports = MorningAlertService;
