const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', upload.single('document'), clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Document routes
router.post('/:id/documents', upload.single('document'), clientController.uploadDocument);
router.get('/:id/documents', clientController.getClientDocuments);
router.delete('/documents/:id', clientController.deleteDocument);

module.exports = router;
