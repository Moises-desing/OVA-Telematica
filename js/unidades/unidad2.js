/* =========================================================
   UNIDAD 2 · Redes de circuitos virtuales y datagramas  (Juan Felipe Reino Benitez)
   ========================================================= */
UNITS.push({
  id: 'u2', n: 2, color: '--m2', owner: 'Juan Felipe Reino Benitez',
  title: 'Redes de circuitos virtuales y datagramas',
  obj: 'Distinguir cómo una red entrega paquetes con o sin conexión previa, comparar ventajas y limitaciones de cada modelo y seguir el recorrido de los paquetes en ambos casos.',
  lessons: [
    {
      t: 'Dos maneras de llevar paquetes', h: `<p>Una red de conmutación de paquetes puede organizarse de dos formas:</p>
      <ul><li><b>Red de datagramas</b> (sin conexión): cada paquete viaja solo, con la dirección completa del destino.</li><li><b>Red de circuitos virtuales</b> (orientada a conexión): primero se <i>establece</i> un camino y luego los paquetes lo siguen identificados con un número de circuito.</li></ul>
      <div class="story"><b>Analogía.</b> Los datagramas son como enviar cartas sueltas: cada una lleva la dirección completa y el correo decide cada vez. El circuito virtual es como una llamada telefónica: primero se marca y se abre la línea; luego se habla sin repetir quién eres.</div>
      <p>Internet (IP) usa <b>datagramas</b>. Los circuitos virtuales aparecieron en tecnologías como X.25, Frame Relay y ATM, y MPLS usa una idea parecida con etiquetas.</p>`},
    {
      t: 'Redes de datagramas', h: `<p>En una red de datagramas <b>no hay fase de establecimiento</b>. Cada paquete lleva la dirección IP completa del destino y cada router lo reenvía consultando su tabla de reenvío.</p>
      <ul><li>Los routers <b>no guardan estado</b> de las conversaciones: solo la tabla de reenvío por prefijos.</li><li>Dos paquetes de la misma conversación <b>pueden tomar rutas distintas</b> si la tabla cambia entre uno y otro.</li><li>Pueden llegar <b>desordenados</b>, duplicados o perderse.</li><li>Si un enlace falla, los routers actualizan sus tablas y los paquetes siguientes <b>rodean la falla</b>.</li></ul>`},
    {
      t: 'Redes de circuitos virtuales', h: `<p>Un <b>circuito virtual</b> (VC) pasa por tres fases:</p>
      <ol><li><b>Establecimiento:</b> se reserva un camino y cada router anota una entrada en su tabla de VC.</li><li><b>Transferencia:</b> los paquetes llevan solo un <i>número de VC</i> (corto), no la dirección completa del destino.</li><li><b>Liberación:</b> al terminar se borra el circuito de todas las tablas.</li></ol>
      <p>Cada router mantiene una <b>tabla de VC</b>: (puerto de entrada, VC de entrada) → (puerto de salida, VC de salida). El número de VC puede <b>cambiar en cada enlace</b> (traducción de VC), lo que evita tener que coordinar números globales.</p>
      <ul><li>Todos los paquetes siguen <b>la misma ruta</b> y llegan <b>en orden</b>.</li><li>Pueden reservarse recursos (ancho de banda, buffers) para dar calidad de servicio.</li><li>Los routers guardan <b>estado por conexión</b>, y si un nodo o enlace del circuito cae, <b>el circuito se rompe</b>.</li></ul>`},
    {
      t: 'Diferencias entre ambos modelos', h: `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>Datagramas</th><th>Circuitos virtuales</th></tr></thead><tbody>
      <tr><td><b>Establecimiento</b></td><td>No existe</td><td>Obligatorio antes de enviar datos</td></tr>
      <tr><td><b>Qué lleva cada paquete</b></td><td>Dirección de destino completa</td><td>Número de VC</td></tr>
      <tr><td><b>Estado en los routers</b></td><td>Ninguno por conversación</td><td>Una entrada por circuito</td></tr>
      <tr><td><b>Ruta</b></td><td>Puede cambiar paquete a paquete</td><td>Fija durante todo el circuito</td></tr>
      <tr><td><b>Orden de llegada</b></td><td>No garantizado</td><td>Garantizado</td></tr>
      <tr><td><b>Ante una falla</b></td><td>Los paquetes rodean la falla</td><td>El circuito se rompe y hay que restablecerlo</td></tr>
      <tr><td><b>Calidad de servicio</b></td><td>Más difícil de garantizar</td><td>Más fácil (se reserva en el establecimiento)</td></tr>
      <tr><td><b>Ejemplos</b></td><td>IP (Internet)</td><td>X.25, Frame Relay, ATM; MPLS (similar)</td></tr></tbody></table></div>`},
    {
      t: 'Ventajas y limitaciones', h: `<div class="grid"><div class="card" style="--mc:var(--m4)"><span class="tag">DATAGRAMAS</span><p><b>Ventajas:</b> simples, robustos ante fallas, sin retraso de establecimiento, escalan muy bien.</p><p><b>Limitaciones:</b> sin garantía de orden ni de calidad; cada paquete lleva un encabezado más grande.</p></div>
      <div class="card" style="--mc:var(--m2)"><span class="tag">CIRCUITOS VIRTUALES</span><p><b>Ventajas:</b> orden garantizado, encabezados cortos, posibilidad de reservar recursos.</p><p><b>Limitaciones:</b> retraso inicial de establecimiento, estado en cada router y vulnerabilidad ante fallas del camino.</p></div></div>
      <p>Por eso Internet apostó por datagramas y dejó la fiabilidad a los extremos (TCP).</p>`},
    {
      t: 'Recorrido de los paquetes: ejemplo', h: `<p>En el simulador de abajo, un equipo <b>A</b> envía paquetes al equipo <b>B</b>. Hay dos caminos: el <b>superior</b> (A, R1, R2, R4, B) y el <b>inferior</b> (A, R1, R3, R4, B).</p>
      <ol><li>Elige <b>datagramas</b>, envía un paquete y mira cómo cada router decide con la IP de destino.</li><li>Pulsa <b>«Caer enlace R2–R4»</b> y vuelve a enviar: el paquete rodea la falla.</li><li>Cambia a <b>circuito virtual</b> y envía: primero ocurre el establecimiento y verás la tabla de VC. Luego tumba el enlace de nuevo y observa qué pasa.</li></ol>`}
  ],
  widgets: `
  <div class="card"><span class="tag">SIMULADOR · RECORRIDO DE PAQUETES</span><h3 style="margin-top:0">Datagramas frente a circuito virtual</h3>
    <div class="row" style="align-items:center">
      <div class="seg" role="group" aria-label="Modo de la red" id="nmSeg"><button type="button" data-m="d" aria-pressed="true">Datagramas</button><button type="button" data-m="v" aria-pressed="false">Circuito virtual</button></div>
      <div class="fit"><button class="btn" type="button" id="nmSend">Enviar paquete</button></div>
      <div class="fit"><button class="btn alt" type="button" id="nmFail" aria-pressed="false">Caer enlace R2–R4</button></div>
      <div class="fit"><button class="btn alt sm" type="button" id="nmReset">Reiniciar</button></div>
    </div>
    <figure class="fig" id="nmFig"></figure>
    <div class="hfinfo" id="nmLog" role="status" aria-live="polite">Pulsa «Enviar paquete» para empezar.</div>
    <div class="tblwrap"><table class="tbl" id="nmTbl"></table></div>
    <div class="legend" id="nmCnt"></div></div>`,
  cards: [
    ['Red de datagramas', 'Sin conexión: cada paquete lleva el destino completo y se enruta solo.'],
    ['Circuito virtual', 'Camino establecido de antemano; los paquetes llevan un número de VC.'],
    ['Establecimiento', 'Fase inicial del VC en la que cada router anota la ruta en su tabla.'],
    ['Tabla de VC', 'Asocia (puerto, VC de entrada) con (puerto, VC de salida).'],
    ['Traducción de VC', 'Cambio del número de circuito en cada enlace del camino.'],
    ['Sin estado', 'Los routers de datagramas no guardan información de cada conversación.'],
    ['MPLS', 'Tecnología moderna que reenvía por etiquetas, parecida a un VC.']
  ],
  need: 5,
  quiz: [
    { q: 'En una red de datagramas, ¿qué lleva cada paquete para que los routers sepan hacia dónde enviarlo?', o: ['Un número de circuito virtual', 'La dirección completa del destino', 'La lista de todos los routers del camino', 'Nada: el router recuerda la conversación'], c: 1, e: 'Cada datagrama lleva la dirección de destino completa y el router lo reenvía consultando su tabla.' },
    { q: 'Verdadero o falso: en un circuito virtual todos los paquetes siguen la misma ruta y llegan en orden.', o: ['Verdadero', 'Falso'], c: 0, e: 'El camino se fija en el establecimiento, por eso la ruta es única y el orden se conserva.' },
    { q: '¿Qué fase del circuito virtual crea las entradas en las tablas de los routers?', o: ['Transferencia', 'Liberación', 'Establecimiento', 'Fragmentación'], c: 2, e: 'Durante el establecimiento cada router reserva un número de VC y anota la entrada.' },
    { q: 'Un enlace del camino cae a mitad de una comunicación. ¿Qué ocurre en cada modelo?', o: ['Datagramas: los paquetes siguientes rodean la falla; VC: el circuito se rompe', 'Ambos continúan sin cambios', 'Datagramas: se rompe la conexión; VC: se rodea la falla', 'En ambos se pierde toda la información ya enviada'], c: 0, e: 'Los routers de datagramas recalculan sus tablas; el circuito virtual depende de un camino fijo y debe restablecerse.' },
    { q: '¿Cuál de estas tecnologías usa circuitos virtuales?', o: ['IP versión 4', 'ATM', 'ICMP', 'DNS'], c: 1, e: 'ATM, X.25 y Frame Relay son orientadas a circuitos virtuales. IP es de datagramas.' },
    { q: 'Un paquete A→B de una red de datagramas llegó después de uno enviado más tarde. ¿Cuál es la explicación más probable?', o: ['Los routers lo reordenaron a propósito', 'Tomó una ruta distinta y más lenta', 'El destino perdió la conexión', 'Se estableció un circuito virtual'], c: 1, e: 'Sin ruta fija, paquetes consecutivos pueden seguir caminos distintos y llegar desordenados.' }
  ],
  init(s) {
    const P = { A: [50, 125], R1: [170, 125], R2: [310, 48], R3: [310, 202], R4: [450, 125], B: [590, 125] };
    const LINKS = [['A', 'R1'], ['R1', 'R2'], ['R1', 'R3'], ['R2', 'R4'], ['R3', 'R4'], ['R4', 'B']];
    const TOP = ['A', 'R1', 'R2', 'R4', 'B'], BOT = ['A', 'R1', 'R3', 'R4', 'B'];
    let mode = 'd', fail = false, vc = null, busy = false, n = 0, cnt = { d: 0, v: 0 }, used = false;
    const key = (a, b) => [a, b].sort().join('-');
    function onPath(path, a, b) { for (let i = 0; i < path.length - 1; i++) if (key(path[i], path[i + 1]) === key(a, b)) return true; return false; }
    function fig(active, lab, pos) {
      let g = svgOpen(640, 250, 'Red con dos caminos entre A y B');
      LINKS.forEach(([a, b]) => { const dead = fail && key(a, b) === 'R2-R4', on = active && onPath(active, a, b); g += `<line class="lk ${dead ? 'bad' : on ? 'on' : ''}" x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`; });
      if (fail) g += `<text x="${(P.R2[0] + P.R4[0]) / 2 + 22}" y="${(P.R2[1] + P.R4[1]) / 2 - 6}" fill="var(--bad)" style="fill:var(--bad)">✕ caído</text>`;
      Object.keys(P).forEach(k => { const e = k === 'A' || k === 'B'; g += `<g><rect class="${active && active.includes(k) ? 'hl' : 'box'}" x="${P[k][0] - 24}" y="${P[k][1] - 20}" width="48" height="40" rx="${e ? 8 : 20}"/><text x="${P[k][0]}" y="${P[k][1] + 4}" text-anchor="middle">${k}</text></g>`; });
      const q = pos || P.A;
      g += `<g id="nmPk" style="transform:translate(${q[0]}px,${q[1] - 34}px);transition:transform .5s linear;opacity:${pos ? 1 : 0}"><rect x="-26" y="-12" width="52" height="22" rx="7" style="fill:var(--m5)"/><text id="nmPkT" x="0" y="3" text-anchor="middle" style="fill:#fff;font-size:11px">${lab || ''}</text></g>`;
      return g + '</svg>';
    }
    function tbl() {
      if (mode === 'd') {
        $('nmTbl').innerHTML = `<thead><tr><th>Router</th><th>Prefijo de destino</th><th>Siguiente salto</th></tr></thead><tbody><tr><td>R1</td><td class="m">198.51.100.0/24 (B)</td><td class="m">${fail ? 'R3' : 'R2'}</td></tr><tr><td>R2 / R3</td><td class="m">198.51.100.0/24 (B)</td><td class="m">R4</td></tr><tr><td>R4</td><td class="m">198.51.100.0/24 (B)</td><td class="m">B</td></tr></tbody><caption class="hint" style="text-align:left;caption-side:bottom;padding-top:6px">Tabla de reenvío (simplificada). Cada paquete se decide por separado.</caption>`;
      } else if (vc) {
        const p = vc.path, v = vc.ids;
        $('nmTbl').innerHTML = `<thead><tr><th>Router</th><th>Entrada (de, VC)</th><th>Salida (hacia, VC)</th></tr></thead><tbody>${p.slice(1, -1).map((r, i) => `<tr><td>${r}</td><td class="m">${p[i]}, VC ${v[i]}</td><td class="m">${p[i + 2]}, VC ${v[i + 1]}</td></tr>`).join('')}</tbody><caption class="hint" style="text-align:left;caption-side:bottom;padding-top:6px">Tabla de VC. El número cambia en cada enlace.</caption>`;
      } else $('nmTbl').innerHTML = '<tbody><tr><td class="hint">Aún no hay circuito. Se creará al enviar el primer paquete.</td></tr></tbody>';
    }
    function counters() { $('nmCnt').textContent = `Paquetes enviados: datagramas ${cnt.d} · circuito virtual ${cnt.v}`; if (cnt.d >= 2 && cnt.v >= 2 && used) award('u2_sim'); }
    function draw(active, lab, pos) { $('nmFig').innerHTML = fig(active, lab, pos); tbl(); counters(); }
    async function travel(path, labels) {
      busy = true; $('nmSend').disabled = true;
      draw(path, labels[0], P[path[0]]); await sleep(60);
      for (let i = 1; i < path.length; i++) {
        const pk = $('nmPk'), t = $('nmPkT'); if (t) t.textContent = labels[i - 1];
        if (pk) pk.style.transform = `translate(${P[path[i]][0]}px,${P[path[i]][1] - 34}px)`;
        sfx.hop(); await sleep(560);
      }
      busy = false; $('nmSend').disabled = false;
    }
    async function send() {
      if (busy) return; n++;
      if (mode === 'd') {
        const path = fail ? BOT : TOP; cnt.d++;
        $('nmLog').innerHTML = `<b>Paquete ${n} (datagrama).</b> Lleva la IP destino de B. ${fail ? 'El enlace R2–R4 está caído: R1 ya aprendió otra ruta y lo manda por <b>R3</b>.' : 'R1 consulta su tabla y lo manda por <b>R2</b>.'} Ruta: ${path.join(' → ')}.`;
        await travel(path, path.slice(0, -1).map(() => 'dst B'));
        $('nmLog').innerHTML += ' <span class="ok">Entregado.</span>'; if (fail) used = true; counters();
        return;
      }
      if (vc && onPath(vc.path, 'R2', 'R4') && fail) {
        $('nmLog').innerHTML = `<b>Paquete ${n} (circuito virtual).</b> <span class="bad">El circuito se rompió:</span> el enlace R2–R4 que usaba cayó. Los paquetes no pueden rodear la falla. Hay que <b>restablecer</b> el circuito; pulsa «Enviar paquete» otra vez.`;
        vc = null; used = true; draw(null); return;
      }
      if (!vc) {
        const path = fail ? BOT : TOP, ids = [7, fail ? 22 : 12, fail ? 3 : 5, 9];
        vc = { path, ids };
        $('nmLog').innerHTML = `<b>Establecimiento.</b> Se reserva el camino ${path.join(' → ')} y cada router anota su entrada en la tabla de VC. Ahora ya se pueden enviar paquetes.`;
        draw(path); return;
      }
      cnt.v++;
      $('nmLog').innerHTML = `<b>Paquete ${n} (circuito virtual).</b> Lleva solo el número de VC, que cada router traduce. Ruta fija: ${vc.path.join(' → ')}.`;
      await travel(vc.path, vc.ids.map(i => 'VC ' + i));
      $('nmLog').innerHTML += ' <span class="ok">Entregado, y en orden.</span>'; counters();
    }
    $('nmSend').onclick = send;
    $('nmSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || busy) return; mode = b.dataset.m; $('nmSeg').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); $('nmLog').textContent = mode === 'd' ? 'Modo datagramas: cada paquete se decide por separado.' : 'Modo circuito virtual: el primer envío establece el circuito.'; draw(mode === 'v' && vc ? vc.path : null); sfx.tick(); });
    $('nmFail').onclick = () => { if (busy) return; fail = !fail; $('nmFail').setAttribute('aria-pressed', fail ? 'true' : 'false'); $('nmFail').textContent = fail ? 'Reparar enlace R2–R4' : 'Caer enlace R2–R4'; $('nmLog').textContent = fail ? 'El enlace R2–R4 ha caído.' : 'El enlace R2–R4 volvió a funcionar.'; draw(mode === 'v' && vc ? vc.path : null); sfx.tick(); };
    $('nmReset').onclick = () => { if (busy) return; fail = false; vc = null; n = 0; $('nmFail').setAttribute('aria-pressed', 'false'); $('nmFail').textContent = 'Caer enlace R2–R4'; $('nmLog').textContent = 'Simulador reiniciado.'; draw(null); };
    draw(null);
  }
});

