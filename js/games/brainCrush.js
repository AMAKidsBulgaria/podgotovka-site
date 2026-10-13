/* Главоблъсканица — по кода им (25.js): Ниво 1..2, Брой примери 4..25, Диапазон 10/20, Действие.
   Ниво 1: две групи картинки върху облачета и знак между тях; Ниво 2: примерът с числа.
   Отговор: 4 бутона на масата (верният + 3 различни). Проверено на живо: след избор идва следваща задача. */
(function () {
  const OBJS = ["obj/apple", "obj/banana", "obj/carrot", "obj/cherries", "obj/cookie", "obj/cupcake", "obj/strawberry", "obj/pear", "obj/lemon", "obj/orange", "obj/mushroom", "obj/tomato", "fish_orange", "fish_blue", "fish_red", "fish_green"];
  function example(range, op, adapt) {
    const kind = op === "mix" ? (Math.random() < 0.5 ? "add" : "sub") : op;
    if (kind === "add") { let a = rnd(range + 1), b = rnd(range - a + 1); if (adapt < 0) { a = rnd(6); b = rnd(Math.min(5, range - a) + 1); } return { a, b, op: "+", answer: a + b }; }
    let a = rnd(range + 1), b = rnd(a + 1); if (adapt < 0) { a = 1 + rnd(Math.min(6, range)); b = rnd(a + 1); } return { a, b, op: "−", answer: a - b };
  }
  function choices(answer, range) { const s = new Set([answer]); let g = 0; while (s.size < 4 && g++ < 200) { const v = Math.random() < .6 ? answer + (rnd(2) ? 1 : -1) * (1 + rnd(3)) : rnd(range + 1); if (v >= 0 && v <= range) s.add(v); } return shuffle([...s]); }
  const pics = (name, n) => `<span class="bc-pics">${Array.from({ length: n }, () => `<img src="assets/img/${name}.png" alt="" draggable="false">`).join("")}</span>`;
  class BrainCrushGame extends BaseGame {
    get gameId() { return "brainCrush"; }
    get skillName() { return (this.s.op === "sub" ? "Изваждане" : this.s.op === "mix" ? "Събиране и изваждане" : "Събиране") + (Number(this.s.level) === 1 ? " с предмети" : "") + ` до ${this.s.range}`; }
    render() {
      this.level = Number(this.s.level || 1); this.range = Number(this.s.range || 10);
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-island"/></svg><div class="bc"><div class="bc-task" id="bc-task"></div><div class="bc-desk"><div class="bc-choices" id="bc-choices"></div></div></div>`;
      this.task = this.shell.arena.querySelector("#bc-task"); this.ch = this.shell.arena.querySelector("#bc-choices");
    }
    startRound() {
      this.ex = example(this.range, this.s.op, this.adapt);
      this.current = { text: `${this.ex.a} ${this.ex.op} ${this.ex.b}`, answer: this.ex.answer };
      const spoken = `${this.ex.a} ${this.ex.op === "+" ? "плюс" : "минус"} ${this.ex.b}`;
      if (this.level === 1) {
        const [n1, n2] = shuffle(OBJS.slice()).slice(0, 2);
        this.task.innerHTML = `<div class="bc-cloud">${this.ex.a ? pics(n1, this.ex.a) : `<span class="bc-zero">0</span>`}</div><div class="bc-op">${this.ex.op}</div><div class="bc-cloud">${this.ex.b ? pics(n2, this.ex.b) : `<span class="bc-zero">0</span>`}</div>`;
        this.shell.setLabel("Преброй и пресметни"); this.say(`${spoken}. Колко стават?`);
      } else { this.task.innerHTML = `<div class="bc-cloud bc-expr">${this.ex.a} ${this.ex.op} ${this.ex.b}</div>`; this.shell.setLabel(`${this.ex.a} ${this.ex.op} ${this.ex.b} = ?`); this.say(spoken); }
      this.ch.innerHTML = "";
      choices(this.ex.answer, this.range).forEach(v => { const b = document.createElement("button"); b.type = "button"; b.className = "bc-btn"; b.textContent = v; b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(v, b); }); this.ch.appendChild(b); });
    }
    pick(v, btn) {
      const ok = v === this.ex.answer;
      if (!this.answer(ok, { text: this.current.text, answer: this.ex.answer, given: v })) return;
      [...this.ch.children].forEach(b => b.disabled = true);
      if (ok) { btn.classList.add("right"); this.shell.flash("Точно така!", "good"); this.say(`Точно така! ${this.ex.answer}`); this.advance(1200); }
      else { btn.classList.add("wrong"); [...this.ch.children].find(b => Number(b.textContent) === this.ex.answer).classList.add("right"); this.shell.flash(`${this.current.text} = ${this.ex.answer}`, "bad"); this.say(`Не. ${this.current.text.replace("+", "плюс").replace("−", "минус")} е ${this.ex.answer}`); this.advance(2400); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.brainCrush = {
    id: "brainCrush", name: "Главоблъсканица", skill: "Действия с предмети", top: "waterfall", cls: BrainCrushGame, tiers: [0, 1, 2],
    task: s => Number(s.level) === 2 ? "Изпълни аритметичните действия с числа." : "Изпълни аритметичните действия с предмети.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "Ниво 1: с картинки. Ниво 2: само с числа." },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 25, def: 4 },
      { key: "range", label: "Диапазон на смятане", type: "select", options: [10, 20], def: 10 },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add" }
    ],
    paramsLine: s => `${s.examples} примера · до ${s.range} · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]}`
  };
})();
