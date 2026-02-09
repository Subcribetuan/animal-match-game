/* ===========================================
   FAMILY MATCH GAME — Redesigned
   =========================================== */

const family = [
  { id: 1, image: 'images/benjamine.jpg', name: 'Benjamine' },
  { id: 2, image: 'images/christopher.jpg', name: 'Christopher' },
  { id: 3, image: 'images/dylan.jpg', name: 'Dylan' },
  { id: 4, image: 'images/uncle-john.png', name: 'Uncle John' },
  { id: 5, image: 'images/brendan.jpg', name: 'Brendan' },
  { id: 6, image: 'images/auntie-cindy.jpg', name: 'Auntie Cindy' },
  { id: 7, image: 'images/yaih-yaih.jpg', name: 'Yaih Yaih' },
  { id: 8, image: 'images/mummy.png', name: 'Mummy' },
  { id: 9, image: 'images/daddy.png', name: 'Daddy' },
];

const CARDS_PER_ROUND = 6; // Pick 6 of 9 each round — fits 3x4 grid

// State
let roundFamily = []; // The 6 chosen for this round
let cards = [];
let flipped = [];
let matched = [];
let isProcessing = false;

// DOM
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const cardGrid = document.getElementById('card-grid');
const starsDisplay = document.getElementById('stars');
const familyParade = document.getElementById('family-parade');
const confettiContainer = document.getElementById('confetti-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Build start screen photos
(function buildStartPhotos() {
  const container = document.getElementById('start-photos');
  if (!container) return;
  family.forEach(f => {
    const img = document.createElement('img');
    img.className = 'start-photo';
    img.src = f.image;
    img.alt = f.name;
    img.draggable = false;
    container.appendChild(img);
  });
})();

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
  const colors = ['#ff6b4a', '#e83e8c', '#ffd166', '#06d6a0', '#48dbfb', '#a855f7'];
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

// Card rendering — proper 3D flip cards
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

    // Back face (question mark)
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = '<span class="card-back-icon">❤️</span>';

    // Front face (photo)
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
      <img class="card-photo" src="${card.image}" alt="${card.name}" draggable="false">
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

// Only flip/unflip cards without full re-render
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
      // Match!
      setTimeout(() => {
        matched.push(first, second);
        flipped = [];
        isProcessing = false;
        playMatch();
        markMatched(first);
        markMatched(second);
        updateProgress();

        if (matched.length === CARDS_PER_ROUND * 2) {
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
  familyParade.innerHTML = roundFamily.map(f =>
    `<img class="parade-photo" src="${f.image}" alt="${f.name}" draggable="false">`
  ).join('');
  showScreen(winScreen);
}

// Init — Benjamine & Christopher always included, pick 4 more randomly
function initGame() {
  const alwaysInclude = family.filter(f => f.name === 'Benjamine' || f.name === 'Christopher');
  const others = shuffle(family.filter(f => f.name !== 'Benjamine' && f.name !== 'Christopher'));
  roundFamily = [...alwaysInclude, ...others.slice(0, CARDS_PER_ROUND - alwaysInclude.length)];
  cards = shuffle([...roundFamily, ...roundFamily]).map((person, index) => ({
    ...person,
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
