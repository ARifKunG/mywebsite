window.onload = function () {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = 0;
        setTimeout(() => document.getElementById('loadingScreen').style.display = 'none', 500);
    }, 1400);
    showAchievement();
    createParticles();
    renderDonorList();
};

function showAchievement(text='🏆 Achievement Unlocked: Visitor!') {
    const ach = document.getElementById('achievement');
    ach.textContent = text;
    ach.classList.add('show');
    setTimeout(() => ach.classList.remove('show'), 3500);
}
function createParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 32; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.background = (Math.random() > 0.6) ? '#ff006e' : ((Math.random() > 0.3) ? '#8338ec' : '#00ff41');
        particles.appendChild(p);
    }
}

// วงล้อสุ่มคนโดเนท (toggle ได้)
let donors = JSON.parse(localStorage.getItem('donors') || '[]');
let spinning = false;

function toggleWheelGame() {
    const container = document.getElementById('wheelGameContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = "flex";
        renderDonorList();
    } else {
        container.style.display = "none";
    }
}

function addDonor() {
    const name = document.getElementById('donorName').value.trim();
    if (!name || donors.includes(name)) return;
    donors.push(name);
    localStorage.setItem('donors', JSON.stringify(donors));
    document.getElementById('donorName').value = '';
    renderDonorList();
    drawWheel();
}
function clearDonors() {
    donors = [];
    localStorage.setItem('donors', JSON.stringify([]));
    renderDonorList();
    drawWheel();
    document.getElementById('winner').innerText = '-';
}
function renderDonorList() {
    let html = '';
    if (!donors.length) html = '<div style="text-align:center;opacity:0.5;">ยังไม่มีคนโดเนท</div>';
    else html = donors.map((n, i) =>
        `<span style="margin-right:8px;">${i+1}) ${n}</span>`
    ).join('<br>');
    const donorList = document.getElementById('donorList');
    if (donorList) donorList.innerHTML = html;
    drawWheel();
}
function drawWheel() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;
    wheel.innerHTML = '<div class="wheel-center">🎯</div>';
    if (!donors.length) return;
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    canvas.style.position = 'absolute'; canvas.style.top = 0; canvas.style.left = 0;
    wheel.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const seg = donors.length;
    const colors = ['#ff006e','#8338ec','#00ff41','#00d4ff','#ffaa00','#f72585','#b5179e','#00ffab','#3a86ff','#fff200'];
    for (let i = 0; i < seg; i++) {
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.arc(100, 100, 95, 2 * Math.PI * i / seg, 2 * Math.PI * (i + 1) / seg);
        ctx.closePath();
        ctx.fillStyle = colors[i%colors.length];
        ctx.globalAlpha = 0.92;
        ctx.fill();
    }
    for (let i = 0; i < seg; i++) {
        ctx.save();
        ctx.translate(100, 100);
        ctx.rotate((2 * Math.PI * (i + 0.5) / seg));
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Prompt";
        ctx.fillText(donors[i], 60, 6);
        ctx.restore();
    }
}
function spinWheel() {
    if (spinning || donors.length < 2) return;
    spinning = true;
    document.getElementById('spinBtn').disabled = true;
    const wheel = document.getElementById('wheel');
    const seg = donors.length;
    const winnerIdx = Math.floor(Math.random() * seg);
    const degPerSeg = 360 / seg;
    const stopAt = 360 * (3 + Math.random()*3) + (360 - winnerIdx * degPerSeg - degPerSeg/2);
    wheel.style.transition = 'transform 3s cubic-bezier(0.23,1,0.32,1)';
    wheel.style.transform = `rotate(${stopAt}deg)`;
    setTimeout(() => {
        spinning = false;
        wheel.style.transition = '';
        wheel.style.transform = `rotate(${(360 - winnerIdx * degPerSeg - degPerSeg/2)%360}deg)`;
        document.getElementById('winner').innerText = donors[winnerIdx];
        document.getElementById('spinBtn').disabled = false;
    }, 3000);
}