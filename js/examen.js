/* =====================================================================
   js/examen.js
   Evaluación final: 18 preguntas (3 por unidad) tomadas al azar de banco_examen.js,
   puntaje, detalle por unidad y constancia de autoevaluación (imagen PNG o impresión).
   ===================================================================== */

let exam = [], lastCert = null;
function examNew(){
  exam = [];
  [1, 2, 3, 4, 5, 6].forEach(u => shuffle(BANK_FINAL.filter(x => x.u === u)).slice(0, 3).forEach(x => exam.push(Object.assign({}, prepQ(x), {u}))));
  exam = shuffle(exam);
  $('qForm').innerHTML = exam.map((x, i) => `<fieldset><legend>${i + 1}. ${x.q}</legend>${x.o.map((t, j) => `<label for="qq${i}_${j}"><input type="radio" name="qq${i}" id="qq${i}_${j}" value="${j}"> ${t}</label>`).join('')}<div class="fb" id="qf${i}" role="status" aria-live="polite"></div></fieldset>`).join('');
  $('qScore').textContent = ''; $('qDet').innerHTML = ''; $('qCert').innerHTML = ''; lastCert = null;
}
const SEAL = '<svg class="seal" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fd8cc"/><stop offset=".5" stop-color="#2fc6b8"/><stop offset="1" stop-color="#148c82"/></linearGradient></defs><path d="M26 58l-8 18 14-6 8 8 4-14zM54 58l8 18-14-6-8 8-4-14z" fill="#0e0e10"/><circle cx="40" cy="34" r="28" fill="url(#gd)"/><circle cx="40" cy="34" r="22" fill="none" stroke="#eee5cf" stroke-width="2"/><path d="M40 20l4.4 9 9.9 1.4-7.2 7 1.7 9.8L40 42.5l-8.8 4.7 1.7-9.8-7.2-7 9.9-1.4z" fill="#eee5cf"/></svg>';
function rr(x, X, Y, w, h, r){ x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function wrapLines(x, text, maxW){ const words = text.split(' '), lines = []; let cur = ''; words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
async function downloadCert(){
  if (!lastCert) return;
  try {
    const Wd = 1600, Ht = 1130, c = document.createElement('canvas'); c.width = Wd; c.height = Ht;
    const x = c.getContext('2d'), F = '"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif', FD = '"Bahnschrift SemiCondensed",Bahnschrift,' + F;
    const bg = x.createLinearGradient(0, 0, Wd, Ht); bg.addColorStop(0, '#f1e9d5'); bg.addColorStop(.55, '#eee5cf'); bg.addColorStop(1, '#e8dec5'); x.fillStyle = bg; x.fillRect(0, 0, Wd, Ht);
    const gold = '#0e0e10';
    x.strokeStyle = gold; x.lineWidth = 10; rr(x, 40, 40, Wd - 80, Ht - 80, 40); x.stroke(); x.strokeStyle = '#2fc6b8'; x.lineWidth = 4; rr(x, 66, 66, Wd - 132, Ht - 132, 28); x.stroke();
    const sg = x.createLinearGradient(Wd / 2 - 80, 150, Wd / 2 + 80, 330); sg.addColorStop(0, '#5fd8cc'); sg.addColorStop(.5, '#2fc6b8'); sg.addColorStop(1, '#148c82');
    x.fillStyle = '#0e0e10'; x.beginPath(); x.moveTo(Wd / 2 - 52, 290); x.lineTo(Wd / 2 - 90, 370); x.lineTo(Wd / 2 - 48, 350); x.lineTo(Wd / 2 - 20, 380); x.lineTo(Wd / 2 - 8, 300); x.fill();
    x.beginPath(); x.moveTo(Wd / 2 + 52, 290); x.lineTo(Wd / 2 + 90, 370); x.lineTo(Wd / 2 + 48, 350); x.lineTo(Wd / 2 + 20, 380); x.lineTo(Wd / 2 + 8, 300); x.fill();
    x.fillStyle = sg; x.beginPath(); x.arc(Wd / 2, 230, 92, 0, 7); x.fill();
    x.strokeStyle = '#eee5cf'; x.lineWidth = 5; x.beginPath(); x.arc(Wd / 2, 230, 72, 0, 7); x.stroke();
    x.fillStyle = '#eee5cf'; x.beginPath(); for (let i = 0; i < 10; i++){ const r = i % 2 ? 24 : 54, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Wd / 2 + Math.cos(a) * r, 230 + Math.sin(a) * r); } x.closePath(); x.fill();
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#148c82'; x.font = '600 32px ' + FD; try { x.letterSpacing = '9px'; } catch(e) {} x.fillText('CONSTANCIA DE AUTOEVALUACIÓN', Wd / 2, 470); try { x.letterSpacing = '0px'; } catch(e) {}
    let fs = 116; x.font = '600 ' + fs + 'px ' + FD; while (x.measureText(lastCert.nm).width > 1220 && fs > 40){ fs -= 4; x.font = '600 ' + fs + 'px ' + FD; }
    const ng = x.createLinearGradient(Wd / 2 - 500, 0, Wd / 2 + 500, 0); ng.addColorStop(0, '#0e0e10'); ng.addColorStop(1, '#1d1e22'); x.fillStyle = ng; x.fillText(lastCert.nm, Wd / 2, 620);
    x.fillStyle = '#2b2b2e'; x.font = '500 40px ' + F; wrapLines(x, lastCert.line, 1140).forEach((l, i) => x.fillText(l, Wd / 2, 720 + i * 58));
    x.fillStyle = '#5a574f'; x.font = '500 26px ' + F; wrapLines(x, lastCert.note, 1200).forEach((l, i) => x.fillText(l, Wd / 2, 930 + i * 38));
    c.toBlob(b => {
      if (!b){ toast('No se pudo generar la imagen.'); return; }
      const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'constancia-ova-capa-internet.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000);
      toast('Imagen generada. Si no ves la descarga, usa «Imprimir» o una captura de pantalla.');
    }, 'image/png');
  } catch(e) { toast('Tu navegador bloqueó la descarga. Usa «Imprimir» o una captura de pantalla.'); }
}

/* ---------- arranque de la página ---------- */
$('nameIn').value = state.name;
$('nameIn').addEventListener('input', () => { state.name = $('nameIn').value; save(); });
$('qNew').onclick = () => { examNew();
hud(false); sfx.tick(); };
$('qSend').onclick = () => {
  let ok = 0, blank = 0; const topics = {};
  exam.forEach((x, i) => {
    const s = document.querySelector(`input[name="qq${i}"]:checked`), fb = $('qf' + i), k = UTITLES[x.u];
    topics[k] = topics[k] || [0, 0]; topics[k][1]++;
    if (!s){ blank++; fb.innerHTML = '<span class="bad">Sin responder.</span> ' + x.e; return; }
    if (+s.value === x.c){ ok++; topics[k][0]++; fb.innerHTML = '<span class="ok">Correcto.</span> ' + x.e; }
    else fb.innerHTML = `<span class="bad">Incorrecto.</span> Era «${x.o[x.c]}». ${x.e}`;
  });
  const pct = Math.round(ok / exam.length * 100);
  $('qScore').textContent = `Resultado: ${ok} de ${exam.length} (${pct} %)` + (blank ? `, ${blank} sin responder.` : '.');
  $('qDet').innerHTML = '<div class="tblwrap"><table class="tbl"><thead><tr><th>Unidad</th><th>Aciertos</th></tr></thead><tbody>' + Object.keys(topics).map(k => `<tr><td>${k}</td><td class="m">${topics[k][0]} de ${topics[k][1]}</td></tr>`).join('') + '</tbody></table></div>';
  if (pct >= 70){
    sfx.ok(); award('examen'); confetti(70, {x: innerWidth / 2, y: innerHeight * .55});
    const nm = (state.name || $('nameIn').value || '').trim() || 'Estudiante';
    const d = new Date().toLocaleDateString('es-CO', {year: 'numeric', month: 'long', day: 'numeric'});
    const line = `completó la evaluación final del OVA «Capa de Internet del modelo TCP/IP» con ${ok} de ${exam.length} respuestas correctas (${pct} %) el ${d}.`;
    const note = 'Documento de práctica generado por el propio OVA; no es un certificado oficial. OVA de Juan Felipe Reino Benitez, Carlos Eduardo Garavito Mozo, Junior Madera y Moisés Montiel.';
    lastCert = {nm, line, note};
    $('qCert').innerHTML = `<div class="cert" id="certCard">${SEAL}<div class="cert-kicker">CONSTANCIA DE AUTOEVALUACIÓN</div><div class="cert-name">${esc(nm)}</div><p class="cert-text">${line}</p><p class="cert-note">${note}</p></div><div class="certbtns"><button class="btn pink" id="certPng" type="button">Descargar imagen</button><button class="btn alt" id="certPrint" type="button">Imprimir</button></div>`;
    $('certPng').onclick = downloadCert;
    $('certPrint').onclick = () => { try { window.print(); } catch(e) { toast('Tu navegador bloqueó la impresión. Usa «Descargar imagen» o una captura.'); } };
  } else { sfx.bad(); $('qCert').innerHTML = '<p>Necesitas 70 % para la constancia. Repasa las unidades con menos aciertos y pulsa «Nuevo intento».</p>'; }
};
examNew();
hud(false);
