import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
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
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    skills: [],
    hourly_rate: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const roles = ['Direttore Creativo', 'Designer Brand', 'Social Media Manager', 'Direttore Artistico', 'Designer Grafico'];
  const skillsList = [
    'Identità del Brand', 'Linee Guida Brand', 'Strategia Social Media', 'Design Visivo',
    'Design del Logo', 'Tipografia', 'Teoria del Colore', 'Marketing Digitale',
    'Creazione Contenuti', 'Adobe Creative Suite', 'Analisi Social Media', 'Strategia Marketing'
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      showSnackbar('Errore nel caricamento dei membri del team', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await axios.put(`http://localhost:3000/api/team-members/${editingMember.id}`, formData);
        showSnackbar('Membro del team aggiornato con successo');
      } else {
        await axios.post('http://localhost:3000/api/team-members', formData);
        showSnackbar('Membro del team aggiunto con successo');
      }
      fetchTeamMembers();
      handleClose();
    } catch (error) {
      console.error('Error saving team member:', error);
      showSnackbar('Errore nel salvare il membro del team', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo membro del team?')) {
      try {
        await axios.delete(`http://localhost:3000/api/team-members/${id}`);
        showSnackbar('Membro del team eliminato con successo');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        showSnackbar(error.response?.data?.message || 'Errore nell\'eliminazione del membro del team', 'error');
      }
    }
  };

  const handleOpen = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role: member.role,
        email: member.email,
        skills: member.skills || [],
        hourly_rate: member.hourly_rate || ''
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        email: '',
        skills: [],
        hourly_rate: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      email: '',
      skills: [],
      hourly_rate: ''
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
      <Typography variant="h4" gutterBottom>Membri del Team</Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Aggiungi Membro
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Ruolo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Competenze</TableCell>
              <TableCell>Tariffa Oraria</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.skills ? member.skills.join(', ') : ''}</TableCell>
                <TableCell>€{member.hourly_rate}/h</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(member)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(member.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingMember ? 'Modifica Membro' : 'Aggiungi Membro'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Ruolo</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Ruolo"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Competenze</InputLabel>
            <Select
              multiple
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              label="Competenze"
            >
              {skillsList.map((skill) => (
                <MenuItem key={skill} value={skill}>{skill}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Tariffa Oraria"
            type="number"
            fullWidth
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
            InputProps={{
              startAdornment: '€',
              endAdornment: '/h'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? 'Aggiorna' : 'Aggiungi'}
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

export default TeamManagement;