/* Ярки числа — оцветяване по числа. По кода им (21.js): Ниво 1..3, Картинка 1..N, Диапазон 9..20 и Действие (само ниво 3).
   Проверено на живо: избираш цвят от палитрата (всеки цвят има число), после докосваш частите с това число;
   при вярно частта се оцветява, при грешно остава бяла и се брои грешка. Норми 1 / 3 / 5. */
(function () {
  const PALETTE = ["#E63E6C", "#F5B532", "#3FB58B", "#2E7BC4", "#8E6BE0", "#F26D3F", "#7BC96F", "#3FC1D6"];
  // Картинки: части (path) с индекс на цвят. viewBox 0 0 400 320.
  const PICS = [
    { name: "Кораб", parts: [
      ["M40 220 L360 220 L330 290 L70 290 Z", 0], ["M40 220 L360 220 L352 236 L48 236 Z", 5], ["M120 60 L200 60 L200 200 L120 200 Z", 1], ["M215 40 L300 40 L300 200 L215 200 Z", 3],
      ["M110 30 L120 30 L120 210 L110 210 Z", 4], ["M205 20 L215 20 L215 210 L205 210 Z", 4], ["M110 30 L150 40 L110 52 Z", 0], ["M205 20 L245 30 L205 42 Z", 0],
      ["M0 290 L400 290 L400 320 L0 320 Z", 6], ["M60 250 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", 2], ["M150 250 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", 2], ["M240 250 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", 2], ["M330 250 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", 2] ] },
    { name: "Риба", parts: [
      ["M120 160 C160 60 300 60 340 160 C300 260 160 260 120 160 Z", 3], ["M40 100 L120 160 L40 220 Z", 0], ["M180 110 C220 90 260 90 300 110 C260 130 220 130 180 110 Z", 7], ["M180 210 C220 230 260 230 300 210 C260 190 220 190 180 210 Z", 7],
      ["M290 140 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0", 1], ["M200 40 L240 20 L250 70 Z", 4], ["M200 280 L240 300 L250 250 Z", 4], ["M0 0 L400 0 L400 320 L0 320 Z M120 160 C160 60 300 60 340 160 C300 260 160 260 120 160 Z", 6] ] },
    { name: "Сандък", parts: [
      ["M60 140 L340 140 L340 290 L60 290 Z", 5], ["M60 140 a140 60 0 0 1 280 0 Z", 1], ["M60 140 L340 140 L340 160 L60 160 Z", 4], ["M180 150 L220 150 L220 200 L180 200 Z", 1],
      ["M90 60 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", 1], ["M290 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", 1], ["M200 30 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", 1], ["M0 290 L400 290 L400 320 L0 320 Z", 2],
      ["M60 200 L340 200 L340 215 L60 215 Z", 4], ["M0 0 L400 0 L400 290 L0 290 Z M60 140 a140 60 0 0 1 280 0 L340 290 L60 290 Z", 3] ] },
    { name: "Палма", parts: [
      ["M0 240 L400 240 L400 320 L0 320 Z", 1], ["M180 240 C170 160 190 100 200 60 L220 60 C210 100 230 160 220 240 Z", 5], ["M200 60 C140 40 90 60 60 100 C120 90 160 90 200 80 Z", 2], ["M200 60 C260 40 310 60 340 100 C280 90 240 90 200 80 Z", 2],
      ["M200 60 C170 20 130 10 90 20 C140 30 170 50 200 70 Z", 6], ["M200 60 C230 20 270 10 310 20 C260 30 230 50 200 70 Z", 6], ["M186 70 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", 5], ["M320 40 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0", 1],
      ["M0 0 L400 0 L400 240 L0 240 Z M180 240 C170 160 190 100 200 60 L220 60 C210 100 230 160 220 240 Z", 3] ] }
  ];
  const RANGES = { 1: [1, 10], 2: [10, 20] };
  function exprFor(answer, range, op) {
    const kind = op === "mix" ? (Math.random() < .5 ? "add" : "sub") : op;
    if (kind === "add") { const a = rnd(answer + 1); return `${a} + ${answer - a}`; }
    const a = answer + rnd(Math.max(1, range - answer + 1)); return `${a} − ${a - answer}`;
  }
  class BrightNumbersGame extends BaseGame {
    get gameId() { return "brightNumbers"; }
    get skillName() { return Number(this.s.level) === 3 ? `Смятане до ${this.s.range} чрез оцветяване` : `Разпознаване на числа ${Number(this.s.level) === 2 ? "до 20" : "до 10"}`; }
    render() {
      this.level = Number(this.s.level || 1); this.pic = PICS[(Number(this.s.picture || 1) - 1) % PICS.length]; this.range = Number(this.s.range || 10);
      const colorsUsed = [...new Set(this.pic.parts.map(p => p[1]))];
      const [lo, hi] = RANGES[this.level] || [1, this.range]; const nums = new Set(); while (nums.size < colorsUsed.length) nums.add(lo + rnd(hi - lo + 1));
      this.numOf = {}; [...nums].forEach((n, i) => this.numOf[colorsUsed[i]] = n);
      this.labelOf = {}; colorsUsed.forEach(c => this.labelOf[c] = this.level === 3 ? exprFor(this.numOf[c], this.range, this.s.op) : String(this.numOf[c]));
      this.total = this.pic.parts.length; this.done = 0; this.sel = null;
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-beach"/></svg>
        <div class="bn"><svg class="bn-pic" viewBox="0 0 400 320" id="bn-pic"></svg><div class="bn-pal" id="bn-pal"></div></div>`;
      const svg = this.shell.arena.querySelector("#bn-pic");
      this.pic.parts.forEach(([d, c], i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.classList.add("bn-part"); g.dataset.c = c;
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", d); p.setAttribute("fill-rule", "evenodd"); g.appendChild(p);
        // етикет в центъра на частта
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.textContent = this.labelOf[c]; t.setAttribute("text-anchor", "middle"); g.appendChild(t);
        svg.appendChild(g);
        const b = p.getBBox(); t.setAttribute("x", b.x + b.width / 2); t.setAttribute("y", b.y + b.height / 2 + 6);
        g.addEventListener("pointerdown", e => { e.preventDefault(); this.paint(g); });
      });
      const pal = this.shell.arena.querySelector("#bn-pal");
      shuffle(colorsUsed.slice()).forEach(c => { const b = document.createElement("button"); b.type = "button"; b.className = "bn-sw"; b.style.setProperty("--c", PALETTE[c]); b.dataset.c = c; b.innerHTML = `<i></i><b>${this.labelOf[c]}</b>`; b.addEventListener("pointerdown", e => { e.preventDefault(); this.select(b); }); pal.appendChild(b); });
      this.select(pal.firstChild);
      this.renderProgress = () => { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); li.className = i < this.done ? "ok" : ""; p.appendChild(li); } };
    }
    startRound() { this.shell.setLabel(`Оцвети ${this.labelOf[this.sel.dataset.c]}`); if (this.idx === 0) this.say("Избери цвят и оцвети частите с това число"); }
    select(b) { [...b.parentElement.children].forEach(x => x.classList.remove("sel")); b.classList.add("sel"); this.sel = b; this.shell.setLabel(`Оцвети ${this.labelOf[b.dataset.c]}`); this.say(this.labelOf[b.dataset.c].replace("+", "плюс").replace("−", "минус")); }
    paint(g) {
      if (this.finished || g.classList.contains("done")) return;
      const ok = g.dataset.c === this.sel.dataset.c;
      this.locked = false;
      if (!this.answer(ok, { text: `част ${this.labelOf[g.dataset.c]}`, answer: this.labelOf[g.dataset.c], given: this.labelOf[this.sel.dataset.c] })) return;
      this.locked = false;
      if (ok) { g.querySelector("path").style.fill = PALETTE[g.dataset.c]; g.classList.add("done"); this.done++; this.idx = this.done; this.renderProgress(); if (this.done === this.total) { this.shell.flash("Картината е готова!", "good"); this.say("Браво! Картината е готова."); setTimeout(() => this.finish(false), 1200); } }
      else { g.classList.add("wrong"); setTimeout(() => g.classList.remove("wrong"), 500); this.shell.flash(`Тук е ${this.labelOf[g.dataset.c]}`, "bad"); this.say(`Не. Тук е ${this.labelOf[g.dataset.c].replace("+", "плюс").replace("−", "минус")}`); setTimeout(() => this.shell.hideFlash(), 1200); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.brightNumbers = {
    id: "brightNumbers", name: "Ярки числа", skill: "Смятане чрез оцветяване", top: "crystal", cls: BrightNumbersGame, tiers: [1, 3, 5],
    task: "Оцвети всяка част от картината с подходящия цвят.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 3, def: 1, help: "Ниво 1: числа до 10. Ниво 2: числа до 20. Ниво 3: примери, чийто отговор е числото на цвета." },
      { key: "picture", label: "Картинка", type: "range", min: 1, max: 4, def: 1 },
      { key: "range", label: "Диапазон на смятане", type: "range", min: 9, max: 20, def: 10, help: "Само за ниво 3." },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add", help: "Само за ниво 3." }
    ],
    paramsLine: s => `картинка ${s.picture}` + (Number(s.level) === 3 ? ` · до ${s.range} · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]}` : "")
  };
})();
