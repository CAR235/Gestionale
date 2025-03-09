const express = require('express');
const router = express.Router();

// Import route handlers
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const timeEntryRoutes = require('./routes/timeEntries');
const fileRoutes = require('./routes/files');
const teamMemberRoutes = require('./routes/team_members');
const projectTemplateRoutes = require('./routes/project_templates');
const invoiceRoutes = require('./routes/invoices');
const calendarEventRoutes = require('./routes/calendar-events');

// Register routes
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/time-entries', timeEntryRoutes);
router.use('/files', fileRoutes);
router.use('/team-members', teamMemberRoutes);
router.use('/project-templates', projectTemplateRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/calendar-events', calendarEventRoutes);

module.exports = router;