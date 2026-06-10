const Case = require('./src/models/caseModel');
const Hearing = require('./src/models/hearingModel');
const Client = require('./src/models/clientModel');
const pool = require('./src/config/db');

async function test() {
  try {
    const userId = 5; // Use arif
    const [clients] = await pool.query('SELECT id FROM clients WHERE user_id = ? LIMIT 1', [userId]);
    const clientId = clients[0].id;

    console.log('Testing Case Creation for User 5, Client ' + clientId);

    const formData = {
      client_id: clientId,
      case_number: 'TEST-' + Date.now(),
      case_year: '',
      court_type: '',
      court_name: 'Test Court',
      presiding_judge: '',
      police_station: '',
      opposite_party: '',
      opposing_counsel: '',
      description: '',
      hearing_date: '2026-06-15'
    };

    const { hearing_date, client_id, case_number, ...caseData } = formData;

    const caseId = await Case.create({ ...caseData, case_number, client_id, user_id: userId });
    console.log('Case created with ID:', caseId);

    if (hearing_date && hearing_date !== '') {
      const hearingId = await Hearing.create({
        case_id: caseId,
        hearing_date: hearing_date,
        stage: 'First Hearing / Registration',
        notes: 'Initial hearing scheduled at case creation.'
      });
      console.log('Hearing created with ID:', hearingId);
    }

    console.log('TEST SUCCESSFUL');
  } catch (err) {
    console.error('TEST FAILED');
    console.error(err);
  } finally {
    process.exit(0);
  }
}

test();
