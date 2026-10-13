/* Карта на диаманти — предмети и техните сенки. По кода им (30.js): Ниво 1..2; ниво 2 е на време (30..180 с, стъпка 30).
   Поле 3x3 със сенки, 12 предмета в менюто отстрани (6 + 6): 9 верни и 3 излишни. Влачиш предмета върху сянката му. Норми 0 / 2 / 4. */
(function () {
  const OBJS = ["obj/apple", "obj/banana", "obj/carrot", "obj/cherries", "obj/cookie", "obj/cupcake", "obj/donut-sprinkles", "obj/ice-cream-cne", "obj/strawberry", "obj/watermelon", "obj/pear", "obj/pumpkin", "obj/lemon", "obj/orange", "obj/mushroom", "obj/pineapple", "obj/grapes", "obj/coconut", "obj/corn", "obj/tomato", "fish_orange", "fish_blue", "fish_red", "fish_green", "fish_pink", "fish_brown"];
  class ShadowMapGame extends BaseGame {
    get gameId() { return "shadowMap"; }
    get skillName() { return "Зрително внимание: предмет и сянка"; }
    render() {
      this.level = Number(this.s.level || 1); this.total = 9; this.placed = 0; this.timeLeft = this.level === 2 ? Number(this.s.time || 60) : null;
      const pick = shuffle(OBJS.slice()).slice(0, 12), board = pick.slice(0, 9), menu = shuffle(pick.slice());
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-hold"/></svg>
        <div class="sm"><div class="sm-menu" id="sm-l"></div><div class="sm-board" id="sm-board"></div><div class="sm-menu" id="sm-r"></div></div>`;
      const L = this.shell.arena.querySelector("#sm-l"), R = this.shell.arena.querySelector("#sm-r"), B = this.shell.arena.querySelector("#sm-board");
      menu.forEach((f, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "sm-item"; b.dataset.f = f; b.innerHTML = `<img src="assets/img/${f}.png" alt="" draggable="false">`; b.addEventListener("pointerdown", e => this.dragStart(e, b)); (i < 6 ? L : R).appendChild(b); });
      board.forEach(f => { const c = document.createElement("div"); c.className = "sm-cell"; c.dataset.f = f; c.innerHTML = `<img class="shadow" src="assets/img/${f}.png" alt="" draggable="false">`; B.appendChild(c); });
      this.renderProgress = () => { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < 9; i++) { const li = document.createElement("li"); li.className = i < this.placed ? "ok" : ""; p.appendChild(li); } };
      if (this.timeLeft != null) { this.tick = () => { this.timeLeft = Math.max(0, Number(this.s.time || 60) - Math.floor((Date.now() - this.startedAt) / 1000)); this.shell.timer.textContent = `${Math.floor(this.timeLeft / 60)}:${String(this.timeLeft % 60).padStart(2, "0")}`; if (this.timeLeft === 0 && !this.finished) { this.shell.flash("Времето изтече", "bad"); this.say("Времето изтече"); this.finishSoon(); } }; }
    }
    startRound() { this.shell.setLabel("Предмет и сянка"); if (this.idx === 0) this.say("Завлечи всеки предмет върху неговата сянка"); }
    dragStart(e, btn) {
      if (this.finished || btn.disabled) return; e.preventDefault();
      const ghost = document.createElement("img"); ghost.src = btn.querySelector("img").src; ghost.className = "pc-ghost"; document.body.appendChild(ghost);
      const move = ev => { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }; move(e);
      const up = ev => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); ghost.remove(); const el = document.elementFromPoint(ev.clientX, ev.clientY); const cell = el && el.closest(".sm-cell"); if (cell) this.drop(btn, cell); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    }
    drop(btn, cell) {
      if (cell.classList.contains("filled")) return;
      const ok = btn.dataset.f === cell.dataset.f; this.locked = false;
      if (!this.answer(ok, { text: `сянка ${cell.dataset.f}`, answer: cell.dataset.f, given: btn.dataset.f })) return;
      this.locked = false;
      if (ok) { cell.classList.add("filled"); cell.innerHTML = `<img src="assets/img/${btn.dataset.f}.png" alt="" draggable="false">`; btn.disabled = true; btn.classList.add("gone"); this.placed++; this.idx = this.placed; this.renderProgress(); this.say("Да!"); if (this.placed === 9) { this.shell.flash("Всички са на мястото си!", "good"); this.say("Браво! Всички са на мястото си."); setTimeout(() => this.finish(false), 1200); } }
      else { cell.classList.add("wrong"); setTimeout(() => cell.classList.remove("wrong"), 500); this.shell.flash("Това не е неговата сянка", "bad"); this.say("Не. Това не е неговата сянка"); setTimeout(() => this.shell.hideFlash(), 1200); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.shadowMap = {
    id: "shadowMap", name: "Карта на диаманти", skill: "Ориентиране в поле", top: "bluecrystal", cls: ShadowMapGame, tiers: [0, 2, 4],
    task: s => Number(s.level) === 2 ? "Подреди предметите върху сенките им, преди да изтече времето." : "Подреди предметите на игралното поле върху техните сенки.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "Ниво 1: без ограничение във времето. Ниво 2: на време." },
      { key: "time", label: "Време за игра", type: "select", options: [30, 60, 90, 120, 150, 180], def: 60, help: "Секунди, само за ниво 2." }
    ],
    paramsLine: s => Number(s.level) === 2 ? `${s.time} секунди` : "без време"
  };
})();
