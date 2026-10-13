/* Числова права (P0, Skills Matrix M2/M10): пътека с деления 0..max.
   Ниво 1 „Постави числото“: показано число; детето докосва делението, където е мястото му. Надписани са само 0, max и опорите (5, 10, 15).
   Ниво 2 „Съседи“: число на правата; „Кое е точно след/преди N?“ – детето докосва делението.
   Настройки: ниво 1..2, най-голямо число 3..20, брой задачи 3..12. Норми 0 / 2 / 4. Измерва се по първи опит (базовият клас). */
(function () {
  const W = 1000, H = 400, X0 = 80, X1 = 920, Y = 250;
  class NumberLineGame extends BaseGame {
    get gameId() { return "numberLine"; }
    get skillName() { return Number(this.s.level) === 2 ? `Съседи на числата до ${this.s.max}` : `Числова права до ${this.s.max}`; }
    render() {
      this.level = Number(this.s.level || 1); this.max = Math.max(3, Math.min(20, Number(this.s.max || 10)));
      this.learnedLabels = new Set();
      const pool = []; for (let n = 1; n < this.max; n++) pool.push(n);
      this.items = []; while (this.items.length < this.total) { shuffle(pool); this.items.push(...pool); } this.items = this.items.slice(0, this.total);
      this.shell.arena.innerHTML = `<div class="nl-wrap"><div class="nl-card" id="nl-card"></div><svg class="nl" viewBox="0 0 ${W} ${H}" id="nl-svg" aria-label="Числова права"></svg></div>`;
      this.svg = this.shell.arena.querySelector("#nl-svg"); this.card = this.shell.arena.querySelector("#nl-card");
    }
    x(n) { return X0 + (X1 - X0) * n / this.max; }
    anchors() { const a = new Set([0, this.max]); if (this.max >= 10) [5, 10, 15].forEach(v => { if (v < this.max) a.add(v); }); if (this.max <= 9 && this.max >= 6) a.add(Math.round(this.max / 2)); return a; }
    draw(labels, marks) {
      const anch = this.anchors(); const ticks = [];
      for (let n = 0; n <= this.max; n++) {
        const x = this.x(n); const big = anch.has(n); const lab = anch.has(n) || labels.has(n); const m = marks[n] || "";
        ticks.push(`<g class="nl-tick ${m}" data-n="${n}" style="cursor:pointer"><rect x="${x - 18}" y="${Y - 40}" width="36" height="90" fill="transparent"/><line x1="${x}" y1="${Y - (big ? 22 : 14)}" x2="${x}" y2="${Y + (big ? 22 : 14)}" stroke="${m === "good" ? "#22A56A" : m === "bad" ? "#E2493F" : "#5B3A1E"}" stroke-width="${big ? 6 : 4}" stroke-linecap="round"/><circle cx="${x}" cy="${Y}" r="${m ? 15 : 9}" fill="${m === "good" ? "#22A56A" : m === "bad" ? "#E2493F" : lab ? "#F9A620" : "#FFF3D6"}" stroke="#5B3A1E" stroke-width="3"/>${lab || m ? `<text x="${x}" y="${Y + 58}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="${big ? 30 : 26}" fill="${m === "good" ? "#22A56A" : m === "bad" ? "#E2493F" : "#1D2B32"}">${n}</text>` : ""}</g>`);
      }
      this.svg.innerHTML = `<rect x="0" y="${Y + 90}" width="${W}" height="${H - Y - 90}" fill="#8FD17A" opacity=".55" rx="20"/><path d="M${X0 - 40} ${Y} L${X1 + 40} ${Y}" stroke="#C9A062" stroke-width="34" stroke-linecap="round"/><path d="M${X0 - 40} ${Y} L${X1 + 40} ${Y}" stroke="#E9D3A6" stroke-width="22" stroke-linecap="round"/>${ticks.join("")}`;
      this.svg.querySelectorAll(".nl-tick").forEach(g => g.addEventListener("pointerdown", () => this.tap(Number(g.dataset.n))));
    }
    startRound() {
      const n = this.items[this.idx];
      if (this.level === 2) { this.dir = rnd(2) ? 1 : -1; if (n + this.dir < 0 || n + this.dir > this.max) this.dir = -this.dir; this.target = n + this.dir; this.shown = n; this.card.innerHTML = `<span class="nl-q">Кое число е точно <b>${this.dir > 0 ? "след" : "преди"}</b></span><span class="nl-big">${n}</span><span class="nl-q">?</span>`; this.shell.setLabel(`Докосни делението на числото ${this.dir > 0 ? "след" : "преди"} ${n}.`); const labels = new Set(this.learnedLabels); labels.add(n); this.draw(labels, {}); }
      else { this.target = n; this.shown = null; this.card.innerHTML = `<span class="nl-q">Къде е мястото на</span><span class="nl-big">${n}</span><span class="nl-q">?</span>`; this.shell.setLabel(`Докосни делението, където е числото ${n}.`); this.draw(new Set(this.learnedLabels), {}); }
      this.say(this.level === 2 ? `Кое число е точно ${this.dir > 0 ? "след" : "преди"} ${n}?` : `Къде е мястото на ${n}?`);
    }
    tap(n) {
      if (this.locked || this.finished) return;
      const ok = n === this.target;
      if (!this.answer(ok, { text: this.level === 2 ? `${this.dir > 0 ? "след" : "преди"} ${this.shown}` : String(this.target), answer: String(this.target), given: String(n) })) return;
      const marks = {}; marks[this.target] = "good"; if (!ok) marks[n] = "bad";
      const labels = new Set(this.learnedLabels); if (this.shown != null) labels.add(this.shown); labels.add(this.target); this.learnedLabels.add(this.target); this.draw(labels, marks);
      this.shell.flash(ok ? "Точно така!" : `Мястото на ${this.target} е тук.`, ok ? "good" : "bad"); this.say(ok ? "Точно така!" : `${this.target} е тук.`);
      this.advance(ok ? 1100 : 1700);
    }
  }
  window.GAMES.numberLine = {
    id: "numberLine", name: "Числова права", module: "math", skill: "Числова права", cls: NumberLineGame,
    task: s => Number(s.level) === 2 ? "Докосни числото, което е точно преди или след показаното." : "Докосни делението, където е мястото на показаното число.",
    tiers: () => [0, 2, 4],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1 Постави числото на правата. 2 Съседи: числото преди или след." },
      { key: "max", label: "Най-голямо число", type: "range", min: 3, max: 20, def: 10, help: "Правата е от 0 до това число." },
      { key: "examples", label: "Брой задачи", type: "range", min: 3, max: 12, def: 5 }
    ],
    paramsLine: s => `ниво ${s.level} · до ${s.max} · ${s.examples} задачи`
  };
})();
