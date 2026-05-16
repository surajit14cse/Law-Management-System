const Client = require('../models/clientModel');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const clientId = await Client.create({ name, phone, email, address });

    if (req.file) {
      await Client.addDocument({
        client_id: clientId,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        category: 'ID Proof', // Default for initial upload
        description: 'Initial document uploaded during client creation'
      });
    }

    res.status(201).json({ id: clientId, ...req.body, documentUploaded: !!req.file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    await Client.update(req.params.id, req.body);
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { category, description } = req.body;

    const docId = await Client.addDocument({
      client_id: req.params.id,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      category: category || 'General',
      description: description || ''
    });

    res.status(201).json({ id: docId, message: 'Document uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientDocuments = async (req, res) => {
  try {
    const documents = await Client.getDocuments(req.params.id);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Client.getDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Delete file from filesystem
    const fs = require('fs');
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await Client.deleteDocument(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
