import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  Menu,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

import { it } from 'date-fns/locale';

const locales = {
  'it': it
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Calendar() {
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'meeting',
    project_id: '',
    created_by: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const eventTypes = ['meeting', 'deadline', 'reminder'];

  useEffect(() => {
    fetchEvents();
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/calendar-events');
      const formattedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time)
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showSnackbar('Errore nel caricamento degli eventi', 'error');
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
      if (selectedEvent) {
        await axios.put(`http://localhost:3000/api/calendar-events/${selectedEvent.id}`, formData);
        showSnackbar('Evento aggiornato con successo');
      } else {
        await axios.post('http://localhost:3000/api/calendar-events', formData);
        showSnackbar('Evento creato con successo');
      }
      fetchEvents();
      handleClose();
    } catch (error) {
      console.error('Error saving event:', error);
      showSnackbar('Errore nel salvare l\'evento', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo evento?')) {
      try {
        await axios.delete(`http://localhost:3000/api/calendar-events/${id}`);
        showSnackbar('Evento eliminato con successo');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        showSnackbar('Errore nell\'eliminazione dell\'evento', 'error');
      }
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
      event_type: event.event_type,
      project_id: event.project_id || '',
      created_by: event.created_by || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      event_type: 'meeting',
      project_id: '',
      created_by: ''
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    switch (event.event_type) {
      case 'meeting':
        backgroundColor = '#4ECDC4';
        break;
      case 'deadline':
        backgroundColor = '#FF6B6B';
        break;
      case 'reminder':
        backgroundColor = '#FFE66D';
        break;
      default:
        break;
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: event.event_type === 'reminder' ? '#000' : '#fff',
        border: 'none',
        display: 'block'
      }
    };
  };

  const [contextMenu, setContextMenu] = useState({
    mouseX: null,
    mouseY: null
  });

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      mouseX: null,
      mouseY: null
    });
  };

  const handleCreateEventFromContextMenu = (slotInfo) => {
    setFormData({
      ...formData,
      start_time: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
      event_type: 'meeting',
      project_id: '',
      created_by: ''
    });
    setOpen(true);
    handleContextMenuClose();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{
          background: 'linear-gradient(45deg, #4ECDC4 30%, #FFE66D 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Calendario
        </Typography>
    
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{
            background: '#dadb00',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': {
              background: '#b1b200'
            }
          }}
        >
          Nuovo Evento
        </Button>
      </Box>
    
      <Paper sx={{
        height: 'calc(100% - 80px)',
        p: 3,
        background: '#252525',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        '& .rbc-calendar': {
          color: '#fff'
        },
        '& .rbc-header': {
          color: '#fff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        },
        '& .rbc-month-view': {
          border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        '& .rbc-day-bg': {
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        },
        '& .rbc-off-range-bg': {
          background: 'rgba(0, 0, 0, 0.2)'
        },
        '& .rbc-today': {
          background: 'rgba(218, 219, 0, 0.1)'
        },
        '& .rbc-event': {
          borderRadius: '4px'
        }
      }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleEventSelect}
          onSelectSlot={handleCreateEventFromContextMenu}
          selectable
          messages={{
            next: 'Avanti',
            previous: 'Indietro',
            today: 'Oggi',
            month: 'Mese',
            week: 'Settimana',
            day: 'Giorno',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Ora',
            event: 'Evento'
          }}
          components={{
            toolbar: props => (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div>
                  <Button
                    onClick={() => props.onNavigate('PREV')}
                    sx={{ mr: 1, color: '#a0a0a0' }}
                  >
                    Indietro
                  </Button>
                  <Button
                    onClick={() => props.onNavigate('NEXT')}
                    sx={{ color: '#a0a0a0' }}
                  >
                    Avanti
                  </Button>
                </div>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {props.label}
                </Typography>
                <div>
                  <Button
                    onClick={() => props.onView('month')}
                    sx={{ mr: 1, color: props.view === 'month' ? '#4ECDC4' : '#a0a0a0' }}
                  >
                    Mese
                  </Button>
                  <Button
                    onClick={() => props.onView('week')}
                    sx={{ mr: 1, color: props.view === 'week' ? '#4ECDC4' : '#a0a0a0' }}
                  >
                    Settimana
                  </Button>
                  <Button
                    onClick={() => props.onView('day')}
                    sx={{ color: props.view === 'day' ? '#4ECDC4' : '#a0a0a0' }}
                  >
                    Giorno
                  </Button>
                </div>
              </div>
            )
          }}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Modifica Evento' : 'Nuovo Evento'}
        </DialogTitle>
        <DialogContent>
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

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Data e Ora Inizio"
                type="datetime-local"
                fullWidth
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Data e Ora Fine"
                type="datetime-local"
                fullWidth
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo Evento</InputLabel>
            <Select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              label="Tipo Evento"
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type === 'meeting' ? 'Riunione' :
                   type === 'deadline' ? 'Scadenza' : 'Promemoria'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Progetto</InputLabel>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              label="Progetto"
            >
              <MenuItem value="">Nessun progetto</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Creato da</InputLabel>
            <Select
              value={formData.created_by}
              onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
              label="Creato da"
            >
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button
              onClick={() => handleDelete(selectedEvent.id)}
              color="error"
              sx={{ mr: 'auto' }}
            >
              Elimina
            </Button>
          )}
          <Button onClick={handleClose}>Annulla</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEvent ? 'Aggiorna' : 'Crea'}
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
    </Box>
  );
}

export default Calendar;