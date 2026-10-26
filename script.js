/**
 * Interactive Script for "내 첫번째 아이디어" (My First Idea) Web Experience
 * Blue Harmonized Theme Edition
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const cursorGlow = document.getElementById('cursor-glow');
  const cardWrapper = document.getElementById('card-wrapper');
  const glassCard = document.getElementById('glass-card');
  const sparkBtn = document.getElementById('spark-btn');
  const memoBtn = document.getElementById('memo-btn');
  const themeBtn = document.getElementById('theme-btn');
  const themeLabel = document.getElementById('theme-label');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');

  const memoModal = document.getElementById('memo-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const ideaForm = document.getElementById('idea-form');
  const ideaInput = document.getElementById('idea-input');
  const charCount = document.getElementById('char-count');
  
  const savedIdeaContainer = document.getElementById('saved-idea-container');
  const savedIdeaText = document.getElementById('saved-idea-text');
  const editIdeaBtn = document.getElementById('edit-idea-btn');
  const toast = document.getElementById('toast');

  // --- Sound Synthesizer (Web Audio API) ---
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChime(freq = 587.33, type = 'sine', duration = 0.8) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  function playSparkChord() {
    if (!soundEnabled) return;
    // Pure, crystal-clear blue harmonic tones
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playChime(freq, 'triangle', 0.9);
      }, idx * 70);
    });
  }

  // --- Theme Controller (All 3 are carefully tuned variations of Blue) ---
  const themes = [
    { id: 'sapphire', name: 'Sapphire Blue', icon: '💎' },
    { id: 'cyan', name: 'Cyber Cyan', icon: '⚡' },
    { id: 'midnight', name: 'Midnight Ocean', icon: '🌊' }
  ];
  let currentThemeIndex = 0;

  themeBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const nextTheme = themes[currentThemeIndex];
    document.body.setAttribute('data-theme', nextTheme.id);
    themeLabel.textContent = nextTheme.name;
    themeBtn.querySelector('.btn-icon').textContent = nextTheme.icon;
    playChime(587.33, 'sine', 0.35);
    showToast(`${nextTheme.name} 블루 테마가 적용되었습니다.`);
  });

  // Sound Toggle
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔔' : '🔕';
    soundBtn.title = soundEnabled ? '사운드 켜짐' : '사운드 꺼짐';
    showToast(soundEnabled ? '사운드가 켜졌습니다.' : '사운드가 음소거되었습니다.');
  });

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // --- Background Particle & Spark Canvas ---
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  // Cursor Light Tracker
  let mouse = { x: width / 2, y: height / 2, active: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;

    // 3D Tilt on card
    handleCardTilt(e);
  });

  // Card 3D tilt calculation
  function handleCardTilt(e) {
    const rect = glassCard.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const distX = e.clientX - cardCenterX;
    const distY = e.clientY - cardCenterY;

    const maxDistance = 500;
    const distance = Math.hypot(distX, distY);

    if (distance < maxDistance) {
      const tiltX = (distY / (rect.height / 2)) * -5.5;
      const tiltY = (distX / (rect.width / 2)) * 5.5;
      cardWrapper.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    } else {
      cardWrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  }

  // Ambient Star Particles
  let stars = [];
  const STAR_COUNT = 85;

  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.28;
      this.speedY = (Math.random() - 0.5) * 0.28;
      this.baseAlpha = Math.random() * 0.65 + 0.25;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      this.pulseVal += this.pulseSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.pulseVal) * 0.28;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0, this.alpha)})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(147, 197, 253, 0.85)';
      ctx.fill();
    }
  }

  function initParticles() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(new Star());
    }
  }
  initParticles();

  // Burst Particles (Blue & Crystal Sparks)
  let sparkParticles = [];
  class SparkParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 3.5 + 1.8;

      // Vibrant Blue & Cyan Palette
      const colors = ['#38bdf8', '#60a5fa', '#2563eb', '#1d4ed8', '#93c5fd', '#ffffff', '#22d3ee'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.08;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.life -= this.decay;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 14;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  function triggerSparkBurst(originX, originY) {
    playSparkChord();
    for (let i = 0; i < 70; i++) {
      sparkParticles.push(new SparkParticle(originX, originY));
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw constellation lines between nearby stars (Blue glow)
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();

      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(96, 165, 250, ${0.18 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Update Spark Particles
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      sparkParticles[i].update();
      sparkParticles[i].draw();
      if (sparkParticles[i].life <= 0) {
        sparkParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();

  // Spark button click event
  sparkBtn.addEventListener('click', (e) => {
    const rect = sparkBtn.getBoundingClientRect();
    const burstX = rect.left + rect.width / 2;
    const burstY = rect.top + rect.height / 2;
    triggerSparkBurst(burstX, burstY);
  });

  // Click on Title gives glowing blue sparks
  document.getElementById('main-title').addEventListener('click', (e) => {
    triggerSparkBurst(e.clientX, e.clientY);
  });

  // --- Modal & Idea Persistence ---
  function loadSavedIdea() {
    const saved = localStorage.getItem('my_first_idea');
    if (saved && saved.trim().length > 0) {
      savedIdeaText.textContent = saved;
      savedIdeaContainer.classList.remove('hidden');
      memoBtn.innerHTML = '<span>✏️ 아이디어 수정하기</span>';
    } else {
      savedIdeaContainer.classList.add('hidden');
      memoBtn.innerHTML = '<span>💡 생각 기록하기</span>';
    }
  }

  function openModal() {
    initAudio();
    const currentSaved = localStorage.getItem('my_first_idea') || '';
    ideaInput.value = currentSaved;
    updateCharCount();
    memoModal.classList.remove('hidden');
    ideaInput.focus();
    playChime(659.25, 'sine', 0.25);
  }

  function closeModal() {
    memoModal.classList.add('hidden');
  }

  function updateCharCount() {
    const len = ideaInput.value.length;
    charCount.textContent = `${len} / 200`;
  }

  memoBtn.addEventListener('click', openModal);
  editIdeaBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  memoModal.addEventListener('click', (e) => {
    if (e.target === memoModal) {
      closeModal();
    }
  });

  ideaInput.addEventListener('input', updateCharCount);

  ideaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = ideaInput.value.trim();
    if (val) {
      localStorage.setItem('my_first_idea', val);
      loadSavedIdea();
      closeModal();
      showToast('첫 번째 아이디어가 안전하게 기록되었습니다! 💎');
      triggerSparkBurst(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  // Initial load
  loadSavedIdea();
});
