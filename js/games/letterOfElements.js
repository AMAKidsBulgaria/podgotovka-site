/* Елементи на букви (Букварика).
   Ниво 1 „Неправилни букви“: 6 букви, 1..4 от тях са обърнати (завъртени на 180°); докосни обърнатите — те се изправят.
   Ниво 2 „Събери буквата“: голяма буква със скрити щрихи; долу нейните елементи + до 3 чужди; докосни само нейните. */
(function () {
  // Печатни главни букви като щрихи в поле 100x150 (собствени данни).
  const L = {
    "А": ["M15 135 L50 15", "M50 15 L85 135", "M30 95 H70"], "Б": ["M22 15 V135", "M22 15 H80", "M22 72 H58 a31 31 0 0 1 0 63 H22"],
    "В": ["M22 15 V135", "M22 15 H56 a26 26 0 0 1 0 55 H22", "M22 70 H60 a32 32 0 0 1 0 65 H22"], "Г": ["M22 135 V15", "M22 15 H82"],
    "Д": ["M32 108 L46 15", "M46 15 H70", "M70 15 L84 108", "M14 140 V108 H96 V140"], "Е": ["M22 15 V135", "M22 15 H80", "M22 72 H66", "M22 135 H80"],
    "Ж": ["M50 15 V135", "M14 15 L50 72 L14 135", "M86 15 L50 72 L86 135"], "З": ["M22 34 a30 26 0 1 1 32 36 H44", "M54 70 a34 34 0 1 1 -34 46"],
    "И": ["M22 135 V15", "M22 135 L80 15", "M80 15 V135"], "Й": ["M22 135 V30", "M22 135 L80 30", "M80 30 V135", "M36 8 q14 14 28 0"],
    "К": ["M22 15 V135", "M82 15 L22 78", "M42 60 L86 135"], "Л": ["M14 135 L40 15", "M40 15 H82", "M82 15 V135"],
    "М": ["M14 135 V15", "M14 15 L50 85", "M50 85 L86 15", "M86 15 V135"], "Н": ["M22 15 V135", "M80 15 V135", "M22 75 H80"],
    "О": ["M50 15 a36 60 0 0 0 0 120", "M50 15 a36 60 0 0 1 0 120"], "П": ["M22 135 V15", "M22 15 H80", "M80 15 V135"],
    "Р": ["M22 15 V135", "M22 15 H58 a31 31 0 0 1 0 62 H22"], "С": ["M84 36 a40 60 0 1 0 0 78"], "Т": ["M14 15 H86", "M50 15 V135"],
    "У": ["M14 15 L50 82", "M86 15 L28 135"], "Ф": ["M50 15 V135", "M50 34 a30 33 0 1 0 0 66", "M50 34 a30 33 0 1 1 0 66"],
    "Х": ["M14 15 L86 135", "M86 15 L14 135"], "Ц": ["M22 15 V130", "M22 130 H82", "M82 15 V130", "M84 125 V145"],
    "Ч": ["M22 15 V62 a29 29 0 0 0 58 0", "M80 15 V135"], "Ш": ["M20 15 V135", "M50 15 V135", "M80 15 V135", "M20 135 H80"],
    "Щ": ["M20 15 V130", "M50 15 V130", "M80 15 V130", "M20 130 H84", "M84 125 V145"], "Ъ": ["M12 15 H40", "M40 15 V135", "M40 72 H68 a31 31 0 0 1 0 63 H40"],
    "Ь": ["M30 15 V135", "M30 72 H62 a31 31 0 0 1 0 63 H30"], "Ю": ["M14 15 V135", "M14 75 H34", "M62 15 a26 60 0 0 0 0 120", "M62 15 a26 60 0 0 1 0 120"],
    "Я": ["M80 15 V135", "M80 15 H44 a30 30 0 0 0 0 60 H80", "M64 75 L28 135"]
  };
  const TITLES = { 1: "Неправилни букви", 2: "Събери буквата" };
  const ALPHA = "абвгдежзийклмнопрстуфхцчшщъьюя";
  function learned(n) { const plan = (window.BUK["lesson-plan-letters"] || {}).lessonPlanLetters || []; const s = new Set(); for (let i = 0; i < Math.min(n, plan.length); i++) [...plan[i]].forEach(l => s.add(l)); return s; }
  const svg = (paths, cls, extra = "") => `<svg viewBox="0 0 100 150" ${extra}>${paths.map((d, i) => `<path d="${d}" class="${cls}" data-i="${i}"/>`).join("")}</svg>`;

  class ElementsGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Number(this.s.level) || 1; this.rounds = Math.max(1, Math.min(6, Number(this.s.rounds) || 3)); this.total = this.rounds;
      this.timers = []; this.stepWrong = 0; this.roundOk = [];
    }
    get gameId() { return "letterOfElements"; }
    get skillName() { return this.level === 1 ? "Разпознаване на обърнати букви" : "Елементи на буквите"; }
    renderProgress() { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); } }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    destroy() { this.timers.forEach(clearTimeout); super.destroy(); }
    shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
    miss(text, given) { this.wrong++; this.streak = 0; this.stepWrong++; this.log.push(this.event(false, { text, answer: text, given, ok: false, ms: Date.now() - this.roundStart, adapt: 0 , attempt: true })); this.loseLife(); }
    roundDone(text) {
      this.correct++; this.renderScore(); this.log.push(this.event(true, { text, answer: text, given: text, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 }));
      this.roundOk.push(this.stepWrong === 0); this.idx++; this.renderProgress(); this.locked = true;
      this.shell.flash("Точно така!", "good"); this.say("Точно така!");
      this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 900);
    }
    render() {
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg><div class="az le" id="le"></div>`;
      this.box = this.shell.arena.querySelector("#le");
      this.shell.setLabel(this.level === 1 ? "Кои са обърнати?" : "Събери буквата");
      if (this.level === 2) { const set = learned(Number(this.s.lessonNumber) || 3); this.letters = Object.keys(L).filter(k => set.has(k.toLowerCase())); if (this.letters.length < 2) this.letters = Object.keys(L); this.letters = shuffle(this.letters.slice()); }
    }
    startRound() { this.stepWrong = 0; if (this.level === 1) this.startL1(); else this.startL2(); }
    /* ниво 1 */
    startL1() {
      const info = window.BUK.alphabet || {}, noRot = info.lettersWithoutRotation || "жнофх";
      const n = Math.max(1, Math.min(4, Math.round(0.7 + Math.random() * 3.4)));
      const bad = shuffle([...ALPHA].filter(l => !noRot.includes(l))).slice(0, n);
      const good = shuffle([...ALPHA].filter(l => !bad.includes(l))).slice(0, 6 - n);
      this.items = shuffle(bad.map(l => ({ l, bad: true })).concat(good.map(l => ({ l, bad: false })))); this.left = n;
      this.box.innerHTML = `<div class="az-hint">Някои букви са обърнати наопаки. Докосни ги, за да ги изправиш.</div><div class="le-row" id="row"></div>`;
      const row = this.box.querySelector("#row");
      this.items.forEach(it => { const b = document.createElement("button"); b.type = "button"; b.className = "az-tile le-tile"; b.innerHTML = `<span class="${it.bad ? "flip" : ""}">${it.l}</span>`; b.setAttribute("aria-label", `Буква ${it.l}`); b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL1(b, it); }); row.appendChild(b); });
      this.say("Кои букви са обърнати?");
    }
    tapL1(b, it) {
      if (this.finished || this.locked) return;
      if (it.bad && !it.done) { it.done = true; b.querySelector("span").classList.remove("flip"); b.classList.add("fixed"); this.sayLetter(it.l); this.left--; if (this.left <= 0) this.roundDone(this.items.filter(x => x.bad).map(x => x.l).join(" ")); }
      else { this.miss("обърната буква", it.l); this.shake(b); this.shell.flash(it.done ? `„${it.l}“ вече е изправена` : `„${it.l}“ е правилна`, "bad"); this.later(() => this.shell.hideFlash(), 1100); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".le-tile")].forEach((t, i) => { if (this.items[i].bad && !this.items[i].done) t.classList.add("hint"); }); }
    }
    sayLetter(l) { this.say(l); }
    /* ниво 2 */
    startL2() {
      const letter = this.letters[this.idx % this.letters.length], strokes = L[letter]; this.cur = letter; this.need = strokes.length; this.got = 0;
      const others = Object.keys(L).filter(k => k !== letter), decoys = [];
      let guard = 0; while (decoys.length < 3 && guard++ < 60) { const k = others[rnd(others.length)], d = L[k][rnd(L[k].length)]; if (!strokes.includes(d) && !decoys.includes(d)) decoys.push(d); }
      const elems = shuffle(strokes.map((d, i) => ({ d, i })).concat(decoys.map(d => ({ d, i: -1 }))));
      this.box.innerHTML = `<div class="az-hint">Намери всички елементи на буквата „${letter}“.</div><div class="le-big">${svg(strokes, "st hid")}</div><div class="le-elems" id="elems"></div>`;
      this.big = this.box.querySelector(".le-big svg"); const el = this.box.querySelector("#elems"); if (elems.length > 5) el.classList.add("many");
      elems.forEach(e => { const b = document.createElement("button"); b.type = "button"; b.className = "az-tile le-elem"; b.innerHTML = svg([e.d], "st"); b.setAttribute("aria-label", e.i >= 0 ? "Елемент от буквата" : "Чужд елемент"); b.addEventListener("pointerdown", ev => { ev.preventDefault(); this.tapL2(b, e); }); el.appendChild(b); });
      this.say(`Събери буквата ${letter}`);
    }
    tapL2(b, e) {
      if (this.finished || this.locked || b.classList.contains("gone")) return;
      if (e.i >= 0) { b.classList.add("pop"); this.later(() => b.classList.add("gone"), 400); this.big.querySelector(`path[data-i="${e.i}"]`).classList.remove("hid"); this.got++; if (this.got >= this.need) { this.big.classList.add("done"); this.sayLetter(this.cur); this.roundDone(this.cur); } }
      else { this.miss(this.cur, "чужд елемент"); this.shake(b); this.shell.flash(`Този елемент не е от „${this.cur}“`, "bad"); this.later(() => this.shell.hideFlash(), 1100); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".le-elem")].forEach((t, k) => { const q = t.querySelector("path").getAttribute("d"); if (L[this.cur].includes(q) && !t.classList.contains("gone")) t.classList.add("hint"); }); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.letterOfElements = {
    id: "letterOfElements", name: "Елементи на букви", module: "bukvarica", skill: "Елементи на буквите", cls: ElementsGame,
    task: s => Number(s.level) === 2 ? "Събери буквата. Намери всички елементи на дадената буква и не докосвай чуждите." : "Неправилни букви. Избери буквите, които са обърнати наопаки.",
    tiers: s => Number(s.level) === 2 ? [0, 2, 4] : [0, 1, 3],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1 Неправилни букви: сред 6 букви 1 до 4 са обърнати; детето ги изправя. 2 Събери буквата: избира елементите, от които е съставена буквата." },
      { key: "lessonNumber", label: "Номер на урока", type: "range", min: 1, max: 14, def: 3, enabledIf: s => Number(s.level) === 2, help: "Само за ниво 2: буквите са от изучените до този урок." },
      { key: "rounds", label: "Брой серии", type: "range", min: 1, max: 6, def: 3, help: "Колко серии (групи букви или букви за събиране) ще изиграе детето. В оригинала серията е една." }
    ],
    paramsLine: s => `${TITLES[Number(s.level) || 1]} · ${s.rounds} серии` + (Number(s.level) === 2 ? ` · урок ${s.lessonNumber}` : "")
  };
})();
