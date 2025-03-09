const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all time entries
router.get('/', (req, res) => {
  const query = `
    SELECT 
      te.*, 
      p.name as project_name,
      t.title as task_name
    FROM time_entries te
    LEFT JOIN projects p ON te.project_id = p.id
    LEFT JOIN tasks t ON te.task_id = t.id
    ORDER BY te.start_time DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start a new time entry
router.post('/start', (req, res) => {
  const { project_id, task_id, start_time } = req.body;

  // First, check if there's any active timer
  db.get('SELECT * FROM time_entries WHERE end_time IS NULL', [], (err, activeTimer) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (activeTimer) {
      res.status(400).json({ message: 'There is already an active timer' });
      return;
    }

    // If no active timer, create a new one
    db.run(
      'INSERT INTO time_entries (project_id, task_id, start_time) VALUES (?, ?, ?)',
      [project_id, task_id, start_time],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Get the created entry with project and task names
        db.get(
          `SELECT te.*, p.name as project_name, t.title as task_name 
           FROM time_entries te
           LEFT JOIN projects p ON te.project_id = p.id
           LEFT JOIN tasks t ON te.task_id = t.id
           WHERE te.id = ?`,
          [this.lastID],
          (err, row) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json(row);
          }
        );
      }
    );
  });
});

// Stop a time entry
router.put('/:id/stop', (req, res) => {
  const end_time = new Date().toISOString();
  
  db.get('SELECT start_time FROM time_entries WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ message: 'Time entry not found' });
      return;
    }

    const start = new Date(row.start_time);
    const end = new Date(end_time);
    const duration = Math.round((end - start) / (1000 * 60)); // Duration in minutes

    db.run(
      'UPDATE time_entries SET end_time = ?, duration = ? WHERE id = ?',
      [end_time, duration, req.params.id],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Timer stopped successfully' });
      }
    );
  });
});

// Create a new time entry
router.post('/', (req, res) => {
  const { project_id, task_id, description, start_time, end_time } = req.body;
  
  const start = new Date(start_time);
  const end = new Date(end_time);
  const duration = Math.round((end - start) / (1000 * 60)); // Duration in minutes

  db.run(
    'INSERT INTO time_entries (project_id, task_id, description, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [project_id, task_id, description, start_time, end_time, duration],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a time entry
router.put('/:id', (req, res) => {
  const { project_id, task_id, description, start_time, end_time } = req.body;
  
  const start = new Date(start_time);
  const end = new Date(end_time);
  const duration = Math.round((end - start) / (1000 * 60)); // Duration in minutes

  db.run(
    'UPDATE time_entries SET project_id = ?, task_id = ?, description = ?, start_time = ?, end_time = ?, duration = ? WHERE id = ?',
    [project_id, task_id, description, start_time, end_time, duration, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a time entry
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM time_entries WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Time entry deleted successfully' });
  });
});

module.exports = router;