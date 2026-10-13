/* Околен свят: „Криеница“ (нови предмети на полето) и „Запоминалка“ (запомни числата на полето). */
(function () {
  const ITEMS = ["ябълка", "топка", "книга", "чадър", "ключ", "шапка", "часовник", "цвете", "звезда", "риба", "къща", "кола", "мече", "лодка", "балон", "торта", "обувка", "фенер", "чаша", "кукла"];
  /* Криеница: поле 5x4 с 20 скривалища; всяка серия се появяват N нови предмета; детето докосва нов предмет (нива 1,2) или всички нови (нива 3,4). Нива 2 и 4 са с таймер. */
  class HideAndSeekGame extends CardGame {
    constructor(...a) {
      super(...a); this.level = Number(this.s.level) || 1; this.n = Number(this.s.newItemQty) || 2; this.timed = this.level === 2 || this.level === 4; this.gameTime = Number(this.s.gameTime) || 30;
      this.total = Math.ceil(18 / this.n); this.timers = [];
    }
    get gameId() { return "hideAndSeek"; } get skillName() { return "Внимание: нови предмети"; }
    tick() {
      if (!this.timed) return super.tick();
      const left = Math.max(0, this.gameTime - Math.floor((Date.now() - this.startedAt) / 1000));
      this.shell.timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left <= 0 && !this.finished) { this.finished = true; this.shell.flash("Времето изтече", "bad"); setTimeout(() => this.finish(true), 1200); }
    }
    render() {
      this.scene("wt-hs"); this.shell.setLabel(this.level >= 3 ? "Докосни всички нови" : "Докосни новия предмет");
      this.order = shuffle(ITEMS.slice()); this.shown = new Set(); this.pos = 0;
      this.box.innerHTML = `<div class="hs-board" id="board">${Array.from({ length: 20 }, (_, i) => `<button type="button" class="hs-spot" data-i="${i}"><span class="hs-bush"></span></button>`).join("")}</div>`;
      this.spots = [...this.box.querySelectorAll(".hs-spot")];
      this.spots.forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      // първата серия показва 2 предмета без въпрос
      this.place(2); this.pos = 2; this.say("Запомни какво има на полето.");
    }
    place(k) {
      const free = this.spots.map((_, i) => i).filter(i => !this.shown.has(i)); const picks = shuffle(free).slice(0, k); this.fresh = new Set();
      picks.forEach(i => { this.shown.add(i); this.fresh.add(i); const b = this.spots[i]; b.classList.add("has", "pop-in"); b.innerHTML = window.PIC(this.order[i], "item"); });
      return picks;
    }
    startRound() {
      this.stepWrong = 0; this.spots.forEach(b => b.classList.remove("pop-in", "good", "bad"));
      if (this.shown.size >= 20) { this.finish(); return; }
      this.later(() => { this.place(Math.min(this.n, 20 - this.shown.size)); this.left = this.fresh.size; this.roundStart = Date.now(); this.locked = false; }, 700);
      this.locked = true;
    }
    tap(b) {
      if (this.finished || this.locked || !b.classList.contains("has")) return;
      const i = Number(b.dataset.i);
      if (this.fresh.has(i) && !b.classList.contains("good")) {
        b.classList.add("good"); this.left--;
        if (this.level <= 2 || this.left <= 0) { this.spots.forEach(x => { if (this.fresh.has(Number(x.dataset.i))) x.classList.add("good"); }); this.done("нов предмет", 900); }
      } else {
        this.miss("нов предмет", this.order[i]); b.classList.add("bad"); this.shake(b); this.shell.flash("Този предмет беше тук и преди", "bad"); this.later(() => this.shell.hideFlash(), 1200);
        if (this.level >= 3) { this.roundOk.push(false); this.idx++; this.renderProgress(); this.locked = true; this.later(() => this.nextRound(), 1200); }
        else if (this.stepWrong >= 2) this.spots.forEach(x => { if (this.fresh.has(Number(x.dataset.i))) x.classList.add("hint"); });
      }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.hideAndSeek = {
    id: "hideAndSeek", name: "Криеница", module: "theWorld", skill: "Внимание", cls: HideAndSeekGame,
    task: s => ({ 1: "Кликни върху някой от новите елементи, които се появяват на екрана. Играта приключва, когато полето се запълни.", 2: "Кликни върху някой от новите елементи. Побързай да попълниш полето, преди да изтече времето.", 3: "Кликни върху всички нови елементи, които се появяват на екрана.", 4: "Кликни върху всички нови елементи, преди да изтече времето." })[Number(s.level) || 1],
    tiers: () => [0, 2, 4],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 4, def: 1, help: "1 и 2: един нов предмет на серия. 3 и 4: всички нови. 2 и 4 са с време." },
      { key: "newItemQty", label: "Брой предмети", type: "range", min: 2, max: 4, def: 2, help: "Колко нови предмета се появяват на всяка серия." },
      { key: "gameTime", label: "Време за игра", type: "range", min: 30, max: 180, step: 10, def: 30, unit: "сек.", enabledIf: s => [2, 4].includes(Number(s.level)) }
    ],
    paramsLine: s => `ниво ${s.level} · по ${s.newItemQty} нови` + ([2, 4].includes(Number(s.level)) ? ` · ${s.gameTime} сек.` : "")
  };

  /* Запоминалка: числа върху карти на поле; за кратко се показват някои; ниво 1 — намери показаното число; нива 2 и 3 — докосни показаните във възходящ/низходящ ред. */
  class MemoryStickGame extends CardGame {
    constructor(...a) { super(...a); this.level = Number(this.s.level) || 1; const [c, r] = (this.s.gameFieldSize || "3x3").split("x").map(Number); this.cols = c; this.rows = r; this.cells = c * r; this.total = Number(this.s.exampleQty) || 4; this.counter = 3; this.run = 0; this.lastOk = null; }
    get gameId() { return "memoryStick"; } get skillName() { return "Памет за числа и места"; }
    render() { this.scene("wt-ms"); this.shell.setLabel(this.level === 1 ? "Къде е числото?" : this.level === 2 ? "Във възходящ ред" : "В низходящ ред"); this.box.innerHTML = `<div class="ms-board" id="board" style="--cols:${this.cols}"></div><div class="qtext ms-q" id="q"></div>`; this.board = this.box.querySelector("#board"); this.q = this.box.querySelector("#q"); }
    startRound() {
      this.stepWrong = 0; this.locked = true; const nums = shuffle(Array.from({ length: this.cells }, (_, i) => i));
      this.board.innerHTML = nums.map(n => `<button type="button" class="ms-card" data-n="${n}"><span class="ms-face">${n}</span><span class="ms-back"></span></button>`).join("");
      this.cards = [...this.board.querySelectorAll(".ms-card")]; this.cards.forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      const k = Math.min(this.counter, this.cells); this.flash = shuffle(nums.slice()).slice(0, k);
      this.q.textContent = "Запомни…"; this.cards.forEach(b => { if (this.flash.includes(Number(b.dataset.n))) b.classList.add("open"); });
      if (this.level === 1) { this.target = this.flash[rnd(k)]; this.seq = [this.target]; }
      else { this.seq = this.flash.slice().sort((a, b) => this.level === 2 ? a - b : b - a); }
      this.pos = 0;
      this.later(() => { this.cards.forEach(b => b.classList.remove("open")); this.q.textContent = this.level === 1 ? `Намери числото ${this.target}` : (this.level === 2 ? "Докосни показаните числа от най-малкото към най-голямото" : "Докосни показаните числа от най-голямото към най-малкото"); this.say(this.q.textContent); this.roundStart = Date.now(); this.locked = false; }, 4500);
    }
    adapt2(ok) { if (this.lastOk === ok) this.run++; else { this.run = 1; this.lastOk = ok; } if (this.run >= 3) { this.counter = Math.max(3, Math.min(this.cells, this.counter + (ok ? 1 : -1))); this.run = 0; } }
    tap(b) {
      if (this.finished || this.locked || b.classList.contains("open")) return;
      const n = Number(b.dataset.n);
      if (n === this.seq[this.pos]) { b.classList.add("open", "good"); this.pos++; if (this.pos >= this.seq.length) { this.adapt2(true); this.done(this.seq.join(" "), 1000); } }
      else { this.miss(String(this.seq[this.pos]), String(n)); b.classList.add("open", "bad"); this.shake(b); this.shell.flash(this.level === 1 ? `Търсеното число е ${this.target}` : `Следващото е ${this.seq[this.pos]}`, "bad"); this.adapt2(false); this.roundOk.push(false); this.idx++; this.renderProgress(); this.locked = true; this.cards.forEach(x => { if (this.seq.includes(Number(x.dataset.n))) x.classList.add("open"); }); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 1500); }
    }
  }
  window.GAMES.memoryStick = {
    id: "memoryStick", name: "Запоминалка", module: "theWorld", skill: "Памет", cls: MemoryStickGame,
    task: s => ({ 1: "Запомни местоположението на числата на полето и намери даденото число.", 2: "Запомни местоположението на числата и ги подреди във възходящ ред.", 3: "Запомни местоположението на числата и ги подреди в низходящ ред." })[Number(s.level) || 1],
    tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 3, def: 1 },
      { key: "gameFieldSize", label: "Размер на полето", type: "cycle", options: [["3x3", "3 × 3"], ["4x3", "4 × 3"], ["5x4", "5 × 4"]], def: "3x3" },
      { key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `ниво ${s.level} · поле ${s.gameFieldSize} · ${s.exampleQty} примера`
  };
})();
