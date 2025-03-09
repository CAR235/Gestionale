const express = require('express');
const router = express.Router();
const db = require('../db');
const { emitUpdate } = require('../websocket');

// Get all clients
router.get('/', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new client
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;
  db.run('INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const newClient = { id: this.lastID, name, email, phone };
      emitUpdate('clientCreated', newClient);
      res.json(newClient);
    });
});

// Update a client
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body;
  db.run(
    'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const updatedClient = { id: req.params.id, name, email, phone };
      emitUpdate('clientUpdated', updatedClient);
      res.json(updatedClient);
    }
  );
});

// Delete a client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // First check if client has any associated projects
  db.get('SELECT COUNT(*) as count FROM projects WHERE client_id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (result.count > 0) {
      res.status(400).json({ message: 'Cannot delete client with associated projects' });
      return;
    }

    // If no associated projects, proceed with deletion
    db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ message: 'Client not found' });
        return;
      }

      emitUpdate('clientDeleted', { id });
      res.json({ message: 'Client deleted successfully' });
    });
  });
});

module.exports = router;