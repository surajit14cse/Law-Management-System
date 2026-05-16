const pool = require('../config/db');

class Case {
  static async create(data) {
    const { 
      client_id, case_number, case_year, court_type, court_name, 
      presiding_judge, police_station, opposite_party, opposing_counsel, 
      case_status, description 
    } = data;
    
    const [result] = await pool.query(
      `INSERT INTO cases (
        client_id, case_number, case_year, court_type, court_name, 
        presiding_judge, police_station, opposite_party, opposing_counsel, 
        case_status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id, case_number, case_year, court_type, court_name, 
        presiding_judge, police_station, opposite_party, opposing_counsel, 
        case_status || 'Active', description
      ]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT cases.*, clients.name as client_name,
      (SELECT hearing_date FROM hearings WHERE case_id = cases.id AND hearing_date >= CURDATE() ORDER BY hearing_date ASC LIMIT 1) as next_hearing_date
      FROM cases 
      JOIN clients ON cases.client_id = clients.id
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT cases.*, clients.name as client_name,
      (SELECT hearing_date FROM hearings WHERE case_id = cases.id AND hearing_date >= CURDATE() ORDER BY hearing_date ASC LIMIT 1) as next_hearing_date
      FROM cases 
      JOIN clients ON cases.client_id = clients.id 
      WHERE cases.id = ?
    `, [id]);
    return rows[0];
  }

  static async findByClientId(clientId) {
    const [rows] = await pool.query('SELECT * FROM cases WHERE client_id = ?', [clientId]);
    return rows;
  }

  static async update(id, data) {
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
      WHERE id = ?`,
      [
        case_number, case_year, court_type, court_name, 
        presiding_judge, police_station, opposite_party, opposing_counsel, 
        case_status, description, id
      ]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM cases WHERE id = ?', [id]);
  }
}

module.exports = Case;
