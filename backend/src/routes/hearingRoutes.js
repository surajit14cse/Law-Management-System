const express = require('express');
const router = express.Router();
const hearingController = require('../controllers/hearingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/date', hearingController.getHearingsByDate);
router.get('/case/:caseId', hearingController.getHearingsByCaseId);
router.post('/', hearingController.createHearing);
router.put('/:id/outcome', hearingController.updateHearingOutcome);

module.exports = router;
