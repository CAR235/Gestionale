import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
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
  Alert,
  Box,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    amount: '',
    due_date: '',
    status: 'pending',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const statuses = ['pending', 'paid', 'overdue', 'cancelled'];

  useEffect(() => {
    fetchInvoices();
    fetchProjects();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showSnackbar('Errore nel caricamento delle fatture', 'error');
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
      if (editingInvoice) {
        await axios.put(`http://localhost:3000/api/invoices/${editingInvoice.id}`, formData);
        showSnackbar('Fattura aggiornata con successo');
      } else {
        await axios.post('http://localhost:3000/api/invoices', formData);
        showSnackbar('Fattura creata con successo');
      }
      fetchInvoices();
      handleClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      showSnackbar('Errore nel salvare la fattura', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questa fattura?')) {
      try {
        await axios.delete(`http://localhost:3000/api/invoices/${id}`);
        showSnackbar('Fattura eliminata con successo');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        showSnackbar('Errore nell\'eliminazione della fattura', 'error');
      }
    }
  };

  const handleOpen = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        project_id: invoice.project_id,
        amount: invoice.amount,
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        status: invoice.status,
        notes: invoice.notes || ''
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        project_id: '',
        amount: '',
        due_date: '',
        status: 'pending',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInvoice(null);
    setFormData({
      project_id: '',
      amount: '',
      due_date: '',
      status: 'pending',
      notes: ''
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'paid':
        return 'Pagata';
      case 'pending':
        return 'In Attesa';
      case 'overdue':
        return 'Scaduta';
      case 'cancelled':
        return 'Annullata';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Fatture
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Crea Fattura
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Progetto</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Importo</TableCell>
              <TableCell>Data Scadenza</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.project_name}</TableCell>
                <TableCell>{invoice.client_name}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : ''}
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatStatus(invoice.status)}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{invoice.notes}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(invoice)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(invoice.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingInvoice ? 'Modifica Fattura' : 'Crea Fattura'}
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

          <TextField
            margin="dense"
            label="Importo"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Data Scadenza"
            type="date"
            fullWidth
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Stato</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Stato"
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatus(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInvoice ? 'Aggiorna' : 'Crea'}
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

export default Invoices;