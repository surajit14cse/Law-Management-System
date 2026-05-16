const Case = require('../models/caseModel');
const Hearing = require('../models/hearingModel');

exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.findAll();
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    const { hearing_date, ...caseData } = req.body;
    const caseId = await Case.create(caseData);
    
    // If a hearing date is provided during case creation, create the first hearing
    if (hearing_date) {
      await Hearing.create({
        case_id: caseId,
        hearing_date: hearing_date,
        stage: 'First Hearing / Registration',
        notes: 'Initial hearing scheduled at case creation.'
      });
    }

    res.status(201).json({ id: caseId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCase = async (req, res) => {
  try {
    await Case.update(req.params.id, req.body);
    res.json({ message: 'Case updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    await Case.delete(req.params.id);
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
