// Game State
const game = {
    canvas: null, ctx: null, width: 400, height: 600,
    running: false, started: false, score: 0, highScore: 0,
    volume: 0.7, muted: false, reduceMotion: false,
    jumpSoundToggle: false, keys: {}
};

// Player (Horse)
const player = {
    x: 100, y: 300, width: 50, height: 50,
    velocityY: 0, gravity: 0.5, flapPower: -9,
    rotation: 0, sprite: null
};

// Game objects
const pipes = [];
const particles = [];
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const PIPE_SPEED = 2.5;

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
    game.highScore = parseInt(localStorage.getItem('flappyHighScore') || '0');
    game.muted = localStorage.getItem('flappyMuted') === 'true';
    game.volume = parseFloat(localStorage.getItem('flappyVolume') || '0.7');
    game.reduceMotion = localStorage.getItem('flappyReduceMotion') === 'true';
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    document.getElementById('volume-slider').value = game.volume * 100;
    document.getElementById('volume-value').textContent = Math.round(game.volume * 100) + '%';
    document.getElementById('reduce-motion').checked = game.reduceMotion;
    updateMuteButton();
}

function saveSettings() {
    localStorage.setItem('flappyHighScore', game.highScore);
    localStorage.setItem('flappyMuted', game.muted);
    localStorage.setItem('flappyVolume', game.volume);
    localStorage.setItem('flappyReduceMotion', game.reduceMotion);
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
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
            e.preventDefault();
            if (game.running) flap();
        }
    });
    
    game.canvas.addEventListener('click', () => {
        if (game.running) flap();
    });
    
    game.canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (game.running) flap();
    });
    
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
    game.started = false;
    player.y = game.height / 2;
    player.velocityY = 0;
    player.rotation = 0;
    pipes.length = 0;
    particles.length = 0;
    game.jumpSoundToggle = false;
    updateScore();
    showScreen('game-screen');
    document.getElementById('tap-instruction').style.display = 'block';
    gameLoop();
}

function gameLoop() {
    if (!game.running) return;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!game.started) {
        player.y = game.height / 2 + Math.sin(Date.now() / 200) * 10;
        return;
    }
    
    // Update player
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    player.rotation = Math.min(Math.max(player.velocityY * 3, -30), 90);
    
    // Update sprite
    const canvasRect = game.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / game.width;
    const scaleY = canvasRect.height / game.height;
    player.sprite.style.left = (canvasRect.left + player.x * scaleX) + 'px';
    player.sprite.style.top = (canvasRect.top + player.y * scaleY) + 'px';
    player.sprite.style.width = (player.width * scaleX) + 'px';
    player.sprite.style.height = (player.height * scaleY) + 'px';
    player.sprite.style.transform = `rotate(${player.rotation}deg)`;
    
    // Generate pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < game.width - 250) {
        const gapY = Math.random() * (game.height - PIPE_GAP - 200) + 100;
        pipes.push({
            x: game.width,
            topHeight: gapY,
            bottomY: gapY + PIPE_GAP,
            scored: false
        });
    }
    
    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
        
        // Score when passing pipe
        if (!pipe.scored && pipe.x + PIPE_WIDTH < player.x) {
            pipe.scored = true;
            game.score++;
            updateScore();
            if (!game.reduceMotion) {
                createParticles(player.x, player.y + player.height / 2, 8, '#FFD700');
            }
        }
    });
    
    // Remove off-screen pipes
    pipes.splice(0, pipes.length, ...pipes.filter(p => p.x > -PIPE_WIDTH));
    
    // Update particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
    });
    particles.splice(0, particles.length, ...particles.filter(p => p.life > 0));
    
    // Check collisions
    checkCollisions();
}

function flap() {
    if (!game.started) {
        game.started = true;
        document.getElementById('tap-instruction').style.display = 'none';
    }
    
    player.velocityY = player.flapPower;
    
    // Alternate jump sounds
    const jumpSound = game.jumpSoundToggle ? audio.jump2 : audio.jump1;
    playSound(jumpSound);
    game.jumpSoundToggle = !game.jumpSoundToggle;
    
    if (!game.reduceMotion) {
        createParticles(player.x, player.y + player.height, 5, '#FFFFFF');
    }
}

function checkCollisions() {
    // Ground and ceiling
    if (player.y + player.height > game.height || player.y < 0) {
        gameOver();
        return;
    }
    
    // Pipes
    pipes.forEach(pipe => {
        if (player.x + player.width > pipe.x &&
            player.x < pipe.x + PIPE_WIDTH) {
            if (player.y < pipe.topHeight ||
                player.y + player.height > pipe.bottomY) {
                gameOver();
            }
        }
    });
}

function createParticles(x, y, count, color = '#FFFFFF') {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            life: 30,
            color,
            size: 3 + Math.random() * 3
        });
    }
}

function render() {
    const ctx = game.ctx;
    
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
    gradient.addColorStop(0, '#4ec0ca');
    gradient.addColorStop(1, '#7dd3db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);
    
    // Draw pipes
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#5cb85c';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#4cae4c';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
        ctx.strokeStyle = '#3d8b3d';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillStyle = '#5cb85c';
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, game.height - pipe.bottomY);
        ctx.fillStyle = '#4cae4c';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, PIPE_WIDTH + 10, 30);
        ctx.strokeStyle = '#3d8b3d';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, game.height - pipe.bottomY);
    });
    
    // Draw ground
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, game.height - 50, game.width, 50);
    ctx.fillStyle = '#8B7355';
    for (let i = 0; i < game.width; i += 20) {
        ctx.fillRect(i, game.height - 50, 18, 5);
    }
    
    // Draw player if sprite not visible (fallback)
    if (player.sprite.style.display === 'none') {
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(player.rotation * Math.PI / 180);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.font = '40px Arial';
        ctx.fillText('🐴', -20, 10);
        ctx.restore();
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
    
    // Play fail sounds sequentially
    playSound(audio.fail1);
    setTimeout(() => playSound(audio.fail2), 800);
    
    // Shake effect
    if (!game.reduceMotion) {
        game.canvas.classList.add('shake');
        setTimeout(() => game.canvas.classList.remove('shake'), 500);
    }
    
    // Update high score
    const isNewHighScore = game.score > game.highScore;
    if (isNewHighScore) {
        game.highScore = game.score;
        saveSettings();
        document.getElementById('new-high-score').classList.remove('hidden');
    } else {
        document.getElementById('new-high-score').classList.add('hidden');
    }
    
    document.getElementById('final-score').textContent = `Score: ${game.score}`;
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    
    setTimeout(() => {
        document.getElementById('gameover-screen').classList.remove('hidden');
    }, 500);
}

function shareScore() {
    const text = `I scored ${game.score} in Flappy Horse! 🐴 Can you beat it?`;
    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    }
}
