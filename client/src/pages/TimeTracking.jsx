import { useState, useEffect } from 'react';
import {
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import axios from 'axios';

function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    description: '',
    start_time: '',
    end_time: '',
    duration: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/time-entries');
      setTimeEntries(response.data);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      showSnackbar('Errore nel caricamento delle registrazioni', 'error');
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

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showSnackbar('Errore nel caricamento delle attività', 'error');
    }
  };

  const handleStartTimer = async (projectId, taskId) => {
    try {
      const response = await axios.post('http://localhost:3000/api/time-entries/start', {
        project_id: projectId,
        task_id: taskId,
        start_time: new Date().toISOString()
      });
      setActiveTimer(response.data);
      showSnackbar('Timer avviato con successo');
    } catch (error) {
      console.error('Error starting timer:', error);
      showSnackbar('Errore nell\'avvio del timer', 'error');
    }
  };

  const handleStopTimer = async () => {
    try {
      await axios.put(`http://localhost:3000/api/time-entries/${activeTimer.id}/stop`);
      setActiveTimer(null);
      fetchTimeEntries();
      showSnackbar('Timer fermato con successo');
    } catch (error) {
      console.error('Error stopping timer:', error);
      showSnackbar('Errore nell\'arresto del timer', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await axios.put(`http://localhost:3000/api/time-entries/${editingEntry.id}`, formData);
        showSnackbar('Registrazione aggiornata con successo');
      } else {
        await axios.post('http://localhost:3000/api/time-entries', formData);
        showSnackbar('Registrazione aggiunta con successo');
      }
      fetchTimeEntries();
      handleClose();
    } catch (error) {
      console.error('Error saving time entry:', error);
      showSnackbar('Errore nel salvare la registrazione', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa registrazione?')) {
      try {
        await axios.delete(`http://localhost:3000/api/time-entries/${id}`);
        showSnackbar('Registrazione eliminata con successo');
        fetchTimeEntries();
      } catch (error) {
        console.error('Error deleting time entry:', error);
        showSnackbar('Errore nell\'eliminazione della registrazione', 'error');
      }
    }
  };

  const handleOpen = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        project_id: entry.project_id,
        task_id: entry.task_id,
        description: entry.description || '',
        start_time: entry.start_time ? entry.start_time.split('.')[0] : '',
        end_time: entry.end_time ? entry.end_time.split('.')[0] : '',
        duration: entry.duration || 0
      });
    } else {
      setEditingEntry(null);
      setFormData({
        project_id: '',
        task_id: '',
        description: '',
        start_time: '',
        end_time: '',
        duration: 0
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingEntry(null);
    setFormData({
      project_id: '',
      task_id: '',
      description: '',
      start_time: '',
      end_time: '',
      duration: 0
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Monitoraggio Tempo
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Aggiungi Registrazione
        </Button>

        {activeTimer && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              Timer Attivo: {activeTimer.project_name} - {activeTimer.task_name}
            </Typography>
            <IconButton
              color="error"
              onClick={handleStopTimer}
            >
              <StopIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Progetto</TableCell>
              <TableCell>Attività</TableCell>
              <TableCell>Descrizione</TableCell>
              <TableCell>Ora Inizio</TableCell>
              <TableCell>Ora Fine</TableCell>
              <TableCell>Durata</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.project_name}</TableCell>
                <TableCell>{entry.task_name}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  {new Date(entry.start_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  {entry.end_time ? new Date(entry.end_time).toLocaleString() : '-'}
                </TableCell>
                <TableCell>{formatDuration(entry.duration)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(entry)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(entry.id)}>
                    <DeleteIcon />
                  </IconButton>
                  {!activeTimer && !entry.end_time && (
                    <IconButton
                      color="primary"
                      onClick={() => handleStartTimer(entry.project_id, entry.task_id)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEntry ? 'Modifica Registrazione' : 'Aggiungi Registrazione'}
        </DialogTitle>
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

          <FormControl fullWidth margin="dense">
            <InputLabel>Attività</InputLabel>
            <Select
              value={formData.task_id}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
              label="Attività"
            >
              {tasks
                .filter(task => !formData.project_id || task.project_id === formData.project_id)
                .map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Descrizione"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Ora di Inizio"
            type="datetime-local"
            fullWidth
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            margin="dense"
            label="Ora di Fine"
            type="datetime-local"
            fullWidth
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEntry ? 'Aggiorna' : 'Aggiungi'}
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

export default TimeTracking;