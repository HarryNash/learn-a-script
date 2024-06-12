import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Link, Switch, Slider, createTheme, ThemeProvider } from '@mui/material';
import levenshtein from 'fast-levenshtein';
import Logo from './logo.png';
import happyGif from './happy.gif';
import sadGif from './crying.gif';
import * as Diff from 'diff';
import './App.css'; // Import the CSS file

function formatDuration(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  // Initialize parts as an array
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(hours + ' hour' + (hours > 1 ? 's' : ''));
  }
  if (minutes > 0) {
    parts.push(minutes + ' minute' + (minutes > 1 ? 's' : ''));
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(seconds + ' second' + (seconds !== 1 ? 's' : ''));
  }

  return parts.join(', ');
}

const newlines = /\r?\n|\r/g;

const punctuation = /[.,/#!$%^&*;:{}=\-_`~()]/g;

const TextBoxWithButton: React.FC = () => {
  const [script, setScript] = useState('');
  const [showNewTextBox, setShowNewTextBox] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [correctness, setCorrectness] = useState(-1);
  const [success, setSuccess] = useState(true);
  const [difference, setDifference] = useState(<></>);
  const [gif, setGif] = useState('');
  const [scriptLineNumber, setScriptLineNumber] = useState(0);
  const [startTime, setStartTime] = useState(-1);
  const [endTime, setEndTime] = useState(-1);
  const [firstAttempts, setFirstAttempts] = useState('');
  const [firstPassAccuracy, setFirstPassAccuracy] = useState(-1);
  const [enableSound, setEnableSound] = useState(true);
  const [checkCase, setCheckCase] = useState(true);
  const [checkPunctuation, setCheckPunctuation] = useState(true);
  const [minimumCorrectness, setMinimumCorrectness] = useState(95);

  // Create a green theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#64d989', // Green
      },
    },
  });

  const handleScriptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScript(event.target.value);
  };

  const handleAttemptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttempt(event.target.value);
  };

  const handleClick = () => {
    setShowNewTextBox(true);
    setFirstPassAccuracy(-1);
    setCorrectness(-1);
    setGif('');
    setStartTime(Date.now());
    setEndTime(-1);
    setFirstAttempts('');
  };

  const handleLoadSample = () => {
    setScript(
      "Now Linus, I want you to take a good look at Charlie Brown's face.\nWould you please hold still a minute, Charlie Brown, I want Linus to study your face.\nNow, this is what you call a Failure Face, Linus."
    );
  };

  const handleEnableSound = () => {
    setEnableSound(!enableSound);
  };

  const handleCheckCase = () => {
    setCheckCase(!checkCase);
  };

  const handleCheckPunctuation = () => {
    setCheckPunctuation(!checkPunctuation);
  };

  const getStyledPart = (part, index) => {
    const backgroundColor = part.added ? 'lightgreen' : part.removed ? 'lightcoral' : 'transparent';
    return (
      <span key={index} style={{ backgroundColor }}>
        {part.value}
      </span>
    );
  };

  const applyLineSettings = (line, checkCase, checkPunctuation) => {
    line = line.replace(newlines, '');
    if (!checkCase) {
      line = line.toLowerCase();
    }

    if (!checkPunctuation) {
      line = line.replace(punctuation, '');
    }
    return line;
  };

  const calculateLevenshteinCorrectness = (attempt, expected, checkCase, checkPunctuation) => {
    attempt = applyLineSettings(attempt, checkCase, checkPunctuation);
    expected = applyLineSettings(expected, checkCase, checkPunctuation);
    const levenshteinDistance = levenshtein.get(attempt, expected);
    const levenshteinRatio = levenshteinDistance / Math.max(attempt.length, expected.length);
    const percentageCorrectness = 100 * (1 - levenshteinRatio);
    return Math.round(percentageCorrectness);
  };

  const handleFinishPress = () => {
    setScriptLineNumber(0);
    setShowNewTextBox(false);
    setDifference(<div></div>);
    setEndTime(Date.now());
    setGif('');
    const correctness = calculateLevenshteinCorrectness(firstAttempts, script, checkCase, checkPunctuation);
    setFirstPassAccuracy(correctness);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (firstAttempts.split('\n').length - 1 == scriptLineNumber) {
        setFirstAttempts(firstAttempts + attempt + '\n');
      }
      const expected = script.split('\n')[scriptLineNumber];

      const diffObj = Diff.diffWords(
        applyLineSettings(attempt, checkCase, checkPunctuation),
        applyLineSettings(expected, checkCase, checkPunctuation)
      );
      const diffFound = <Typography component="span">{diffObj.map(getStyledPart)}</Typography>;
      setDifference(diffFound);
      const levenshteinCorrectness = calculateLevenshteinCorrectness(attempt, expected, checkCase, checkPunctuation);
      setCorrectness(levenshteinCorrectness);
      if (levenshteinCorrectness >= minimumCorrectness) {
        setGif(happyGif);
        setSuccess(true);
        setScriptLineNumber(scriptLineNumber + 1);
        if (enableSound) {
          new Audio('./ok.mp3').play();
        }
      } else {
        setGif(sadGif);
        setSuccess(false);
        if (enableSound) {
          new Audio('./fail.mp3').play();
        }
      }
      setAttempt('');
    }
  };

  const isFinished = () => {
    return scriptLineNumber == script.split('\n').length;
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setMinimumCorrectness(newValue as number);
  };

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" paddingY={5}>
          <Box display="flex" alignItems="center">
            <img src={Logo} alt="Logo" style={{ marginRight: '10px', height: '100px' }} />
            <Typography variant="h3" style={{ fontFamily: 'Papyrus' }}>
              Learn a Script
            </Typography>
          </Box>
          {!showNewTextBox && (
            <>
              <Box display="flex" alignItems="center" width="30%">
                <Slider
                  aria-label="Always visible"
                  valueLabelDisplay="on"
                  value={typeof minimumCorrectness === 'number' ? minimumCorrectness : 0}
                  onChange={handleSliderChange}
                  aria-labelledby="input-slider"
                />
                <Typography>Correctness to Pass</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Switch checked={enableSound} onChange={handleEnableSound} />
                <Typography>Enable Sound</Typography>
              </Box>

              <Box display="flex" alignItems="center">
                <Switch checked={checkCase} onChange={handleCheckCase} />
                <Typography>Check Upper and Lower Case</Typography>
              </Box>

              <Box display="flex" alignItems="center">
                <Switch checked={checkPunctuation} defaultChecked onChange={handleCheckPunctuation} />
                <Typography>Check Punctuation</Typography>
              </Box>

              <Button
                variant="contained"
                onClick={handleLoadSample}
                sx={{ marginTop: 2 }} // Adding some margin on top of the button
              >
                Load Sample Script
              </Button>
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
                  onClick={handleClick}
                  disabled={!script.trim()}
                  sx={{ marginTop: 2 }} // Adding some margin on top of the button
                >
                  Practice
                </Button>
              </Box>
            </>
          )}
          {isFinished() && (
            <Button variant="contained" onClick={handleFinishPress}>
              Finish
            </Button>
          )}
          {!isFinished() && showNewTextBox && (
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
          {!attempt && showNewTextBox && correctness != -1 && (
            <Box mt={2}>
              <Typography style={{ color: success ? 'green' : 'red' }}>Correctness: {correctness}%</Typography>
              {!isFinished() && (
                <Typography style={{ color: success ? 'green' : 'red' }}>
                  Please try {success ? 'the next line' : 'that line again'}.
                </Typography>
              )}
            </Box>
          )}
          {firstPassAccuracy != -1 && <Typography>Total First Pass Correctness: {firstPassAccuracy}%</Typography>}
          {endTime != -1 && (
            <Typography>Total Time Taken: {formatDuration(Math.round(endTime - startTime))}</Typography>
          )}
          {!attempt && gif && (
            <Box mt={2}>
              <img src={gif} alt={'reaction'} />
            </Box>
          )}
        </Box>
        <Link href="https://linktr.ee/harrynash" target="_blank" rel="noopener">
          Built by Harry Nash 🏗️
        </Link>
      </ThemeProvider>
    </div>
  );
};

export default TextBoxWithButton;
