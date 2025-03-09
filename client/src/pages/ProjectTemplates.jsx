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
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

function ProjectTemplates() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    structure: {
      tasks: [
        { title: '', description: '', priority: 'medium' }
      ]
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/project-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showSnackbar('Errore nel caricamento dei modelli', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await axios.put(`http://localhost:3000/api/project-templates/${editingTemplate.id}`, formData);
        showSnackbar('Modello aggiornato con successo');
      } else {
        await axios.post('http://localhost:3000/api/project-templates', formData);
        showSnackbar('Modello creato con successo');
      }
      fetchTemplates();
      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
      showSnackbar('Errore nel salvare il modello', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo modello?')) {
      try {
        await axios.delete(`http://localhost:3000/api/project-templates/${id}`);
        showSnackbar('Modello eliminato con successo');
        fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
        showSnackbar('Errore durante l\'eliminazione del modello', 'error');
      }
    }
  };

  const handleOpen = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        structure: typeof template.structure === 'string' 
          ? JSON.parse(template.structure)
          : template.structure
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        structure: {
          tasks: [
            { title: '', description: '', priority: 'medium' }
          ]
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      structure: {
        tasks: [
          { title: '', description: '', priority: 'medium' }
        ]
      }
    });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      structure: {
        ...formData.structure,
        tasks: [
          ...formData.structure.tasks,
          { title: '', description: '', priority: 'medium' }
        ]
      }
    });
  };

  const removeTask = (index) => {
    const newTasks = formData.structure.tasks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      structure: {
        ...formData.structure,
        tasks: newTasks
      }
    });
  };

  const updateTask = (index, field, value) => {
    const newTasks = formData.structure.tasks.map((task, i) => {
      if (i === index) {
        return { ...task, [field]: value };
      }
      return task;
    });

    setFormData({
      ...formData,
      structure: {
        ...formData.structure,
        tasks: newTasks
      }
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Modelli di Progetto
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 3 }}
      >
        Crea Nuovo Modello
      </Button>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(218, 219, 0, 0.05) 0%, rgba(0, 219, 157, 0.05) 100%)'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Attività Predefinite:
                </Typography>
                {JSON.parse(template.structure).tasks.map((task, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Chip
                      label={task.title}
                      size="small"
                      sx={{
                        mr: 1,
                        backgroundColor: task.priority === 'high' ? 'error.dark' :
                                       task.priority === 'medium' ? 'warning.dark' : 'success.dark'
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(template)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(template.id)} size="small">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Modifica Modello' : 'Crea Nuovo Modello'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome del Modello"
            type="text"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Attività Predefinite
          </Typography>

          {formData.structure.tasks.map((task, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Titolo Attività"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Priorità"
                    value={task.priority}
                    onChange={(e) => updateTask(index, 'priority', e.target.value)}
                    SelectProps={{
                      native: true
                    }}
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrizione Attività"
                    multiline
                    rows={2}
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeTask(index)}
                  disabled={formData.structure.tasks.length === 1}
                >
                  Rimuovi
                </Button>
              </Box>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addTask}
            sx={{ mt: 1 }}
          >
            Aggiungi Attività
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTemplate ? 'Aggiorna' : 'Crea'}
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

export default ProjectTemplates;