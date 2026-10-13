/* Пиратско съкровище — по кода им (26.js): Диапазон 6..20, Действие, Брой примери 4..20; 8 монети:
   двете числа, знакът (при „смесено“ и другият знак) и запълващи числа. На сандъка е отговорът.
   Детето поставя монетите в трите места над сандъка така, че примерът да дава числото на сандъка.
   Пиратът се радва при вярно и тъгува при грешно. Норми 0 / 1 / 2. */
(function () {
  function example(range, op) { const kind = op === "mix" ? (Math.random() < .5 ? "add" : "sub") : op; if (kind === "add") { const a = 1 + rnd(range - 1), b = 1 + rnd(range - a); return { a, b, op: "+", ans: a + b }; } const a = 2 + rnd(range - 1), b = 1 + rnd(a - 1); return { a, b, op: "−", ans: a - b }; }
  const PIRATE = { calm: `<svg viewBox="0 0 120 160"><ellipse cx="60" cy="150" rx="40" ry="8" fill="rgba(0,0,0,.25)"/><rect x="34" y="80" width="52" height="60" rx="12" fill="#D9302A"/><rect x="34" y="80" width="52" height="14" fill="#F4E5B0"/><circle cx="60" cy="52" r="30" fill="#F5C9A0"/><path d="M28 48 C34 18 86 18 92 48 Z" fill="#2B2B2B"/><path d="M26 48 h68 v8 h-68 z" fill="#2B2B2B"/><circle cx="60" cy="30" r="5" fill="#fff"/><circle cx="50" cy="54" r="4" fill="#2B2B2B"/><rect x="62" y="46" width="16" height="12" rx="3" fill="#2B2B2B"/><path class="mouth" d="M48 68 q12 6 24 0" fill="none" stroke="#7A3B1E" stroke-width="3" stroke-linecap="round"/></svg>` };
  class PiratesTreasuresGame extends BaseGame {
    get gameId() { return "piratesTreasures"; }
    get skillName() { return `Съставяне на пример до ${this.s.range}`; }
    render() {
      this.range = Number(this.s.range || 6);
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-treasure"/></svg>
        <div class="tr"><div class="tr-left" id="tr-pirate">${PIRATE.calm}</div><div class="tr-center"><div class="tr-slots" id="tr-slots"><button type="button" class="tr-slot" data-i="0"></button><button type="button" class="tr-slot op" data-i="1"></button><button type="button" class="tr-slot" data-i="2"></button><b class="tr-eq">=</b><span class="tr-target" id="tr-target"></span></div><div class="tr-chest" id="tr-chest"></div></div><div class="tr-coins" id="tr-coins"></div></div>`;
      this.pirate = this.shell.arena.querySelector("#tr-pirate"); this.slots = [...this.shell.arena.querySelectorAll(".tr-slot")]; this.coins = this.shell.arena.querySelector("#tr-coins"); this.target = this.shell.arena.querySelector("#tr-target"); this.chest = this.shell.arena.querySelector("#tr-chest");
      this.slots.forEach(s => s.addEventListener("pointerdown", e => { e.preventDefault(); if (s.dataset.coin) this.returnCoin(s); }));
    }
    startRound() {
      this.ex = example(this.range, this.s.op); this.current = { text: `? ? ? = ${this.ex.ans}`, answer: `${this.ex.a} ${this.ex.op} ${this.ex.b}` };
      const vals = [String(this.ex.a), String(this.ex.b), this.ex.op]; if (this.s.op === "mix") vals.push(this.ex.op === "+" ? "−" : "+");
      while (vals.length < 8) { const v = String(rnd(this.range + 1)); if (!vals.includes(v)) vals.push(v); }
      this.coins.innerHTML = ""; shuffle(vals).forEach((v, i) => { const c = document.createElement("button"); c.type = "button"; c.className = "tr-coin"; c.textContent = v; c.style.setProperty("--i", i); c.addEventListener("pointerdown", e => this.pressCoin(e, c)); this.coins.appendChild(c); });
      this.slots.forEach(s => { s.textContent = ""; s.dataset.coin = ""; s.className = "tr-slot" + (s.dataset.i === "1" ? " op" : ""); });
      this.target.textContent = this.ex.ans; this.chest.className = "tr-chest"; this.pirate.className = "tr-left calm";
      this.shell.setLabel(`Направи ${this.ex.ans}`); this.say(`Събери от монетите пример, който прави ${this.ex.ans}`);
    }
    // Докосване (основно): монетата лети до мястото си. Влачене (алтернатива): ако пръстът се премести, монетата следва и се пуска върху място.
    pressCoin(e, coin) {
      if (this.locked || coin.disabled) return; e.preventDefault();
      const sx = e.clientX, sy = e.clientY; let dragging = false, ghost = null;
      const move = ev => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 12) { dragging = true; ghost = document.createElement("div"); ghost.className = "tr-ghost"; ghost.textContent = coin.textContent; document.body.appendChild(ghost); coin.classList.add("lifting"); }
        if (dragging) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
      };
      const up = ev => {
        document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); coin.classList.remove("lifting");
        if (!dragging) { this.place(coin); return; }
        ghost.remove(); const el = document.elementFromPoint(ev.clientX, ev.clientY); const slot = el && el.closest(".tr-slot");
        if (slot && !slot.dataset.coin) this.place(coin, slot);
      };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    }
    place(coin, forced) {
      if (this.locked || coin.disabled) return;
      const isOp = coin.textContent === "+" || coin.textContent === "−";
      let slot = forced; if (slot && ((slot.dataset.i === "1") !== isOp)) { slot.classList.add("wrong"); setTimeout(() => slot.classList.remove("wrong"), 450); return; }
      if (!slot) slot = this.slots.find(s => !s.dataset.coin && (s.dataset.i === "1") === isOp); if (!slot) return;
      // анимация: монетата лети от мястото си до слота
      const cr = coin.getBoundingClientRect(), sr = slot.getBoundingClientRect();
      const fly = document.createElement("div"); fly.className = "tr-ghost fly"; fly.textContent = coin.textContent; fly.style.left = (cr.x + cr.width / 2) + "px"; fly.style.top = (cr.y + cr.height / 2) + "px"; document.body.appendChild(fly);
      coin.disabled = true; coin.classList.add("used"); slot.dataset.coin = coin.textContent; this.say(coin.textContent.replace("+", "плюс").replace("−", "минус"));
      requestAnimationFrame(() => { fly.style.left = (sr.x + sr.width / 2) + "px"; fly.style.top = (sr.y + sr.height / 2) + "px"; fly.style.transform = "translate(-50%,-50%) scale(.9) rotate(360deg)"; });
      setTimeout(() => { fly.remove(); slot.textContent = coin.textContent; slot.classList.add("landed"); setTimeout(() => slot.classList.remove("landed"), 300); if (this.slots.every(s => s.dataset.coin)) this.check(); }, 380);
    }
    returnCoin(slot) { if (this.locked) return; const v = slot.dataset.coin; const coin = [...this.coins.children].find(c => c.disabled && c.textContent === v); if (coin) { coin.disabled = false; coin.classList.remove("used"); } slot.textContent = ""; slot.dataset.coin = ""; }
    check() {
      const a = Number(this.slots[0].dataset.coin), op = this.slots[1].dataset.coin, b = Number(this.slots[2].dataset.coin);
      const res = op === "+" ? a + b : a - b; const ok = res === this.ex.ans && res >= 0;
      if (!this.answer(ok, { text: this.current.text, answer: this.current.answer, given: `${a} ${op} ${b}` })) return;
      if (ok) { this.pirate.className = "tr-left happy"; this.chest.classList.add("full"); this.slots.forEach(s => s.classList.add("right")); this.shell.flash("Точно така!", "good"); this.say(`Точно така! ${a} ${op === "+" ? "плюс" : "минус"} ${b} е ${this.ex.ans}`); this.advance(1500); }
      else { this.pirate.className = "tr-left sad"; this.slots.forEach(s => s.classList.add("wrong")); this.shell.flash(`${a} ${op} ${b} = ${res}, а трябва ${this.ex.ans}`, "bad"); this.say(`Не. ${a} ${op === "+" ? "плюс" : "минус"} ${b} е ${res}, а трябва ${this.ex.ans}`); this.advance(2600); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.piratesTreasures = {
    id: "piratesTreasures", name: "Пиратско съкровище", skill: "Съставяне на пример", top: "chest", cls: PiratesTreasuresGame, tiers: [0, 1, 2],
    task: "Събери от монетите числов пример, така че отговорът да съвпада с числото на сандъка.",
    settings: [
      { key: "range", label: "Диапазон на смятане", type: "range", min: 6, max: 20, def: 6 },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add" },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 20, def: 4 }
    ],
    paramsLine: s => `${s.examples} примера · до ${s.range} · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]}`
  };
})();
