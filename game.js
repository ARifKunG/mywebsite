document.addEventListener('DOMContentLoaded', function() {
// --- รูปไดโนเสาร์, กระบองเพชร, กล่อง, เหรียญ --- //
const dinoImg = new Image();
dinoImg.src = 'https://github.com/ARifKunG/mywebsite/blob/main/noob.png?raw=true';

const cactusImg = new Image();
cactusImg.src = 'https://github.com/ARifKunG/mywebsite/blob/592b2ddbf88889069a39776715fccb33691ff0c8/ptoo.png?raw=true';

const boxImg = new Image();
boxImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/package_1f4e6.png';

const coinImg = new Image();
coinImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/coin_1fa99.png';

// ---- image error fallback ----
dinoImg.onerror = cactusImg.onerror = boxImg.onerror = coinImg.onerror = function() {
    this.broken = true;
};
dinoImg.onload = cactusImg.onload = boxImg.onload = coinImg.onload = function() {
    this.broken = false;
};

let gameRunning = false;
let gameStarted = false;
let score = 0;
let highScore = Number(localStorage.getItem('dinoHighScore') || '0');

// ปรับความเร็วเริ่มต้นให้ช้าลง
let gameSpeed = 1.4;
let gravity = 0.5;   // ปกติเมื่อตกลง
let slowGravity = 0.10; // กดค้างจะตกช้ากว่า
let jumpPower = 12;
let isHoldJump = false;

let dino = {
    x: 70,
    y: 0,
    width: 40,  // ลดขนาดไดโนฯนิดหน่อย (เล่นง่ายขึ้น)
    height: 40,
    velocityY: 0,
    jumping: false,
};

let obstacles = [];
let boxes = [];
let coins = [];
let particles = [];

let comboJump = 0;
let memePool = [
    "ไม่เป็นไรนะ! กย์วันนี้ พรุ่งนี้ ก็ เกย์ ",
    "แพ้ก็แค่เกย์ คือเกย์ ในใจ",
    "Next time will be better! ",
    "ฮ่าๆๆ พลาดหน่อยก็เกย์อยู่ดี ",
    "บอกเลยว่าคุณโครตเกย์ 😉",
    " เกย์จริงๆ😢"
];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, container.offsetWidth - 40);
    canvas.width = maxWidth;
    canvas.height = Math.max(280, maxWidth * 0.55);
    dino.y = canvas.height - dino.height - 50;
    dino.x = Math.max(70, canvas.width * 0.12);
}

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

function showAchievement(text = '🏆 Achievement Unlocked: Welcome Gamer!') {
    const ach = document.getElementById('achievement');
    ach.textContent = text;
    ach.classList.add('show');
    setTimeout(() => ach.classList.remove('show'), 3500);
}

function showMeme(text) {
    const meme = document.getElementById('memeMsg');
    meme.textContent = text;
    meme.classList.add('show');
    setTimeout(() => meme.classList.remove('show'), 3500);
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

window.toggleDinoGame = function() {
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

window.startGame = function() {
    if (gameRunning) return;
    gameRunning = true;
    gameStarted = true;
    score = 0;
    gameSpeed = 1.4;
    obstacles = [];
    boxes = [];
    coins = [];
    particles = [];
    comboJump = 0;

    dino.y = canvas.height - dino.height - 50;
    dino.velocityY = 0;
    dino.jumping = false;

    document.getElementById('startBtn').textContent = 'Running...';
    document.getElementById('gameOver').classList.remove('show');
    document.getElementById('memeMsg').classList.remove('show');

    gameLoop();
    scheduleNextSet();
}

// เว้นระยะห่างในการ spawn อุปสรรคแต่ละชนิด (spawn 1 อย่างต่อชุด)
function scheduleNextSet() {
    if (!gameRunning) return;

    const minGap = canvas.width * 0.42;
    const maxGap = canvas.width * 0.62;
    let gap = Math.random() * (maxGap - minGap) + minGap;

    // สมดุลโอกาสเจอแต่ละชนิด
    let rand = Math.random();
    let type;
    if (rand < 0.4) type = 'cactus';
    else if (rand < 0.7) type = 'box';
    else type = 'coin';

    if (type === 'cactus') {
        obstacles.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - 28, // สูงขึ้น (ขนาดเล็กลง)
            width: 22,                  // <<< ลดขนาด
            height: 28,
            color: '#ff006e'
        });
    } else if (type === 'box') {
        boxes.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - 23,
            width: 18,                  // <<< ลดขนาด
            height: 23
        });
    } else if (type === 'coin') {
        coins.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - dino.height - 18,
            width: 16,
            height: 16
        });
    }

    if (type !== 'coin') {
        comboJump++;
        if (comboJump === 10) {
            showAchievement("🔥 Combo 10! เก่งมาก");
            comboJump = 0;
        }
    }

    // เหรียญพิเศษในบางรอบ
    if (Math.random() < 0.2) {
        coins.push({
            x: canvas.width + gap + 40,
            y: canvas.height - 50 - dino.height - 14,
            width: 16,
            height: 16
        });
    }

    const delay = Math.random() * 600 + 1200;
    setTimeout(scheduleNextSet, delay);
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

    gameSpeed = 1.4 + (score * 0.0026);
    updateDino();
    updateObstacles();
    updateBoxes();
    updateCoins();
    updateParticles();
    checkCollisions();
}

function updateDino() {
    if (dino.jumping) {
        // ถ้ากดค้างใช้ slowGravity
        let currentGravity = isHoldJump ? slowGravity : gravity;
        dino.velocityY += currentGravity;
        dino.y += dino.velocityY;
        if (dino.y >= canvas.height - dino.height - 50) {
            dino.y = canvas.height - dino.height - 50;
            dino.jumping = false;
            dino.velocityY = 0;
        }
    }
}

window.jumpDino = function() {
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

function updateBoxes() {
    for (let i = boxes.length - 1; i >= 0; i--) {
        boxes[i].x -= gameSpeed;
        if (boxes[i].x + boxes[i].width < 0) {
            boxes.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].x -= gameSpeed;
        if (coins[i].x + coins[i].width < 0) {
            coins.splice(i, 1);
        }
    }
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
            gameOver("โดนพี่โต!");
            return;
        }
    }
    for (let box of boxes) {
        if (
            hitbox.x < box.x + box.width &&
            hitbox.x + hitbox.width > box.x &&
            hitbox.y < box.y + box.height &&
            hitbox.y + hitbox.height > box.y
        ) {
            gameOver("โดนกล่อง!");
            return;
        }
    }
    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        if (
            hitbox.x < coin.x + coin.width &&
            hitbox.x + hitbox.width > coin.x &&
            hitbox.y < coin.y + coin.height &&
            hitbox.y + hitbox.height > coin.y
        ) {
            showAchievement("💰 เก็บเหรียญได้ +10 คะแนน!");
            score += 10;
            coins.splice(i, 1);
        }
    }
}

function gameOver(reason = "") {
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

    let memeMsg = reason ? reason + " " : "";
    memeMsg += memePool[Math.floor(Math.random() * memePool.length)];
    showMeme(memeMsg);
}

window.restartGame = function() {
    gameRunning = false;
    gameStarted = false;
    document.getElementById('gameOver').classList.remove('show');
    document.getElementById('memeMsg').classList.remove('show');
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
    drawBoxes();
    drawCoins();
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
    const groundY = canvas.height - 50;
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

function safeDrawImage(img, x, y, w, h, fallbackColor = '#333') {
    if (img && img.complete && img.naturalWidth !== 0 && !img.broken) {
        ctx.drawImage(img, x, y, w, h);
    } else {
        ctx.save();
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }
}

function drawDino() {
    ctx.save();
    safeDrawImage(dinoImg, dino.x, dino.y, dino.width, dino.height, '#00ff41');
    ctx.restore();
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.save();
        safeDrawImage(cactusImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height, '#ff006e');
        ctx.restore();
    }
}

function drawBoxes() {
    for (let box of boxes) {
        ctx.save();
        safeDrawImage(boxImg, box.x, box.y, box.width, box.height, '#f5c16c');
        ctx.restore();
    }
}

function drawCoins() {
    for (let coin of coins) {
        ctx.save();
        safeDrawImage(coinImg, coin.x, coin.y, coin.width, coin.height, '#f7d700');
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
            isHoldJump = true;
        }
    }
});
document.addEventListener('keyup', function(event) {
    if (event.code === 'Space') {
        isHoldJump = false;
    }
});

canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    if (!gameStarted) {
        startGame();
    } else {
        jumpDino();
        isHoldJump = true;
    }
});
canvas.addEventListener('touchend', function() {
    isHoldJump = false;
});

canvas.addEventListener('click', function() {
    if (!gameStarted) {
        startGame();
    } else {
        jumpDino();
    }
});

document.addEventListener('touchmove', function(event) {
    if (event.target === canvas) {
        event.preventDefault();
    }
}, { passive: false });

window.addEventListener('blur', function() {
    isHoldJump = false;
});
});
