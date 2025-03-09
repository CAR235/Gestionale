import { useState, useEffect, useContext } from 'react';
import { Grid, Paper, Typography, Card, CardContent, LinearProgress, Box, Alert, Snackbar } from '@mui/material';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { WebSocketContext } from '../contexts/WebSocketContext';

const COLORS = ['#00db9d', '#dadb00', '#ff5555', '#a0a0a0', '#8884d8'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

function Dashboard() {
  const { onUpdate } = useContext(WebSocketContext);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    pendingTasks: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    overdueInvoices: 0,
    totalTimeTracked: 0,
    monthlyInvoices: [],
    topClients: [],
    upcomingDeadlines: [],
    quoteConversionRate: 0,
    averagePaymentTime: 0,
    averageProjectMargin: 0,
    projectsByStatus: [],
    invoicesByStatus: [],
    tasksByPriority: [],
    recentTimeEntries: []
  });

  const fetchDashboardData = async () => {
    try {
      const [
        clients,
        projects,
        tasks,
        invoices,
        timeEntries
      ] = await Promise.all([
        axios.get('http://localhost:3000/api/clients').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/projects').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/tasks').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/invoices').catch(() => ({ data: [] })),
        axios.get('http://localhost:3000/api/time-entries').catch(() => ({ data: [] }))
      ]);

      // Process monthly invoices
      const monthlyData = {};
      const now = new Date();
      const last12Months = Array.from({length: 12}, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return d.toLocaleString('it-IT', { month: 'short', year: '2-digit' });
      }).reverse();

      last12Months.forEach(month => {
        monthlyData[month] = { month, emesse: 0, pagate: 0 };
      });

      invoices.data.forEach(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        const monthKey = invoiceDate.toLocaleString('it-IT', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].emesse++;
          if (invoice.status === 'paid') {
            monthlyData[monthKey].pagate++;
          }
        }
      });

      const monthlyInvoices = Object.values(monthlyData);

      // Process project status
      const projectStatus = {};
      const invoiceStatus = {};
      const taskPriority = {};

      projects.data.forEach(project => {
        projectStatus[project.status] = (projectStatus[project.status] || 0) + 1;
      });

      invoices.data.forEach(invoice => {
        invoiceStatus[invoice.status] = (invoiceStatus[invoice.status] || 0) + 1;
      });

      tasks.data.forEach(task => {
        taskPriority[task.priority] = (taskPriority[task.priority] || 0) + 1;
      });

      // Process top 5 clients by revenue
      const clientRevenue = {};
      let totalRevenue = 0;
      let overdueCount = 0;

      invoices.data.forEach(invoice => {
        if (invoice.status === 'paid') {
          const amount = parseFloat(invoice.amount);
          totalRevenue += amount;
          if (invoice.client_name) {
            clientRevenue[invoice.client_name] = (clientRevenue[invoice.client_name] || 0) + amount;
          }
        }
        if (invoice.status === 'overdue') {
          overdueCount++;
        }
      });

      const topClients = Object.entries(clientRevenue)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, revenue]) => ({
          name,
          revenue,
          percentage: (revenue / totalRevenue) * 100
        }));

      // Process upcoming project deadlines
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const upcomingDeadlines = projects.data
        .filter(project => {
          const dueDate = new Date(project.due_date);
          return dueDate >= now && dueDate <= thirtyDaysFromNow;
        })
        .map(project => ({
          id: project.id,
          name: project.name,
          due_date: project.due_date,
          status: project.status,
          progress: project.status === 'delivery' ? 100 :
                   project.status === 'review' ? 75 :
                   project.status === 'concept' ? 50 :
                   25
        }))
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      // Calculate total time tracked (in hours)
      const totalMinutes = timeEntries.data.reduce((acc, entry) => acc + (entry.duration || 0), 0);

      setStats({
        ...stats,
        totalClients: clients.data.length,
        activeProjects: projects.data.length,
        pendingTasks: tasks.data.filter(task => task.status === 'pending').length,
        totalInvoices: invoices.data.length,
        totalRevenue: totalRevenue,
        overdueInvoices: overdueCount,
        totalTimeTracked: Math.round(totalMinutes / 60),
        monthlyInvoices: monthlyInvoices,
        topClients: topClients,
        projectsByStatus: Object.entries(projectStatus).map(([status, count]) => ({
          status,
          count,
          percentage: (count / projects.data.length) * 100
        })),
        invoicesByStatus: Object.entries(invoiceStatus).map(([status, count]) => ({
          name: status === 'pending' ? 'In Attesa' :
                status === 'paid' ? 'Pagata' :
                status === 'overdue' ? 'Scaduta' : 'Annullata',
          value: count
        })),
        tasksByPriority: Object.entries(taskPriority).map(([priority, count]) => ({
          name: priority === 'high' ? 'Alta' :
                priority === 'medium' ? 'Media' : 'Bassa',
          value: count
        })),
        recentTimeEntries: timeEntries.data
          .slice(0, 5)
          .map(entry => ({
            name: entry.project_name,
            hours: Math.round(entry.duration / 60 * 10) / 10
          }))
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Errore nel caricamento dei dati della dashboard',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Set up WebSocket listeners
    const unsubscribeClient = onUpdate('clientCreated', fetchDashboardData);
    const unsubscribeProject = onUpdate('projectUpdated', fetchDashboardData);
    const unsubscribeTask = onUpdate('taskUpdated', fetchDashboardData);
    const unsubscribeInvoice = onUpdate('invoiceUpdated', fetchDashboardData);
    const unsubscribeTimeEntry = onUpdate('timeEntryUpdated', fetchDashboardData);

    // Cleanup WebSocket listeners on component unmount
    return () => {
      unsubscribeClient();
      unsubscribeProject();
      unsubscribeTask();
      unsubscribeInvoice();
      unsubscribeTimeEntry();
    };
  }, [onUpdate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Typography variant="h4" gutterBottom sx={{
        background: 'linear-gradient(45deg, #00db9d 30%, #dadb00 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 4,
        fontWeight: 'bold'
      }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards - First Row */}
        {[
          { title: 'Clienti Totali', value: stats.totalClients, color: '#00db9d' },
          { title: 'Progetti Attivi', value: stats.activeProjects, color: '#dadb00' },
          { title: 'Attività in Attesa', value: stats.pendingTasks, color: '#ff5555' },
          { title: 'Ore Registrate', value: stats.totalTimeTracked, color: '#a0a0a0' }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div variants={itemVariants}>
              <Card sx={{
                background: `linear-gradient(45deg, ${item.color}15 30%, ${item.color}05 90%)`,
                borderRadius: 2,
                boxShadow: `0 0 20px ${item.color}15`,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Summary Cards - Second Row */}
        {[
          { title: 'Fatture Totali', value: stats.totalInvoices, color: '#00db9d' },
          { title: 'Fatturato Totale', value: formatCurrency(stats.totalRevenue), color: '#dadb00' },
          { title: 'Fatture Scadute', value: stats.overdueInvoices, color: '#ff5555' }
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div variants={itemVariants}>
              <Card sx={{
                background: `linear-gradient(45deg, ${item.color}15 30%, ${item.color}05 90%)`,
                borderRadius: 2,
                boxShadow: `0 0 20px ${item.color}15`,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold' }}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        {/* Monthly Invoices Chart */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, rgba(218, 219, 0, 0.05) 30%, rgba(0, 219, 157, 0.05) 90%)',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(218, 219, 0, 0.1)',
              height: '100%'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Fatture per Mese
              </Typography>
              <div style={{ width: '100%', height: { xs: 250, sm: 300 } }}>
                <ResponsiveContainer>
                  <LineChart
                    data={stats.monthlyInvoices}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        padding: 12
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, marginTop: 8 }} />
                    <Line type="monotone" dataKey="emesse" name="Emesse" stroke="#dadb00" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="pagate" name="Pagate" stroke="#00db9d" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </motion.div>
        </Grid>

        {/* Top 5 Clients Revenue */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, rgba(0, 219, 157, 0.05) 30%, rgba(218, 219, 0, 0.05) 90%)',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(0, 219, 157, 0.1)',
              height: '100%'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top 5 Clienti per Fatturato
              </Typography>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={stats.topClients}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#a0a0a0" />
                    <YAxis stroke="#a0a0a0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="revenue" fill="#00db9d">
                      {stats.topClients.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </motion.div>
        </Grid>

        {/* Project Deadlines */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, rgba(255, 85, 85, 0.05) 30%, rgba(160, 160, 160, 0.05) 90%)',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(255, 85, 85, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Scadenze Progetti (Prossimi 30 Giorni)
              </Typography>
              {stats.upcomingDeadlines.map((project) => (
                <Box key={project.id} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <span>{project.name}</span>
                    <span>{new Date(project.due_date).toLocaleDateString()}</span>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: project.status === 'review' ? 'linear-gradient(45deg, #dadb00 30%, #ff5555 90%)' :
                                  project.status === 'delivery' ? 'linear-gradient(45deg, #00db9d 30%, #dadb00 90%)' :
                                  'linear-gradient(45deg, #ff5555 30%, #dadb00 90%)'
                      }
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </motion.div>
        </Grid>

        {/* KPI Performance */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, rgba(0, 219, 157, 0.05) 30%, rgba(218, 219, 0, 0.05) 90%)',
              borderRadius: 2,
              boxShadow: '0 0 20px rgba(0, 219, 157, 0.1)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>KPI Performance</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#4ECDC4' }}>
                        {stats.quoteConversionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasso di Conversione Preventivi
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FFE66D' }}>
                        {stats.averagePaymentTime} giorni
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tempo Medio Pagamento
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FF6B6B' }}>
                        {stats.averageProjectMargin}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Margine Medio Progetti
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
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
      </motion.div>
  );
}

export default Dashboard;