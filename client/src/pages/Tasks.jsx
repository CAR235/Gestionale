import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const priorities = ['low', 'medium', 'high'];
  const statuses = ['pending', 'in_progress', 'completed'];

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showSnackbar('Errore nel caricamento delle attività', 'error');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showSnackbar('Errore nel caricamento dei progetti', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`http://localhost:3000/api/tasks/${editingTask.id}`, formData);
        showSnackbar('Task updated successfully');
      } else {
        await axios.post('http://localhost:3000/api/tasks', formData);
        showSnackbar('Task added successfully');
      }
      fetchTasks();
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      showSnackbar('Error saving task', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
      try {
        // First check if task has associated time entries
        const timeEntriesResponse = await axios.get('http://localhost:3000/api/time-entries');
        const taskTimeEntries = timeEntriesResponse.data.filter(entry => entry.task_id === id);

        if (taskTimeEntries.length > 0) {
          showSnackbar('Non è possibile eliminare questa attività perché ha delle registrazioni di tempo associato.', 'error');
          return;
        }

        const response = await axios.delete(`http://localhost:3000/api/tasks/${id}`);
        if (response.status === 200) {
          showSnackbar('Attività eliminata con successo');
          fetchTasks();
        } else {
          throw new Error('Errore durante l\'eliminazione dell\'attività');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        showSnackbar(error.response?.data?.message || 'Errore durante l\'eliminazione dell\'attività', 'error');
      }
    }
  };

  const handleOpen = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        project_id: task.project_id,
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        project_id: '',
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        status: 'pending',
        due_date: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setFormData({
      project_id: '',
      title: '',
      description: '',
      assigned_to: '',
      priority: 'medium',
      status: 'pending',
      due_date: ''
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'inherit';
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Attività
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Aggiungi Attività
      </Button>

      <TableContainer 
        component={Paper}
        sx={{
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 800, sm: 'auto' }
          },
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 }
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Progetto</TableCell>
              <TableCell>Titolo</TableCell>
              <TableCell>Descrizione</TableCell>
              <TableCell>Assegnato a</TableCell>
              <TableCell>Priorità</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Data di Scadenza</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.project_name}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell sx={{ maxWidth: { xs: 150, sm: 200 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.description}
                </TableCell>
                <TableCell>{task.assigned_to}</TableCell>
                <TableCell>
                  <Typography sx={{ color: getPriorityColor(task.priority) }}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      textTransform: 'capitalize',
                      color: task.status === 'completed' ? 'success.main' : 'inherit'
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(task)} size="small" sx={{ mr: 0.5 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(task.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Modifica Attività' : 'Aggiungi Attività'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Progetto</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              label="Progetto"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Titolo"
            type="text"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descrizione"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Assegnato a"
            type="text"
            fullWidth
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priorità</InputLabel>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              label="Priorità"
            >
              {priorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority === 'low' ? 'Bassa' :
                   priority === 'medium' ? 'Media' : 'Alta'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Stato</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Stato"
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'pending' ? 'In Attesa' :
                   status === 'in_progress' ? 'In Corso' : 'Completata'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Data di Scadenza"
            type="date"
            fullWidth
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Aggiorna' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Tasks;