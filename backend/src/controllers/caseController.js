const Case = require('../models/caseModel');
const Hearing = require('../models/hearingModel');
const Client = require('../models/clientModel');

exports.getAllCases = async (req, res) => {
  try {
    console.log(`Fetching all cases for user ID: ${req.user.id}`);
    const cases = await Case.findAll(req.user.id);
    console.log(`Found ${cases.length} cases`);
    res.json(cases);
  } catch (error) {
    console.error('FETCH ALL CASES ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id, req.user.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    console.log('--- CREATE CASE START ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User:', JSON.stringify(req.user, null, 2));

    const { hearing_date, client_id, case_number, ...caseData } = req.body;
    const userId = req.user.id;
    
    if (!client_id) {
      console.log('Validation Failed: client_id missing');
      return res.status(400).json({ message: 'Client must be selected.' });
    }
    if (!case_number) {
      console.log('Validation Failed: case_number missing');
      return res.status(400).json({ message: 'Case number is required.' });
    }

    // Verify client ownership
    console.log(`Verifying ownership of client ${client_id} for user ${userId}`);
    const client = await Client.findById(client_id, userId);
    if (!client) {
      console.log('Access Denied: User does not own this client');
      return res.status(403).json({ message: 'Access denied. You do not own this client.' });
    }

    console.log('Creating case in database...');
    const caseId = await Case.create({ 
      ...caseData, 
      case_number, 
      client_id, 
      user_id: userId 
    });
    console.log('Case created with ID:', caseId);
    
    // If a hearing date is provided during case creation, create the first hearing
    if (hearing_date && hearing_date !== '') {
      console.log('Creating initial hearing for date:', hearing_date);
      await Hearing.create({
        case_id: caseId,
        hearing_date: hearing_date,
        stage: 'First Hearing / Registration',
        notes: 'Initial hearing scheduled at case creation.'
      });
      console.log('Initial hearing created');
    }

    console.log('--- CREATE CASE SUCCESS ---');
    res.status(201).json({ 
      id: caseId, 
      client_id, 
      case_number, 
      ...caseData,
      message: 'Case registered successfully' 
    });
  } catch (error) {
    console.error('--- CREATE CASE ERROR ---');
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A case with this number already exists.' });
    }
    res.status(500).json({ 
      message: 'Failed to register case: ' + error.message,
      debug: {
        code: error.code,
        sqlState: error.sqlState
      }
    });
  }
};

exports.updateCase = async (req, res) => {
  try {
    await Case.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Case updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    await Case.delete(req.params.id, req.user.id);
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
