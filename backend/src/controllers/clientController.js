const Client = require('../models/clientModel');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll(req.user.id);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id, req.user.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const clientId = await Client.create({ 
      user_id: req.user.id, 
      name, 
      phone, 
      email, 
      address 
    });

    if (req.file) {
      try {
        // Normalize path for web (replace backslashes with forward slashes)
        const normalizedPath = req.file.path.replace(/\\/g, '/');

        await Client.addDocument({
          client_id: clientId,
          file_name: req.file.originalname,
          file_path: normalizedPath,
          file_type: req.file.mimetype,
          file_size: req.file.size,
          category: 'ID Proof',
          description: 'Initial document uploaded during client creation'
        });
      } catch (docError) {
        console.error('ERROR ADDING INITIAL DOCUMENT:', docError);
        return res.status(201).json({ 
          id: clientId, 
          ...req.body, 
          documentUploaded: false,
          warning: 'Client created but document upload failed' 
        });
      }
    }

    res.status(201).json({ id: clientId, ...req.body, documentUploaded: !!req.file });
  } catch (error) {
    console.error('CREATE CLIENT ERROR:', error);
    res.status(500).json({ message: error.message || 'Failed to create client' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { name } = req.body;
    if (name === '') {
      return res.status(400).json({ message: 'Client name cannot be empty' });
    }

    await Client.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('UPDATE CLIENT ERROR:', error);
    res.status(500).json({ message: error.message || 'Failed to update client' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id, req.user.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('DELETE CLIENT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Verify client ownership
    const client = await Client.findById(req.params.id, req.user.id);
    if (!client) {
      return res.status(403).json({ message: 'Access denied. You do not own this client.' });
    }

    const { category, description } = req.body;
    const normalizedPath = req.file.path.replace(/\\/g, '/');

    const docId = await Client.addDocument({
      client_id: req.params.id,
      file_name: req.file.originalname,
      file_path: normalizedPath,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      category: category || 'General',
      description: description || ''
    });

    res.status(201).json({ id: docId, message: 'Document uploaded successfully' });
  } catch (error) {
    console.error('UPLOAD DOCUMENT ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getClientDocuments = async (req, res) => {
  try {
    // Verify client ownership
    const client = await Client.findById(req.params.id, req.user.id);
    if (!client) {
      return res.status(403).json({ message: 'Access denied. You do not own this client.' });
    }

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

    // Verify client ownership through document's client_id
    const client = await Client.findById(doc.client_id, req.user.id);
    if (!client) {
      return res.status(403).json({ message: 'Access denied. You do not own this client.' });
    }

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
