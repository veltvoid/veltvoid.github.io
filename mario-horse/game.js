// Game State
const game = {
    canvas: null, ctx: null, width: 800, height: 600,
    running: false, paused: false, score: 0, coins: 0,
    highScore: 0, volume: 0.7, muted: false, reduceMotion: false,
    jumpSoundToggle: false, keys: {}, gamepad: null,
    cameraX: 0, currentLevel: 1, levelComplete: false
};

// Player
const player = {
    x: 100, y: 0, width: 48, height: 48,
    velocityX: 0, velocityY: 0, speed: 4, maxSpeed: 6,
    acceleration: 0.5, friction: 0.8, jumpPower: 13,
    grounded: false, sprite: null, direction: 1, canJump: true
};

// Game objects
const platforms = [], coins = [], obstacles = [], particles = [], clouds = [];
const GRAVITY = 0.6, MAX_FALL_SPEED = 15, TILE_SIZE = 40;

// Audio
const audio = { jump1: null, jump2: null, fail1: null, fail2: null };

// Level Definitions
const LEVELS = [
    { // Level 1
        name: "Green Hills",
        platforms: [
            {x:0,y:520,w:800,h:80,type:'ground'},
            {x:300,y:400,w:160,h:40,type:'brick'},
            {x:600,y:320,w:120,h:40,type:'brick'},
            {x:900,y:400,w:200,h:40,type:'brick'},
            {x:1200,y:280,w:160,h:40,type:'brick'},
            {x:1500,y:400,w:240,h:40,type:'brick'},
            {x:1900,y:320,w:160,h:40,type:'brick'},
            {x:2200,y:400,w:200,h:40,type:'brick'},
            {x:2500,y:520,w:400,h:80,type:'ground'}
        ],
        coins: [
            {x:380,y:340},{x:660,y:260},{x:980,y:340},
            {x:1280,y:220},{x:1600,y:340},{x:1980,y:260}
        ],
        obstacles: [
            {x:500,y:480,w:35,h:40},{x:1100,y:480,w:35,h:40},
            {x:1800,y:480,w:35,h:40},{x:2100,y:480,w:35,h:40}
        ],
        goal: {x:2700,y:420,w:60,h:100}
    }
];

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
    game.highScore = parseInt(localStorage.getItem('highScore') || '0');
    game.muted = localStorage.getItem('muted') === 'true';
    game.volume = parseFloat(localStorage.getItem('volume') || '0.7');
    game.reduceMotion = localStorage.getItem('reduceMotion') === 'true';
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    document.getElementById('volume-slider').value = game.volume * 100;
    document.getElementById('volume-value').textContent = Math.round(game.volume * 100) + '%';
    document.getElementById('reduce-motion').checked = game.reduceMotion;
    updateMuteButton();
}

function saveSettings() {
    localStorage.setItem('highScore', game.highScore);
    localStorage.setItem('muted', game.muted);
    localStorage.setItem('volume', game.volume);
    localStorage.setItem('reduceMotion', game.reduceMotion);
}

function loadAudio() {
    try {
        audio.jump1 = new Audio('thik_chhe.mp3');
        audio.jump2 = new Audio('vishnuuuuuuu.mp3');
        audio.fail1 = new Audio('aeeeeee.mp3');
        audio.fail2 = new Audio('bapaooooo.mp3');
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
        if (game.running && !game.paused) {
            if (e.key === ' ' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        }
        if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
            if (game.running) togglePause();
        }
    });
    document.addEventListener('keyup', e => game.keys[e.key.toLowerCase()] = false);
    window.addEventListener('gamepadconnected', e => game.gamepad = e.gamepad);
    
    document.getElementById('play-btn').addEventListener('click', startGame);
    document.getElementById('options-btn').addEventListener('click', () => showScreen('options-screen'));
    document.getElementById('back-btn').addEventListener('click', () => showScreen('title-screen'));
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('quit-btn').addEventListener('click', quitToMenu);
    document.getElementById('restart-game-btn').addEventListener('click', restartGame);
    document.getElementById('menu-btn').addEventListener('click', quitToMenu);
    document.getElementById('menu-btn2').addEventListener('click', quitToMenu);
    document.getElementById('share-btn').addEventListener('click', shareScore);
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    
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
    
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const jumpBtn = document.getElementById('jump-btn');
    leftBtn.addEventListener('touchstart', e => { e.preventDefault(); game.keys['left'] = true; });
    leftBtn.addEventListener('touchend', () => game.keys['left'] = false);
    rightBtn.addEventListener('touchstart', e => { e.preventDefault(); game.keys['right'] = true; });
    rightBtn.addEventListener('touchend', () => game.keys['right'] = false);
    jumpBtn.addEventListener('touchstart', e => { e.preventDefault(); jump(); });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen, .overlay').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function startGame() {
    game.currentLevel = 1;
    game.score = 0;
    game.coins = 0;
    resetLevel();
    game.running = true;
    game.paused = false;
    showScreen('game-screen');
    gameLoop();
}

function resetLevel() {
    game.cameraX = 0;
    game.levelComplete = false;
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.canJump = true;
    platforms.length = 0;
    coins.length = 0;
    obstacles.length = 0;
    particles.length = 0;
    clouds.length = 0;
    game.jumpSoundToggle = false;
    loadLevel(game.currentLevel);
    generateClouds();
    updateScore();
}

function loadLevel(levelNum) {
    const level = LEVELS[levelNum - 1];
    if (!level) return;
    
    level.platforms.forEach(p => {
        for (let i = 0; i < p.w / TILE_SIZE; i++) {
            platforms.push({
                x: p.x + i * TILE_SIZE,
                y: p.y,
                width: TILE_SIZE,
                height: p.h,
                type: p.type
            });
        }
    });
    
    level.coins.forEach(c => {
        coins.push({
            x: c.x, y: c.y, width: 30, height: 30,
            collected: false, bounce: 0
        });
    });
    
    level.obstacles.forEach(o => {
        obstacles.push({
            x: o.x, y: o.y, width: o.w, height: o.h, type: 'spike'
        });
    });
    
    if (level.goal) {
        platforms.push({
            x: level.goal.x, y: level.goal.y,
            width: level.goal.w, height: level.goal.h,
            type: 'goal'
        });
    }
}

function generateClouds() {
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * 3000,
            y: Math.random() * 200 + 50,
            width: 80 + Math.random() * 40,
            speed: 0.3 + Math.random() * 0.3
        });
    }
}

function gameLoop() {
    if (!game.running) return;
    if (!game.paused && !game.levelComplete) {
        update();
        render();
    } else if (!game.paused) {
        render();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    handleInput();
    updatePlayer();
    updateCamera();
    updateClouds();
    updateCoins();
    updateParticles();
    checkCollisions();
    game.score += 1;
    if (game.score % 10 === 0) updateScore();
}

function handleInput() {
    let targetVelocity = 0;
    if (game.keys['arrowleft'] || game.keys['a'] || game.keys['left']) {
        targetVelocity = -player.maxSpeed;
        player.direction = -1;
    } else if (game.keys['arrowright'] || game.keys['d'] || game.keys['right']) {
        targetVelocity = player.maxSpeed;
        player.direction = 1;
    }
    if (targetVelocity !== 0) {
        player.velocityX += (targetVelocity - player.velocityX) * player.acceleration;
    } else {
        player.velocityX *= player.friction;
    }
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gp = gamepads[0];
        if (Math.abs(gp.axes[0]) > 0.2) {
            player.velocityX = gp.axes[0] * player.maxSpeed;
            player.direction = gp.axes[0] > 0 ? 1 : -1;
        }
        if (gp.buttons[0].pressed) jump();
    }
}

function updatePlayer() {
    player.velocityY += GRAVITY;
    if (player.velocityY > MAX_FALL_SPEED) player.velocityY = MAX_FALL_SPEED;
    player.x += player.velocityX;
    player.y += player.velocityY;
    if (player.x < game.cameraX) {
        player.x = game.cameraX;
        player.velocityX = 0;
    }
    const canvasRect = game.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / game.width;
    const scaleY = canvasRect.height / game.height;
    const screenX = player.x - game.cameraX;
    player.sprite.style.left = (canvasRect.left + screenX * scaleX) + 'px';
    player.sprite.style.top = (canvasRect.top + player.y * scaleY) + 'px';
    player.sprite.style.width = (player.width * scaleX) + 'px';
    player.sprite.style.height = (player.height * scaleY) + 'px';
    player.sprite.style.transform = player.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
}

function updateCamera() {
    const targetCameraX = player.x - 200;
    if (targetCameraX > game.cameraX) game.cameraX = targetCameraX;
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < game.cameraX - 100) {
            cloud.x = game.cameraX + game.width + Math.random() * 200;
            cloud.y = Math.random() * 200 + 50;
        }
    });
}

function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected) coin.bounce += 0.1;
    });
}

function updateParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life--;
    });
    particles.splice(0, particles.length, ...particles.filter(p => p.life > 0));
}

function checkCollisions() {
    const wasGrounded = player.grounded;
    player.grounded = false;
    
    platforms.forEach(platform => {
        if (platform.type === 'goal') {
            if (player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height) {
                levelComplete();
                return;
            }
        }
        
        if (player.x + player.width - 5 > platform.x &&
            player.x + 5 < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + 15 &&
            player.velocityY >= 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
            player.canJump = true;
            if (!wasGrounded && !game.reduceMotion) {
                createParticles(player.x + player.width / 2, player.y + player.height, 5, '#8B4513');
            }
        }
    });
    
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x + player.width - 10 > coin.x &&
            player.x + 10 < coin.x + coin.width &&
            player.y + player.height - 10 > coin.y &&
            player.y + 10 < coin.y + coin.height) {
            coin.collected = true;
            game.coins += 1;
            game.score += 100;
            updateScore();
            if (!game.reduceMotion) {
                createParticles(coin.x + coin.width / 2, coin.y + coin.height / 2, 8, '#FFD700');
            }
        }
    });
    
    obstacles.forEach(obstacle => {
        if (player.x + player.width - 10 > obstacle.x &&
            player.x + 10 < obstacle.x + obstacle.width &&
            player.y + player.height - 5 > obstacle.y &&
            player.y + 5 < obstacle.y + obstacle.height) {
            gameOver();
        }
    });
    
    if (player.y > game.height + 100) gameOver();
}

function jump() {
    if (player.grounded && player.canJump) {
        player.velocityY = -player.jumpPower;
        player.grounded = false;
        player.canJump = false;
        const jumpSound = game.jumpSoundToggle ? audio.jump2 : audio.jump1;
        playSound(jumpSound);
        game.jumpSoundToggle = !game.jumpSoundToggle;
        if (!game.reduceMotion) {
            createParticles(player.x + player.width / 2, player.y + player.height, 6, '#FFFFFF');
        }
    }
}

function createParticles(x, y, count, color = '#FFFFFF') {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 2,
            life: 30,
            color,
            size: 3 + Math.random() * 3
        });
    }
}

function render() {
    const ctx = game.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
    gradient.addColorStop(0, '#5c94fc');
    gradient.addColorStop(1, '#8bc5ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.width, game.height);
    
    if (player.sprite.style.display === 'none') {
        const x = player.x - game.cameraX;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, player.y, player.width, player.height);
        ctx.font = '40px Arial';
        ctx.fillText('🐴', x + 4, player.y + 38);
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        const x = cloud.x - game.cameraX;
        if (x > -cloud.width && x < game.width + cloud.width) {
            drawCloud(ctx, x, cloud.y, cloud.width);
        }
    });
    
    platforms.forEach(p => {
        const x = p.x - game.cameraX;
        if (x > -p.width && x < game.width + p.width) {
            if (p.type === 'ground') drawGroundTile(ctx, x, p.y, p.width, p.height);
            else if (p.type === 'brick') drawBrickTile(ctx, x, p.y, p.width, p.height);
            else if (p.type === 'goal') drawGoal(ctx, x, p.y, p.width, p.height);
        }
    });
    
    coins.forEach(coin => {
        if (!coin.collected) {
            const x = coin.x - game.cameraX;
            if (x > -coin.width && x < game.width + coin.width) {
                drawCoin(ctx, x, coin.y + Math.sin(coin.bounce) * 5, coin.width);
            }
        }
    });
    
    obstacles.forEach(o => {
        const x = o.x - game.cameraX;
        if (x > -o.width && x < game.width + o.width) {
            drawSpike(ctx, x, o.y, o.width, o.height);
        }
    });
    
    particles.forEach(p => {
        const x = p.x - game.cameraX;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

function drawCloud(ctx, x, y, width) {
    ctx.beginPath();
    ctx.arc(x + width * 0.25, y, width * 0.15, 0, Math.PI * 2);
    ctx.arc(x + width * 0.5, y - width * 0.05, width * 0.2, 0, Math.PI * 2);
    ctx.arc(x + width * 0.75, y, width * 0.15, 0, Math.PI * 2);
    ctx.fill();
}

function drawGroundTile(ctx, x, y, w, h) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(x, y, w, 8);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

function drawBrickTile(ctx, x, y, w, h) {
    ctx.fillStyle = '#CD853F';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2, y + h);
    ctx.stroke();
}

function drawCoin(ctx, x, y, size) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(x + size/2 - size/6, y + size/2 - size/6, size/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.stroke();
}

function drawSpike(ctx, x, y, w, h) {
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w/2, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawGoal(ctx, x, y, w, h) {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FFA500';
    for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + 10, y + 10 + i * 30, w - 20, 20);
    }
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('🏁', x + w/2 - 10, y + h/2 + 10);
}

function updateScore() {
    document.getElementById('score-display').textContent = `SCORE: ${game.score}`;
    document.getElementById('coins-display').textContent = `COINS: ${game.coins}`;
    document.getElementById('level-display').textContent = `LEVEL: ${game.currentLevel}`;
    document.getElementById('hud-high-score').textContent = `HIGH: ${game.highScore}`;
}

function togglePause() {
    if (!game.running) return;
    game.paused = !game.paused;
    if (game.paused) {
        document.getElementById('pause-menu').classList.remove('hidden');
    } else {
        document.getElementById('pause-menu').classList.add('hidden');
    }
}

function toggleMute() {
    game.muted = !game.muted;
    updateMuteButton();
    saveSettings();
}

function updateMuteButton() {
    document.getElementById('mute-btn').textContent = game.muted ? '🔇' : '🔊';
}

function restartGame() {
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    startGame();
}

function quitToMenu() {
    game.running = false;
    game.paused = false;
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('level-complete').classList.add('hidden');
    showScreen('title-screen');
}

function levelComplete() {
    if (game.levelComplete) return;
    game.levelComplete = true;
    game.score += 500;
    updateScore();
    document.getElementById('level-score').textContent = `Score: ${game.score} | Coins: ${game.coins}`;
    setTimeout(() => {
        document.getElementById('level-complete').classList.remove('hidden');
    }, 500);
}

function nextLevel() {
    game.currentLevel++;
    if (game.currentLevel > LEVELS.length) {
        alert('Congratulations! You completed all levels!');
        quitToMenu();
        return;
    }
    document.getElementById('level-complete').classList.add('hidden');
    resetLevel();
}

function gameOver() {
    if (!game.running) return;
    game.running = false;
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
    document.getElementById('final-score').textContent = `Score: ${game.score} | Coins: ${game.coins}`;
    document.getElementById('high-score-display').textContent = `High Score: ${game.highScore}`;
    setTimeout(() => {
        document.getElementById('gameover-screen').classList.remove('hidden');
    }, 500);
}

function shareScore() {
    const text = `I scored ${game.score} points and collected ${game.coins} coins in Mario Horse! 🐴 Can you beat it?`;
    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Score copied to clipboard!');
        });
    }
}
