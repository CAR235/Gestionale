import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';

const COLORS = {
  priority: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  status: ['#FFE66D', '#4ECDC4', '#FF6B6B', '#6C5B7B'],
  progress: ['#4ECDC4', '#FFE66D', '#FF6B6B']
};

function Reports() {
  const theme = useTheme();
  const [data, setData] = useState({
    tasksByPriority: [],
    projectProgress: [],
    taskCompletion: [],
    timeRange: 'week',
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    activeProjects: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [data.timeRange]);

  const fetchReportData = async () => {
    try {
      const [tasks, projects] = await Promise.all([
        axios.get('http://localhost:3000/api/tasks'),
        axios.get('http://localhost:3000/api/projects')
      ]);

      // Process tasks by priority
      const taskPriority = {};
      const taskStatus = {};
      let completedTasksCount = 0;

      tasks.data.forEach(task => {
        // Count by priority
        taskPriority[task.priority] = (taskPriority[task.priority] || 0) + 1;

        // Count by status
        taskStatus[task.status] = (taskStatus[task.status] || 0) + 1;
        if (task.status === 'completed') {
          completedTasksCount++;
        }
      });

      // Process project status
      const projectStatus = {};
      let activeProjectsCount = 0;

      projects.data.forEach(project => {
        projectStatus[project.status] = (projectStatus[project.status] || 0) + 1;
        if (project.status !== 'completed') {
          activeProjectsCount++;
        }
      });

      // Format data for charts
      const tasksByPriority = Object.entries(taskPriority).map(([priority, value]) => ({
        name: priority === 'high' ? 'Alta' :
             priority === 'medium' ? 'Media' : 'Bassa',
        value,
        percentage: (value / tasks.data.length) * 100
      }));

      const projectProgress = Object.entries(projectStatus).map(([status, value]) => ({
        name: status === 'brief' ? 'Briefing' :
             status === 'concept' ? 'Concetto' :
             status === 'review' ? 'Revisione' :
             status === 'delivery' ? 'Consegna' : status,
        value,
        percentage: (value / projects.data.length) * 100
      }));

      const taskCompletion = Object.entries(taskStatus).map(([status, Tasks]) => ({
        name: status === 'pending' ? 'In Attesa' :
             status === 'in_progress' ? 'In Corso' :
             status === 'completed' ? 'Completata' : status,
        Tasks,
        percentage: (Tasks / tasks.data.length) * 100
      }));

      setData({
        ...data,
        tasksByPriority,
        projectProgress,
        taskCompletion,
        totalTasks: tasks.data.length,
        completedTasks: completedTasksCount,
        totalProjects: projects.data.length,
        activeProjects: activeProjectsCount
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const handleTimeRangeChange = (event) => {
    setData({ ...data, timeRange: event.target.value });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                background: 'linear-gradient(45deg, #4ECDC4 30%, #FFE66D 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              Report Analisi
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Panoramica completa delle prestazioni e dei progressi
            </Typography>
          </Box>
          <FormControl
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.1)
              },
              '& .MuiInputLabel-root': {
                fontWeight: 'bold'
              },
              '& .MuiMenuItem-root': {
                fontWeight: 'bold'
              }
            }}
          >
            <InputLabel>Periodo di Analisi</InputLabel>
            <Select
              value={data.timeRange}
              label="Periodo di Analisi"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="week">Ultima Settimana</MenuItem>
              <MenuItem value="month">Ultimo Mese</MenuItem>
              <MenuItem value="year">Ultimo Anno</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.2) 100%)',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(255, 107, 107, 0.1)'
                  }}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Tasso di Completamento</Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      delle attività completate
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(108, 91, 123, 0.1) 0%, rgba(108, 91, 123, 0.2) 100%)',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(108, 91, 123, 0.1)'
                  }}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>Efficienza</Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {data.activeProjects > 0 ? Math.round((data.completedTasks / data.activeProjects)) : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      attività per progetto
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.05) 0%, rgba(255, 230, 109, 0.05) 100%)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(78, 205, 196, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Distribuzione Priorità</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.tasksByPriority}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#4ECDC4"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.tasksByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#252525',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255, 230, 109, 0.05) 0%, rgba(78, 205, 196, 0.05) 100%)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(255, 230, 109, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Stato Progetti</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.projectProgress}>
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
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#FFE66D"
                      radius={[8, 8, 0, 0]}
                    >
                      {data.projectProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Paper sx={{
                p: 3,
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(108, 91, 123, 0.05) 100%)',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.1)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Andamento Completamento</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.taskCompletion}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
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
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Tasks"
                      stroke="#4ECDC4"
                      fillOpacity={1}
                      fill="url(#colorTasks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </AnimatePresence>
  );
}

export default Reports;