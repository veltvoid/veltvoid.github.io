# 🐴 Dodge Horse - Bullet Hell

An intense bullet hell arcade game where you dodge incoming projectiles. Survive as long as you can!

## Features

- **Bullet Hell Gameplay**: Multiple bullet patterns (straight, aimed, spread, circle)
- **Health System**: 3 hearts - take 3 hits before game over
- **Invincibility Frames**: Brief invincibility after taking damage
- **Mobile Joystick**: Virtual joystick for touch controls
- **Keyboard Support**: WASD or Arrow keys for movement
- **Score System**: Points based on survival time
- **Particle Effects**: Visual feedback on hits and powerups
- **Dark Theme**: Neon-style graphics with glowing bullets

## Controls

**Desktop:**
- Arrow Keys / WASD - Move in all directions
- Move freely around the screen

**Mobile:**
- Virtual joystick - Drag to move
- Smooth 360-degree movement

## How to Play

1. Open `index.html` in a browser
2. Click "PLAY" to start
3. Move to dodge incoming bullets
4. Survive as long as possible
5. Don't let your health reach zero!

## Bullet Patterns

- **Red (Straight)**: Falls straight down
- **Orange (Aimed)**: Targets your position
- **Purple (Spread)**: Fan pattern from center
- **Cyan (Circle)**: Radiates in all directions

## Scoring

- +1 point per frame survived
- Higher score = more difficult patterns
- Try to beat your high score!

## Game Elements

- **Horse Character**: You! Glowing golden sprite
- **Bullets**: Various colored projectiles with different patterns
- **Health Hearts**: ❤️ = health, 🖤 = lost health
- **Invincibility**: Flashing sprite after taking damage
- **Dark Grid**: Neon-style background

## Tips

- Keep moving! Standing still is dangerous
- Watch for aimed bullets (orange) - they track you
- Use the edges of the screen strategically
- Invincibility frames give you a brief window after damage
- Practice dodging each bullet pattern

## Files Required

The game looks for assets in the parent `mario-horse` folder:
- `../mario-horse/horse-laugh.gif` - Player sprite
- `../mario-horse/thik_chhe.mp3` - Hit sound
- `../mario-horse/vishnuuuuuuu.mp3` - Powerup sound
- `../mario-horse/aeeeeee.mp3` - Game over sound 1
- `../mario-horse/bapaooooo.mp3` - Game over sound 2

## Deployment

Works on GitHub Pages with no build step. Upload all files maintaining the folder structure.

## License

MIT
