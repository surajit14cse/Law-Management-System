const pool = require('../config/db');

class Hearing {
  static async create(data) {
    const { case_id, hearing_date, hearing_time, stage, outcome, notes, next_hearing_date } = data;
    const [result] = await pool.query(
      `INSERT INTO hearings (
        case_id, hearing_date, hearing_time, stage, outcome, notes, next_hearing_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [case_id, hearing_date, hearing_time, stage, outcome, notes, next_hearing_date]
    );
    return result.insertId;
  }

  static async findByCaseId(caseId) {
    const [rows] = await pool.query('SELECT * FROM hearings WHERE case_id = ? ORDER BY hearing_date DESC', [caseId]);
    return rows;
  }

  static async findByDate(date) {
    const [rows] = await pool.query(`
      SELECT hearings.*, cases.case_number, cases.court_name, cases.court_type, clients.name as client_name
      FROM hearings
      JOIN cases ON hearings.case_id = cases.id
      JOIN clients ON cases.client_id = clients.id
      WHERE hearings.hearing_date = ?
    `, [date]);
    return rows;
  }

  static async updateOutcome(id, outcome, next_hearing_date, stage) {
    await pool.query(
      'UPDATE hearings SET outcome = ?, next_hearing_date = ?, stage = ? WHERE id = ?',
      [outcome, next_hearing_date, stage, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM hearings WHERE id = ?', [id]);
  }
}

module.exports = Hearing;
