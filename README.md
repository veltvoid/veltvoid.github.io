# 🐴 Horse Games Collection

Two complete, polished browser games featuring a horse character - a Mario-inspired platformer and a Flappy Bird clone!

## 🎮 Games Included

### 1. Mario Horse - Platformer
A classic side-scrolling platformer with:
- Static level design with carefully placed platforms
- Mario-like physics (acceleration, friction, variable jump)
- Coins to collect for bonus points
- Spike obstacles to avoid
- Goal flag to reach and complete levels
- Level progression system

### 2. Flappy Horse
A Flappy Bird-inspired game with:
- Simple one-button control
- Procedurally generated pipes (easier gaps!)
- Score tracking for pipes passed
- Smooth physics and rotation
- Addictive gameplay

### 3. Dodge Horse - Bullet Hell
An intense arcade bullet dodger with:
- Multiple bullet patterns (straight, aimed, spread, circle)
- Health system with 3 hearts
- Mobile joystick and keyboard controls
- Invincibility frames after damage
- Neon-style graphics
- Survival-based scoring

## 🚀 Quick Start

1. **Play Locally:**
   - Open `index.html` in any modern browser
   - Choose your game
   - Start playing!

2. **Deploy to GitHub Pages:**
   ```bash
   git init
   git add .
   git commit -m "Horse games"
   git remote add origin https://github.com/yourusername/horse-games.git
   git push -u origin main
   ```
   Then enable GitHub Pages in repository settings.

## 📁 Project Structure

```
horse-games/
├── index.html                 # Main menu to choose games
├── README.md                  # This file
│
├── mario-horse/              # Platformer game
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── README.md
│   ├── horse-laugh.gif       # Player sprite
│   ├── thik_chhe.mp3        # Jump sound 1
│   ├── vishnuuuuuuu.mp3     # Jump sound 2
│   ├── aeeeeee.mp3          # Game over sound 1
│   └── bapaooooo.mp3        # Game over sound 2
│
├── flappy-horse/             # Flappy game
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   └── README.md
│
└── dodge-horse/              # Bullet hell game
    ├── index.html
    ├── style.css
    ├── game.js
    └── README.md
```

## 🎯 Controls

### Mario Horse
- **Desktop**: Arrow Keys/WASD to move, Space/W/Up to jump, P/Esc to pause
- **Mobile**: On-screen buttons
- **Gamepad**: D-pad and A button

### Flappy Horse
- **Desktop**: Space/W/Up or Click to flap
- **Mobile**: Tap anywhere to flap

### Dodge Horse
- **Desktop**: Arrow Keys/WASD to move in all directions
- **Mobile**: Virtual joystick (drag to move)

## ✨ Features

### Both Games Include:
- ✅ Pixel-perfect retro graphics
- ✅ Press Start 2P font for authentic feel
- ✅ Smooth 60 FPS gameplay
- ✅ Alternating jump sounds
- ✅ Sequential game-over sounds
- ✅ High score persistence (localStorage)
- ✅ Volume control and mute toggle
- ✅ Reduce motion accessibility option
- ✅ Responsive design (mobile & desktop)
- ✅ Particle effects
- ✅ Screen shake on game over
- ✅ Share score functionality
- ✅ No dependencies, pure HTML/CSS/JS

## 🎨 Visual Style

- **Mario Horse**: Mario-inspired with ground tiles, brick platforms, gold coins, red spikes
- **Flappy Horse**: Flappy Bird-inspired with green pipes, sky gradient, rotating horse

## 🔊 Audio System

Both games feature:
- Alternating jump sounds (thik_chhe.mp3 ↔ vishnuuuuuuu.mp3)
- Sequential game over sounds (aeeeeee.mp3 → bapaooooo.mp3 with 800ms delay)
- Volume slider (0-100%)
- Mute toggle
- Graceful fallback if audio files missing

## 📱 Mobile Optimization

- Touch controls automatically shown on mobile
- Responsive canvas scaling
- Optimized font sizes for small screens
- Touch-friendly button sizes
- Works on iOS and Android

## 🎓 Technical Details

### Mario Horse
- Canvas-based rendering with DOM sprite overlay
- Static level definitions in JavaScript
- Collision detection with platforms and obstacles
- Camera system that follows player
- Level completion and progression

### Flappy Horse
- Canvas-based rendering with DOM sprite overlay
- Procedural pipe generation
- Gravity and flap physics
- Rotation based on velocity
- Score on pipe pass

## 🚀 Deployment Options

### GitHub Pages (Recommended)
1. Push to GitHub
2. Enable Pages in Settings
3. Your games are live!

### Netlify
- Drag and drop project folder to Netlify Drop

### Vercel
- Run `vercel` in project directory

### Local
- Just open `index.html` - no server needed!

## 🎮 Gameplay Tips

### Mario Horse
- Hold jump button for higher jumps
- Collect all coins for maximum score
- Time your jumps to clear gaps
- Watch out for spikes on platforms
- Reach the golden flag to complete levels

### Flappy Horse
- Tap gently for precise control
- Time your flaps carefully
- The horse rotates based on velocity
- Practice makes perfect!

## 🛠️ Customization

Both games are easy to customize:

**Mario Horse:**
- Edit `LEVELS` array in `game.js` to create new levels
- Adjust physics constants (GRAVITY, jumpPower, etc.)
- Modify tile colors in render functions

**Flappy Horse:**
- Adjust `PIPE_GAP` for difficulty
- Change `PIPE_SPEED` for faster gameplay
- Modify `player.flapPower` for jump height

## 📊 Browser Compatibility

✅ Chrome/Edge (Chromium)
✅ Firefox
✅ Safari (iOS/macOS)
✅ Mobile browsers
✅ Works offline after first load

## 🐛 Troubleshooting

**Assets not loading?**
- Check file names match exactly (case-sensitive)
- Ensure files are in correct folders
- Check browser console for errors

**No sound?**
- Click/tap first (browsers block autoplay)
- Check volume slider in options
- Verify audio files are MP3 format

**Performance issues?**
- Reduce particle count in game.js
- Disable reduce motion effects
- Close other browser tabs

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🎉 Credits

Built with:
- Pure JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 animations
- Google Fonts (Press Start 2P)
- Web Audio API

No frameworks, no build tools, just clean code! 🚀

---

**Enjoy the games! 🐴**
