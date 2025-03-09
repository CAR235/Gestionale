const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all team members
router.get('/', (req, res) => {
  db.all('SELECT * FROM team_members ORDER BY name ASC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse skills field for each team member
    const processedRows = rows.map(row => {
      try {
        return {
          ...row,
          skills: row.skills ? JSON.parse(row.skills) : []
        };
      } catch (e) {
        return {
          ...row,
          skills: []
        };
      }
    });
    res.json(processedRows);
  });
});

// Create a new team member
router.post('/', (req, res) => {
  const { name, email, role, skills, hourly_rate } = req.body;
  const skillsJson = JSON.stringify(skills || []);
  db.run(
    'INSERT INTO team_members (name, email, role, skills, hourly_rate) VALUES (?, ?, ?, ?, ?)',
    [name, email, role, skillsJson, hourly_rate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a team member
router.put('/:id', (req, res) => {
  const { name, email, role, skills, hourly_rate, availability_status } = req.body;
  const skillsJson = JSON.stringify(skills || []);
  db.run(
    'UPDATE team_members SET name = ?, email = ?, role = ?, skills = ?, hourly_rate = ?, availability_status = ? WHERE id = ?',
    [name, email, role, skillsJson, hourly_rate, availability_status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team member has any associated tasks or time entries
    const tasksResponse = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE assigned_to = ?', [id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (tasksResponse.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team member with assigned tasks' 
      });
    }

    // If no associated tasks, proceed with deletion
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM team_members WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        resolve(this);
      });
    });

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Error deleting team member' });
  }
});

// Get team member availability
router.get('/availability', (req, res) => {
  const query = `
    SELECT 
      tm.*, 
      COUNT(t.id) as assigned_tasks,
      SUM(CASE WHEN t.status != 'completed' THEN 1 ELSE 0 END) as pending_tasks
    FROM team_members tm
    LEFT JOIN tasks t ON t.assigned_to = tm.id
    GROUP BY tm.id
    ORDER BY tm.name ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;