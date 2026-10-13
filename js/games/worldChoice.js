/* Околен свят: „Професии“ и „Обкръжалка“ (избор на карти). Общ базов клас за игри с избор на карти. */
(function () {
  class CardGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) { super(shell, settings, tier, onFinish); this.total = Number(this.s.exampleQty) || 4; this.timers = []; this.stepWrong = 0; this.roundOk = []; }
    renderProgress() { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); } }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    destroy() { this.timers.forEach(clearTimeout); super.destroy(); }
    shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
    miss(text, given) { this.wrong++; this.streak = 0; this.stepWrong++; this.log.push(this.event(false, { text, answer: text, given, ms: Date.now() - this.roundStart, attempt: true })); this.loseLife(); }
    done(text, delay = 1200) { this.correct++; this.renderScore(); this.log.push(this.event(true, { text, answer: text, given: text, ms: Date.now() - this.roundStart, first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 })); this.roundOk.push(this.stepWrong === 0); this.idx++; this.renderProgress(); this.locked = true; this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, delay); }
    scene(cls, sceneId) { this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#${sceneId || "scene-nature-game"}"/></svg><div class="az wt ${cls}" id="wt"></div>`; this.box = this.shell.arena.querySelector("#wt"); }
    card(html, extraCls = "") { return `<button type="button" class="pcard ${extraCls}">${html}</button>`; }
  }
  window.CardGame = CardGame;

  /* Професии: герой на професия + 6 карти, 2..4 от тях са предмети на професията; детето избира всичките без грешка. */
  class ProfessionsGame extends CardGame {
    get gameId() { return "professions"; } get skillName() { return "Професии и предмети"; }
    render() { this.scene("wt-prof"); this.used = new Set(); this.shell.setLabel("Кое е за тази професия?"); }
    startRound() {
      this.stepWrong = 0; const P = window.PROFESSIONS; let c = P.filter(p => !this.used.has(p[0])); if (!c.length) { this.used.clear(); c = P.slice(); }
      const prof = c[rnd(c.length)]; this.used.add(prof[0]); this.prof = prof;
      const need = 2 + rnd(3), right = shuffle(prof[2].slice()).slice(0, need);
      const others = P.filter(p => p[0] !== prof[0]).flatMap(p => p[2]); const wrong = shuffle(others).slice(0, 6 - need);
      this.right = new Set(right); this.left = need; this.items = shuffle(right.concat(wrong));
      this.box.innerHTML = `<div class="hero">${window.PIC(prof[1], "person", prof[0])}<div><h3>${prof[1]}</h3><p>Избери всички предмети, които са нужни за тази професия.</p></div></div><div class="pcards" id="cards">${this.items.map(n => this.card(window.PIC(n, "item"))).join("")}</div>`;
      [...this.box.querySelectorAll(".pcard")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, this.items[i]); }));
      this.say(`${prof[1]}. Кои предмети са му нужни?`);
    }
    tap(b, name) {
      if (this.finished || this.locked || b.classList.contains("good") || b.classList.contains("bad")) return;
      if (this.right.has(name)) { b.classList.add("good"); this.sayNone(); this.left--; if (this.left <= 0) { this.box.querySelectorAll(".pcard:not(.good)").forEach(x => x.classList.add("dim")); this.done(this.prof[1]); } }
      else { this.miss(this.prof[1], name); b.classList.add("bad"); this.shake(b); this.shell.flash(`„${name}“ не е за ${this.prof[1].toLowerCase()}`, "bad"); this.say(`${name} не е за ${this.prof[1]}`); this.later(() => this.shell.hideFlash(), 1300); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".pcard")].forEach((x, i) => { if (this.right.has(this.items[i]) && !x.classList.contains("good")) x.classList.add("hint"); }); }
    }
    sayNone() {}
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.professions = {
    id: "professions", name: "Професии", module: "theWorld", skill: "Професии и предмети", cls: ProfessionsGame,
    task: "Определи кои картинки са подходящи за съответната професия. Избери всички предмети на професията.",
    tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q / 2), q]; },
    settings: [{ key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 25, def: 4, help: "Колко професии ще види детето." }],
    paramsLine: s => `${s.exampleQty} професии`
  };

  /* Обкръжалка: 4 картинки по тема, под тях името на търсения предмет; един клик на рунд. */
  const THEMES = { mushrooms: ["Гъби", "mushroom"], transport: ["Транспорт", "transport"] };
  class OutwardGame extends CardGame {
    get gameId() { return "outwardThings"; } get skillName() { return "Разпознаване на предмети: " + THEMES[this.s.theme || "mushrooms"][0].toLowerCase(); }
    render() {
      const theme = this.s.theme || "mushrooms"; const content = ((window.BUK.world || {}).outwardThings || {})[theme];
      this.names = content ? Object.values(content) : (theme === "mushrooms" ? ["Манатарка", "Лисичка", "Печурка", "Мухоморка"] : ["Автобус", "Влак", "Самолет", "Лодка"]);
      this.cat = THEMES[theme][1]; this.scene("wt-out"); this.used = new Set(); this.shell.setLabel(THEMES[theme][0]);
    }
    startRound() {
      this.stepWrong = 0; let c = this.names.filter(n => !this.used.has(n)); if (!c.length) { this.used.clear(); c = this.names.slice(); }
      const right = c[rnd(c.length)]; this.used.add(right); this.right = right;
      this.items = shuffle([right].concat(shuffle(this.names.filter(n => n !== right)).slice(0, 3)));
      this.box.innerHTML = `<div class="pcards" id="cards">${this.items.map(n => this.card(window.PIC(n, this.cat))).join("")}</div><div class="qtext">Намери: ${right}</div>`;
      [...this.box.querySelectorAll(".pcard")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, this.items[i]); }));
      this.say(`Намери ${right}`);
    }
    tap(b, name) {
      if (this.finished || this.locked || b.classList.contains("bad")) return;
      if (name === this.right) { b.classList.add("good"); this.box.querySelectorAll(".pcard:not(.good)").forEach(x => x.classList.add("dim")); this.done(this.right); }
      else { this.miss(this.right, name); b.classList.add("bad"); this.shake(b); this.shell.flash(`Това е ${name.toLowerCase()}`, "bad"); this.say(`Това е ${name}`); this.later(() => this.shell.hideFlash(), 1300); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".pcard")].forEach((x, i) => { if (this.items[i] === this.right) x.classList.add("hint"); }); }
    }
  }
  window.GAMES.outwardThings = {
    id: "outwardThings", name: "Обкръжалка", module: "theWorld", skill: "Разпознаване на предмети", cls: OutwardGame,
    task: s => `Определи какъв предмет е изобразен на екрана. Тема: ${THEMES[s.theme || "mushrooms"][0].toLowerCase()}.`,
    tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q / 2), q]; },
    settings: [
      { key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 25, def: 4 },
      { key: "theme", label: "Тема", type: "cycle", options: [["mushrooms", "Гъби"], ["transport", "Транспорт"]], def: "mushrooms", help: "Гъби: 13 вида. Транспорт: 16 превозни средства." }
    ],
    paramsLine: s => `${s.exampleQty} примера · ${THEMES[s.theme || "mushrooms"][0].toLowerCase()}`
  };
})();
