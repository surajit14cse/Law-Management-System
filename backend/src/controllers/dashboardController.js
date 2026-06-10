const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get Today's Hearings Count
    const [hearingRes] = await pool.query(
      'SELECT COUNT(*) as count FROM hearings JOIN cases ON hearings.case_id = cases.id WHERE cases.user_id = ? AND hearings.hearing_date = ?',
      [userId, today]
    );

    // 2. Get Pending Tasks Count
    const [taskRes] = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "Pending"',
      [userId]
    );

    // 3. Get Active Cases Count
    const [caseRes] = await pool.query(
      'SELECT COUNT(*) as count FROM cases WHERE user_id = ? AND case_status = "Active"',
      [userId]
    );

    res.json({
      todayHearings: hearingRes[0].count,
      pendingTasks: taskRes[0].count,
      activeCases: caseRes[0].count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
