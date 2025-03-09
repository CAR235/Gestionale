const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all calendar events
router.get('/', (req, res) => {
  const query = `
    SELECT ce.*, p.name as project_name, tm.name as creator_name
    FROM calendar_events ce
    LEFT JOIN projects p ON ce.project_id = p.id
    LEFT JOIN team_members tm ON ce.created_by = tm.id
    ORDER BY ce.start_time ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new calendar event
router.post('/', (req, res) => {
  const { title, description, start_time, end_time, event_type, project_id, created_by } = req.body;
  db.run(
    'INSERT INTO calendar_events (title, description, start_time, end_time, event_type, project_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, start_time, end_time, event_type, project_id, created_by],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a calendar event
router.put('/:id', (req, res) => {
  const { title, description, start_time, end_time, event_type, project_id, created_by } = req.body;
  db.run(
    'UPDATE calendar_events SET title = ?, description = ?, start_time = ?, end_time = ?, event_type = ?, project_id = ?, created_by = ? WHERE id = ?',
    [title, description, start_time, end_time, event_type, project_id, created_by, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a calendar event
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM calendar_events WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Calendar event deleted successfully' });
  });
});

module.exports = router;