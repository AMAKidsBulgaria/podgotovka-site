/* Базов клас за всички тренажори: таймер, напредък, сърца (позволени грешки), точки,
   дневник на отговорите, адаптивност в рамките на сесията, глас и общ резултат.
   Конкретната игра наследява и реализира render() и startRound().
   Два режима на един и същ код (контекст window.HW_CTX от адреса):
     mode=learn (задължителни рундове): без таймер, без сърца, без видим резултат; адаптивност само ако ctx.adaptive="1".
     mode=play (свободна игра): таймер, сърца, точки, адаптивност.
   Всеки отговор е събитие със схема: lesson_id, round_id, game_template_id, item_id, primary/secondary_skill_code,
   difficulty_level, first_attempt_correct, attempt_count, response_time_ms, is_measurement_item, is_free_play, mode, module_mode, timestamp. */
(function () {
  class BaseGame {
    constructor(shell, settings, tier, onFinish) {
      this.shell = shell; this.s = settings; this.onFinish = onFinish;
      this.ctx = Object.assign({}, window.HW_CTX || {});
      this.mode = this.ctx.mode || (this.ctx.hw ? "learn" : "play");
      this.learn = this.mode === "learn";
      this.adaptiveOn = this.learn ? this.ctx.adaptive === "1" : true;
      this.tier = this.learn ? Infinity : tier;
      this.total = Number(settings.examples || 4);
      this.idx = 0; this.correct = 0; this.wrong = 0; this.streak = 0; this.bestStreak = 0; this.wrongStreak = 0;
      this.livesLeft = this.tier; this.log = []; this.startedAt = Date.now();
      this.timerId = null; this.roundStart = 0; this.locked = false; this.finished = false;
      // Адаптивност: -1 по-лесно, 0 както е зададено, +1 по-трудно. Движи се само в рамката на учителя.
      this.adapt = 0; this.adaptLog = [];
      document.documentElement.classList.toggle("mode-learn", this.learn);
    }
    render() {}
    startRound() {}
    get gameId() { return "base"; }
    get skillName() { return ""; }

    start() {
      this.render();
      this.renderProgress(); this.renderLives(); this.renderScore();
      this.timerId = setInterval(() => this.tick(), 250);
      this.nextRound();
    }
    tick() { if (this.learn) return; const s = Math.floor((Date.now() - this.startedAt) / 1000); this.shell.timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
    renderScore() { this.shell.score.textContent = this.learn ? "" : this.correct; }
    renderProgress() {
      const p = this.shell.progress; p.innerHTML = "";
      for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); const r = this.log[i]; if (r) li.className = r.ok ? "ok" : "bad"; else if (i === this.idx) li.className = "now"; p.appendChild(li); }
    }
    renderLives() {
      const l = this.shell.lives; l.innerHTML = ""; if (this.learn) return;
      for (let i = 0; i < this.tier; i++) { const h = document.createElement("i"); if (i >= this.livesLeft) h.className = "off"; l.appendChild(h); }
    }
    nextRound() {
      if (this.finished) return;
      if (this.idx >= this.total) return this.finish();
      this.locked = false; this.renderProgress();
      this.roundStart = Date.now();
      this.startRound();
    }
    // Събитие за една задача по схемата на измерването.
    event(ok, extra) {
      const c = this.ctx;
      return Object.assign({
        item_id: this.idx, ok, first_attempt_correct: ok, attempt_count: 1, response_time_ms: Date.now() - this.roundStart,
        difficulty_level: this.adapt, adapt: this.adapt,
        lesson_id: c.lesson || null, round_id: c.round != null ? Number(c.round) : null, game_template_id: c.tpl || this.gameId,
        primary_skill_code: c.skill || null, secondary_skill_code: c.skill2 || null, content_bank_id: c.bank || null,
        is_measurement_item: c.meas === "1", is_free_play: !this.learn, mode: this.mode, module_mode: c.mm || "trainer",
        timestamp: new Date().toISOString()
      }, extra || {});
    }
    // Записва отговор и движи адаптивността: 3 верни подред → по-трудно, 2 грешни подред → по-лесно (само ако е позволена).
    answer(ok, { text, answer, given }) {
      if (this.locked || this.finished) return false;
      this.locked = true;
      this.log.push(this.event(ok, { text, answer, given, ms: Date.now() - this.roundStart }));
      if (ok) {
        this.correct++; this.streak++; this.wrongStreak = 0; this.bestStreak = Math.max(this.bestStreak, this.streak); this.renderScore();
        if (this.adaptiveOn && this.streak > 0 && this.streak % 3 === 0 && this.adapt < 1) { this.adapt++; this.adaptLog.push({ at: this.idx, to: this.adapt }); }
      } else {
        this.wrong++; this.streak = 0; this.wrongStreak++;
        if (this.adaptiveOn && this.wrongStreak >= 2 && this.adapt > -1) { this.adapt--; this.wrongStreak = 0; this.adaptLog.push({ at: this.idx, to: this.adapt }); }
        this.loseLife();
      }
      return true;
    }
    loseLife() {
      if (this.learn) return; // в режим „учене“ наборът задачи винаги се довършва
      if (this.tier === 0) return this.finishSoon();
      this.livesLeft--; this.renderLives();
      if (this.livesLeft < 0) this.finishSoon();
    }
    finishSoon() { this.finished = true; setTimeout(() => this.finish(true), 1300); }
    advance(delay) { setTimeout(() => { if (this.finished) return; this.idx++; this.shell.hideFlash(); this.nextRound(); }, delay); }
    say(text) { this.shell.say(text); }
    finish(early) {
      if (this.finished && this.timerId === null) return;
      this.finished = true; clearInterval(this.timerId); this.timerId = null;
      const seconds = Math.round((Date.now() - this.startedAt) / 1000);
      const items = this.log.filter(r => !r.attempt).map((r, i) => Object.assign({ item_id: i }, this.event(r.ok, {}), r, { item_id: i, first_attempt_correct: r.first_attempt_correct != null ? r.first_attempt_correct : r.ok, attempt_count: r.attempt_count || 1 }));
      const answered = items.length, acc = answered ? this.correct / answered : 0;
      const firstAcc = answered ? items.filter(r => r.first_attempt_correct).length / answered : 0;
      const rts = items.filter(r => r.ok).map(r => r.ms);
      const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length / 100) / 10 : null;
      let stars = 0;
      if (!early && this.wrong === 0) stars = 3; else if (!early) stars = 2; else if (acc >= 0.5) stars = 1;
      const c = this.ctx;
      this.onFinish({
        gameId: this.gameId, level: Number(this.s.level || 1), tier: this.tier === Infinity ? null : this.tier, early: !!early, settings: Object.assign({}, this.s),
        total: this.total, answered, correct: this.correct, wrong: this.wrong, bestStreak: this.bestStreak,
        seconds, accuracy: acc, firstAttemptAccuracy: firstAcc, avgRt, stars, hard: items.filter(r => !r.first_attempt_correct).map(r => r.text),
        adaptFinal: this.adapt, adaptLog: this.adaptLog, mode: this.mode, adaptive: this.adaptiveOn,
        lesson_id: c.lesson || null, round_id: c.round != null ? Number(c.round) : null, game_template_id: c.tpl || this.gameId,
        primary_skill_code: c.skill || null, secondary_skill_code: c.skill2 || null, content_bank_id: c.bank || null,
        is_measurement_item: c.meas === "1", module_mode: c.mm || "trainer",
        skill: this.skillName, at: new Date().toISOString(), log: this.log, events: items
      });
    }
    destroy() { clearInterval(this.timerId); this.timerId = null; this.finished = true; this.shell.arena.innerHTML = ""; document.documentElement.classList.remove("mode-learn"); }
  }
  window.BaseGame = BaseGame;
  window.rnd = n => Math.floor(Math.random() * n);
  window.shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
})();
