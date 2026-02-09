// ── Flag Data ──
const flags = [
  { id: 1, image: 'flags/cambodia.svg', name: 'Cambodia' },
  { id: 2, image: 'flags/thailand.svg', name: 'Thailand' },
  { id: 3, image: 'flags/vietnam.svg', name: 'Vietnam' },
  { id: 4, image: 'flags/laos.svg', name: 'Laos' },
  { id: 5, image: 'flags/myanmar.svg', name: 'Myanmar' },
  { id: 6, image: 'flags/philippines.svg', name: 'Philippines' },
  { id: 7, image: 'flags/indonesia.svg', name: 'Indonesia' },
  { id: 8, image: 'flags/malaysia.svg', name: 'Malaysia' },
  { id: 9, image: 'flags/singapore.svg', name: 'Singapore' },
];

const CARDS_PER_ROUND = 6;

// ── State ──
let roundFlags = [];
let cards = [];
let flipped = [];
let matched = [];
let isProcessing = false;

// ── DOM Refs ──
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const cardGrid = document.getElementById('card-grid');
const flagParade = document.getElementById('flag-parade');
const confettiContainer = document.getElementById('confetti-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const startFlagsEl = document.getElementById('start-flags');

// ── Populate Start Screen Flags ──
startFlagsEl.innerHTML = flags.slice(0, 6).map(f =>
  `<img class="start-flag" src="${f.image}" alt="${f.name}" draggable="false">`
).join('');

// ── Utilities ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function updateProgress() {
  const matchedCount = matched.length / 2;
  const pct = (matchedCount / CARDS_PER_ROUND) * 100;
  progressFill.style.width = pct + '%';
  progressText.textContent = `${matchedCount} / ${CARDS_PER_ROUND}`;
}

function showConfetti() {
  confettiContainer.classList.remove('hidden');
  confettiContainer.innerHTML = '';
  const colors = ['#3b82f6', '#2563eb', '#1a56db', '#fbbf24', '#f59e0b', '#60a5fa', '#93c5fd', '#fcd34d'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 8 + 5) + 'px';
    el.style.height = (Math.random() * 8 + 5) + 'px';
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    confettiContainer.appendChild(el);
  }
  setTimeout(() => {
    confettiContainer.classList.add('hidden');
    confettiContainer.innerHTML = '';
  }, 5000);
}

function showScreen(screen) {
  [startScreen, gameScreen, winScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

// ── Render Cards ──
function renderCards() {
  cardGrid.innerHTML = '';
  updateProgress();

  cards.forEach((card, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';

    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.uniqueId = card.uniqueId;
    cardEl.style.animation = `card-enter 0.4s ${index * 0.06}s ease backwards`;

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = '<span class="card-back-icon">?</span>';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
      <img class="card-photo" src="${card.image}" alt="${card.name}" draggable="false">
      <span class="card-name">${card.name}</span>
    `;

    cardEl.appendChild(back);
    cardEl.appendChild(front);
    wrapper.appendChild(cardEl);

    wrapper.addEventListener('click', () => handleCardClick(card, cardEl));
    cardGrid.appendChild(wrapper);
  });
}

// ── Card Manipulation ──
function flipCard(cardEl) {
  cardEl.classList.add('flipped');
}

function unflipCard(cardEl) {
  cardEl.classList.remove('flipped');
}

function markMatched(cardEl) {
  cardEl.classList.remove('flipped');
  cardEl.classList.add('matched');
  cardEl.classList.add('match-celebrate');
  setTimeout(() => cardEl.classList.remove('match-celebrate'), 500);
}

// ── Handle Card Click ──
function handleCardClick(card, cardEl) {
  // Guards
  if (isProcessing) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  if (flipped.length >= 2) return;

  // Play pop sound
  if (typeof playPop === 'function') playPop();

  // Flip this card
  flipCard(cardEl);
  flipped.push({ card, cardEl });

  // Check for match when two cards are flipped
  if (flipped.length === 2) {
    isProcessing = true;
    const [first, second] = flipped;

    if (first.card.id === second.card.id) {
      // Match!
      setTimeout(() => {
        markMatched(first.cardEl);
        markMatched(second.cardEl);
        matched.push(first.card.uniqueId, second.card.uniqueId);
        if (typeof playMatch === 'function') playMatch();
        updateProgress();
        flipped = [];
        isProcessing = false;

        // Check win condition
        if (matched.length === cards.length) {
          setTimeout(() => {
            if (typeof playWin === 'function') playWin();
            showConfetti();
            showWinScreen();
          }, 600);
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        unflipCard(first.cardEl);
        unflipCard(second.cardEl);
        flipped = [];
        isProcessing = false;
      }, 900);
    }
  }
}

// ── Win Screen ──
function showWinScreen() {
  flagParade.innerHTML = roundFlags.map(f =>
    `<img class="parade-flag" src="${f.image}" alt="${f.name}" draggable="false">`
  ).join('');
  showScreen(winScreen);
}

// ── Init Game ──
function initGame() {
  const alwaysInclude = flags.filter(f => f.name === 'Cambodia');
  const others = shuffle(flags.filter(f => f.name !== 'Cambodia'));
  roundFlags = [...alwaysInclude, ...others.slice(0, CARDS_PER_ROUND - alwaysInclude.length)];

  cards = shuffle([...roundFlags, ...roundFlags]).map((flag, index) => ({
    ...flag,
    uniqueId: index
  }));

  flipped = [];
  matched = [];
  isProcessing = false;

  renderCards();
}

// ── Start Game ──
function startGame() {
  if (typeof initAudio === 'function') initAudio();
  showScreen(gameScreen);
  if (typeof playWelcome === 'function') playWelcome();
  initGame();
}

// ── Event Listeners ──
document.getElementById('start-btn').addEventListener('click', startGame);

document.getElementById('new-game-btn').addEventListener('click', () => {
  if (typeof playPop === 'function') playPop();
  initGame();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
  if (typeof playPop === 'function') playPop();
  showScreen(gameScreen);
  initGame();
});

// ── Prevent Double-Tap Zoom ──
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });
