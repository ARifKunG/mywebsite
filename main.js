// ============= Loading/Particles/Notification ===================
window.onload = function () {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = 0;
        setTimeout(() => document.getElementById('loadingScreen').style.display = 'none', 500);
    }, 1400);
    showAchievement();
    createParticles();
    renderDonorList();
    renderPlaylist();
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
// ============= วงล้อสุ่มคนโดเนท ===============
let donors = JSON.parse(localStorage.getItem('donors') || '[]');
let spinning = false;
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
    document.getElementById('donorList').innerHTML = html;
    drawWheel();
}
function drawWheel() {
    const wheel = document.getElementById('wheel');
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
// ============= Music Player With Youtube and Playlist =============
let playlist = JSON.parse(localStorage.getItem('playlist') || '[]');
let current = parseInt(localStorage.getItem('currentSong')||'0',10) || 0;
let playing = false;
let player, playTimer;
let playlists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
let userInteracted = false;
function renderPlaylist() {
    let html = '';
    if (!playlist.length) html = `<div style="text-align:center;opacity:0.5;">ยังไม่มีเพลงในเพลย์ลิสต์</div>`;
    else html = playlist.map((song,i) =>
        `<div class="playlist-item${i===current?' active':''}" onclick="playSong(${i})">
            <span class="playlist-item-title">${song.title||song.id}</span>
            <button class="remove-btn" onclick="event.stopPropagation();removeSong(${i})">✖</button>
        </div>`
    ).join('');
    document.getElementById('playlist').innerHTML = html;
    updateCurrentSong();
}
function addMusic() {
    const url = document.getElementById('musicUrl').value.trim();
    if (!url) return;
    let ytId = '';
    let ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
    if (ytMatch) ytId = ytMatch[1];
    else if (url.length === 11 && /^[\w-]{11}$/.test(url)) ytId = url;
    else {
        searchYouTube(url, function(result){
            if(result) pushSong({id:result.id,title:result.title});
        });
        document.getElementById('musicUrl').value = '';
        return;
    }
    pushSong({id:ytId,title:''});
    document.getElementById('musicUrl').value = '';
}
function pushSong(song) {
    if (playlist.find(s => s.id === song.id)) return;
    playlist.push(song);
    localStorage.setItem('playlist', JSON.stringify(playlist));
    renderPlaylist();
}
function removeSong(idx) {
    playlist.splice(idx,1);
    if (current>=playlist.length) current=0;
    localStorage.setItem('playlist', JSON.stringify(playlist));
    renderPlaylist();
}
function playSong(idx) {
    current = idx;
    localStorage.setItem('currentSong', current);
    updateCurrentSong();
    playFromPlaylist();
}
function nextSong() {
    if (!playlist.length) return;
    current = (current+1)%playlist.length;
    playSong(current);
}
function prevSong() {
    if (!playlist.length) return;
    current = (current-1+playlist.length)%playlist.length;
    playSong(current);
}
function updateCurrentSong() {
    const song = playlist[current]||{};
    document.getElementById('songTitle').innerText = song.title||song.id||'-';
    document.getElementById('songDuration').innerText = '';
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((el,i)=>el.classList.toggle('active',i===current));
}
// รองรับทุกอุปกรณ์ ต้องให้ user กดปุ่มจริงก่อนเล่น
function togglePlay() {
    userInteracted = true;
    if (!player) playFromPlaylist();
    else if (playing) { 
        player.pauseVideo(); 
        playing=false; 
        document.getElementById('playPauseBtn').innerText='▶️';
    } else { 
        player.playVideo(); 
        player.unMute();
        player.setVolume(Number(document.getElementById('volumeSlider').value));
        playing=true; 
        document.getElementById('playPauseBtn').innerText='⏸️';
    }
}
// สำหรับ mobile/touch event
document.getElementById('playPauseBtn').addEventListener('touchstart', function(e){
    e.preventDefault(); togglePlay();
});
function playFromPlaylist() {
    if (!playlist.length) return;
    const song = playlist[current];
    loadYouTube(song.id, song.title, function(title,duration){
        playlist[current].title = title;
        localStorage.setItem('playlist', JSON.stringify(playlist));
        document.getElementById('songTitle').innerText = title;
        document.getElementById('songDuration').innerText = duration?('⏱ ' + duration):'';
    });
    playing = true;
    document.getElementById('playPauseBtn').innerText = '⏸️';
}
function setVolume(v) {
    if (player) {
        player.setVolume(Number(v));
        player.unMute();
    }
}
function toggleMusicPlayer() {
    document.getElementById('musicPlayer').classList.toggle('collapsed');
}
// ========== Youtube API (ฝังแบบ dynamic) ==========
let ytApiLoaded = false;
function loadYouTube(id, title, cb) {
    if (!ytApiLoaded) {
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        ytApiLoaded = true;
        window.onYouTubeIframeAPIReady = function() {
            playYt(id, title, cb);
        }
    } else playYt(id, title, cb);
}
function playYt(id, title, cb) {
    if (player) {
        player.loadVideoById(id);
        player.unMute();
        player.setVolume(Number(document.getElementById('volumeSlider').value));
        if (userInteracted) player.playVideo();
    }
    else {
        player = new YT.Player('youtubePlayer', {
            height: '0', width: '0', videoId: id, playerVars: { 'autoplay': 0 },
            events: {
                'onReady': function(e) {
                    player.setVolume(Number(document.getElementById('volumeSlider').value));
                    player.unMute();
                    if (userInteracted) player.playVideo();
                },
                'onStateChange': onPlayerStateChange
            }
        });
    }
    getYtInfo(id, function(meta) {
        if (cb) cb(meta.title||title, meta.duration||'');
    });
}
function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) nextSong();
    // handle mute cases on mobile
    if (e.data === YT.PlayerState.PLAYING) {
        player.unMute();
        player.setVolume(Number(document.getElementById('volumeSlider').value));
    }
}
function getYtInfo(id, cb) {
    fetch('https://noembed.com/embed?url=https://youtube.com/watch?v='+id)
        .then(r=>r.json()).then(data=>{
            let dur = '';
            if (data.duration) {
                var sec = parseInt(data.duration,10);
                dur = Math.floor(sec/60)+':'+('0'+sec%60).slice(-2);
            }
            cb({title:data.title||id,duration:dur});
        }).catch(()=>cb({title:id}));
}
function searchYouTube(query, cb) {
    fetch('https://yt.lemnoslife.com/search?part=snippet&q='+encodeURIComponent(query))
    .then(r=>r.json())
    .then(j=>{
        if (j.items && j.items.length > 0) {
            cb({id:j.items[0].id.videoId,title:j.items[0].snippet.title});
        } else cb(null);
    })
    .catch(()=>cb(null));
}
function createPlaylist() {
    const n = prompt('ชื่อเพลย์ลิสต์ใหม่?');
    if (!n) return;
    playlists.push({name:n, songs:playlist});
    localStorage.setItem('userPlaylists', JSON.stringify(playlists));
    alert('บันทึกเพลย์ลิสต์ "'+n+'" แล้ว!');
}
renderDonorList();
renderPlaylist();
