/* =====================================================================
   js/inicio.js
   Portada: demostración del TTL. Un paquete sale del PC, atraviesa tres
   routers (cada uno resta 1 al TTL) y llega al servidor; si el TTL llega
   a 0 antes de llegar, el router lo descarta y avisa con ICMP.
   ===================================================================== */

const POS_X = [34, 108, 172, 236, 306];   // posiciones de PC, R1, R2, R3 y servidor en el dibujo
let enviando = false;

function limpiarRouters() {
    [1, 2, 3].forEach(i => {
        const c = $('hr' + i).querySelector('circle');
        c.style.stroke = '';
        c.style.strokeWidth = '';
    });
}

function habilitarBotones(on) {
    $('hSend64').disabled = !on;
    $('hSend3').disabled = !on;
}

async function enviarPaquete(ttlInicial) {
    if (enviando) return;
    enviando = true;
    habilitarBotones(false);
    limpiarRouters();

    const paquete = $('hpk'), etiqueta = $('hpkT'), registro = $('hLog');
    let ttl = ttlInicial;
    paquete.style.transition = 'none';
    paquete.style.transform = `translate(${POS_X[0]}px,40px)`;
    paquete.style.opacity = 1;
    void paquete.getBoundingClientRect();              // fuerza el reinicio de la animación
    paquete.style.transition = 'transform .55s linear';
    etiqueta.textContent = 'TTL ' + ttl;
    $('hpTtl').textContent = 'TTL: ' + ttl;
    registro.textContent = 'El PC envía el paquete con TTL ' + ttl + '.';

    for (let i = 1; i <= 4; i++) {
        paquete.style.transform = `translate(${POS_X[i]}px,40px)`;
        sfx.hop();
        await sleep(640);
        if (i === 4) break;                            // llegó al servidor

        ttl--;                                         // el router i resta 1 al TTL
        etiqueta.textContent = 'TTL ' + ttl;
        $('hpTtl').textContent = 'TTL: ' + ttl;
        const circulo = $('hr' + i).querySelector('circle');
        if (ttl === 0) {
            circulo.style.stroke = 'var(--bad)';
            circulo.style.strokeWidth = '3';
            registro.innerHTML = `<b class="bad">R${i} descarta el paquete:</b> el TTL llegó a 0. Envía al origen un mensaje ICMP «Tiempo excedido».`;
            sfx.bad();
            await sleep(500);
            paquete.style.opacity = 0;
            enviando = false;
            habilitarBotones(true);
            return;
        }
        circulo.style.stroke = 'var(--ok)';
        circulo.style.strokeWidth = '3';
        registro.textContent = `R${i} resta 1 al TTL (ahora ${ttl}) y reenvía el paquete.`;
    }

    registro.innerHTML = `<b class="ok">Entregado.</b> Llegó con TTL ${ttl}. Cada router le restó 1.`;
    sfx.ok();
    limpiarRouters();
    enviando = false;
    habilitarBotones(true);
}

$('hSend64').onclick = () => enviarPaquete(64);
$('hSend3').onclick = () => enviarPaquete(3);
if (reduceMotion) $('hLog').textContent = 'Pulsa un botón para enviar un paquete.';
hud(false);
