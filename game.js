// --- รูปไดโนเสาร์และกระบองเพชร --- //
const dinoImg = new Image();
dinoImg.src = 'https://github.com/ARifKunG/mywebsite/blob/main/noob.png?raw=true';

const cactusImg = new Image();
cactusImg.src = "https://github.com/ARifKunG/mywebsite/blob/592b2ddbf88889069a39776715fccb33691ff0c8/ptoo.png?raw=true";

// Global Variables
let gameRunning = false;
let gameStarted = false;
let score = 0;
let highScore = Number(localStorage.getItem('dinoHighScore') || '0');
let gameSpeed = 3;
let gravity = 0.5;
let jumpPower = 12;

// Game Objects
let dino = {
    x: 50,
    y: 200,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false,
    color: '#00ff41'
};

let obstacles = [];
let particles = [];

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Auto-resize canvas for mobile
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.offsetWidth - 40);
    canvas.width = maxWidth;
    canvas.height = Math.max(250, maxWidth * 0.5);

    // Adjust game objects to new canvas size
    dino.y = canvas.height - 100;
    dino.x = Math.min(50, canvas.width * 0.1);
}

// Initialize on load
window.onload = function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = 0;
        setTimeout(() => document.getElementById('loadingScreen').style.display = 'none', 500);
    }, 1400);

    showAchievement();
    createFloatingParticles();

    // Setup canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Update high score display
    document.getElementById('highScore').textContent = highScore;

    // Draw initial game state
    drawGame();
};

function showAchievement(text = '🏆 Achievement Unlocked: Welcome Gamer!') {
    const ach = document.getElementById('achievement');
    ach.textContent = text;
    ach.classList.add('show');
    setTimeout(() => ach.classList.remove('show'), 3500);
}

function createFloatingParticles() {
    const particleContainer = document.getElementById('particles');
    for (let i = 0; i < 32; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.background = (Math.random() > 0.6) ? '#ff006e' : ((Math.random() > 0.3) ? '#8338ec' : '#00ff41');
        particleContainer.appendChild(p);
    }
}

// Game Functions
function toggleDinoGame() {
    const container = document.getElementById('gameContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'flex';
        resizeCanvas();
    } else {
        container.style.display = 'none';
        if (gameRunning) {
            gameOver();
        }
    }
}

function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gameStarted = true;
    score = 0;
    gameSpeed = 3;
    obstacles = [];
    particles = [];

    // Reset dino
    dino.y = canvas.height - 100;
    dino.velocityY = 0;
    dino.jumping = false;

    document.getElementById('startBtn').textContent = 'Running...';
    document.getElementById('gameOver').classList.remove('show');

    gameLoop();
    spawnObstacles();
}

function gameLoop() {
    if (!gameRunning) return;

    update();
    drawGame();

    requestAnimationFrame(gameLoop);
}

function update() {
    if (!gameRunning) return;

    // Update score
    score += 0.1;
    document.getElementById('score').textContent = Math.floor(score);

    // Increase game speed gradually
    gameSpeed = 3 + (score * 0.003);

    // Update dino physics
    updateDino();

    // Update obstacles
    updateObstacles();

    // Update particles
    updateParticles();

    // Check collisions
    checkCollisions();
}

function updateDino() {
    // Apply gravity
    if (dino.jumping) {
        dino.velocityY += gravity;
        dino.y += dino.velocityY;

        // Check if landed
        if (dino.y >= canvas.height - 100) {
            dino.y = canvas.height - 100;
            dino.jumping = false;
            dino.velocityY = 0;
        }
    }
}

function jumpDino() {
    if (!dino.jumping && gameRunning) {
        dino.jumping = true;
        dino.velocityY = -jumpPower;

        // Create jump particles
        createJumpParticles();
    }
}

function updateObstacles() {
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        // Remove obstacles that are off screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function spawnObstacles() {
    if (!gameRunning) return;

    // Random obstacle spawn
    const obstacle = {
        x: canvas.width,
        y: canvas.height - 80,
        width: 30,
        height: 60,
        color: '#ff006e'
    };

    obstacles.push(obstacle);

    // Schedule next obstacle
    const delay = Math.random() * 2000 + 1500; // 1.5-3.5 seconds
    setTimeout(spawnObstacles, delay);
}

function checkCollisions() {
    for (let obstacle of obstacles) {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            gameOver();
            break;
        }
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';

    // Update high score
    if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem('dinoHighScore', highScore.toString());
        document.getElementById('highScore').textContent = highScore;
        showAchievement('🏆 New High Score: ' + highScore + '!');
    }

    // Show game over screen
    document.getElementById('finalScore').textContent = Math.floor(score);
    document.getElementById('gameOver').classList.add('show');

    // Create explosion particles
    createExplosionParticles();
}

function restartGame() {
    gameRunning = false;
    gameStarted = false;
    document.getElementById('gameOver').classList.remove('show');
    drawGame();
    startGame();
}

// Particle Effects
function createJumpParticles() {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: dino.x + Math.random() * dino.width,
            y: dino.y + dino.height,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: Math.random() * -3,
            life: 30,
            color: '#00ff41'
        });
    }
}

function createExplosionParticles() {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: dino.x + dino.width / 2,
            y: dino.y + dino.height / 2,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            life: 60,
            color: '#ff006e'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityY += 0.2; // gravity
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Drawing Functions
function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cyber grid background
    drawGrid();

    // Draw ground
    drawGround();

    // Draw dino
    drawDino();

    // Draw obstacles
    drawObstacles();

    // Draw particles
    drawParticles();

    // Draw UI elements if game is running
    if (gameRunning) {
        drawRunningEffects();
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawGround() {
    const groundY = canvas.height - 50;

    // Ground line with glow effect
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

// --- วาดไดโนเสาร์ด้วยรูป noob.png --- //
function drawDino() {
    ctx.save();
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    ctx.restore();
}

// --- วาดกระบองเพชรด้วยรูป ptoo.png --- //
function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.save();
        ctx.drawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.restore();
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.save();
        const alpha = p.life / 60;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;

        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);

        ctx.restore();
    }
}

function drawRunningEffects() {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
        const x = (Date.now() * gameSpeed * 0.1 + i * 120) % canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 30, canvas.height);
        ctx.stroke();
    }
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!gameStarted) {
            startGame();
        } else {
            jumpDino();
        }
    } else if (event.code === 'Enter') {
        if (!gameRunning && gameStarted) {
            restartGame();
        }
    }
});

// Touch/Click events for mobile
canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    if (!gameStarted) {
        startGame();
    } else {
        jumpDino();
    }
});

canvas.addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    } else {
        jumpDino();
    }
});

// Prevent scrolling on mobile when playing
document.addEventListener('touchstart', function(event) {
    if (event.target === canvas) {
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(event) {
    if (event.target === canvas) {
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(event) {
    if (event.target === canvas) {
        event.preventDefault();
    }
}, { passive: false });
