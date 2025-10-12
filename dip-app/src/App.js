import { Container, IconButton, Typography } from '@mui/material';
import './App.css';
import FileDownload from './components/FileDownload';
import FileUpload from './components/FileUpload';
import React, { useState } from 'react'
import FileCompressor from './components/FileCompressor';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);


  return (
    <Container  maxWidth="sm" sx={{ mt: 5, border: "2px solid black", borderRadius: 2, p: 3, minWidth: "200px" }}>

      <Typography variant="h4" gutterBottom>
        File upload
      </Typography>

      <FileUpload onFileSelect={setFile} />

     

      {file && (
        <>
          <Typography variant="body1" mt={2}>
            Selected file: {file.name}
          </Typography>
          <IconButton onClick={()=>{setFile(null)}}>
            <DeleteIcon></DeleteIcon>
          </IconButton>
          <FileCompressor file={file} onCompressed={setCompressedFile} />
        </>
      )}

      {compressedFile && file && (
        <FileDownload file={compressedFile} />
      )}

    </Container>
  );
}

export default App;
