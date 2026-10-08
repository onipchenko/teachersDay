/**
 * app.js — логика сайта
 */

/* ===== РЕНДЕР КАРТОЧЕК ===== */
function renderTeachers(list) {
  const grid = document.getElementById('teachersGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#aaa;font-size:1.1rem;grid-column:1/-1;">Ничего не найдено 🤷</p>';
    return;
  }

  // Сортировка А → Я
  const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  sorted.forEach((teacher, i) => {
    const delay = (i % 12) * 55;
    const colorClass = `color-${i % 6}`;
    const card = document.createElement('div');
    card.className = `teacher-card ${colorClass}`;
    card.style.animationDelay = `${delay}ms`;

    // Карточка в сетке — только эмодзи, имя, предмет
    card.innerHTML = `
      <span class="teacher-emoji">${teacher.emoji}</span>
      <div class="teacher-name">${teacher.name}</div>
      <span class="teacher-subject">${teacher.subject}</span>
    `;
    card.addEventListener('click', () => openModal(teacher));
    grid.appendChild(card);
  });
}

/* ===== ФИЛЬТР ===== */
function filterTeachers() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = TEACHERS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.subject.toLowerCase().includes(q)
  );
  renderTeachers(filtered);
}


/* ===== МОДАЛЬНОЕ ОКНО ===== */
function openModal(teacher) {
  // Портрет
  const portrait = teacher.photo
    ? `<img src="${teacher.photo}" class="modal-portrait" alt="Фото" />`
    : `<div class="modal-portrait modal-portrait--empty">
         <span>${teacher.emoji}</span>
         <small>Фото препода</small>
       </div>`;

  // Мем
  const meme = teacher.photoMeme
    ? `<img src="${teacher.photoMeme}" class="modal-meme" alt="Мем" />`
    : `<div class="modal-meme modal-meme--empty">
         <span>🎉</span>
         <small>Мем-поздравление</small>
       </div>`;

  // Вставляем фото-блок перед .modal-body
  let photosEl = document.getElementById('modalPhotos');
  if (!photosEl) {
    photosEl = document.createElement('div');
    photosEl.id = 'modalPhotos';
    const bodyEl = document.querySelector('.modal-body');
    bodyEl.parentNode.insertBefore(photosEl, bodyEl);
  }
  photosEl.innerHTML = `<div class="modal-photos-grid">${portrait}${meme}</div>`;

  // Эмодзи скрываем — фото есть в блоке выше
  document.getElementById('modalEmoji').style.display = 'none';
  document.getElementById('modalName').textContent = teacher.name;
  document.getElementById('modalSubject').textContent = teacher.subject;
  document.getElementById('modalMsg').innerHTML = `«${teacher.msg}»`;

  const btn = document.querySelector('.btn-heart');
  btn.textContent = '❤️ Отправить сердечко';
  btn.classList.remove('sent');

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Закрытие по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ===== КНОПКА СЕРДЕЧКО ===== */
function sendHeart(btn) {
  if (btn.classList.contains('sent')) return;
  btn.classList.add('sent');
  btn.textContent = '✅ Поздравление отправлено!';
  spawnHearts();
}

function spawnHearts() {
  const hearts = ['❤️','💛','💚','💙','💜','🧡','💗','💖'];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.cssText = `
        position: fixed;
        font-size: ${1.2 + Math.random() * 1.4}rem;
        left: ${30 + Math.random() * 40}%;
        top: 60%;
        pointer-events: none;
        z-index: 9998;
        animation: flyUp ${0.9 + Math.random() * 0.8}s ease forwards;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 80);
  }
}

// CSS для flyUp-анимации сердечек
const style = document.createElement('style');
style.textContent = `
  @keyframes flyUp {
    0%   { opacity:1; transform: translateY(0) scale(1) rotate(0deg); }
    100% { opacity:0; transform: translateY(-220px) scale(1.4) rotate(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random()*30}deg); }
  }
`;
document.head.appendChild(style);

/* ===== КОНФЕТТИ ===== */
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let animFrame;

function launchConfetti() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  confettiPieces = [];

  const colors = ['#f9a825','#e91e63','#9c27b0','#1976d2','#00897b','#43a047','#ff7043','#f06292'];
  for (let i = 0; i < 220; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 4,
      vy: 2.5 + Math.random() * 4,
      opacity: 0.85 + Math.random() * 0.15,
    });
  }

  cancelAnimationFrame(animFrame);
  animateConfetti();

  // Автоостановка через 5 секунд
  setTimeout(() => cancelAnimationFrame(animFrame), 5000);
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotSpeed;
    if (p.y > canvas.height + 20) {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    }
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
  animFrame = requestAnimationFrame(animateConfetti);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderTeachers(TEACHERS);
});
