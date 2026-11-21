/* =====================================================================
   js/calculos.js
   Funciones puras de cálculo (sin interfaz): direcciones y subredes IPv4, prefijo más largo, IPv6, Dijkstra y Bellman-Ford.
   ===================================================================== */

/*CORE*/
const W = [128,64,32,16,8,4,2,1];
const pad8 = n => n.toString(2).padStart(8, '0');
function parseIp(s){
  const p = String(s).trim().split('.');
  if (p.length !== 4) return null;
  const o = [];
  for (const x of p){ if (!/^\d{1,3}$/.test(x)) return null; const v = +x; if (v > 255) return null; o.push(v); }
  return o;
}
const ipToInt = o => ((o[0]*16777216) + (o[1]*65536) + (o[2]*256) + o[3]) >>> 0;
const intToOct = n => [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255];
const intToIp = n => intToOct(n).join('.');
const maskInt = p => p === 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0);
function calcNet(o, p){
  const ip = ipToInt(o), m = maskInt(p);
  const net = (ip & m) >>> 0, bc = (net | ((~m) >>> 0)) >>> 0;
  const hosts = p <= 30 ? Math.pow(2, 32 - p) - 2 : (p === 31 ? 2 : 1);
  return {ip, m, net, bc, hosts, first: p <= 30 ? net + 1 : net, last: p <= 30 ? bc - 1 : bc};
}
function classify(o){
  const a = o[0];
  const cls = a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : a < 240 ? 'D' : 'E';
  let kind = 'Pública', cat = 'Pública';
  if (a === 0) { kind = 'Red "esta red" (0.0.0.0/8)'; cat = 'Especial'; }
  else if (a === 127) { kind = 'Loopback (el equipo hablando consigo mismo)'; cat = 'Especial'; }
  else if (a === 10 || (a === 172 && o[1] >= 16 && o[1] <= 31) || (a === 192 && o[1] === 168)) { kind = 'Privada'; cat = 'Privada'; }
  else if (a === 169 && o[1] === 254) { kind = 'APIPA (el equipo no obtuvo IP por DHCP)'; cat = 'Especial'; }
  else if (cls === 'D') { kind = 'Multidifusión'; cat = 'Especial'; }
  else if (cls === 'E') { kind = 'Reservada'; cat = 'Especial'; }
  return {cls, kind, cat};
}
function splitSubnets(o, basePrefix, n){
  const b = Math.max(1, Math.ceil(Math.log2(n)));
  const newP = basePrefix + b;
  if (newP > 30) return null;
  const count = Math.pow(2, b), size = Math.pow(2, 32 - newP);
  const baseNet = (ipToInt(o) & maskInt(basePrefix)) >>> 0;
  const list = [];
  for (let i = 0; i < count; i++){
    const net = (baseNet + i * size) >>> 0, bc = (net + size - 1) >>> 0;
    list.push({net, first: net + 1, last: bc - 1, bc});
  }
  return {b, newP, count, size, usable: size - 2, list};
}
function prefixForHosts(h){
  const k = Math.max(2, Math.ceil(Math.log2(h + 2)));
  return {k, prefix: 32 - k, size: Math.pow(2, k), usable: Math.pow(2, k) - 2};
}
function allocate(o, basePrefix, reqs){
  const baseNet = (ipToInt(o) & maskInt(basePrefix)) >>> 0, baseSize = Math.pow(2, 32 - basePrefix);
  const sorted = reqs.map((r, i) => ({name: r.name, hosts: r.hosts, i, pf: prefixForHosts(r.hosts)})).sort((a, b) => b.hosts - a.hosts || a.i - b.i);
  let off = 0; const list = [];
  for (const r of sorted){
    if (off + r.pf.size > baseSize) return null;
    const net = (baseNet + off) >>> 0, bc = (net + r.pf.size - 1) >>> 0;
    list.push({name: r.name, hosts: r.hosts, prefix: r.pf.prefix, size: r.pf.size, net, first: net + 1, last: bc - 1, bc});
    off += r.pf.size;
  }
  return {list, used: off, total: baseSize};
}
/*ENDCORE*/


/*NET*/
function parseCidr(s){
  const m = String(s).trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!m) return null;
  const o = parseIp(m[1]), p = +m[2];
  if (!o || p > 32) return null;
  return {net: (ipToInt(o) & maskInt(p)) >>> 0, p};
}
function lpm(table, ip){
  const x = ipToInt(typeof ip === 'string' ? parseIp(ip) : ip);
  let best = null;
  for (const r of table){
    const c = r._c || (r._c = parseCidr(r.dest));
    if (((x & maskInt(c.p)) >>> 0) === c.net && (!best || c.p > best._c.p)) best = r;
  }
  return best;
}
function v6Expand(s){
  s = String(s).trim().toLowerCase();
  if (!/^[0-9a-f:]+$/.test(s)) return null;
  const dbl = s.split('::');
  if (dbl.length > 2) return null;
  const parse = x => x === '' ? [] : x.split(':');
  let g;
  if (dbl.length === 2){
    const a = parse(dbl[0]), b = parse(dbl[1]), miss = 8 - a.length - b.length;
    if (miss < 1) return null;
    g = [...a, ...new Array(miss).fill('0'), ...b];
  } else { g = parse(s); if (g.length !== 8) return null; }
  if (g.some(x => !/^[0-9a-f]{1,4}$/.test(x))) return null;
  return g.map(x => x.padStart(4, '0'));
}
function v6Compress(g){
  const t = g.map(x => x.replace(/^0+(?=.)/, ''));
  let bs = -1, bl = 0;
  for (let i = 0; i < 8;){
    if (t[i] === '0'){ let j = i; while (j < 8 && t[j] === '0') j++; if (j - i > bl){ bl = j - i; bs = i; } i = j; } else i++;
  }
  if (bl < 2) return t.join(':');
  return t.slice(0, bs).join(':') + '::' + t.slice(bs + bl).join(':');
}
function v6Type(g){
  const all = g.join('');
  if (/^0+$/.test(all)) return 'Dirección no especificada (::)';
  if (/^0+1$/.test(all)) return 'Loopback (::1)';
  const f = parseInt(g[0], 16);
  if (g[0] === '2001' && g[1] === '0db8') return 'Documentación (2001:db8::/32)';
  if ((f & 0xffc0) === 0xfe80) return 'Link-local (fe80::/10), solo vale en el enlace local';
  if ((f & 0xfe00) === 0xfc00) return 'Local única, ULA (fc00::/7), la «privada» de IPv6';
  if ((f & 0xff00) === 0xff00) return 'Multidifusión (ff00::/8)';
  if ((f & 0xe000) === 0x2000) return 'Unicast global (2000::/3), enrutable en Internet';
  return 'Otro bloque reservado o sin asignar';
}
function gAdj(nodes, edges){
  const m = {}; nodes.forEach(n => m[n] = []);
  edges.forEach(([a, b, c]) => { if (isFinite(c)){ m[a].push([b, c]); m[b].push([a, c]); } });
  return m;
}
function dijkstra(nodes, edges, src){
  const g = gAdj(nodes, edges), dist = {}, prev = {}, done = {}, order = [];
  nodes.forEach(n => dist[n] = Infinity); dist[src] = 0;
  for (;;){
    let u = null;
    nodes.forEach(n => { if (!done[n] && dist[n] < Infinity && (u === null || dist[n] < dist[u])) u = n; });
    if (u === null) break;
    done[u] = 1; order.push(u);
    g[u].forEach(([v, c]) => { if (dist[u] + c < dist[v]){ dist[v] = dist[u] + c; prev[v] = u; } });
  }
  return {dist, prev, order};
}
function pathTo(prev, src, dst){
  const p = [dst];
  while (p[0] !== src){ if (!(p[0] in prev)) return null; p.unshift(prev[p[0]]); }
  return p;
}
function bellman(nodes, edges, src){
  const g = gAdj(nodes, edges); let d = {};
  nodes.forEach(n => d[n] = Infinity); d[src] = 0;
  const rounds = [Object.assign({}, d)];
  for (let k = 0; k < nodes.length; k++){
    const nd = Object.assign({}, d);
    nodes.forEach(u => g[u].forEach(([v, c]) => { if (d[v] + c < nd[u]) nd[u] = d[v] + c; }));
    const ch = nodes.some(n => nd[n] !== d[n]); d = nd;
    if (!ch) break; rounds.push(Object.assign({}, d));
  }
  return rounds;
}
/*ENDNET*/
