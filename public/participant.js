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
const roundNumber = document.getElementById('round-number');
const roundTitle = document.getElementById('round-title');
const roundIcon = document.getElementById('round-icon');

// Wavelength elements
const wavelengthNum = document.getElementById('wavelength-num');
const wavelengthTotal = document.getElementById('wavelength-total');
const explainerName = document.getElementById('explainer-name');
const guesserName = document.getElementById('guesser-name');
const labelLeft = document.getElementById('label-left');
const labelRight = document.getElementById('label-right');
const sliderCategory = document.getElementById('slider-category');
const scoringZones = document.getElementById('scoring-zones');
const scoringLegend = document.getElementById('scoring-legend');
const guessMarker = document.getElementById('guess-marker');
const wavelengthResult = document.getElementById('wavelength-result');
const resultText = document.getElementById('result-text');
const resultPoints = document.getElementById('result-points');
const wavelengthScoreboardList = document.getElementById('wavelength-scoreboard-list');

// Playing elements
const questionNum = document.getElementById('question-num');
const totalQuestions = document.getElementById('total-questions');
const pointsIndicator = document.getElementById('points-indicator');
const currentAnswerer = document.getElementById('current-answerer');
const scoreboardList = document.getElementById('scoreboard-list');

// Puzzle elements
const puzzleNum = document.getElementById('puzzle-num');
const totalPuzzles = document.getElementById('total-puzzles');
const timerPlayerName = document.getElementById('timer-player-name');
const timerCountdown = document.getElementById('timer-countdown');
const bigTimerDisplay = document.getElementById('big-timer-display');
const passingMessage = document.getElementById('passing-message');
const puzzleGrid = document.getElementById('puzzle-grid');
const solvedSolutions = document.getElementById('solved-solutions');
const puzzleScoreboardList = document.getElementById('puzzle-scoreboard-list');

// Photo elements
const photoNum = document.getElementById('photo-num');
const photoPlayerName = document.getElementById('photo-player-name');
const photoPlayerTime = document.getElementById('photo-player-time');
const currentPhotoImg = document.getElementById('current-photo-img');
const photoContainer = document.getElementById('photo-container');
const photoPhaseIndicator = document.getElementById('photo-phase-indicator');
const photoSupplementInfo = document.getElementById('photo-supplement-info');
const supplementPlayerName = document.getElementById('supplement-player-name');
const photoScoreboardList = document.getElementById('photo-scoreboard-list');

// Finished elements
const finalScoreboard = document.getElementById('final-scoreboard');

// Handle game state updates
socket.on('gameState', (state) => {
  updateScreen(state.phase);
  
  if (state.phase === 'round-intro') {
    updateRoundIntroScreen(state);
  } else if (state.phase === 'playing') {
    updatePlayingScreen(state);
  } else if (state.phase === 'puzzle') {
    updatePuzzleScreen(state);
  } else if (state.phase === 'wavelength') {
    updateWavelengthScreen(state);
  } else if (state.phase === 'photos') {
    updatePhotoScreen(state);
  } else if (state.phase === 'finale') {
    updateFinaleScreen(state);
  } else if (state.phase === 'finished') {
    updateFinishedScreen(state);
  }
});

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
  if (!state.roundInfo) return;
  
  if (roundNumber) {
    roundNumber.textContent = `ROUND ${state.roundInfo.number}`;
  }
  if (roundTitle) {
    roundTitle.textContent = state.roundInfo.titleNL;
  }
  if (roundIcon) {
    const icons = { questions: '🎯', puzzle: '🧩', wavelength: '📻', finale: '🏆' };
    roundIcon.textContent = icons[state.currentRound] || '🎮';
  }
}

function updateWavelengthScreen(state) {
  if (!wavelengthNum || !wavelengthTotal) return;
  
  wavelengthNum.textContent = state.currentWavelengthIndex + 1;
  wavelengthTotal.textContent = state.totalWavelengthRounds;
  
  // Current pair
  if (state.currentWavelengthPair) {
    if (explainerName) explainerName.textContent = state.currentWavelengthPair.explainer;
    if (guesserName) guesserName.textContent = state.currentWavelengthPair.guesser;
  }
  
  // Card labels
  if (state.currentWavelengthCard) {
    if (labelLeft) labelLeft.textContent = state.currentWavelengthCard.left;
    if (labelRight) labelRight.textContent = state.currentWavelengthCard.right;
    if (sliderCategory) sliderCategory.textContent = state.currentWavelengthCard.category;
  }
  
  // Guess marker position
  if (guessMarker) {
    guessMarker.style.left = `${state.wavelengthGuess}%`;
  }
  
  // Scoring zones (only show after reveal)
  if (scoringZones) {
    if (state.wavelengthRevealed) {
      scoringZones.classList.remove('hidden');
      // Position zones based on target
      const target = state.wavelengthTarget;
      // bullseye = 4 on each side (8% total), close = 12 on each side
      
      // Calculate zone positions (bullseye=4, close=12)
      const zones = scoringZones.children;
      // Miss left: 0 to (target - 12)
      zones[0].style.left = '0%';
      zones[0].style.width = `${Math.max(0, target - 12)}%`;
      // Close left: (target - 12) to (target - 4)
      zones[1].style.left = `${Math.max(0, target - 12)}%`;
      zones[1].style.width = `${Math.min(8, target - 4 - Math.max(0, target - 12))}%`;
      // Bullseye: (target - 4) to (target + 4)
      zones[2].style.left = `${Math.max(0, target - 4)}%`;
      zones[2].style.width = '8%';
      // Close right: (target + 4) to (target + 12)
      zones[3].style.left = `${target + 4}%`;
      zones[3].style.width = `${Math.min(8, 100 - (target + 4))}%`;
      // Miss right: (target + 12) to 100
      zones[4].style.left = `${Math.min(100, target + 12)}%`;
      zones[4].style.width = `${Math.max(0, 100 - (target + 12))}%`;
    } else {
      scoringZones.classList.add('hidden');
    }
  }
  
  // Scoring legend
  if (scoringLegend) {
    if (state.wavelengthRevealed) {
      scoringLegend.classList.remove('hidden');
    } else {
      scoringLegend.classList.add('hidden');
    }
  }
  
  // Result display
  if (wavelengthResult && resultText && resultPoints) {
    if (state.wavelengthRevealed) {
      wavelengthResult.classList.remove('hidden');
      
      const results = {
        bullseye: { text: '🎯 BULLSEYE!', points: '+30 sec voor beide!', class: 'bullseye' },
        close: { text: '✨ DICHTBIJ!', points: '+10 sec voor beide!', class: 'close' },
        miss: { text: '❌ GEMIST!', points: '+0 seconden', class: 'miss' }
      };
      
      const r = results[state.wavelengthScore] || results.miss;
      resultText.textContent = r.text;
      resultPoints.textContent = r.points;
      wavelengthResult.className = `wavelength-result ${r.class}`;
    } else {
      wavelengthResult.classList.add('hidden');
    }
  }
  
  // Scoreboard
  if (wavelengthScoreboardList) {
    updateScoreboard(state.scores, wavelengthScoreboardList, false, true);
  }
}

function updatePlayingScreen(state) {
  questionNum.textContent = state.currentQuestionIndex + 1;
  totalQuestions.textContent = state.totalQuestions;
  
  if (state.awardsPoints) {
    pointsIndicator.classList.add('active');
  } else {
    pointsIndicator.classList.remove('active');
  }
  
  if (state.currentAnswerer) {
    currentAnswerer.textContent = state.currentAnswerer;
    currentAnswerer.classList.add('pulse');
    setTimeout(() => currentAnswerer.classList.remove('pulse'), 500);
  }
  
  updateScoreboard(state.scores, scoreboardList, false, true);
}

function updatePuzzleScreen(state) {
  if (!puzzleNum || !totalPuzzles || !puzzleGrid) return;
  
  puzzleNum.textContent = state.currentPuzzleIndex + 1;
  totalPuzzles.textContent = state.totalPuzzles;
  
  // Big timer display
  if (timerPlayerName && timerCountdown && bigTimerDisplay) {
    timerPlayerName.textContent = state.puzzleActivePlayer || '-';
    const time = state.scores[state.puzzleActivePlayer] || 0;
    timerCountdown.textContent = time;
    
    // Color based on time
    bigTimerDisplay.classList.remove('danger', 'warning');
    if (time <= 10) {
      bigTimerDisplay.classList.add('danger');
    } else if (time <= 30) {
      bigTimerDisplay.classList.add('warning');
    }
  }
  
  // No passing message - just show the player and their time
  
  // Build grid - all clues shown, revealed ones get colored
  if (state.currentPuzzle) {
    puzzleGrid.innerHTML = state.currentPuzzle.grid.map((cell, index) => {
      // Match by originalIndex (for shuffled grid) or by index (fallback)
      const originalIdx = cell.originalIndex !== undefined ? cell.originalIndex : index;
      const revealed = state.revealedClues.find(r => r.clueIndex === originalIdx);
      const isRevealed = !!revealed;
      const color = revealed ? revealed.color : '';
      
      return `
        <div class="puzzle-cell ${isRevealed ? 'revealed' : ''}" 
             style="${isRevealed ? `--reveal-color: ${color}` : ''}">
          <span class="cell-text">${cell.clue}</span>
        </div>
      `;
    }).join('');
  }
  
  // Show solved solutions with their colors
  if (solvedSolutions && state.currentPuzzle) {
    if (state.solvedGroups && state.solvedGroups.length > 0) {
      solvedSolutions.innerHTML = state.solvedGroups.map((solution) => {
        const colorIndex = state.currentPuzzle.solutions.indexOf(solution);
        const color = state.puzzleColors[colorIndex];
        return `<div class="solved-solution" style="--solution-color: ${color}">
          <span class="solution-icon">✓</span>
          <span class="solution-text">${solution}</span>
        </div>`;
      }).join('');
    } else {
      solvedSolutions.innerHTML = '';
    }
  }
  
  // All players' time
  if (puzzleScoreboardList) {
    updateTimeList(state.scores, state.puzzleActivePlayer, puzzleScoreboardList);
  }
}

function updatePhotoScreen(state) {
  if (!photoScreen) return;
  
  // Update photo counter
  if (photoNum) {
    photoNum.textContent = state.currentPhotoIndex + 1;
  }
  
  // Update player info
  if (photoPlayerName) {
    photoPlayerName.textContent = state.photoActivePlayer || 'Wachten...';
  }
  
  if (photoPlayerTime && state.photoActivePlayer) {
    const time = state.scores[state.photoActivePlayer] || 0;
    photoPlayerTime.textContent = time;
    
    // Color based on time
    const playerDisplay = document.querySelector('.photo-player-display');
    if (playerDisplay) {
      playerDisplay.classList.remove('danger', 'warning');
      if (time <= 10) {
        playerDisplay.classList.add('danger');
      } else if (time <= 30) {
        playerDisplay.classList.add('warning');
      }
    }
  }
  
  // Update phase indicator
  if (photoPhaseIndicator) {
    const phases = {
      'select': 'Wachten op selectie...',
      'playing': `Foto ${state.currentPhotoIndex + 1}/6`,
      'supplement': 'Aanvullen',
      'review': 'Overzicht'
    };
    photoPhaseIndicator.textContent = phases[state.photoPhase] || '';
  }
  
  // Show/hide supplement info
  if (photoSupplementInfo) {
    if (state.photoPhase === 'supplement' && state.photoSupplementPlayer) {
      photoSupplementInfo.classList.remove('hidden');
      if (supplementPlayerName) {
        supplementPlayerName.textContent = state.photoSupplementPlayer;
      }
    } else {
      photoSupplementInfo.classList.add('hidden');
    }
  }
  
  // Update photo display
  if (currentPhotoImg && photoContainer) {
    if (state.photoPhase === 'select') {
      // Waiting for player selection
      photoContainer.classList.add('waiting');
      currentPhotoImg.src = '';
      currentPhotoImg.alt = 'Wachten op speler...';
    } else if (state.photoPhase === 'playing' && state.currentPhoto) {
      // Show current photo
      photoContainer.classList.remove('waiting');
      currentPhotoImg.src = `/pictures/${state.currentPhoto.file}`;
      currentPhotoImg.alt = 'Quiz foto';
    } else if (state.photoPhase === 'supplement') {
      // Show skipped photos during supplement
      const skipped = state.photoSkippedAnswers.filter(
        idx => !state.photoCorrectAnswers.includes(idx)
      );
      if (skipped.length > 0 && state.currentPhotoSet) {
        const firstSkipped = state.currentPhotoSet.photos[skipped[0]];
        if (firstSkipped) {
          currentPhotoImg.src = `/pictures/${firstSkipped.file}`;
          currentPhotoImg.alt = 'Open foto';
        }
      } else {
        currentPhotoImg.src = '';
        currentPhotoImg.alt = 'Geen open foto\'s meer';
      }
    } else if (state.photoPhase === 'review' && state.currentPhotoSet) {
      // Show all photos in review
      photoContainer.innerHTML = `
        <div class="review-grid">
          ${state.currentPhotoSet.photos.map((photo, idx) => {
            const isCorrect = state.photoCorrectAnswers.includes(idx);
            return `
              <div class="review-photo-item ${isCorrect ? 'correct' : 'missed'}">
                <img src="/pictures/${photo.file}" alt="${photo.answer}">
                <div class="review-answer">${photo.answer}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }
  
  // Update scoreboard
  if (photoScoreboardList) {
    updateTimeList(state.scores, state.photoActivePlayer, photoScoreboardList);
  }
}

function updateFinaleScreen(state) {
  const finaleTopicNum = document.getElementById('finale-topic-num');
  const finaleTopicTotal = document.getElementById('finale-topic-total');
  const finalist1Name = document.getElementById('finalist-1-name');
  const finalist1Time = document.getElementById('finalist-1-time');
  const finalist1 = document.getElementById('finalist-1');
  const finalist2Name = document.getElementById('finalist-2-name');
  const finalist2Time = document.getElementById('finalist-2-time');
  const finalist2 = document.getElementById('finalist-2');
  const finaleTopic = document.getElementById('finale-topic');
  const finaleTurnPlayer = document.getElementById('finale-turn-player');
  const answersFound = document.getElementById('answers-found');
  const progressFill = document.getElementById('progress-fill');
  
  if (finaleTopicNum) finaleTopicNum.textContent = state.currentFinaleTopicIndex + 1;
  if (finaleTopicTotal) finaleTopicTotal.textContent = state.totalFinaleTopics || 5;
  
  // Finalists display
  if (state.finalists && state.finalists.length >= 2) {
    const [p1, p2] = state.finalists;
    const t1 = state.finaleScores[p1] || 0;
    const t2 = state.finaleScores[p2] || 0;
    
    if (finalist1Name) finalist1Name.textContent = p1;
    if (finalist1Time) finalist1Time.textContent = t1;
    if (finalist2Name) finalist2Name.textContent = p2;
    if (finalist2Time) finalist2Time.textContent = t2;
    
    // Highlight active player
    if (finalist1) {
      finalist1.classList.toggle('active', state.finaleActivePlayer === p1);
      finalist1.classList.toggle('danger', t1 <= 10);
      finalist1.classList.toggle('warning', t1 > 10 && t1 <= 30);
    }
    if (finalist2) {
      finalist2.classList.toggle('active', state.finaleActivePlayer === p2);
      finalist2.classList.toggle('danger', t2 <= 10);
      finalist2.classList.toggle('warning', t2 > 10 && t2 <= 30);
    }
  }
  
  // Topic
  if (finaleTopic && state.currentFinaleTopic) {
    finaleTopic.textContent = state.currentFinaleTopic.topic;
  }
  
  // Current turn
  if (finaleTurnPlayer) {
    finaleTurnPlayer.textContent = `${state.finaleActivePlayer}'s beurt`;
  }
  
  // Progress
  const found = state.finaleAnswersFound ? state.finaleAnswersFound.length : 0;
  if (answersFound) answersFound.textContent = found;
  if (progressFill) progressFill.style.width = `${(found / 5) * 100}%`;
  
  // Show found/revealed answers
  const finaleAnswersList = document.getElementById('finale-answers-list');
  const finaleAnswersDisplay = document.getElementById('finale-answers-display');
  
  if (finaleAnswersList && state.currentFinaleTopic) {
    if (state.finaleRevealed) {
      // Show all answers when revealed
      finaleAnswersList.innerHTML = state.currentFinaleTopic.answers.map((answer, idx) => {
        const isFound = state.finaleAnswersFound.includes(idx);
        return `<li class="${isFound ? 'found' : 'missed'}">${isFound ? '✓' : '✗'} ${answer}</li>`;
      }).join('');
      if (finaleAnswersDisplay) finaleAnswersDisplay.classList.remove('hidden');
    } else if (state.finaleAnswersFound.length > 0) {
      // Show only found answers
      finaleAnswersList.innerHTML = state.finaleAnswersFound.map(idx => 
        `<li class="found">✓ ${state.currentFinaleTopic.answers[idx]}</li>`
      ).join('');
      if (finaleAnswersDisplay) finaleAnswersDisplay.classList.remove('hidden');
    } else {
      finaleAnswersList.innerHTML = '';
      if (finaleAnswersDisplay) finaleAnswersDisplay.classList.add('hidden');
    }
  }
  
  // Don't show paused indicator on player screen
}

function updateFinishedScreen(state) {
  const winnerTitle = document.getElementById('winner-title');
  const winnerAnnouncement = document.getElementById('winner-announcement');
  
  // Show finale winner if there is one
  if (state.finaleWinner) {
    if (winnerTitle) winnerTitle.textContent = '🏆 WE HAVE A WINNER! 🏆';
    if (winnerAnnouncement) {
      winnerAnnouncement.innerHTML = `<div class="winner-name-big">${state.finaleWinner}</div><div class="winner-subtitle">wint de Quiz Night!</div>`;
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
    return `<li class="score-item ${sorted ? 'ranked' : ''}">
      <span class="player">${medal} ${name}</span>
      <span class="score">${score} ${unit}</span>
    </li>`;
  }).join('');
}

function updateTimeList(scores, activePlayer, element) {
  if (!scores || !element) return;
  
  let entries = Object.entries(scores);
  
  element.innerHTML = entries.map(([name, time]) => {
    const isActive = name === activePlayer;
    const dangerClass = time <= 10 ? 'danger' : (time <= 30 ? 'warning' : '');
    return `<li class="time-item ${isActive ? 'active' : ''} ${dangerClass}">
      <span class="player-name">${name}</span>
      <span class="player-time">${time}s</span>
    </li>`;
  }).join('');
}
