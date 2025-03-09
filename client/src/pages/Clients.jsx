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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useWebSocket } from '../contexts/WebSocketContext';
import { API_BASE_URL } from '../config';

function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { onUpdate } = useWebSocket();

  useEffect(() => {
    fetchClients();

    const removeClientCreated = onUpdate('clientCreated', (newClient) => {
      setClients(prevClients => [...prevClients, newClient]);
    });

    const removeClientUpdated = onUpdate('clientUpdated', (updatedClient) => {
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === updatedClient.id ? updatedClient : client
        )
      );
    });

    const removeClientDeleted = onUpdate('clientDeleted', ({ id }) => {
      setClients(prevClients =>
        prevClients.filter(client => client.id !== id)
      );
    });

    return () => {
      removeClientCreated();
      removeClientUpdated();
      removeClientDeleted();
    };
  }, [onUpdate]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clients`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showSnackbar('Errore nel caricamento dei clienti', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`${API_BASE_URL}/api/clients/${editingClient.id}`, formData);
        showSnackbar('Cliente aggiornato con successo');
      } else {
        await axios.post(`${API_BASE_URL}/api/clients`, formData);
        showSnackbar('Cliente aggiunto con successo');
      }
      fetchClients();
      handleClose();
    } catch (error) {
      console.error('Error saving client:', error);
      showSnackbar('Errore nel salvare il cliente', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/clients/${id}`);
        showSnackbar('Cliente eliminato con successo');
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        showSnackbar(error.response?.data?.message || 'Errore durante l\'eliminazione del cliente', 'error');
      }
    }
  };

  const handleOpen = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '' });
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
        Clienti
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Aggiungi Cliente
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefono</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingClient ? 'Modifica Cliente' : 'Aggiungi Cliente'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Telefono"
            type="tel"
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? 'Aggiorna' : 'Aggiungi'}
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

export default Clients;