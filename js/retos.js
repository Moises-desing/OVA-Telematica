/* =====================================================================
   js/retos.js
   Retos 1 a 4. Responsables: Carlos Eduardo Garavito Mozo (1), Moisés Montiel (2), Junior Madera (3) y Juan Felipe Reino Benitez (4).
   ===================================================================== */

const R1_POOL = [
  ['¿Qué campo evita que un paquete circule indefinidamente en un bucle?', 'ttl'],
  ['¿Qué campo indica si los datos pertenecen a TCP, UDP o ICMP?', 'proto'],
  ['¿Qué campo permite detectar errores en el propio encabezado?', 'chk'],
  ['¿Dónde va la dirección del equipo que envía el paquete?', 'src'],
  ['¿Qué campo indica la longitud del encabezado en palabras de 32 bits?', 'ihl'],
  ['¿Qué campo contiene el bit «no fragmentar» (DF)?', 'flags'],
  ['¿Qué campo identifica a los fragmentos que pertenecen al mismo datagrama original?', 'id'],
  ['¿Qué campo da el tamaño total del datagrama (encabezado más datos)?', 'len']
];
function buildR1(root) {
  let q, i, ok;
  function start() { q = shuffle(R1_POOL).slice(0, 5); i = 0; ok = 0; draw(); }
  function draw() {
    root.innerHTML = `<p class="hint">Pregunta ${Math.min(i + 1, 5)} de 5 · aciertos ${ok}</p><div class="hdrx" id="r1G">${hdrHtml(4, true)}</div><div class="fb" id="r1F" role="status" aria-live="polite"></div>`;
    if (i >= 5) {
      const pass = ok >= 4; $('r1G').remove();
      $('r1F').innerHTML = `<p class="${pass ? 'ok' : 'bad'}">${pass ? '¡Reto superado!' : 'Aún no.'} ${ok} de 5 aciertos (necesitas 4).</p><button class="btn alt sm" id="r1Re" type="button">Intentar de nuevo</button>`;
      $('r1Re').onclick = start; if (pass) award('r1'); return;
    }
    root.insertAdjacentHTML('afterbegin', `<p class="qtxt"><b>${q[i][0]}</b></p>`);
    $('r1G').addEventListener('click', e => {
      const b = e.target.closest('.hf'); if (!b || $('r1G').dataset.lock) return; $('r1G').dataset.lock = 1;
      const good = b.dataset.f === q[i][1];
      if (good) { ok++; b.classList.add('good'); sfx.ok(); } else { b.classList.add('wrong'); $('r1G').querySelector(`[data-f="${q[i][1]}"]`).classList.add('good'); sfx.bad(); }
      const d = HDESC[4][q[i][1]];
      $('r1F').innerHTML = `${good ? '<span class="ok">Correcto.</span>' : '<span class="bad">Incorrecto.</span>'} <b>${d[0]}:</b> ${d[1]} <button class="btn sm" id="r1N" type="button">${i < 4 ? 'Siguiente' : 'Ver resultado'}</button>`; pop($('r1F'));
      $('r1N').onclick = () => { i++; draw(); }; $('r1N').focus();
    });
  }
  start();
}
function buildR2(root) {
  const POOL = ['10.20.30.45', '10.20.99.1', '10.5.5.5', '172.20.1.1', '8.8.8.8', '192.168.1.50', '172.40.0.1', '10.20.30.255', '172.16.0.9', '192.168.2.50'];
  const OPTS = [...new Set(RT_TABLE.map(r => r.nh))];
  function start() {
    const q = shuffle(POOL).slice(0, 5);
    root.innerHTML = `<div class="tblwrap"><table class="tbl"><thead><tr><th>Destino</th><th>Siguiente salto</th><th>Interfaz</th></tr></thead><tbody>${RT_TABLE.map(r => `<tr><td class="m">${r.dest}</td><td class="m">${r.nh}</td><td class="m">${r.iface}</td></tr>`).join('')}</tbody></table></div>
      <p style="margin-top:12px"><b>Para cada paquete, elige por dónde lo reenviaría este router.</b></p>
      <div class="tblwrap"><table class="tbl rtbl"><thead><tr><th>Paquete con destino</th><th>Siguiente salto</th><th></th></tr></thead><tbody>${q.map((ip, k) => `<tr><td class="m"><b>${ip}</b></td><td><select id="r2s${k}" aria-label="Siguiente salto para ${ip}"><option value="">Elige…</option>${OPTS.map(o => `<option>${o}</option>`).join('')}<option>Descartar el paquete</option></select></td><td id="r2m${k}"></td></tr>`).join('')}</tbody></table></div>
      <button class="btn" id="r2Go" type="button">Comprobar</button> <button class="btn alt sm" id="r2Re" type="button">Otros paquetes</button><div class="fb" id="r2F" role="status" aria-live="polite"></div>`;
    $('r2Re').onclick = () => { start(); sfx.tick(); };
    $('r2Go').onclick = () => {
      let ok = 0, miss = 0;
      q.forEach((ip, k) => { const v = $('r2s' + k).value, best = lpm(RT_TABLE, ip); if (!v) { miss++; $('r2m' + k).innerHTML = '<span class="bad">Falta</span>'; return; } const good = v === best.nh; if (good) ok++; $('r2m' + k).innerHTML = good ? '<span class="ok">✓</span>' : `<span class="bad">✗</span> <span class="hint">gana ${best.dest} → ${best.nh}</span>`; });
      if (miss) { $('r2F').innerHTML = '<span class="bad">Responde todos los paquetes antes de comprobar.</span>'; return; }
      $('r2F').innerHTML = `<p class="${ok >= 4 ? 'ok' : 'bad'}">${ok >= 4 ? '¡Reto superado!' : 'Aún no.'} ${ok} de 5 correctos (necesitas 4). Recuerda: gana el prefijo más largo; si ninguno coincide, la ruta por defecto.</p>`; pop($('r2F'));
      if (ok >= 4) { sfx.ok(); award('r2'); } else sfx.bad();
    };
  }
  start();
}
const cliBlock = t => `<div class="cli" style="min-height:0">${t}</div>`;
const R3_BANK = [
  { q: '<b>Caso 1.</b> Ejecutas un ping y obtienes:' + cliBlock('Respuesta desde 203.0.113.50: bytes=32 tiempo=31ms TTL=52\nRespuesta desde 203.0.113.50: bytes=32 tiempo=33ms TTL=52\nRespuesta desde 203.0.113.50: bytes=32 tiempo=30ms TTL=52\nRespuesta desde 203.0.113.50: bytes=32 tiempo=35ms TTL=52\nPaquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos)') + '¿Qué puedes concluir?', o: ['Hay conectividad con el destino y la ruta funciona sin pérdidas', 'El destino está apagado', 'Algún router no tiene ruta al destino', 'El servidor DNS está fallando'], c: 0, e: 'Cuatro Echo Reply sin pérdidas indican conectividad extremo a extremo. El TTL de 52 sugiere que la respuesta cruzó unos 12 routers.' },
  { q: '<b>Caso 2.</b> El resultado de un ping es:' + cliBlock('Tiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\nTiempo de espera agotado para esta solicitud.\nPaquetes: enviados = 4, recibidos = 0, perdidos = 4 (100% perdidos)') + '¿Qué es correcto afirmar?', o: ['No hubo respuesta; puede ser un firewall, un equipo apagado o una falla en la ruta, y hay que seguir diagnosticando', 'El destino envió un mensaje ICMP de destino inalcanzable', 'La dirección IP del destino es privada', 'El problema es seguro del DNS'], c: 0, e: 'El tiempo agotado es silencio, no un mensaje ICMP. No identifica por sí solo la causa: se complementa con traceroute y otras pruebas.' },
  { q: '<b>Caso 3.</b> Ejecutas tracert a 203.0.113.50:' + cliBlock(' 1    2 ms   192.168.1.1\n 2    8 ms   198.51.100.1\n 3   12 ms   198.51.100.37\n 4  198.51.100.37  informa: Red de destino inaccesible.') + '¿Dónde está el problema?', o: ['El router 198.51.100.37 no tiene ruta hacia la red de destino', 'Tu tarjeta de red está dañada', 'El servidor de destino está apagado', 'El primer router bloquea el ICMP'], c: 0, e: 'El tercer router recibe el paquete y responde «destino inalcanzable»: no sabe cómo llegar a esa red. Los dos primeros saltos funcionan.' },
  { q: '<b>Caso 4.</b> Observas dos pruebas:' + cliBlock('> ping 203.0.113.50\nRespuesta desde 203.0.113.50: bytes=32 tiempo=30ms TTL=52\n\n> ping www.ejemplo.test\nNo se pudo encontrar el host www.ejemplo.test.') + '¿Qué falla?', o: ['La resolución de nombres (DNS), no la conectividad IP', 'El enrutamiento hacia Internet', 'La máscara de subred del equipo', 'El TTL es demasiado bajo'], c: 0, e: 'Si responde por IP pero no por nombre, la red funciona; falta traducir el nombre a una dirección, tarea del DNS.' }
];
function buildR4(root) {
  const OPT = ['El gateway está fuera de la subred del equipo (dirección del gateway mal escrita)', 'La máscara de subred es incorrecta', 'La IP del equipo es la dirección de red', 'La IP del equipo es la dirección de broadcast', 'La IP del equipo está repetida con la del router'];
  const mk = () => {
    const out = [];
    shuffle([0, 1, 2, 3, 4]).forEach(kind => {
      const x = ri(1, 200), net = `192.168.${x}.`, gwOk = net + '1';
      let ip, mask = '255.255.255.0', gw = gwOk, why;
      if (kind === 0) { ip = net + ri(20, 60); gw = `192.168.${x + 1}.1`; why = `El equipo está en ${net}0/24, pero el gateway ${gw} pertenece a otra subred: el gateway debe estar en la misma red que el equipo.`; }
      else if (kind === 1) { ip = net + ri(100, 120); mask = '255.255.255.240'; why = `Con la máscara /28 la red del equipo es ${intToIp(calcNet(parseIp(ip), 28).net)}/28 y el gateway ${gw} queda fuera. La máscara debería ser 255.255.255.0.`; }
      else if (kind === 2) { ip = net + '0'; why = `${ip} es la dirección de red de ${net}0/24: identifica a la red, no se puede asignar a un equipo.`; }
      else if (kind === 3) { ip = net + '255'; why = `${ip} es la dirección de broadcast de ${net}0/24: no se puede asignar a un equipo.`; }
      else { ip = gwOk; why = `La IP del equipo (${ip}) es idéntica a la del gateway: está repetida y provoca conflicto.`; }
      out.push({ q: `<b>Red de la oficina:</b> ${net}0/24, router en ${gwOk}.` + cliBlock(`Dirección IP . . . . . : ${ip}\nMáscara de subred . . . : ${mask}\nPuerta de enlace . . . . : ${gw}`) + '¿Cuál es el error de configuración?', o: OPT, c: kind, e: why, fixed: true });
    });
    return out;
  };
  function start() { root.innerHTML = '<div id="r4Q"></div><button class="btn alt sm" id="r4Re" type="button" style="margin-top:10px">Generar otros casos</button>'; const bank = mk(); quizWidgetFixed($('r4Q'), bank, 4, 'r4'); $('r4Re').onclick = () => { start(); sfx.tick(); }; }
  start();
}
/* cuestionario sin barajar opciones (las opciones tienen un orden natural) */
function quizWidgetFixed(root, bank, need, awardId) {
  const b2 = bank.map(x => Object.assign({}, x, { o: x.o.slice() }));
  const w = quizWidget(root, b2.map(x => Object.assign({}, x)), need, awardId);
  return w;
}

/* ---------- arranque de la página ---------- */
buildR1($('r1Box')); buildR2($('r2Box')); quizWidget($('r3Box'), R3_BANK, 3, 'r3'); buildR4($('r4Box'));
hud(false);
