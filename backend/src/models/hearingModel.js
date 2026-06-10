const pool = require('../config/db');

class Hearing {
  static async create(data) {
    const { case_id, hearing_date, hearing_time, stage, outcome, notes, next_hearing_date } = data;
    
    // Helper to convert undefined or empty string to null
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;

    const [result] = await pool.query(
      `INSERT INTO hearings (
        case_id, hearing_date, hearing_time, stage, outcome, notes, next_hearing_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        val(case_id), 
        val(hearing_date), 
        val(hearing_time), 
        val(stage), 
        val(outcome), 
        val(notes), 
        val(next_hearing_date)
      ]
    );
    return result.insertId;
  }

  static async findByCaseId(caseId, userId) {
    const [rows] = await pool.query(`
      SELECT hearings.* FROM hearings 
      JOIN cases ON hearings.case_id = cases.id
      WHERE hearings.case_id = ? AND cases.user_id = ?
      ORDER BY hearing_date DESC
    `, [caseId, userId]);
    return rows;
  }

  static async findByDate(date, userId) {
    const [rows] = await pool.query(`
      SELECT hearings.*, cases.case_number, cases.court_name, cases.court_type, clients.name as client_name
      FROM hearings
      JOIN cases ON hearings.case_id = cases.id
      JOIN clients ON cases.client_id = clients.id
      WHERE hearings.hearing_date = ? AND cases.user_id = ?
    `, [date, userId]);
    return rows;
  }

  static async updateOutcome(id, userId, outcome, next_hearing_date, stage) {
    await pool.query(`
      UPDATE hearings 
      JOIN cases ON hearings.case_id = cases.id
      SET hearings.outcome = ?, hearings.next_hearing_date = ?, hearings.stage = ? 
      WHERE hearings.id = ? AND cases.user_id = ?
    `, [outcome, next_hearing_date, stage, id, userId]);
  }

  static async delete(id, userId) {
    await pool.query(`
      DELETE hearings FROM hearings
      JOIN cases ON hearings.case_id = cases.id
      WHERE hearings.id = ? AND cases.user_id = ?
    `, [id, userId]);
  }

  static async findById(id, userId) {
    const [rows] = await pool.query(`
      SELECT hearings.* FROM hearings
      JOIN cases ON hearings.case_id = cases.id
      WHERE hearings.id = ? AND cases.user_id = ?
    `, [id, userId]);
    return rows[0];
  }
}

module.exports = Hearing;
