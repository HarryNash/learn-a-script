import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import happyGif from './happy.gif';
import sadGif from './crying.gif';

const TextBoxWithButton: React.FC = () => {
  const [script, setScript] = useState('');
  const [showNewTextBox, setShowNewTextBox] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [attemptPlaceholder, setAttemptPlaceholder] = useState('');
  const [gif, setGif] = useState('');
  const [scriptLineNumber, setScriptLineNumber] = useState(0);

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
      setAttempt('');
      if (attempt === script.split('\n')[scriptLineNumber]) {
        setGif(happyGif);
        setAttemptPlaceholder('');
        setScriptLineNumber(scriptLineNumber + 1);
        if (scriptLineNumber >= script.split('\n').length - 1) {
          setScriptLineNumber(0);
          setShowNewTextBox(false);
          setGif('');
        }
      } else {
        setGif(sadGif);
        setAttemptPlaceholder(script.split('\n')[scriptLineNumber]);
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
        {!showNewTextBox && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="90%"
            p={2}
          >
            <TextField
              label="Script"
              variant="outlined"
              value={script}
              onChange={handleScriptChange}
              fullWidth
              multiline
              rows={10}
              sx={{ marginX: 2 }} // Adding horizontal margin
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleClick}
              disabled={!script.trim()}
              sx={{ marginTop: 2 }} // Adding some margin on top of the button
            >
              Practice
            </Button>
          </Box>
        )}
        {showNewTextBox && (
          <TextField
            label="Submitted Text"
            variant="outlined"
            value={attempt}
            onChange={handleAttemptChange}
            onKeyPress={handleKeyPress}
            error={attemptPlaceholder !== ''}
            placeholder={attemptPlaceholder}
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
