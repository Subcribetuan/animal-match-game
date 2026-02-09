# 🐾 Animal Match Game

A fun memory matching game for kids! Find matching pairs of animals.

## 🚀 Quick Start

1. Open the project folder in Cursor
2. Right-click `index.html` → "Open with Live Server" (or use any local server)
3. Or just double-click `index.html` to open in browser

## 📁 Project Structure

```
animal-match-game/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── sounds.js       # Audio generation (works on iPhone silent mode!)
├── game.js         # Game logic
└── README.md       # This file
```

## 🎨 Easy Customizations

### Add More Animals

Edit `game.js` and find the `animals` array at the top:

```javascript
const animals = [
  { id: 1, emoji: '🐶', name: 'Dog' },
  { id: 2, emoji: '🐱', name: 'Cat' },
  // Add more here:
  { id: 7, emoji: '🐵', name: 'Monkey' },
  { id: 8, emoji: '🐘', name: 'Elephant' },
];
```

### Change Colors

Edit `styles.css`:

- **Background gradient**: Search for `background: linear-gradient`
- **Card colors**: Look for `.card-hidden`, `.card-revealed`, `.card-matched`
- **Button colors**: Look for `.start-btn`, `.new-game-btn`

### Change Grid Size

Edit `styles.css`, find `.card-grid`:

```css
.card-grid {
  grid-template-columns: repeat(3, 1fr);  /* Change 3 to 4 for 4 columns */
}
```

### Change Sounds

Edit `sounds.js`:

```javascript
// Pop sound - change frequency (Hz) and duration (seconds)
popSound = new Audio(generateWav(500, 0.08, 0.3));

// Match sound - change the notes
matchSound = new Audio(generateMultiToneWav([880, 1100], [0.12, 0.18], 0.25));
```

## 🎵 How the Sounds Work

The sounds are generated as WAV files in JavaScript and played as HTML5 Audio elements. This means they:
- ✅ Work on iPhone even in silent mode (plays as "media" not "UI sounds")
- ✅ No external sound files needed
- ✅ Fully customizable

## 📱 Mobile Features

- Works on iPhone and Android
- Touch-optimized (big tap targets)
- No accidental zoom
- Safe area support (for iPhone notch)

## 🛠️ Ideas to Build On

1. **Add difficulty levels** - Easy (4 pairs), Medium (6 pairs), Hard (8 pairs)
2. **Add a timer** - Track how fast they complete the game
3. **Add a move counter** - Track number of attempts
4. **Add themes** - Let kids choose animals, vehicles, fruits, etc.
5. **Add high scores** - Save best times using localStorage
6. **Add animations** - Card flip animation, particle effects

## 🐛 Testing

- Test on desktop browser first
- Then test on iPhone Safari
- Make sure sounds work with phone on silent (media volume up)

## 📝 License

Free to use and modify! Have fun building! 🎉
