import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

const TextBoxWithButton: React.FC = () => {
  const [text, setText] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleClick = () => {
    alert(`Text entered: ${text}`);
  };

  return (
    <div className="App">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <TextField
          label="Enter Text"
          variant="outlined"
          value={text}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          sx={{ maxWidth: 500, mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          disabled={!text.trim()}
        >
          Submit
        </Button>
      </Box>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </div>
  );
};

export default TextBoxWithButton;
