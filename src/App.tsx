import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import happyGif from './happy.gif';
import sadGif from './crying.gif';

const TextBoxWithButton: React.FC = () => {
  const [script, setScript] = useState('');
  const [showNewTextBox, setShowNewTextBox] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [gif, setGif] = useState('');

  const handleScriptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScript(event.target.value);
  };

  const handleAttemptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(event.target.value);
  };

  const handleClick = () => {
    setShowNewTextBox(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (attempt === script.split('\n')[0]) {
        setGif(happyGif);
      } else {
        setGif(sadGif);
      }
    }
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
          value={script}
          onChange={handleScriptChange}
          fullWidth
          multiline
          rows={4}
          sx={{ maxWidth: 500, mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          disabled={!script.trim()}
        >
          Submit
        </Button>
        {showNewTextBox && (
          <TextField
            label="Submitted Text"
            variant="outlined"
            value={attempt}
            onChange={handleAttemptChange}
            onKeyPress={handleKeyPress}
            fullWidth
            sx={{ maxWidth: 500, mt: 2 }}
          />
        )}
        {gif && (
          <Box mt={2}>
            <img src={gif} alt={gif === happyGif ? 'Happy' : 'Sad'} />
          </Box>
        )}
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
