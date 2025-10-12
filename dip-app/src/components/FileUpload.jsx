import { Button, Box } from "@mui/material";

function FileUpload({onFileSelect}) {

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
        <Box mt={2} mb={2}>
      <Button variant="contained" component="label">
        Upload File
        <input type="file" hidden onChange={handleChange} />
      </Button>
    </Box>
  );
}

export default FileUpload