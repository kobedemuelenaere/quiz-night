const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static('public'));

// Load all game data
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8'));
const puzzles = JSON.parse(fs.readFileSync(path.join(__dirname, 'puzzles.json'), 'utf8'));
const wavelengthCards = JSON.parse(fs.readFileSync(path.join(__dirname, 'wavelength.json'), 'utf8'));
const finaleTopics = JSON.parse(fs.readFileSync(path.join(__dirname, 'finale.json'), 'utf8'));
const defaultParticipants = JSON.parse(fs.readFileSync(path.join(__dirname, 'participants.json'), 'utf8'));

// Endpoint to get default participants
app.get('/api/participants', (req, res) => {
  res.json(defaultParticipants);
});

// Color palette for puzzle groups
const PUZZLE_COLORS = ['#00d4aa', '#7c3aed', '#f59e0b', '#ef4444'];

// Starting seconds
const STARTING_SECONDS = 60;

// Round info for display
const ROUNDS = {
  questions: {
    number: 1,
    titleEN: 'QUESTION ROUND',
    titleNL: 'VRAAGRONDE',
    explanationPresenter: `
      <h2>🎯 Round 1: VRAAGRONDE</h2>
      <p>Iedereen start met <strong>60 seconden</strong> op de klok.</p>
      <p>Er worden vragen gesteld. De persoon die aan de beurt is mag als eerste antwoorden.</p>
      <p><strong>Fout?</strong> → De volgende persoon mag proberen.</p>
      <p><strong>Juist?</strong> → Die persoon mag volgende vraag als eerste antwoorden.</p>
      <p>⭐ <strong>Elke 3de vraag</strong> (vraag 3, 6, 9, 12) is een <strong>PUNTEN VRAAG</strong> → +20 seconden!</p>
    `
  },
  wavelength: {
    number: 2,
    titleEN: 'WAVELENGTH',
    titleNL: 'WAVELENGTH',
    explanationPresenter: `
      <h2>📻 Round 2: WAVELENGTH</h2>
      <p>Dit is een teamronde! Jullie spelen in <strong>duo's</strong>.</p>
      <p>Er verschijnt een slider met twee uitersten (bijv. "Lelijk" ↔ "Mooi").</p>
      <p><strong>De UITLEGGER</strong> ziet waar de target staat en geeft een hint/voorbeeld.</p>
      <p><strong>De RADER</strong> zegt "meer links" of "meer rechts" - de presentator beweegt de slider.</p>
      <p>Bij ENTER wordt onthuld hoe dicht jullie zijn:</p>
      <p>🎯 <strong>Bullseye</strong> = +30 sec voor BEIDE spelers!</p>
      <p>✨ <strong>Dichtbij</strong> = +10 sec voor BEIDE spelers!</p>
      <p>❌ <strong>Mis</strong> = 0 seconden</p>
      <p>Iedereen legt 1x uit en raadt 1x!</p>
    `
  },
  puzzle: {
    number: 3,
    titleEN: 'PUZZLE ROUND',
    titleNL: 'PUZZELRONDE',
    explanationPresenter: `
      <h2>🧩 Round 3: PUZZELRONDE</h2>
      <p>Nu wordt het spannend! Er verschijnt een matrix met 12 hints.</p>
      <p>Achter elke 4 hints zit <strong>1 oplossing</strong> (3 oplossingen totaal).</p>
      <p>Eén speler is aan de beurt. Hun tijd loopt af terwijl ze nadenken!</p>
      <p><strong>Juiste oplossing geraden?</strong> → +20 seconden! De tijd blijft lopen.</p>
      <p><strong>Geen idee?</strong> → Zeg "PAS" en de volgende speler is aan de beurt.</p>
      <p>⏱️ Elke puzzel start met een andere speler (eerlijke rotatie).</p>
    `
  },
  finale: {
    number: 4,
    titleEN: 'FINALE',
    titleNL: 'DE FINALE',
    explanationPresenter: `
      <h2>🏆 FINALE: HEAD TO HEAD</h2>
      <p>De <strong>TOP 2</strong> spelers gaan de strijd aan!</p>
      <p>Er komt een onderwerp met <strong>5 mogelijke antwoorden</strong>.</p>
      <p>Degene met de <strong>laagste score</strong> begint.</p>
      <p>Je tijd loopt af terwijl je nadenkt!</p>
      <p><strong>Correct antwoord?</strong> → -20 sec van je tegenstander!</p>
      <p><strong>Geen idee?</strong> → Zeg "PAS" en de ander mag aanvullen.</p>
      <p>De ronde stopt bij 5 juiste antwoorden of als iemand op 0 staat.</p>
      <p>🏆 <strong>Winnaar</strong> = wie nog tijd over heeft!</p>
    `
  }
};

// Game state
let gameState = {
  phase: 'setup',
  currentRound: null,
  participants: [],
  currentQuestionIndex: 0,
  currentAnswererIndex: 0,
  buzzOrder: [],
  lastWinnerIndex: null,
  scores: {},
  questionsAnswered: 0,
  // Puzzle state
  currentPuzzleIndex: 0,
  revealedClues: [],
  solvedGroups: [],
  shuffledPuzzleGrid: [], // Shuffled grid with original indices
  puzzleActivePlayer: null,
  puzzlePlayerIndex: 0,
  timerRunning: false,
  isPassing: false,
  // Wavelength state
  wavelengthPairs: [],
  usedWavelengthCards: [], // Track which cards have been used
  currentWavelengthIndex: 0,
  currentWavelengthCard: null,
  wavelengthTarget: 0,
  wavelengthGuess: 50,
  wavelengthRevealed: false,
  wavelengthScore: null,
  // Finale state
  finalists: [], // Top 2 players
  finaleScores: {}, // Separate scores for finale
  currentFinaleTopicIndex: 0,
  currentFinaleTopic: null,
  finaleActivePlayer: null,
  finaleAnswersFound: [], // Which answers have been found
  finaleWinner: null,
  finalePaused: false, // Pause state for finale
  finaleRevealed: false, // Whether answers are revealed
  finaleTopicStarter: null // Who started the current topic
};

// Timer interval
let timerInterval = null;

// Reset game state
function resetGame() {
  stopTimer();
  gameState = {
    phase: 'setup',
    currentRound: null,
    participants: [],
    currentQuestionIndex: 0,
    currentAnswererIndex: 0,
    buzzOrder: [],
    lastWinnerIndex: null,
    scores: {},
    questionsAnswered: 0,
    currentPuzzleIndex: 0,
    revealedClues: [],
    solvedGroups: [],
    shuffledPuzzleGrid: [],
    puzzleActivePlayer: null,
    puzzlePlayerIndex: 0,
    timerRunning: false,
    isPassing: false,
    wavelengthPairs: [],
    usedWavelengthCards: [],
    currentWavelengthIndex: 0,
    currentWavelengthCard: null,
    wavelengthTarget: 0,
    wavelengthGuess: 50,
    wavelengthRevealed: false,
    wavelengthScore: null,
    finalists: [],
    finaleScores: {},
    currentFinaleTopicIndex: 0,
    currentFinaleTopic: null,
    finaleActivePlayer: null,
    finaleAnswersFound: [],
    finaleWinner: null,
    finalePaused: false,
    finaleRevealed: false,
    finaleTopicStarter: null
  };
}

// Get current question
function getCurrentQuestion() {
  if (gameState.currentQuestionIndex < questions.length) {
    return questions[gameState.currentQuestionIndex];
  }
  return null;
}

// Get current puzzle
function getCurrentPuzzle() {
  if (gameState.currentPuzzleIndex < puzzles.length) {
    return puzzles[gameState.currentPuzzleIndex];
  }
  return null;
}

// Shuffle puzzle grid and store with original indices
function shufflePuzzleGrid() {
  const puzzle = getCurrentPuzzle();
  if (!puzzle) {
    gameState.shuffledPuzzleGrid = [];
    return;
  }
  
  // Create array with original indices
  const gridWithIndices = puzzle.grid.map((cell, index) => ({
    ...cell,
    originalIndex: index
  }));
  
  // Fisher-Yates shuffle
  for (let i = gridWithIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridWithIndices[i], gridWithIndices[j]] = [gridWithIndices[j], gridWithIndices[i]];
  }
  
  gameState.shuffledPuzzleGrid = gridWithIndices;
}

// Check if current question awards points (every 3rd question)
function currentQuestionAwardsPoints() {
  return (gameState.currentQuestionIndex + 1) % 3 === 0;
}

// Get current answerer
function getCurrentAnswerer() {
  if (gameState.buzzOrder.length > 0) {
    return gameState.buzzOrder[0];
  }
  return null;
}

// Setup buzz order for a new question
// Order starts from the winner and continues in circle (Pauline → Edith → Laurence → ...)
function setupBuzzOrder() {
  const participants = gameState.participants;
  const numPlayers = participants.length;
  
  // Start from lastWinnerIndex, or 0 if no winner yet
  const startIndex = gameState.lastWinnerIndex !== null ? gameState.lastWinnerIndex : 0;
  
  // Build order starting from startIndex, wrapping around
  const order = [];
  for (let i = 0; i < numPlayers; i++) {
    order.push(participants[(startIndex + i) % numPlayers]);
  }
  
  gameState.buzzOrder = order;
}

// Create wavelength pairs - everyone explains once, guesses once, fully shuffled
function createWavelengthPairs() {
  const players = [...gameState.participants];
  const n = players.length;
  
  const explainers = [...players];
  const guessers = [...players];
  
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [explainers[i], explainers[j]] = [explainers[j], explainers[i]];
  }
  
  let validShuffle = false;
  let attempts = 0;
  
  while (!validShuffle && attempts < 100) {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [guessers[i], guessers[j]] = [guessers[j], guessers[i]];
    }
    
    validShuffle = true;
    for (let i = 0; i < n; i++) {
      if (explainers[i] === guessers[i]) {
        validShuffle = false;
        break;
      }
    }
    attempts++;
  }
  
  for (let i = 0; i < n; i++) {
    if (explainers[i] === guessers[i]) {
      const nextIdx = (i + 1) % n;
      [guessers[i], guessers[nextIdx]] = [guessers[nextIdx], guessers[i]];
    }
  }
  
  const pairs = [];
  for (let i = 0; i < n; i++) {
    pairs.push({
      explainer: explainers[i],
      guesser: guessers[i]
    });
  }
  
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  return pairs;
}

// Setup new wavelength card (picks from unused cards)
function setupWavelengthCard() {
  // Get available cards (not yet used)
  const availableIndices = wavelengthCards
    .map((_, idx) => idx)
    .filter(idx => !gameState.usedWavelengthCards.includes(idx));
  
  // If all cards used, reset (shouldn't happen if we have enough cards)
  if (availableIndices.length === 0) {
    gameState.usedWavelengthCards = [];
    availableIndices.push(...wavelengthCards.map((_, idx) => idx));
  }
  
  // Pick a random unused card
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  const cardIndex = availableIndices[randomIndex];
  
  gameState.usedWavelengthCards.push(cardIndex);
  gameState.currentWavelengthCard = wavelengthCards[cardIndex];
  gameState.wavelengthTarget = Math.floor(Math.random() * 80) + 10;
  gameState.wavelengthGuess = 50;
  gameState.wavelengthRevealed = false;
  gameState.wavelengthScore = null;
}

// Calculate wavelength score based on distance
function calculateWavelengthScore(guess, target) {
  const distance = Math.abs(guess - target);
  
  if (distance <= 4) {
    return { score: 'bullseye', seconds: 30 };
  } else if (distance <= 12) {
    return { score: 'close', seconds: 10 };
  } else {
    return { score: 'miss', seconds: 0 };
  }
}

// Get top 2 players by score
function getTop2Players() {
  const sorted = Object.entries(gameState.scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  return sorted.map(([name, score]) => ({ name, score }));
}

// Start puzzle round
function startPuzzleRound() {
  gameState.phase = 'puzzle';
  gameState.currentPuzzleIndex = 0;
  gameState.revealedClues = [];
  gameState.solvedGroups = [];
  gameState.puzzlePlayerIndex = 0;
  gameState.isPassing = false;
  
  gameState.participants.forEach(p => {
    if (gameState.scores[p] === undefined) {
      gameState.scores[p] = STARTING_SECONDS;
    }
  });
  
  shufflePuzzleGrid(); // Shuffle the grid
  // First puzzle starts with player 0
  const startIndex = gameState.currentPuzzleIndex % gameState.participants.length;
  gameState.puzzleActivePlayer = gameState.participants[startIndex];
  startTimer();
}

// Start wavelength round
function startWavelengthRound() {
  gameState.phase = 'wavelength';
  gameState.wavelengthPairs = createWavelengthPairs();
  gameState.usedWavelengthCards = []; // Reset used cards for new round
  gameState.currentWavelengthIndex = 0;
  setupWavelengthCard();
}

// Start finale round
function startFinaleRound() {
  gameState.phase = 'finale';
  
  // Get top 2 players
  const top2 = getTop2Players();
  gameState.finalists = top2.map(p => p.name);
  
  // Copy their scores to finale scores
  gameState.finaleScores = {};
  top2.forEach(p => {
    gameState.finaleScores[p.name] = p.score;
  });
  
  gameState.currentFinaleTopicIndex = 0;
  gameState.finaleWinner = null;
  
  setupFinaleTopic();
}

// Setup new finale topic
function setupFinaleTopic() {
  if (gameState.currentFinaleTopicIndex >= finaleTopics.length) {
    // Reshuffle topics if we run out
    gameState.currentFinaleTopicIndex = 0;
  }
  
  // Pick next topic
  gameState.currentFinaleTopic = finaleTopics[gameState.currentFinaleTopicIndex];
  gameState.finaleAnswersFound = [];
  gameState.finalePaused = false;
  gameState.finaleRevealed = false;
  
  // Player with lowest score starts
  const [p1, p2] = gameState.finalists;
  const s1 = gameState.finaleScores[p1] || 0;
  const s2 = gameState.finaleScores[p2] || 0;
  
  gameState.finaleActivePlayer = s1 <= s2 ? p1 : p2;
  gameState.finaleTopicStarter = gameState.finaleActivePlayer; // Remember who started
  
  // Start timer
  startFinaleTimer();
}

// Start finale timer
function startFinaleTimer() {
  stopTimer();
  gameState.timerRunning = true;
  gameState.isPassing = false;
  
  timerInterval = setInterval(() => {
    if (gameState.phase !== 'finale' || !gameState.timerRunning || gameState.isPassing || gameState.finalePaused) {
      return;
    }
    
    const player = gameState.finaleActivePlayer;
    if (player && gameState.finaleScores[player] !== undefined) {
      gameState.finaleScores[player] = Math.max(0, gameState.finaleScores[player] - 1);
      
      // Check if player reached 0
      if (gameState.finaleScores[player] <= 0) {
        stopTimer();
        // Other player wins!
        const otherPlayer = gameState.finalists.find(p => p !== player);
        gameState.finaleWinner = otherPlayer;
        gameState.phase = 'finished';
      }
      
      broadcastState();
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  gameState.timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Start the puzzle countdown timer
function startTimer() {
  stopTimer();
  gameState.timerRunning = true;
  
  timerInterval = setInterval(() => {
    if (gameState.phase !== 'puzzle' || !gameState.timerRunning || gameState.isPassing) {
      return;
    }
    
    const player = gameState.puzzleActivePlayer;
    if (player && gameState.scores[player] !== undefined) {
      gameState.scores[player] = Math.max(0, gameState.scores[player] - 1);
      broadcastState();
    }
  }, 1000);
}

// Move to next player in puzzle round
function nextPuzzlePlayer() {
  const numPlayers = gameState.participants.length;
  // Find current player's index in participants array
  const currentIndex = gameState.participants.indexOf(gameState.puzzleActivePlayer);
  // Next player is simply the next one in the list (wrapping around)
  const nextIndex = (currentIndex + 1) % numPlayers;
  gameState.puzzleActivePlayer = gameState.participants[nextIndex];
}

// Get the turn order for current puzzle (starting from whoever starts this puzzle)
function getPuzzleTurnOrder() {
  const numPlayers = gameState.participants.length;
  const startIndex = gameState.currentPuzzleIndex % numPlayers;
  
  const order = [];
  for (let i = 0; i < numPlayers; i++) {
    order.push(gameState.participants[(startIndex + i) % numPlayers]);
  }
  return order;
}

// Switch finale active player
function switchFinalePlayer() {
  const otherPlayer = gameState.finalists.find(p => p !== gameState.finaleActivePlayer);
  gameState.finaleActivePlayer = otherPlayer;
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  broadcastState();
  
  // Presenter starts game with participants
  socket.on('startGame', (participants) => {
    gameState.participants = participants;
    gameState.currentQuestionIndex = 0;
    gameState.scores = {};
    participants.forEach(p => gameState.scores[p] = STARTING_SECONDS);
    
    gameState.phase = 'round-intro';
    gameState.currentRound = 'questions';
    
    broadcastState();
  });
  
  // Start the actual round after intro
  socket.on('startRound', () => {
    if (gameState.currentRound === 'questions') {
      gameState.phase = 'playing';
      setupBuzzOrder();
    } else if (gameState.currentRound === 'puzzle') {
      startPuzzleRound();
    } else if (gameState.currentRound === 'wavelength') {
      startWavelengthRound();
    } else if (gameState.currentRound === 'finale') {
      startFinaleRound();
    }
    broadcastState();
  });
  
  // Presenter marks answer as correct
  socket.on('correctAnswer', () => {
    const answerer = getCurrentAnswerer();
    if (!answerer) return;
    
    if (currentQuestionAwardsPoints()) {
      gameState.scores[answerer] = (gameState.scores[answerer] || 0) + 20;
    }
    
    gameState.lastWinnerIndex = gameState.participants.indexOf(answerer);
    gameState.currentQuestionIndex++;
    gameState.questionsAnswered++;
    
    if (gameState.currentQuestionIndex >= questions.length) {
      gameState.phase = 'round-intro';
      gameState.currentRound = 'wavelength';
    } else {
      setupBuzzOrder();
    }
    
    broadcastState();
  });
  
  // Presenter marks answer as wrong
  socket.on('wrongAnswer', () => {
    if (gameState.buzzOrder.length > 1) {
      const wrongAnswerer = gameState.buzzOrder.shift();
      gameState.buzzOrder.push(wrongAnswerer);
    } else {
      gameState.currentQuestionIndex++;
      gameState.questionsAnswered++;
      
      if (gameState.currentQuestionIndex >= questions.length) {
        gameState.phase = 'round-intro';
        gameState.currentRound = 'wavelength';
      } else {
        setupBuzzOrder();
      }
    }
    
    broadcastState();
  });
  
  // Skip question
  socket.on('skipQuestion', () => {
    gameState.currentQuestionIndex++;
    gameState.questionsAnswered++;
    
    if (gameState.currentQuestionIndex >= questions.length) {
      gameState.phase = 'round-intro';
      gameState.currentRound = 'wavelength';
    } else {
      setupBuzzOrder();
    }
    
    broadcastState();
  });
  
  // Start puzzle round manually
  socket.on('startPuzzleRound', () => {
    gameState.phase = 'round-intro';
    gameState.currentRound = 'puzzle';
    broadcastState();
  });
  
  // Start wavelength round manually
  socket.on('startWavelengthRound', () => {
    gameState.phase = 'round-intro';
    gameState.currentRound = 'wavelength';
    broadcastState();
  });
  
  // Start finale round manually
  socket.on('startFinaleRound', () => {
    gameState.phase = 'round-intro';
    gameState.currentRound = 'finale';
    broadcastState();
  });
  
  // Solve a solution (puzzle round)
  socket.on('solveSolution', ({ solution }) => {
    const puzzle = getCurrentPuzzle();
    if (!puzzle) return;
    
    if (gameState.solvedGroups.includes(solution)) return;
    
    const solutionIndex = puzzle.solutions.indexOf(solution);
    if (solutionIndex === -1) return;
    
    const color = PUZZLE_COLORS[solutionIndex];
    
    puzzle.grid.forEach((cell, index) => {
      if (cell.solution === solution) {
        if (!gameState.revealedClues.some(r => r.clueIndex === index)) {
          gameState.revealedClues.push({ clueIndex: index, color, solution });
        }
      }
    });
    
    gameState.solvedGroups.push(solution);
    
    const activePlayer = gameState.puzzleActivePlayer;
    if (activePlayer && gameState.scores[activePlayer] !== undefined) {
      gameState.scores[activePlayer] += 20;
    }
    
    if (gameState.solvedGroups.length >= puzzle.solutions.length) {
      stopTimer();
    }
    
    broadcastState();
  });
  
  // Player passes (puzzle round)
  socket.on('pass', () => {
    if (gameState.phase !== 'puzzle') return;
    
    nextPuzzlePlayer();
    broadcastState();
    
    // Timer keeps running, just switched to next player
    if (!gameState.timerRunning) {
      startTimer();
    }
  });
  
  // Next puzzle
  socket.on('nextPuzzle', () => {
    stopTimer();
    gameState.currentPuzzleIndex++;
    gameState.revealedClues = [];
    gameState.solvedGroups = [];
    gameState.puzzlePlayerIndex = 0;
    gameState.isPassing = false;
    
    if (gameState.currentPuzzleIndex >= puzzles.length) {
      // Go to finale after puzzles
      gameState.phase = 'round-intro';
      gameState.currentRound = 'finale';
    } else {
      shufflePuzzleGrid(); // Shuffle the grid for new puzzle
      const baseIndex = gameState.currentPuzzleIndex % gameState.participants.length;
      gameState.puzzleActivePlayer = gameState.participants[baseIndex];
      startTimer();
    }
    
    broadcastState();
  });
  
  // Back to questions
  socket.on('backToQuestions', () => {
    stopTimer();
    gameState.phase = 'playing';
    broadcastState();
  });
  
  // Wavelength: Move slider
  socket.on('wavelengthMove', (position) => {
    if (gameState.phase !== 'wavelength' || gameState.wavelengthRevealed) return;
    gameState.wavelengthGuess = Math.max(0, Math.min(100, position));
    broadcastState();
  });
  
  // Wavelength: Reveal result
  socket.on('wavelengthReveal', () => {
    if (gameState.phase !== 'wavelength' || gameState.wavelengthRevealed) return;
    
    const result = calculateWavelengthScore(gameState.wavelengthGuess, gameState.wavelengthTarget);
    gameState.wavelengthRevealed = true;
    gameState.wavelengthScore = result.score;
    
    const pair = gameState.wavelengthPairs[gameState.currentWavelengthIndex];
    if (pair && result.seconds > 0) {
      if (gameState.scores[pair.explainer] !== undefined) {
        gameState.scores[pair.explainer] += result.seconds;
      }
      if (gameState.scores[pair.guesser] !== undefined) {
        gameState.scores[pair.guesser] += result.seconds;
      }
    }
    
    broadcastState();
  });
  
  // Wavelength: Next card
  socket.on('wavelengthNext', () => {
    if (gameState.phase !== 'wavelength') return;
    
    gameState.currentWavelengthIndex++;
    
    if (gameState.currentWavelengthIndex >= gameState.wavelengthPairs.length) {
      gameState.phase = 'round-intro';
      gameState.currentRound = 'puzzle';
    } else {
      setupWavelengthCard();
    }
    
    broadcastState();
  });
  
  // Finale: Correct answer
  socket.on('finaleCorrect', (answerIndex) => {
    if (gameState.phase !== 'finale' || gameState.finaleWinner) return;
    
    // Mark answer as found
    if (!gameState.finaleAnswersFound.includes(answerIndex)) {
      gameState.finaleAnswersFound.push(answerIndex);
      
      // Subtract 20 seconds from opponent
      const opponent = gameState.finalists.find(p => p !== gameState.finaleActivePlayer);
      if (opponent && gameState.finaleScores[opponent] !== undefined) {
        gameState.finaleScores[opponent] = Math.max(0, gameState.finaleScores[opponent] - 20);
        
        // Check if opponent reached 0
        if (gameState.finaleScores[opponent] <= 0) {
          stopTimer();
          gameState.finaleWinner = gameState.finaleActivePlayer;
          gameState.phase = 'finished';
        }
      }
      
      // Check if all 5 answers found
      if (gameState.finaleAnswersFound.length >= 5) {
        stopTimer();
      }
    }
    
    broadcastState();
  });
  
  // Finale: Pass
  socket.on('finalePass', () => {
    if (gameState.phase !== 'finale' || gameState.finaleWinner) return;
    
    switchFinalePlayer();
    
    // If we're back to the starter, both have passed - auto pause
    if (gameState.finaleActivePlayer === gameState.finaleTopicStarter) {
      gameState.finalePaused = true;
      stopTimer();
    } else {
      // Timer keeps running, just switched to other player
      if (!gameState.timerRunning) {
        startFinaleTimer();
      }
    }
    
    broadcastState();
  });
  
  // Finale: Toggle pause
  socket.on('finalePause', () => {
    if (gameState.phase !== 'finale' || gameState.finaleWinner) return;
    
    gameState.finalePaused = !gameState.finalePaused;
    broadcastState();
  });
  
  // Finale: Reveal all answers
  socket.on('finaleReveal', () => {
    if (gameState.phase !== 'finale') return;
    
    gameState.finaleRevealed = true;
    stopTimer(); // Stop timer when revealing
    broadcastState();
  });
  
  // Finale: Next topic
  socket.on('finaleNextTopic', () => {
    if (gameState.phase !== 'finale' || gameState.finaleWinner) return;
    
    stopTimer();
    gameState.finalePaused = false; // Reset pause when going to next topic
    gameState.finaleRevealed = false; // Reset reveal when going to next topic
    gameState.currentFinaleTopicIndex++;
    setupFinaleTopic();
    
    broadcastState();
  });
  
  // Reset game
  socket.on('resetGame', () => {
    resetGame();
    broadcastState();
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

function broadcastState() {
  const puzzle = getCurrentPuzzle();
  const roundInfo = gameState.currentRound ? ROUNDS[gameState.currentRound] : null;
  const currentPair = gameState.wavelengthPairs[gameState.currentWavelengthIndex] || null;
  
  // Create puzzle with shuffled grid for sending to clients
  let puzzleToSend = null;
  if (puzzle) {
    puzzleToSend = {
      ...puzzle,
      grid: gameState.shuffledPuzzleGrid // Use shuffled grid
    };
  }
  
  io.emit('gameState', {
    ...gameState,
    currentQuestion: getCurrentQuestion(),
    awardsPoints: currentQuestionAwardsPoints(),
    currentAnswerer: getCurrentAnswerer(),
    totalQuestions: questions.length,
    currentPuzzle: puzzleToSend,
    totalPuzzles: puzzles.length,
    puzzleColors: PUZZLE_COLORS,
    puzzleTurnOrder: getPuzzleTurnOrder(),
    roundInfo: roundInfo,
    currentWavelengthPair: currentPair,
    totalWavelengthRounds: gameState.wavelengthPairs.length,
    totalFinaleTopics: finaleTopics.length
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 Quiz Server running on http://localhost:${PORT}`);
  console.log(`\n📺 Participant screen: http://localhost:${PORT}/`);
  console.log(`🎤 Presenter screen:   http://localhost:${PORT}/presenter.html\n`);
});
