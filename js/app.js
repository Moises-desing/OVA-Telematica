/* =====================================================================
   js/app.js
   Infraestructura común a todas las páginas: sonido, confeti, ayudas emergentes, puntos y niveles, progreso guardado,
   tema, barra de navegación y componentes reutilizables (guía por lecciones, tarjetas de conceptos y cuestionarios).
   ===================================================================== */

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('es-CO');
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 30) : ms));
function pop(el){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- sonido (Web Audio, sin archivos) ---------- */
const snd = {ctx: null, on: false};
try { snd.on = localStorage.getItem('ova_snd') === '1'; } catch(e) {}
function actx(){
  if (!snd.on) return null;
  try {
    if (!snd.ctx){ const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; snd.ctx = new C(); }
    if (snd.ctx.state === 'suspended') snd.ctx.resume();
    return snd.ctx;
  } catch(e) { return null; }
}
function tone(f, d, type, vol, delay){
  const c = actx(); if (!c) return;
  const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .06, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .03);
}
const sfx = {
  tick: () => tone(900, .03, 'square', .025),
  hop: () => tone(620, .05, 'triangle', .05),
  ok: () => { tone(523, .09, 'sine', .08); tone(784, .16, 'sine', .08, .09); },
  bad: () => tone(170, .22, 'sawtooth', .045),
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .15, 'triangle', .08, i * .09))
};
function sndUI(){ $('sndBtn').setAttribute('aria-pressed', snd.on ? 'true' : 'false'); }
$('sndBtn').onclick = () => { snd.on = !snd.on; try { localStorage.setItem('ova_snd', snd.on ? '1' : '0'); } catch(e) {} sndUI(); if (snd.on) sfx.ok(); };
sndUI();

/* ---------- confeti ---------- */
const fx = $('fx'), fctx = fx.getContext('2d');
let parts = [], raf = 0;
function sizeFx(){ const d = Math.min(window.devicePixelRatio || 1, 2); fx.width = innerWidth * d; fx.height = innerHeight * d; fctx.setTransform(d, 0, 0, d, 0, 0); }
addEventListener('resize', sizeFx); sizeFx();
function confetti(n, o){
  if (reduceMotion) return;
  const cols = ['#2c5f8a', '#2a7a78', '#5f7d3a', '#c0933f', '#a8472f', '#6b4a7a'];
  const ox = o ? o.x : innerWidth / 2, oy = o ? o.y : innerHeight * .32, big = n > 60;
  for (let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, s = (big ? 5 : 3) + Math.random() * (big ? 9 : 5);
    parts.push({x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (big ? 4 : 2), r: 3 + Math.random() * 4, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .35, life: 80 + Math.random() * 60, sq: Math.random() < .55});
  }
  if (!raf) raf = requestAnimationFrame(stepFx);
}
function stepFx(){
  fctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 30);
  parts.forEach(p => {
    p.vy += .22; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.globalAlpha = Math.min(1, p.life / 30); fctx.fillStyle = p.c;
    if (p.sq) fctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { fctx.beginPath(); fctx.arc(0, 0, p.r / 1.5, 0, 7); fctx.fill(); }
    fctx.restore();
  });
  raf = parts.length ? requestAnimationFrame(stepFx) : 0;
  if (!parts.length) fctx.clearRect(0, 0, innerWidth, innerHeight);
}

/* ---------- ayudas emergentes ---------- */
const tip = $('tip');
let tipTimer;
function showTip(el, x, y){ tip.textContent = el.dataset.tip; tip.classList.add('show'); moveTip(x, y); }
function moveTip(x, y){
  const r = tip.getBoundingClientRect();
  let l = x + 12, t = y - r.height - 12;
  if (l + r.width > innerWidth - 8) l = innerWidth - r.width - 8;
  if (l < 8) l = 8; if (t < 8) t = y + 20;
  tip.style.left = l + 'px'; tip.style.top = t + 'px';
}
const tipEl = e => e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
document.addEventListener('pointerover', e => { const el = tipEl(e); if (el) showTip(el, e.clientX, e.clientY); });
document.addEventListener('pointermove', e => { if (tip.classList.contains('show')) moveTip(e.clientX, e.clientY); });
document.addEventListener('pointerout', e => { if (tipEl(e)) tip.classList.remove('show'); });
document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch'){ const el = tipEl(e); if (el){ showTip(el, e.clientX, e.clientY); clearTimeout(tipTimer); tipTimer = setTimeout(() => tip.classList.remove('show'), 2200); } } });
document.addEventListener('focusin', e => { const el = tipEl(e); if (el){ const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } });
document.addEventListener('focusout', () => tip.classList.remove('show'));

/* ---------- unidades (cada archivo de js/unidades/ agrega la suya) ---------- */
const UNITS = [];

/* ---------- puntos y niveles ---------- */
const PLAN = {r1:10, r2:10, r3:10, r4:10, g1:10, g2:10, g3:10, examen:40};
['u1','u2','u3','u4','u5','u6'].forEach(u => { PLAN[u + '_guia'] = 5; PLAN[u + '_sim'] = 5; PLAN[u + '_quiz'] = 10; });
const TOTAL = Object.values(PLAN).reduce((a, b) => a + b, 0);
const LEVELS = [[0, 'Novato'], [30, 'Explorador'], [80, 'Técnico'], [140, 'Ingeniero'], [200, 'Maestro de redes']];
/* actividades que cuentan para el progreso de cada página */
const TABMOD = {examen:['examen'], retos:['r1','r2','r3','r4'], juegos:['g1','g2','g3']};
['u1','u2','u3','u4','u5','u6'].forEach(u => TABMOD[u] = [u + '_guia', u + '_sim', u + '_quiz']);
/* El progreso se guarda en el navegador (localStorage). Si el navegador lo bloquea, se usa window.name,
   que se conserva al pasar de una página a otra de la misma pestaña. */
const state = {done:{}, name:''};
(function loadState(){
  let raw = null;
  try { raw = localStorage.getItem('ova_capa_internet'); } catch(e) {}
  if (!raw){ try { const m = /^OVA:(\{.*\})$/.exec(window.name || ''); if (m) raw = m[1]; } catch(e) {} }
  try { const s = JSON.parse(raw || 'null'); if (s && typeof s === 'object'){ state.done = s.done || {}; state.name = s.name || ''; } } catch(e) {}
})();
function save(){
  const s = JSON.stringify(state);
  try { localStorage.setItem('ova_capa_internet', s); } catch(e) {}
  try { window.name = 'OVA:' + s; } catch(e) {}
}
function xp(){ return Object.keys(state.done).reduce((a, k) => a + (PLAN[k] || 0), 0); }
function progresoUnidades(){
  /* marca con ✓ las unidades completas y llena las barras de progreso de la portada */
  document.querySelectorAll('[data-prog]').forEach(a => { const ids = TABMOD[a.dataset.prog]; if (ids) a.classList.toggle('hecho', ids.every(i => state.done[i])); });
  document.querySelectorAll('[data-bar]').forEach(el => { const ids = TABMOD[el.dataset.bar]; if (ids) el.style.width = (ids.filter(i => state.done[i]).length / ids.length * 100) + '%'; });
}
function hud(bump){
  const x = xp(), p = Math.round(x / TOTAL * 100), ring = $('xpRing');
  $('xpTxt').textContent = x + '/' + TOTAL + ' pts';
  let lv = LEVELS[0][1]; LEVELS.forEach(l => { if (x >= l[0]) lv = l[1]; });
  $('xpLvl').textContent = lv; $('xpNum').textContent = p + '%';
  ring.style.setProperty('--p', p); ring.setAttribute('aria-label', 'Progreso total ' + p + ' por ciento, nivel ' + lv);
  if (bump){ ring.classList.remove('bump'); void ring.offsetWidth; ring.classList.add('bump'); }
  progresoUnidades();
}
let toastT;
function toast(t){ const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
function award(id){
  if (state.done[id]) return false;
  state.done[id] = 1; save(); hud(true); toast('+' + PLAN[id] + ' puntos'); sfx.level();
  const big = id === 'examen', r = $('xpRing').getBoundingClientRect();
  confetti(big ? 170 : 40, big ? null : {x: r.left + r.width / 2, y: r.top + r.height / 2});
  return true;
}

/* ---------- tema claro / oscuro ---------- */
function aplicarTema(t){ document.documentElement.dataset.theme = t; }
(function(){
  let t = null; try { t = localStorage.getItem('ova_tema'); } catch(e) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  aplicarTema(t);
})();
$('themeBtn').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  aplicarTema(t); try { localStorage.setItem('ova_tema', t); } catch(e) {} sfx.tick();
};

/* ---------- barra de navegación: menú móvil y lista de unidades ---------- */
(function(){
  const tg = document.querySelector('.nav-toggle'), menu = $('menu'), drop = document.querySelector('.drop'), db = document.querySelector('.drop-btn');
  tg.addEventListener('click', () => { const o = menu.classList.toggle('open'); tg.setAttribute('aria-expanded', o); tg.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); });
  db.addEventListener('click', e => { e.stopPropagation(); const o = drop.classList.toggle('open'); db.setAttribute('aria-expanded', o); });
  document.addEventListener('click', e => { if (!drop.contains(e.target)){ drop.classList.remove('open'); db.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape'){ drop.classList.remove('open'); db.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); tg.setAttribute('aria-expanded', 'false'); } });
})();

/* ---------- componente: guía por lecciones ---------- */
function lessonsWidget(root, uid, L, awardId){
  let cur = 0; const seen = new Set([0]);
  if (state.done[awardId]) L.forEach((_, i) => seen.add(i));
  root.innerHTML = `<div class="lnav" id="${uid}Nav" role="group" aria-label="Lecciones de la guía"></div><div class="lbody" id="${uid}Body"></div><div class="lctl"><button class="btn alt sm" type="button" id="${uid}Prev">Anterior</button><span class="meter" id="${uid}Cnt" aria-live="polite"></span><button class="btn sm" type="button" id="${uid}Next">Siguiente</button></div>`;
  const nav = $(uid + 'Nav'), body = $(uid + 'Body');
  nav.innerHTML = L.map((l, i) => `<button type="button" data-i="${i}" aria-label="Lección ${i + 1}: ${esc(l.t)}">${i + 1}</button>`).join('');
  function draw(focus){
    const l = L[cur]; seen.add(cur);
    nav.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-current', i === cur ? 'true' : 'false'); b.classList.toggle('vis', seen.has(i)); });
    body.innerHTML = (l.part ? `<div class="lpart">${l.part}</div>` : '') + `<h3 tabindex="-1">${cur + 1}. ${l.t}</h3>` + l.h + (l.fig ? `<figure class="fig">${l.fig}${l.cap ? `<figcaption>${l.cap}</figcaption>` : ''}</figure>` : '');
    if (l.init) l.init(body);
    $(uid + 'Prev').disabled = cur === 0; $(uid + 'Next').disabled = cur === L.length - 1;
    $(uid + 'Cnt').textContent = 'Lección ' + (cur + 1) + ' de ' + L.length + ' · vistas ' + seen.size;
    if (focus) body.querySelector('h3').focus({preventScroll: true});
    if (seen.size === L.length) award(awardId);
  }
  nav.addEventListener('click', e => { const b = e.target.closest('button'); if (b){ cur = +b.dataset.i; draw(true); sfx.tick(); } });
  $(uid + 'Prev').onclick = () => { if (cur > 0){ cur--; draw(true); sfx.tick(); } };
  $(uid + 'Next').onclick = () => { if (cur < L.length - 1){ cur++; draw(true); sfx.tick(); } };
  draw(false);
}

/* ---------- componente: tarjetas de conceptos ---------- */
function cardsWidget(root, list){
  root.innerHTML = '<div class="cc-grid">' + list.map(c => `<button type="button" class="cc" aria-expanded="false"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('') + '</div>';
  root.querySelectorAll('.cc').forEach(b => b.onclick = () => { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); sfx.tick(); });
}

/* ---------- componente: cuestionario con retroalimentación ---------- */
let qzN = 0;
function prepQ(x){
  const keep = x.o.length === 2;
  const idx = keep ? x.o.map((_, i) => i) : shuffle(x.o.map((_, i) => i));
  return {q: x.q, e: x.e, o: idx.map(i => x.o[i]), c: idx.indexOf(x.c)};
}
function quizWidget(root, bank, need, awardId, opts){
  const id = 'qz' + (++qzN); opts = opts || {};
  let items, ans, good;
  function start(){
    items = (opts.pick ? shuffle(bank).slice(0, opts.pick) : bank).map(prepQ); ans = new Array(items.length).fill(null); good = 0;
    root.innerHTML = `<div class="qsum"><span id="${id}s">Responde las ${items.length} preguntas. Necesitas ${need} aciertos.</span></div><div class="qprog" aria-hidden="true"><i id="${id}p"></i></div>` +
      items.map((x, i) => `<div class="qq" id="${id}q${i}"><p class="qtxt"><b>${i + 1}.</b> ${x.q}</p><div class="qopts">${x.o.map((t, j) => `<button type="button" class="qo" data-q="${i}" data-o="${j}">${t}</button>`).join('')}</div><div class="fb" id="${id}f${i}" role="status" aria-live="polite"></div></div>`).join('') +
      `<div id="${id}end"></div>`;
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('.qo'); if (!b || b.disabled) return;
    const i = +b.dataset.q, j = +b.dataset.o, x = items[i], ok = j === x.c;
    ans[i] = ok; if (ok) good++;
    const box = $(id + 'q' + i);
    box.querySelectorAll('.qo').forEach((o, k) => { o.disabled = true; if (k === x.c) o.classList.add('good'); else if (k === j) o.classList.add('wrong'); else o.classList.add('dim'); });
    $(id + 'f' + i).innerHTML = ok ? `<span class="ok">Correcto.</span> ${x.e}` : `<span class="bad">Incorrecto.</span> La respuesta es «${x.o[x.c]}». ${x.e}`;
    pop($(id + 'f' + i)); if (ok) sfx.ok(); else sfx.bad();
    const n = ans.filter(a => a !== null).length;
    $(id + 'p').style.width = (n / items.length * 100) + '%';
    $(id + 's').textContent = `Respondidas ${n} de ${items.length} · aciertos ${good}`;
    if (n === items.length){
      const pass = good >= need;
      $(id + 'end').innerHTML = `<p class="${pass ? 'ok' : 'bad'}" style="margin-top:12px">${pass ? '¡Aprobado! ' : 'Aún no. '}Obtuviste ${good} de ${items.length}.${pass ? '' : ' Repasa la guía y vuelve a intentarlo.'}</p><button type="button" class="btn alt sm" id="${id}re">Nuevo intento</button>`;
      $(id + 're').onclick = () => { start(); sfx.tick(); };
      if (pass && awardId) award(awardId);
    }
  });
  start();
  return {restart: start};
}

/* ---------- construcción de la página de una unidad ---------- */
function buildUnit(U){
  const s = $('unidad'), prev = U.n === 1 ? ['index.html', 'Inicio'] : ['unidad' + (U.n - 1) + '.html', 'Unidad ' + (U.n - 1)],
        next = U.n === 6 ? ['retos.html', 'Retos'] : ['unidad' + (U.n + 1) + '.html', 'Unidad ' + (U.n + 1)];
  s.innerHTML = `<div class="story"><b>Qué vas a lograr.</b> ${U.obj}</div>
  <div class="card"><span class="tag">Guía de aprendizaje</span><h3 style="margin-top:0">Estudia paso a paso</h3><div id="${U.id}Les"></div></div>
  ${U.widgets}
  <div class="card"><span class="tag">Tarjetas de conceptos</span><h3 style="margin-top:0">Repasa con tarjetas</h3><p class="hint">Toca una tarjeta para ver la definición.</p><div id="${U.id}Cards"></div></div>
  <div class="card qz"><span class="tag">Cuestionario</span><h3 style="margin-top:0">Pon a prueba la unidad</h3><div id="${U.id}Quiz"></div></div>
  <div class="pager"><a class="btn alt" href="${prev[0]}">Anterior: ${prev[1]}</a><a class="btn" href="${next[0]}">Siguiente: ${next[1]}</a></div>`;
  lessonsWidget($(U.id + 'Les'), U.id + 'L', U.lessons, U.id + '_guia');
  cardsWidget($(U.id + 'Cards'), U.cards);
  quizWidget($(U.id + 'Quiz'), U.quiz, U.need, U.id + '_quiz');
  U.init(s);
}

/* ---------- utilidades de figuras SVG ---------- */
const svgOpen = (w, h, label) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">`;
const nodeBox = (x, y, w, h, t, cls) => `<g><rect class="${cls || 'box'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle">${t}</text></g>`;
