'use strict';

/* =========================================================
   UTILITAS
   ========================================================= */
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const lcm = (a, b) => (a * b) / gcd(a, b);
const fmt = n => n.toLocaleString('id-ID');

function buildQ(question, correct, wrongs, explanation) {
  const correctStr = String(correct);
  const wrongsStr = [...new Set(wrongs.map(String))].filter(w => w !== correctStr);
  while (wrongsStr.length < 3) {
    const num = parseInt(correctStr, 10);
    const candidate = isNaN(num)
      ? `pilihan ${wrongsStr.length + 1}`
      : String(num + wrongsStr.length + 1);
    if (!wrongsStr.includes(candidate) && candidate !== correctStr) {
      wrongsStr.push(candidate);
    }
  }
  return {
    question,
    correct: correctStr,
    options: shuffle([correctStr, ...wrongsStr.slice(0, 3)]),
    explanation
  };
}

/* =========================================================
   TOPIK & GENERATOR SOAL
   ========================================================= */
const Topics = {
  bilangan: {
    name: '🔢 Bilangan & Operasi',
    desc: 'Nilai tempat hingga operasi campuran',
    color: '#4ecdc4',
    levels: {
      1: {
        title: 'Nilai Tempat',
        gen: () => {
          const n = rnd(1000, 99999);
          const places = ['satuan', 'puluhan', 'ratusan', 'ribuan', 'puluh ribuan'];
          const idx = rnd(0, 4);
          const digit = Math.floor(n / Math.pow(10, idx)) % 10;
          const wrongs = new Set();
          while (wrongs.size < 3) {
            const w = rnd(0, 9);
            if (w !== digit) wrongs.add(w);
          }
          return buildQ(
            `Angka <b>${fmt(n)}</b><br>Berapakah angka pada tempat <b>${places[idx]}</b>?`,
            digit,
            [...wrongs],
            `Pada bilangan ${fmt(n)}, digit ${digit} menempati posisi ${places[idx]}.`
          );
        }
      },
      2: {
        title: 'Tambah & Kurang',
        gen: () => {
          const a = rnd(100, 999), b = rnd(100, 999);
          if (Math.random() > 0.5) {
            const c = a + b;
            return buildQ(`${fmt(a)} + ${fmt(b)} = ?`, c,
              [c + 10, c - 10, c + 100],
              `${fmt(a)} + ${fmt(b)} = ${fmt(c)}.`);
          } else {
            const big = Math.max(a, b), small = Math.min(a, b);
            const c = big - small;
            return buildQ(`${fmt(big)} − ${fmt(small)} = ?`, c,
              [c + 10, c - 10, c + 100].map(Math.abs),
              `${fmt(big)} − ${fmt(small)} = ${fmt(c)}.`);
          }
        }
      },
      3: {
        title: 'Kali & Bagi',
        gen: () => {
          if (Math.random() > 0.5) {
            const a = rnd(3, 12), b = rnd(3, 12);
            const c = a * b;
            return buildQ(`${a} × ${b} = ?`, c,
              [a * b + a, a * b - b, a + b],
              `${a} × ${b} = ${c}.`);
          } else {
            const b = rnd(2, 12);
            const c = rnd(2, 12);
            const a = b * c;
            return buildQ(`${a} ÷ ${b} = ?`, c,
              [c + 1, c - 1, c + 2],
              `${a} ÷ ${b} = ${c} karena ${b} × ${c} = ${a}.`);
          }
        }
      },
      4: {
        title: 'Operasi Campuran',
        gen: () => {
          const a = rnd(5, 20), b = rnd(2, 10), c = rnd(2, 10);
          const correct = a + b * c;
          return buildQ(
            `${a} + ${b} × ${c} = ?`,
            correct,
            [(a + b) * c, a * b + c, a + b + c],
            `Kerjakan perkalian dulu: ${b} × ${c} = ${b * c}. Lalu ${a} + ${b * c} = ${correct}.`
          );
        }
      }
    }
  },

  pecahan: {
    name: '½ Pecahan',
    desc: 'Baca, senilai, banding, tambah',
    color: '#ff6b9d',
    levels: {
      1: {
        title: 'Membaca Pecahan',
        gen: () => {
          const words = ['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh'];
          const num = rnd(1, 8);
          const den = rnd(num + 1, 10);
          return buildQ(
            `Pecahan "<b>${words[num]} per ${words[den]}</b>" ditulis...`,
            `${num}/${den}`,
            [`${den}/${num}`, `${num}/${den + 1}`, `${num + 1}/${den}`],
            `"${words[num]} per ${words[den]}" = ${num}/${den}.`
          );
        }
      },
      2: {
        title: 'Pecahan Senilai',
        gen: () => {
          const base = pick([[1,2],[1,3],[1,4],[2,3],[3,4],[2,5],[3,5]]);
          const mult = rnd(2, 4);
          const num = base[0] * mult, den = base[1] * mult;
          return buildQ(
            `Manakah pecahan yang <b>senilai</b> dengan <b>${num}/${den}</b>?`,
            `${base[0]}/${base[1]}`,
            [`${base[0]+1}/${base[1]}`, `${base[0]}/${base[1]+1}`, `${base[0]+1}/${base[1]+1}`],
            `${num}/${den} disederhanakan dengan membagi dengan ${mult}: ${num}÷${mult}=${base[0]}, ${den}÷${mult}=${base[1]}. Jadi ${base[0]}/${base[1]}.`
          );
        }
      },
      3: {
        title: 'Bandingkan Pecahan',
        gen: () => {
          const fracs = [];
          let attempts = 0;
          while (fracs.length < 4 && attempts < 60) {
            attempts++;
            const d = rnd(2, 8);
            const n = rnd(1, d - 1);
            if (!fracs.some(f => f[0] * d === f[1] * n)) fracs.push([n, d]);
          }
          let largest = fracs[0];
          fracs.forEach(f => { if (f[0] * largest[1] > largest[0] * f[1]) largest = f; });
          const correct = `${largest[0]}/${largest[1]}`;
          const wrongs = fracs.filter(f => f !== largest).map(f => `${f[0]}/${f[1]}`);
          return buildQ(
            'Manakah pecahan <b>terbesar</b>?',
            correct,
            wrongs,
            fracs.map(f => `${f[0]}/${f[1]} ≈ ${(f[0]/f[1]).toFixed(2)}`).join(' · ') + `. Terbesar: ${correct}.`
          );
        }
      },
      4: {
        title: 'Tambah Pecahan',
        gen: () => {
          const den = rnd(4, 10);
          const n1 = rnd(1, den - 2);
          const n2 = rnd(1, den - 1 - n1);
          return buildQ(
            `${n1}/${den} + ${n2}/${den} = ?`,
            `${n1 + n2}/${den}`,
            [`${n1 + n2 + 1}/${den}`, `${n1 + n2 - 1}/${den}`, `${n1 + n2}/${den * 2}`],
            `Penyebut sama (${den}), jumlahkan pembilang: ${n1} + ${n2} = ${n1 + n2}. Hasil: ${n1 + n2}/${den}.`
          );
        }
      }
    }
  },

  kpkfpb: {
    name: '🔗 KPK & FPB',
    desc: 'Kelipatan, faktor, soal cerita',
    color: '#a06cd5',
    levels: {
      1: {
        title: 'Faktor Bilangan',
        gen: () => {
          const n = rnd(6, 24);
          const factors = [];
          for (let i = 1; i <= n; i++) if (n % i === 0) factors.push(i);
          return buildQ(
            `Berapa banyak <b>faktor</b> dari bilangan <b>${n}</b>?`,
            factors.length,
            [factors.length + 1, factors.length - 1, factors.length + 2],
            `Faktor ${n}: ${factors.join(', ')}. Total ${factors.length} faktor.`
          );
        }
      },
      2: {
        title: 'KPK',
        gen: () => {
          const a = rnd(2, 8), b = rnd(2, 8);
          if (a === b) return Topics.kpkfpb.levels[2].gen();
          const correct = lcm(a, b);
          return buildQ(
            `KPK dari <b>${a}</b> dan <b>${b}</b> adalah...`,
            correct,
            [a * b, a + b, Math.min(a, b) * 3],
            `KPK(${a}, ${b}) = ${correct}.`
          );
        }
      },
      3: {
        title: 'FPB',
        gen: () => {
          const a = rnd(6, 24), b = rnd(6, 24);
          if (a === b) return Topics.kpkfpb.levels[3].gen();
          const correct = gcd(a, b);
          return buildQ(
            `FPB dari <b>${a}</b> dan <b>${b}</b> adalah...`,
            correct,
            [a, b, a + b],
            `FPB(${a}, ${b}) = ${correct}.`
          );
        }
      },
      4: {
        title: 'Soal Cerita',
        gen: () => {
          const names = [['Andi','Budi'],['Sinta','Dewi'],['Rian','Tono'],['Lina','Maya']];
          const [n1, n2] = pick(names);
          const a = rnd(2, 6), b = rnd(2, 6);
          if (a === b) return Topics.kpkfpb.levels[4].gen();
          const correct = lcm(a, b);
          return buildQ(
            `${n1} berenang setiap <b>${a} hari</b> sekali.<br>${n2} berenang setiap <b>${b} hari</b> sekali.<br>Setiap berapa hari mereka berenang bersama?`,
            correct,
            [a + b, a * b, Math.max(a, b) * 2],
            `Kita cari KPK(${a}, ${b}) = ${correct}. Jadi mereka berenang bersama setiap ${correct} hari.`
          );
        }
      }
    }
  },

  pengukuran: {
    name: '📏 Pengukuran',
    desc: 'Panjang, berat, waktu',
    color: '#f39c12',
    levels: {
      1: {
        title: 'Satuan Panjang',
        gen: () => {
          const m = rnd(2, 9);
          return buildQ(
            `<b>${m}</b> meter = ... centimeter`,
            m * 100,
            [m * 10, m * 1000, m + 100],
            `1 meter = 100 cm, jadi ${m} × 100 = ${fmt(m * 100)} cm.`
          );
        }
      },
      2: {
        title: 'Satuan Berat',
        gen: () => {
          const kg = rnd(2, 9);
          return buildQ(
            `<b>${kg}</b> kilogram = ... gram`,
            kg * 1000,
            [kg * 100, kg * 10, kg + 1000],
            `1 kg = 1000 gram, jadi ${kg} × 1000 = ${fmt(kg * 1000)} gram.`
          );
        }
      },
      3: {
        title: 'Satuan Waktu',
        gen: () => {
          const jam = rnd(2, 5);
          const menit = rnd(1, 59);
          const correct = jam * 60 + menit;
          return buildQ(
            `<b>${jam} jam ${menit} menit</b> = ... menit`,
            correct,
            [jam * 100 + menit, jam * 60, jam + menit],
            `${jam} jam = ${jam * 60} menit. ${jam * 60} + ${menit} = ${correct} menit.`
          );
        }
      },
      4: {
        title: 'Campuran Satuan',
        gen: () => {
          const km = rnd(1, 5);
          const m = rnd(1, 9) * 100;
          const correct = km * 1000 + m;
          return buildQ(
            `<b>${km} km ${m} m</b> = ... meter`,
            correct,
            [km * 100 + m, km + m, km * 1000 + m * 10],
            `${km} km = ${km * 1000} m. ${km * 1000} + ${m} = ${fmt(correct)} m.`
          );
        }
      }
    }
  },

  bangun: {
    name: '⬛ Bangun Datar',
    desc: 'Keliling & luas',
    color: '#e74c3c',
    levels: {
      1: {
        title: 'Luas Persegi',
        gen: () => {
          const s = rnd(3, 12);
          return buildQ(
            `Luas persegi dengan sisi <b>${s} cm</b> adalah...`,
            s * s,
            [s * 4, s * 2, s + s],
            `Luas persegi = sisi × sisi = ${s} × ${s} = ${s * s} cm².`
          );
        }
      },
      2: {
        title: 'Luas Persegi Panjang',
        gen: () => {
          const p = rnd(4, 15), l = rnd(2, 12);
          if (p === l) return Topics.bangun.levels[2].gen();
          return buildQ(
            `Luas persegi panjang dengan panjang <b>${p} cm</b> dan lebar <b>${l} cm</b> adalah...`,
            p * l,
            [2 * (p + l), p + l, p * l + p],
            `Luas = panjang × lebar = ${p} × ${l} = ${p * l} cm².`
          );
        }
      },
      3: {
        title: 'Keliling Persegi Panjang',
        gen: () => {
          const p = rnd(4, 15), l = rnd(2, 12);
          if (p === l) return Topics.bangun.levels[3].gen();
          return buildQ(
            `Keliling persegi panjang dengan panjang <b>${p} cm</b> dan lebar <b>${l} cm</b> adalah...`,
            2 * (p + l),
            [p * l, p + l, 4 * p],
            `Keliling = 2 × (panjang + lebar) = 2 × (${p} + ${l}) = 2 × ${p + l} = ${2 * (p + l)} cm.`
          );
        }
      },
      4: {
        title: 'Luas Segitiga',
        gen: () => {
          const a = rnd(2, 8) * 2;
          const t = rnd(3, 10);
          return buildQ(
            `Luas segitiga dengan alas <b>${a} cm</b> dan tinggi <b>${t} cm</b> adalah...`,
            (a * t) / 2,
            [a * t, a + t, (a + t) * 2],
            `Luas segitiga = ½ × alas × tinggi = ½ × ${a} × ${t} = ${(a * t) / 2} cm².`
          );
        }
      }
    }
  }
};

/* =========================================================
   STATE & STORAGE
   ========================================================= */
const STORAGE_KEY = 'math4-sd-progress';
const defaultState = { name: '', stars: {}, correct: 0, bestStreak: 0 };

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...defaultState };
}

let state = loadState();
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================================================
   AUDIO & CONFETTI
   ========================================================= */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function beep(freq, dur = 0.15, type = 'sine', vol = 0.2) {
  try {
    ensureAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

const SFX = {
  tap: () => beep(600, 0.05, 'triangle', 0.12),
  correct: () => {
    beep(523, 0.1, 'sine', 0.22);
    setTimeout(() => beep(659, 0.1, 'sine', 0.22), 100);
    setTimeout(() => beep(784, 0.2, 'sine', 0.22), 200);
  },
  wrong: () => beep(180, 0.3, 'sawtooth', 0.16),
  win: () => [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => beep(f, 0.15, 'sine', 0.22), i * 120))
};

function confetti() {
  const c = document.getElementById('confetti');
  if (!c) return;
  const colors = ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a06cd5', '#2ecc71', '#3498db'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.animationDuration = (1.5 + Math.random()) + 's';
    c.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

/* =========================================================
   RENDER: HOME
   ========================================================= */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(name);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

function updateStats() {
  document.getElementById('totalStars').textContent =
    Object.values(state.stars).reduce((a, b) => a + b, 0);
  document.getElementById('totalCorrect').textContent = state.correct;
  document.getElementById('bestStreak').textContent = state.bestStreak;
}

function renderGreeting() {
  const g = document.getElementById('greeting');
  if (state.name) {
    g.textContent = `Hai, ${state.name}! Siap belajar hari ini? 🎯`;
    return;
  }
  g.innerHTML = `
    Hai! Siapa namamu?
    <input id="nameInput" type="text" maxlength="20" placeholder="Ketik namamu..." />
    <button id="saveNameBtn">Simpan</button>
  `;
  const save = () => {
    const v = document.getElementById('nameInput').value.trim();
    if (v) {
      state.name = v;
      saveState();
      SFX.tap();
      renderGreeting();
    }
  };
  document.getElementById('saveNameBtn').addEventListener('click', save);
  document.getElementById('nameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') save();
  });
}

function renderTopics() {
  const grid = document.getElementById('topicGrid');
  grid.innerHTML = '';
  Object.entries(Topics).forEach(([key, topic]) => {
    const starsEarned = Object.entries(state.stars)
      .filter(([k]) => k.startsWith(key + '-'))
      .reduce((a, [, v]) => a + v, 0);
    const maxStars = Object.keys(topic.levels).length * 3;
    const btn = document.createElement('button');
    btn.className = 'topic-card';
    btn.style.setProperty('--topic-color', topic.color);
    btn.innerHTML = `
      <div class="topic-name">${topic.name}</div>
      <div class="topic-desc">${topic.desc}</div>
      <div class="topic-stars">⭐ ${starsEarned} / ${maxStars}</div>
    `;
    btn.addEventListener('click', () => { SFX.tap(); openLevels(key); });
    grid.appendChild(btn);
  });
}

/* =========================================================
   RENDER: LEVEL SELECT
   ========================================================= */
let currentTopic = null;

function openLevels(key) {
  currentTopic = key;
  const topic = Topics[key];
  document.getElementById('levelTitle').textContent = topic.name;
  const grid = document.getElementById('levelGrid');
  grid.innerHTML = '';
  Object.entries(topic.levels).forEach(([lvl, data]) => {
    const stars = state.stars[`${key}-${lvl}`] || 0;
    const btn = document.createElement('button');
    btn.className = 'level-card';
    btn.style.setProperty('--topic-color', topic.color);
    btn.innerHTML = `
      <div class="level-num">LEVEL ${lvl}</div>
      <div class="level-title">${data.title}</div>
      <div class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    `;
    btn.addEventListener('click', () => { SFX.tap(); startQuiz(key, lvl); });
    grid.appendChild(btn);
  });
  showScreen('levels');
}

/* =========================================================
   QUIZ LOGIC
   ========================================================= */
const quizState = {
  topic: null, level: null, questions: [],
  current: 0, correct: 0, streak: 0, answered: false
};

function startQuiz(topicKey, level) {
  const topic = Topics[topicKey];
  const questions = Array.from({ length: 10 }, () => topic.levels[level].gen());
  Object.assign(quizState, {
    topic: topicKey, level,
    questions, current: 0, correct: 0, streak: 0, answered: false
  });
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = quizState.questions[quizState.current];
  if (!q) return endQuiz();

  document.getElementById('quizProgress').textContent =
    `Soal ${quizState.current + 1} / ${quizState.questions.length}`;
  document.getElementById('streakDisplay').textContent = `🔥 ${quizState.streak}`;
  document.getElementById('question').innerHTML = q.question;

  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt, q));
    opts.appendChild(btn);
  });

  const fb = document.getElementById('feedback');
  fb.innerHTML = '';
  fb.className = 'feedback';
  document.getElementById('nextBtn').classList.add('hidden');
  quizState.answered = false;
}

function handleAnswer(btn, chosen, q) {
  if (quizState.answered) return;
  quizState.answered = true;

  const opts = document.querySelectorAll('#quizOptions .quiz-option');
  opts.forEach(b => b.classList.add('disabled'));
  const isCorrect = chosen === q.correct;

  if (isCorrect) {
    btn.classList.add('correct');
    SFX.correct();
    quizState.correct++;
    quizState.streak++;
    state.correct++;
    if (quizState.streak > state.bestStreak) state.bestStreak = quizState.streak;
    saveState();
    if (quizState.streak % 3 === 0) confetti();
  } else {
    btn.classList.add('wrong');
    SFX.wrong();
    quizState.streak = 0;
    opts.forEach(b => { if (b.textContent === q.correct) b.classList.add('correct'); });
  }

  document.getElementById('streakDisplay').textContent = `🔥 ${quizState.streak}`;

  const fb = document.getElementById('feedback');
  fb.className = `feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
  fb.innerHTML = isCorrect
    ? `✅ <b>Benar!</b> ${q.explanation}`
    : `❌ <b>Belum tepat.</b> Jawaban: <b>${q.correct}</b><span class="explanation">${q.explanation}</span>`;

  document.getElementById('nextBtn').classList.remove('hidden');
}

document.getElementById('nextBtn').addEventListener('click', () => {
  SFX.tap();
  quizState.current++;
  if (quizState.current >= quizState.questions.length) endQuiz();
  else renderQuestion();
});

function endQuiz() {
  const total = quizState.questions.length;
  const correct = quizState.correct;

  let stars = 0;
  if (correct >= 9) stars = 3;
  else if (correct >= 7) stars = 2;
  else if (correct >= 4) stars = 1;

  const key = `${quizState.topic}-${quizState.level}`;
  if (stars > (state.stars[key] || 0)) state.stars[key] = stars;
  saveState();

  document.getElementById('resultStars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  document.getElementById('resultScore').textContent = `${correct} / ${total}`;

  let msg = '';
  if (correct === total) msg = 'Sempurna! Kamu hebat! 🌟';
  else if (correct >= 7) msg = 'Bagus sekali! Terus berlatih ya! 👍';
  else if (correct >= 4) msg = 'Lumayan! Coba lagi untuk hasil lebih baik 💪';
  else msg = 'Jangan menyerah, ayo coba lagi! 📚';

  document.getElementById('resultMessage').textContent = msg;
  document.getElementById('resultTitle').textContent =
    stars === 3 ? '🏆 Hebat Sekali!' : '🎉 Selesai!';

  SFX.win();
  if (stars >= 2) confetti();
  showScreen('result');
}

/* =========================================================
   NAVIGASI
   ========================================================= */
document.getElementById('retryBtn').addEventListener('click', () => {
  SFX.tap();
  startQuiz(quizState.topic, quizState.level);
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    SFX.tap();
    const target = btn.dataset.back;
    if (target === 'home') { renderTopics(); updateStats(); }
    if (target === 'levels' && currentTopic) { openLevels(currentTopic); return; }
    showScreen(target);
  });
});

/* =========================================================
   INIT
   ========================================================= */
renderGreeting();
updateStats();
renderTopics();
