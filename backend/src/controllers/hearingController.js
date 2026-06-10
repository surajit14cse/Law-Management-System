const Hearing = require('../models/hearingModel');
const Case = require('../models/caseModel');

exports.getHearingsByDate = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const hearings = await Hearing.findByDate(date, req.user.id);
    res.json(hearings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHearing = async (req, res) => {
  try {
    const { case_id } = req.body;
    
    // Verify case ownership
    const caseData = await Case.findById(case_id, req.user.id);
    if (!caseData) {
      return res.status(403).json({ message: 'Access denied. You do not own this case.' });
    }

    const hearingId = await Hearing.create(req.body);
    res.status(201).json({ id: hearingId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHearingOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, next_hearing_date, stage, case_id } = req.body;
    
    // Verify hearing belongs to user
    const hearing = await Hearing.findById(id, req.user.id);
    if (!hearing) {
      return res.status(404).json({ message: 'Hearing not found or access denied' });
    }

    await Hearing.updateOutcome(id, req.user.id, outcome, next_hearing_date, stage);
    
    // If next_hearing_date is provided, automatically create a new hearing entry
    if (next_hearing_date) {
      await Hearing.create({
        case_id: hearing.case_id,
        hearing_date: next_hearing_date,
        stage: stage || 'Next Hearing',
        notes: `Automatically scheduled from hearing on ${new Date().toISOString().split('T')[0]}`
      });
    }

    res.json({ message: 'Hearing outcome updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getHearingsByCaseId = async (req, res) => {
  try {
    const hearings = await Hearing.findByCaseId(req.params.caseId, req.user.id);
    res.json(hearings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
