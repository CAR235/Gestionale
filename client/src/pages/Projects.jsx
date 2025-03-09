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
  InputLabel,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Fab from '@mui/material/Fab';
import axios from 'axios';
import FileManager from '../components/FileManager';
import Chat from '../components/Chat';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [fileManagerDialogOpen, setFileManagerDialogOpen] = useState(false);
  const [selectedProjectForFiles, setSelectedProjectForFiles] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    description: '',
    status: 'brief',
    due_date: ''
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 1 && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  };

  const handleChatOpen = () => {
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/projects'),
        axios.get('http://localhost:3000/api/tasks')
      ]);
      
      const projectsWithTaskCount = projectsResponse.data.map(project => ({
        ...project,
        taskCount: tasksResponse.data.filter(task => task.project_id === project.id).length
      }));
      
      setProjects(projectsWithTaskCount);
      if (projectsWithTaskCount.length > 0 && selectedTab === 1) {
        setSelectedProject(projectsWithTaskCount[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showSnackbar('Errore nel caricamento dei progetti', 'error');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showSnackbar('Errore nel caricamento dei clienti', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata.')) {
      try {
        // First check if project has associated tasks
        const tasksResponse = await axios.get('http://localhost:3000/api/tasks');
        const projectTasks = tasksResponse.data.filter(task => task.project_id === id);

        if (projectTasks.length > 0) {
          showSnackbar('Non è possibile eliminare questo progetto perché ha delle attività associate.', 'error');
          return;
        }

        const response = await axios.delete(`http://localhost:3000/api/projects/${id}`);
        if (response.status === 200) {
          showSnackbar('Progetto eliminato con successo');
          fetchProjects();
        } else {
          throw new Error('Errore durante l\'eliminazione del progetto');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        showSnackbar(error.response?.data?.message || 'Errore durante l\'eliminazione del progetto', 'error');
      }
    }
  };

  const handleOpen = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        client_id: project.client_id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        due_date: project.due_date ? project.due_date.split('T')[0] : ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        client_id: '',
        name: '',
        description: '',
        status: 'brief',
        due_date: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
    setFormData({
      client_id: '',
      name: '',
      description: '',
      status: 'brief',
      due_date: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id || !formData.name) {
      showSnackbar('Cliente e Nome sono campi obbligatori', 'error');
      return;
    }
    try {
      if (editingProject) {
        const response = await axios.put(`http://localhost:3000/api/projects/${editingProject.id}`, formData);
        if (response.status === 200) {
          showSnackbar('Progetto aggiornato con successo');
          fetchProjects();
          handleClose();
        }
      } else {
        const response = await axios.post('http://localhost:3000/api/projects', formData);
        if (response.status === 200) {
          showSnackbar('Progetto creato con successo');
          fetchProjects();
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMessage = error.response?.data?.message || 'Errore nel salvare il progetto';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleOpenFileManager = (project) => {
    setSelectedProjectForFiles(project);
    setFileManagerDialogOpen(true);
  };

  const handleCloseFileManager = () => {
    setFileManagerDialogOpen(false);
    setSelectedProjectForFiles(null);
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
        Progetti
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Aggiungi Progetto
      </Button>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Dettagli" />
          <Tab label="File" />
        </Tabs>
      </Box>

      {selectedTab === 0 ? (
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
                <TableCell>Cliente</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Descrizione</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell>Data di Scadenza</TableCell>
                <TableCell>Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.client_name}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell sx={{ maxWidth: { xs: 150, sm: 200 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {project.description}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        textTransform: 'capitalize',
                        color: project.status === 'delivery' ? 'success.main' : 'inherit'
                      }}
                    >
                      {project.status === 'brief' ? 'Briefing' :
                       project.status === 'concept' ? 'Concetto' :
                       project.status === 'review' ? 'Revisione' : 'Consegna'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : ''}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(project)} size="small" sx={{ mr: 0.5 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenFileManager(project)} size="small" sx={{ mr: 0.5 }}>
                      <FolderIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(project.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <FileManager projectId={selectedProject?.id} />
      )}

      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleChatOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <ChatIcon />
      </Fab>

      <Dialog
        open={chatOpen}
        onClose={handleChatClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh'
          }
        }}
      >
        <DialogTitle>
          Chat del Progetto
          <IconButton
            aria-label="close"
            onClick={handleChatClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Chat projectId={selectedProject?.id} type="project" />
        </DialogContent>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Modifica Progetto' : 'Aggiungi Progetto'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              label="Cliente"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Nome"
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Stato</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Stato"
            >
              <MenuItem value="brief">Briefing</MenuItem>
              <MenuItem value="concept">Concetto</MenuItem>
              <MenuItem value="review">Revisione</MenuItem>
              <MenuItem value="delivery">Consegna</MenuItem>
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
            {editingProject ? 'Aggiorna' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={fileManagerDialogOpen}
        onClose={handleCloseFileManager}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          File del Progetto: {selectedProjectForFiles?.name}
        </DialogTitle>
        <DialogContent>
          <FileManager projectId={selectedProjectForFiles?.id} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileManager}>Chiudi</Button>
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

export default Projects;