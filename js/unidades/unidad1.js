/* =========================================================
   UNIDAD 1 · Generalidades del nivel de red  (Juan Felipe Reino Benitez)
   ========================================================= */
function stackFig(hl) {
  const rows = [['Aplicación', 'HTTP · DNS · SMTP · DHCP', 'OSI 5-7'], ['Transporte', 'TCP · UDP', 'OSI 4'], ['Internet', 'IP · ICMP · enrutamiento', 'OSI 3 (red)'], ['Acceso a red', 'Ethernet · Wi-Fi · ARP', 'OSI 1-2']];
  let s = svgOpen(560, 232, 'Pila TCP/IP de cuatro capas con la capa de Internet resaltada');
  rows.forEach((r, i) => {
    const y = 12 + i * 52, on = i === hl;
    s += `<g><rect class="${on ? 'hl' : 'box'}" x="10" y="${y}" width="330" height="44" rx="10"/><text x="26" y="${y + 19}">${r[0]}</text><text class="m s" x="26" y="${y + 36}">${r[1]}</text><text class="s" x="440" y="${y + 27}" text-anchor="middle">${r[2]}</text></g>`;
    if (i < 3) s += `<path class="arrow" d="M175 ${y + 46} l-5 -1 l10 0 z"/>`;
  });
  s += `<text class="s" x="440" y="8" text-anchor="middle">Equivalente en OSI</text></svg>`;
  return s;
}
UNITS.push({
  id: 'u1', n: 1, color: '--m1', owner: 'Juan Felipe Reino Benitez',
  title: 'Generalidades del nivel de red',
  obj: 'Explicar qué hace la capa de Internet, dónde se ubica en el modelo TCP/IP, cómo viaja un paquete entre redes, qué es la encapsulación y por qué reenviar no es lo mismo que enrutar.',
  lessons: [
    {
      t: '¿Qué es la capa de Internet?', h: `<p>La <b>capa de Internet</b> (también llamada <i>capa de red</i>) se encarga de llevar un paquete desde el equipo que lo envía hasta el equipo que lo recibe, aunque estén en redes distintas y entre ellos haya muchos routers. Su protocolo principal es <b>IP</b> (<i>Internet Protocol</i>).</p>
      <ul><li><b>Direccionamiento lógico:</b> da a cada interfaz una dirección IP.</li><li><b>Encapsulación:</b> mete los datos de la capa de transporte dentro de un <i>datagrama</i> IP.</li><li><b>Reenvío:</b> pasa cada paquete al siguiente salto.</li><li><b>Enrutamiento:</b> calcula por dónde deben viajar los paquetes.</li><li><b>Control y diagnóstico:</b> con ayuda de ICMP (unidad 5).</li></ul>
      <div class="story"><b>Analogía.</b> Es como el correo entre ciudades: tú pones la dirección en el sobre, y cada oficina postal decide hacia dónde lo manda después. Ninguna oficina conoce el viaje completo, solo el siguiente paso.</div>`},
    {
      t: 'Ubicación dentro del modelo TCP/IP', h: `<p>El modelo TCP/IP organiza la comunicación en <b>cuatro capas</b>. La de Internet queda en el medio: recibe segmentos de la capa de transporte y entrega tramas a la capa de acceso a red.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Capa TCP/IP</th><th>Qué hace</th><th>Unidad de datos</th></tr></thead><tbody>
      <tr><td><b>Aplicación</b></td><td>Servicios para el usuario (web, correo, DNS).</td><td>Mensaje o datos</td></tr>
      <tr><td><b>Transporte</b></td><td>Comunicación entre procesos (puertos); TCP fiable, UDP rápido.</td><td>Segmento / datagrama UDP</td></tr>
      <tr style="background:color-mix(in srgb,var(--mc) 12%,transparent)"><td><b>Internet</b></td><td>Direccionamiento y entrega entre redes.</td><td><b>Datagrama (paquete) IP</b></td></tr>
      <tr><td><b>Acceso a red</b></td><td>Entrega dentro de un mismo enlace físico.</td><td>Trama</td></tr></tbody></table></div>`, fig: stackFig(2), cap: 'Figura 1. Las cuatro capas de TCP/IP; la de Internet equivale a la capa 3 (red) de OSI.'
    },
    {
      t: 'Comunicación entre redes y entrega de paquetes', h: `<p>Internet es una «red de redes». Los equipos finales (<i>hosts</i>) están en redes locales y los <b>routers</b> las conectan entre sí. Un paquete viaja <b>salto a salto</b>: cada router mira la dirección de destino y lo empuja hacia el siguiente router, hasta llegar a la red del destino.</p>
      <p>IP ofrece un servicio de <b>mejor esfuerzo</b> (<i>best effort</i>): hace lo posible por entregar el paquete, pero <b>no garantiza</b>:</p>
      <ul><li>que el paquete llegue (puede perderse si hay congestión);</li><li>que llegue en orden (dos paquetes pueden tomar rutas distintas);</li><li>que llegue sin duplicados ni errores;</li><li>cuánto tardará.</li></ul>
      <p>Si una aplicación necesita esas garantías (por ejemplo, descargar un archivo completo), las agrega <b>TCP</b> en la capa de transporte. Así la capa de Internet se mantiene simple y rápida.</p>
      <details class="more"><summary>Más información: ¿por qué «mejor esfuerzo» y no garantías?</summary><p>Los diseñadores de Internet pusieron la inteligencia en los extremos (los hosts) y dejaron el núcleo de la red simple. Un router que solo reenvía paquetes es barato, rápido y escala a millones de equipos; si además tuviera que recordar y garantizar cada conversación, sería mucho más lento y frágil.</p></details>`},
    {
      t: 'Direccionamiento lógico', h: `<p>Cada interfaz de red tiene una <b>dirección IP</b>. Es <i>lógica</i> porque la asigna el administrador (o un servidor DHCP) y <b>depende de la red</b> a la que te conectes: si llevas tu portátil a otra red, cambia. Además es <b>jerárquica</b>: una parte identifica la red y otra el equipo, lo que permite a los routers agrupar millones de direcciones en pocas rutas.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>Dirección IP (lógica)</th><th>Dirección MAC (física)</th></tr></thead><tbody>
      <tr><td><b>Capa</b></td><td>Internet</td><td>Acceso a red</td></tr>
      <tr><td><b>Alcance</b></td><td>Extremo a extremo, entre redes</td><td>Solo dentro de un enlace</td></tr>
      <tr><td><b>Quién la fija</b></td><td>Administrador o DHCP</td><td>Fabricante de la tarjeta</td></tr>
      <tr><td><b>Estructura</b></td><td>Jerárquica (red + host)</td><td>Plana</td></tr>
      <tr><td><b>Durante el viaje</b></td><td>Se mantiene (salvo NAT)</td><td>Cambia en cada salto</td></tr></tbody></table></div>
      <div class="story"><b>Analogía.</b> La IP es tu dirección de vivienda (cambia si te mudas); la MAC es el número de serie de tu tarjeta. Pruébalo en el segundo simulador, «Un paquete, tres enlaces».</div>`},
    {
      t: 'Encapsulación de datos', h: `<p>Al bajar por las capas, cada una <b>añade su propio encabezado</b> (y a veces un final) al paquete que recibe de la capa superior. Es como meter una carta en un sobre, y ese sobre dentro de otro.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Capa</th><th>Unidad (PDU)</th><th>Qué se añade</th></tr></thead><tbody>
      <tr><td>Aplicación</td><td>Datos</td><td>El mensaje del usuario</td></tr>
      <tr><td>Transporte</td><td>Segmento</td><td>Encabezado TCP: puertos, números de secuencia…</td></tr>
      <tr><td><b>Internet</b></td><td><b>Datagrama</b></td><td><b>Encabezado IP: IP origen y destino, TTL, protocolo…</b></td></tr>
      <tr><td>Acceso a red</td><td>Trama</td><td>Encabezado y final Ethernet: MAC origen y destino, FCS</td></tr></tbody></table></div>
      <p>El receptor hace lo contrario, la <b>desencapsulación</b>: cada capa lee su encabezado, lo quita y entrega el resto hacia arriba. Usa el simulador «Encapsulación» más abajo para verlo con tu propio mensaje.</p>`},
    {
      t: 'Reenvío frente a enrutamiento', h: `<p>Son dos palabras que suenan parecido, pero describen cosas muy distintas. Un router hace ambas:</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>Reenvío (<i>forwarding</i>)</th><th>Enrutamiento (<i>routing</i>)</th></tr></thead><tbody>
      <tr><td><b>Qué es</b></td><td>Mover un paquete del puerto de entrada al puerto de salida correcto.</td><td>Determinar las rutas de origen a destino y llenar las tablas.</td></tr>
      <tr><td><b>Alcance</b></td><td>Local: un solo router, un paquete.</td><td>Global: todos los routers colaboran.</td></tr>
      <tr><td><b>Plano</b></td><td>Plano de datos</td><td>Plano de control</td></tr>
      <tr><td><b>Velocidad</b></td><td>Nanosegundos, normalmente en hardware.</td><td>Segundos o más, en software.</td></tr>
      <tr><td><b>Usa</b></td><td>Tabla de reenvío</td><td>Algoritmos y protocolos (RIP, OSPF, BGP)</td></tr></tbody></table></div>
      <div class="story"><b>Analogía.</b> Enrutar es planear el mapa de carreteras; reenviar es girar en cada cruce siguiendo las señales.</div>`},
    {
      t: 'Relación con las demás capas', h: `<p>La capa de Internet trabaja entre dos vecinas y necesita identificar con quién habla en cada lado:</p>
      <ul><li><b>Hacia arriba (transporte):</b> el campo <i>Protocolo</i> del encabezado IPv4 dice a quién entregar el contenido: <span class="mono">6</span> = TCP, <span class="mono">17</span> = UDP, <span class="mono">1</span> = ICMP.</li>
      <li><b>Hacia abajo (acceso a red):</b> el campo <i>EtherType</i> de la trama Ethernet indica qué hay dentro: <span class="mono">0x0800</span> = IPv4, <span class="mono">0x86DD</span> = IPv6. Además, IP necesita conocer la MAC del siguiente salto (en IPv4 la obtiene con ARP).</li>
      <li><b>Hacia los lados:</b> ICMP y los protocolos de enrutamiento viajan dentro de paquetes IP.</li></ul>
      <p>Resumen: la capa de transporte pide «llévame este segmento a ese equipo»; la de Internet decide el camino; la de acceso a red lo transporta por el siguiente enlace físico.</p>`}
  ],
  widgets: `
  <div class="card"><span class="tag">SIMULADOR · ENCAPSULACIÓN</span><h3 style="margin-top:0">El mensaje se pone «sobres»</h3>
    <p>Escribe un mensaje y pulsa <b>Encapsular</b> para bajar por las capas. Pasa el cursor sobre cada bloque para ver su tamaño.</p>
    <div class="row"><div style="flex:2 1 220px"><label for="encMsg">Mensaje de la aplicación</label><input id="encMsg" type="text" value="Hola, mundo" maxlength="40" autocomplete="off"></div>
    <div class="fit"><button class="btn" type="button" id="encGo">Encapsular</button></div><div class="fit"><button class="btn alt" type="button" id="encUp">Desencapsular</button></div></div>
    <div class="bar" id="encBar" style="margin-top:14px" role="img" aria-label="Bloques del paquete"></div>
    <div class="hfinfo" id="encInfo" role="status" aria-live="polite"></div>
    <div class="legend" id="encTot" style="margin-top:8px"></div></div>
  <div class="card"><span class="tag">SIMULADOR · DIRECCIONES</span><h3 style="margin-top:0">Un paquete, tres enlaces</h3>
    <p>El equipo A envía un paquete al equipo B. Elige el enlace y observa qué direcciones cambian y cuáles se mantienen.</p>
    <div class="seg" role="group" aria-label="Enlace" id="hopSeg"><button type="button" data-h="1" aria-pressed="true">Enlace 1: A → R1</button><button type="button" data-h="2" aria-pressed="false">Enlace 2: R1 → R2</button><button type="button" data-h="3" aria-pressed="false">Enlace 3: R2 → B</button></div>
    <figure class="fig" id="hopFig"></figure>
    <div class="tblwrap"><table class="tbl" id="hopTbl"></table></div>
    <p class="hint" id="hopNote"></p></div>`,
  cards: [
    ['Capa de Internet', 'Capa de TCP/IP que lleva paquetes entre redes distintas usando IP.'],
    ['Datagrama', 'Paquete IP: encabezado más datos, enviado sin conexión previa.'],
    ['Mejor esfuerzo', 'IP intenta entregar, pero no garantiza llegada, orden ni tiempo.'],
    ['Dirección lógica', 'Dirección IP: identifica una interfaz según la red a la que pertenece.'],
    ['Encapsulación', 'Añadir un encabezado por capa al bajar: datos, segmento, datagrama, trama.'],
    ['Reenvío', 'Mover cada paquete del puerto de entrada al de salida según la tabla.'],
    ['Enrutamiento', 'Calcular las rutas y llenar las tablas que usará el reenvío.']
  ],
  need: 5,
  quiz: [
    { q: '¿Cuál es la función principal de la capa de Internet del modelo TCP/IP?', o: ['Llevar paquetes entre equipos de redes distintas, eligiendo la ruta', 'Garantizar que la aplicación reciba los datos sin errores', 'Convertir los bits en señales eléctricas u ópticas', 'Traducir nombres de dominio a direcciones IP'], c: 0, e: 'La capa de Internet se ocupa de la entrega entre redes. La fiabilidad es de TCP, las señales son del acceso a red y los nombres los resuelve DNS.' },
    { q: 'En la pila TCP/IP, la capa de Internet queda ubicada entre…', o: ['Aplicación y Transporte', 'Transporte y Acceso a red', 'Acceso a red y la capa física del cable', 'Aplicación y Acceso a red'], c: 1, e: 'Las capas, de arriba abajo, son Aplicación, Transporte, Internet y Acceso a red.' },
    { q: 'Verdadero o falso: IP garantiza que los paquetes llegan en orden y sin pérdidas.', o: ['Verdadero', 'Falso'], c: 1, e: 'IP es de «mejor esfuerzo»: no garantiza entrega ni orden. Esas garantías, si hacen falta, las da TCP.' },
    { q: 'Un paquete viaja de A a B pasando por dos routers. En cada salto, ¿qué direcciones cambian (sin NAT)?', o: ['Las IP de origen y destino', 'Solo la IP de destino', 'Las MAC de origen y destino', 'Ninguna dirección cambia'], c: 2, e: 'Las IP se mantienen extremo a extremo; las MAC cambian en cada enlace porque solo tienen sentido dentro de él.' },
    { q: 'Cuando un datagrama IP baja a la capa de acceso a red y se le añaden encabezado y final Ethernet, se convierte en…', o: ['Un segmento', 'Un mensaje', 'Una trama', 'Un bit'], c: 2, e: 'Datos → segmento (transporte) → datagrama (Internet) → trama (acceso a red).' },
    { q: 'Un router recibe un paquete, consulta su tabla y lo saca por el puerto 3. ¿Qué operación acaba de realizar?', o: ['Enrutamiento', 'Reenvío', 'Encapsulación de aplicación', 'Resolución de nombres'], c: 1, e: 'Reenviar es la acción local por paquete. Enrutar es el proceso global que construye la tabla.' }
  ],
  init(s) {
    /* ---- encapsulación ---- */
    let st = 0, reached = false, hopsSeen = new Set([1]);
    const bytes = t => new TextEncoder().encode(t).length;
    const INFO = [
      ['Aplicación', 'Datos', 'Solo el mensaje del usuario. Todavía no hay direcciones ni puertos.'],
      ['Transporte', 'Segmento', 'TCP añade su encabezado de 20 bytes: puerto origen, puerto destino, número de secuencia, control de flujo…'],
      ['Internet', 'Datagrama IP', 'IP añade 20 bytes: IP origen, IP destino, TTL y el campo Protocolo (6 = TCP). Esta es la capa de la unidad.'],
      ['Acceso a red', 'Trama Ethernet', 'Ethernet añade 14 bytes al inicio (MAC destino, MAC origen, EtherType 0x0800) y 4 bytes al final (FCS, para detectar errores).'],
      ['Física', 'Bits', 'La trama se convierte en señales eléctricas, ópticas o de radio y viaja por el medio.']
    ];
    function encDraw() {
      const n = Math.max(1, bytes($('encMsg').value || ' ')), seg = [];
      if (st >= 3) seg.push(['Ethernet 14 B', 14, 'var(--m3)', 'Encabezado Ethernet: 14 bytes']);
      if (st >= 2) seg.push(['IP 20 B', 20, 'var(--m4)', 'Encabezado IP: 20 bytes']);
      if (st >= 1) seg.push(['TCP 20 B', 20, 'var(--m2)', 'Encabezado TCP: 20 bytes']);
      seg.push(['Datos ' + n + ' B', Math.max(n, 14), 'var(--m1)', 'Mensaje: ' + n + ' bytes']);
      if (st >= 3) seg.push(['FCS 4 B', 8, 'var(--m3)', 'Final de trama (FCS): 4 bytes']);
      $('encBar').innerHTML = seg.map(x => `<div tabindex="0" data-tip="${x[3]}" style="flex:${x[1]};background:${x[2]}">${x[0]}</div>`).join('');
      const total = n + (st >= 1 ? 20 : 0) + (st >= 2 ? 20 : 0) + (st >= 3 ? 18 : 0);
      $('encInfo').innerHTML = `<b>${INFO[st][0]} · ${INFO[st][1]}.</b> ${INFO[st][2]}`;
      $('encTot').textContent = `Tamaño total (sin relleno): ${total} bytes. Ethernet añade relleno si la carga es menor de 46 bytes; aquí se omite para simplificar.`;
      $('encGo').disabled = st >= 4; $('encUp').disabled = st <= 0;
    }
    $('encGo').onclick = () => { if (st < 4) st++; encDraw(); sfx.hop(); if (st === 4) { reached = true; check(); } };
    $('encUp').onclick = () => { if (st > 0) st--; encDraw(); sfx.hop(); };
    $('encMsg').addEventListener('input', encDraw); encDraw();
    /* ---- IP vs MAC por enlace ---- */
    const MAC = { A: '00:1A:2B:00:00:0A', R1a: '00:1A:2B:00:01:01', R1b: '00:1A:2B:00:01:02', R2a: '00:1A:2B:00:02:01', R2b: '00:1A:2B:00:02:02', B: '00:1A:2B:00:00:0B' };
    const L = { 1: { ms: MAC.A, md: MAC.R1a, ttl: 64 }, 2: { ms: MAC.R1b, md: MAC.R2a, ttl: 63 }, 3: { ms: MAC.R2b, md: MAC.B, ttl: 62 } };
    function hopFig(h) {
      const xs = [50, 190, 340, 480], names = ['A', 'R1', 'R2', 'B'];
      let g = svgOpen(540, 120, 'Equipo A, dos routers y equipo B conectados en serie. Enlace resaltado: ' + h);
      for (let i = 0; i < 3; i++) g += `<line class="lk ${i + 1 === h ? 'on' : ''}" x1="${xs[i] + 28}" y1="55" x2="${xs[i + 1] - 28}" y2="55"/>`;
      names.forEach((n, i) => g += `<g><rect class="${(i === h - 1 || i === h) ? 'hl' : 'box'}" x="${xs[i] - 28}" y="32" width="56" height="46" rx="10"/><text x="${xs[i]}" y="60" text-anchor="middle">${n}</text></g>`);
      g += `<text class="m s" x="50" y="104" text-anchor="middle">192.0.2.10</text><text class="m s" x="480" y="104" text-anchor="middle">198.51.100.20</text>`;
      return g + '</svg>';
    }
    function hopDraw(h) {
      const x = L[h], ch = h > 1;
      $('hopFig').innerHTML = hopFig(h);
      $('hopTbl').innerHTML = `<thead><tr><th>Campo</th><th>Valor en este enlace</th><th>¿Cambió?</th></tr></thead><tbody>
        <tr><td>IP origen</td><td class="m">192.0.2.10 (A)</td><td class="ok">Igual</td></tr>
        <tr><td>IP destino</td><td class="m">198.51.100.20 (B)</td><td class="ok">Igual</td></tr>
        <tr><td>MAC origen</td><td class="m">${x.ms}</td><td class="${ch ? 'bad' : 'ok'}">${ch ? 'Cambió' : 'Primer enlace'}</td></tr>
        <tr><td>MAC destino</td><td class="m">${x.md}</td><td class="${ch ? 'bad' : 'ok'}">${ch ? 'Cambió' : 'Primer enlace'}</td></tr>
        <tr><td>TTL</td><td class="m">${x.ttl}</td><td class="${ch ? 'bad' : 'ok'}">${ch ? 'Bajó 1 (un router lo decrementó)' : 'Valor inicial'}</td></tr></tbody>`;
      $('hopNote').textContent = ['El host A conoce la MAC del router R1 (su puerta de enlace) y la usa como destino de la trama, aunque el destino final es B.', 'R1 quitó la trama anterior, decrementó el TTL, eligió el siguiente salto y creó una trama nueva con sus propias MAC.', 'R2 está en la misma red que B, así que ahora la MAC destino sí es la del equipo final. La IP destino nunca cambió.'][h - 1];
      hopsSeen.add(h); if (hopsSeen.size === 3) check();
    }
    $('hopSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $('hopSeg').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); hopDraw(+b.dataset.h); sfx.hop(); });
    hopDraw(1);
    function check() { if (reached && hopsSeen.size === 3) award('u1_sim'); }
  }
});

