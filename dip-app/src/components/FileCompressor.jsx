import { Box, Button, CircularProgress, Typography ,FormControl, MenuItem,Select, InputLabel,Slider, LinearProgress} from '@mui/material';
import React, { useState, useEffect } from 'react';


function FileCompressor({ file, onCompressed }) {
  const [loading, setLoading] = useState(false);

  const [method, setMethod] = useState('lzma2');
  const [level, setLevel] = useState(9);
  const [threads, setThreads] = useState(2);
  const [solid, setSolid] = useState('on');

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const settings = { method, level, threads, solid };
    formData.append('settings', JSON.stringify(settings));

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
    }

  };



  return (
    <Box mt={2} mb={2}>

      <FormControl fullWidth margin="dense" sx={{ mt:2, mb:2}}>
        <InputLabel id="methodLabel">Method</InputLabel>
        <Select
          labelId="methodLabel"
          id="method-select"
          value={method}
          label="Method"
          onChange={(e) => setMethod(e.target.value)}
        >
          <MenuItem value="lzma2">LZMA2</MenuItem>
          <MenuItem value="lzma">LZMA</MenuItem>
          <MenuItem value="bzip2">BZip2</MenuItem>
          <MenuItem value="deflate">Deflate</MenuItem>
          <MenuItem value="ppmd">PPMd</MenuItem>
        </Select>
      </FormControl>

      <Typography gutterBottom>Compression Level: {level}</Typography>
      <Slider
        value={level}
        onChange={(e, val) => setLevel(val)}
        min={0}
        max={9}
        step={1}
        marks
        sx={{ mt:1}}
      />

      <Typography gutterBottom>Threads: {threads}</Typography>
      <Slider
        value={threads}
        onChange={(e, val) => setThreads(val)}
        min={1}
        max={8}
        step={1}
        marks
        sx={{ mt:1}}
      />

      <FormControl fullWidth margin="dense" sx={{ mt:2}}>
        <InputLabel id="solidLabel">Solid Mode</InputLabel>
        <Select label="Solid Mode" id="solid-label" labelId="solidLabel" value={solid} onChange={(e) => setSolid(e.target.value)}>
          <MenuItem value="on">On</MenuItem>
          <MenuItem value="off">Off</MenuItem>
        </Select>
      </FormControl>



      <Button
        variant="contained"
        color="secondary"
        disabled={!file || loading}
        onClick={handleCompress}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? 'Compressing...' : 'Compress File'}
      </Button>

      {loading && (
        <Box mt={2}>

          <Box mt={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={1}>
            <CircularProgress size={24} />
            <Typography variant="body2">Working...</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default FileCompressor;
