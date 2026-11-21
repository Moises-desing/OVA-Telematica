/* =========================================================
   UNIDAD 5 · ICMP  (Junior Madera)
   ========================================================= */
const PING_HOSTS = {
  loop: { name: '127.0.0.1 (el propio equipo)', ip: '127.0.0.1', kind: 'ok', ttl: 64, rtt: [0, 0], expl: 'La respuesta llega sin salir de tu equipo. Prueba que la pila TCP/IP está funcionando, pero no dice nada sobre la red.' },
  gw: { name: '192.168.1.1 (puerta de enlace)', ip: '192.168.1.1', kind: 'ok', ttl: 64, rtt: [1, 3], expl: 'Hay conectividad con tu router. El TTL se mantiene en 64 porque el router está a un solo salto, en tu misma red.' },
  web: { name: '203.0.113.50 (servidor remoto)', ip: '203.0.113.50', kind: 'ok', ttl: 52, rtt: [28, 41], expl: 'El servidor responde. Un TTL de 52 sugiere que el paquete de respuesta salió con 64 y cruzó unos 12 routers.' },
  nonet: { name: '198.51.100.9 (red sin ruta)', ip: '198.51.100.9', kind: 'net', via: '192.168.1.1', expl: 'Tu router respondió con un mensaje ICMP «Destino inalcanzable (red)»: no tiene ninguna ruta hacia esa red. Es un error informado explícitamente por un router.' },
  host: { name: '192.168.1.77 (equipo apagado)', ip: '192.168.1.77', kind: 'host', via: '192.168.1.10', expl: 'Tu equipo no pudo resolver la MAC de ese destino en la red local (ARP sin respuesta) y avisa «Destino inalcanzable (host)». El equipo está apagado o desconectado.' },
  fw: { name: '203.0.113.99 (servidor con firewall)', ip: '203.0.113.99', kind: 'timeout', expl: '«Tiempo de espera agotado» no es un mensaje ICMP: es la ausencia de respuesta. Puede ser un firewall que filtra ICMP, un equipo apagado o pérdida en la ruta.' }
};
const TRACE = {
  ok: { name: 'Recorrido normal hasta el servidor', dest: '203.0.113.50', hops: [['192.168.1.1', 2], ['198.51.100.1', 8], ['198.51.100.37', 12], ['192.0.2.14', 19], ['192.0.2.101', 27], ['203.0.113.50', 33]], expl: 'Cada salto responde «Tiempo excedido» (ICMP tipo 11) cuando su TTL llega a 0, y por eso se conocen sus direcciones. El último salto, el destino, responde con Echo Reply.' },
  fail: { name: 'Falla: un router no tiene ruta', dest: '203.0.113.50', hops: [['192.168.1.1', 2], ['198.51.100.1', 8], ['198.51.100.37', 12]], stop: '198.51.100.37', expl: 'El tercer router recibe el paquete pero no sabe cómo llegar al destino y devuelve «Destino inalcanzable». El problema está en la ruta a partir de ese router.' },
  star: { name: 'Un router que no responde (* * *)', dest: '203.0.113.50', hops: [['192.168.1.1', 2], ['198.51.100.1', 8], null, ['192.0.2.14', 22], ['203.0.113.50', 33]], expl: 'Los asteriscos indican que no llegó respuesta en el salto 3 (el router reenvía pero no contesta ICMP, o hay un filtro). Como los saltos siguientes sí responden, el camino funciona.' }
};
function icmpFig() {
  let s = svgOpen(560, 150, 'Traceroute: tres paquetes con TTL 1, 2 y 3 y las respuestas Tiempo excedido');
  const xs = [40, 190, 340, 490], nm = ['Origen', 'Router 1', 'Router 2', 'Destino'];
  s += `<line class="lk" x1="60" y1="60" x2="470" y2="60"/>`;
  xs.forEach((x, i) => s += `<g><rect class="${i === 3 ? 'hl' : 'box'}" x="${x - 34}" y="40" width="68" height="40" rx="9"/><text x="${x}" y="64" text-anchor="middle">${nm[i]}</text></g>`);
  s += `<text class="m s" x="115" y="30" text-anchor="middle">TTL=1 → muere aquí</text><text class="m s" x="265" y="30" text-anchor="middle">TTL=2 → muere aquí</text><text class="m s" x="415" y="30" text-anchor="middle">TTL=3 → llega</text>`;
  s += `<path class="lk on" d="M190 90 Q115 118 40 92" style="stroke:var(--m5)"/><text class="s" x="115" y="124" text-anchor="middle">Tiempo excedido (11)</text><path class="lk on" d="M340 90 Q190 138 40 94" style="stroke:var(--m5)"/><text class="s" x="265" y="146" text-anchor="middle">Tiempo excedido (11)</text>`;
  return s + '</svg>';
}
UNITS.push({
  id: 'u5', n: 5, color: '--m5', owner: 'Junior Madera',
  title: 'Protocolo de mensajes de control de Internet: ICMP',
  obj: 'Explicar para qué sirve ICMP, reconocer sus mensajes principales en IPv4 e IPv6, entender cómo funcionan Ping y Traceroute y usarlos para diagnosticar problemas de conectividad.',
  lessons: [
    {
      t: 'Definición y propósito de ICMP', h: `<p><b>ICMP</b> (<i>Internet Control Message Protocol</i>, RFC 792) es el protocolo auxiliar de IP. IP envía datagramas sin avisar si algo sale mal; ICMP es el canal por el cual routers y equipos <b>informan errores</b> y permiten <b>diagnosticar</b> la red.</p>
      <ul><li>Viaja <b>dentro de paquetes IP</b> (campo Protocolo = 1 en IPv4).</li><li><b>No corrige</b> los errores ni hace que IP sea fiable: solo informa.</li><li>No lo usan directamente las aplicaciones; lo emplean el sistema operativo y herramientas como <i>ping</i> y <i>traceroute</i>.</li></ul>
      <div class="story"><b>Analogía.</b> Es el «devuelto al remitente» del correo: cuando una carta no puede entregarse, alguien te avisa por qué. No arregla la entrega, pero te dice qué falló.</div>`},
    {
      t: 'Mensajes de control y diagnóstico', h: `<p>Todo mensaje ICMP tiene un <b>tipo</b> y un <b>código</b> (que detalla el tipo). Hay dos familias: mensajes de <b>consulta</b> (como el eco) y mensajes de <b>error</b> (que incluyen parte del paquete original que falló).</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Tipo</th><th>Nombre (ICMPv4)</th><th>Para qué</th></tr></thead><tbody>
      <tr><td class="m">0</td><td>Echo Reply</td><td>Respuesta al eco (ping)</td></tr>
      <tr><td class="m">3</td><td>Destination Unreachable</td><td>No se pudo entregar el paquete</td></tr>
      <tr><td class="m">5</td><td>Redirect</td><td>Hay una ruta mejor por otro router</td></tr>
      <tr><td class="m">8</td><td>Echo Request</td><td>Solicitud de eco (ping)</td></tr>
      <tr><td class="m">11</td><td>Time Exceeded</td><td>El TTL llegó a 0 (traceroute lo aprovecha)</td></tr>
      <tr><td class="m">12</td><td>Parameter Problem</td><td>Encabezado IP con valores incorrectos</td></tr></tbody></table></div>`},
    {
      t: 'ICMPv4 e ICMPv6', h: `<p><b>ICMPv6</b> (RFC 4443) cumple el mismo papel para IPv6, pero es <b>indispensable</b>: además de errores y eco, hace funciones que en IPv4 hacen otros protocolos.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>ICMPv4</th><th>ICMPv6</th></tr></thead><tbody>
      <tr><td><b>Se identifica con</b></td><td>Protocolo 1</td><td>Siguiente encabezado 58</td></tr>
      <tr><td><b>Echo Request / Reply</b></td><td>Tipos 8 / 0</td><td>Tipos 128 / 129</td></tr>
      <tr><td><b>Destino inalcanzable</b></td><td>Tipo 3</td><td>Tipo 1</td></tr>
      <tr><td><b>Tiempo excedido</b></td><td>Tipo 11</td><td>Tipo 3</td></tr>
      <tr><td><b>Paquete demasiado grande</b></td><td>Tipo 3, código 4 (fragmentación necesaria)</td><td>Tipo 2 (Packet Too Big)</td></tr>
      <tr><td><b>Resolver MAC de vecinos</b></td><td>Lo hace ARP (aparte)</td><td>Neighbor Discovery: tipos 135 y 136</td></tr>
      <tr><td><b>Si se bloquea todo</b></td><td>Se pierde diagnóstico</td><td>Se rompe el funcionamiento de IPv6</td></tr></tbody></table></div>`},
    {
      t: 'Echo Request y Echo Reply', h: `<p>Son los mensajes de <b>eco</b>. Un equipo envía un <b>Echo Request</b> y el destino, si está activo y se lo permite, contesta con un <b>Echo Reply</b>. Cada mensaje lleva un <i>identificador</i>, un <i>número de secuencia</i> y datos opcionales para emparejar solicitud y respuesta.</p>
      <p>Con el eco se comprueba que: (1) el destino está alcanzable, (2) cuánto tarda en responder (<b>RTT</b>, tiempo de ida y vuelta) y (3) cuántos paquetes se pierden.</p>
      <div class="cli"><span class="d">C:\\&gt;</span> ping 203.0.113.50\n\nRespuesta desde 203.0.113.50: bytes=32 tiempo=33ms TTL=52\nRespuesta desde 203.0.113.50: bytes=32 tiempo=31ms TTL=52\n\nEstadísticas: enviados = 2, recibidos = 2, perdidos = 0 (0% perdidos)</div>`},
    {
      t: 'Funcionamiento de Ping', h: `<p><b>Ping</b> envía varios Echo Request seguidos y reporta, por cada Echo Reply, el tiempo y el <b>TTL</b> de la respuesta. Al final resume cuántos paquetes se perdieron y los tiempos mínimo, medio y máximo.</p>
      <ul><li><b>TTL de la respuesta:</b> parte de un valor inicial típico (64, 128 o 255). Si ves 52, el paquete cruzó unos 12 routers.</li><li><b>Destino inalcanzable:</b> si en vez de eco llega un ICMP tipo 3, el mensaje dice <i>quién</i> no pudo entregar y <i>por qué</i> (red, host, protocolo o puerto).</li><li><b>Tiempo de espera agotado:</b> no llegó nada. No es un mensaje ICMP, es silencio: pérdida, firewall o equipo apagado.</li></ul>
      <p>Prueba distintos destinos en el simulador <b>Ping</b>, más abajo.</p>`},
    {
      t: 'Mensajes de destino inalcanzable', h: `<p>El mensaje <b>Destination Unreachable</b> (tipo 3 en ICMPv4) lo genera el router (o el propio destino) que no puede entregar un paquete. El <b>código</b> indica la causa:</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Código</th><th>Significado</th><th>Quién lo suele enviar</th></tr></thead><tbody>
      <tr><td class="m">0</td><td>Red inalcanzable</td><td>Un router sin ruta hacia esa red</td></tr>
      <tr><td class="m">1</td><td>Host inalcanzable</td><td>El router de la red destino, o tu equipo si falla la resolución ARP</td></tr>
      <tr><td class="m">2</td><td>Protocolo inalcanzable</td><td>El destino no soporta ese protocolo</td></tr>
      <tr><td class="m">3</td><td>Puerto inalcanzable</td><td>El destino, cuando no hay un proceso escuchando en un puerto UDP</td></tr>
      <tr><td class="m">4</td><td>Fragmentación necesaria y DF activado</td><td>Un router: el paquete es mayor que la MTU y no se puede fragmentar</td></tr></tbody></table></div>`},
    {
      t: 'Funcionamiento de Traceroute / Tracert', h: `<p><b>Traceroute</b> (en Windows, <i>tracert</i>) descubre <b>los routers del camino</b> aprovechando el TTL:</p>
      <ol><li>Envía un paquete con <b>TTL = 1</b>. El primer router lo decrementa a 0, lo descarta y responde <i>Time Exceeded</i>: ya conocemos su IP.</li><li>Envía otro con <b>TTL = 2</b>: muere en el segundo router, que se identifica.</li><li>Repite subiendo el TTL hasta llegar al destino, que responde con Echo Reply (o Port Unreachable, según la implementación).</li></ol>
      <p>También mide el tiempo de cada salto. Una línea con <span class="mono">* * *</span> significa que ese salto no respondió.</p>
      <details class="more"><summary>Más información: ¿qué envía cada sistema?</summary><p>Tracert de Windows envía Echo Request ICMP con TTL creciente. Traceroute de Linux y macOS, por defecto, envía datagramas UDP a puertos altos; el destino responde con «Puerto inalcanzable», y así sabe que llegó.</p></details>
      <p>Pruébalo en el simulador <b>Traceroute</b>, más abajo.</p>`, fig: icmpFig(), cap: 'Figura 4. Traceroute aumenta el TTL de a uno; cada router donde expira responde «Tiempo excedido» e identifica su dirección.'
    },
    {
      t: 'Ejemplos de diagnóstico de conectividad', h: `<p>Un método sencillo es probar «de adentro hacia afuera» y ver dónde deja de responder:</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Prueba</th><th>Si falla…</th><th>Acción</th></tr></thead><tbody>
      <tr><td><span class="mono">ping 127.0.0.1</span></td><td>La pila TCP/IP del equipo tiene un problema</td><td>Revisar el sistema operativo y los controladores</td></tr>
      <tr><td><span class="mono">ping</span> a tu propia IP</td><td>Interfaz mal configurada o desactivada</td><td>Revisar la configuración de la tarjeta</td></tr>
      <tr><td><span class="mono">ping</span> al gateway</td><td>Problema en la red local: cable, Wi-Fi, IP o máscara</td><td>Revisar la dirección, la máscara y la conexión</td></tr>
      <tr><td><span class="mono">ping</span> a una IP externa</td><td>Falla en la salida a Internet: ruta o proveedor</td><td>Usar <i>traceroute</i> para ver dónde se corta</td></tr>
      <tr><td><span class="mono">ping</span> a un nombre (si la IP sí responde)</td><td>El problema es de DNS, no de IP</td><td>Revisar el servidor DNS configurado</td></tr></tbody></table></div>`}
  ],
  widgets: `
  <div class="card"><span class="tag">SIMULADOR · PING</span><h3 style="margin-top:0">Prueba la conectividad hacia distintos destinos</h3>
    <p>Las direcciones públicas son de los bloques reservados para documentación (RFC 5737), por lo que son ficticias.</p>
    <div class="row" style="align-items:flex-end"><div style="flex:2 1 260px"><label for="pgSel">Destino</label><select id="pgSel">${Object.keys(PING_HOSTS).map(k => `<option value="${k}">${PING_HOSTS[k].name}</option>`).join('')}</select></div><div class="fit"><button class="btn" type="button" id="pgGo">Hacer ping</button></div></div>
    <div class="cli" id="pgOut" role="log" aria-label="Salida de ping">Elige un destino y pulsa «Hacer ping».</div>
    <div class="hfinfo" id="pgExp" role="status" aria-live="polite"></div></div>
  <div class="card"><span class="tag">SIMULADOR · TRACEROUTE</span><h3 style="margin-top:0">Descubre el camino salto a salto</h3>
    <div class="row" style="align-items:flex-end"><div style="flex:2 1 260px"><label for="trSel">Escenario</label><select id="trSel">${Object.keys(TRACE).map(k => `<option value="${k}">${TRACE[k].name}</option>`).join('')}</select></div><div class="fit"><button class="btn" type="button" id="trGo">Ejecutar traceroute</button></div></div>
    <div class="cli" id="trOut" role="log" aria-label="Salida de traceroute">Elige un escenario y pulsa «Ejecutar traceroute».</div>
    <div class="hfinfo" id="trExp" role="status" aria-live="polite"></div></div>`,
  cards: [
    ['ICMP', 'Protocolo auxiliar de IP que informa errores y permite diagnosticar la red.'],
    ['Echo Request', 'Mensaje de «¿estás ahí?» que envía ping.'],
    ['Echo Reply', 'Respuesta del destino al eco.'],
    ['Destino inalcanzable', 'Mensaje ICMP que dice que un paquete no pudo entregarse y por qué.'],
    ['Tiempo excedido', 'Mensaje ICMP enviado cuando el TTL de un paquete llega a 0.'],
    ['RTT', 'Tiempo de ida y vuelta de un paquete.'],
    ['Traceroute', 'Herramienta que lista los routers del camino subiendo el TTL.'],
    ['ICMPv6', 'Versión para IPv6; además de errores, incluye el descubrimiento de vecinos.']
  ],
  need: 5,
  quiz: [
    { q: '¿Para qué sirve principalmente ICMP?', o: ['Informar errores y permitir diagnosticar la red', 'Corregir los errores y volver a enviar los paquetes', 'Asignar direcciones IP a los equipos', 'Cifrar los paquetes IP'], c: 0, e: 'ICMP informa y diagnostica, pero no corrige ni garantiza entregas.' },
    { q: 'Ping utiliza los mensajes…', o: ['Echo Request y Echo Reply', 'Time Exceeded y Redirect', 'Parameter Problem y Echo Reply', 'Destination Unreachable únicamente'], c: 0, e: 'Ping envía Echo Request (tipo 8) y espera Echo Reply (tipo 0).' },
    { q: 'Traceroute logra identificar a cada router del camino porque…', o: ['Cada router responde «Tiempo excedido» cuando el TTL llega a 0', 'Cada router guarda una copia de todos los paquetes', 'El destino envía la lista completa de routers', 'Usa broadcast para preguntar a todos los routers'], c: 0, e: 'Traceroute envía paquetes con TTL 1, 2, 3… y cada router donde el TTL expira responde con ICMP tipo 11.' },
    { q: 'En un ping aparece «Tiempo de espera agotado». ¿Qué es correcto afirmar?', o: ['No llegó respuesta; puede haber un firewall, pérdida o un equipo apagado', 'Es un mensaje ICMP tipo 3 enviado por el destino', 'El destino ejecutó traceroute', 'La IP es privada'], c: 0, e: 'El tiempo agotado es ausencia de respuesta, no un mensaje ICMP.' },
    { q: 'Verdadero o falso: ICMPv6 es opcional y se puede bloquear por completo sin afectar a IPv6.', o: ['Verdadero', 'Falso'], c: 1, e: 'ICMPv6 es indispensable: lo usan, entre otras cosas, el descubrimiento de vecinos y el aviso de «paquete demasiado grande».' },
    { q: 'El ping al gateway funciona, pero el ping a una IP de Internet falla. ¿Dónde buscarías primero?', o: ['En la salida hacia Internet: rutas o proveedor', 'En la tarjeta de red del equipo', 'En la pila TCP/IP local', 'En el cable de tu propio equipo'], c: 0, e: 'Si el gateway responde, la red local funciona; el problema está más allá, en la ruta o en el proveedor.' }
  ],
  _f: { ping: new Set(), trace: false },
  _check() { if (this._f.ping.size >= 3 && this._f.trace) award('u5_sim'); },
  init(s) {
    const self = this;
    const cl = (c, t) => `<span class="${c}">${t}</span>`;
    let busy = false;
    $('pgGo').onclick = async () => {
      if (busy) return; busy = true; $('pgGo').disabled = true;
      const k = $('pgSel').value, h = PING_HOSTS[k]; let out = `Haciendo ping a ${h.ip} con 32 bytes de datos:\n`; $('pgOut').innerHTML = out; $('pgExp').textContent = '';
      let rt = [];
      for (let i = 0; i < 4; i++) {
        await sleep(450);
        if (h.kind === 'ok') { const t = h.rtt[0] === 0 ? 0 : ri(h.rtt[0], h.rtt[1]); rt.push(t); out += cl('g', `Respuesta desde ${h.ip}: bytes=32 tiempo=${t < 1 ? '<1' : t}ms TTL=${h.ttl}`) + '\n'; }
        else if (h.kind === 'net') out += cl('r', `Respuesta desde ${h.via}: Red de destino inaccesible.`) + '\n';
        else if (h.kind === 'host') out += cl('r', `Respuesta desde ${h.via}: Host de destino inaccesible.`) + '\n';
        else out += cl('y', 'Tiempo de espera agotado para esta solicitud.') + '\n';
        $('pgOut').innerHTML = out; sfx.hop();
      }
      const rec = h.kind === 'ok' ? 4 : 0;
      out += `\nEstadísticas de ping para ${h.ip}:\n    Paquetes: enviados = 4, recibidos = ${rec}, perdidos = ${4 - rec} (${(4 - rec) * 25}% perdidos)`;
      if (rt.length && rt[0] !== undefined && h.rtt[1] > 0) out += `\nTiempos aproximados de ida y vuelta: mínimo = ${Math.min(...rt)}ms, máximo = ${Math.max(...rt)}ms, media = ${Math.round(rt.reduce((a, b) => a + b, 0) / rt.length)}ms`;
      $('pgOut').innerHTML = out; $('pgExp').innerHTML = `<b>Interpretación.</b> ${h.expl}`; pop($('pgExp'));
      busy = false; $('pgGo').disabled = false; self._f.ping.add(k); self._check();
    };
    $('trGo').onclick = async () => {
      if (busy) return; busy = true; $('trGo').disabled = true;
      const T = TRACE[$('trSel').value]; let out = `Traza a ${T.dest} con un máximo de 30 saltos:\n\n`; $('trOut').innerHTML = out; $('trExp').textContent = '';
      for (let i = 0; i < T.hops.length; i++) {
        await sleep(650); const h = T.hops[i];
        if (!h) out += cl('y', `${String(i + 1).padStart(2)}     *        *        *     Tiempo de espera agotado.`) + '\n';
        else { const a = h[1]; out += `${String(i + 1).padStart(2)}   ${String(a + ri(0, 2)).padStart(4)} ms ${String(a + ri(0, 3)).padStart(4)} ms ${String(a + ri(1, 4)).padStart(4)} ms  ${h[0]}\n`; }
        $('trOut').innerHTML = out; sfx.hop();
      }
      if (T.stop) { await sleep(500); out += cl('r', `${String(T.hops.length + 1).padStart(2)}  ${T.stop}  informa: Red de destino inaccesible.`) + '\n'; }
      out += '\n' + (T.stop ? cl('r', 'Traza interrumpida.') : cl('g', 'Traza completa.')); $('trOut').innerHTML = out;
      $('trExp').innerHTML = `<b>Interpretación.</b> ${T.expl}`; pop($('trExp'));
      busy = false; $('trGo').disabled = false; self._f.trace = true; self._check();
    };
  }
});

