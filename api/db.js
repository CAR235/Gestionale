const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database(
  path.join(__dirname, '..', 'agency.db'),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the SQLite database.');
      initializeDatabase();
    }
  }
);

// Initialize database tables if they don't exist
function initializeDatabase() {
  db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create clients table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)');

    // Create projects table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'brief',
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)');

    // Create tasks table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to INTEGER,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
      FOREIGN KEY (assigned_to) REFERENCES team_members (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)');
    db.run('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');

    // Create team_members table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT,
      skills TEXT,
      hourly_rate DECIMAL(10,2),
      availability_status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email)');

    // Create time_entries table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      task_id INTEGER,
      member_id INTEGER,
      start_time DATETIME,
      end_time DATETIME,
      description TEXT,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE RESTRICT,
      FOREIGN KEY (member_id) REFERENCES team_members (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_time_entries_member_id ON time_entries(member_id)');

    // Create files table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER,
      type TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id)');

    // Create project_templates table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS project_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      structure TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES team_members (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_project_templates_name ON project_templates(name)');

    // Create calendar_events table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      event_type TEXT DEFAULT 'meeting',
      project_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES team_members (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON calendar_events(project_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by)');

    // Create invoices table with indexes
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      client_id INTEGER,
      invoice_number TEXT UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date DATETIME,
      payment_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE RESTRICT,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT
    )`);
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)');

    console.log('Database schema initialized successfully.');
  });
}

module.exports = db;