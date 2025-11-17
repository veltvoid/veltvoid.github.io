// Game State
const game = {
    canvas: null, ctx: null, width: 600, height: 800,
    running: false, score: 0, highScore: 0, startTime: 0,
    volume: 0.7, muted: false, reduceMotion: false,
    keys: {}, joystick: { active: false, x: 0, y: 0 }
};

// Player
const player = {
    x: 300, y: 700, width: 50, height: 50,
    speed: 6, health: 3, maxHealth: 3,
    invincible: false, invincibleTime: 0, sprite: null
};

// Game objects
const bullets = [];
const particles = [];
const powerups = [];

// Constants
const BULLET_SPEED = 4;
const SPAWN_RATE = 60; // frames between spawns

// Audio
const audio = { jump1: null, jump2: null, fail1: null, fail2: null };

// Initialize
window.addEventListener('DOMContentLoaded', init);

function init() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    player.sprite = document.getElementById('horse-sprite');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    loadSettings();
    loadAudio();
    setupEventListeners();
    showScreen('title-screen');
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const aspectRatio = game.width / game.height;
    let width = container.clientWidth, height = container.clientHeight;
    if (width / height > aspectRatio) width = height * aspectRatio;
    else height = width / aspectRatio;
    game.canvas.width = game.width;
    game.canvas.height = game.height;
    game.canvas.style.width = width + 'px';
    game.canvas.style.height = height + 'px';
}

function loadSettings() {
    game.highScore = parseInt(localStorage.getItem('dodgeHighScore') || '0');
    game.muted = localStorage.getItem('dodgeMuted') === 'true';
    game.volume = parseFloat(localStorage.getItem('dodgeVolume') || '0.7');
    game.reduceMotion = localStorage.getItem('dodgeReduceMotion') === 'true';
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    document.getElementById('volume-slider').value = game.volume * 100;
    document.getElementById('volume-value').textContent = Math.round(game.volume * 100) + '%';
    document.getElementById('reduce-motion').checked = game.reduceMotion;
    updateMuteButton();
}

function saveSettings() {
    localStorage.setItem('dodgeHighScore', game.highScore);
    localStorage.setItem('dodgeMuted', game.muted);
    localStorage.setItem('dodgeVolume', game.volume);
    localStorage.setItem('dodgeReduceMotion', game.reduceMotion);
}

function loadAudio() {
    try {
        audio.jump1 = new Audio('../mario-horse/thik_chhe.mp3');
        audio.jump2 = new Audio('../mario-horse/vishnuuuuuuu.mp3');
        audio.fail1 = new Audio('../mario-horse/aeeeeee.mp3');
        audio.fail2 = new Audio('../mario-horse/bapaooooo.mp3');
        Object.values(audio).forEach(sound => {
            sound.preload = 'auto';
            sound.volume = game.volume;
            sound.onerror = () => console.log('Audio not found:', sound.src);
        });
    } catch (e) { console.log('Audio loading failed:', e); }
}

function playSound(sound) {
    if (!game.muted && sound) {
        sound.currentTime = 0;
        sound.volume = game.volume;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function setupEventListeners() {
    document.addEventListener('keydown', e => {
        game.keys[e.key.toLowerCase()] = true;
    });
    
    document.addEventListener('keyup', e => {
        game.keys[e.key.toLowerCase()] = false;
    });
    
    // Joystick controls
    const joystickArea = document.getElementById('joystick-area');
    const joystickStick = document.getElementById('joystick-stick');
    
    function handleJoystickStart(e) {
        e.preventDefault();
        game.joystick.active = true;
        updateJoystick(e);
    }
    
    function handleJoystickMove(e) {
        if (game.joystick.active) {
            e.preventDefault();
            updateJoystick(e);
        }
    }
    
    function handleJoystickEnd(e) {
        e.preventDefault();
        game.joystick.active = false;
        game.joystick.x = 0;
        game.joystick.y = 0;
        joystickStick.style.left = '45px';
        joystickStick.style.top = '45px';
    }
    
    function updateJoystick(e) {
        const touch = e.touches ? e.touches[0] : e;
        const rect = joystickArea.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 45;
        
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        game.joystick.x = deltaX / maxDistance;
        game.joystick.y = deltaY / maxDistance;
        
        joystickStick.style.left = (45 + deltaX) + 'px';
        joystickStick.style.top = (45 + deltaY) + 'px';
    }
    
    joystickArea.addEventListener('touchstart', handleJoystickStart);
    joystickArea.addEventListener('touchmove', handleJoystickMove);
    joystickArea.addEventListener('touchend', handleJoystickEnd);
    joystickArea.addEventListener('mousedown', handleJoystickStart);
    document.addEventListener('mousemove', handleJoystickMove);
    document.addEventListener('mouseup', handleJoystickEnd);
    
    document.getElementById('play-btn').addEventListener('click', startGame);
    document.getElementById('options-btn').addEventListener('click', () => showScreen('options-screen'));
    document.getElementById('back-btn').addEventListener('click', () => showScreen('title-screen'));
    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    document.getElementById('restart-game-btn').addEventListener('click', startGame);
    document.getElementById('menu-btn').addEventListener('click', quitToMenu);
    document.getElementById('share-btn').addEventListener('click', shareScore);
    
    document.getElementById('volume-slider').addEventListener('input', e => {
        game.volume = e.target.value / 100;
        document.getElementById('volume-value').textContent = e.target.value + '%';
        Object.values(audio).forEach(sound => sound.volume = game.volume);
        saveSettings();
    });
    
    document.getElementById('reduce-motion').addEventListener('change', e => {
        game.reduceMotion = e.target.checked;
        saveSettings();
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen, .overlay').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function startGame() {
    game.score = 0;
    game.running = true;
    game.startTime = Date.now();
    player.x = game.width / 2;
    player.y = game.height - 100;
    player.health = player.maxHealth;
    player.invincible = false;
    player.invincibleTime = 0;
    bullets.length = 0;
    particles.length = 0;
    powerups.length = 0;
    updateScore();
    updateHealth();
    showScreen('game-screen');
    gameLoop();
}

function gameLoop() {
    if (!game.running) return;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    handleInput();
    updatePlayer();
    updateBullets();
    updatePowerups();
    updateParticles();
    spawnBullets();
    checkCollisions();
    
    game.score++;
    if (game.score % 10 === 0) updateScore();
    
    if (player.invincible) {
        player.invincibleTime--;
        if (player.invincibleTime <= 0) {
            player.invincible = false;
        }
    }
}

function handleInput() {
    let moveX = 0, moveY = 0;
    
    // Keyboard
    if (game.keys['arrowleft'] || game.keys['a']) moveX -= 1;
    if (game.keys['arrowright'] || game.keys['d']) moveX += 1;
    if (game.keys['arrowup'] || game.keys['w']) moveY -= 1;
    if (game.keys['arrowdown'] || game.keys['s']) moveY += 1;
    
    // Joystick
    if (game.joystick.active) {
        moveX = game.joystick.x;
        moveY = game.joystick.y;
    }
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length;
        moveY /= length;
    }
    
    player.x += moveX * player.speed;
    player.y += moveY * player.speed;
    
    // Keep in bounds
    player.x = Math.max(player.width / 2, Math.min(game.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(game.height - player.height / 2, player.y));
}

function updatePlayer() {
    const canvasRect = game.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / game.width;
    const scaleY = canvasRect.height / game.height;
    
    player.sprite.style.left = (canvasRect.left + (player.x - player.width / 2) * scaleX) + 'px';
    player.sprite.style.top = (canvasRect.top + (player.y - player.height / 2) * scaleY) + 'px';
    player.sprite.style.width = (player.width * scaleX) + 'px';
    player.sprite.style.height = (player.height * scaleY) + 'px';
    
    if (player.invincible) {
        player.sprite.style.opacity = Math.sin(Date.now() / 100) > 0 ? '1' : '0.3';
    } else {
        player.sprite.style.opacity = '1';
    }
}

function spawnBullets() {
    if (game.score % SPAWN_RATE === 0) {
        const patterns = ['straight', 'aimed', 'spread', 'circle'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        if (pattern === 'straight') {
            bullets.push({
                x: Math.random() * game.width,
                y: -20,
                vx: 0,
                vy: BULLET_SPEED,
                size: 15,
                color: '#ff0000'
            });
        } else if (pattern === 'aimed') {
            const x = Math.random() * game.width;
            const y = -20;
            const angle = Math.atan2(player.y - y, player.x - x);
            bullets.push({
                x, y,
                vx: Math.cos(angle) * BULLET_SPEED,
                vy: Math.sin(angle) * BULLET_SPEED,
                size: 15,
                color: '#ff6600'
            });
        } else if (pattern === 'spread') {
            const x = game.width / 2;
            for (let i = -2; i <= 2; i++) {
                const angle = (Math.PI / 2) + (i * 0.3);
                bullets.push({
                    x, y: -20,
                    vx: Math.cos(angle) * BULLET_SPEED,
                    vy: Math.sin(angle) * BULLET_SPEED,
                    size: 12,
                    color: '#ff00ff'
                });
            }
        } else if (pattern === 'circle') {
            const x = Math.random() * game.width;
            const y = Math.random() * 200;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                bullets.push({
                    x, y,
                    vx: Math.cos(angle) * BULLET_SPEED * 0.8,
                    vy: Math.sin(angle) * BULLET_SPEED * 0.8,
                    size: 10,
                    color: '#00ffff'
                });
            }
        }
    }
}

function updateBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
    });
    bullets.splice(0, bullets.length, ...bullets.filter(b => 
        b.x > -50 && b.x < game.width + 50 && 
        b.y > -50 && b.y < game.height + 50
    ));
}

function updatePowerups() {
    powerups.forEach(p => {
        p.y += 2;
        p.rotation += 0.1;
    });
    powerups.splice(0, powerups.length, ...powerups.filter(p => p.y < game.height + 50));
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    particles.splice(0, particles.length, ...particles.filter(p => p.life > 0));
}

function checkCollisions() {
    if (player.invincible) return;
    
    bullets.forEach((bullet, index) => {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.width / 2 + bullet.size / 2)) {
            bullets.splice(index, 1);
            takeDamage();
        }
    });
    
    powerups.forEach((powerup, index) => {
        const dx = player.x - powerup.x;
        const dy = player.y - powerup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (player.width / 2 + powerup.size / 2)) {
            powerups.splice(index, 1);
            player.health = Math.min(player.health + 1, player.maxHealth);
            updateHealth();
            playSound(audio.jump1);
            if (!game.reduceMotion) {
                createParticles(powerup.x, powerup.y, 15, '#00ff00');
            }
        }
    });
}

function takeDamage() {
    player.health--;
    updateHealth();
    player.invincible = true;
    player.invincibleTime = 60;
    
    playSound(audio.jump2);
    
    if (!game.reduceMotion) {
        createParticles(player.x, player.y, 20, '#ff0000');
        game.canvas.classList.add('shake');
        setTimeout(() => game.canvas.classList.remove('shake'), 200);
    }
    
    if (player.health <= 0) {
        gameOver();
    }
}

function createParticles(x, y, count, color = '#FFFFFF') {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30,
            color,
            size: 3 + Math.random() * 4
        });
    }
}

function render() {
    const ctx = game.ctx;
    
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
    gradient.addColorStop(0, '#0f0f1e');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < game.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, game.height);
        ctx.stroke();
    }
    for (let i = 0; i < game.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(game.width, i);
        ctx.stroke();
    }
    
    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // Draw powerups
    powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.shadowBlur = 0;
        ctx.restore();
    });
    
    // Draw player if sprite not visible (fallback)
    if (player.sprite.style.display === 'none') {
        ctx.fillStyle = player.invincible ? 'rgba(255, 215, 0, 0.5)' : '#FFD700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = '40px Arial';
        ctx.fillText('🐴', player.x - 20, player.y + 10);
    }
    
    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

function updateScore() {
    document.getElementById('score-display').textContent = game.score;
    document.getElementById('hud-high-score').textContent = `HIGH: ${game.highScore}`;
}

function updateHealth() {
    const hearts = '❤️'.repeat(player.health) + '🖤'.repeat(player.maxHealth - player.health);
    document.getElementById('health-display').textContent = hearts;
}

function toggleMute() {
    game.muted = !game.muted;
    updateMuteButton();
    saveSettings();
}

function updateMuteButton() {
    document.getElementById('mute-btn').textContent = game.muted ? '🔇' : '🔊';
}

function quitToMenu() {
    game.running = false;
    document.getElementById('gameover-screen').classList.add('hidden');
    showScreen('title-screen');
}

function gameOver() {
    if (!game.running) return;
    game.running = false;
    
    const survivalTime = Math.floor((Date.now() - game.startTime) / 1000);
    
    playSound(audio.fail1);
    setTimeout(() => playSound(audio.fail2), 800);
    
    if (!game.reduceMotion) {
        game.canvas.classList.add('shake');
        setTimeout(() => game.canvas.classList.remove('shake'), 500);
    }
    
    const isNewHighScore = game.score > game.highScore;
    if (isNewHighScore) {
        game.highScore = game.score;
        saveSettings();
        document.getElementById('new-high-score').classList.remove('hidden');
    } else {
        document.getElementById('new-high-score').classList.add('hidden');
    }
    
    document.getElementById('final-score').textContent = `Score: ${game.score}`;
    document.getElementById('survival-time').textContent = `Survived: ${survivalTime}s`;
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    
    setTimeout(() => {
        document.getElementById('gameover-screen').classList.remove('hidden');
    }, 500);
}

function shareScore() {
    const survivalTime = Math.floor((Date.now() - game.startTime) / 1000);
    const text = `I scored ${game.score} and survived ${survivalTime}s in Dodge Horse! 🐴 Can you beat it?`;
    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    }
}
