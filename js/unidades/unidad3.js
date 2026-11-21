/* =========================================================
   UNIDAD 3 · Principios de procesamiento del router  (Carlos Eduardo Garavito Mozo)
   ========================================================= */
const ROUTER_STAGES = [
  ['Llega la trama por el puerto de entrada y se desencapsula', 'La trama llega por el puerto 1. Se comprueba su FCS y se le quita el encabezado Ethernet; queda el datagrama IP.'],
  ['Se verifica el encabezado IP (versión y checksum)', 'El router comprueba que la versión sea 4 y que el checksum del encabezado sea correcto. Si no, descarta el paquete.'],
  ['Se decrementa el TTL y se recalcula el checksum', 'El TTL pasa de 64 a 63. Si llegara a 0, el router descartaría el paquete y enviaría un mensaje ICMP «Tiempo excedido».'],
  ['Se busca el destino en la tabla de reenvío (prefijo más largo)', 'Para el destino 10.20.30.45 coinciden 10.0.0.0/8, 10.20.0.0/16 y 10.20.30.0/24. Gana la más específica, /24, cuyo puerto de salida es el 3.'],
  ['La estructura de conmutación lleva el paquete al puerto de salida', 'La estructura de conmutación transfiere el paquete del puerto de entrada 1 al puerto de salida 3.'],
  ['El paquete espera su turno en la cola del puerto de salida', 'Si el enlace de salida está ocupado, el paquete espera en la cola. Si la cola está llena, se descarta.'],
  ['Se encapsula en una trama nueva y se transmite al siguiente salto', 'El puerto 3 crea una trama nueva con la MAC del siguiente salto como destino y la transmite por el enlace.']
];
function switchFig() {
  let s = svgOpen(600, 180, 'Tres tipos de conmutación: memoria, bus y red de interconexión');
  const b = (x, y, w, h, t, c) => `<rect class="${c || 'box'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" class="s" style="fill:var(--text)">${t}</text>`;
  s += `<text x="100" y="18" text-anchor="middle">1. Por memoria</text>` + b(8, 70, 50, 34, 'Entrada') + b(72, 52, 56, 70, 'CPU + memoria', 'hl') + b(142, 70, 50, 34, 'Salida') + `<path class="lk" d="M58 87 H72 M128 87 H142"/><text class="s" x="100" y="150" text-anchor="middle">el paquete se copia</text><text class="s" x="100" y="164" text-anchor="middle">a la memoria</text>`;
  s += `<text x="300" y="18" text-anchor="middle">2. Por bus</text>` + b(215, 40, 44, 28, 'E1') + b(215, 112, 44, 28, 'E2') + b(341, 40, 44, 28, 'S1') + b(341, 112, 44, 28, 'S2') + `<rect class="hl" x="290" y="34" width="20" height="112" rx="8"/><path class="lk" d="M259 54 H290 M259 126 H290 M310 54 H341 M310 126 H341"/><text class="s" x="300" y="164" text-anchor="middle">un paquete a la vez</text>`;
  s += `<text x="500" y="18" text-anchor="middle">3. Red de interconexión</text>` + b(412, 40, 40, 28, 'E1') + b(412, 112, 40, 28, 'E2') + b(548, 40, 40, 28, 'S1') + b(548, 112, 40, 28, 'S2') + `<path class="lk on" d="M452 54 H548 M452 126 H548"/><path class="lk" d="M500 54 V126"/><circle cx="500" cy="54" r="5" style="fill:var(--m3)"/><circle cx="500" cy="126" r="5" style="fill:var(--m3)"/><text class="s" x="500" y="164" text-anchor="middle">varios en paralelo (salidas distintas)</text>`;
  return s + '</svg>';
}
function routerFig(sel) {
  const on = k => sel.has(k) ? ' sel' : '';
  let s = svgOpen(640, 250, 'Arquitectura de un router: puertos de entrada, estructura de conmutación, puertos de salida y procesador de enrutamiento');
  s += `<g class="pick${on('proc')}" tabindex="0" role="button" data-k="proc" aria-label="Procesador de enrutamiento"><rect class="box" x="120" y="12" width="400" height="48" rx="12"/><text x="320" y="33" text-anchor="middle">Procesador de enrutamiento</text><text class="s" x="320" y="49" text-anchor="middle">plano de control · software · protocolos y tablas</text></g>`;
  s += `<g class="pick${on('in')}" tabindex="0" role="button" data-k="in" aria-label="Puertos de entrada"><rect class="box" x="10" y="100" width="130" height="112" rx="12"/><text x="75" y="124" text-anchor="middle">Puertos de</text><text x="75" y="140" text-anchor="middle">entrada</text><text class="s" x="75" y="162" text-anchor="middle">enlace físico</text><text class="s" x="75" y="176" text-anchor="middle">desencapsular</text><text class="s" x="75" y="190" text-anchor="middle">buscar en tabla</text></g>`;
  s += `<g class="pick${on('fabric')}" tabindex="0" role="button" data-k="fabric" aria-label="Estructura de conmutación"><rect class="box" x="215" y="100" width="210" height="112" rx="12"/><text x="320" y="148" text-anchor="middle">Estructura de</text><text x="320" y="165" text-anchor="middle">conmutación</text></g>`;
  s += `<g class="pick${on('out')}" tabindex="0" role="button" data-k="out" aria-label="Puertos de salida"><rect class="box" x="500" y="100" width="130" height="112" rx="12"/><text x="565" y="124" text-anchor="middle">Puertos de</text><text x="565" y="140" text-anchor="middle">salida</text><text class="s" x="565" y="162" text-anchor="middle">cola y buffer</text><text class="s" x="565" y="176" text-anchor="middle">planificación</text><text class="s" x="565" y="190" text-anchor="middle">encapsular</text></g>`;
  s += `<path class="lk on" d="M140 156 H215 M425 156 H500"/><path class="arrow" d="M214 156 l-8 -5 v10z M499 156 l-8 -5 v10z"/><path class="lk" d="M320 60 V100" style="stroke-dasharray:4 4"/><path class="lk" d="M75 60 V100 M565 60 V100" style="stroke-dasharray:4 4"/>`;
  s += `<text class="s" x="10" y="238">datos →</text><text class="s" x="630" y="238" text-anchor="end">← línea punteada: control</text>`;
  return s + '</svg>';
}
/* partes del router que el estudiante ya seleccionó en el diagrama (se conservan al cambiar de lección) */
const RTR_SEL = new Set();

const FWD_TABLE = [
  { dest: '10.0.0.0/8', port: 1 }, { dest: '10.20.0.0/16', port: 2 }, { dest: '10.20.30.0/24', port: 3 },
  { dest: '192.168.1.0/24', port: 4 }, { dest: '0.0.0.0/0', port: 5, note: 'ruta por defecto' }
];
UNITS.push({
  id: 'u3', n: 3, color: '--m3', owner: 'Carlos Eduardo Garavito Mozo',
  title: 'Principios de procesamiento del router',
  obj: 'Describir las funciones y la arquitectura básica de un router, seguir un paquete desde que entra hasta que sale y entender qué ocurre cuando las colas se llenan.',
  lessons: [
    {
      t: 'Funciones principales de un router', h: `<p>Un <b>router</b> es el dispositivo que conecta redes distintas. Cada una de sus interfaces pertenece a una red diferente, y su trabajo es recibir paquetes por una interfaz y enviarlos por la que corresponda.</p>
      <ul><li><b>Reenviar paquetes</b> según la dirección IP de destino.</li><li><b>Enrutar:</b> ejecutar protocolos para aprender rutas y mantener las tablas.</li><li><b>Separar dominios de broadcast:</b> el broadcast no cruza el router.</li><li><b>Servicios adicionales</b> que muchos incluyen: NAT, filtrado con listas de control de acceso, DHCP, QoS.</li></ul>
      <div class="story"><b>Analogía.</b> Un router es la rotonda de una ciudad: recibe vehículos de muchas calles y, mirando a dónde va cada uno, lo saca por la salida adecuada.</div>`},
    {
      t: 'Arquitectura básica de un router', h: `<p>Un router tiene cuatro componentes principales. Pulsa cada uno en el diagrama para ver su función:</p>
      <ul><li><b>Puertos de entrada:</b> reciben las tramas y buscan el puerto de salida.</li><li><b>Estructura de conmutación:</b> traslada el paquete de un puerto a otro.</li><li><b>Puertos de salida:</b> guardan y transmiten los paquetes.</li><li><b>Procesador de enrutamiento:</b> ejecuta los protocolos y construye las tablas.</li></ul>
      <div id="rtrInfo" class="hfinfo" role="status" aria-live="polite">Pulsa un componente del diagrama.</div>`,
      fig: '<div id="rtrFig"></div>', cap: 'Figura 2. Arquitectura de un router (modelo simplificado). Los puertos y la estructura forman el plano de datos; el procesador, el plano de control.',
      init(b) {
        const sel = RTR_SEL;
        const T = {
          in: ['Puertos de entrada', 'Terminan el enlace físico, desencapsulan la trama y hacen la búsqueda en la tabla de reenvío (cada puerto tiene su copia local para ir rápido). Si la estructura de conmutación está ocupada, el paquete espera en una cola de entrada.'],
          fabric: ['Estructura de conmutación', 'Conecta los puertos de entrada con los de salida. Puede funcionar por memoria, por bus o por red de interconexión (ver la lección 5).'],
          out: ['Puertos de salida', 'Guardan los paquetes en una cola, aplican la política de planificación (FIFO, prioridades…) y los encapsulan en una trama nueva para transmitirlos por el enlace.'],
          proc: ['Procesador de enrutamiento', 'Ejecuta los protocolos de enrutamiento (OSPF, BGP…), construye la tabla de enrutamiento, calcula la tabla de reenvío que se copia a los puertos y atiende administración e ICMP. Trabaja en software, mucho más lento que el reenvío por hardware.']
        };
        const draw = () => { $('rtrFig').innerHTML = routerFig(sel); };
        const act = g => { const k = g.dataset.k; sel.add(k); $('rtrInfo').innerHTML = `<b>${T[k][0]}.</b> ${T[k][1]}`; draw(); sfx.tick(); if (sel.size === 4) UNITS.find(u => u.id === 'u3')._flag('parts'); };
        b.addEventListener('click', e => { const g = e.target.closest('g.pick'); if (g) act(g); });
        b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const g = e.target.closest('g.pick'); if (g) { e.preventDefault(); act(g); const nk = $('rtrFig').querySelector(`g[data-k="${g.dataset.k}"]`); if (nk) nk.focus(); } } });
        draw();
      }
    },
    {
      t: 'Tablas de reenvío y prefijo más largo', h: `<p>La <b>tabla de reenvío</b> relaciona <i>prefijos</i> de destino con el puerto de salida. Un router no guarda una entrada por cada equipo de Internet: agrupa direcciones en prefijos (<span class="mono">10.20.30.0/24</span> significa «todas las que comparten los primeros 24 bits»).</p>
      <p>Como varios prefijos pueden coincidir con el mismo destino, se aplica la regla del <b>prefijo más largo</b> (<i>longest prefix match</i>): gana la entrada que coincide en <b>más bits</b>, es decir, la más específica.</p>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Prefijo</th><th>Puerto de salida</th></tr></thead><tbody>${FWD_TABLE.map(r => `<tr><td class="m">${r.dest}</td><td class="m">${r.port}${r.note ? ' · ' + r.note : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="row"><div style="max-width:280px"><label for="lpmIn">Prueba una dirección de destino</label><input id="lpmIn" type="text" inputmode="decimal" value="10.20.30.45" autocomplete="off"></div></div>
      <div id="lpmOut" class="hfinfo" role="status" aria-live="polite"></div>`,
      init(b) {
        const run = () => {
          const o = parseIp($('lpmIn').value);
          if (!o) { $('lpmOut').innerHTML = '<span class="bad">Escribe una IPv4 válida, por ejemplo 10.20.99.1.</span>'; return; }
          const best = lpm(FWD_TABLE, o);
          $('lpmOut').innerHTML = FWD_TABLE.map(r => { const m = ((ipToInt(o) & maskInt(r._c.p)) >>> 0) === r._c.net; return `<div>${m ? '✓' : '✗'} <span class="mono">${r.dest}</span> ${m ? 'coincide en ' + r._c.p + ' bits' : 'no coincide'}${r === best ? ' <b class="ok">← elegida (prefijo más largo)</b>' : ''}</div>`; }).join('') + `<p style="margin:8px 0 0"><b>Resultado:</b> el paquete sale por el <b>puerto ${best.port}</b>.</p>`;
        };
        $('lpmIn').addEventListener('input', run); run();
      }
    },
    {
      t: 'Conmutación de paquetes', h: `<p>La <b>conmutación</b> es el paso de un paquete desde el puerto de entrada hasta el de salida dentro del router. Existen tres técnicas clásicas:</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Técnica</th><th>Cómo funciona</th><th>Limitación</th></tr></thead><tbody>
      <tr><td><b>Por memoria</b></td><td>Los primeros routers: la CPU copia el paquete a la memoria y luego a la salida.</td><td>Cada paquete cruza la memoria dos veces; la velocidad queda limitada por ella.</td></tr>
      <tr><td><b>Por bus</b></td><td>Los puertos comparten un bus; el paquete lo cruza de entrada a salida sin intervención de la CPU.</td><td>Solo se transfiere un paquete a la vez.</td></tr>
      <tr><td><b>Por red de interconexión</b></td><td>Una matriz (<i>crossbar</i>) conecta entradas y salidas; permite transferencias simultáneas.</td><td>Si dos paquetes van a la misma salida, uno espera.</td></tr></tbody></table></div>`, fig: switchFig(), cap: 'Figura 3. Tres técnicas de conmutación.'
    },
    {
      t: 'Colas, almacenamiento temporal y congestión', h: `<p>Cuando los paquetes llegan más rápido de lo que se pueden procesar o enviar, se forman <b>colas</b> en la memoria del router (buffers).</p>
      <ul><li><b>Cola de entrada:</b> si la estructura de conmutación es más lenta que la llegada de paquetes. Puede ocurrir el <b>bloqueo de cabeza de línea</b> (<i>HOL blocking</i>): el primer paquete espera una salida ocupada y bloquea a los de atrás, aunque estos tengan salidas libres.</li>
      <li><b>Cola de salida:</b> si llegan paquetes más rápido de lo que el enlace puede transmitir. El orden de salida lo decide la <b>planificación</b> (FIFO, por prioridad, etc.).</li></ul>
      <p>Si la cola se llena, el router <b>descarta paquetes</b> (el más común es descartar el que llega: <i>drop-tail</i>). Esa pérdida es la señal de <b>congestión</b> que TCP interpreta para reducir su ritmo.</p>
      <div class="story"><b>Analogía.</b> Es la cola de un peaje: si llegan más autos de los que puede cobrar, se forma fila; si la fila supera el espacio disponible, los últimos autos tienen que dar la vuelta.</div>
      <p>Prueba el simulador de colas, más abajo.</p>`},
    {
      t: 'Ejemplo: un paquete atraviesa un router', h: `<p>Sigue el recorrido de un paquete con destino <span class="mono">10.20.30.45</span> usando la tabla de la lección 3. Pulsa <b>Siguiente etapa</b>:</p>
      <ol id="stgList" class="steps4" style="--mc:var(--m3)"></ol>
      <div class="lctl"><button class="btn sm" type="button" id="stgNext">Siguiente etapa</button><button class="btn alt sm" type="button" id="stgReset">Reiniciar</button></div>`,
      init(b) {
        let k = 0;
        const draw = () => { $('stgList').innerHTML = ROUTER_STAGES.slice(0, k).map(s => `<li><div><b>${s[0]}.</b><br><span class="hint">${s[1]}</span></div></li>`).join('') || '<li class="hint" style="display:block">Aún no ha comenzado.</li>'; $('stgNext').disabled = k >= ROUTER_STAGES.length; };
        $('stgNext').onclick = () => { if (k < ROUTER_STAGES.length) k++; draw(); sfx.hop(); };
        $('stgReset').onclick = () => { k = 0; draw(); };
        draw();
      }
    }
  ],
  widgets: `
  <div class="card"><span class="tag">SIMULADOR · COLAS</span><h3 style="margin-top:0">¿Qué pasa cuando llegan más paquetes de los que salen?</h3>
    <p>El puerto de salida puede enviar <b>4 paquetes por tick</b> y su cola guarda <b>10</b>. Elige cuántos paquetes llegan por tick (más o menos 1, al azar) y simula 20 ticks.</p>
    <div class="row"><div style="flex:1 1 260px"><label for="qLam">Llegadas por tick: <b id="qLamV" class="mono">3</b></label><input id="qLam" type="range" min="1" max="8" value="3" style="width:100%"></div><div class="fit"><button class="btn" type="button" id="qRun">Simular 20 ticks</button></div></div>
    <div class="buf" id="qBuf" aria-hidden="true"></div>
    <div class="statrow"><div class="stat"><small>Tick</small><b id="qT">0</b></div><div class="stat"><small>En cola</small><b id="qN">0</b></div><div class="stat"><small>Enviados</small><b id="qS">0</b></div><div class="stat"><small>Descartados</small><b id="qD">0</b></div></div>
    <div class="hfinfo" id="qMsg" role="status" aria-live="polite">Con pocas llegadas la cola casi no se usa. Sube el control por encima de 4 y observa.</div></div>`,
  cards: [
    ['Router', 'Dispositivo que conecta redes y reenvía paquetes según su IP de destino.'],
    ['Puerto de entrada', 'Recibe la trama, la desencapsula y consulta la tabla de reenvío.'],
    ['Estructura de conmutación', 'Conecta los puertos de entrada con los de salida dentro del router.'],
    ['Tabla de reenvío', 'Asocia prefijos de destino con puertos de salida.'],
    ['Prefijo más largo', 'Regla: gana la entrada que coincide con más bits de la dirección.'],
    ['Cola de salida', 'Memoria donde esperan los paquetes mientras el enlace está ocupado.'],
    ['Congestión', 'Llegan más paquetes de los que el enlace puede enviar; se pierden paquetes.'],
    ['Bloqueo de cabeza de línea', 'El paquete al frente de la cola de entrada frena a los que van detrás.']
  ],
  need: 5,
  quiz: [
    { q: '¿Cuál es la función principal de un router?', o: ['Reenviar paquetes entre redes según la IP de destino', 'Convertir nombres de dominio en direcciones IP', 'Amplificar la señal eléctrica del cable', 'Guardar páginas web en caché'], c: 0, e: 'El router conecta redes y reenvía paquetes usando la dirección IP de destino y su tabla.' },
    { q: '¿Qué componente del router ejecuta protocolos como OSPF o BGP y construye las tablas?', o: ['El puerto de entrada', 'La estructura de conmutación', 'El procesador de enrutamiento', 'El puerto de salida'], c: 2, e: 'El procesador de enrutamiento forma el plano de control; los puertos y la estructura, el plano de datos.' },
    { q: 'Una tabla tiene 10.0.0.0/8, 10.20.0.0/16 y 0.0.0.0/0. ¿Qué entrada se usa para el destino 10.20.5.9?', o: ['10.0.0.0/8', '10.20.0.0/16', '0.0.0.0/0', 'Ninguna: se descarta'], c: 1, e: 'Coinciden las tres, pero gana la de prefijo más largo (/16).' },
    { q: '¿Qué técnica de conmutación permite transferir varios paquetes a la vez hacia salidas distintas?', o: ['Por memoria', 'Por bus compartido', 'Por red de interconexión (crossbar)', 'Ninguna lo permite'], c: 2, e: 'La matriz de interconexión ofrece caminos paralelos; el bus solo deja pasar un paquete a la vez.' },
    { q: 'Llegan paquetes al puerto de salida más rápido de lo que el enlace puede transmitirlos. ¿Qué ocurre?', o: ['Los paquetes se acumulan en la cola y, si se llena, se descartan', 'El router baja el TTL a cero', 'El router cambia automáticamente la máscara', 'Se establece un circuito virtual'], c: 0, e: 'La cola absorbe ráfagas cortas, pero si la sobrecarga persiste se llena y se descartan paquetes: congestión.' },
    { q: 'Verdadero o falso: el reenvío de cada paquete lo realiza normalmente el procesador de enrutamiento mediante software lento.', o: ['Verdadero', 'Falso'], c: 1, e: 'El reenvío ocurre en el plano de datos, normalmente en hardware dentro de los puertos, en nanosegundos.' }
  ],
  _f: { parts: false, sim: false },
  _flag(k) { this._f[k] = true; if (this._f.parts && this._f.sim) award('u3_sim'); },
  init(s) {
    const self = this;
    const BUF = 10, MU = 4;
    let running = false;
    const draw = (q, d) => { $('qBuf').innerHTML = Array.from({ length: BUF }, (_, i) => `<i class="${i < q ? 'f' : ''}"></i>`).join('') + (d ? Array.from({ length: Math.min(d, 6) }, () => '<i class="d" title="descartado"></i>').join('') : ''); };
    $('qLam').addEventListener('input', () => { $('qLamV').textContent = $('qLam').value; });
    $('qRun').onclick = async () => {
      if (running) return; running = true; $('qRun').disabled = true;
      const lam = +$('qLam').value; let q = 0, sent = 0, drop = 0, mx = 0;
      for (let t = 1; t <= 20; t++) {
        const arr = Math.max(0, lam + ri(-1, 1)); let dr = 0;
        q += arr; if (q > BUF) { dr = q - BUF; q = BUF; drop += dr; }
        mx = Math.max(mx, q);
        const out = Math.min(q, MU); q -= out; sent += out;
        $('qT').textContent = t; $('qN').textContent = q; $('qS').textContent = sent; $('qD').textContent = drop;
        draw(Math.min(BUF, q + out), dr); await sleep(170);
        draw(q, 0);
      }
      $('qMsg').innerHTML = lam > MU ? `<b class="bad">Congestión.</b> Llegan ${lam} por tick y solo salen ${MU}: la cola se llenó (máximo ${mx} de ${BUF}) y se descartaron <b>${drop}</b> paquetes.` : lam === MU ? `<b>Al límite.</b> Llegan tantos como salen (${MU}); cualquier ráfaga extra llena la cola. Descartados: ${drop}.` : `<b class="ok">Sin problema.</b> Llegan ${lam} por tick y salen hasta ${MU}; la cola se vacía sola. Descartados: ${drop}.`;
      running = false; $('qRun').disabled = false; self._flag('sim'); sfx.ok();
    };
    draw(0, 0);
  }
});

