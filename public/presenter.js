const socket = io();

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const roundIntroScreen = document.getElementById('round-intro-screen');
const playingScreen = document.getElementById('playing-screen');
const puzzleScreen = document.getElementById('puzzle-screen');
const wavelengthScreen = document.getElementById('wavelength-screen');
const photoScreen = document.getElementById('photo-screen');
const finaleScreen = document.getElementById('finale-screen');
const finishedScreen = document.getElementById('finished-screen');

// Round intro elements
const roundExplanation = document.getElementById('round-explanation');
const startRoundBtn = document.getElementById('start-round-btn');

// Wavelength elements
const wlNum = document.getElementById('wl-num');
const wlTotal = document.getElementById('wl-total');
const presenterExplainer = document.getElementById('presenter-explainer');
const presenterGuesser = document.getElementById('presenter-guesser');
const targetMarker = document.getElementById('target-marker');
const targetMissLeft = document.getElementById('target-miss-left');
const targetCloseLeft = document.getElementById('target-close-left');
const targetBullseye = document.getElementById('target-bullseye');
const targetCloseRight = document.getElementById('target-close-right');
const targetMissRight = document.getElementById('target-miss-right');
const presenterLabelLeft = document.getElementById('presenter-label-left');
const presenterLabelRight = document.getElementById('presenter-label-right');
const presenterCategory = document.getElementById('presenter-category');
const wavelengthSlider = document.getElementById('wavelength-slider');
const sliderValue = document.getElementById('slider-value');
const revealBtn = document.getElementById('reveal-btn');
const nextWavelengthBtn = document.getElementById('next-wavelength-btn');
const presenterResult = document.getElementById('presenter-result');
const presenterResultScore = document.getElementById('presenter-result-score');
const presenterResultDetail = document.getElementById('presenter-result-detail');
const pairsList = document.getElementById('pairs-list');
const wlScoreboardList = document.getElementById('wl-scoreboard-list');
const wlResetBtn = document.getElementById('wl-reset-btn');
const wavelengthRoundBtn = document.getElementById('wavelength-round-btn');

// Setup elements
const participantInput = document.getElementById('participant-input');
const addParticipantBtn = document.getElementById('add-participant-btn');
const participantsList = document.getElementById('participants-list');
const startGameBtn = document.getElementById('start-game-btn');

// Playing elements
const questionNum = document.getElementById('question-num');
const totalQuestions = document.getElementById('total-questions');
const pointsBadge = document.getElementById('points-badge');
const category = document.getElementById('category');
const question = document.getElementById('question');
const answer = document.getElementById('answer');
const currentAnswerer = document.getElementById('current-answerer');
const nextUp = document.getElementById('next-up');
const scoreboardList = document.getElementById('scoreboard-list');

// Buttons
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const skipBtn = document.getElementById('skip-btn');
const puzzleRoundBtn = document.getElementById('puzzle-round-btn');
const resetBtn = document.getElementById('reset-btn');
const newGameBtn = document.getElementById('new-game-btn');

// Puzzle elements
const puzzleNumEl = document.getElementById('puzzle-num');
const totalPuzzlesEl = document.getElementById('total-puzzles');
const activePlayerCard = document.getElementById('active-player-card');
const activePlayerName = document.getElementById('active-player-name');
const activeTimer = document.getElementById('active-timer');
const passBtn = document.getElementById('pass-btn');
const passingIndicator = document.getElementById('passing-indicator');
const solutionsButtons = document.getElementById('solutions-buttons');
const turnOrderList = document.getElementById('turn-order-list');
const solvedList = document.getElementById('solved-list');
const puzzleScoreboardList = document.getElementById('puzzle-scoreboard-list');
const nextPuzzleBtn = document.getElementById('next-puzzle-btn');
const backToQuestionsBtn = document.getElementById('back-to-questions-btn');
const puzzleResetBtn = document.getElementById('puzzle-reset-btn');

// Photo elements
const photoPlayerNumEl = document.getElementById('photo-player-num');
const photoTotalPlayersEl = document.getElementById('photo-total-players');
const photoSelectSection = document.getElementById('photo-select-section');
const playerSelectButtons = document.getElementById('player-select-buttons');
const photoPlayingSection = document.getElementById('photo-playing-section');
const presenterPhotoPlayer = document.getElementById('presenter-photo-player');
const presenterPhotoTimer = document.getElementById('presenter-photo-timer');
const presenterPhotoNum = document.getElementById('presenter-photo-num');
const presenterPhotoImg = document.getElementById('presenter-photo-img');
const photoAnswerText = document.getElementById('photo-answer-text');
const photoCorrectBtn = document.getElementById('photo-correct-btn');
const photoSkipBtn = document.getElementById('photo-skip-btn');
const photoSupplementSection = document.getElementById('photo-supplement-section');
const presenterSupplementPlayer = document.getElementById('presenter-supplement-player');
const skippedPhotosGrid = document.getElementById('skipped-photos-grid');
const supplementCorrectBtn = document.getElementById('supplement-correct-btn');
const supplementNextBtn = document.getElementById('supplement-next-btn');
const photoReviewSection = document.getElementById('photo-review-section');
const reviewPhotosGrid = document.getElementById('review-photos-grid');
const photoNextPlayerBtn = document.getElementById('photo-next-player-btn');
const photoShowReviewBtn = document.getElementById('photo-show-review-btn');
const photoCorrectCount = document.getElementById('photo-correct-count');
const photoSkippedCount = document.getElementById('photo-skipped-count');
const photoPresenterScoreboard = document.getElementById('photo-presenter-scoreboard');
const photoResetBtn = document.getElementById('photo-reset-btn');

// Finale elements
const finaleNum = document.getElementById('finale-num');
const finaleTotal = document.getElementById('finale-total');
const finaleActiveName = document.getElementById('finale-active-name');
const finaleActiveTimer = document.getElementById('finale-active-timer');
const presenterFinaleTopic = document.getElementById('presenter-finale-topic');
const finaleAnswerButtons = document.getElementById('finale-answer-buttons');
const finalePassBtn = document.getElementById('finale-pass-btn');
const finalePauseBtn = document.getElementById('finale-pause-btn');
const finaleRevealBtn = document.getElementById('finale-reveal-btn');
const nextTopicBtn = document.getElementById('next-topic-btn');
const finalistCard1 = document.getElementById('finalist-card-1');
const fcName1 = document.getElementById('fc-name-1');
const fcTime1 = document.getElementById('fc-time-1');
const finalistCard2 = document.getElementById('finalist-card-2');
const fcName2 = document.getElementById('fc-name-2');
const fcTime2 = document.getElementById('fc-time-2');
const foundCount = document.getElementById('found-count');
const foundAnswersList = document.getElementById('found-answers-list');
const finaleResetBtn = document.getElementById('finale-reset-btn');

// Final
const finalScoreboard = document.getElementById('final-scoreboard');

// Local state
let participants = [];
let currentState = null;

// Setup phase handlers
participantInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addParticipant();
});

addParticipantBtn.addEventListener('click', addParticipant);

function addParticipant() {
  const name = participantInput.value.trim();
  if (name && !participants.includes(name)) {
    participants.push(name);
    renderParticipants();
    participantInput.value = '';
    participantInput.focus();
    updateStartButton();
  }
}

function removeParticipant(name) {
  participants = participants.filter(p => p !== name);
  renderParticipants();
  updateStartButton();
}

function renderParticipants() {
  participantsList.innerHTML = participants.map(name => `
    <li class="participant-item">
      <span>${name}</span>
      <button class="btn-remove" onclick="removeParticipant('${name}')">×</button>
    </li>
  `).join('');
}

function updateStartButton() {
  startGameBtn.disabled = participants.length < 2;
  startGameBtn.textContent = participants.length < 2 
    ? `Need ${2 - participants.length} more player${participants.length === 1 ? '' : 's'}` 
    : `Start Game (${participants.length} players)`;
}

startGameBtn.addEventListener('click', () => {
  if (participants.length >= 2) {
    socket.emit('startGame', participants);
  }
});

// Game control handlers
correctBtn.addEventListener('click', () => socket.emit('correctAnswer'));
wrongBtn.addEventListener('click', () => socket.emit('wrongAnswer'));
skipBtn.addEventListener('click', () => socket.emit('skipQuestion'));

if (puzzleRoundBtn) {
  puzzleRoundBtn.addEventListener('click', () => {
    socket.emit('startPuzzleRound');
  });
}

resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the game?')) {
    participants = [];
    socket.emit('resetGame');
  }
});

if (puzzleResetBtn) {
  puzzleResetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
      participants = [];
      socket.emit('resetGame');
    }
  });
}

newGameBtn.addEventListener('click', () => {
  participants = [];
  socket.emit('resetGame');
});

// Round intro controls
if (startRoundBtn) {
  startRoundBtn.addEventListener('click', () => {
    socket.emit('startRound');
  });
}

// Puzzle controls
if (passBtn) {
  passBtn.addEventListener('click', () => socket.emit('pass'));
}
if (nextPuzzleBtn) {
  nextPuzzleBtn.addEventListener('click', () => socket.emit('nextPuzzle'));
}
if (backToQuestionsBtn) {
  backToQuestionsBtn.addEventListener('click', () => socket.emit('backToQuestions'));
}

// Wavelength controls
if (wavelengthRoundBtn) {
  wavelengthRoundBtn.addEventListener('click', () => socket.emit('startWavelengthRound'));
}
if (wavelengthSlider) {
  wavelengthSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    socket.emit('wavelengthMove', value);
    if (sliderValue) sliderValue.textContent = value;
  });
}
if (revealBtn) {
  revealBtn.addEventListener('click', () => socket.emit('wavelengthReveal'));
}
if (nextWavelengthBtn) {
  nextWavelengthBtn.addEventListener('click', () => socket.emit('wavelengthNext'));
}
if (wlResetBtn) {
  wlResetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
      participants = [];
      socket.emit('resetGame');
    }
  });
}

// Finale controls
if (finalePassBtn) {
  finalePassBtn.addEventListener('click', () => socket.emit('finalePass'));
}
if (finalePauseBtn) {
  finalePauseBtn.addEventListener('click', () => socket.emit('finalePause'));
}
if (finaleRevealBtn) {
  finaleRevealBtn.addEventListener('click', () => socket.emit('finaleReveal'));
}
if (nextTopicBtn) {
  nextTopicBtn.addEventListener('click', () => socket.emit('finaleNextTopic'));
}
if (finaleResetBtn) {
  finaleResetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
      participants = [];
      socket.emit('resetGame');
    }
  });
}

// Handle game state updates
socket.on('gameState', (state) => {
  currentState = state;
  updateScreen(state.phase);
  
  if (state.phase === 'round-intro') {
    updateRoundIntroScreen(state);
  } else if (state.phase === 'playing') {
    updatePlayingScreen(state);
  } else if (state.phase === 'puzzle') {
    updatePuzzlePresenterScreen(state);
  } else if (state.phase === 'wavelength') {
    updateWavelengthPresenterScreen(state);
  } else if (state.phase === 'photos') {
    updatePhotoPresenterScreen(state);
  } else if (state.phase === 'finale') {
    updateFinalePresenterScreen(state);
  } else if (state.phase === 'finished') {
    updateFinishedScreen(state);
  } else if (state.phase === 'setup') {
    if (participants.length === 0) {
      loadDefaultParticipants();
    }
  }
});

function loadDefaultParticipants() {
  fetch('/api/participants')
    .then(res => res.json())
    .then(defaultParticipants => {
      participants = defaultParticipants;
      renderParticipants();
      updateStartButton();
    })
    .catch(err => console.log('Could not load default participants:', err));
}

function updateScreen(phase) {
  setupScreen.classList.add('hidden');
  if (roundIntroScreen) roundIntroScreen.classList.add('hidden');
  playingScreen.classList.add('hidden');
  if (puzzleScreen) puzzleScreen.classList.add('hidden');
  if (wavelengthScreen) wavelengthScreen.classList.add('hidden');
  if (photoScreen) photoScreen.classList.add('hidden');
  if (finaleScreen) finaleScreen.classList.add('hidden');
  finishedScreen.classList.add('hidden');
  
  if (phase === 'setup') {
    setupScreen.classList.remove('hidden');
  } else if (phase === 'round-intro') {
    if (roundIntroScreen) roundIntroScreen.classList.remove('hidden');
  } else if (phase === 'playing') {
    playingScreen.classList.remove('hidden');
  } else if (phase === 'puzzle') {
    if (puzzleScreen) puzzleScreen.classList.remove('hidden');
  } else if (phase === 'wavelength') {
    if (wavelengthScreen) wavelengthScreen.classList.remove('hidden');
  } else if (phase === 'photos') {
    if (photoScreen) photoScreen.classList.remove('hidden');
  } else if (phase === 'finale') {
    if (finaleScreen) finaleScreen.classList.remove('hidden');
  } else if (phase === 'finished') {
    finishedScreen.classList.remove('hidden');
  }
}

function updateRoundIntroScreen(state) {
  if (!state.roundInfo || !roundExplanation) return;
  
  roundExplanation.innerHTML = state.roundInfo.explanationPresenter;
}

function updatePlayingScreen(state) {
  questionNum.textContent = state.currentQuestionIndex + 1;
  totalQuestions.textContent = state.totalQuestions;
  
  if (state.awardsPoints) {
    pointsBadge.classList.add('active');
  } else {
    pointsBadge.classList.remove('active');
  }
  
  if (state.currentQuestion) {
    category.textContent = state.currentQuestion.category || '';
    question.textContent = state.currentQuestion.question;
    answer.textContent = state.currentQuestion.answer;
  }
  
  currentAnswerer.textContent = state.currentAnswerer || 'No one';
  
  if (state.buzzOrder && state.buzzOrder.length > 1) {
    nextUp.textContent = state.buzzOrder.slice(1, 3).join(', ');
  } else {
    nextUp.textContent = '-';
  }
  
  updateScoreboard(state.scores, scoreboardList, false, true);
}

function updatePuzzlePresenterScreen(state) {
  if (!puzzleNumEl || !totalPuzzlesEl) return;
  
  puzzleNumEl.textContent = state.currentPuzzleIndex + 1;
  totalPuzzlesEl.textContent = state.totalPuzzles;
  
  // Active player and timer
  if (activePlayerName && activeTimer) {
    activePlayerName.textContent = state.puzzleActivePlayer || '-';
    const time = state.scores[state.puzzleActivePlayer] || 0;
    activeTimer.textContent = time;
    
    // Color based on time
    if (time <= 10) {
      activeTimer.className = 'active-timer danger';
    } else if (time <= 30) {
      activeTimer.className = 'active-timer warning';
    } else {
      activeTimer.className = 'active-timer';
    }
  }
  
  // Disable pass button during switch (no visual indicator)
  if (passBtn) {
    passBtn.disabled = state.isPassing;
  }
  
  // Turn order
  if (turnOrderList && state.puzzleTurnOrder) {
    turnOrderList.innerHTML = state.puzzleTurnOrder.map((name, idx) => {
      const isActive = name === state.puzzleActivePlayer;
      const time = state.scores[name] || 0;
      return `<li class="${isActive ? 'active' : ''}">
        <span class="turn-name">${name}</span>
        <span class="turn-time">${time}s</span>
      </li>`;
    }).join('');
  }
  
  // Solution buttons
  if (state.currentPuzzle && solutionsButtons) {
    const allSolved = state.solvedGroups.length >= state.currentPuzzle.solutions.length;
    
    solutionsButtons.innerHTML = state.currentPuzzle.solutions.map((sol, idx) => {
      const color = state.puzzleColors[idx];
      const isSolved = state.solvedGroups.includes(sol);
      return `
        <button class="btn solution-btn ${isSolved ? 'solved' : ''}" 
                style="--solution-color: ${color}"
                onclick="solveSolution('${sol}')"
                ${isSolved || allSolved ? 'disabled' : ''}>
          <span class="solution-text">${sol}</span>
          ${isSolved ? '<span class="solved-check">✓</span>' : '<span class="solution-hint">+20 sec</span>'}
        </button>
      `;
    }).join('');
  }
  
  // Solved list
  if (solvedList) {
    if (state.solvedGroups && state.solvedGroups.length > 0) {
      solvedList.innerHTML = state.solvedGroups.map(sol => `<li>✓ ${sol}</li>`).join('');
    } else {
      solvedList.innerHTML = '<li class="empty">No solutions found yet</li>';
    }
  }
  
  if (puzzleScoreboardList) {
    updateScoreboard(state.scores, puzzleScoreboardList, false, true);
  }
}

function updateWavelengthPresenterScreen(state) {
  if (!wlNum || !wlTotal) return;
  
  wlNum.textContent = state.currentWavelengthIndex + 1;
  wlTotal.textContent = state.totalWavelengthRounds;
  
  // Current pair
  if (state.currentWavelengthPair) {
    if (presenterExplainer) presenterExplainer.textContent = state.currentWavelengthPair.explainer;
    if (presenterGuesser) presenterGuesser.textContent = state.currentWavelengthPair.guesser;
  }
  
  // Target visual slider (only presenter sees)
  const target = state.wavelengthTarget;
  if (targetMarker) {
    targetMarker.style.left = `${target}%`;
  }
  // Position target zones (bullseye=4, close=12)
  if (targetMissLeft) {
    targetMissLeft.style.left = '0%';
    targetMissLeft.style.width = `${Math.max(0, target - 12)}%`;
  }
  if (targetCloseLeft) {
    targetCloseLeft.style.left = `${Math.max(0, target - 12)}%`;
    targetCloseLeft.style.width = `${Math.min(8, target - 4 - Math.max(0, target - 12))}%`;
  }
  if (targetBullseye) {
    targetBullseye.style.left = `${Math.max(0, target - 4)}%`;
    targetBullseye.style.width = '8%';
  }
  if (targetCloseRight) {
    targetCloseRight.style.left = `${target + 4}%`;
    targetCloseRight.style.width = `${Math.min(8, 100 - (target + 4))}%`;
  }
  if (targetMissRight) {
    targetMissRight.style.left = `${Math.min(100, target + 12)}%`;
    targetMissRight.style.width = `${Math.max(0, 100 - (target + 12))}%`;
  }
  
  // Card labels
  if (state.currentWavelengthCard) {
    if (presenterLabelLeft) presenterLabelLeft.textContent = state.currentWavelengthCard.left;
    if (presenterLabelRight) presenterLabelRight.textContent = state.currentWavelengthCard.right;
    if (presenterCategory) presenterCategory.textContent = state.currentWavelengthCard.category;
  }
  
  // Slider position
  if (wavelengthSlider && !state.wavelengthRevealed) {
    wavelengthSlider.value = state.wavelengthGuess;
    wavelengthSlider.disabled = false;
  } else if (wavelengthSlider) {
    wavelengthSlider.disabled = true;
  }
  if (sliderValue) sliderValue.textContent = state.wavelengthGuess;
  
  // Buttons
  if (revealBtn) {
    revealBtn.classList.toggle('hidden', state.wavelengthRevealed);
  }
  if (nextWavelengthBtn) {
    nextWavelengthBtn.classList.toggle('hidden', !state.wavelengthRevealed);
  }
  
  // Result
  if (presenterResult && presenterResultScore && presenterResultDetail) {
    if (state.wavelengthRevealed) {
      presenterResult.classList.remove('hidden');
      
      const results = {
        bullseye: { text: '🎯 BULLSEYE!', detail: '+30 sec voor beide spelers!' },
        close: { text: '✨ DICHTBIJ!', detail: '+10 sec voor beide spelers!' },
        miss: { text: '❌ GEMIST!', detail: '+0 seconden' }
      };
      
      const r = results[state.wavelengthScore] || results.miss;
      presenterResultScore.textContent = r.text;
      presenterResultDetail.textContent = r.detail;
    } else {
      presenterResult.classList.add('hidden');
    }
  }
  
  // Pairs rotation list
  if (pairsList && state.wavelengthPairs) {
    pairsList.innerHTML = state.wavelengthPairs.map((pair, idx) => {
      const isCurrent = idx === state.currentWavelengthIndex;
      const isDone = idx < state.currentWavelengthIndex;
      return `<li class="${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}">
        <span class="pair-explainer">${pair.explainer}</span>
        <span class="pair-arrow">→</span>
        <span class="pair-guesser">${pair.guesser}</span>
        ${isDone ? '<span class="pair-check">✓</span>' : ''}
      </li>`;
    }).join('');
  }
  
  // Scoreboard
  if (wlScoreboardList) {
    updateScoreboard(state.scores, wlScoreboardList, false, true);
  }
}

function updatePhotoPresenterScreen(state) {
  if (!photoScreen) return;
  
  // Update progress
  if (photoPlayerNumEl) photoPlayerNumEl.textContent = state.photoPlayerIndex + 1;
  if (photoTotalPlayersEl) photoTotalPlayersEl.textContent = state.participants.length;
  
  // Show/hide sections based on phase
  if (photoSelectSection) photoSelectSection.classList.toggle('hidden', state.photoPhase !== 'select');
  if (photoPlayingSection) photoPlayingSection.classList.toggle('hidden', state.photoPhase !== 'playing');
  if (photoSupplementSection) photoSupplementSection.classList.toggle('hidden', state.photoPhase !== 'supplement');
  if (photoReviewSection) photoReviewSection.classList.toggle('hidden', state.photoPhase !== 'review');
  if (photoShowReviewBtn) photoShowReviewBtn.classList.toggle('hidden', state.photoPhase !== 'supplement');
  
  // Player selection phase
  if (state.photoPhase === 'select' && playerSelectButtons) {
    // Show buttons for players who haven't played yet
    const playedPlayers = Object.keys(state.photoSetAssignments).slice(0, state.photoPlayerIndex);
    playerSelectButtons.innerHTML = state.participants.map(player => {
      const hasPlayed = playedPlayers.includes(player);
      const hasSet = !!state.photoSetAssignments[player];
      return `
        <button class="btn btn-player-select ${hasPlayed ? 'played' : ''}" 
                onclick="selectPhotoPlayer('${player}')"
                ${hasPlayed || !hasSet ? 'disabled' : ''}>
          ${player}
          ${hasPlayed ? ' ✓' : ''}
        </button>
      `;
    }).join('');
  }
  
  // Playing phase
  if (state.photoPhase === 'playing') {
    if (presenterPhotoPlayer) presenterPhotoPlayer.textContent = state.photoActivePlayer || '-';
    if (presenterPhotoTimer && state.photoActivePlayer) {
      const time = state.scores[state.photoActivePlayer] || 0;
      presenterPhotoTimer.textContent = time;
      presenterPhotoTimer.className = 'photo-active-timer';
      if (time <= 10) presenterPhotoTimer.classList.add('danger');
      else if (time <= 30) presenterPhotoTimer.classList.add('warning');
    }
    if (presenterPhotoNum) presenterPhotoNum.textContent = state.currentPhotoIndex + 1;
    
    // Show current photo
    if (presenterPhotoImg && state.currentPhoto) {
      presenterPhotoImg.src = `/pictures/${state.currentPhoto.file}`;
    }
    
    // Show answer
    if (photoAnswerText && state.currentPhoto) {
      photoAnswerText.textContent = state.currentPhoto.answer;
    }
  }
  
  // Supplement phase
  if (state.photoPhase === 'supplement') {
    if (presenterSupplementPlayer) {
      presenterSupplementPlayer.textContent = state.photoSupplementPlayer || 'Klaar met aanvullen';
    }
    
    // Show skipped photos
    if (skippedPhotosGrid && state.currentPhotoSet) {
      const skipped = state.photoSkippedAnswers.filter(
        idx => !state.photoCorrectAnswers.includes(idx)
      );
      skippedPhotosGrid.innerHTML = skipped.map(idx => {
        const photo = state.currentPhotoSet.photos[idx];
        return `
          <div class="skipped-photo-item">
            <img src="/pictures/${photo.file}" alt="${photo.answer}">
            <div class="skipped-answer">${photo.answer}</div>
          </div>
        `;
      }).join('') || '<p class="no-skipped">Geen open foto\'s meer!</p>';
    }
    
    // Disable supplement correct if no skipped photos left
    if (supplementCorrectBtn) {
      const skipped = state.photoSkippedAnswers.filter(
        idx => !state.photoCorrectAnswers.includes(idx)
      );
      supplementCorrectBtn.disabled = skipped.length === 0;
    }
  }
  
  // Review phase
  if (state.photoPhase === 'review' && reviewPhotosGrid && state.currentPhotoSet) {
    reviewPhotosGrid.innerHTML = state.currentPhotoSet.photos.map((photo, idx) => {
      const isCorrect = state.photoCorrectAnswers.includes(idx);
      return `
        <div class="review-photo-item ${isCorrect ? 'correct' : 'missed'}">
          <img src="/pictures/${photo.file}" alt="${photo.answer}">
          <div class="review-answer">${photo.answer}</div>
          <div class="review-status">${isCorrect ? '✓ Correct' : '✗ Gemist'}</div>
        </div>
      `;
    }).join('');
  }
  
  // Stats
  if (photoCorrectCount) photoCorrectCount.textContent = state.photoCorrectAnswers.length;
  if (photoSkippedCount) {
    const skipped = state.photoSkippedAnswers.filter(
      idx => !state.photoCorrectAnswers.includes(idx)
    );
    photoSkippedCount.textContent = skipped.length;
  }
  
  // Scoreboard
  if (photoPresenterScoreboard) {
    updateScoreboard(state.scores, photoPresenterScoreboard, false, true);
  }
}

function updateFinalePresenterScreen(state) {
  if (!finaleNum || !finaleTotal) return;
  
  finaleNum.textContent = state.currentFinaleTopicIndex + 1;
  finaleTotal.textContent = state.totalFinaleTopics || 5;
  
  // Active player
  if (finaleActiveName) finaleActiveName.textContent = state.finaleActivePlayer || '-';
  if (finaleActiveTimer && state.finaleScores) {
    const time = state.finaleScores[state.finaleActivePlayer] || 0;
    finaleActiveTimer.textContent = time;
    finaleActiveTimer.className = 'finale-active-timer';
    if (time <= 10) finaleActiveTimer.classList.add('danger');
    else if (time <= 30) finaleActiveTimer.classList.add('warning');
  }
  
  // Topic
  if (presenterFinaleTopic && state.currentFinaleTopic) {
    presenterFinaleTopic.textContent = state.currentFinaleTopic.topic;
  }
  
  // Answer buttons
  if (finaleAnswerButtons && state.currentFinaleTopic) {
    const allFound = state.finaleAnswersFound.length >= 5;
    finaleAnswerButtons.innerHTML = state.currentFinaleTopic.answers.map((answer, idx) => {
      const isFound = state.finaleAnswersFound.includes(idx);
      return `
        <button class="btn finale-answer-btn ${isFound ? 'found' : ''}" 
                onclick="finaleCorrect(${idx})"
                ${isFound || allFound ? 'disabled' : ''}>
          ${isFound ? '✓ ' : ''}${answer}
          ${isFound ? '' : '<span class="answer-hint">-20 sec</span>'}
        </button>
      `;
    }).join('');
  }
  
  // Disable pass during passing
  if (finalePassBtn) {
    finalePassBtn.disabled = state.isPassing;
  }
  
  // Pause button state
  if (finalePauseBtn) {
    finalePauseBtn.textContent = state.finalePaused ? '▶️ HERVAT' : '⏸️ PAUZE';
    finalePauseBtn.classList.toggle('paused', state.finalePaused);
  }
  
  // Reveal button state
  if (finaleRevealBtn) {
    finaleRevealBtn.disabled = state.finaleRevealed;
  }
  
  // Finalists scores
  if (state.finalists && state.finalists.length >= 2) {
    const [p1, p2] = state.finalists;
    const t1 = state.finaleScores[p1] || 0;
    const t2 = state.finaleScores[p2] || 0;
    
    if (fcName1) fcName1.textContent = p1;
    if (fcTime1) fcTime1.textContent = t1;
    if (fcName2) fcName2.textContent = p2;
    if (fcTime2) fcTime2.textContent = t2;
    
    if (finalistCard1) {
      finalistCard1.classList.toggle('active', state.finaleActivePlayer === p1);
      finalistCard1.classList.toggle('danger', t1 <= 10);
    }
    if (finalistCard2) {
      finalistCard2.classList.toggle('active', state.finaleActivePlayer === p2);
      finalistCard2.classList.toggle('danger', t2 <= 10);
    }
  }
  
  // Found count
  const found = state.finaleAnswersFound ? state.finaleAnswersFound.length : 0;
  if (foundCount) foundCount.textContent = found;
  
  // Found answers list
  if (foundAnswersList && state.currentFinaleTopic) {
    if (found > 0) {
      foundAnswersList.innerHTML = state.finaleAnswersFound.map(idx => 
        `<li>✓ ${state.currentFinaleTopic.answers[idx]}</li>`
      ).join('');
    } else {
      foundAnswersList.innerHTML = '<li class="empty">Nog geen antwoorden gevonden</li>';
    }
  }
}

function updateFinishedScreen(state) {
  const finishedTitle = document.getElementById('finished-title');
  const winnerDisplay = document.getElementById('winner-display');
  
  // Show finale winner if there is one
  if (state.finaleWinner) {
    if (finishedTitle) finishedTitle.textContent = '🏆 WE HEBBEN EEN WINNAAR! 🏆';
    if (winnerDisplay) {
      winnerDisplay.innerHTML = `<div class="winner-name-presenter">${state.finaleWinner}</div><div class="winner-subtitle-presenter">wint de Quiz Night!</div>`;
    }
  }
  
  updateScoreboard(state.scores, finalScoreboard, true, true);
}

function updateScoreboard(scores, element, sorted = false, useSeconds = false) {
  if (!scores || !element) return;
  
  let entries = Object.entries(scores);
  
  if (sorted) {
    entries.sort((a, b) => b[1] - a[1]);
  }
  
  const unit = useSeconds ? 'sec' : 'pts';
  
  element.innerHTML = entries.map(([name, score], index) => {
    const medal = sorted && index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
    const rankClass = sorted ? `rank-${index + 1}` : '';
    const dangerClass = useSeconds && score <= 10 ? 'danger' : (useSeconds && score <= 30 ? 'warning' : '');
    return `<li class="score-item ${rankClass} ${dangerClass}">
      <span class="player">${medal} ${name}</span>
      <span class="score">${score} ${unit}</span>
    </li>`;
  }).join('');
}

// Solve a solution
function solveSolution(solution) {
  socket.emit('solveSolution', { solution });
}

// Finale correct answer
function finaleCorrect(answerIndex) {
  socket.emit('finaleCorrect', answerIndex);
}

// Photo round controls
if (photoCorrectBtn) {
  photoCorrectBtn.addEventListener('click', () => socket.emit('photoCorrect'));
}
if (photoSkipBtn) {
  photoSkipBtn.addEventListener('click', () => socket.emit('photoSkip'));
}
if (supplementCorrectBtn) {
  supplementCorrectBtn.addEventListener('click', () => socket.emit('photoCorrect'));
}
if (supplementNextBtn) {
  supplementNextBtn.addEventListener('click', () => socket.emit('photoNextSupplement'));
}
if (photoShowReviewBtn) {
  photoShowReviewBtn.addEventListener('click', () => socket.emit('photoShowReview'));
}
if (photoNextPlayerBtn) {
  photoNextPlayerBtn.addEventListener('click', () => socket.emit('photoNextPlayer'));
}
if (photoResetBtn) {
  photoResetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the game?')) {
      participants = [];
      socket.emit('resetGame');
    }
  });
}

// Select photo player
function selectPhotoPlayer(playerName) {
  socket.emit('photoSelectPlayer', playerName);
}

// Make functions available globally
window.removeParticipant = removeParticipant;
window.solveSolution = solveSolution;
window.finaleCorrect = finaleCorrect;
window.selectPhotoPlayer = selectPhotoPlayer;
