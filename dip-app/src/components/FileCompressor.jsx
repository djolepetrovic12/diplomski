import { Box, Button, CircularProgress, Typography, FormControl, MenuItem, Select, InputLabel, Slider, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import React, { useState, useEffect } from 'react';


function FileCompressor({ file, onCompressed }) {
  const [loading, setLoading] = useState(false);
  const [compressed, setCompressed] = useState(false);

  const [method, setMethod] = useState('lzma2');
  const [level, setLevel] = useState(9);
  const [threads, setThreads] = useState(2);
  const [solid, setSolid] = useState('on');
  const [dictExp, setDictExp] = useState(23);
  const [ppmdWordExp, setPpmdWordExp] = useState(4);

  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    setMetrics(null);
    setCompressed(false);
  }, [file]);

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setMetrics(null);

    const formData = new FormData();
    formData.append('file', file);

    const settings = {method, level, threads, solid, dictSize: 1 << dictExp, ppmdWordSize: 1 << ppmdWordExp};
    formData.append('settings', JSON.stringify(settings));

    try {
      const response = await fetch('http://localhost:5000/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Unexpected failure');

      const blob = await response.blob();

      const compressed = new File([blob], `${file.name}.7z`, { type: 'application/x-7z-compressed' });
      onCompressed(compressed);
      const results = await fetch('http://localhost:5000/results').then(r => r.json());
      if(results) 
        setMetrics(results);
      setCompressed(true);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  const dictSizeMB = 1 << (dictExp - 20);

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

      {(method === 'lzma' || method === 'lzma2') && (
        <>
          <Typography gutterBottom>
            Dictionary Size: {dictSizeMB}MB
          </Typography>
          <Slider
            value={dictExp}
            onChange={(e, val) => setDictExp(val)}
            min={20}
            max={30}
            step={1}
            marks
            sx={{ mt:1 }}
          />
        </>
      )}

      {method === 'ppmd' && (
        <>
          <Typography gutterBottom>
            PPMd Word Size: {1 << ppmdWordExp}B
          </Typography>
          <Slider
            value={ppmdWordExp}
            onChange={(e, val) => setPpmdWordExp(val)}
            min={0}
            max={8}
            step={1}
            marks
            sx={{ mt:1 }}
          />
        </>
      )}



      <Button
        variant="contained"
        color="secondary"
        disabled={!file || loading || compressed}
        onClick={handleCompress}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? 'Compressing...' : 'Compress File'}
      </Button>

      {loading && (
        <Box mt={2}>

          <Box mt={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={1}>
            <CircularProgress size={32} />
            <Typography variant="body2">Working...</Typography>
          </Box>
        </Box>
      )}

      {metrics && (
        <Box mt={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              textAlign: 'center',
            }}
          >
            Compression Results
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              mt: 1,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
            }}
          >
            <Table size="small">
              <TableBody>
                {Object.entries(metrics).map(([key, value]) => (
                  <TableRow
                    key={key}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        color: 'text.primary',
                        py: 1,
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1')}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        py: 1,
                      }}
                    >
                      {typeof value === 'number'
                        ? value.toLocaleString()
                        : value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default FileCompressor;
