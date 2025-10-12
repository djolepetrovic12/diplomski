import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useState } from 'react';


function FileCompressor({ file, onCompressed }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Unexpected failure');

      const blob = await response.blob();
      console.log(response);
      const compressed = new File([blob], `${file.name}.7z`, { type: 'application/x-7z-compressed' });
      onCompressed(compressed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <Box mt={2} mb={2}>
      <Button
        variant="contained"
        color="secondary"
        disabled={!file || loading}
        onClick={handleCompress}
      >
        {loading ? 'Compressing...' : 'Compress File'}
      </Button>

      {loading && (
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <CircularProgress size={24} />
          <Typography>Compressing with 7-Zip...</Typography>
        </Box>
      )}
    </Box>
  );
}

export default FileCompressor;
