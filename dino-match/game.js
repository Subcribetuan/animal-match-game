/* ===========================================
   DINO MATCH GAME
   =========================================== */

const dinos = [
  { id: 1, emoji: '\u{1F995}', name: 'Brachio' },
  { id: 2, emoji: '\u{1F996}', name: 'T-Rex' },
  { id: 3, emoji: '\u{1F409}', name: 'Dragon' },
  { id: 4, emoji: '\u{1F40A}', name: 'Croc' },
  { id: 5, emoji: '\u{1F98E}', name: 'Lizard' },
  { id: 6, emoji: '\u{1F9B4}', name: 'Fossil' },
  { id: 7, emoji: '\u{1F95A}', name: 'Dino Egg' },
  { id: 8, emoji: '\u{1F30B}', name: 'Volcano' },
  { id: 9, emoji: '\u{1FAB4}', name: 'Fern' },
];

const CARDS_PER_ROUND = 6;

// State
let roundDinos = [];
let cards = [];
let flipped = [];
let matched = [];
let isProcessing = false;

const STORAGE_KEY = 'dinoMatch';

function saveState() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      cards, matched, roundDinos
    }));
  } catch(e) {}
}

function clearState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function restoreState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    const state = JSON.parse(saved);
    cards = state.cards;
    matched = state.matched;
    roundDinos = state.roundDinos;
    flipped = [];
    isProcessing = false;
    return true;
  } catch(e) { return false; }
}

// DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const cardGrid = document.getElementById('card-grid');
const animalParade = document.getElementById('animal-parade');
const confettiContainer = document.getElementById('confetti-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Utilities
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateProgress() {
  const matchedCount = matched.length / 2;
  const total = CARDS_PER_ROUND;
  const pct = (matchedCount / total) * 100;
  progressFill.style.width = pct + '%';
  progressText.textContent = matchedCount + ' / ' + total;
}

function showConfetti() {
  confettiContainer.classList.remove('hidden');
  confettiContainer.innerHTML = '';
  const colors = ['#22c55e', '#16a34a', '#fbbf24', '#06d6a0', '#4ade80', '#86efac'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.width = (Math.random() * 8 + 4) + 'px';
    c.style.height = (Math.random() * 8 + 4) + 'px';
    c.style.animation = `confetti-fall ${Math.random() * 2 + 2}s ease-out forwards`;
    c.style.animationDelay = Math.random() * 0.8 + 's';
    confettiContainer.appendChild(c);
  }
  setTimeout(() => confettiContainer.classList.add('hidden'), 5000);
}

// Screen management
function showScreen(screen) {
  startScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  winScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// Card rendering
function renderCards() {
  cardGrid.innerHTML = '';

  cards.forEach((card, i) => {
    const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.uniqueId);
    const isMatched = matched.includes(card.uniqueId);

    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    wrapper.style.animation = `card-enter 0.35s ease-out ${i * 0.03}s both`;

    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.id = card.uniqueId;

    if (isFlipped) cardEl.classList.add('flipped');
    if (isMatched) cardEl.classList.add('matched');

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = '<span class="card-back-icon">\u{1F996}</span>';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
      <span class="card-emoji">${card.emoji}</span>
      <span class="card-name">${card.name}</span>
    `;

    cardEl.appendChild(back);
    cardEl.appendChild(front);
    wrapper.appendChild(cardEl);

    wrapper.addEventListener('click', () => handleCardClick(card.uniqueId));
    cardGrid.appendChild(wrapper);
  });

  updateProgress();
}

function flipCard(uniqueId) {
  const cardEl = document.querySelector(`.card[data-id="${uniqueId}"]`);
  if (cardEl) cardEl.classList.add('flipped');
}

function unflipCard(uniqueId) {
  const cardEl = document.querySelector(`.card[data-id="${uniqueId}"]`);
  if (cardEl) cardEl.classList.remove('flipped');
}

function markMatched(uniqueId) {
  const cardEl = document.querySelector(`.card[data-id="${uniqueId}"]`);
  if (cardEl) {
    cardEl.classList.add('matched');
    cardEl.classList.add('match-celebrate');
    setTimeout(() => cardEl.classList.remove('match-celebrate'), 500);
  }
}

// Game logic
function handleCardClick(uniqueId) {
  if (isProcessing) return;
  if (flipped.includes(uniqueId)) return;
  if (matched.includes(uniqueId)) return;
  if (flipped.length >= 2) return;

  playPop();
  flipped.push(uniqueId);
  flipCard(uniqueId);

  if (flipped.length === 2) {
    isProcessing = true;
    const [first, second] = flipped;
    const firstCard = cards.find(c => c.uniqueId === first);
    const secondCard = cards.find(c => c.uniqueId === second);

    if (firstCard.id === secondCard.id) {
      setTimeout(() => {
        matched.push(first, second);
        flipped = [];
        isProcessing = false;
        playMatch();
        markMatched(first);
        markMatched(second);
        updateProgress();
        saveState();

        if (matched.length === CARDS_PER_ROUND * 2) {
          clearState();
          setTimeout(() => {
            playWin();
            showConfetti();
            showWinScreen();
          }, 500);
        }
      }, 500);
    } else {
      setTimeout(() => {
        unflipCard(first);
        unflipCard(second);
        flipped = [];
        isProcessing = false;
      }, 900);
    }
  }
}

function showWinScreen() {
  animalParade.innerHTML = roundDinos.map(d => `<span>${d.emoji}</span>`).join('');
  showScreen(winScreen);
}

// Init
function initGame() {
  clearState();
  const shuffledDinos = shuffle(dinos);
  roundDinos = shuffledDinos.slice(0, CARDS_PER_ROUND);

  cards = shuffle([...roundDinos, ...roundDinos]).map((dino, index) => ({
    ...dino,
    uniqueId: index
  }));
  flipped = [];
  matched = [];
  isProcessing = false;
  renderCards();
}

function startGame() {
  initAudio();
  showScreen(gameScreen);
  playWelcome();
  initGame();
}

// Events
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('new-game-btn').addEventListener('click', initGame);
document.getElementById('play-again-btn').addEventListener('click', () => {
  showScreen(gameScreen);
  playWelcome();
  initGame();
});

// Save state when user leaves page
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && matched.length > 0) {
    saveState();
  }
});

// Restore game on load if state exists
if (restoreState()) {
  initAudio();
  showScreen(gameScreen);
  renderCards();
}

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);
