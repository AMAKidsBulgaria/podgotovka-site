/* Подводно царство: балони с отговори се издигат; детето докосва верния.
   Ниво 1..4 = 2/3/4/5 балона; скорост 1..10 = 16..4 сек. за издигане. */
(function () {
  const CREATURES = ["fish_orange", "fish_blue", "fish_red", "fish_green", "fish_pink", "fish_brown"];
  function makeExample(range, op) {
    const kind = op === "mix" ? (Math.random() < 0.5 ? "add" : "sub") : op;
    if (kind === "add") { const a = rnd(range + 1), b = rnd(range - a + 1); return { answer: a + b, text: `${a} + ${b}` }; }
    const a = rnd(range + 1), b = rnd(a + 1); return { answer: a - b, text: `${a} − ${b}` };
  }
  function makeOptions(answer, range, count) {
    const set = new Set([answer]); let guard = 0;
    while (set.size < count && guard++ < 300) { const d = (rnd(2) ? 1 : -1) * (1 + rnd(3)); const v = Math.random() < 0.7 ? answer + d : rnd(range + 1); if (v >= 0 && v <= range) set.add(v); }
    return shuffle([...set]);
  }
  class UnderwaterGame extends BaseGame {
    get gameId() { return "underwaterKingdom"; }
    get skillName() { return (this.s.op === "sub" ? "Изваждане" : this.s.op === "mix" ? "Събиране и изваждане" : "Събиране") + ` до ${this.s.range}`; }
    render() {
      this.baseCount = ({ 1: 2, 2: 3, 3: 4, 4: 5 })[Number(this.s.level)] || 2;
      this.baseDur = 16 - (Number(this.s.speed) - 1) * (12 / 9);
      this.escape = this.s.escape === "on";
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-underwater"/></svg><div class="bubbles" id="bubbles"></div>`;
      this.box = this.shell.arena.querySelector("#bubbles");
    }
    startRound() {
      // адаптивност: +1 → един балон повече и 15 % по-бързо; -1 → един по-малко и 25 % по-бавно
      this.count = Math.max(2, Math.min(5, this.baseCount + this.adapt));
      this.dur = this.baseDur * (this.adapt > 0 ? 0.85 : this.adapt < 0 ? 1.25 : 1);
      this.current = makeExample(Number(this.s.range), this.s.op);
      this.shell.setLabel(this.current.text);
      this.say(this.current.text.replace("+", " плюс ").replace("−", " минус "));
      const opts = makeOptions(this.current.answer, Number(this.s.range), this.count);
      const box = this.box; box.innerHTML = "";
      const w = box.clientWidth, n = opts.length;
      const size = Math.max(110, Math.min(180, (w - 40) / (n + 0.6))), slot = (w - 40) / n;
      const creatures = shuffle(CREATURES.slice());
      opts.forEach((v, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "bubble";
        b.style.setProperty("--size", size + "px");
        b.style.left = Math.round(20 + slot * i + (slot - size) / 2 + (Math.random() - 0.5) * 18) + "px";
        b.style.setProperty("--dur", (this.dur + i * 0.7 + Math.random() * 0.6).toFixed(2) + "s");
        if (this.escape) b.addEventListener("animationend", e => { if (e.animationName === "rise") this.escaped(b, v); });
        else b.classList.add("loop");
        b.innerHTML = `<img class="creature" src="assets/img/${creatures[i % creatures.length]}.png" alt="" draggable="false"><b>${v}</b>`;
        b.setAttribute("aria-label", `Отговор ${v}`);
        b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(b, v); });
        box.appendChild(b);
      });
    }
    pick(bubble, value) {
      const ok = value === this.current.answer;
      if (!this.answer(ok, { text: this.current.text, answer: this.current.answer, given: value })) return;
      [...this.box.children].forEach(b => b.classList.add("paused"));
      if (ok) { bubble.classList.add("pop"); this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.advance(650); }
      else {
        bubble.classList.add("shake"); this.shell.flash(`Верният отговор е ${this.current.answer}`, "bad"); this.say(`Не. ${this.current.text.replace("+", " плюс ").replace("−", " минус ")} е ${this.current.answer}`);
        [...this.box.children].forEach(b => { if (Number(b.querySelector("b").textContent) === this.current.answer) b.classList.add("pop"); });
        this.advance(1400);
      }
    }
    escaped(bubble, v) {
      if (v !== this.current.answer) { bubble.classList.add("miss"); return; }
      if (!this.answer(false, { text: this.current.text, answer: this.current.answer, given: null })) return;
      this.shell.flash(`Отлетя! Беше ${this.current.answer}`, "bad"); this.advance(1200);
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.underwaterKingdom = {
    id: "underwaterKingdom", name: "Подводно царство", skill: "Събиране и изваждане", top: "gold", cls: UnderwaterGame,
    task: "Побързай да хванеш балона с верния отговор.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 4, def: 1, help: "Нивото определя колко балона се появяват едновременно: 2, 3, 4 или 5." },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 20, def: 4 },
      { key: "range", label: "Диапазон на смятане", type: "select", options: [5, 6, 8, 10, 20], def: 6, help: "Най-голямото число в примерите. За първи стъпки: до 5 или 6." },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add" },
      { key: "speed", label: "Скорост", type: "range", min: 1, max: 10, def: 1, unit: "сек.", help: "Колко бързо се издигат балоните: 1 е най-бавно, 10 най-бързо." },
      { key: "escape", label: "Отлитане", type: "cycle", options: [["off", "Изключено"], ["on", "Включено"]], def: "off", help: "Изключено: балоните се връщат и детето има време. Включено: ако верният балон отлети, брои се за грешка. Включи го, когато детето вече отговаря сигурно." }
    ],
    paramsLine: s => `${s.examples} примера · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]} до ${s.range} · скорост ${s.speed}` + (s.escape === "on" ? " · с отлитане" : "")
  };
})();
