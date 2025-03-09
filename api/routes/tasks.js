const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tasks
router.get('/', (req, res) => {
  const query = `
    SELECT t.*, p.name as project_name 
    FROM tasks t 
    LEFT JOIN projects p ON t.project_id = p.id 
    ORDER BY t.due_date ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new task
router.post('/', (req, res) => {
  const { project_id, title, description, assigned_to, priority, status, due_date } = req.body;
  db.run(
    'INSERT INTO tasks (project_id, title, description, assigned_to, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [project_id, title, description, assigned_to, priority, status, due_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

// Update a task
router.put('/:id', (req, res) => {
  const { project_id, title, description, assigned_to, priority, status, due_date } = req.body;
  db.run(
    'UPDATE tasks SET project_id = ?, title = ?, description = ?, assigned_to = ?, priority = ?, status = ?, due_date = ? WHERE id = ?',
    [project_id, title, description, assigned_to, priority, status, due_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task has associated time entries
    const timeEntriesResponse = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM time_entries WHERE task_id = ?', [id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (timeEntriesResponse.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete task with associated time entries' 
      });
    }

    // If no associated time entries, proceed with deletion
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        resolve(this);
      });
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;