import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Fab, Dialog, DialogTitle, DialogContent } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptIcon from '@mui/icons-material/Receipt';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { useState } from 'react';
import './App.css';
import Logo from './components/Logo';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Import your page components
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import ProjectTemplates from './pages/ProjectTemplates';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import TimeTracking from './pages/TimeTracking';
import Files from './pages/Files';
import Invoices from './pages/Invoices';
import TeamManagement from './pages/TeamManagement';
import Calendar from './pages/Calendar';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import Chat from './components/Chat';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleChatOpen = () => {
    setChatOpen(true);
  };
  
  const handleChatClose = () => {
    setChatOpen(false);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Clienti', icon: <PeopleIcon />, path: '/clients' },
    { text: 'Progetti', icon: <FolderIcon />, path: '/projects' },
    { text: 'Modelli', icon: <ContentCopyIcon />, path: '/templates' },
    { text: 'Attività', icon: <AssignmentIcon />, path: '/tasks' },
    { text: 'File', icon: <FolderOpenIcon />, path: '/files' },
    { text: 'Tempo', icon: <BarChartIcon />, path: '/time-tracking' },
    { text: 'Calendario', icon: <CalendarMonthIcon />, path: '/calendar' },
    { text: 'Fatture', icon: <ReceiptIcon />, path: '/invoices' },
    { text: 'Report', icon: <BarChartIcon />, path: '/reports' },
    { text: 'Team', icon: <GroupsIcon />, path: '/team' }
  ];

  return (
    <WebSocketProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed">
            <Toolbar sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: { xs: 1, sm: 2 }
            }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer}
                sx={{ mr: { xs: 1, sm: 2 } }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{
                position: { xs: 'static', sm: 'absolute' },
                left: { sm: '50%' },
                transform: { sm: 'translateX(-50%)' },
                display: 'flex',
                alignItems: 'center'
              }}>
                <Logo />
              </Box>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer}
            sx={{
              width: { xs: '85%', sm: 240 },
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: { xs: '85%', sm: 240 },
                boxSizing: 'border-box',
              },
            }}
          >
            <Toolbar />
            <List>
              {menuItems.map((item) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={item.text}
                >
                  <ListItem
                    component={Link}
                    to={item.path}
                    onClick={toggleDrawer}
                    sx={{
                      py: { xs: 2, sm: 1 },
                      px: { xs: 3, sm: 2 }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Drawer>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 1.5, sm: 3 },
              width: '100%',
              marginTop: { xs: '56px', sm: '64px' },
              overflowX: 'hidden'
            }}
          >
            <Container 
              maxWidth="xl"
              sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 1, sm: 2 }
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/templates" element={<ProjectTemplates />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/files" element={<Files />} />
                <Route path="/time-tracking" element={<TimeTracking />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/team" element={<TeamManagement />} />
                <Route path="/calendar" element={<Calendar />} />
              </Routes>
            </Container>

            <Fab
              color="primary"
              aria-label="chat"
              onClick={handleChatOpen}
              sx={{
                position: 'fixed',
                bottom: { xs: 24, sm: 32 },
                right: { xs: 24, sm: 32 },
                zIndex: 1000,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 }
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
                Chat
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
                <Chat type="global" />
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
