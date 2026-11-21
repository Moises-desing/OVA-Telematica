/* =====================================================================
   js/juegos.js
   Juegos 1 a 3. Responsables: Juan Felipe Reino Benitez (1), Carlos Eduardo Garavito Mozo (2) y Moisés Montiel (3).
   ===================================================================== */

function pairsPool() { const a = []; UNITS.forEach(u => u.cards.forEach(c => a.push(c))); return a; }
function buildG1(root) {
  let sel = null, errs = 0, done = 0, data;
  function start() {
    data = shuffle(pairsPool()).slice(0, 8); sel = null; errs = 0; done = 0;
    const defs = shuffle(data.map((d, i) => [i, d[1]]));
    root.innerHTML = `<p class="hint" id="g1S">Toca un concepto y luego su definición. Errores: 0 · parejas: 0 de 8</p><div class="pairs"><div class="col" id="g1T">${data.map((d, i) => `<button type="button" class="pb" data-i="${i}">${d[0]}</button>`).join('')}</div><div class="col" id="g1D">${defs.map(d => `<button type="button" class="pb" data-i="${d[0]}">${d[1]}</button>`).join('')}</div></div><div class="fb" id="g1F" role="status" aria-live="polite"></div>`;
    root.querySelectorAll('.pb').forEach(b => b.onclick = () => {
      if (b.classList.contains('done')) return;
      const isT = b.parentElement.id === 'g1T';
      if (isT) { root.querySelectorAll('#g1T .pb').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; sfx.tick(); return; }
      if (!sel) { $('g1F').textContent = 'Primero toca un concepto de la izquierda.'; return; }
      if (sel.dataset.i === b.dataset.i) { sel.classList.remove('sel'); sel.classList.add('done'); b.classList.add('done'); sel = null; done++; sfx.ok(); }
      else { errs++; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); sfx.bad(); }
      $('g1S').textContent = `Errores: ${errs} · parejas: ${done} de 8`;
      if (done === 8) { const win = errs <= 6; $('g1F').innerHTML = `<p class="${win ? 'ok' : 'bad'}">${win ? '¡Juego superado!' : 'Completaste el juego, pero con muchos errores.'} Terminaste con ${errs} errores${win ? '' : ' (máximo 6 para ganar los puntos)'}.</p><button class="btn alt sm" id="g1Re" type="button">Jugar de nuevo</button>`; $('g1Re').onclick = start; if (win) award('g1'); }
    });
  }
  start();
}
function buildG2(root) {
  let order;
  function start() { order = shuffle(ROUTER_STAGES.map((_, i) => i)); if (order.every((v, i) => v === i)) order.reverse(); draw(); }
  function draw(res) {
    root.innerHTML = `<p class="hint">Usa las flechas para poner las etapas en el orden en que ocurren dentro del router.</p><ol class="sorter" id="g2L">${order.map((v, p) => `<li class="${res ? (v === p ? 'good' : 'wrong') : ''}"><span>${ROUTER_STAGES[v][0]}</span><div class="mv"><button type="button" data-p="${p}" data-d="-1" aria-label="Subir etapa ${p + 1}" ${p === 0 ? 'disabled' : ''}>↑</button><button type="button" data-p="${p}" data-d="1" aria-label="Bajar etapa ${p + 1}" ${p === order.length - 1 ? 'disabled' : ''}>↓</button></div></li>`).join('')}</ol><button class="btn" type="button" id="g2Go">Comprobar orden</button> <button class="btn alt sm" type="button" id="g2Re">Reordenar al azar</button><div class="fb" id="g2F" role="status" aria-live="polite"></div>`;
    $('g2L').onclick = e => { const b = e.target.closest('button'); if (!b) return; const p = +b.dataset.p, d = +b.dataset.d;[order[p], order[p + d]] = [order[p + d], order[p]]; draw(); sfx.tick(); const nb = $('g2L').querySelector(`button[data-p="${p + d}"][data-d="${d}"]`); if (nb && !nb.disabled) nb.focus(); };
    $('g2Re').onclick = () => { start(); sfx.tick(); };
    $('g2Go').onclick = () => {
      const n = order.filter((v, p) => v === p).length; draw(true); $('g2F').innerHTML = n === order.length ? '<p class="ok">¡Orden correcto! Así procesa un router cada paquete.</p>' : `<p class="bad">${n} de ${order.length} etapas están en su lugar. Pista: primero se recibe y se valida, luego se busca la ruta, después se conmuta y por último se transmite.</p>`;
      if (n === order.length) { sfx.ok(); award('g2'); } else sfx.bad();
    };
  }
  start();
}
function buildG3(root) {
  let t, score, cur, timer, locked, pool;
  function allQ() { const a = []; UNITS.forEach(u => u.quiz.forEach(x => a.push(x))); BANK_FINAL.forEach(x => a.push(x)); return a; }
  function start() { pool = shuffle(allQ()); score = 0; t = 60; locked = false; root.innerHTML = '<div class="game"><p>Responde todas las preguntas que puedas en <b>60 segundos</b>. Necesitas <b>8 aciertos</b>.</p><button class="btn m5" type="button" id="g3Go">Comenzar</button></div>'; $('g3Go').onclick = run; }
  function run() {
    root.innerHTML = '<div class="statrow" style="justify-content:center"><div class="stat"><small>Tiempo</small><b class="timer" id="g3T">60</b></div><div class="stat"><small>Aciertos</small><b id="g3S">0</b></div></div><div id="g3Q"></div>';
    cur = 0; next(); clearInterval(timer);
    timer = setInterval(() => { t--; const el = $('g3T'); if (!el) { clearInterval(timer); return; } el.textContent = t; el.classList.toggle('low', t <= 10); if (t <= 0) { clearInterval(timer); end(); } }, 1000);
  }
  function next() {
    if (cur >= pool.length) cur = 0; const x = prepQ(pool[cur++]); locked = false;
    $('g3Q').innerHTML = `<div class="qq"><p class="qtxt">${x.q.replace(/<div class="cli"[\s\S]*?<\/div>/g, '')}</p><div class="qopts">${x.o.map((o, j) => `<button type="button" class="qo" data-j="${j}">${o}</button>`).join('')}</div></div>`;
    $('g3Q').querySelectorAll('.qo').forEach(b => b.onclick = () => {
      if (locked || t <= 0) return; locked = true; const ok = +b.dataset.j === x.c;
      if (ok) { score++; $('g3S').textContent = score; sfx.ok(); b.classList.add('good'); } else { b.classList.add('wrong'); $('g3Q').querySelectorAll('.qo')[x.c].classList.add('good'); sfx.bad(); }
      setTimeout(() => { if (t > 0) next(); }, ok ? 350 : 900);
    });
  }
  function end() {
    const win = score >= 8;
    root.innerHTML = `<div class="game"><h3>Tiempo terminado: ${score} aciertos</h3><p class="${win ? 'ok' : 'bad'}">${win ? '¡Juego superado!' : 'Necesitas 8 aciertos para ganar los puntos. ¡Inténtalo otra vez!'}</p><button class="btn m5" type="button" id="g3Re">Jugar de nuevo</button></div>`;
    $('g3Re').onclick = () => { start(); sfx.tick(); }; if (win) award('g3');
  }
  start();
}

/* ---------- arranque de la página ---------- */
buildG1($('g1Box')); buildG2($('g2Box')); buildG3($('g3Box'));
hud(false);
