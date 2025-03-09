const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all project templates
router.get('/', (req, res) => {
  const query = `
    SELECT pt.*, tm.name as creator_name
    FROM project_templates pt
    LEFT JOIN team_members tm ON pt.created_by = tm.id
    ORDER BY pt.name ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a specific template
router.get('/:id', (req, res) => {
  const query = `
    SELECT pt.*, tm.name as creator_name
    FROM project_templates pt
    LEFT JOIN team_members tm ON pt.created_by = tm.id
    WHERE pt.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Template not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new project template
router.post('/', (req, res) => {
  const { name, description, structure, created_by } = req.body;
  
  db.run(
    'INSERT INTO project_templates (name, description, structure, created_by) VALUES (?, ?, ?, ?)',
    [name, description, JSON.stringify(structure), created_by],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a project template
router.put('/:id', (req, res) => {
  const { name, description, structure } = req.body;
  
  db.run(
    'UPDATE project_templates SET name = ?, description = ?, structure = ? WHERE id = ?',
    [name, description, JSON.stringify(structure), req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a project template
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM project_templates WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Project template deleted successfully' });
  });
});

// Create a new project from template
router.post('/:id/create-project', async (req, res) => {
  const { client_id, name, description, due_date } = req.body;
  
  try {
    // Get the template
    const template = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM project_templates WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Create the project
    const projectResult = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO projects (client_id, name, description, status, due_date) VALUES (?, ?, ?, ?, ?)',
        [client_id, name, description, 'brief', due_date],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    // Create tasks from template structure
    const structure = JSON.parse(template.structure);
    if (structure.tasks) {
      for (const task of structure.tasks) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO tasks (project_id, title, description, priority, status) VALUES (?, ?, ?, ?, ?)',
            [projectResult, task.title, task.description, task.priority || 'medium', 'pending'],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }
    }

    res.json({ 
      message: 'Project created successfully from template',
      project_id: projectResult
    });
  } catch (error) {
    console.error('Error creating project from template:', error);
    res.status(500).json({ message: 'Error creating project from template' });
  }
});

module.exports = router;