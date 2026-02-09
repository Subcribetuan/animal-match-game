/* ============================================
   Fruit Match! — Game Logic
   ============================================ */

const fruits = [
  { id: 1, emoji: '🍎', name: 'Apple' },
  { id: 2, emoji: '🍌', name: 'Banana' },
  { id: 3, emoji: '🍇', name: 'Grapes' },
  { id: 4, emoji: '🍊', name: 'Orange' },
  { id: 5, emoji: '🍓', name: 'Strawberry' },
  { id: 6, emoji: '🫐', name: 'Blueberry' },
];

// ---- State ----
let cards = [];
let flipped = [];
let matched = [];
let isProcessing = false;

// ---- DOM refs ----
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const winScreen = document.getElementById('win-screen');
const cardGrid = document.getElementById('card-grid');
const animalParade = document.getElementById('animal-parade');
const confettiContainer = document.getElementById('confetti-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// ---- Helpers ----
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
  const total = fruits.length;
  const pct = (matchedCount / total) * 100;
  progressFill.style.width = pct + '%';
  progressText.textContent = matchedCount + ' / ' + total;
}

function showConfetti() {
  confettiContainer.classList.remove('hidden');
  confettiContainer.innerHTML = '';

  const colors = ['#ec4899', '#f472b6', '#db2777', '#fbbf24', '#84cc16', '#ffffff'];

  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + '%';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 2 + 's';
    el.style.animationDuration = (2 + Math.random() * 2) + 's';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    confettiContainer.appendChild(el);
  }

  setTimeout(() => {
    confettiContainer.classList.add('hidden');
    confettiContainer.innerHTML = '';
  }, 4500);
}

function showScreen(screen) {
  startScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  winScreen.classList.add('hidden');
  confettiContainer.classList.add('hidden');
  screen.classList.remove('hidden');
}

// ---- Card rendering ----
function renderCards() {
  cardGrid.innerHTML = '';

  cards.forEach((card, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';

    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.id = card.uniqueId;
    cardEl.style.animation = `card-enter 0.4s ease-out ${index * 0.06}s backwards`;

    // Card back
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    const backIcon = document.createElement('span');
    backIcon.className = 'card-back-icon';
    backIcon.textContent = '?';
    back.appendChild(backIcon);

    // Card front
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const emoji = document.createElement('div');
    emoji.className = 'card-emoji';
    emoji.textContent = card.emoji;
    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = card.name;
    front.appendChild(emoji);
    front.appendChild(name);

    cardEl.appendChild(back);
    cardEl.appendChild(front);
    wrapper.appendChild(cardEl);

    wrapper.addEventListener('click', () => handleCardClick(card, cardEl));

    cardGrid.appendChild(wrapper);
  });
}

// ---- Card actions ----
function flipCard(cardEl) {
  cardEl.classList.add('flipped');
}

function unflipCard(cardEl) {
  cardEl.classList.remove('flipped');
}

function markMatched(cardEl) {
  cardEl.classList.add('matched');
  cardEl.classList.add('match-celebrate');
}

// ---- Click handler ----
function handleCardClick(card, cardEl) {
  // Guards
  if (isProcessing) return;
  if (flipped.length >= 2) return;
  if (matched.includes(card.uniqueId)) return;
  if (flipped.find(f => f.uniqueId === card.uniqueId)) return;

  // Play pop sound
  if (typeof playPop === 'function') playPop();

  // Flip
  flipCard(cardEl);
  flipped.push({ ...card, element: cardEl });

  // Check match at 2
  if (flipped.length === 2) {
    isProcessing = true;
    const [first, second] = flipped;

    if (first.id === second.id) {
      // Match!
      setTimeout(() => {
        markMatched(first.element);
        markMatched(second.element);
        matched.push(first.uniqueId, second.uniqueId);
        flipped = [];
        isProcessing = false;
        updateProgress();

        if (typeof playMatch === 'function') playMatch();

        // Win check
        if (matched.length === cards.length) {
          setTimeout(() => {
            showWinScreen();
          }, 600);
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        unflipCard(first.element);
        unflipCard(second.element);
        flipped = [];
        isProcessing = false;
      }, 900);
    }
  }
}

// ---- Win screen ----
function showWinScreen() {
  if (typeof playWin === 'function') playWin();
  showConfetti();
  showScreen(winScreen);

  // Parade of fruit emojis
  animalParade.innerHTML = '';
  fruits.forEach(fruit => {
    const span = document.createElement('span');
    span.textContent = fruit.emoji;
    animalParade.appendChild(span);
  });
}

// ---- Init game ----
function initGame() {
  const doubled = [...fruits, ...fruits];
  const shuffled = shuffle(doubled);
  cards = shuffled.map((fruit, i) => ({
    ...fruit,
    uniqueId: fruit.id + '-' + i,
  }));
  flipped = [];
  matched = [];
  isProcessing = false;
  updateProgress();
  renderCards();
}

// ---- Start game ----
function startGame() {
  if (typeof initAudio === 'function') initAudio();
  showScreen(gameScreen);
  if (typeof playWelcome === 'function') playWelcome();
  initGame();
}

// ---- Event listeners ----
document.getElementById('start-btn').addEventListener('click', startGame);

document.getElementById('new-game-btn').addEventListener('click', () => {
  initGame();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
  showScreen(gameScreen);
  if (typeof playWelcome === 'function') playWelcome();
  initGame();
});

// ---- Prevent zoom on double tap ----
document.addEventListener('dblclick', (e) => {
  e.preventDefault();
});
