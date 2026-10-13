/* Състав на числата — по генератора от досегашната платформа (28.js):
   Числа 3..20 = числото, което се разлага. Сложност 1 = винаги това число; 2 = случайно от 3 до него.
   Задача: горе цялото число, долу две части; лявата е дадена, дясната се въвежда от клавиатура 0..10 (0..20 при числа над 10).
   Верен: дясният кръг става зелен с числото → следваща задача. Грешен: розов с грешното число, после показваме вярното. Норми 0/1/2. */
(function () {
  class CompositionGame extends BaseGame {
    get gameId() { return "numberComposition"; }
    get skillName() { return `Състав на числата до ${this.s.numbers}`; }
    render() {
      this.numbers = Number(this.s.numbers || 3); this.complexity = Number(this.s.complexity || 1);
      this.keys = this.numbers <= 10 ? 10 : 20;
      this.prevPart = null;
      this.shell.arena.innerHTML = `
        <svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-cabin"/></svg>
        <div class="comp">
          <div class="comp-tree">
            <svg class="comp-ropes" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true"><path d="M200 20 C200 90 110 90 90 190" fill="none" stroke="#3E2A12" stroke-width="7" stroke-dasharray="8 6" stroke-linecap="round"/><path d="M200 20 C200 90 290 90 310 190" fill="none" stroke="#3E2A12" stroke-width="7" stroke-dasharray="8 6" stroke-linecap="round"/></svg>
            <div class="comp-whole" id="whole"><span></span></div>
            <div class="comp-parts"><div class="comp-part" id="partA"><span></span></div><div class="comp-part" id="partB"><span></span></div></div>
          </div>
          <div class="keypad" id="keypad"></div>
        </div>`;
      this.whole = this.shell.arena.querySelector("#whole span"); this.partA = this.shell.arena.querySelector("#partA"); this.partB = this.shell.arena.querySelector("#partB");
      this.keypad = this.shell.arena.querySelector("#keypad"); this.keypad.classList.toggle("wide", this.keys > 10);
      for (let k = 0; k <= this.keys; k++) { const b = document.createElement("button"); b.type = "button"; b.className = "key"; b.textContent = k; b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(k, b); }); this.keypad.appendChild(b); }
    }
    makeExample() {
      const whole = this.complexity === 1 ? this.numbers : 3 + rnd(this.numbers - 2);
      let p, guard = 0;
      do {
        // адаптивност: +1 избягва тривиалните части (0 и цялото); -1 ги предпочита
        if (this.adapt < 0 && Math.random() < 0.5) p = rnd(2) ? 0 : whole;
        else if (this.adapt > 0 && whole >= 2) p = 1 + rnd(whole - 1);
        else p = rnd(whole + 1);
        guard++;
      } while ((p === this.prevPart || whole - p === this.prevPart) && guard < 20);
      this.prevPart = p;
      return { whole, a: p, b: whole - p };
    }
    startRound() {
      this.ex = this.makeExample();
      this.current = { text: `${this.ex.whole} = ${this.ex.a} + ?`, answer: this.ex.b };
      this.whole.textContent = this.ex.whole; this.partA.querySelector("span").textContent = this.ex.a;
      this.partB.className = "comp-part"; this.partB.querySelector("span").textContent = "";
      [...this.keypad.children].forEach(k => k.disabled = false);
      this.shell.setLabel(`${this.ex.whole} = ${this.ex.a} + ?`); this.say(`${this.ex.whole} е ${this.ex.a} и колко?`);
    }
    pick(v, key) {
      const ok = v === this.ex.b;
      if (!this.answer(ok, { text: this.current.text, answer: this.ex.b, given: v })) return;
      [...this.keypad.children].forEach(k => k.disabled = true);
      this.partB.querySelector("span").textContent = v;
      if (ok) { this.partB.classList.add("right"); this.shell.flash("Точно така!", "good"); this.say(`Точно така! ${this.ex.whole} е ${this.ex.a} и ${this.ex.b}`); this.advance(1400); }
      else {
        this.partB.classList.add("wrong"); key.classList.add("wrong"); this.shell.flash(`${this.ex.whole} е ${this.ex.a} и ${this.ex.b}`, "bad"); this.say(`Не. ${this.ex.whole} е ${this.ex.a} и ${this.ex.b}`);
        setTimeout(() => { this.partB.className = "comp-part right"; this.partB.querySelector("span").textContent = this.ex.b; key.classList.remove("wrong"); }, 1100);
        this.advance(2600);
      }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.numberComposition = {
    id: "numberComposition", name: "Състав на числата", skill: "Състав на числото", top: "palm", cls: CompositionGame,
    tiers: [0, 1, 2],
    task: "Определи състава на числата: кое число липсва, за да се получи цялото.",
    settings: [
      { key: "numbers", label: "Числа", type: "range", min: 3, max: 20, def: 3, help: "Числото, което детето разлага на две части." },
      { key: "complexity", label: "Сложност", type: "cycle", options: [["1", "1"], ["2", "2"]], def: "1", help: "1: винаги избраното число. 2: случайни числа от 3 до избраното." },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `${s.examples} примера · число ${s.numbers} · сложност ${s.complexity}`
  };
})();
