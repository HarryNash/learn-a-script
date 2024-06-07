import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import happyGif from './happy.gif';
import * as Diff from 'diff';
import sadGif from './crying.gif';
import './App.css'; // Import the CSS file

const TextBoxWithButton: React.FC = () => {
  const [script, setScript] = useState('');
  const [showNewTextBox, setShowNewTextBox] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [attemptPlaceholder, setAttemptPlaceholder] = useState('');
  const [difference, setDifference] = useState(<div></div>);
  const [gif, setGif] = useState('');
  const [scriptLineNumber, setScriptLineNumber] = useState(0);
  const [fade, setFade] = useState(false); // State to trigger fading effect

  const handleScriptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScript(event.target.value);
  };

  const handleAttemptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(event.target.value);
  };

  const handleClick = () => {
    setShowNewTextBox(true);
  };

  const getStyledPart = (part, index) => {
    const color = part.added ? 'green' : part.removed ? 'red' : 'black';
    return (
      <span key={index} style={{ color }}>
        {part.value}
      </span>
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const diffObj = Diff.diffWords(
        attempt,
        script.split('\n')[scriptLineNumber]
      );

      const diffFound = diffObj.map(getStyledPart);
      setDifference(<Typography component="span">{diffFound}</Typography>);

      if (attempt === script.split('\n')[scriptLineNumber]) {
        setGif(happyGif);
        setAttemptPlaceholder('');
        setScriptLineNumber(scriptLineNumber + 1);
        if (scriptLineNumber >= script.split('\n').length - 1) {
          setScriptLineNumber(0);
          setShowNewTextBox(false);
          setGif('');
          setDifference(<div></div>);
        }
      } else {
        setDifference(diffFound);
        setGif(sadGif);
        setAttemptPlaceholder(script.split('\n')[scriptLineNumber]);
      }
      setAttempt('');
      setTimeout(() => {
        setFade(true);
        setTimeout(() => {
          setFade(false);
          setGif('');
        }, 2000);
      }, 1000);
    }
  };

  return (
    <div className="App">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        paddingY={5}
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
            label="Line"
            variant="outlined"
            value={attempt}
            onChange={handleAttemptChange}
            onKeyPress={handleKeyPress}
            error={attemptPlaceholder !== ''}
            fullWidth
            sx={{ maxWidth: 500, mt: 2 }}
          />
        )}
        {!attempt && <Box mt={2}> {difference} </Box>}
        {gif && (
          <Box mt={2}>
            <img
              src={gif}
              alt={gif === happyGif ? 'Happy' : 'Sad'}
              className={fade ? 'fade-out' : ''}
            />
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
