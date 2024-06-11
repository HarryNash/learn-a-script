import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import levenshtein from 'fast-levenshtein';
import Logo from './logo.png';
import happyGif from './happy.gif';
import sadGif from './crying.gif';
import coolGif from './cool.gif';
import * as Diff from 'diff';
import './App.css'; // Import the CSS file

const TextBoxWithButton: React.FC = () => {
  const [script, setScript] = useState('');
  const [showNewTextBox, setShowNewTextBox] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [success, setSuccess] = useState(true);
  const [difference, setDifference] = useState(<></>);
  const [gif, setGif] = useState('');
  const [scriptLineNumber, setScriptLineNumber] = useState(0);
  const [fade, setFade] = useState(false); // State to trigger fading effect
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [firstAttempts, setFirstAttempts] = useState('');
  const [firstPassAccuracy, setFirstPassAccuracy] = useState(-1);

  const handleScriptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScript(event.target.value);
  };

  const handleAttemptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(event.target.value);
  };

  const handleClick = () => {
    setShowNewTextBox(true);
    setStartTime(Date.now());
    setEndTime(0);
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
      if (script.split('\n').length != firstAttempts.split('\n').length) {
        setFirstAttempts(firstAttempts + attempt + '\n');
      }
      const expected = script.split('\n')[scriptLineNumber];
      const levenshteinDistance = levenshtein.get(attempt, expected);
      const levenshteinCorrectness = 1 - levenshteinDistance / expected.length;
      const diffObj = Diff.diffWords(attempt, expected);
      const diffFound = <Typography component="span">{diffObj.map(getStyledPart)}</Typography>;
      if (levenshteinCorrectness == 1) {
        setDifference(<></>);
        setGif(coolGif);
        setSuccess(true);
        setScriptLineNumber(scriptLineNumber + 1);
      } else if (levenshteinCorrectness >= 0.95) {
        setDifference(diffFound);
        setGif(happyGif);
        setSuccess(true);
        setScriptLineNumber(scriptLineNumber + 1);
      } else {
        setDifference(diffFound);
        setGif(sadGif);
        setSuccess(false);
      }

      if (scriptLineNumber == script.split('\n').length - 1 && levenshteinCorrectness >= 0.95) {
        setScriptLineNumber(0);
        setShowNewTextBox(false);
        setDifference(<div></div>);
        setEndTime(Date.now());
        const attemptsOneLine = (firstAttempts + attempt + '\n').replace(/\r?\n|\r/g, '');
        const scriptOneLine = script.replace(/\r?\n|\r/g, '');
        const diff = levenshtein.get(attemptsOneLine, scriptOneLine);
        const ratio = diff / scriptOneLine.length;
        const correctness = 1 - ratio;
        console.log(attemptsOneLine);
        console.log(scriptOneLine);
        console.log(diff);
        console.log(ratio);
        console.log(correctness);
        setFirstPassAccuracy(correctness);
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
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" paddingY={5}>
        <Box display="flex" alignItems="center">
          <img src={Logo} alt="Logo" style={{ marginRight: '10px', height: '100px' }} />
          <Typography variant="h4">Learn a Script</Typography>
        </Box>
        {!showNewTextBox && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="90%" p={2}>
            <TextField
              inputProps={{
                autocomplete: 'new-password',
                form: {
                  autocomplete: 'off',
                },
              }}
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
            label={`Line ${scriptLineNumber + 1}/${script.split('\n').length}`}
            inputProps={{
              autocomplete: 'new-password',
              form: {
                autocomplete: 'off',
              },
            }}
            variant="outlined"
            value={attempt}
            onChange={handleAttemptChange}
            onKeyPress={handleKeyPress}
            error={!success}
            fullWidth
            sx={{ maxWidth: 500, mt: 2 }}
          />
        )}
        {!attempt && <Box mt={2}> {difference} </Box>}
        {firstPassAccuracy != -1 && (
          <Typography>Total first pass accuracy: {Math.round(100 * firstPassAccuracy)}%</Typography>
        )}
        {endTime != 0 && <Typography>Total time: {Math.round((endTime - startTime) / 1000)} seconds</Typography>}
        {gif && (
          <Box mt={2}>
            <img src={gif} alt={'reaction'} className={fade ? 'fade-out' : ''} />
          </Box>
        )}
      </Box>
      <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
        Learn React
      </a>
    </div>
  );
};

export default TextBoxWithButton;
