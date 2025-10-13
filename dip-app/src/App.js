import { Container, IconButton, Typography, Box } from '@mui/material';
import './App.css';
import FileDownload from './components/FileDownload';
import FileUpload from './components/FileUpload';
import React, { useState } from 'react'
import FileCompressor from './components/FileCompressor';
import ClearIcon from '@mui/icons-material/Clear';

function App() {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);


  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 5,
        border: '1px solid #D8DEE9',
        borderRadius: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 1,
        background: '#ffffff'
      }}
    >
      <Box>
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 3,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "black",
          }}
        >
          7-Zip kompresija
        </Typography>
      </Box>
      <Box
        width='100%'
      >
        <FileUpload onFileSelect={setFile} />
      </Box>

     

      {file && (
        <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '100%',
        }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems:'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              Selected file: {file.name}
            </Typography>
            <IconButton onClick={()=>{setFile(null)}}>
              <ClearIcon></ClearIcon>
            </IconButton>
          </Box>
          <FileCompressor file={file} onCompressed={setCompressedFile} />
          {compressedFile && (
            <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems:'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                Compressed file: {compressedFile.name}
              </Typography>
              <IconButton onClick={()=>{setCompressedFile(null); setFile(null)}}>
                <ClearIcon></ClearIcon>
              </IconButton>
            </Box>
            </>
          )}
        </Box>
      )}

      {compressedFile && file && (
        <Box
          width='100%'
        >
          <FileDownload file={compressedFile} />
        </Box>
      )}

    </Container>
  );
}

export default App;
