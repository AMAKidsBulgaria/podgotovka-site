/* Азбука (Букварика): 4 нива по оригинала.
   1 Намери чудовището: 30 карти с чудовища, докосни буквата, която е показана (по азбучен ред).
   2 Намери грешката: буквите идват по ред една по една; докосни тази, която не е на мястото си.
   3 Подреди подред: 3..6 поредни букви, докосни ги в правилния ред; серии по избор.
   4 Избери правилния път: лабиринт с 4 пътеки; следвай пътеката с азбуката по ред. */
(function () {
  const ALPHA = "абвгдежзийклмнопрстуфхцчшщъьюя".split("");
  const TITLES = { 1: "Намери чудовището", 2: "Намери грешката", 3: "Подреди подред", 4: "Избери правилния път" };
  const TASKS = { 1: "Подреди буквите от азбуката последователно: докосни буквата, която виждаш горе.", 2: "Буквите идват по азбучен ред. Премахни излишните букви, които не са на мястото си.", 3: "Постави буквите в правилната последователност.", 4: "Намери пътеката, по която буквите вървят по азбучен ред, и ги докосвай една след друга." };
  // Лабиринт 1200x600: мрежа от възли; 4 равностойни маршрута от старта до финала минават през общи
  // отсечки, затова се разклоняват и събират. Вярната пътека се избира на случаен принцип.
  const NX = [180, 370, 560, 750, 940], NY = [110, 300, 490];
  const N = (c, r) => [NX[c], NY[r]], S = [50, 300], F = [1140, 300];
  const ROUTES = [
    [S, N(0, 0), N(0, 2), N(1, 2), N(1, 0), N(2, 0), N(2, 2), N(3, 2), N(3, 0), N(4, 0), N(4, 2), F],
    [S, N(0, 1), N(1, 1), N(1, 0), N(2, 0), N(2, 1), N(3, 1), N(3, 2), N(4, 2), N(4, 1), F],
    [S, N(0, 2), N(1, 2), N(1, 1), N(2, 1), N(2, 2), N(3, 2), N(3, 1), N(4, 1), N(4, 0), F],
    [S, N(0, 0), N(0, 1), N(1, 1), N(1, 2), N(2, 2), N(2, 1), N(3, 1), N(3, 0), N(4, 0), N(4, 1), F]
  ];
  // Отсечка между два възела: крива с еднаква извивка независимо от посоката (общите отсечки съвпадат).
  function seg(a, b) {
    const rev = a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]); const p = rev ? b : a, q = rev ? a : b;
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const k = (p[0] * 31 + p[1] * 17 + q[0] * 13 + q[1] * 7) % 7, bulge = (k - 3) * 24;
    const c1 = [p[0] + dx * .3 + nx * bulge, p[1] + dy * .3 + ny * bulge], c2 = [p[0] + dx * .7 + nx * bulge, p[1] + dy * .7 + ny * bulge];
    const [u, v] = rev ? [c2, c1] : [c1, c2];
    return `C${u[0].toFixed(1)} ${u[1].toFixed(1)} ${v[0].toFixed(1)} ${v[1].toFixed(1)} ${b[0]} ${b[1]}`;
  }
  const routeD = pts => `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((b, i) => seg(pts[i], b)).join(" ");
  const BUSHES = [[275, 205], [465, 395], [655, 205], [845, 395], [1040, 200], [275, 395], [845, 205]];
  class AlphabetGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Number(this.s.level) || 1;
      this.n = Math.max(3, Math.min(6, Number(this.s.lettersQty) || 3));
      this.rounds = Math.max(1, Math.min(6, Number(this.s.rounds) || 3));
      this.total = this.level === 2 ? 10 : this.level === 3 ? this.n * this.rounds : ALPHA.length;
      this.roundOk = []; this.stepWrong = 0; this.timers = [];
    }
    get gameId() { return "alphabet"; }
    get skillName() { return "Азбука: ред на буквите"; }
    renderProgress() {
      const p = this.shell.progress; p.innerHTML = "";
      for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); }
    }
    // Верен ход: брои се като отговор; грешните докосвания преди него правят стъпката „с грешка“.
    hit(text) {
      if (this.finished) return false;
      this.locked = false;
      if (!this.answer(true, { text, answer: text, given: text })) return false;
      this.locked = false; this.roundOk.push(this.stepWrong === 0); this.stepWrong = 0; this.idx++;
      this.renderProgress(); return true;
    }
    // Грешно докосване: не затваря стъпката, но взима сърце и се записва.
    miss(text, given) {
      if (this.finished) return;
      this.wrong++; this.streak = 0; this.stepWrong++;
      this.log.push(this.event(false, { text, answer: text, given, ok: false, ms: Date.now() - this.roundStart, adapt: this.adapt , attempt: true }));
      this.loseLife();
    }
    skipped(text) { // пропусната буква (ниво 2)
      if (this.finished) return;
      this.wrong++; this.streak = 0;
      this.log.push(this.event(false, { text, answer: text, given: null, ok: false, ms: 0, adapt: 0  }));
      this.roundOk.push(false); this.idx++; this.renderProgress(); this.loseLife();
    }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    sayLetter(l) { this.say(l.toLowerCase()); }
    shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

    render() {
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg><div class="az" id="az"></div>`;
      this.box = this.shell.arena.querySelector("#az");
      ({ 1: this.renderL1, 2: this.renderL2, 3: this.renderL3, 4: this.renderL4 })[this.level].call(this);
    }
    startRound() {
      this.stepWrong = 0;
      ({ 1: this.startL1, 2: this.startL2, 3: this.startL3, 4: this.startL4 })[this.level].call(this);
    }
    destroy() { this.timers.forEach(clearTimeout); clearInterval(this.belt); super.destroy(); }

    /* ---------- ниво 1 ---------- */
    renderL1() {
      this.box.innerHTML = `<div class="az-grid" id="grid"></div>`;
      const grid = this.box.querySelector("#grid"); this.tiles = {};
      shuffle(ALPHA.slice()).forEach(l => {
        const b = document.createElement("button"); b.type = "button"; b.className = `az-tile az-mo mo${1 + rnd(6)}`;
        b.innerHTML = `<svg class="mo" viewBox="0 0 120 90" aria-hidden="true"><use href="#mo-${1 + rnd(6)}"/></svg><span>${l}</span>`;
        b.setAttribute("aria-label", `Буква ${l}`);
        b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL1(b, l); });
        grid.appendChild(b); this.tiles[l] = b;
      });
    }
    startL1() {
      this.cur = ALPHA[this.idx]; this.shell.setLabel(this.cur); this.sayLetter(this.cur);
      this.roundStart = Date.now();
    }
    tapL1(b, l) {
      if (this.finished || b.classList.contains("gone") || b.classList.contains("pop")) return;
      if (l === this.cur) {
        if (!this.hit(l)) return;
        b.classList.remove("hint"); b.classList.add("pop"); this.later(() => b.classList.add("gone"), 400);
        this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 350);
      } else {
        this.miss(this.cur, l); this.shake(b);
        this.shell.flash(`Търси буквата „${this.cur}“`, "bad"); this.say(`Не. Търси ${this.cur}`);
        if (this.stepWrong >= 2) this.tiles[this.cur].classList.add("hint");
        this.later(() => this.shell.hideFlash(), 1200);
      }
    }

    /* ---------- ниво 2 ---------- */
    renderL2() {
      this.box.innerHTML = `<div class="az-hint">Буквите идват по азбучен ред. Докосни тази, която не е на мястото си.</div><div class="az-row" id="row" aria-live="polite"></div><div class="az-belt"><i id="belt"></i></div>`;
      this.row = this.box.querySelector("#row"); this.beltEl = this.box.querySelector("#belt");
      // 10 излишни букви на случайни места; не до същата буква и не една до друга (както в оригинала)
      const seq = ALPHA.map(l => ({ l, bad: false })); let k = 0, guard = 0;
      while (k < 10 && guard++ < 500) {
        const l = ALPHA[rnd(ALPHA.length)], at = 1 + rnd(seq.length - 1), prev = seq[at - 1], next = seq[at];
        if (prev.l === l || (next && next.l === l) || prev.bad || (next && next.bad)) continue;
        seq.splice(at, 0, { l, bad: true }); k++;
      }
      this.seq = seq; this.pos = 0; this.stepMs = Math.round((Number(this.s.speed) || 1) * 1000);
      this.shell.setLabel("Кое е излишно?");
    }
    startL2() {
      this.roundStart = Date.now();
      const push = () => {
        if (this.finished) return;
        if (this.pos >= this.seq.length) { this.later(() => this.endL2(), this.stepMs); return; }
        const it = this.seq[this.pos++];
        const b = document.createElement("button"); b.type = "button"; b.className = "az-tile"; b.textContent = it.l; b.dataset.bad = it.bad ? "1" : "";
        b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL2(b); });
        this.row.appendChild(b);
        if (this.row.children.length > 6) { const old = this.row.firstElementChild; if (old.dataset.bad === "1" && !old.classList.contains("pop")) { this.skipped(old.textContent); this.shell.flash(`Пропусна „${old.textContent}“`, "bad"); this.later(() => this.shell.hideFlash(), 900); } old.remove(); }
        this.beltEl.style.width = Math.round(100 * this.pos / this.seq.length) + "%";
        this.later(push, this.stepMs);
      };
      push();
    }
    tapL2(b) {
      if (this.finished || b.classList.contains("pop")) return;
      if (b.dataset.bad === "1") { if (!this.hit(b.textContent)) return; b.classList.add("pop"); this.say("Точно така"); this.later(() => b.remove(), 400); if (this.roundOk.length >= this.total) this.later(() => this.finish(), 600); }
      else { this.miss("излишна буква", b.textContent); this.shake(b); this.shell.flash(`„${b.textContent}“ е на мястото си`, "bad"); this.later(() => this.shell.hideFlash(), 1000); }
    }
    endL2() {
      [...this.row.children].forEach(b => { if (b.dataset.bad === "1" && !b.classList.contains("pop")) this.skipped(b.textContent); });
      this.finish();
    }

    /* ---------- ниво 3 ---------- */
    renderL3() {
      this.box.innerHTML = `<div class="az-slots" id="slots"></div><div class="az-pick" id="pick"></div>`;
      this.slots = this.box.querySelector("#slots"); this.pick = this.box.querySelector("#pick");
      this.shell.setLabel("Подреди буквите");
    }
    startL3() {
      const start = rnd(ALPHA.length - this.n + 1); this.letters = ALPHA.slice(start, start + this.n); this.k = 0;
      this.slots.innerHTML = this.letters.map(l => `<span class="az-slot">${l}</span>`).join("");
      this.pick.innerHTML = "";
      shuffle(this.letters.slice()).forEach(l => {
        const b = document.createElement("button"); b.type = "button"; b.className = "az-tile"; b.textContent = l;
        b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL3(b, l); }); this.pick.appendChild(b);
      });
      this.roundStart = Date.now();
      this.say(`Подреди буквите от ${this.letters[0]} до ${this.letters[this.letters.length - 1]}`);
    }
    tapL3(b, l) {
      if (this.finished || b.classList.contains("used")) return;
      if (l === this.letters[this.k]) {
        if (!this.hit(l)) return;
        b.classList.add("used"); this.slots.children[this.k].classList.add("on"); this.k++; this.sayLetter(l);
        if (this.k >= this.letters.length) { this.shell.flash("Точно така!", "good"); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 900); }
      } else {
        this.miss(this.letters[this.k], l); this.shake(b);
        this.shell.flash(`След „${this.k ? this.letters[this.k - 1] : "…"}“ идва „${this.letters[this.k]}“`, "bad"); this.later(() => this.shell.hideFlash(), 1200);
        if (this.stepWrong >= 2) [...this.pick.children].find(x => x.textContent === this.letters[this.k]).classList.add("hint");
      }
    }

    /* ---------- ниво 4 ---------- */
    renderL4() {
      const svgNS = "http://www.w3.org/2000/svg";
      this.box.innerHTML = `<svg class="az-lab" viewBox="0 0 1200 600" id="lab" aria-label="Лабиринт"></svg>`;
      const svg = this.box.querySelector("#lab"); this.right = rnd(ROUTES.length);
      const ds = ROUTES.map(routeD);
      const path = (d, cls) => { const p = document.createElementNS(svgNS, "path"); p.setAttribute("d", d); p.setAttribute("class", cls); svg.appendChild(p); return p; };
      ds.forEach(d => path(d, "road-blob")); ds.forEach(d => path(d, "road")); const inner = ds.map(d => path(d, "road-in"));
      svg.insertAdjacentHTML("beforeend", `<g class="flag"><rect x="44" y="230" width="6" height="70" fill="#6B3A16"/><path d="M50 232 l44 12 -44 12z" fill="#5CC24A"/></g><g class="flag"><rect x="1142" y="230" width="6" height="70" fill="#6B3A16"/><path d="M1148 232 l44 12 -44 12z" fill="#E2493F"/></g>`);
      const placed = [], free = (x, y, d = 62) => placed.every(([px, py]) => Math.hypot(px - x, py - y) > d);
      const put = (x, y, l, real, i) => {
        placed.push([x, y]);
        const g = document.createElementNS(svgNS, "g"); g.setAttribute("class", "lt"); g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        g.innerHTML = `<circle r="26"/><text>${l.toUpperCase()}</text>`; g.dataset.l = l; g.dataset.real = real ? "1" : ""; g.dataset.i = i;
        g.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL4(g); }); svg.appendChild(g); return g;
      };
      // вярната пътека: азбуката на равни разстояния
      const mp = inner[this.right], L = mp.getTotalLength(), realPts = [];
      this.real = ALPHA.map((l, i) => { const pt = mp.getPointAtLength(L * (i + 0.5) / ALPHA.length); realPts.push([pt.x, pt.y]); return put(pt.x, pt.y, l, true, i); });
      // другите пътеки: букви, съседни в азбуката на най-близката вярна буква, но не тя и не следващата
      inner.forEach((p, r) => {
        if (r === this.right) return;
        const len = p.getTotalLength(), n = Math.round(len / 100);
        for (let k = 0; k < n; k++) {
          const pt = p.getPointAtLength(len * (k + 0.5) / n); if (!free(pt.x, pt.y)) continue;
          let near = 0, best = 1e9; realPts.forEach(([x, y], i) => { const d = Math.hypot(x - pt.x, y - pt.y); if (d < best) { best = d; near = i; } });
          const pool = []; for (let j = near - 3; j <= near + 4; j++) if (j >= 0 && j < ALPHA.length && j !== near && j !== near + 1) pool.push(ALPHA[j]);
          put(pt.x, pt.y, pool[rnd(pool.length)], false, -1);
        }
      });
      BUSHES.forEach(([x, y]) => { if (free(x, y, 48)) svg.insertAdjacentHTML("beforeend", `<g class="flag" transform="translate(${x} ${y})"><ellipse cx="0" cy="10" rx="24" ry="7" fill="#5FA84A" opacity=".5"/><circle cx="-11" cy="0" r="12" fill="#5CB24A"/><circle cx="9" cy="-4" r="14" fill="#6BC24A"/><circle cx="0" cy="6" r="11" fill="#4E9A3A"/></g>`); });
      this.shell.setLabel("Следвай пътя");
    }
    startL4() { this.cur = ALPHA[this.idx]; this.roundStart = Date.now(); if (this.idx === 0) this.say("Намери пътеката с азбуката и докосвай буквите по ред. Започни с а."); }
    tapL4(g) {
      if (this.finished || g.classList.contains("gone")) return;
      if (g.dataset.real === "1" && g.dataset.l === this.cur) {
        if (!this.hit(this.cur)) return;
        g.classList.remove("hint"); g.classList.add("gone"); this.sayLetter(this.cur);
        this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 120);
      } else {
        this.miss(this.cur, g.dataset.l); this.shake(g);
        this.shell.flash(g.dataset.l === this.cur ? "Тази буква е на друга пътека" : `След „${this.idx ? ALPHA[this.idx - 1] : "…"}“ идва „${this.cur}“`, "bad"); this.later(() => this.shell.hideFlash(), 1200);
        if (this.stepWrong >= 2) this.real[this.idx].classList.add("hint");
      }
    }
  }

  window.GAMES = window.GAMES || {};
  window.GAMES.alphabet = {
    id: "alphabet", name: "Азбука", module: "bukvarica", skill: "Азбука: ред на буквите", cls: AlphabetGame,
    task: s => `${TITLES[Number(s.level) || 1]}. ${TASKS[Number(s.level) || 1]}`,
    tiers: s => ({ 1: [4, 9, 15], 2: [2, 5, 8], 3: [0, 1, 2], 4: [4, 9, 15] })[Number(s.level) || 1],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 4, def: 1, help: "1 Намери чудовището: цялата азбука по ред. 2 Намери грешката: буквите идват една по една, детето маха излишните. 3 Подреди подред: няколко поредни букви. 4 Избери правилния път: лабиринт с разклонения, в който само една пътека следва азбуката." },
      { key: "speed", label: "Скорост", type: "range", min: 1, max: 5, step: 0.5, def: 1, unit: "сек.", enabledIf: s => Number(s.level) === 2, help: "Само за ниво 2: през колко секунди идва нова буква. 1 е най-бързо, 5 най-бавно. Започнете с 2 или 3 секунди." },
      { key: "lettersQty", label: "Букви подред", type: "range", min: 3, max: 6, def: 3, enabledIf: s => Number(s.level) === 3, help: "Само за ниво 3: колко поредни букви се подреждат в една серия." },
      { key: "rounds", label: "Брой серии", type: "range", min: 1, max: 6, def: 3, enabledIf: s => Number(s.level) === 3, help: "Само за ниво 3: колко серии с различни букви ще изиграе детето. В оригинала серията е една; препоръчваме 3, за да има достатъчно упражнение." }
    ],
    paramsLine: s => { const l = Number(s.level) || 1; return TITLES[l] + (l === 2 ? ` · ${s.speed} сек. на буква` : l === 3 ? ` · ${s.lettersQty} букви · ${s.rounds} серии` : " · цялата азбука"); }
  };
})();
