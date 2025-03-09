import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import FileManager from '../components/FileManager';

function Files() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        File
      </Typography>
      <FileManager />
    </div>
  );
}

export default Files;