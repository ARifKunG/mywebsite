// --- รูปไดโนเสาร์, กระบองเพชร, นก --- //
const dinoImg = new Image();
dinoImg.src = 'https://github.com/ARifKunG/mywebsite/blob/main/noob.png?raw=true';

const cactusImg = new Image();
cactusImg.src = 'https://github.com/ARifKunG/mywebsite/blob/592b2ddbf88889069a39776715fccb33691ff0c8/ptoo.png?raw=true';

// ตัวอย่างรูปนก (เปลี่ยนเป็นไฟล์ของคุณได้)
const birdImg = new Image();
birdImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/bird_1f426.png';

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
    y: 0,
    width: 60,
    height: 60,
    velocityY: 0,
    jumping: false,
};

let obstacles = [];
let birds = [];
let particles = [];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.offsetWidth - 40);
    canvas.width = maxWidth;
    canvas.height = Math.max(250, maxWidth * 0.5);
    dino.y = canvas.height - dino.height - 40;
    dino.x = Math.min(50, canvas.width * 0.1);
}

window.onload = function() {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = 0;
        setTimeout(() => document.getElementById('loadingScreen').style.display = 'none', 500);
    }, 1400);

    showAchievement();
    createFloatingParticles();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.getElementById('highScore').textContent = highScore;
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
    birds = [];
    particles = [];

    dino.y = canvas.height - dino.height - 40;
    dino.velocityY = 0;
    dino.jumping = false;

    document.getElementById('startBtn').textContent = 'Running...';
    document.getElementById('gameOver').classList.remove('show');

    gameLoop();
    spawnObstacles();
    spawnBird();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    drawGame();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!gameRunning) return;
    score += 0.1;
    document.getElementById('score').textContent = Math.floor(score);
    gameSpeed = 3 + (score * 0.003);
    updateDino();
    updateObstacles();
    updateBirds();
    updateParticles();
    checkCollisions();
}

function updateDino() {
    if (dino.jumping) {
        dino.velocityY += gravity;
        dino.y += dino.velocityY;
        if (dino.y >= canvas.height - dino.height - 40) {
            dino.y = canvas.height - dino.height - 40;
            dino.jumping = false;
            dino.velocityY = 0;
        }
    }
}

function jumpDino() {
    if (!dino.jumping && gameRunning) {
        dino.jumping = true;
        dino.velocityY = -jumpPower;
        createJumpParticles();
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function updateBirds() {
    for (let i = birds.length - 1; i >= 0; i--) {
        birds[i].x -= birds[i].speed;
        birds[i].flapTimer++;
        if (birds[i].flapTimer > 20) {
            birds[i].flapUp = !birds[i].flapUp;
            birds[i].flapTimer = 0;
        }
        birds[i].y += birds[i].flapUp ? -1 : 1;
        if (birds[i].x + birds[i].width < 0) {
            birds.splice(i, 1);
        }
    }
}

function spawnObstacles() {
    if (!gameRunning) return;
    // ปรับขนาดเล็กลง กระโดดง่ายขึ้น!
    const obstacle = {
        x: canvas.width,
        y: canvas.height - 40 - 35, // 35 คือความสูงใหม่
        width: 30,  // เล็กลง จาก 70
        height: 35, // เล็กลงจาก 70
        color: '#ff006e'
    };

    obstacles.push(obstacle);

    // Schedule next obstacle
    const delay = Math.random() * 1200 + 700;
    setTimeout(spawnObstacles, delay);
}

function spawnBird() {
    if (!gameRunning) return;
    // นกโผล่ช้าๆ นาน ๆ มาครั้ง (เช่น 7-12 วินาที)
    const bird = {
        x: canvas.width,
        y: canvas.height - (Math.random() * 120 + 120),
        width: 48,
        height: 48,
        speed: Math.random() * 2 + 4,
        flapUp: Math.random() > 0.5,
        flapTimer: 0
    };

    birds.push(bird);

    // Schedule next bird (นาน ๆ มาครั้ง)
    const delay = Math.random() * 5000 + 7000; // 7-12 วินาที
    setTimeout(spawnBird, delay);
}

function checkCollisions() {
    let hitbox = {
        x: dino.x + dino.width * 0.15,
        y: dino.y + dino.height * 0.15,
        width: dino.width * 0.7,
        height: dino.height * 0.7,
    };

    for (let obstacle of obstacles) {
        if (
            hitbox.x < obstacle.x + obstacle.width &&
            hitbox.x + hitbox.width > obstacle.x &&
            hitbox.y < obstacle.y + obstacle.height &&
            hitbox.y + hitbox.height > obstacle.y
        ) {
            gameOver();
            return;
        }
    }
    for (let bird of birds) {
        if (
            hitbox.x < bird.x + bird.width &&
            hitbox.x + hitbox.width > bird.x &&
            hitbox.y < bird.y + bird.height &&
            hitbox.y + hitbox.height > bird.y
        ) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('startBtn').textContent = 'Start Game';

    if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem('dinoHighScore', highScore.toString());
        document.getElementById('highScore').textContent = highScore;
        showAchievement('🏆 New High Score: ' + highScore + '!');
    }

    document.getElementById('finalScore').textContent = Math.floor(score);
    document.getElementById('gameOver').classList.add('show');
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
        p.velocityY += 0.2;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Drawing Functions
function drawGame() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawGround();
    drawDino();
    drawObstacles();
    drawBirds();
    drawParticles();
    if (gameRunning) {
        drawRunningEffects();
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawGround() {
    const groundY = canvas.height - 40;
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

function drawDino() {
    ctx.save();
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    ctx.restore();
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.save();
        ctx.drawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.restore();
    }
}

function drawBirds() {
    for (let bird of birds) {
        ctx.save();
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
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
