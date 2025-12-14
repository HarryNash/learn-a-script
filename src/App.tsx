import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Link,
  Switch,
  createTheme,
  ThemeProvider,
  Input,
  InputAdornment,
} from '@mui/material';
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

const savedScript = localStorage.getItem('script');

const sampleScript = [
  'I was robbed!',
  'I spent the whole night waiting for the Great Pumpkin when I could have been out for tricks or treats!',
  'Halloween is over and I missed it!',
  'You blockhead!',
].join('\n');

const TextBoxWithButton: React.FC = () => {
  const initialScript = savedScript ? savedScript : sampleScript;
  const [script, setScript] = useState(initialScript);
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to detect if script is in dialogue format
  const detectDialogueMode = (scriptText: string) => {
    const lines = scriptText.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return false;

    return lines.every((line) => {
      const trimmed = line.trim();
      return trimmed.startsWith('Me: ') || trimmed.startsWith('Them: ');
    });
  };

  const [isDialogueMode, setIsDialogueMode] = useState(detectDialogueMode(initialScript));

  // Add keyboard event listener for global Enter key handling
  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // Check if we're not focused on any input element
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.getAttribute('contenteditable') === 'true');

        if (!isInputFocused) {
          // If we're on the finish screen, trigger finish button
          if (isFinished() && showNewTextBox) {
            handleFinishPress();
          }
          // If we're on the home screen, trigger practice button
          else if (!showNewTextBox && script.trim()) {
            handleClick();
          }
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [showNewTextBox, script, scriptLineNumber]); // Dependencies to ensure we have current state

  // Auto-focus input field when practicing and when advancing to next line
  useEffect(() => {
    if (showNewTextBox && !isFinished()) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showNewTextBox, scriptLineNumber]);

  // Function to check if current line is "My" turn
  const isMyTurn = (lineNumber: number) => {
    const lines = script.split('\n');
    if (lineNumber >= lines.length) return false;
    return lines[lineNumber].trim().startsWith('Me: ');
  };

  // Function to get the content without the prefix
  const getLineContent = (line: string) => {
    if (line.startsWith('Me: ')) return line.substring(4);
    if (line.startsWith('Them: ')) return line.substring(6);
    return line;
  };

  const handleScriptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScript = event.target.value;
    setScript(newScript);
    localStorage.setItem('script', newScript);

    // Check if the new script is in dialogue format
    setIsDialogueMode(detectDialogueMode(newScript));
  };

  const handleTryMonologueMode = () => {
    const monologueScript = [
      'Humpty Dumpty sat on a wall.',
      'Humpty Dumpty had a great fall.',
      "All the king's horses and all the king's men.",
      "Couldn't put Humpty together again.",
    ].join('\n');
    setScript(monologueScript);
    localStorage.setItem('script', monologueScript);
    setIsDialogueMode(detectDialogueMode(monologueScript));
  };

  const handleTryDialogueMode = () => {
    const dialogueScript = [
      'Me: Knock knock.',
      "Them: Who's there?",
      'Me: Lettuce.',
      'Them: Lettuce who?',
      'Me: Lettuce in!',
      "Me: It's cold out here!",
    ].join('\n');
    setScript(dialogueScript);
    localStorage.setItem('script', dialogueScript);
    setIsDialogueMode(detectDialogueMode(dialogueScript));
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

    // Set dialogue mode based on current script
    setIsDialogueMode(detectDialogueMode(script));

    // Focus the input field after a short delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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

  const handleCorrectnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinimumCorrectness(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleFinishPress = () => {
    setScriptLineNumber(0);
    setShowNewTextBox(false);
    setDifference(<div></div>);
    setEndTime(Date.now());
    setGif('');

    let scriptToCompare = script;
    let firstAttemptsToCompare = firstAttempts;

    if (isDialogueMode) {
      // In dialogue mode, extract only the "Me: " lines (without prefix) for comparison
      const scriptLines = script.split('\n');
      let attemptLines = firstAttempts.split('\n');
      // Remove trailing empty string if firstAttempts ends with '\n'
      if (attemptLines.length > 0 && attemptLines[attemptLines.length - 1] === '') {
        attemptLines = attemptLines.slice(0, -1);
      }

      const myLines: string[] = [];
      const myAttempts: string[] = [];

      // Match up script lines with attempt lines by index
      const maxLines = Math.max(scriptLines.length, attemptLines.length);
      for (let i = 0; i < maxLines; i++) {
        if (i < scriptLines.length && isMyTurn(i)) {
          myLines.push(getLineContent(scriptLines[i]));
          // Get the corresponding attempt line if it exists
          if (i < attemptLines.length) {
            myAttempts.push(attemptLines[i]);
          } else {
            myAttempts.push(''); // Missing attempt
          }
        }
      }

      scriptToCompare = myLines.join('\n');
      firstAttemptsToCompare = myAttempts.join('\n');
    }

    const correctness = calculateLevenshteinCorrectness(
      firstAttemptsToCompare,
      scriptToCompare,
      checkCase,
      checkPunctuation
    );
    setFirstPassAccuracy(correctness);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (isDialogueMode) {
        handleDialogueKeyPress();
      } else {
        handleNormalKeyPress();
      }
    }
  };

  const handleDialogueKeyPress = () => {
    const currentLine = script.split('\n')[scriptLineNumber];
    const myTurn = isMyTurn(scriptLineNumber);

    if (myTurn) {
      // It's my turn to speak - always show diff comparison
      // Check if their input matches the expected line (without "Me: " prefix)
      const expected = getLineContent(currentLine);
      const diffObj = Diff.diffWords(
        applyLineSettings(attempt, checkCase, checkPunctuation),
        applyLineSettings(expected, checkCase, checkPunctuation)
      );
      const diffFound = <Typography component="span">{diffObj.map(getStyledPart)}</Typography>;
      setDifference(diffFound);
      const levenshteinCorrectness = calculateLevenshteinCorrectness(attempt, expected, checkCase, checkPunctuation);
      setCorrectness(levenshteinCorrectness);

      if (firstAttempts.split('\n').length - 1 == scriptLineNumber) {
        setFirstAttempts(firstAttempts + attempt + '\n');
      }

      let sound = './ok.mp3';
      if (levenshteinCorrectness >= minimumCorrectness) {
        setGif(happyGif);
        setSuccess(true);
        setScriptLineNumber(scriptLineNumber + 1);
      } else {
        setGif(sadGif);
        setSuccess(false);
        sound = './fail.mp3';
      }
      if (enableSound) {
        new Audio(sound).play();
      }
      setAttempt('');
    } else {
      // It's their turn to speak
      if (attempt.trim() !== '') {
        // User typed something when they should have just pressed enter - this is an error
        setGif(sadGif);
        setSuccess(false);
        setCorrectness(0);
        setDifference(
          <Typography component="span" style={{ color: 'red' }}>
            {`It's not your turn to speak!`}
          </Typography>
        );
        if (enableSound) {
          new Audio('./fail.mp3').play();
        }
        setAttempt('');
        return;
      }

      // User correctly pressed enter without typing - show their line and advance
      const theirLine = getLineContent(currentLine);
      setDifference(
        <Typography component="span" style={{ color: 'blue', fontStyle: 'italic' }}>
          Them: {theirLine}
        </Typography>
      );
      setCorrectness(100);
      setGif(happyGif);
      setSuccess(true);
      setScriptLineNumber(scriptLineNumber + 1);

      if (firstAttempts.split('\n').length - 1 == scriptLineNumber) {
        setFirstAttempts(firstAttempts + '\n');
      }

      if (enableSound) {
        new Audio('./ok.mp3').play();
      }
    }
  };

  const handleNormalKeyPress = () => {
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
    let sound = './ok.mp3';
    if (levenshteinCorrectness >= minimumCorrectness) {
      setGif(happyGif);
      setSuccess(true);
      setScriptLineNumber(scriptLineNumber + 1);
    } else {
      setGif(sadGif);
      setSuccess(false);
      sound = './fail.mp3';
    }
    if (enableSound) {
      new Audio(sound).play();
    }
    setAttempt('');
  };

  const isFinished = () => {
    return scriptLineNumber == script.split('\n').length;
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: '#64d989',
      },
    },
  });

  const Footer = () => {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" paddingY={10}>
        <a href="http://hits.dwyl.com/harrynash/learnascript">
          <img src="https://hits.dwyl.com/harrynash/learnascript.svg?style=flat-square&show=unique" alt="HitCount" />
        </a>
        <Link href="https://linktr.ee/harrynash" target="_blank" rel="noopener">
          Built by Harry Nash 🏗️
        </Link>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" alignItems="center">
          <img src={Logo} alt="Logo" style={{ height: '100px' }} />
          <Typography variant="h3" style={{ fontFamily: 'Papyrus' }}>
            Learn a Script
          </Typography>
        </Box>
        {!showNewTextBox && (
          <>
            <Typography fontStyle="italic" align="center" sx={{ marginTop: 2 }} p={2}>
              I find that typing out a script without looking at it is a great way for me to commit it to memory. I
              created this app in order to quickly and reliably identify any mistakes I may have made in my recall. I
              hope you find some use in it too!
            </Typography>
            <Box display="flex" alignItems="center" sx={{ marginTop: 2 }}>
              <Switch checked={enableSound} onChange={handleEnableSound} />
              <Typography>Enable Sound</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Switch checked={checkCase} onChange={handleCheckCase} />
              <Typography>Check Upper and Lower Case</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Switch checked={checkPunctuation} onChange={handleCheckPunctuation} />
              <Typography>Check Punctuation</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Input
                value={minimumCorrectness}
                onChange={handleCorrectnessChange}
                inputProps={{
                  step: 5,
                  min: 0,
                  max: 100,
                  type: 'number',
                }}
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
              />
              <Typography sx={{ marginLeft: 1 }}>Correctness to Pass</Typography>
            </Box>
            <Button variant="outlined" onClick={handleTryMonologueMode} sx={{ marginTop: 2 }}>
              Try monologue mode
            </Button>
            <Button variant="outlined" onClick={handleTryDialogueMode} sx={{ marginTop: 2 }}>
              Try dialogue mode
            </Button>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="90%">
              <TextField
                label="Script"
                variant="outlined"
                value={script}
                onChange={handleScriptChange}
                fullWidth
                multiline
                rows={10}
                sx={{ marginTop: 2 }}
              />
            </Box>
            {isDialogueMode && (
              <Typography
                align="center"
                sx={{
                  marginTop: 2,
                  padding: 1,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 1,
                  color: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                {`🎭 Dialogue Mode Detected! Practice conversations with "Me: " and "Them: " lines.`}
              </Typography>
            )}
            <Button variant="contained" onClick={handleClick} sx={{ marginTop: 2 }} disabled={!script.trim()}>
              Practice
            </Button>
          </>
        )}
        {isFinished() && (
          <Button variant="contained" onClick={handleFinishPress} sx={{ marginTop: 2 }}>
            Finish
          </Button>
        )}
        {!isFinished() && showNewTextBox && (
          <>
            <Button onClick={handleFinishPress} sx={{ marginTop: 2 }}>
              Back
            </Button>
            <TextField
              label={`Line ${scriptLineNumber + 1}/${script.split('\n').length}`}
              inputProps={{
                autocomplete: 'new-password',
                form: {
                  autocomplete: 'off',
                },
              }}
              inputRef={inputRef}
              variant="outlined"
              value={attempt}
              onChange={handleAttemptChange}
              onKeyPress={handleKeyPress}
              error={!success}
              fullWidth
              sx={{ maxWidth: '50%', marginTop: 2 }}
            />
          </>
        )}
        {!attempt && showNewTextBox && correctness != -1 && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ marginTop: 2 }}>
            {difference}
            <Typography align="center" style={{ color: success ? 'green' : 'red' }}>
              Correctness: {correctness}%
            </Typography>
            {!isFinished() && (
              <Typography align="center" style={{ color: success ? 'green' : 'red' }}>
                Please try {success ? 'the next line' : 'that line again'}.
              </Typography>
            )}
          </Box>
        )}
        {!attempt && gif && <img src={gif} alt={'reaction'} />}
        {firstPassAccuracy != -1 && (
          <Typography align="center" sx={{ marginTop: 2 }}>
            Total First Pass Correctness: {firstPassAccuracy}%
          </Typography>
        )}
        {endTime != -1 && (
          <Typography align="center">Total Time Taken: {formatDuration(Math.round(endTime - startTime))}</Typography>
        )}
      </Box>
      {!showNewTextBox && <Footer />}
    </ThemeProvider>
  );
};

export default TextBoxWithButton;
