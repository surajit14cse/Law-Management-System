const cron = require('node-cron');
const Hearing = require('../models/hearingModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const NotificationService = require('./notificationService');

/**
 * Morning Alert Service
 * Schedules and sends daily morning docket summaries to legal staff.
 */
class MorningAlertService {
  static init() {
    // Schedule for 7:00 AM every day
    // Pattern: minute hour day-of-month month day-of-week
    cron.schedule('0 7 * * *', () => {
      console.log('[CRON] Running Morning Docket generation at 07:00 AM');
      this.sendDailyDockets();
    });

    console.log('Morning Alert Scheduler initialized (7:00 AM Daily)');
  }

  /**
   * Generates and sends summaries to all registered users
   */
  static async sendDailyDockets() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Fetch today's hearings
      const hearings = await Hearing.findByDate(today);
      
      // 2. Fetch today's high priority tasks
      const allTasks = await Task.findAll();
      const todayTasks = allTasks.filter(t => 
        t.due_date && 
        t.due_date.toISOString().split('T')[0] === today && 
        t.status === 'Pending'
      );

      // In a real system, we would filter by user_id. 
      // For this implementation, we send a global summary to all Admins/Juniors.
      const usersRes = await require('../config/db').query('SELECT * FROM users WHERE phone IS NOT NULL');
      const users = usersRes[0];

      if (hearings.length === 0 && todayTasks.length === 0) {
        console.log('[CRON] No items for today, skipping notifications.');
        return;
      }

      const summary = this.formatSummary(today, hearings, todayTasks);

      for (const user of users) {
        console.log(`[CRON] Sending morning docket to ${user.name} (${user.phone})`);
        await NotificationService.sendWhatsApp(user.phone, summary);
      }
    } catch (error) {
      console.error('[CRON ERROR] Failed to generate morning docket:', error);
    }
  }

  static formatSummary(date, hearings, tasks) {
    let msg = `📅 MORNING DOCKET - ${date}\n\n`;
    
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
