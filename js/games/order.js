/* Последователност — по генератора и поведението на досегашната платформа (24.js):
   Настройки: Ниво 1..2, Диапазон 3..20, Числа в реда 3..10 (не повече от диапазона), Посока (напред/назад), Брой примери 4..10.
   Ниво 1: редица от последователни числа с празни клетки (брой по таблица 3:1,4:1,5:2,6:2,7:3,8:3,9:4,10:4);
           детето попълва празните (клавиатура), натиска „Провери“; грешните клетки стават червени, верните зелени, после нова редица.
   Ниво 2: разбъркани числа; детето ги докосва в правилния ред (възходящ/низходящ); верният се качва в горния ред, грешният свети червено. */
(function () {
  const PASSES = { 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 3, 9: 4, 10: 4 };
  const randInt = (min, max) => min + rnd(max - min + 1);

  class OrderGame extends BaseGame {
    get gameId() { return "order"; }
    get skillName() { return Number(this.s.level) === 2 ? `Подреждане на числа до ${this.s.range}` : `Числова редица до ${this.s.range}`; }
    render() {
      this.level = Number(this.s.level || 1); this.range = Number(this.s.range || 3);
      this.n = Math.min(Number(this.s.row || 3), this.range); this.back = this.s.dir === "back";
      this.shell.arena.innerHTML = `
        <svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-crowsnest"/></svg>
        <div class="ord">
          <div class="ord-answer" id="ord-answer" hidden></div>
          <div class="ord-row" id="ord-row"></div>
          <div class="ord-controls" id="ord-controls"></div>
        </div>`;
      this.row = this.shell.arena.querySelector("#ord-row"); this.top = this.shell.arena.querySelector("#ord-answer"); this.controls = this.shell.arena.querySelector("#ord-controls");
    }
    startRound() { this.row.innerHTML = ""; this.controls.innerHTML = ""; this.top.innerHTML = ""; this.top.hidden = this.level !== 2; if (this.level === 1) this.roundFill(); else this.roundSort(); }

    // ---- ниво 1 ----
    makeSequence() {
      // както при тях: тръгва от случайно число и расте нагоре, при таван слиза надолу
      const seq = [randInt(1, this.range)];
      while (seq.length < this.n) { const hi = Math.max(...seq) + 1, lo = Math.min(...seq) - 1; if (hi <= this.range) seq.push(hi); if (lo >= 1 && seq.length < this.n) seq.push(lo); }
      seq.sort((a, b) => this.back ? b - a : a - b);
      let passes = PASSES[this.n] || 1;
      if (this.adapt > 0) passes = Math.min(this.n - 1, passes + 1); if (this.adapt < 0) passes = Math.max(1, passes - 1);
      const gaps = new Set(); while (gaps.size < passes) gaps.add(randInt(0, this.n - 1));
      return { seq, gaps };
    }
    roundFill() {
      const { seq, gaps } = this.makeSequence();
      this.ex = { seq, gaps }; this.current = { text: seq.map((v, i) => gaps.has(i) ? "_" : v).join(" "), answer: seq.join(" ") };
      this.shell.setLabel("Попълни липсващите числа"); this.say(this.back ? "Попълни липсващите числа. Редицата е назад." : "Попълни липсващите числа");
      const inputs = [];
      seq.forEach((v, i) => {
        const c = document.createElement("div"); c.className = "ocell" + (gaps.has(i) ? " gap" : "");
        if (gaps.has(i)) { c.setAttribute("role", "button"); c.tabIndex = 0; c.dataset.i = i; c.innerHTML = `<span></span>`; c.addEventListener("pointerdown", e => { e.preventDefault(); this.selectGap(c); }); inputs.push(c); }
        else c.textContent = v;
        this.row.appendChild(c);
      });
      this.gapCells = inputs; this.selectGap(inputs[0]);
      // клавиатура + Провери
      const pad = document.createElement("div"); pad.className = "keypad ord-pad";
      for (let k = 0; k <= Math.min(20, Math.max(10, this.range)); k++) { const b = document.createElement("button"); b.type = "button"; b.className = "key"; b.textContent = k; b.addEventListener("pointerdown", e => { e.preventDefault(); this.typeKey(k); }); pad.appendChild(b); }
      const del = document.createElement("button"); del.type = "button"; del.className = "key key-del"; del.setAttribute("aria-label", "Изтрий"); del.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28"><path d="M9 5h11a1 1 0 011 1v12a1 1 0 01-1 1H9l-6-7 6-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 9l6 6M18 9l-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
      del.addEventListener("pointerdown", e => { e.preventDefault(); if (this.sel) { this.sel.querySelector("span").textContent = ""; } }); pad.appendChild(del);
      const check = document.createElement("button"); check.type = "button"; check.className = "gbtn gbtn-green ord-check"; check.textContent = "Провери";
      check.addEventListener("pointerdown", e => { e.preventDefault(); this.check(); });
      this.controls.appendChild(pad); this.controls.appendChild(check); this.checkBtn = check;
    }
    selectGap(c) { this.gapCells.forEach(g => g.classList.remove("sel")); this.sel = c; c.classList.add("sel"); }
    typeKey(k) {
      if (!this.sel || this.locked) return;
      this.sel.querySelector("span").textContent = k; this.say(String(k));
      const next = this.gapCells.find(g => g !== this.sel && !g.querySelector("span").textContent);
      if (next) this.selectGap(next);
    }
    check() {
      if (this.locked) return;
      const empty = this.gapCells.filter(g => !g.querySelector("span").textContent);
      if (empty.length) { this.selectGap(empty[0]); this.shell.flash("Попълни всички празни места", "bad"); setTimeout(() => this.shell.hideFlash(), 1200); return; }
      const given = this.ex.seq.map((v, i) => this.ex.gaps.has(i) ? Number(this.row.children[i].querySelector("span").textContent) : v);
      const wrongIdx = [...this.ex.gaps].filter(i => given[i] !== this.ex.seq[i]);
      const ok = wrongIdx.length === 0;
      if (!this.answer(ok, { text: this.current.text, answer: this.current.answer, given: given.join(" ") })) return;
      this.checkBtn.disabled = true;
      this.gapCells.forEach(g => g.classList.add(wrongIdx.includes(Number(g.dataset.i)) ? "wrong" : "right"));
      if (ok) { this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.advance(1300); }
      else {
        this.shell.flash(`Редицата е ${this.ex.seq.join(", ")}`, "bad"); this.say(`Не. Редицата е ${this.ex.seq.join(", ")}`);
        setTimeout(() => wrongIdx.forEach(i => { const c = this.row.children[i]; c.querySelector("span").textContent = this.ex.seq[i]; c.classList.remove("wrong"); c.classList.add("right"); }), 1300);
        this.advance(2800);
      }
    }

    // ---- ниво 2 ----
    roundSort() {
      const nums = new Set(); while (nums.size < this.n) nums.add(randInt(1, this.range));
      const rowNums = shuffle([...nums]), sorted = [...nums].sort((a, b) => this.back ? b - a : a - b);
      this.current = { text: rowNums.join(" "), answer: sorted.join(" ") };
      this.shell.setLabel(this.back ? "Подреди: голямо → малко" : "Подреди: малко → голямо");
      this.say(this.back ? "Подреди числата от най-голямо към най-малко" : "Подреди числата от най-малко към най-голямо");
      for (let k = 0; k < this.n; k++) { const s = document.createElement("div"); s.className = "ocell slot"; this.top.appendChild(s); }
      let step = 0, wrongInRound = 0;
      rowNums.forEach(v => {
        const c = document.createElement("button"); c.type = "button"; c.className = "ocell tap"; c.textContent = v;
        c.addEventListener("pointerdown", e => {
          e.preventDefault(); if (c.disabled || this.locked) return;
          if (v === sorted[step]) {
            c.disabled = true; const slot = this.top.children[step]; slot.textContent = v; slot.classList.add("filled"); c.classList.add("gone"); this.say(String(v)); step++;
            if (step === this.n) {
              const ok = wrongInRound === 0;
              this.answer(ok, { text: this.current.text, answer: this.current.answer, given: ok ? this.current.answer : "с грешки" });
              this.shell.flash(ok ? "Подредено!" : "Готово, но с грешка", ok ? "good" : "bad"); this.advance(1100);
            }
          } else {
            wrongInRound++; c.classList.add("wrong"); this.shell.flash(`Първо ${sorted[step]}`, "bad"); this.say(`Не. Първо ${sorted[step]}`);
            setTimeout(() => { c.classList.remove("wrong"); this.shell.hideFlash(); }, 800);
            if (this.tier === 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: String(v) }); return; }
            this.livesLeft--; this.renderLives(); if (this.livesLeft < 0) this.answer(false, { text: this.current.text, answer: this.current.answer, given: String(v) });
          }
        });
        this.row.appendChild(c);
      });
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.order = {
    id: "order", name: "Последователност", skill: "Числова редица", top: "volcano", cls: OrderGame,
    tiers: [0, 1, 2],
    task: s => Number(s.level) === 2 ? "Подреди числата във възходящ или низходящ ред." : "Възстанови числовата редица, като попълниш пропуските.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "Ниво 1: попълни липсващите числа. Ниво 2: подреди разбъркани числа." },
      { key: "range", label: "Диапазон на смятане", type: "range", min: 3, max: 20, def: 3, help: "Най-голямото число в редицата." },
      { key: "row", label: "Числа в реда", type: "range", min: 3, max: 10, def: 3, help: "Колко числа има в редицата (не повече от диапазона)." },
      { key: "dir", label: "Посока", type: "cycle", options: [["fwd", "Напред"], ["back", "Назад"]], def: "fwd", help: "Напред: растяща редица. Назад: намаляваща." },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `${s.examples} примера · до ${s.range} · ${s.row} в реда · ${s.dir === "back" ? "назад" : "напред"}`
  };
})();
