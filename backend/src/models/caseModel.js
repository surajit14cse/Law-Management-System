const pool = require('../config/db');

class Case {
  static async generateCaseNumber() {
    const year = new Date().getFullYear();
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM cases WHERE case_year = ?', [year]);
    const nextNumber = rows[0].count + 1;
    // Format: LC-2026-0001
    return `LC-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }

  static async create(data) {
    let { 
      user_id, client_id, case_number, case_year, court_type, court_name, 
      presiding_judge, police_station, opposite_party, opposing_counsel, 
      case_status, description 
    } = data;
    
    // Auto-generate case number if not provided
    if (!case_number || case_number === '') {
      case_number = await this.generateCaseNumber();
    }

    if (!case_year) {
      case_year = new Date().getFullYear();
    }
    
    // Helper to convert undefined or empty string to null
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;

    if (!user_id) {
      throw new Error('user_id is required to create a case');
    }

    try {
      const [result] = await pool.query(
        `INSERT INTO cases (
          user_id, client_id, case_number, case_year, court_type, court_name, 
          presiding_judge, police_station, opposite_party, opposing_counsel, 
          case_status, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          val(user_id), 
          val(client_id), 
          val(case_number), 
          val(case_year), 
          val(court_type), 
          val(court_name), 
          val(presiding_judge), 
          val(police_station), 
          val(opposite_party), 
          val(opposing_counsel), 
          val(case_status) || 'Active', 
          val(description)
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('DATABASE ERROR IN Case.create:', error);
      throw error;
    }
  }

  static async findAll(userId) {
    const [rows] = await pool.query(`
      SELECT cases.*, clients.name as client_name,
      (SELECT hearing_date FROM hearings WHERE case_id = cases.id AND hearing_date >= CURDATE() ORDER BY hearing_date ASC LIMIT 1) as next_hearing_date
      FROM cases 
      JOIN clients ON cases.client_id = clients.id
      WHERE cases.user_id = ?
    `, [userId]);
    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.query(`
      SELECT cases.*, clients.name as client_name,
      (SELECT hearing_date FROM hearings WHERE case_id = cases.id AND hearing_date >= CURDATE() ORDER BY hearing_date ASC LIMIT 1) as next_hearing_date
      FROM cases 
      JOIN clients ON cases.client_id = clients.id 
      WHERE cases.id = ? AND cases.user_id = ?
    `, [id, userId]);
    return rows[0];
  }

  static async findByClientId(clientId, userId) {
    const [rows] = await pool.query('SELECT * FROM cases WHERE client_id = ? AND user_id = ?', [clientId, userId]);
    return rows;
  }

  static async update(id, userId, data) {
    const { 
      case_number, case_year, court_type, court_name, 
      presiding_judge, police_station, opposite_party, opposing_counsel, 
      case_status, description 
    } = data;

    await pool.query(
      `UPDATE cases SET 
        case_number = ?, case_year = ?, court_type = ?, court_name = ?, 
        presiding_judge = ?, police_station = ?, opposite_party = ?, opposing_counsel = ?, 
        case_status = ?, description = ? 
      WHERE id = ? AND user_id = ?`,
      [
        case_number, case_year, court_type, court_name, 
        presiding_judge, police_station, opposite_party, opposing_counsel, 
        case_status, description, id, userId
      ]
    );
  }

  static async delete(id, userId) {
    await pool.query('DELETE FROM cases WHERE id = ? AND user_id = ?', [id, userId]);
  }
}

module.exports = Case;
