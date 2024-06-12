import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Link, Switch, Slider } from '@mui/material';
import levenshtein from 'fast-levenshtein';
import Logo from './logo.png';
import happyGif from './happy.gif';
import sadGif from './crying.gif';
import * as Diff from 'diff';
import './App.css'; // Import the CSS file

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

  const calculateLevenshteinCorrectness = (attempt, expected, checkCase, checkPunctuation) => {
    const newlines = /\r?\n|\r/g;
    attempt = attempt.replace(newlines, '');
    expected = expected.replace(newlines, '');
    if (!checkCase) {
      attempt = attempt.toLowerCase();
      expected = expected.toLowerCase();
    }
    const punctuation = /[.,/#!$%^&*;:{}=\-_`~()]/g;
    if (!checkPunctuation) {
      attempt = attempt.replace(punctuation, '');
      expected = attempt.replace(punctuation, '');
    }
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

      const diffObj = Diff.diffWords(attempt, expected);
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
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" paddingY={5}>
        <Box display="flex" alignItems="center">
          <img src={Logo} alt="Logo" style={{ marginRight: '10px', height: '100px' }} />
          <Typography variant="h4">Learn a Script</Typography>
        </Box>
        {!showNewTextBox && (
          <>
            <Box display="flex" alignItems="center">
              <Slider
                aria-label="Always visible"
                valueLabelDisplay="on"
                value={typeof minimumCorrectness === 'number' ? minimumCorrectness : 0}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
              />
              <Typography>Minimum % Correctness to Proceed</Typography>
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
              color="primary"
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
                color="primary"
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
          <Button color="primary" variant="contained" onClick={handleFinishPress}>
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
            That was {correctness}% correct, please {success ? 'continue' : 'try again'}.
          </Box>
        )}
        {firstPassAccuracy != -1 && <Typography>Total first pass accuracy: {firstPassAccuracy}%</Typography>}
        {endTime != -1 && <Typography>Total time: {Math.round((endTime - startTime) / 1000)} seconds</Typography>}
        {!attempt && gif && (
          <Box mt={2}>
            <img src={gif} alt={'reaction'} />
          </Box>
        )}
      </Box>
      <Link href="https://linktr.ee/harrynash" target="_blank" rel="noopener">
        Built by Harry Nash 🏗️
      </Link>
    </div>
  );
};

export default TextBoxWithButton;
