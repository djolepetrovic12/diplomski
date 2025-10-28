import { Box, Button } from '@mui/material';
import React from 'react'

function FileDownload({file}) {
  const handleDownload = () => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box mt={2} mb={2}>
      <Button variant="contained" onClick={handleDownload} disabled={!file}fullWidth>
        Download File
      </Button>
    </Box>
  );
}

export default FileDownload