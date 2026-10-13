/* Звуково-буквен анализ (Букварика): за всеки звук детето избира чип — гласна (червен), звучна съгласна
   (син с камбанка) или беззвучна съгласна (син със слушалки). Нива: 1 звук; 2 сричка от 2 букви;
   3 думичка от 2 отворени срички; 4 сложна комбинация (и затворени срички). По оригинала за bg меки чипове няма. */
(function () {
  const TITLES = { 1: "Звукове", 2: "Срички от 2 букви", 3: "Проста комбинация от 2 срички", 4: "Сложна комбинация от 2 срички" };
  const CHIPS = [["vowel", "гласна", "chip-vowel"], ["voiced", "звучна", "chip-voiced"], ["unvoiced", "беззвучна", "chip-unvoiced"]];
  function types() { const a = (window.BUK.alphabet || {}).lettersTypes || {}; return { vowel: a.vowel || "аъоуеи", voiced: a.voised || "бвгджзмлнрй", unvoiced: a.notVoised || "пфктшсчцх" }; }
  function typeOf(l) { const T = types(); return T.vowel.includes(l) ? "vowel" : T.voiced.includes(l) ? "voiced" : T.unvoiced.includes(l) ? "unvoiced" : null; }
  function learned(n) { const plan = (window.BUK["lesson-plan-letters"] || {}).lessonPlanLetters || []; const s = new Set(); for (let i = 0; i < Math.min(n, plan.length); i++) [...plan[i]].forEach(l => s.add(l)); return s; }
  function pool(level, lesson) {
    const L = learned(lesson), sy = (window.BUK.syllables || {}).syllables, flat = a => (a || []).flat();
    const info = (window.BUK.alphabet || {}).lettersInfo || {}, dis = info.disabledLettersForSoundLetterParsing || "щюяь";
    let list;
    if (level === 1) list = [...((window.BUK.alphabet || {}).alphabet || "абвгдежзийклмнопрстуфхцчшщъьюя")].filter(l => L.has(l) && !dis.includes(l));
    else if (!sy) list = ["ма", "мо", "ну"];
    else if (level === 2) list = flat(sy.difficult_2.opened).filter(w => L.has(w[0])).concat(flat(sy.difficult_2.closed).filter(w => L.has(w[1])));
    else if (level === 3) list = flat(sy.difficult_4.opened).filter(w => L.has(w[0]) && L.has(w[2]));
    else list = flat(sy.difficult_4.opened).filter(w => L.has(w[0]) && L.has(w[2])).concat(flat(sy.difficult_4.closed).filter(w => L.has(w[1]) && L.has(w[3])));
    list = list.filter(w => [...w].every(l => typeOf(l)));
    if (list.length < 3) list = level === 1 ? [..."амнуиол"] : ["ма", "мо", "ну", "ам", "ин"];
    return list;
  }
  class SoundParsingGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Number(this.s.level) || 1; this.total = Number(this.s.answersQty) || 2; this.timers = []; this.stepWrong = 0; this.roundOk = [];
    }
    get gameId() { return "soundLetterParsing"; }
    get skillName() { return this.level === 1 ? "Звукове: гласни, звучни, беззвучни" : "Звуков анализ на срички"; }
    renderProgress() { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); if (i < this.roundOk.length) li.className = this.roundOk[i] ? "ok" : "bad"; else if (i === this.roundOk.length) li.className = "now"; p.appendChild(li); } }
    later(fn, ms) { const t = setTimeout(() => { if (!this.finished) fn(); }, ms); this.timers.push(t); return t; }
    destroy() { this.timers.forEach(clearTimeout); super.destroy(); }
    render() {
      this.items = shuffle(pool(this.level, Number(this.s.lessonNumber) || 3).slice()); this.k = 0;
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg>
        <div class="az sp"><div class="sp-card"><div class="sp-word" id="word"></div><div class="sp-cells" id="cells"></div></div>
        <div class="sp-chips" id="chips">${CHIPS.map(([k, label, sym]) => `<button type="button" class="sp-chip" data-t="${k}" aria-label="${label}"><svg viewBox="0 0 100 100"><use href="#${sym}"/></svg><span>${label}</span></button>`).join("")}</div></div>`;
      this.word = this.shell.arena.querySelector("#word"); this.cells = this.shell.arena.querySelector("#cells");
      this.shell.arena.querySelectorAll(".sp-chip").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      this.shell.setLabel(this.level === 1 ? "Какъв е звукът?" : "Звук по звук");
    }
    startRound() {
      this.stepWrong = 0; this.cur = this.items[this.k++ % this.items.length]; this.pos = 0;
      this.word.innerHTML = this.level === 1 ? `<span class="sp-br">[</span><span class="sp-l on">${this.cur}</span><span class="sp-br">]</span>` : [...this.cur].map((l, i) => `<span class="sp-l${i === 0 ? " on" : ""}">${l}</span>`).join("");
      this.cells.innerHTML = [...this.cur].map((_, i) => `<span class="sp-cell${i === 0 ? " on" : ""}"></span>`).join("");
      this.cells.hidden = this.level === 1;
      this.say(this.level === 1 ? `Звук ${this.cur}` : this.cur);
    }
    tap(b) {
      if (this.finished || this.locked) return;
      const l = this.cur[this.pos], want = typeOf(l), got = b.dataset.t;
      if (got === want) {
        this.correct++; this.streak++; this.renderScore();
        this.log.push(this.event(true, { text: this.level === 1 ? l : `${this.cur}:${l}`, answer: want, given: got, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 }));
        const cell = this.cells.children[this.pos]; if (cell) { cell.className = `sp-cell done ${want}`; cell.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${CHIPS.find(c => c[0] === want)[2]}"/></svg>`; }
        this.word.children[this.level === 1 ? 1 : this.pos].classList.add("done");
        this.pos++;
        if (this.pos >= this.cur.length) {
          this.locked = true; this.roundOk.push(this.stepWrong === 0); this.idx++; this.renderProgress();
          this.shell.flash("Точно така!", "good"); this.say("Точно така!");
          this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 700);
        } else { const nx = this.word.children[this.pos]; [...this.word.children].forEach(c => c.classList.remove("on")); nx.classList.add("on"); [...this.cells.children].forEach(c => c.classList.remove("on")); this.cells.children[this.pos].classList.add("on"); }
      } else {
        this.wrong++; this.streak = 0; this.stepWrong++;
        this.log.push(this.event(false, { text: this.level === 1 ? l : `${this.cur}:${l}`, answer: want, given: got, ms: Date.now() - this.roundStart, ok: false, adapt: 0 , attempt: true }));
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
        const name = { vowel: "гласна", voiced: "звучна съгласна", unvoiced: "беззвучна съгласна" }[want];
        this.shell.flash(`„${l}“ е ${name}`, "bad"); this.say(`Не. ${l} е ${name}`); this.later(() => this.shell.hideFlash(), 1300);
        if (this.stepWrong >= 2) this.shell.arena.querySelector(`.sp-chip[data-t="${want}"]`).classList.add("hint");
        this.loseLife();
      }
    }
    nextRound() { this.shell.arena.querySelectorAll(".sp-chip").forEach(c => c.classList.remove("hint")); super.nextRound(); }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.soundLetterParsing = {
    id: "soundLetterParsing", name: "Звуково-буквен анализ", module: "bukvarica", skill: "Звуков анализ", cls: SoundParsingGame,
    task: s => `${TITLES[Number(s.level) || 1]}. Избери подходящия чип за всеки звук: червен за гласна, камбанка за звучна съгласна, слушалки за беззвучна.`,
    tiers: s => { const q = Number(s.answersQty) || 2; return [Math.ceil(q / 2), 2 * q, 3 * q]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 4, def: 1, help: "1 Звукове: по един звук. 2 Срички от 2 букви. 3 Думички от 2 отворени срички. 4 Сложна комбинация: и затворени срички." },
      { key: "answersQty", label: "Брой отговори", type: "range", min: 2, max: 10, def: 2, help: "Колко задачи (звука или срички) ще реши детето." },
      { key: "lessonNumber", label: "Номер на урока", type: "range", min: 1, max: 14, def: 3, help: "Използват се само буквите, изучени до този урок по тематичния план." }
    ],
    paramsLine: s => `${TITLES[Number(s.level) || 1]} · ${s.answersQty} задачи · урок ${s.lessonNumber}`
  };
})();
