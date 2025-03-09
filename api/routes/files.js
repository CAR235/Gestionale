const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all files
router.get('/', (req, res) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const fileList = files.filter(file => file !== '.gitkeep').map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        name: file,
        size: stats.size,
        created_at: stats.birthtime
      };
    });
    
    res.json(fileList);
  });
});

// Upload a file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Delete a file
router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../../uploads', filename);
  
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }
  
  fs.unlink(filepath, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'File deleted successfully' });
  });
});

module.exports = router;