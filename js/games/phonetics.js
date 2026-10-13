/* Фонетика (Букварика): картинка и първата буква на думата; детето определя с какъв звук започва.
   Ниво 2 „Звучни и беззвучни“ (само думи със съгласна), ниво 3 „Гласни и съгласни“. Ниво 1 „Твърди и меки“ не се ползва за български. */
(function () {
  const TITLES = { 2: "Звучни и беззвучни", 3: "Гласни и съгласни" };
  function types() { const a = (window.BUK.alphabet || {}).lettersTypes || {}; return { vowel: a.vowel || "аъоуеи", voiced: a.voised || "бвгджзмлнрй", unvoiced: a.notVoised || "пфктшсчцх" }; }
  function learned(n) { const plan = (window.BUK["lesson-plan-letters"] || {}).lessonPlanLetters || []; const s = new Set(); for (let i = 0; i < Math.min(n, plan.length); i++) [...plan[i]].forEach(l => s.add(l)); return s; }
  class PhoneticsGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Math.max(2, Number(this.s.level) || 2); this.total = Number(this.s.answersQty) || 2; this.timers = []; this.stepWrong = 0; this.roundOk = []; this.used = new Set();
      const T = types(), L = learned(Number(this.s.lessonNumber) || 3);
      const all = window.BUK_WORDS.filter(x => T.vowel.includes(x.w[0]) || T.voiced.includes(x.w[0]) || T.unvoiced.includes(x.w[0]));
      let pool = all.filter(x => L.has(x.w[0]) && (this.level === 3 || !T.vowel.includes(x.w[0])));
      if (pool.length < 4) pool = all.filter(x => this.level === 3 || !T.vowel.includes(x.w[0]));
      this.pool = pool; this.T = T;
      this.chips = this.level === 2 ? [["voiced", "звучна", "chip-grey-voiced"], ["unvoiced", "беззвучна", "chip-grey-unvoiced"]] : [["vowel", "гласна", "chip-vowel"], ["consonant", "съгласна", "chip-hard"]];
    }
    get gameId() { return "phonetics"; }
    get skillName() { return this.level === 2 ? "Звучни и беззвучни съгласни" : "Гласни и съгласни"; }
    kind(l) { return this.level === 2 ? (this.T.voiced.includes(l) ? "voiced" : "unvoiced") : (this.T.vowel.includes(l) ? "vowel" : "consonant"); }
    renderProgress() { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); } }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    destroy() { this.timers.forEach(clearTimeout); super.destroy(); }
    render() {
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg>
        <div class="az fo"><div class="fo-card"><div class="fo-letter" id="letter"></div><div class="fo-pic" id="pic"></div><div class="fo-word" id="word"></div></div>
        <div class="sp-chips" id="chips">${this.chips.map(([k, label, sym]) => `<button type="button" class="sp-chip" data-t="${k}" aria-label="${label}"><svg viewBox="0 0 100 100"><use href="#${sym}"/></svg><span>${label}</span></button>`).join("")}</div></div>`;
      this.shell.arena.querySelectorAll(".sp-chip").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      this.shell.setLabel(TITLES[this.level]);
    }
    startRound() {
      this.stepWrong = 0; this.shell.arena.querySelectorAll(".sp-chip").forEach(c => c.classList.remove("hint"));
      let c = this.pool.filter(x => !this.used.has(x.w)); if (!c.length) { this.used.clear(); c = this.pool.slice(); }
      this.cur = c[rnd(c.length)]; this.used.add(this.cur.w); const l = this.cur.w[0];
      this.shell.arena.querySelector("#letter").textContent = l.toUpperCase() + l;
      this.shell.arena.querySelector("#pic").innerHTML = window.BUK_PIC(this.cur);
      this.shell.arena.querySelector("#word").textContent = this.cur.w;
      this.say(`${this.cur.w}. С какъв звук започва?`);
    }
    tap(b) {
      if (this.finished || this.locked) return;
      const l = this.cur.w[0], want = this.kind(l), got = b.dataset.t;
      if (got === want) {
        this.locked = true; this.correct++; this.renderScore(); this.log.push(this.event(true, { text: this.cur.w, answer: want, given: got, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 }));
        this.roundOk.push(this.stepWrong === 0); this.idx++; this.renderProgress();
        this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 800);
      } else {
        this.wrong++; this.streak = 0; this.stepWrong++; this.log.push(this.event(false, { text: this.cur.w, answer: want, given: got, ok: false, ms: Date.now() - this.roundStart, adapt: 0 , attempt: true }));
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
        const name = { vowel: "гласна", consonant: "съгласна", voiced: "звучна", unvoiced: "беззвучна" }[want];
        this.shell.flash(`„${l}“ е ${name}`, "bad"); this.say(`Не. ${l} е ${name}`); this.later(() => this.shell.hideFlash(), 1300);
        if (this.stepWrong >= 2) this.shell.arena.querySelector(`.sp-chip[data-t="${want}"]`).classList.add("hint");
        this.loseLife();
      }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.phonetics = {
    id: "phonetics", name: "Фонетика", module: "bukvarica", skill: "Видове звукове", cls: PhoneticsGame,
    task: s => `${TITLES[Math.max(2, Number(s.level) || 2)]}. Определи с какъв звук започва думата и избери чипа.`,
    tiers: s => { const q = Number(s.answersQty) || 2; return [Math.ceil(q / 2), q, 2 * q]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 2, max: 3, def: 2, help: "2 Звучни и беззвучни: думи със съгласна в началото (камбанка = звучна, слушалки = беззвучна). 3 Гласни и съгласни. Ниво 1 „Твърди и меки“ не се използва за български." },
      { key: "answersQty", label: "Брой отговори", type: "range", min: 2, max: 10, def: 2, help: "Колко думи ще определи детето." },
      { key: "lessonNumber", label: "Номер на урока", type: "range", min: 1, max: 14, def: 3, help: "Използват се думи, чиято първа буква е изучена до този урок." }
    ],
    paramsLine: s => `${TITLES[Math.max(2, Number(s.level) || 2)]} · ${s.answersQty} думи · урок ${s.lessonNumber}`
  };
})();
