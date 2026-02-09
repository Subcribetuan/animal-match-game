/* ===========================================
   NUMBER MATCH GAME — Teal/Blue Theme
   Match numbers with their dice patterns
   =========================================== */

const numbers = [
  { id: 1, emoji: '1', name: 'One', dice: '\u2680' },
  { id: 2, emoji: '2', name: 'Two', dice: '\u2681' },
  { id: 3, emoji: '3', name: 'Three', dice: '\u2682' },
  { id: 4, emoji: '4', name: 'Four', dice: '\u2683' },
  { id: 5, emoji: '5', name: 'Five', dice: '\u2684' },
  { id: 6, emoji: '6', name: 'Six', dice: '\u2685' },
];

// State
let cards = [];
let flipped = [];
let matched = [];
let isProcessing = false;

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
  const total = 6;
  const pct = (matchedCount / total) * 100;
  progressFill.style.width = pct + '%';
  progressText.textContent = matchedCount + ' / ' + total;
}

function showConfetti() {
  confettiContainer.classList.remove('hidden');
  confettiContainer.innerHTML = '';
  const colors = ['#14b8a6', '#0d9488', '#fbbf24', '#06d6a0', '#48dbfb', '#2dd4bf'];
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

// Card rendering — 3D flip with number vs dice distinction
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
    back.innerHTML = '<span class="card-back-icon">🎲</span>';

    const front = document.createElement('div');
    front.className = 'card-face card-front';

    // Number cards get card-number class for large bold styling
    const emojiClass = card.type === 'number' ? 'card-emoji card-number' : 'card-emoji';
    front.innerHTML = `
      <span class="${emojiClass}">${card.emoji}</span>
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

    if (firstCard.id === secondCard.id && firstCard.uniqueId !== secondCard.uniqueId) {
      // Match! (same number id, but different cards — one number, one dice)
      setTimeout(() => {
        matched.push(first, second);
        flipped = [];
        isProcessing = false;
        playMatch();
        markMatched(first);
        markMatched(second);
        updateProgress();

        if (matched.length === 12) {
          setTimeout(() => {
            playWin();
            showConfetti();
            showWinScreen();
          }, 500);
        }
      }, 500);
    } else {
      // No match
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
  // Parade shows dice emojis
  const diceEmojis = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];
  animalParade.innerHTML = diceEmojis.map(d => `<span>${d}</span>`).join('');
  showScreen(winScreen);
}

// Init — creates one number card and one dice card per number
function initGame() {
  const numberCards = numbers.map(n => ({ id: n.id, emoji: n.emoji, name: n.name, type: 'number' }));
  const diceCards = numbers.map(n => ({ id: n.id, emoji: n.dice, name: n.name, type: 'dice' }));
  cards = shuffle([...numberCards, ...diceCards]).map((card, index) => ({
    ...card,
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

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);
