// Minijuego: las pruebas de Bart en Fitness Bartory, al estilo de unos juegos olímpicos.
// Tres pruebas distintas:
//   1. Dominadas    — precisión: pulsar acción cuando el marcador pasa por la zona verde.
//   2. Flexiones    — sprint: machacar el botón de acción para llenar la barra antes de que se acabe el tiempo.
//   3. Plancha      — equilibrio: mantener el marcador centrado con izquierda/derecha mientras tiembla.
import { State } from '../state.js';
import { Input } from '../input.js';
import { UI } from '../ui.js';
import { Sound } from '../audio.js';
import { SCRIPTS } from '../story.js';

const X0 = 60, X1 = 260, MY = 160, MID = (X0 + X1) / 2;
const EVENTS = [
  { k: 'pull', name: 'Dominadas', reps: 5, zone: 30, speed: 210,
    intro: 'DOMINADAS: pulsa en la zona verde. Cinco limpias.' },
  { k: 'mash', name: 'Sprint de flexiones', time: 9, gain: 4.4, decay: 15,
    intro: 'FLEXIONES: ¡machaca el botón hasta llenar la barra!' },
  { k: 'hold', name: 'Plancha', time: 12, miss: 2.5,
    intro: 'PLANCHA: izquierda y derecha para no salirte de la zona verde.' },
];
const QUIPS = ['¡Eso ha sido KIPPING!', '¡Escápulas ACTIVAS!', '¡Sin balanceo, Colgadín!', '¡Hollow body! ¡HOLLOW BODY!', '¡Rango completo o no cuenta!'];

export class CaliScene extends Phaser.Scene {
  constructor() { super('cali'); }

  create() {
    this.cameras.main.setBackgroundColor('#2b2d34').fadeIn(250);
    UI.hud(false);
    Sound.music('gym');
    this.gymBackground(this.add.graphics());
    this.barImg = this.add.image(160, 134, 'bar').setOrigin(0.5, 1);
    this.cord = this.add.graphics();
    this.col = this.add.image(160, 0, 'colgadin_down_0').setOrigin(0.5, 0).setScale(2);
    this.bart = this.add.image(262, 134, 'bart_down_0').setOrigin(0.5, 1).setScale(2);
    this.meter = this.add.graphics();
    this.ev = 0; this.lock = true;
    this.holdFails = 0; // reintentos de la plancha: cada uno la hace un poco más fácil
    Input.clear();
    this.begin();
  }

  // Decorado del Fitness Bartory (de −60 a 380: en pantallas anchas se ve más por los lados)
  gymBackground(g) {
    const R = (c, x, y, w, h) => g.fillStyle(c).fillRect(x, y, w, h);
    // Pared de ladrillo
    R(0x464a56, -60, 0, 440, 132);
    for (let y = 0; y < 132; y += 8) {
      R(0x3c3f4a, -60, y, 440, 1);
      for (let x = -60 + ((y / 8) % 2) * 8; x < 380; x += 16) R(0x3c3f4a, x, y, 1, 8);
    }
    // Franja naranja de la marca y logo «FB» en el centro, encima de la barra
    R(0xf08a24, -60, 26, 440, 5); R(0xc86a14, -60, 31, 440, 1);
    g.fillStyle(0x1a1412).fillCircle(160, 48, 12).fillStyle(0xf08a24).fillCircle(160, 48, 10);
    const px = (map, x0, y0, c) => map.forEach((row, j) => [...row].forEach((v, i) => { if (v === '#') R(c, x0 + i * 2, y0 + j * 2, 2, 2); }));
    px(['###', '#..', '##.', '#..', '#..'], 153, 43, 0xffffff); px(['##.', '#.#', '##.', '#.#', '##.'], 161, 43, 0xffffff); // «FB» junto y dentro del círculo
    // Pared de espejos a la izquierda (para las fotos de Bart)
    R(0x2b2320, 8, 40, 96, 80);
    for (let i = 0; i < 3; i++) {
      const x = 10 + i * 32;
      R(0x9ec4d8, x, 42, 30, 76); R(0xb8d8e8, x, 42, 30, 6);
      for (let k = 0; k < 10; k++) { R(0xe8f4fa, x + 6 + k, 60 - k, 1, 1); R(0xe8f4fa, x + 12 + k, 80 - k, 1, 1); } // brillos
    }
    // Estante de mancuernas bajo los espejos
    R(0x2b2320, 12, 122, 88, 3); R(0x2b2320, 14, 125, 2, 7); R(0x2b2320, 96, 125, 2, 7);
    [0xe2574c, 0x3f8fd8, 0xffd23f, 0x82cc6a, 0xe2574c].forEach((c, i) => { const x = 20 + i * 16; R(0x1a1412, x, 118, 3, 5); R(0x8a8f9a, x + 3, 120, 6, 1); R(0x1a1412, x + 9, 118, 3, 5); R(c, x, 119, 3, 3); R(c, x + 9, 119, 3, 3); });
    // Póster de motivación (una pesa) y reloj
    R(0x2b2320, 216, 40, 30, 38); R(0xe2574c, 218, 42, 26, 34);
    R(0xffffff, 222, 56, 18, 2); R(0xffffff, 222, 52, 3, 10); R(0xffffff, 237, 52, 3, 10); R(0xffd23f, 220, 68, 22, 2);
    g.fillStyle(0x2b2320).fillCircle(196, 48, 7).fillStyle(0xfff6dc).fillCircle(196, 48, 5);
    R(0x2b2320, 196, 44, 1, 4); R(0x2b2320, 196, 48, 3, 1);
    // Espaldera de madera a la derecha
    for (const x of [292, 330]) R(0x8a5a34, x, 38, 4, 94);
    for (let y = 44; y < 130; y += 9) { R(0xb07a48, 296, y, 34, 3); R(0x8a5a34, 296, y + 2, 34, 1); }
    // Ventana alta (solo se ve en pantallas anchas) y planta en la esquina
    R(0x2b2320, -50, 40, 46, 40); R(0xbcd8ec, -48, 42, 42, 36); R(0xffffff, -48, 42, 42, 3); R(0x2b2320, -28, 42, 2, 36);
    R(0x8a5a34, 350, 118, 14, 14); g.fillStyle(0x3f8f6b).fillCircle(357, 108, 10).fillStyle(0x5aa648).fillCircle(353, 104, 6);
    // Suelo de caucho a cuadros, colchoneta azul bajo la barra y kettlebells junto a Bart
    R(0x2b2d34, -60, 132, 440, 2);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 37; i++) R((i + j) % 2 ? 0x5a5e6a : 0x4a4e5a, -60 + i * 12, 134 + j * 12, 12, 12);
    R(0x2a4a78, 104, 134, 112, 12); R(0x3f6fa8, 106, 134, 108, 10);
    [[296, 0x1a1412], [310, 0xe2574c], [324, 0x3f8fd8]].forEach(([x, c]) => { g.fillStyle(c).fillCircle(x, 128, 5); R(0x1a1412, x - 3, 119, 6, 2); R(0x1a1412, x - 3, 119, 1, 5); R(0x1a1412, x + 2, 119, 1, 5); });
  }

  // Prepara la prueba actual y la presenta
  async begin() {
    const e = EVENTS[this.ev];
    this.lock = true;
    this.reps = 0; this.lift = 0; this.pos = 0; this.dirn = 1;         // dominadas
    this.fill = 0; this.left = e.time || 0;                            // sprint
    this.bal = 0; this.vel = 0; this.wind = 0; this.windT = 0; this.out = 0; // plancha
    this.barImg.setVisible(e.k === 'pull');
    this.newZone();
    this.bar();
    await UI.say('Bart', e.intro);
    Input.clear();
    this.lock = false;
  }
  newZone() {
    const e = EVENTS[this.ev];
    if (e.k !== 'pull') return;
    this.zw = Math.max(16, e.zone - this.reps * 4);
    this.zx = X0 + 10 + Math.random() * (X1 - X0 - this.zw - 20);
  }
  bar() {
    const e = EVENTS[this.ev];
    const detail = e.k === 'pull' ? `${this.reps}/${e.reps}` : e.k === 'mash' ? `${Math.round(this.fill)} % · ${Math.ceil(this.left)} s` : `${Math.ceil(this.left)} s`;
    UI.minibar(`Fitness Bartory · Prueba ${this.ev + 1}/${EVENTS.length}: ${e.name} ${detail}`, { exit: () => this.exit() });
  }
  exit() {
    if (this.lock || UI.busy) return;
    this.lock = true; UI.minibar(null);
    this.scene.start('world');
  }
  debugWin() { if (!this.lock) { this.ev = EVENTS.length - 1; this.passed(); } }

  async retry(msg) {
    this.lock = true;
    Sound.sfx('bad');
    await UI.say('Bart', msg);
    this.begin();
  }

  // Prueba superada: siguiente o final
  async passed() {
    this.lock = true;
    Sound.sfx('get');
    await new Promise((r) => this.time.delayedCall(500, r));
    if (++this.ev < EVENTS.length) return this.begin();
    UI.minibar(null);
    const first = !State.flag('cali');
    State.set('cali');
    if (first) await SCRIPTS.bartWin();
    else await UI.say('Bart', '¡Otra tanda limpia! Mañana, agujetas. Pasado mañana, front lever. Bueno, pasado mañana no. En catorce meses.');
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('world'));
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000, e = EVENTS[Math.min(this.ev, EVENTS.length - 1)];
    this.bart.setTexture(`bart_down_${Math.floor(time / 260) % 2}`);
    if (!this.lock && !UI.busy) {
      if (Input.take('b')) return this.exit();
      const press = Input.take('a');
      if (e.k === 'pull') {
        // Precisión: la pulsación se juzga donde estaba el marcador EN EL MOMENTO de pulsar (lo que se veía en pantalla),
        // antes de moverlo en este fotograma y descontando lo que ha pasado desde la tecla. El marcador mide 3 px:
        // cuenta si cualquier parte suya toca la zona verde.
        if (press) {
          const lag = Math.min(0.08, Math.max(0, (performance.now() - (Input.t.a || performance.now())) / 1000));
          const x = Math.max(0, Math.min(X1 - X0, this.pos - this.dirn * e.speed * lag)) + X0;
          if (x < this.zx - 1.5 || x > this.zx + this.zw + 1.5) { Sound.sfx('bad'); this.cameras.main.shake(120, 0.004); UI.toast(QUIPS[Math.floor(Math.random() * QUIPS.length)]); }
          else {
            Sound.sfx('rep'); this.reps++;
            this.tweens.add({ targets: this, lift: 1, duration: 170, yoyo: true, ease: 'Quad.out' });
            if (this.reps >= e.reps) this.passed(); else this.newZone();
          }
        }
        this.pos += this.dirn * e.speed * dt;
        if (this.pos > X1 - X0) { this.pos = X1 - X0; this.dirn = -1; }
        if (this.pos < 0) { this.pos = 0; this.dirn = 1; }
      } else if (e.k === 'mash') {
        this.left -= dt;
        this.fill = Math.max(0, this.fill - e.decay * dt);
        if (press) { this.fill = Math.min(100, this.fill + e.gain); Sound.sfx('step'); this.lift = 1; }
        this.lift = Math.max(0, this.lift - dt * 7);
        if (this.fill >= 100) this.passed();
        else if (this.left <= 0) this.retry(`¡Tiempo! Te has quedado en el ${Math.round(this.fill)} %. Eso no es un sprint, es un paseo. ¡Otra vez, y más rápido!`);
      } else {
        this.left -= dt;
        const easy = Math.max(0.6, 1 - this.holdFails * 0.1); // −10 % de temblor por reintento (hasta −40 %)
        if ((this.windT -= dt) <= 0) { this.windT = 0.35 + Math.random() * 0.5; this.wind = (Math.random() * 2 - 1) * (2.2 + (e.time - this.left) * 0.16) * 0.9 * easy; } // ×0,9: un 10 % más suave
        const d = Input.dir().x;
        this.vel += (this.wind + d * 4.2) * dt;
        this.vel *= Math.exp(-1.2 * dt);
        this.bal += this.vel * dt;
        if (Math.abs(this.bal) > 1) { this.bal = Math.sign(this.bal); this.vel = 0; }
        if (Math.abs(this.bal) > 0.38) this.out += dt;
        if (this.out > e.miss + this.holdFails * 0.4) { this.holdFails++; this.retry('¡Se te ha caído la cadera! Glúteo apretado, abdomen apretado, carácter apretado. Desde el principio.'); } // y algo más de margen fuera de la zona
        else if (this.left <= 0) this.passed();
      }
      this.bar();
    } else Input.clear();

    // Colgadín: cuelga de la barra en las dominadas; en el suelo en las otras dos
    const m = this.meter.clear();
    this.cord.clear();
    if (e.k === 'pull') {
      const y = 92 - this.lift * 24;
      this.col.setPosition(160, y).setAngle(0).setTexture(`colgadin_down_${this.lift > 0.5 ? 1 : 0}`);
      this.cord.fillStyle(0x231a14).fillRect(159, 70, 2, Math.max(0, y - 66));
      m.fillStyle(0x1a1412).fillRect(X0 - 3, MY - 3, X1 - X0 + 6, 14).fillStyle(0x8a8f9a).fillRect(X0, MY, X1 - X0, 8);
      m.fillStyle(0x5aa648).fillRect(Math.round(this.zx), MY, this.zw, 8).fillStyle(0x9ad486).fillRect(Math.round(this.zx), MY, this.zw, 2);
      m.fillStyle(0xffffff).fillRect(Math.round(X0 + this.pos) - 1, MY - 5, 3, 18).fillStyle(0xe2574c).fillRect(Math.round(X0 + this.pos), MY - 5, 1, 18);
    } else if (e.k === 'mash') {
      this.col.setPosition(160, 98 - this.lift * 14).setAngle(0).setTexture(`colgadin_down_${this.lift > 0.3 ? 1 : 0}`);
      m.fillStyle(0x1a1412).fillRect(X0 - 3, MY - 3, X1 - X0 + 6, 14).fillStyle(0x8a8f9a).fillRect(X0, MY, X1 - X0, 8);
      m.fillStyle(this.fill > 75 ? 0x5aa648 : this.fill > 40 ? 0xffd23f : 0xe2574c).fillRect(X0, MY, (X1 - X0) * this.fill / 100, 8);
      m.fillStyle(0x1a1412).fillRect(X0 - 3, MY - 12, X1 - X0 + 6, 5).fillStyle(0x6fb4ee).fillRect(X0, MY - 11, (X1 - X0) * Math.max(0, this.left) / e.time, 3);
    } else {
      this.col.setPosition(160 + this.bal * 26, 100).setAngle(this.bal * 28).setTexture('colgadin_down_0');
      m.fillStyle(0x1a1412).fillRect(X0 - 3, MY - 3, X1 - X0 + 6, 14).fillStyle(0xe2574c).fillRect(X0, MY, X1 - X0, 8);
      const zw = (X1 - X0) * 0.38;
      m.fillStyle(0x5aa648).fillRect(MID - zw / 2, MY, zw, 8).fillStyle(0x9ad486).fillRect(MID - zw / 2, MY, zw, 2);
      m.fillStyle(0xffffff).fillRect(Math.round(MID + this.bal * (X1 - X0) / 2) - 1, MY - 5, 3, 18);
      m.fillStyle(0x1a1412).fillRect(X0 - 3, MY - 12, X1 - X0 + 6, 5).fillStyle(0x6fb4ee).fillRect(X0, MY - 11, (X1 - X0) * Math.max(0, this.left) / e.time, 3);
      m.fillStyle(0xe2574c).fillRect(X0, MY + 11, (X1 - X0) * Math.min(1, this.out / (e.miss + this.holdFails * 0.4)), 2);
    }
  }
}
