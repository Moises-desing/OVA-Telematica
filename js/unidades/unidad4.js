/* =========================================================
   UNIDAD 4 · Protocolos de Internet: IPv4 e IPv6  (Carlos Eduardo Garavito Mozo: IPv4 · Junior Madera: IPv6)
   ========================================================= */
const H4 = [
  [['ver', 'Versión', 4, '4 bits'], ['ihl', 'IHL', 4, '4 bits'], ['tos', 'DSCP / ECN', 8, '8 bits'], ['len', 'Longitud total', 16, '16 bits']],
  [['id', 'Identificación', 16, '16 bits'], ['flags', 'Flags', 3, '3 bits'], ['frag', 'Desplaz. fragmento', 13, '13 bits']],
  [['ttl', 'TTL', 8, '8 bits'], ['proto', 'Protocolo', 8, '8 bits'], ['chk', 'Checksum del encabezado', 16, '16 bits']],
  [['src', 'Dirección IP de origen', 32, '32 bits']],
  [['dst', 'Dirección IP de destino', 32, '32 bits']],
  [['opt', 'Opciones y relleno (variable)', 32, '0 a 40 bytes']],
  [['data', 'Datos (carga útil)', 32, 'variable']]
];
const H6 = [
  [['ver', 'Versión', 4, '4 bits'], ['tc', 'Clase de tráfico', 8, '8 bits'], ['fl', 'Etiqueta de flujo', 20, '20 bits']],
  [['pl', 'Longitud de la carga útil', 16, '16 bits'], ['nh', 'Siguiente encabezado', 8, '8 bits'], ['hl', 'Límite de saltos', 8, '8 bits']],
  [['src', 'Dirección IPv6 de origen', 32, '128 bits (4 filas)']],
  [['dst', 'Dirección IPv6 de destino', 32, '128 bits (4 filas)']],
  [['data', 'Encabezados de extensión y datos', 32, 'variable']]
];
const HDESC = {
  4: {
    ver: ['Versión', 'Vale 4 en IPv4. Le dice al receptor cómo interpretar el resto del encabezado.'],
    ihl: ['IHL (longitud del encabezado)', 'Indica la longitud del encabezado en palabras de 32 bits. Mínimo 5 (20 bytes) y máximo 15 (60 bytes), porque puede haber opciones.'],
    tos: ['DSCP / ECN', 'Marca la clase de servicio (prioridad) y avisa de congestión. Antes se llamaba «Tipo de servicio».'],
    len: ['Longitud total', 'Tamaño del datagrama completo (encabezado + datos) en bytes. Máximo 65 535.'],
    id: ['Identificación', 'Número que comparten todos los fragmentos de un mismo datagrama original, para poder reensamblarlos.'],
    flags: ['Flags', '3 bits: uno reservado, DF («no fragmentar») y MF («hay más fragmentos»).'],
    frag: ['Desplazamiento de fragmento', 'Posición del fragmento dentro del datagrama original, medida en bloques de 8 bytes.'],
    ttl: ['TTL (tiempo de vida)', 'Cada router lo reduce en 1. Si llega a 0, el paquete se descarta y se avisa con ICMP «Tiempo excedido». Evita que un paquete circule para siempre en un bucle.'],
    proto: ['Protocolo', 'Indica qué protocolo de la capa superior viaja en los datos: 1 = ICMP, 6 = TCP, 17 = UDP.'],
    chk: ['Checksum del encabezado', 'Detecta errores solo en el encabezado. Se recalcula en cada router porque el TTL cambia.'],
    src: ['Dirección IP de origen', 'Dirección de 32 bits del equipo que envió el paquete.'],
    dst: ['Dirección IP de destino', 'Dirección de 32 bits del equipo al que va dirigido; con ella los routers consultan su tabla.'],
    opt: ['Opciones y relleno', 'Campo poco usado (registro de ruta, marcas de tiempo…). Se rellena con ceros hasta completar palabras de 32 bits.'],
    data: ['Datos', 'La carga útil: un segmento TCP, un datagrama UDP, un mensaje ICMP…']
  },
  6: {
    ver: ['Versión', 'Vale 6 en IPv6.'],
    tc: ['Clase de tráfico', 'Equivale al DSCP/ECN de IPv4: prioridad y notificación de congestión.'],
    fl: ['Etiqueta de flujo', 'Identifica paquetes de un mismo «flujo» (por ejemplo, una videollamada) para que los routers les den trato uniforme.'],
    pl: ['Longitud de la carga útil', 'Tamaño en bytes de lo que va después del encabezado base de 40 bytes.'],
    nh: ['Siguiente encabezado', 'Hace el papel del campo «Protocolo» de IPv4 (6 = TCP, 17 = UDP, 58 = ICMPv6) o apunta a un encabezado de extensión.'],
    hl: ['Límite de saltos', 'Equivale al TTL de IPv4: cada router lo reduce en 1 y descarta el paquete al llegar a 0.'],
    src: ['Dirección de origen', 'Dirección de 128 bits del emisor.'],
    dst: ['Dirección de destino', 'Dirección de 128 bits del receptor.'],
    data: ['Extensión y datos', 'IPv6 mueve las opciones a «encabezados de extensión» opcionales encadenados, y luego van los datos.']
  }
};
function hdrHtml(ver, ids) {
  const rows = ver === 4 ? H4 : H6;
  const sc = '<div class="scale" aria-hidden="true"><span>0</span><span>8</span><span>16</span><span>24</span><span style="text-align:right;flex:.3">31</span></div>';
  return sc + rows.map(r => `<div class="hrow">${r.map(f => `<button type="button" class="hf" data-f="${f[0]}" style="--w:${f[2]}" ${ids ? '' : `aria-label="${f[1]}, ${f[3]}"`}>${f[1]}<small>${f[3]}</small></button>`).join('')}</div>`).join('');
}
const V6EX = ['2001:db8:0:0:0:ff00:42:8329', 'fe80::1', '2001:0db8:85a3:0000:0000:8a2e:0370:7334', '::1', 'fd12:3456:789a:1::10'];
UNITS.push({
  id: 'u4', n: 4, color: '--m4', owner: 'Carlos Eduardo Garavito Mozo (IPv4) y Junior Madera (IPv6)',
  title: 'Protocolos de Internet: IPv4 e IPv6',
  obj: 'Reconocer las características y el encabezado de IPv4 e IPv6, clasificar y calcular direcciones, abreviar direcciones IPv6 y explicar cómo conviven ambos protocolos.',
  lessons: [
    {
      part: 'Parte A · IPv4 · Carlos Eduardo Garavito Mozo', t: 'Características de IPv4', h: `<p><b>IPv4</b> (RFC 791, 1981) es la versión del protocolo IP que sostiene la mayor parte de Internet.</p>
      <ul><li>Direcciones de <b>32 bits</b>: en total 2<sup>32</sup> = 4 294 967 296 direcciones.</li><li>Protocolo <b>sin conexión</b> y de <b>mejor esfuerzo</b>.</li><li>Encabezado de <b>20 a 60 bytes</b> (20 sin opciones).</li><li>Admite <b>fragmentación</b>: si un paquete es mayor que la MTU del enlace, se divide en fragmentos.</li><li>Incluye <b>checksum</b> del encabezado y direcciones de <b>broadcast</b>.</li></ul>
      <p>Las direcciones públicas libres se agotaron (la reserva central de IANA se acabó en 2011). Para estirar su vida se usan <b>CIDR</b>, <b>DHCP</b> y <b>NAT</b>; la solución de fondo es IPv6.</p>`},
    {
      part: 'Parte A · IPv4 · Carlos Eduardo Garavito Mozo', t: 'Estructura del datagrama IPv4', h: `<p>Un datagrama IPv4 es un encabezado seguido de datos. El encabezado se dibuja en filas de 32 bits. <b>Explóralo en el simulador «Encabezados IP»</b> y pulsa cada campo.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Campo</th><th>Para qué sirve (resumen)</th></tr></thead><tbody>
      <tr><td><b>Versión, IHL</b></td><td>Versión del protocolo y longitud del encabezado.</td></tr>
      <tr><td><b>Longitud total</b></td><td>Tamaño de todo el datagrama.</td></tr>
      <tr><td><b>Identificación, Flags, Desplazamiento</b></td><td>Fragmentación y reensamblado.</td></tr>
      <tr><td><b>TTL</b></td><td>Evita bucles infinitos.</td></tr>
      <tr><td><b>Protocolo</b></td><td>A quién entregar los datos (TCP, UDP, ICMP).</td></tr>
      <tr><td><b>Checksum</b></td><td>Detección de errores del encabezado.</td></tr>
      <tr><td><b>IP origen y destino</b></td><td>Quién envía y a quién va.</td></tr></tbody></table></div>`},
    {
      part: 'Parte A · IPv4 · Carlos Eduardo Garavito Mozo', t: 'Direccionamiento IPv4', h: `<p>Una dirección IPv4 se escribe en <b>notación decimal con puntos</b>: cuatro números de 0 a 255 (cada uno es un octeto de 8 bits). Tiene una parte de <b>red</b> y otra de <b>host</b>; la <b>máscara</b> (o prefijo <span class="mono">/n</span>, notación CIDR) indica dónde termina la red.</p>
      <ul><li><b>Dirección de red:</b> todos los bits de host en 0.</li><li><b>Dirección de broadcast:</b> todos los bits de host en 1.</li><li><b>Hosts utilizables:</b> 2<sup>h</sup> − 2, donde h son los bits de host.</li></ul>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Bloque especial</th><th>Uso</th></tr></thead><tbody>
      <tr><td class="m">0.0.0.0/8</td><td>«Esta red» / dirección no especificada</td></tr>
      <tr><td class="m">127.0.0.0/8</td><td>Loopback (el equipo consigo mismo)</td></tr>
      <tr><td class="m">169.254.0.0/16</td><td>Link-local (autoconfiguración cuando no hay DHCP)</td></tr>
      <tr><td class="m">224.0.0.0/4</td><td>Multidifusión</td></tr>
      <tr><td class="m">240.0.0.0/4</td><td>Reservado</td></tr>
      <tr><td class="m">255.255.255.255</td><td>Broadcast limitado (solo la red local)</td></tr></tbody></table></div>
      <details class="more"><summary>Más información: las clases históricas</summary><p>Antes de CIDR, las redes se dividían en clases según el primer octeto: A (1–126, /8), B (128–191, /16), C (192–223, /24), D (224–239, multidifusión) y E (240–255, reservada). Hoy se usan prefijos de cualquier longitud, pero las clases siguen apareciendo en el vocabulario.</p></details>
      <p>Prueba cualquier dirección en la <b>calculadora IPv4</b> más abajo.</p>`},
    {
      part: 'Parte A · IPv4 · Carlos Eduardo Garavito Mozo', t: 'Direcciones públicas y privadas', h: `<p>Una dirección <b>pública</b> es única en Internet y la asigna el proveedor (ISP) a partir de bloques repartidos por IANA y los registros regionales. Una dirección <b>privada</b> solo vale dentro de una red local: cualquier organización puede reutilizarlas, y los routers de Internet no las enrutan.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Bloque privado (RFC 1918)</th><th>Rango</th><th>Tamaño</th></tr></thead><tbody>
      <tr><td class="m">10.0.0.0/8</td><td class="m">10.0.0.0 – 10.255.255.255</td><td>16 777 216</td></tr>
      <tr><td class="m">172.16.0.0/12</td><td class="m">172.16.0.0 – 172.31.255.255</td><td>1 048 576</td></tr>
      <tr><td class="m">192.168.0.0/16</td><td class="m">192.168.0.0 – 192.168.255.255</td><td>65 536</td></tr></tbody></table></div>
      <p>Para que un equipo con IP privada llegue a Internet, el router hace <b>NAT</b> (traducción de direcciones): cambia la IP privada de origen por una pública y, normalmente, también el puerto, para poder distinguir las conversaciones. Por eso miles de casas pueden usar 192.168.1.x al mismo tiempo.</p>
      <div class="story"><b>Analogía.</b> Es como un edificio con una sola dirección postal: dentro, cada apartamento tiene su número interno (IP privada); la portería (NAT) recibe y reparte la correspondencia.</div>`},
    {
      part: 'Parte A · IPv4 · Carlos Eduardo Garavito Mozo', t: 'Conceptos básicos de subredes', h: `<p>Una <b>subred</b> es una red más pequeña obtenida al dividir una red mayor. Se logra «tomando prestados» bits de la parte de host y pasándolos a la de red (el prefijo crece).</p>
      <ul><li>Cada bit prestado <b>duplica</b> el número de subredes y <b>reduce a la mitad</b> el tamaño de cada una.</li><li>Con <i>b</i> bits prestados hay 2<sup>b</sup> subredes.</li></ul>
      <p><b>Ejemplo.</b> Dividir 192.168.10.0/24 en 4 subredes necesita 2 bits (2² = 4) y el prefijo pasa a /26. Cada subred tiene 64 direcciones (62 utilizables):</p>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Subred</th><th>Red</th><th>Rango de hosts</th><th>Broadcast</th></tr></thead><tbody>
      <tr><td>1</td><td class="m">192.168.10.0/26</td><td class="m">.1 – .62</td><td class="m">.63</td></tr>
      <tr><td>2</td><td class="m">192.168.10.64/26</td><td class="m">.65 – .126</td><td class="m">.127</td></tr>
      <tr><td>3</td><td class="m">192.168.10.128/26</td><td class="m">.129 – .190</td><td class="m">.191</td></tr>
      <tr><td>4</td><td class="m">192.168.10.192/26</td><td class="m">.193 – .254</td><td class="m">.255</td></tr></tbody></table></div>
      <p>Verifícalo en la calculadora IPv4 con la opción «dividir en subredes».</p>`},
    {
      part: 'Parte B · IPv6 · Junior Madera', t: 'Características de IPv6', h: `<p><b>IPv6</b> (RFC 8200) nació para resolver el agotamiento de IPv4 y simplificar el trabajo de los routers.</p>
      <ul><li>Direcciones de <b>128 bits</b>: unas 3,4 × 10<sup>38</sup>.</li><li>Encabezado base <b>fijo de 40 bytes</b>, sin checksum y con campos más simples; lo opcional va en <b>encabezados de extensión</b>.</li><li><b>Los routers no fragmentan</b>: solo el origen puede hacerlo; si un paquete es muy grande, el router lo descarta y avisa con ICMPv6 «Packet Too Big». La MTU mínima es 1280 bytes.</li><li>Sin broadcast: usa <b>multicast</b> y <b>anycast</b>.</li><li><b>Autoconfiguración</b>: SLAAC (el host se arma su dirección con el prefijo anunciado por el router) y DHCPv6.</li><li>Diseñado para conectividad de extremo a extremo, sin necesidad de NAT, y con soporte de IPsec.</li></ul>`},
    {
      part: 'Parte B · IPv6 · Junior Madera', t: 'Estructura del encabezado IPv6', h: `<p>El encabezado base de IPv6 mide siempre <b>40 bytes</b> y tiene solo 8 campos. Frente a IPv4 se eliminaron IHL, identificación, flags, desplazamiento, checksum y opciones; el TTL pasó a llamarse <b>límite de saltos</b> y «Protocolo» pasó a ser <b>siguiente encabezado</b>.</p>
      <p>Explóralo con el interruptor <b>IPv6</b> del simulador «Encabezados IP».</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>IPv4</th><th>IPv6</th></tr></thead><tbody>
      <tr><td>TTL</td><td>Límite de saltos</td></tr><tr><td>Protocolo</td><td>Siguiente encabezado</td></tr><tr><td>DSCP / ECN</td><td>Clase de tráfico</td></tr><tr><td>Longitud total</td><td>Longitud de la carga útil (no cuenta el encabezado base)</td></tr><tr><td>Checksum, IHL, fragmentación</td><td>Eliminados del encabezado base</td></tr><tr><td>(no existe)</td><td>Etiqueta de flujo</td></tr></tbody></table></div>`},
    {
      part: 'Parte B · IPv6 · Junior Madera', t: 'Representación de direcciones IPv6', h: `<p>Una dirección IPv6 se escribe como <b>8 grupos de 16 bits</b> en hexadecimal, separados por dos puntos:</p>
      <p class="mono" style="overflow-wrap:anywhere">2001:0db8:0000:0000:0000:ff00:0042:8329</p>
      <p>Se puede abreviar con dos reglas:</p>
      <ol><li>Quitar los <b>ceros a la izquierda</b> de cada grupo: <span class="mono">0db8 → db8</span>, <span class="mono">0042 → 42</span>.</li><li>Reemplazar <b>una sola</b> secuencia de grupos consecutivos de ceros por <span class="mono">::</span> (se elige la más larga; no se puede usar dos veces).</li></ol>
      <p>Resultado: <span class="mono">2001:db8::ff00:42:8329</span>. El prefijo se escribe como en IPv4: <span class="mono">2001:db8:abcd:1::/64</span> significa 64 bits de red y 64 bits para el identificador de interfaz.</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th>Tipo</th><th>Prefijo</th><th>Uso</th></tr></thead><tbody>
      <tr><td>Unicast global</td><td class="m">2000::/3</td><td>Direcciones públicas enrutables</td></tr>
      <tr><td>Link-local</td><td class="m">fe80::/10</td><td>Solo dentro del enlace; toda interfaz tiene una</td></tr>
      <tr><td>Local única (ULA)</td><td class="m">fc00::/7</td><td>Equivalente a las privadas de IPv4</td></tr>
      <tr><td>Multicast</td><td class="m">ff00::/8</td><td>Un emisor, varios receptores</td></tr>
      <tr><td>Loopback</td><td class="m">::1</td><td>El equipo consigo mismo</td></tr></tbody></table></div>
      <p>Prueba abreviar y expandir direcciones en la <b>herramienta IPv6</b> más abajo.</p>`},
    {
      part: 'Parte B · IPv6 · Junior Madera', t: 'Diferencias entre IPv4 e IPv6', h: `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>IPv4</th><th>IPv6</th></tr></thead><tbody>
      <tr><td><b>Tamaño de dirección</b></td><td>32 bits</td><td>128 bits</td></tr>
      <tr><td><b>Notación</b></td><td>Decimal con puntos (192.168.1.10)</td><td>Hexadecimal con «:» (2001:db8::1)</td></tr>
      <tr><td><b>Encabezado</b></td><td>20 a 60 bytes, variable</td><td>40 bytes, fijo</td></tr>
      <tr><td><b>Checksum</b></td><td>Sí</td><td>No (lo cubren las capas superior e inferior)</td></tr>
      <tr><td><b>Fragmentación</b></td><td>Origen y routers</td><td>Solo el origen</td></tr>
      <tr><td><b>Broadcast</b></td><td>Sí</td><td>No: multicast y anycast</td></tr>
      <tr><td><b>Configuración</b></td><td>Manual o DHCP</td><td>SLAAC, DHCPv6 o manual</td></tr>
      <tr><td><b>NAT</b></td><td>Muy común</td><td>Innecesario en principio</td></tr>
      <tr><td><b>Descubrir vecinos</b></td><td>ARP</td><td>Neighbor Discovery (ICMPv6)</td></tr>
      <tr><td><b>IPsec</b></td><td>Opcional</td><td>Diseñado para soportarlo</td></tr></tbody></table></div>`},
    {
      part: 'Parte B · IPv6 · Junior Madera', t: 'Coexistencia y transición', h: `<p>IPv4 e IPv6 no son compatibles entre sí: un equipo solo IPv6 no puede hablar directamente con uno solo IPv4. Como no se puede cambiar toda Internet de golpe, se usan tres estrategias:</p>
      <div class="grid"><div class="card" style="--mc:var(--m4)"><span class="tag">DOBLE PILA</span><p>El equipo o router habla <b>IPv4 e IPv6 a la vez</b>, con direcciones de ambos. Es el método más usado.</p></div>
      <div class="card" style="--mc:var(--m2)"><span class="tag">TÚNELES</span><p>Los paquetes IPv6 viajan <b>encapsulados dentro de paquetes IPv4</b> para cruzar redes que aún no soportan IPv6 (por ejemplo, 6in4).</p></div>
      <div class="card" style="--mc:var(--m3)"><span class="tag">TRADUCCIÓN</span><p>Un traductor (<b>NAT64</b> con DNS64) permite que clientes solo IPv6 accedan a servidores IPv4.</p></div></div>
      <div class="story"><b>Analogía.</b> Doble pila es ser bilingüe; el túnel es meter una carta escrita en un idioma dentro de un sobre del otro país; la traducción es contratar un intérprete.</div>`}
  ],
  widgets: `
  <div class="card hdrx"><span class="tag">SIMULADOR · ENCABEZADOS IP</span><h3 style="margin-top:0">Explora el encabezado campo por campo</h3>
    <div class="seg" role="group" aria-label="Versión de IP" id="hdVer"><button type="button" data-v="4" aria-pressed="true">IPv4</button><button type="button" data-v="6" aria-pressed="false">IPv6</button></div>
    <div id="hdGrid" style="margin-top:14px"></div>
    <div class="hfinfo" id="hdInfo" role="status" aria-live="polite">Pulsa un campo para ver qué hace.</div>
    <p class="hint" id="hdCnt"></p></div>
  <div class="card"><span class="tag">HERRAMIENTA · IPv4</span><h3 style="margin-top:0">Calculadora de direcciones y subredes</h3>
    <div class="row"><div style="flex:1 1 220px"><label for="tIp">Dirección IPv4</label><input id="tIp" type="text" inputmode="decimal" value="192.168.10.77" autocomplete="off"></div>
    <div style="flex:1 1 260px"><label for="tP">Prefijo <b id="tPv" class="mono">/24</b></label><input id="tP" type="range" min="1" max="30" value="24" style="width:100%"></div></div>
    <p class="bad" id="tErr" role="alert"></p>
    <div id="tBin" class="mono" style="overflow-x:auto;white-space:nowrap;margin:6px 0"></div>
    <div class="legend"><span><i style="background:var(--net)"></i>bits de red</span><span><i style="background:var(--host)"></i>bits de host</span></div>
    <div class="res" id="tRes"></div>
    <div class="row" style="margin-top:14px;align-items:flex-end"><div style="max-width:220px"><label for="tN">Dividir la red en…</label><select id="tN"><option value="1">(no dividir)</option><option value="2">2 subredes</option><option value="4">4 subredes</option><option value="8">8 subredes</option><option value="16">16 subredes</option></select></div></div>
    <div class="tblwrap"><table class="tbl" id="tSub"></table></div></div>
  <div class="card"><span class="tag">HERRAMIENTA · IPv6</span><h3 style="margin-top:0">Abreviar y expandir direcciones IPv6</h3>
    <div class="row"><div style="flex:1 1 320px"><label for="t6">Dirección IPv6</label><input id="t6" type="text" value="2001:0db8:0000:0000:0000:ff00:0042:8329" autocomplete="off" spellcheck="false"></div></div>
    <div class="opts" style="justify-content:flex-start;margin-top:8px" id="t6ex"></div>
    <p class="bad" id="t6Err" role="alert"></p>
    <div class="res" id="t6Res" style="grid-template-columns:1fr"></div></div>`,
  cards: [
    ['IPv4', 'Protocolo IP con direcciones de 32 bits; el más extendido hoy.'],
    ['TTL', 'Contador que baja 1 en cada router; en 0 el paquete se descarta.'],
    ['Dirección privada', 'IP de uso interno (10/8, 172.16/12, 192.168/16), no enrutable en Internet.'],
    ['NAT', 'Traducción de direcciones privadas a públicas en el router de borde.'],
    ['Subred', 'Red más pequeña obtenida al dividir una mayor con bits prestados.'],
    ['IPv6', 'Protocolo IP con direcciones de 128 bits y encabezado fijo de 40 bytes.'],
    ['Doble pila', 'Equipo o router con IPv4 e IPv6 activos al mismo tiempo.'],
    ['Túnel', 'Paquetes de un protocolo encapsulados dentro del otro para cruzar una red.']
  ],
  need: 6,
  quiz: [
    { q: '¿Cuántos bits tiene una dirección IPv4?', o: ['16', '32', '64', '128'], c: 1, e: 'IPv4 usa 32 bits, es decir, cuatro octetos.' },
    { q: '¿Qué campo del encabezado IPv4 evita que un paquete circule indefinidamente en un bucle?', o: ['Identificación', 'Checksum', 'TTL', 'Protocolo'], c: 2, e: 'El TTL baja 1 en cada router; al llegar a 0 el paquete se descarta.' },
    { q: '¿Cuál de estas direcciones es privada?', o: ['172.20.5.9', '172.32.5.9', '8.8.8.8', '192.169.1.1'], c: 0, e: 'El bloque privado 172.16.0.0/12 abarca de 172.16.x.x a 172.31.x.x. Las demás son públicas.' },
    { q: 'Se divide 192.168.10.0/24 en 4 subredes iguales. ¿Qué prefijo y cuántos hosts utilizables tiene cada una?', o: ['/25 con 126', '/26 con 62', '/27 con 30', '/26 con 64'], c: 1, e: 'Se prestan 2 bits (2² = 4): /26. Quedan 6 bits de host: 2⁶ − 2 = 62 utilizables.' },
    { q: 'Verdadero o falso: el encabezado base de IPv6 incluye un checksum, igual que IPv4.', o: ['Verdadero', 'Falso'], c: 1, e: 'IPv6 eliminó el checksum del encabezado para acelerar el trabajo de los routers.' },
    { q: '¿Cuál es la forma abreviada correcta de 2001:0db8:0000:0000:0000:0000:0000:0001?', o: ['2001:db8:0:0:0:0:0:1', '2001:db8::1', '2001::db8::1', '2001:db8:1'], c: 1, e: 'Se quitan ceros a la izquierda y la secuencia de grupos en cero se reemplaza por «::» una sola vez.' },
    { q: 'Una red ya tiene IPv4 y quiere que sus equipos alcancen servidores IPv6. ¿Qué estrategia es la más usada para lograrlo?', o: ['Doble pila', 'Desactivar IPv4', 'Subir el TTL', 'Usar solo broadcast'], c: 0, e: 'Con doble pila cada equipo tiene ambas direcciones y usa la que convenga.' },
    { q: '¿Cuántos bytes mide el encabezado base de IPv6?', o: ['20', '32', '40', '60'], c: 2, e: 'El encabezado base de IPv6 es fijo: 40 bytes.' }
  ],
  _f: new Set(),
  init(s) {
    const self = this;
    /* encabezados */
    let ver = 4;
    const info = (v, f) => { const d = HDESC[v][f]; $('hdInfo').innerHTML = `<b>${d[0]}.</b> ${d[1]}`; };
    function drawHdr() {
      $('hdGrid').innerHTML = hdrHtml(ver);
      $('hdCnt').textContent = `Campos explorados: ${self._f.size} (explora 5 para completar el simulador).`;
    }
    $('hdGrid').addEventListener('click', e => { const b = e.target.closest('.hf'); if (!b) return; $('hdGrid').querySelectorAll('.hf').forEach(x => x.classList.toggle('sel', x === b)); info(ver, b.dataset.f); self._f.add(ver + b.dataset.f); $('hdCnt').textContent = `Campos explorados: ${self._f.size} (explora 5 para completar el simulador).`; sfx.tick(); if (self._f.size >= 5) award('u4_sim'); });
    $('hdVer').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; ver = +b.dataset.v; $('hdVer').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); $('hdInfo').textContent = 'Pulsa un campo para ver qué hace.'; drawHdr(); sfx.tick(); });
    drawHdr();
    /* calculadora IPv4 */
    const bits = (val, p) => intToOct(val).map((o, k) => [...pad8(o)].map((c, j) => `<span style="color:var(--${k * 8 + j < p ? 'net' : 'host'})">${c}</span>`).join('')).join('.');
    function calc() {
      const p = +$('tP').value; $('tPv').textContent = '/' + p; $('tP').style.setProperty('--pct', ((p - 1) / 29 * 100) + '%');
      const o = parseIp($('tIp').value);
      if (!o) { $('tErr').textContent = 'Escribe 4 números entre 0 y 255 separados por puntos.'; $('tRes').innerHTML = ''; $('tBin').innerHTML = ''; $('tSub').innerHTML = ''; return; }
      $('tErr').textContent = '';
      const r = calcNet(o, p), c = classify(o);
      $('tBin').innerHTML = `IP&nbsp;&nbsp;&nbsp;&nbsp;${bits(r.ip, p)}<br>Másc. ${bits(r.m, p)}`;
      $('tRes').innerHTML = `<div><small>Tipo</small><b style="font-size:.85rem">${c.kind}</b></div><div><small>Clase histórica</small><b>${c.cls}</b></div><div><small>Máscara</small><b>${intToIp(r.m)}</b></div><div><small>Red</small><b>${intToIp(r.net)}</b></div><div><small>Broadcast</small><b>${intToIp(r.bc)}</b></div><div><small>Hosts utilizables</small><b>${fmt(r.hosts)}</b></div><div><small>Primer / último host</small><b style="font-size:.85rem">${intToIp(r.first)} – ${intToIp(r.last)}</b></div>`;
      const n = +$('tN').value;
      if (n === 1) { $('tSub').innerHTML = ''; return; }
      const sp = splitSubnets([...intToOct(r.net)], p, n);
      if (!sp) { $('tSub').innerHTML = '<tbody><tr><td class="bad">Con este prefijo no se pueden crear tantas subredes con hosts utilizables. Reduce el prefijo o las subredes.</td></tr></tbody>'; return; }
      $('tSub').innerHTML = `<thead><tr><th>#</th><th>Red</th><th>Primer host</th><th>Último host</th><th>Broadcast</th></tr></thead><tbody>${sp.list.map((x, i) => `<tr><td>${i + 1}</td><td class="m"><b>${intToIp(x.net)}/${sp.newP}</b></td><td class="m">${intToIp(x.first)}</td><td class="m">${intToIp(x.last)}</td><td class="m">${intToIp(x.bc)}</td></tr>`).join('')}</tbody>`;
    }
    ['tIp', 'tP', 'tN'].forEach(i => $(i).addEventListener('input', calc)); calc();
    /* herramienta IPv6 */
    $('t6ex').innerHTML = V6EX.map(x => `<button class="btn alt sm" type="button" data-e="${x}">${x.length > 22 ? x.slice(0, 20) + '…' : x}</button>`).join('');
    $('t6ex').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { $('t6').value = b.dataset.e; run6(); sfx.tick(); } });
    function run6() {
      const g = v6Expand($('t6').value);
      if (!g) { $('t6Err').textContent = 'No es una dirección IPv6 válida: usa hasta 8 grupos de 1 a 4 dígitos hexadecimales y como máximo un «::».'; $('t6Res').innerHTML = ''; return; }
      $('t6Err').textContent = '';
      $('t6Res').innerHTML = `<div><small>Expandida (8 grupos de 16 bits)</small><b>${g.join(':')}</b></div><div><small>Abreviada</small><b>${v6Compress(g)}</b></div><div><small>Tipo</small><b style="font-size:.88rem">${v6Type(g)}</b></div><div><small>Prefijo /64 (red) · identificador de interfaz (host)</small><b style="font-size:.85rem">${g.slice(0, 4).join(':')} · ${g.slice(4).join(':')}</b></div>`;
    }
    $('t6').addEventListener('input', run6); run6();
  }
});

