import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import axios from 'axios';

const FileManager = ({ projectId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [versionHistory, setVersionHistory] = useState([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/files${projectId ? `?projectId=${projectId}` : ''}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Errore nel caricamento dei file:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
      formData.append('folderPath', `projects/${projectId}`);
    }

    try {
      const response = await axios.post('http://localhost:3000/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      const uploadedFile = response.data;
      setFiles([...files, uploadedFile]);
      setUploadProgress(0);

      if (uploadedFile.type.startsWith('image/')) {
        const url = `http://localhost:3000/api/files/${uploadedFile.id}/preview`;
        setPreviewUrl(url);
        setPreviewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handlePreview = (file) => {
    if (file.type.startsWith('image/')) {
      const url = `http://localhost:3000/api/files/${file.id}/preview`;
      setPreviewUrl(url);
      setPreviewDialogOpen(true);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/files/${fileId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo file?')) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/files/${fileId}`);
        if (response.status === 200) {
          setFiles(files.filter(file => file.id !== fileId));
          handleMenuClose();
          setSelectedFile(null);
          showSnackbar('File eliminato con successo');
        } else {
          throw new Error('Errore durante l\'eliminazione del file');
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        showSnackbar(error.response?.data?.message || 'Errore durante l\'eliminazione del file', 'error');
      }
    }
  };

  const handleVersionHistory = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/files/${fileId}/versions`);
      setVersionHistory(response.data);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/svg+xml':
        return <ImageIcon />;
      case 'application/pdf':
        return <PdfIcon />;
      default:
        return <FileIcon />;
    }
  };

  const handleMenuOpen = (event, file) => {
    setSelectedFile(file);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Carica File
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".jpg,.jpeg,.png,.svg,.pdf,.psd,.ai"
          />
        </Button>
        {uploadProgress > 0 && (
          <Box sx={{ width: '300px' }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: '#00db9d',
                  transition: 'transform 0.4s ease'
                }
              }}
            />
            <Typography variant="body2" color="textSecondary" align="center">
              {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Box>

      <List>
        {files.map((file) => (
          <ListItem
            key={file.id}
            sx={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
            secondaryAction={
              <>
                <IconButton onClick={(e) => handleMenuOpen(e, file)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {file.type.startsWith('image/') && (
                    <MenuItem onClick={() => handlePreview(file)}>
                      <ListItemIcon><ImageIcon /></ListItemIcon>
                      <ListItemText>Anteprima</ListItemText>
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => handleDownload(file.id)}>
                    <ListItemIcon><DownloadIcon /></ListItemIcon>
                    <ListItemText>Scarica</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleVersionHistory(file.id)}>
                    <ListItemIcon><HistoryIcon /></ListItemIcon>
                    <ListItemText>Cronologia Versioni</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => setShareDialogOpen(true)}>
                    <ListItemIcon><ShareIcon /></ListItemIcon>
                    <ListItemText>Condividi</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleDelete(file.id)}>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText>Elimina</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            }
          >
            <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
            <ListItemText
              primary={file.name}
              secondary={
                <>
                  <Typography variant="body2" component="span">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    size="small"
                    label={`Versione ${file.version}`}
                    sx={{ ml: 1 }}
                  />
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Anteprima File</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: '100%',
              height: '500px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={previewUrl}
              alt="Anteprima"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)}>
        <DialogTitle>Cronologia Versioni</DialogTitle>
        <DialogContent>
          <List>
            {versionHistory.map((version) => (
              <ListItem key={version.id}>
                <ListItemText
                  primary={`Versione ${version.version}`}
                  secondary={new Date(version.createdAt).toLocaleString()}
                />
                <Tooltip title="Scarica questa versione">
                  <IconButton onClick={() => handleDownload(version.id)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Condividi File</DialogTitle>
        <DialogContent>
          <Typography>La funzionalità di condivisione sarà implementata a breve.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManager;