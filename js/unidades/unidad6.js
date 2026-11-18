/* =========================================================
   UNIDAD 6 · Enrutamiento en Internet  (Moisés Montiel)
   ========================================================= */
const RT_TABLE = [
  {dest: '10.0.0.0/8', nh: '192.168.1.2', iface: 'eth0', proto: 'OSPF'},
  {dest: '10.20.0.0/16', nh: '192.168.1.3', iface: 'eth0', proto: 'OSPF'},
  {dest: '10.20.30.0/24', nh: '192.168.2.2', iface: 'eth1', proto: 'estática'},
  {dest: '172.16.0.0/12', nh: '192.168.2.3', iface: 'eth1', proto: 'RIP'},
  {dest: '192.168.1.0/24', nh: 'directamente conectada', iface: 'eth0', proto: 'conectada'},
  {dest: '0.0.0.0/0', nh: '192.168.1.1', iface: 'eth0', proto: 'estática (por defecto)'}
];
const G_NODES = ['A', 'B', 'C', 'D', 'E', 'F'];
const G_POS = {A: [60, 120], B: [190, 50], C: [190, 190], D: [340, 50], E: [340, 190], F: [470, 120]};
const G_EDGES0 = [['A', 'B', 2], ['A', 'C', 5], ['B', 'C', 1], ['B', 'D', 4], ['C', 'E', 3], ['D', 'E', 1], ['D', 'F', 5], ['E', 'F', 2]];
function asFig(){
  let s = svgOpen(600, 230, 'Tres sistemas autónomos conectados con BGP; dentro de cada uno se usa un protocolo interno como OSPF');
  const as = [[20, 'AS 64500', 'var(--m1)', [[60, 90], [120, 140], [70, 160]]], [220, 'AS 64501', 'var(--m2)', [[260, 70], [330, 120], [270, 160]]], [420, 'AS 64502', 'var(--m4)', [[460, 90], [530, 130], [480, 170]]]];
  as.forEach(a => { s += `<rect x="${a[0]}" y="30" width="170" height="170" rx="22" style="fill:color-mix(in srgb,${a[2]} 12%,var(--card-solid));stroke:${a[2]};stroke-width:2"/><text x="${a[0] + 85}" y="52" text-anchor="middle" style="fill:${a[2]}">${a[1]}</text><text class="s" x="${a[0] + 85}" y="192" text-anchor="middle">OSPF / RIP dentro (IGP)</text>`; const p = a[3]; s += `<path class="lk" d="M${p[0]} L${p[1]} L${p[2]} Z"/>`; p.forEach(q => s += `<circle cx="${q[0]}" cy="${q[1]}" r="9" class="hl" style="--mc:${a[2]}"/>`); });
  s += `<path class="lk on" d="M129 134 L260 70" style="stroke:var(--m5)"/><path class="lk on" d="M330 120 L460 90" style="stroke:var(--m5)"/><text class="s" x="195" y="94" text-anchor="middle" style="fill:var(--m5)">BGP</text><text class="s" x="395" y="96" text-anchor="middle" style="fill:var(--m5)">BGP</text>`;
  return s + '</svg>';
}
UNITS.push({
  id: 'u6', n: 6, color: '--m6', owner: 'Moisés Montiel',
  title: 'Enrutamiento en Internet',
  obj: 'Explicar qué es el enrutamiento y cómo se eligen las rutas, diferenciar estático y dinámico, comparar los algoritmos de estado de enlace y vector de distancia, y reconocer el papel de RIP, OSPF, BGP y los sistemas autónomos.',
  lessons: [
    {t: 'Concepto y objetivos del enrutamiento', h: `<p>El <b>enrutamiento</b> es el proceso por el cual los routers determinan <b>qué camino</b> debe seguir un paquete desde el origen hasta el destino. Su resultado son las <b>tablas</b> que luego el reenvío consulta paquete a paquete.</p>
      <p>Un buen protocolo de enrutamiento busca:</p>
      <ul><li><b>Conectividad:</b> que todo destino alcanzable tenga ruta.</li><li><b>Rutas óptimas</b> según una <i>métrica</i> (saltos, ancho de banda, retardo, costo).</li><li><b>Convergencia rápida:</b> que todos los routers se pongan de acuerdo pronto tras un cambio.</li><li><b>Adaptación a fallas</b> y estabilidad.</li><li><b>Escalabilidad:</b> que funcione con miles de routers.</li></ul>
      <div class="story"><b>Analogía.</b> Es como una aplicación de mapas: calcula la mejor ruta según el criterio (más corta, más rápida) y se actualiza si cierran una calle.</div>`},
    {t: 'Enrutamiento estático y dinámico', h: `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>Estático</th><th>Dinámico</th></tr></thead><tbody>
      <tr><td><b>Quién define las rutas</b></td><td>El administrador, a mano</td><td>Los routers, con un protocolo</td></tr>
      <tr><td><b>Ante una falla</b></td><td>No se adapta; hay que cambiarlo manualmente</td><td>Aprende y se recalcula solo</td></tr>
      <tr><td><b>Consumo de recursos</b></td><td>Mínimo</td><td>CPU, memoria y ancho de banda para mensajes</td></tr>
      <tr><td><b>Seguridad / control</b></td><td>Total y predecible</td><td>Depende de autenticar el protocolo</td></tr>
      <tr><td><b>Escala</b></td><td>Redes pequeñas o rutas fijas</td><td>Redes grandes o cambiantes</td></tr>
      <tr><td><b>Ejemplo típico</b></td><td>Ruta por defecto hacia el ISP</td><td>OSPF en una empresa, BGP entre proveedores</td></tr></tbody></table></div>
      <p>La <b>ruta por defecto</b> (<span class="mono">0.0.0.0/0</span>) es una ruta estática muy común: «todo lo que no conozcas, envíalo por aquí». En la práctica se combinan ambos tipos.</p>`},
    {t: 'Tablas de enrutamiento y principios de selección de rutas', h: `<p>La <b>tabla de enrutamiento</b> lista las redes de destino conocidas. Cada entrada incluye: <b>prefijo</b> de destino, <b>siguiente salto</b>, <b>interfaz</b> de salida, <b>métrica</b> y el origen de la ruta (conectada, estática, o aprendida por un protocolo).</p>
      <p>Cuando un paquete llega, el router elige así:</p>
      <ol><li><b>Prefijo más largo</b>: la entrada más específica que coincida con el destino.</li><li>Si hay varias iguales de distintos protocolos, la de menor <b>distancia administrativa</b> (la «confianza» en el origen; por ejemplo, en equipos Cisco: conectada 0, estática 1, OSPF 110, RIP 120).</li><li>Entre rutas del mismo protocolo, la de menor <b>métrica</b>.</li></ol>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Destino</th><th>Siguiente salto</th><th>Interfaz</th><th>Origen</th></tr></thead><tbody>${RT_TABLE.map(r => `<tr><td class="m">${r.dest}</td><td class="m">${r.nh}</td><td class="m">${r.iface}</td><td>${r.proto}</td></tr>`).join('')}</tbody></table></div>
      <div class="row"><div style="max-width:280px"><label for="rtIn">¿Por dónde saldría un paquete hacia…?</label><input id="rtIn" type="text" inputmode="decimal" value="10.20.30.45" autocomplete="off"></div></div>
      <div id="rtOut" class="hfinfo" role="status" aria-live="polite"></div>`,
      init(b){
        const run = () => {
          const o = parseIp($('rtIn').value);
          if (!o){ $('rtOut').innerHTML = '<span class="bad">Escribe una IPv4 válida.</span>'; return; }
          const best = lpm(RT_TABLE, o), c = RT_TABLE.filter(r => ((ipToInt(o) & maskInt(r._c.p)) >>> 0) === r._c.net);
          $('rtOut').innerHTML = `Coinciden <b>${c.length}</b> entradas: ${c.map(r => `<span class="mono">${r.dest}</span>`).join(', ')}.<br><b>Gana ${best.dest}</b> (prefijo más largo, /${best._c.p}). ${best.nh === 'directamente conectada' ? 'El destino está en una red conectada: se entrega directamente por ' + best.iface + '.' : 'Siguiente salto: <b class="mono">' + best.nh + '</b> por ' + best.iface + '.'}`;
        };
        $('rtIn').addEventListener('input', run); run();
      }},
    {t: 'Algoritmos: estado de enlace y vector de distancia', h: `<p>Los protocolos dinámicos se basan en dos grandes familias de algoritmos:</p>
      <div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>Estado de enlace</th><th>Vector de distancia</th></tr></thead><tbody>
      <tr><td><b>Idea</b></td><td>Cada router conoce <b>todo el mapa</b> y calcula el camino más corto.</td><td>Cada router sabe <b>a qué distancia</b> está cada destino y por qué vecino, según lo que le cuentan.</td></tr>
      <tr><td><b>Qué intercambia</b></td><td>El estado de sus enlaces (LSA), inundado a toda la red.</td><td>Su tabla de distancias, solo a sus vecinos.</td></tr>
      <tr><td><b>Algoritmo</b></td><td>Dijkstra</td><td>Bellman-Ford</td></tr>
      <tr><td><b>Convergencia</b></td><td>Rápida</td><td>Más lenta; riesgo de «cuenta al infinito»</td></tr>
      <tr><td><b>Recursos</b></td><td>Más memoria y CPU</td><td>Simple y ligero</td></tr>
      <tr><td><b>Protocolos</b></td><td>OSPF, IS-IS</td><td>RIP</td></tr></tbody></table></div>
      <div class="story"><b>Analogía.</b> Estado de enlace es que cada viajero tenga el mapa completo de carreteras y trace su ruta. Vector de distancia es preguntarle a los vecinos: «¿a cuánto estás de la ciudad F?» y quedarse con la mejor respuesta más el costo de llegar hasta ese vecino.</div>
      <p>Compara ambos en el simulador <b>«Selección de rutas»</b>, más abajo.</p>
      <details class="more"><summary>Más información: cuenta al infinito</summary><p>En vector de distancia, cuando una red desaparece, los routers pueden seguir pasándose rutas obsoletas y aumentando la métrica poco a poco. Se mitiga con <i>horizonte dividido</i> (no anunciar una ruta por el mismo vecino de donde se aprendió), <i>envenenamiento de ruta</i> y un límite máximo de métrica (en RIP, 16 saltos equivalen a «inalcanzable»).</p></details>`},
    {t: 'Introducción a RIP, OSPF y BGP', h: `<div class="tblwrap"><table class="tbl cmp"><thead><tr><th></th><th>RIP</th><th>OSPF</th><th>BGP</th></tr></thead><tbody>
      <tr><td><b>Familia</b></td><td>Vector de distancia</td><td>Estado de enlace</td><td>Vector de ruta (path vector)</td></tr>
      <tr><td><b>Métrica</b></td><td>Número de saltos (máx. 15)</td><td>Costo (según ancho de banda)</td><td>Atributos y políticas (p. ej. longitud del AS_PATH)</td></tr>
      <tr><td><b>Alcance</b></td><td>Dentro de un AS, redes pequeñas</td><td>Dentro de un AS, redes medianas y grandes</td><td>Entre sistemas autónomos</td></tr>
      <tr><td><b>Transporte</b></td><td>UDP, puerto 520</td><td>Directo sobre IP, protocolo 89</td><td>TCP, puerto 179</td></tr>
      <tr><td><b>Actualizaciones</b></td><td>Periódicas (cada 30 s)</td><td>Solo cuando hay cambios</td><td>Solo cuando hay cambios</td></tr>
      <tr><td><b>Convergencia</b></td><td>Lenta</td><td>Rápida</td><td>Lenta, por diseño (estabilidad)</td></tr>
      <tr><td><b>Dónde se usa</b></td><td>Redes pequeñas o didácticas</td><td>Redes corporativas y de proveedores</td><td>Internet global: ISP y grandes empresas</td></tr></tbody></table></div>
      <p><b>OSPF</b> divide la red en <i>áreas</i> para que las bases de datos no crezcan demasiado. <b>BGP</b> no busca «el camino más rápido», sino aplicar <b>políticas</b> comerciales y de seguridad: a quién se le acepta tráfico y por dónde.</p>`},
    {t: 'Sistemas autónomos', h: `<p>Un <b>sistema autónomo</b> (AS) es un conjunto de redes y routers bajo una <b>misma administración</b> y una política de enrutamiento común. Cada AS tiene un número, el <b>ASN</b>, asignado por los registros regionales.</p>
      <ul><li><b>Dentro del AS:</b> se usa un protocolo de pasarela interior (IGP): OSPF, IS-IS, RIP… Aquí importa sobre todo el <b>desempeño</b>.</li><li><b>Entre AS:</b> se usa un protocolo de pasarela exterior: <b>BGP</b>. Aquí importan sobre todo las <b>políticas</b> (acuerdos entre proveedores).</li></ul>
      <p>Esta jerarquía hace posible que Internet escale: cada AS maneja sus detalles internos, y hacia afuera solo anuncia los prefijos que alcanza.</p>
      <div class="story"><b>Analogía.</b> Cada país organiza sus propias carreteras como quiere (enrutamiento interno); los acuerdos en las fronteras, en cambio, se negocian entre países (enrutamiento entre AS).</div>`, fig: asFig(), cap: 'Figura 5. Tres sistemas autónomos: dentro de cada uno, un protocolo interno; entre ellos, BGP.'},
    {t: 'Ejemplos de selección de rutas', h: `<p>Observa la red del simulador, con costos en cada enlace. Para ir de <b>A</b> a <b>F</b> hay varios caminos:</p>
      <div class="tblwrap"><table class="tbl"><thead><tr><th>Camino</th><th>Costo total</th></tr></thead><tbody><tr><td class="m">A → B → C → E → F</td><td class="m"><b>2 + 1 + 3 + 2 = 8</b></td></tr><tr><td class="m">A → B → D → E → F</td><td class="m">2 + 4 + 1 + 2 = 9</td></tr><tr><td class="m">A → C → E → F</td><td class="m">5 + 3 + 2 = 10</td></tr><tr><td class="m">A → B → D → F</td><td class="m">2 + 4 + 5 = 11</td></tr></tbody></table></div>
      <p>Gana el de menor costo: <b>A → B → C → E → F (8)</b>. Aunque A → C parece directo, cuesta 5 y es peor que pasar por B (2 + 1 = 3).</p>
      <p>Ahora cambia el mundo: <b>pulsa un enlace</b> en el simulador para aumentar su costo o tumbarlo, y mira cómo cambia la mejor ruta. Eso es exactamente lo que hacen los protocolos dinámicos cuando algo falla.</p>`}
  ],
  widgets: `
  <div class="card"><span class="tag">SIMULADOR · SELECCIÓN DE RUTAS</span><h3 style="margin-top:0">Estado de enlace frente a vector de distancia</h3>
    <div class="row" style="align-items:flex-end"><div style="max-width:140px"><label for="gSrc">Origen</label><select id="gSrc">${G_NODES.map(n => `<option ${n === 'A' ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div style="max-width:140px"><label for="gDst">Destino</label><select id="gDst">${G_NODES.map(n => `<option ${n === 'F' ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="fit"><div class="seg" role="group" aria-label="Algoritmo" id="gAlg"><button type="button" data-a="ls" aria-pressed="true">Estado de enlace</button><button type="button" data-a="dv" aria-pressed="false">Vector de distancia</button></div></div>
    <div class="fit"><button class="btn alt sm" type="button" id="gReset">Restablecer costos</button></div></div>
    <p class="hint">Pulsa un enlace (o su número) para cambiar su costo de 1 a 9; tras el 9 queda caído.</p>
    <figure class="fig" id="gFig"></figure>
    <div class="hfinfo" id="gInfo" role="status" aria-live="polite"></div>
    <div class="tblwrap"><table class="tbl" id="gTbl"></table></div></div>`,
  cards: [
    ['Enrutamiento', 'Proceso que calcula los caminos y llena las tablas de los routers.'],
    ['Ruta por defecto', 'Entrada 0.0.0.0/0: lo que no se conoce sale por aquí.'],
    ['Métrica', 'Valor numérico que mide qué tan buena es una ruta.'],
    ['Estado de enlace', 'Cada router conoce el mapa completo y aplica Dijkstra (OSPF).'],
    ['Vector de distancia', 'Cada router comparte su tabla con los vecinos y aplica Bellman-Ford (RIP).'],
    ['Sistema autónomo', 'Conjunto de redes bajo una misma administración, con número ASN.'],
    ['IGP', 'Protocolo de enrutamiento dentro de un AS (OSPF, RIP).'],
    ['BGP', 'Protocolo de enrutamiento entre sistemas autónomos, basado en políticas.']
  ],
  need: 5,
  quiz: [
    {q: '¿Qué diferencia hay entre una ruta estática y una dinámica?', o: ['La estática la configura el administrador; la dinámica se aprende con un protocolo', 'La estática se recalcula sola; la dinámica es manual', 'La estática solo funciona en IPv6', 'No hay diferencia, son nombres equivalentes'], c: 0, e: 'Las rutas estáticas son manuales y no se adaptan a fallas; las dinámicas se aprenden y se recalculan.'},
    {q: 'La tabla tiene 10.0.0.0/8 (por R1), 10.20.0.0/16 (por R2) y 0.0.0.0/0 (por R3). ¿Por dónde sale un paquete a 10.20.4.4?', o: ['Por R1', 'Por R2', 'Por R3', 'Se descarta'], c: 1, e: 'Se aplica el prefijo más largo: 10.20.0.0/16 es más específico que /8 y que /0.'},
    {q: '¿Qué algoritmo usan los protocolos de estado de enlace como OSPF?', o: ['Bellman-Ford', 'Dijkstra', 'ARP', 'Fragmentación'], c: 1, e: 'En estado de enlace cada router tiene el mapa completo y calcula caminos mínimos con Dijkstra.'},
    {q: 'Un router de vector de distancia conoce…', o: ['El mapa completo de la red', 'La distancia a cada destino y por qué vecino llegar, según lo que le cuentan', 'Solo su dirección MAC', 'Únicamente las rutas estáticas'], c: 1, e: 'Intercambia su tabla de distancias con sus vecinos; no conoce la topología completa.'},
    {q: '¿Qué protocolo se usa para el enrutamiento entre sistemas autónomos de Internet?', o: ['RIP', 'OSPF', 'BGP', 'ICMP'], c: 2, e: 'BGP conecta sistemas autónomos y aplica políticas; RIP y OSPF son protocolos interiores.'},
    {q: 'Verdadero o falso: dentro de un sistema autónomo se prioriza el desempeño, y entre sistemas autónomos, las políticas.', o: ['Verdadero', 'Falso'], c: 0, e: 'Dentro de un AS se busca la mejor ruta técnica; entre AS pesan los acuerdos comerciales y de seguridad.'}
  ],
  _ch: false,
  init(s){
    const self = this;
    let edges = G_EDGES0.map(e => e.slice()), alg = 'ls';
    const base = {};
    function draw(){
      const src = $('gSrc').value, dst = $('gDst').value;
      const dj = dijkstra(G_NODES, edges, src), path = pathTo(dj.prev, src, dst);
      const onE = new Set(); if (path) for (let i = 0; i < path.length - 1; i++) onE.add([path[i], path[i + 1]].sort().join('-'));
      let g = svgOpen(560, 240, 'Red de seis routers con costos en cada enlace');
      edges.forEach((e, i) => {
        const [a, b, c] = e, [x1, y1] = G_POS[a], [x2, y2] = G_POS[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dead = !isFinite(c), on = onE.has([a, b].sort().join('-'));
        g += `<g class="pick" tabindex="0" role="button" data-e="${i}" aria-label="Enlace ${a}–${b}, costo ${dead ? 'caído' : c}. Pulsa para cambiar"><line class="lk ${dead ? 'bad' : on ? 'on' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22"/><rect class="box" x="${mx - 14}" y="${my - 11}" width="28" height="22" rx="7"/><text x="${mx}" y="${my + 4}" text-anchor="middle">${dead ? '✕' : c}</text></g>`;
      });
      G_NODES.forEach(n => g += `<g><circle class="${path && path.includes(n) ? 'hl' : 'box'}" cx="${G_POS[n][0]}" cy="${G_POS[n][1]}" r="22"/><text x="${G_POS[n][0]}" y="${G_POS[n][1] + 4}" text-anchor="middle">${n}</text></g>`);
      $('gFig').innerHTML = g + '</svg>';
      if (alg === 'ls'){
        $('gInfo').innerHTML = path ? `<b>Estado de enlace (Dijkstra).</b> Camino de ${src} a ${dst}: <b class="mono">${path.join(' → ')}</b> con costo <b>${dj.dist[dst]}</b>. Cada router conoce todos los costos y calcula esto por su cuenta.` : `<b class="bad">Sin ruta</b> de ${src} a ${dst}: los enlaces caídos dejaron ese destino aislado.`;
        $('gTbl').innerHTML = `<thead><tr><th>Orden de cierre (Dijkstra)</th>${dj.order.map((n, i) => `<th>${i + 1}.º ${n}</th>`).join('')}</tr></thead><tbody><tr><td>Distancia desde ${src}</td>${dj.order.map(n => `<td class="m">${dj.dist[n]}</td>`).join('')}</tr></tbody>`;
      } else {
        const R = bellman(G_NODES, edges, src), last = R[R.length - 1];
        $('gInfo').innerHTML = `<b>Vector de distancia (Bellman-Ford).</b> Cada ronda, cada router se queda con el mejor valor entre «lo que me dice un vecino + el costo hasta él». Se estabiliza en <b>${R.length - 1}</b> ronda${R.length - 1 === 1 ? '' : 's'}. Distancia de ${src} a ${dst}: <b>${isFinite(last[dst]) ? last[dst] : 'inalcanzable'}</b>${path ? ` (camino ${path.join(' → ')})` : ''}.`;
        $('gTbl').innerHTML = `<thead><tr><th>Ronda</th>${G_NODES.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>${R.map((r, i) => `<tr><td>${i}</td>${G_NODES.map(n => `<td class="m">${isFinite(r[n]) ? r[n] : '∞'}</td>`).join('')}</tr>`).join('')}</tbody>`;
      }
    }
    const bump = i => { const e = edges[i]; e[2] = !isFinite(e[2]) ? G_EDGES0[i][2] : (e[2] >= 9 ? Infinity : e[2] + 1); draw(); sfx.tick(); self._chg = (self._chg || 0) + 1; if (self._chg >= 2) award('u6_sim'); };
    $('gFig').addEventListener('click', e => { const g = e.target.closest('g.pick'); if (g) bump(+g.dataset.e); });
    $('gFig').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ const g = e.target.closest('g.pick'); if (g){ e.preventDefault(); const i = +g.dataset.e; bump(i); const n = $('gFig').querySelector(`g[data-e="${i}"]`); if (n) n.focus(); } } });
    ['gSrc', 'gDst'].forEach(i => $(i).addEventListener('change', () => { draw(); sfx.tick(); }));
    $('gAlg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; alg = b.dataset.a; $('gAlg').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); draw(); sfx.tick(); });
    $('gReset').onclick = () => { edges = G_EDGES0.map(e => e.slice()); draw(); sfx.tick(); };
    draw();
  }
});

