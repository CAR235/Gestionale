const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all projects
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, c.name as client_name 
    FROM projects p 
    LEFT JOIN clients c ON p.client_id = c.id 
    ORDER BY p.start_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new project
router.post('/', (req, res) => {
  const { client_id, name, description, status, due_date } = req.body;
  db.run(
    'INSERT INTO projects (client_id, name, description, status, due_date) VALUES (?, ?, ?, ?, ?)',
    [client_id, name, description, status, due_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a project
router.put('/:id', (req, res) => {
  const { client_id, name, description, status, due_date } = req.body;
  db.run(
    'UPDATE projects SET client_id = ?, name = ?, description = ?, status = ?, due_date = ? WHERE id = ?',
    [client_id, name, description, status, due_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project has associated tasks
    const tasksResponse = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE project_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (tasksResponse.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete project with associated tasks' 
      });
    }

    // If no associated tasks, proceed with deletion
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        resolve(this);
      });
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

module.exports = router;