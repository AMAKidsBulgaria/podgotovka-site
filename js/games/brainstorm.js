/* Мозъчна атака — текстови задачи. По кода им (29.js): Ниво 1..2, Диапазон 10/20, Действие, Брой примери 4..10;
   екран: условие, ред за решение [a] [знак] [b] = [c], изречение-отговор с [c], бутон „Провери“; след проверка
   грешните полета червени, верните зелени, после следваща задача. Съдържанието при тях е техен банк с текстове;
   тук задачите се съставят от наши шаблони (могат да се заменят с текстовете на академията). */
(function () {
  const NAMES = ["Мария", "Иван", "Ема", "Георги", "Ани", "Петър", "Мила", "Калин", "Бавачката", "Рибарят", "Баба", "Дядо"];
  const ITEMS = [["ябълка", "ябълки"], ["круша", "круши"], ["бонбон", "бонбона"], ["книга", "книги"], ["кукла", "кукли"], ["топка", "топки"], ["риба", "риби"], ["молив", "молива"], ["цвете", "цветя"], ["бисквита", "бисквити"], ["мида", "миди"], ["монета", "монети"]];
  const pl = (it, n) => n === 1 ? it[0] : it[1];
  const ADD = [
    (N, it, a, b) => [`${N} имаше ${a} ${pl(it, a)} и получи още ${b}. Колко ${it[1]} има ${N} сега?`, `${N} има общо`, `${it[1]}.`],
    (N, it, a, b) => [`${N} събра ${a} ${pl(it, a)} сутринта и ${b} следобед. Колко ${it[1]} събра ${N} общо?`, `${N} събра общо`, `${it[1]}.`],
    (N, it, a, b) => [`В кошницата имаше ${a} ${pl(it, a)}. ${N} сложи още ${b}. Колко ${it[1]} има в кошницата?`, `В кошницата има`, `${it[1]}.`]
  ];
  const SUB = [
    (N, it, a, b) => [`${N} имаше ${a} ${pl(it, a)} и подари ${b}. Колко ${it[1]} останаха на ${N}?`, `На ${N} останаха`, `${it[1]}.`],
    (N, it, a, b) => [`На масата имаше ${a} ${pl(it, a)}. ${N} изяде ${b}. Колко ${it[1]} останаха?`, `Останаха`, `${it[1]}.`],
    (N, it, a, b) => [`${N} хвана ${a} ${pl(it, a)}, но ${b} избягаха. Колко ${it[1]} останаха при ${N}?`, `При ${N} останаха`, `${it[1]}.`]
  ];
  const ADD2 = [(N, it, a, b) => [`${N} има ${a} ${pl(it, a)}, а Ема има с ${b} повече. Колко ${it[1]} има Ема?`, `Ема има`, `${it[1]}.`]];
  const SUB2 = [(N, it, a, b) => [`${N} има ${a} ${pl(it, a)}, а Иван има с ${b} по-малко. Колко ${it[1]} има Иван?`, `Иван има`, `${it[1]}.`]];
  class BrainstormGame extends BaseGame {
    get gameId() { return "brainstorm"; }
    get skillName() { return `Текстови задачи до ${this.s.range}`; }
    render() {
      this.level = Number(this.s.level || 1); this.range = Number(this.s.range || 10);
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-jungle"/></svg>
        <div class="bst"><div class="bst-q" id="bst-q"></div>
          <div class="bst-row" id="bst-row"><span class="bst-cell" data-k="a"><span></span></span><span class="bst-cell op" data-k="op"><span></span></span><span class="bst-cell" data-k="b"><span></span></span><b class="bst-eq">=</b><span class="bst-cell" data-k="c"><span></span></span></div>
          <div class="bst-ans" id="bst-ans"><span id="bst-pre"></span><span class="bst-cell" data-k="c2"><span></span></span><span id="bst-post"></span></div>
          <div class="ord-controls"><div class="keypad ord-pad" id="bst-pad"></div><button type="button" class="gbtn gbtn-green ord-check" id="bst-check">Провери</button></div></div>`;
      this.cells = [...this.shell.arena.querySelectorAll(".bst-cell")];
      this.cells.forEach(c => c.addEventListener("pointerdown", e => { e.preventDefault(); this.select(c); }));
      const pad = this.shell.arena.querySelector("#bst-pad");
      for (let k = 0; k <= Math.max(10, this.range); k++) { const b = document.createElement("button"); b.type = "button"; b.className = "key"; b.textContent = k; b.addEventListener("pointerdown", e => { e.preventDefault(); this.type(String(k)); }); pad.appendChild(b); }
      [["+", "+"], ["−", "−"]].forEach(([t, v]) => { const b = document.createElement("button"); b.type = "button"; b.className = "key key-op"; b.textContent = t; b.addEventListener("pointerdown", e => { e.preventDefault(); this.type(v); }); pad.appendChild(b); });
      const del = document.createElement("button"); del.type = "button"; del.className = "key key-del"; del.textContent = "⌫"; del.addEventListener("pointerdown", e => { e.preventDefault(); if (this.sel) this.sel.querySelector("span").textContent = ""; }); pad.appendChild(del);
      this.checkBtn = this.shell.arena.querySelector("#bst-check"); this.checkBtn.addEventListener("pointerdown", e => { e.preventDefault(); this.check(); });
    }
    startRound() {
      const bank = window.BRAINSTORM_BANK;
      if (bank) {
        // банката на академията: по ниво, диапазон и действие; при „смесено“ се редуват
        const add = this.s.op === "mix" ? Math.random() < .5 : this.s.op !== "sub";
        const list = bank[`L${this.level}_R${this.range}_${add ? "add" : "sub"}`] || [];
        this.used = this.used || new Set();
        let pool = list.map((t, i) => i).filter(i => !this.used.has(i)); if (!pool.length) { this.used.clear(); pool = list.map((t, i) => i); }
        if (pool.length) {
          const i = pool[rnd(pool.length)]; this.used.add(i); const t = list[i];
          this.ex = { a: t.a, b: t.b, op: t.op === "+" ? "+" : "−", c: t.c };
          this.current = { text: t.q, answer: `${t.a} ${this.ex.op} ${t.b} = ${t.c}` };
          this.shell.arena.querySelector("#bst-q").textContent = t.q; this.shell.arena.querySelector("#bst-pre").textContent = t.pre + " "; this.shell.arena.querySelector("#bst-post").textContent = " " + t.post + ".";
          this.cells.forEach(c => { c.className = "bst-cell" + (c.dataset.k === "op" ? " op" : ""); c.querySelector("span").textContent = ""; });
          this.checkBtn.disabled = false; this.select(this.cells[0]);
          this.shell.setLabel("Реши задачата"); this.say(t.q); return;
        }
      }
      const add = this.s.op === "mix" ? Math.random() < .5 : this.s.op !== "sub";
      let a, b; if (add) { a = 1 + rnd(this.range - 1); b = 1 + rnd(this.range - a); } else { a = 2 + rnd(this.range - 1); b = 1 + rnd(a - 1); }
      const tpl = (this.level === 2 ? (add ? ADD2 : SUB2) : (add ? ADD : SUB))[rnd(this.level === 2 ? 1 : 3)];
      const [q, pre, post] = tpl(NAMES[rnd(NAMES.length)], ITEMS[rnd(ITEMS.length)], a, b);
      this.ex = { a, b, op: add ? "+" : "−", c: add ? a + b : a - b };
      this.current = { text: q, answer: `${a} ${this.ex.op} ${b} = ${this.ex.c}` };
      this.shell.arena.querySelector("#bst-q").textContent = q; this.shell.arena.querySelector("#bst-pre").textContent = pre + " "; this.shell.arena.querySelector("#bst-post").textContent = " " + post;
      this.cells.forEach(c => { c.className = "bst-cell" + (c.dataset.k === "op" ? " op" : ""); c.querySelector("span").textContent = ""; });
      this.checkBtn.disabled = false; this.select(this.cells[0]);
      this.shell.setLabel("Реши задачата"); this.say(q);
    }
    select(c) { if (this.locked) return; this.cells.forEach(x => x.classList.remove("sel")); this.sel = c; c.classList.add("sel"); }
    type(v) {
      if (!this.sel || this.locked) return;
      const isOp = v === "+" || v === "−"; if (isOp !== (this.sel.dataset.k === "op")) return;
      this.sel.querySelector("span").textContent = v;
      if (this.sel.dataset.k === "c") this.cells.find(x => x.dataset.k === "c2").querySelector("span").textContent = v;
      const next = this.cells.find(x => !x.querySelector("span").textContent); if (next) this.select(next);
    }
    check() {
      if (this.locked) return;
      const val = k => this.cells.find(x => x.dataset.k === k).querySelector("span").textContent;
      if (["a", "op", "b", "c", "c2"].some(k => !val(k))) { this.shell.flash("Попълни всички полета", "bad"); setTimeout(() => this.shell.hideFlash(), 1200); return; }
      const wrong = []; const exp = { a: String(this.ex.a), op: this.ex.op, b: String(this.ex.b), c: String(this.ex.c), c2: String(this.ex.c) };
      // допускаме разменени събираеми при събиране
      const swapped = this.ex.op === "+" && val("a") === exp.b && val("b") === exp.a;
      Object.keys(exp).forEach(k => { if (swapped && (k === "a" || k === "b")) return; if (val(k) !== exp[k]) wrong.push(k); });
      const ok = wrong.length === 0;
      if (!this.answer(ok, { text: this.current.text, answer: this.current.answer, given: `${val("a")} ${val("op")} ${val("b")} = ${val("c")}` })) return;
      this.checkBtn.disabled = true;
      this.cells.forEach(c => c.classList.add(wrong.includes(c.dataset.k) ? "wrong" : "right"));
      if (ok) { this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.advance(1400); }
      else { this.shell.flash(`${this.ex.a} ${this.ex.op} ${this.ex.b} = ${this.ex.c}`, "bad"); this.say(`Не. ${this.ex.a} ${this.ex.op === "+" ? "плюс" : "минус"} ${this.ex.b} е ${this.ex.c}`); setTimeout(() => this.cells.forEach(c => { if (wrong.includes(c.dataset.k)) { c.querySelector("span").textContent = exp[c.dataset.k]; c.classList.remove("wrong"); c.classList.add("right"); } }), 1300); this.advance(3000); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.brainstorm = {
    id: "brainstorm", name: "Мозъчна атака", skill: "Текстови задачи", top: "slime", cls: BrainstormGame, tiers: [0, 1, 2],
    task: "Прочети задачата, запиши решението и отговора.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "Ниво 1: прости задачи. Ниво 2: задачи със „с … повече/по-малко“." },
      { key: "range", label: "Диапазон на смятане", type: "select", options: [10, 20], def: 10 },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add" },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `${s.examples} задачи · до ${s.range} · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]}`
  };
})();
