/* Читалка (Букварика): детето чете на глас срички или „космически думички“ за определено време.
   Играта не проверява прочетеното; брои колко срички са показани (ръчно „Следваща“ или автоматично). */
(function () {
  const TITLES = { 1: "Четем срички", 2: "Ударени срички", 3: "Космически думички" };
  const TASKS = { 1: "Прочети сричките на глас. Натискай „Следваща“, когато си готов.", 2: "Прочети сричките с ударение: ударената гласна е отбелязана.", 3: "Прочети измислените „космически“ думички сричка по сричка." };
  function learned(lessonNumber) {
    const plan = (window.BUK["lesson-plan-letters"] || {}).lessonPlanLetters || [];
    const set = new Set(); for (let i = 0; i < Math.min(lessonNumber, plan.length); i++) [...plan[i]].forEach(l => set.add(l));
    return set;
  }
  function pool(level, stage, lessonNumber) {
    const sy = (window.BUK.syllables || {}).syllables; if (!sy) return ["ма", "му", "ми", "на", "ну", "ни"];
    const L = learned(lessonNumber), flat = a => a.flat();
    const okAll = w => [...w].every(l => L.has(l)), okPos = (w, ps) => ps.every(i => L.has(w[i]));
    let list, filt;
    if (level === 1) { list = flat(sy.difficult_2.opened).concat(flat(sy.difficult_2.closed), sy.additionSyllables); filt = okAll; }
    else if (level === 2) { list = flat(sy.difficult_2.opened).concat(sy.additionSyllables); filt = okAll; }
    else {
      const d4 = flat(sy.difficult_4.opened), d6 = flat(sy.difficult_6.opened);
      list = stage <= 2 ? d4 : stage <= 5 ? d6 : d4.concat(d6);
      filt = w => okPos(w, w.length === 4 ? [0, 2] : [0, 2, 4]);
    }
    const f = list.filter(filt); return f.length >= 4 ? f : list;
  }
  class ReadcaGame extends BaseGame {
    constructor(shell, settings, tier, onFinish) {
      super(shell, settings, tier, onFinish);
      this.level = Number(this.s.level) || 1; this.stage = Number(this.s.stageNumber) || 1;
      this.gameTime = Number(this.s.gameTime) || 30; this.auto = this.s.autoSwitch === "on"; this.speed = Number(this.s.speed) || 1;
      this.total = 0; this.timers = [];
    }
    get gameId() { return "readca"; }
    get skillName() { return this.level === 3 ? "Четене на думички" : "Четене на срички"; }
    renderProgress() { this.shell.progress.innerHTML = ""; }
    nextRound() { if (this.finished) return; this.locked = false; this.roundStart = Date.now(); this.startRound(); }
    renderLives() { this.shell.lives.innerHTML = ""; }
    tick() {
      const left = Math.max(0, this.gameTime - Math.floor((Date.now() - this.startedAt) / 1000));
      this.shell.timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left <= 0 && !this.finished) { this.finished = true; this.shell.flash("Времето изтече. Браво!", "good"); this.say("Времето изтече. Браво!"); setTimeout(() => this.finish(false), 1200); }
    }
    render() {
      this.items = shuffle(pool(this.level, this.stage, Number(this.s.lessonNumber) || 3).slice()); this.k = 0;
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-meadow"/></svg>
        <div class="az rd"><div class="rd-hint">${this.level === 3 ? "Това са измислени думички. Прочети ги сричка по сричка." : "Прочети на глас."}</div><div class="rd-card"><div class="rd-word" id="word" aria-live="polite"></div></div>
        ${this.auto ? `<div class="rd-auto">Сменя се автоматично на всеки ${this.speed} сек.</div>` : `<button type="button" class="gbtn gbtn-green rd-next" id="next">Следваща <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`}
        <div class="rd-count">Прочетени: <b id="cnt">0</b></div></div>`;
      this.word = this.shell.arena.querySelector("#word"); this.cnt = this.shell.arena.querySelector("#cnt");
      this.shell.setLabel(TITLES[this.level]);
      const n = this.shell.arena.querySelector("#next"); if (n) n.addEventListener("click", () => this.next());
    }
    startRound() {
      this.show();
      if (this.auto) this.iv = setInterval(() => this.next(), this.speed * 1000);
    }
    stressIndex(w) {
      if (this.level === 2) return w.length - 1;
      if (this.level === 3) { const m = { 1: 1, 2: 3, 3: 1, 4: 3, 5: 5 }; if (this.stage <= 5) return Math.min(m[this.stage], w.length - 1); const c = w.length === 4 ? [1, 3] : [1, 3, 5]; return c[rnd(c.length)]; }
      return -1;
    }
    show() {
      const w = this.items[this.k % this.items.length], si = this.stressIndex(w);
      this.word.innerHTML = [...w].map((l, i) => `<span class="rd-l${i === si ? " acc" : ""}">${l}</span>`).join("");
      this.word.classList.remove("in"); void this.word.offsetWidth; this.word.classList.add("in");
      this.cur = w; this.roundStart = Date.now();
    }
    next() {
      if (this.finished) return;
      this.locked = false; this.answer(true, { text: this.cur, answer: this.cur, given: this.cur }); this.locked = false;
      this.total = this.log.length; this.cnt.textContent = this.log.length; this.k++; this.show();
    }
    finish(early) {
      if (this.finished && this.timerId === null) return;
      clearInterval(this.iv); this.total = Math.max(1, this.log.length);
      super.finish(early);
    }
    destroy() { clearInterval(this.iv); super.destroy(); }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.readca = {
    id: "readca", name: "Читалка", module: "bukvarica", skill: "Четене на срички", cls: ReadcaGame,
    task: s => `${TITLES[Number(s.level) || 1]}. ${TASKS[Number(s.level) || 1]}`,
    tiers: () => [0, 0, 0],
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 3, def: 1, help: "1 Четем срички: отворени и затворени срички. 2 Ударени срички: с отбелязано ударение. 3 Космически думички: измислени думи от 2 или 3 срички." },
      { key: "gameTime", label: "Време за игра", type: "range", min: 30, max: 360, step: 30, def: 30, unit: "сек.", help: "Колко секунди трае четенето: от 30 секунди до 6 минути." },
      { key: "autoSwitch", label: "Автоматично превключване", type: "cycle", options: [["off", "Изключено"], ["on", "Включено"]], def: "off", help: "Изключено: детето натиска „Следваща“, когато е прочело. Включено: сричките се сменят сами през избраната скорост." },
      { key: "speed", label: "Скорост", type: "range", min: 1, max: 5, step: 0.5, def: 1, unit: "сек.", enabledIf: s => s.autoSwitch === "on", help: "Само при автоматично превключване: секунди, през които идва следващата сричка (1 е най-бързо)." },
      { key: "lessonNumber", label: "Номер на урока", type: "range", min: 1, max: 14, def: 3, help: "Показват се само срички от буквите, изучени до този урок по тематичния план (урок 3: а, и, у, о, е, ъ, м, н)." },
      { key: "stageNumber", label: "Етап", type: "range", min: 1, max: 6, def: 1, enabledIf: s => Number(s.level) === 3, help: "Само за ниво 3: етапи 1 и 2 са думички от 2 срички (ударение на 1-вата или 2-рата), 3 до 5 от 3 срички, 6 е смесен с произволно ударение." }
    ],
    paramsLine: s => { const l = Number(s.level) || 1; return `${TITLES[l]} · ${s.gameTime} сек. · урок ${s.lessonNumber}` + (s.autoSwitch === "on" ? ` · авто ${s.speed} сек.` : "") + (l === 3 ? ` · етап ${s.stageNumber}` : ""); }
  };
})();
