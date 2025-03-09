const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all invoices
router.get('/', (req, res) => {
  const query = `
    SELECT i.*, p.name as project_name, c.name as client_name
    FROM invoices i
    LEFT JOIN projects p ON i.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    ORDER BY i.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get invoice by ID
router.get('/:id', (req, res) => {
  const query = `
    SELECT i.*, p.name as project_name, c.name as client_name,
           c.email as client_email, c.address as client_address
    FROM invoices i
    LEFT JOIN projects p ON i.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    WHERE i.id = ?
  `;
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create new invoice
router.post('/', (req, res) => {
  const {
    project_id,
    amount,
    due_date,
    status = 'pending',
    notes
  } = req.body;

  // Generate invoice number (simple implementation - you might want to make this more sophisticated)
  const invoiceNumber = `INV-${Date.now()}`;

  const query = `
    INSERT INTO invoices (
      project_id,
      invoice_number,
      amount,
      due_date,
      status,
      notes,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  db.run(
    query,
    [project_id, invoiceNumber, amount, due_date, status, notes],
    function(err) {
      if (err) {
        console.error('Error creating invoice:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, invoice_number: invoiceNumber });
    }
  );
});

// Update invoice
router.put('/:id', (req, res) => {
  const {
    amount,
    due_date,
    status,
    notes,
    payment_date
  } = req.body;

  const query = `
    UPDATE invoices
    SET amount = ?,
        due_date = ?,
        status = ?,
        notes = ?,
        payment_date = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [amount, due_date, status, notes, payment_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

// Delete invoice
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM invoices WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Invoice deleted successfully' });
  });
});

// Get overdue invoices
router.get('/status/overdue', (req, res) => {
  const query = `
    SELECT i.*, p.name as project_name, c.name as client_name,
           c.email as client_email
    FROM invoices i
    LEFT JOIN projects p ON i.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    WHERE i.status = 'pending'
    AND i.due_date < date('now')
    ORDER BY i.due_date ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get invoices by project
router.get('/project/:projectId', (req, res) => {
  const query = `
    SELECT i.*, p.name as project_name
    FROM invoices i
    LEFT JOIN projects p ON i.project_id = p.id
    WHERE i.project_id = ?
    ORDER BY i.created_at DESC
  `;
  
  db.all(query, [req.params.projectId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;