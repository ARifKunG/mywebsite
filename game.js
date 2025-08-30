document.addEventListener('DOMContentLoaded', function() {
// --- รูปไดโนเสาร์, กระบองเพชร, กล่อง, เหรียญ, หลุม --- //
const dinoImg = new Image();
dinoImg.src = 'https://github.com/ARifKunG/mywebsite/blob/main/noob.png?raw=true';

const cactusImg = new Image();
cactusImg.src = 'https://github.com/ARifKunG/mywebsite/blob/592b2ddbf88889069a39776715fccb33691ff0c8/ptoo.png?raw=true';

const boxImg = new Image();
boxImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/package_1f4e6.png';

const coinImg = new Image();
coinImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/coin_1fa99.png';

const pitImg = new Image();
pitImg.src = 'https://em-content.zobj.net/source/microsoft-teams/363/hole_1faa0.png';

// ---- image error fallback ----
dinoImg.onerror = cactusImg.onerror = boxImg.onerror = coinImg.onerror = pitImg.onerror = function() {
    this.broken = true;
};
dinoImg.onload = cactusImg.onload = boxImg.onload = coinImg.onload = pitImg.onload = function() {
    this.broken = false;
};

let gameRunning = false;
let gameStarted = false;
let score = 0;
let highScore = Number(localStorage.getItem('dinoHighScore') || '0');

// ปรับความเร็วเริ่มต้นให้ช้าลง
let gameSpeed = 1.5;
let gravity = 0.5;
let jumpPower = 12;

let dino = {
    x: 70,
    y: 0,
    width: 60,
    height: 60,
    velocityY: 0,
    jumping: false,
};

let obstacles = [];
let boxes = [];
let coins = [];
let pits = [];
let particles = [];

let comboJump = 0;
let memePool = [
    "ไม่เป็นไรนะ! ไดโนยังมีพรุ่งนี้",
    "แพ้ก็แค่เกม แต่เราคือผู้ชนะในใจ",
    "Next time will be better! 🦖",
    "ฮ่าๆๆ พลาดหน่อยก็ไม่เป็นไร",
    "บอกเลยว่าคุณเก่งมาก 😉",
    "Meme: ไดโนร้องไห้ 😢"
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
    gameSpeed = 1.5;
    obstacles = [];
    boxes = [];
    coins = [];
    pits = [];
    particles = [];
    comboJump = 0;

    dino.y = canvas.height - dino.height - 50;
    dino.velocityY = 0;
    dino.jumping = false;

    document.getElementById('startBtn').textContent = 'Running...';
    document.getElementById('gameOver').classList.remove('show');
    document.getElementById('memeMsg').classList.remove('show');

    gameLoop();
    scheduleNextSet(); // เปลี่ยนจาก spawnObstacles แบบเดิม
}

// เว้นระยะห่างมากๆในการ spawn อุปสรรคแต่ละชนิด (แต่ละรอบสุ่มว่าจะเจออะไร)
function scheduleNextSet() {
    if (!gameRunning) return;

    // เว้นช่องว่างสุ่มแต่ละชุด (ระยะห่างเยอะ)
    const minGap = canvas.width * 0.4; // ต้องวิ่งได้ 40% ของจอก่อนเจอสิ่งใหม่
    const maxGap = canvas.width * 0.65; // สูงสุด 65%
    let gap = Math.random() * (maxGap - minGap) + minGap;

    // สุ่มว่าจะ spawn อะไร (แค่ 1 อย่างในแต่ละรอบ)
    let choices = ['cactus', 'box', 'coin', 'pit'];
    let type = choices[Math.floor(Math.random() * choices.length)];

    // จะไม่ spawn ซ้อนกัน
    if (type === 'cactus') {
        obstacles.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - 45,
            width: 38,
            height: 45,
            color: '#ff006e'
        });
    } else if (type === 'box') {
        boxes.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - 38,
            width: 32,
            height: 32
        });
    } else if (type === 'coin') {
        coins.push({
            x: canvas.width + gap,
            y: canvas.height - 50 - dino.height - 24,
            width: 24,
            height: 24
        });
    } else if (type === 'pit') {
        pits.push({
            x: canvas.width + gap,
            y: canvas.height - 50,
            width: 36,
            height: 12
        });
    }

    // เพิ่ม comboJump เฉพาะ cactus/box/pit
    if (type !== 'coin') {
        comboJump++;
        if (comboJump === 10) {
            showAchievement("🔥 Combo 10! เก่งมาก");
            comboJump = 0; // รีใหม่เมื่อถึง 10
        }
    }

    // schedule รอบถัดไป
    const delay = Math.random() * 600 + 1200; // 1.2-1.8s
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
    gameSpeed = 1.5 + (score * 0.003);
    updateDino();
    updateObstacles();
    updateBoxes();
    updateCoins();
    updatePits();
    updateParticles();
    checkCollisions();
}

function updateDino() {
    if (dino.jumping) {
        dino.velocityY += gravity;
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

function updatePits() {
    for (let i = pits.length - 1; i >= 0; i--) {
        pits[i].x -= gameSpeed;
        if (pits[i].x + pits[i].width < 0) {
            pits.splice(i, 1);
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
            gameOver("โดนกระบองเพชร!");
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
    for (let pit of pits) {
        if (
            hitbox.x + hitbox.width > pit.x &&
            hitbox.x < pit.x + pit.width &&
            hitbox.y + hitbox.height > pit.y
        ) {
            if (dino.y + dino.height >= pit.y) {
                gameOver("ตกหลุม!");
                return;
            }
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
    drawPits();
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

function drawPits() {
    for (let pit of pits) {
        ctx.save();
        safeDrawImage(pitImg, pit.x, pit.y, pit.width, pit.height, '#222');
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

});
