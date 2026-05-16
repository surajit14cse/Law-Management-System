const Hearing = require('../models/hearingModel');

exports.getHearingsByDate = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const hearings = await Hearing.findByDate(date);
    res.json(hearings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHearing = async (req, res) => {
  try {
    const hearingId = await Hearing.create(req.body);
    res.status(201).json({ id: hearingId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHearingOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, next_hearing_date, stage } = req.body;
    
    await Hearing.updateOutcome(id, outcome, next_hearing_date, stage);
    
    // If next_hearing_date is provided, automatically create a new hearing entry
    if (next_hearing_date) {
      const currentHearing = (await Hearing.findByCaseId(req.body.case_id))[0]; // This is simplified
      await Hearing.create({
        case_id: req.body.case_id,
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
    const hearings = await Hearing.findByCaseId(req.params.caseId);
    res.json(hearings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
