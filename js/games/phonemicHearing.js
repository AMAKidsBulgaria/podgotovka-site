/* Фонематичен слух (Букварика).
   Ниво 1 „Избери картинка“: показана буква и 4 картинки; докосни тази, чието име започва с буквата.
   Ниво 2 „Напиши буквата“: до 4 картинки с еднаква първа буква; детето избира буквата от азбучна клавиатура. */
(function () {
  const ALPHA = "абвгдежзийклмнопрстуфхцчшщъьюя".split("");
  class PhonemicGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Number(this.s.level) || 1; this.total = Number(this.s.tasks) || 4; this.timers = []; this.stepWrong = 0; this.roundOk = []; this.used = new Set();
    }
    get gameId() { return "phonemicHearing"; }
    get skillName() { return this.level === 1 ? "Първи звук в думата: картинка" : "Първи звук в думата: буква"; }
    renderProgress() { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); } }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    destroy() { this.timers.forEach(clearTimeout); super.destroy(); }
    shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
    miss(text, given) { this.wrong++; this.streak = 0; this.stepWrong++; this.log.push(this.event(false, { text, answer: text, given, ok: false, ms: Date.now() - this.roundStart, adapt: 0 , attempt: true })); this.loseLife(); }
    done(text) { this.correct++; this.renderScore(); this.log.push(this.event(true, { text, answer: text, given: text, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 })); this.roundOk.push(this.stepWrong === 0); this.idx++; this.renderProgress(); this.locked = true; this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 900); }
    pickWord() { const W = window.BUK_WORDS; let c = W.filter(x => !this.used.has(x.w)); if (!c.length) { this.used.clear(); c = W.slice(); } const it = c[rnd(c.length)]; this.used.add(it.w); return it; }
    render() {
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg><div class="az ph" id="ph"></div>`;
      this.box = this.shell.arena.querySelector("#ph");
    }
    startRound() { this.stepWrong = 0; if (this.level === 1) this.startL1(); else this.startL2(); }
    card(it, cls) { return `<button type="button" class="ph-pic ${cls || ""}" aria-label="${it.w}">${window.BUK_PIC(it)}</button>`; }
    startL1() {
      const W = window.BUK_WORDS, right = this.pickWord(), l = right.w[0];
      const wrong = shuffle(W.filter(x => x.w[0] !== l)).slice(0, 3); this.cur = right;
      const opts = shuffle([right, ...wrong]);
      this.shell.setLabel(l.toUpperCase() + " " + l);
      this.box.innerHTML = `<div class="az-hint">Коя картинка започва с буквата „${l}“?</div><div class="ph-grid" id="grid">${opts.map(o => this.card(o)).join("")}</div>`;
      [...this.box.querySelectorAll(".ph-pic")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL1(b, opts[i]); }));
      this.say(`Коя картинка започва с ${l}?`);
    }
    tapL1(b, it) {
      if (this.finished || this.locked || b.classList.contains("bad")) return;
      if (it.w === this.cur.w) { b.classList.add("good"); this.done(this.cur.w); }
      else { this.miss(this.cur.w, it.w); b.classList.add("bad"); this.shake(b); this.shell.flash(`„${it.w}“ започва с „${it.w[0]}“`, "bad"); this.say(`${it.w} започва с ${it.w[0]}`); this.later(() => this.shell.hideFlash(), 1400); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".ph-pic")].find(x => x.getAttribute("aria-label") === this.cur.w).classList.add("hint"); }
    }
    startL2() {
      const W = window.BUK_WORDS, byL = {}; W.forEach(x => (byL[x.w[0]] = byL[x.w[0]] || []).push(x));
      const letters = Object.keys(byL).filter(l => !this.used.has("L" + l)); const l = letters.length ? letters[rnd(letters.length)] : Object.keys(byL)[0]; this.used.add("L" + l);
      const pics = shuffle(byL[l].slice()).slice(0, 4); this.cur = l;
      this.shell.setLabel("С коя буква започват?");
      this.box.innerHTML = `<div class="ph-grid small">${pics.map(o => this.card(o, "static")).join("")}</div><div class="ph-keys" id="keys">${ALPHA.map(k => `<button type="button" class="ph-key" data-l="${k}">${k}</button>`).join("")}</div>`;
      this.box.querySelectorAll(".ph-key").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tapL2(b); }));
      this.say("С коя буква започват имената на картинките?");
    }
    tapL2(b) {
      if (this.finished || this.locked) return;
      const k = b.dataset.l;
      if (k === this.cur) { b.classList.add("good"); this.done(this.cur); }
      else { this.miss(this.cur, k); this.shake(b); b.classList.add("bad"); this.shell.flash("Чуй първия звук на думите", "bad"); const names = [...this.box.querySelectorAll(".ph-pic")].map(x => x.getAttribute("aria-label")); this.say(names.join(", ")); this.later(() => this.shell.hideFlash(), 1400); if (this.stepWrong >= 2) this.box.querySelector(`.ph-key[data-l="${this.cur}"]`).classList.add("hint"); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.phonemicHearing = {
    id: "phonemicHearing", name: "Фонематичен слух", module: "bukvarica", skill: "Първи звук в думата", cls: PhonemicGame,
    task: s => Number(s.level) === 2 ? "Напиши буквата. Определи с коя буква започват имената на всички картинки и я избери." : "Избери картинка. Избери картинката, името на която започва с дадената буква.",
    tiers: () => [0, 1, 3],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1 Избери картинка: буква и 4 картинки. 2 Напиши буквата: картинки с обща първа буква, детето избира буквата." },
      { key: "tasks", label: "Брой задачи", type: "range", min: 1, max: 10, def: 4, help: "Колко задачи ще реши детето. В оригинала задачата е една." }
    ],
    paramsLine: s => `${Number(s.level) === 2 ? "Напиши буквата" : "Избери картинка"} · ${s.tasks} задачи`
  };
})();
