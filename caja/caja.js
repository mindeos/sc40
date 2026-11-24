// Caja de Super Cait's 40: confeti de la portada, código de barras de adorno y marcas de corte/pliegue.
// (Los sprites, iconos y el trozo de mapa los dibuja ../guia/guia.js con el código del juego.)
// ?limpio en la dirección oculta las guías de colores en pantalla.
if (new URLSearchParams(location.search).has('limpio')) document.body.classList.add('clean');

// Ruido fijo: siempre el mismo dibujo
const rnd = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };

// Confeti de la portada (por encima del cielo, por detrás de los personajes)
const COLORS = ['#ffd23f', '#f06aa8', '#3f8fd8', '#82cc6a', '#ffffff', '#e2574c'];
const conf = document.getElementById('confetti');
for (let i = 0; i < 70; i++) {
  const c = document.createElement('i');
  c.style.left = (rnd(i, 1) * 128 + 2).toFixed(1) + 'mm';
  c.style.top = (rnd(i, 2) * 110 + 17).toFixed(1) + 'mm';
  c.style.background = COLORS[i % COLORS.length];
  c.style.transform = `rotate(${Math.round(rnd(i, 3) * 180)}deg)`;
  conf.appendChild(c);
}

// Código de barras de adorno (no es un código real)
const bc = document.getElementById('barcode');
for (let i = 0; i < 46; i++) {
  const b = document.createElement('i');
  b.style.width = (0.18 + Math.floor(rnd(i, 7) * 3) * 0.16).toFixed(2) + 'mm';
  b.style.marginRight = (0.16 + Math.floor(rnd(i, 9) * 2) * 0.16).toFixed(2) + 'mm';
  if (i === 0 || i === 1 || i === 22 || i === 23 || i >= 44) b.style.marginBottom = '-1.4mm'; // barras guía, más largas
  bc.appendChild(b);
}

// Marcas de corte (en las esquinas del corte, fuera del sangrado) y de pliegue del lomo (arriba y abajo)
const marks = document.getElementById('marks');
const line = (x, y, w, h) => { const m = document.createElement('i'); Object.assign(m.style, { left: x + 'mm', top: y + 'mm', width: w + 'mm', height: h + 'mm' }); marks.appendChild(m); };
const X0 = 9, Y0 = 10.5, B = 3, W = 273, H = 183, BACK = 129.5, SPINE = 14, T = 0.2;
const xs = [X0 + B, X0 + B + W], ys = [Y0 + B, Y0 + B + H];
for (const x of xs) { line(x - T / 2, 1, T, Y0 - 2); line(x - T / 2, Y0 + 2 * B + H + 1, T, 210 - (Y0 + 2 * B + H) - 2); }
for (const y of ys) { line(1, y - T / 2, X0 - 2, T); line(X0 + 2 * B + W + 1, y - T / 2, 297 - (X0 + 2 * B + W) - 2, T); }
for (const x of [X0 + B + BACK, X0 + B + BACK + SPINE]) { line(x - T / 2, 3, T, Y0 - 5); line(x - T / 2, Y0 + 2 * B + H + 2, T, 210 - (Y0 + 2 * B + H) - 5); }
