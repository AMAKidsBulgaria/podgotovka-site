/* Читарика: „Ударения“, „Познай думата“, „Думи“, „Кажи друго“. */
(function () {
  const DICT = () => window.BUK.readica || {};
  const norm = w => w.replace(/\//g, "");
  const stressIndex = w => { const s = norm(w); for (let i = 0; i < s.length; i++) if (s[i] !== s[i].toLowerCase()) return i; return -1; };
  const baseWords = (cx, maxLen, minLen = 1) => { const b = DICT().base || {}; const list = (b[String(cx)] || b["1"] || ["мА/ма", "кО/те", "во/дА"]); return list.filter(w => { const n = norm(w); return n.length <= maxLen && n.length >= minLen && stressIndex(w) >= 0; }); };

  /* Ударения: една дума, детето докосва ударената гласна. Един опит на дума (както в оригинала), после верният отговор се показва. */
  class AccentsGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; }
    get gameId() { return "accents"; } get skillName() { return "Ударение в думата"; }
    render() { this.pool = shuffle(baseWords(this.s.dataComplexity, Number(this.s.maxLettersQty) || 4).slice()); this.k = 0; this.scene("wt-ac", "scene-space-game"); this.shell.setLabel("Коя гласна е ударена?"); }
    startRound() {
      this.stepWrong = 0; const raw = this.pool[this.k++ % this.pool.length]; this.cur = norm(raw).toLowerCase(); this.si = stressIndex(raw);
      this.box.innerHTML = `<div class="ac-word" id="w">${[...this.cur].map((l, i) => `<button type="button" class="ac-l" data-i="${i}">${l}</button>`).join("")}</div><div class="az-hint">Докосни буквата, върху която пада ударението.</div>`;
      this.box.querySelectorAll(".ac-l").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      this.say(this.cur);
    }
    tap(b) {
      if (this.finished || this.locked) return;
      const i = Number(b.dataset.i);
      if (i === this.si) { b.classList.add("good"); this.done(this.cur, 900); }
      else { this.locked = true; this.miss(this.cur, this.cur[i]); b.classList.add("bad"); this.shake(b); const r = this.box.querySelector(`.ac-l[data-i="${this.si}"]`); r.classList.add("hint"); this.shell.flash(`Ударението е на „${this.cur[this.si]}“`, "bad"); this.say(this.cur); this.roundOk.push(false); this.idx++; this.renderProgress(); this.log.push({ text: this.cur, answer: this.cur[this.si], given: this.cur[i], ok: false, ms: 0, adapt: 0 }); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 1500); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.accents = {
    id: "accents", name: "Ударения", module: "readica", skill: "Ударение", cls: AccentsGame,
    task: "Определи правилно ударената гласна: докосни буквата, върху която пада ударението.",
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 25, def: 4 },
      { key: "dataComplexity", label: "Речник", type: "range", min: 1, max: 2, def: 1, help: "Два речника с по около 1800 думи." },
      { key: "maxLettersQty", label: "Максимум букви в дума", type: "range", min: 4, max: 15, def: 4 }
    ],
    paramsLine: s => `${s.answersQty} думи · до ${s.maxLettersQty} букви · речник ${s.dataComplexity}`
  };

  /* Познай думата: буквите се показват за кратко (по 2 или по 1, поред или разбъркано), после детето сглобява думата от буквен запас с 3-4 излишни букви. */
  class GuessWordGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; this.level = Number(this.s.level) || 1; }
    get gameId() { return "guessWord"; } get skillName() { return "Запомняне и сглобяване на дума"; }
    render() { this.pool = shuffle(baseWords(this.s.dataComplexity, Number(this.s.maxLettersQty) || 4, 2).slice()); this.k = 0; this.scene("wt-gw", "scene-space-game"); this.shell.setLabel("Запомни думата"); }
    startRound() {
      this.stepWrong = 0; const raw = this.pool[this.k++ % this.pool.length]; this.cur = norm(raw).toLowerCase(); this.pos = 0;
      const others = this.pool.map(w => norm(w).toLowerCase()).join(""); const extra = []; while (extra.length < 3 + rnd(2)) { const l = others[rnd(others.length)]; if (/[а-я]/.test(l)) extra.push(l); }
      this.bank = shuffle([...this.cur].concat(extra));
      this.box.innerHTML = `<div class="gw-slots" id="slots">${[...this.cur].map(() => `<span class="gw-slot"></span>`).join("")}</div><div class="gw-bank" id="bank" hidden>${this.bank.map((l, i) => `<button type="button" class="ac-l" data-i="${i}">${l}</button>`).join("")}</div><div class="az-hint" id="hint">Запомни буквите…</div><button type="button" class="gbtn gbtn-sky gbtn-sm gw-again" id="again" hidden>Покажи пак</button>`;
      this.box.querySelectorAll("#bank .ac-l").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      this.box.querySelector("#again").addEventListener("click", () => this.reveal());
      this.reveal(true);
    }
    reveal(first) {
      this.locked = true; const slots = [...this.box.querySelectorAll(".gw-slot")]; slots.forEach(s => { s.textContent = ""; s.classList.remove("show"); });
      const per = this.level <= 2 ? 2 : 1; let order = [...this.cur].map((_, i) => i); if (this.level === 2 || this.level === 4) order = shuffle(order);
      const groups = []; for (let i = 0; i < order.length; i += per) groups.push(order.slice(i, i + per));
      groups.forEach((g, gi) => { this.later(() => { slots.forEach(s => { s.textContent = ""; s.classList.remove("show"); }); g.forEach(i => { slots[i].textContent = this.cur[i]; slots[i].classList.add("show"); }); }, 1000 * gi); });
      this.later(() => { slots.forEach(s => { if (!s.classList.contains("done")) { s.textContent = ""; s.classList.remove("show"); } }); this.box.querySelector("#bank").hidden = false; this.box.querySelector("#hint").textContent = "Сглоби думата от буквите."; this.box.querySelector("#again").hidden = false; this.locked = false; if (first) this.say("Сглоби думата"); }, 1000 * groups.length);
    }
    tap(b) {
      if (this.finished || this.locked || b.classList.contains("used")) return;
      const l = b.textContent;
      if (l === this.cur[this.pos]) { b.classList.add("used"); const s = this.box.querySelectorAll(".gw-slot")[this.pos]; s.textContent = l; s.classList.add("show", "done"); this.pos++; if (this.pos >= this.cur.length) { this.say(this.cur); this.done(this.cur, 900); } }
      else { this.miss(this.cur, l); b.classList.add("bad"); this.shake(b); this.later(() => b.classList.remove("bad"), 900); this.shell.flash("Не е тази буква. Натисни „Покажи пак“, ако си забравил.", "bad"); this.later(() => this.shell.hideFlash(), 1400); }
    }
  }
  window.GAMES.guessWord = {
    id: "guessWord", name: "Познай думата", module: "readica", skill: "Запомняне на дума", cls: GuessWordGame,
    task: s => ({ 1: "Запомни буквите и сглоби правилно думата. Думата се появява по две последователни букви.", 2: "Запомни буквите и сглоби думата. Буквите се появяват по две в разбъркан ред.", 3: "Запомни буквите и сглоби думата. Буквите се появяват по една поред.", 4: "Запомни буквите и сглоби думата. Буквите се появяват по една в разбъркан ред." })[Number(s.level) || 1],
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 4, def: 1, help: "1 по две букви поред; 2 по две разбъркано; 3 по една поред; 4 по една разбъркано." },
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 25, def: 4 },
      { key: "dataComplexity", label: "Речник", type: "range", min: 1, max: 2, def: 1 },
      { key: "maxLettersQty", label: "Максимум букви в дума", type: "range", min: 4, max: 15, def: 4 }
    ],
    paramsLine: s => `ниво ${s.level} · ${s.answersQty} думи · до ${s.maxLettersQty} букви`
  };

  /* Думи: ниво 1 — 4 думи, коя е от темата (предмет/признак/действие); ниво 2 — свържи 3 думи с 3 групи. */
  const THEMES = { item: "Предмет", sign: "Признак", action: "Действие" };
  class WordsGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; this.level = Number(this.s.level) || 1; }
    get gameId() { return "words"; } get skillName() { return "Части на речта: предмет, признак, действие"; }
    render() { const g = DICT().grouped || { item: ["маса", "стол"], sign: ["голям", "червен"], action: ["скача", "пее"] }; this.g = g; this.scene("wt-wd", "scene-space-game"); this.shell.setLabel(this.level === 1 ? `Коя дума е ${THEMES[this.s.theme || "item"].toLowerCase()}?` : "Свържи думата с групата"); }
    startRound() {
      this.stepWrong = 0; const keys = Object.keys(THEMES);
      if (this.level === 1) {
        const th = this.s.theme || "item"; const right = this.g[th][rnd(this.g[th].length)]; const others = keys.filter(k => k !== th).flatMap(k => this.g[k]); this.right = right;
        this.items = shuffle([right].concat(shuffle(others.slice()).slice(0, 3)));
        this.box.innerHTML = `<div class="qtext">Намери думата, която е ${THEMES[th].toLowerCase()}</div><div class="pcards">${this.items.map(w => `<button type="button" class="wtile">${w}</button>`).join("")}</div>`;
        [...this.box.querySelectorAll(".wtile")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap1(b, this.items[i]); }));
        this.say(`Коя дума е ${THEMES[th]}?`);
      } else {
        this.pairs = keys.map(k => ({ k, w: this.g[k][rnd(this.g[k].length)] })); this.matched = 0; this.selW = null; this.selG = null;
        const ws = shuffle(this.pairs.slice()), gs = shuffle(keys.slice());
        this.box.innerHTML = `<div class="match"><div class="col" id="cw">${ws.map(p => `<button type="button" class="wtile" data-k="${p.k}">${p.w}</button>`).join("")}</div><div class="col" id="cg">${gs.map(k => `<button type="button" class="wtile grp" data-k="${k}">${THEMES[k]}</button>`).join("")}</div></div>`;
        this.box.querySelectorAll("#cw .wtile").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(b, "w"); }));
        this.box.querySelectorAll("#cg .wtile").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(b, "g"); }));
        this.say("Свържи всяка дума с нейната група.");
      }
    }
    tap1(b, w) {
      if (this.finished || this.locked || b.classList.contains("bad")) return;
      if (w === this.right) { b.classList.add("good"); this.done(w, 900); }
      else { this.miss(this.right, w); b.classList.add("bad"); this.shake(b); const k = Object.keys(THEMES).find(k => this.g[k].includes(w)); this.shell.flash(`„${w}“ е ${THEMES[k].toLowerCase()}`, "bad"); this.later(() => this.shell.hideFlash(), 1300); }
    }
    pick(b, kind) {
      if (this.finished || this.locked || b.classList.contains("used")) return;
      const col = kind === "w" ? "#cw" : "#cg"; this.box.querySelectorAll(`${col} .wtile`).forEach(x => x.classList.remove("sel")); b.classList.add("sel");
      if (kind === "w") this.selW = b; else this.selG = b;
      if (this.selW && this.selG) {
        const ok = this.selW.dataset.k === this.selG.dataset.k, a = this.selW, c = this.selG; this.selW = this.selG = null;
        if (ok) { [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("good", "used"); }); this.matched++; if (this.matched >= 3) this.done(this.pairs.map(p => p.w).join(", "), 900); }
        else { this.miss("двойка", a.textContent + "→" + c.textContent); [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("bad"); this.shake(x); }); this.later(() => [a, c].forEach(x => x.classList.remove("bad")), 600); this.shell.flash(`„${a.textContent}“ е ${THEMES[a.dataset.k].toLowerCase()}`, "bad"); this.later(() => this.shell.hideFlash(), 1300); }
      }
    }
  }
  window.GAMES.words = {
    id: "words", name: "Думи", module: "readica", skill: "Части на речта", cls: WordsGame,
    task: s => Number(s.level) === 2 ? "Свържи всяка дума с нейната група: предмет, признак или действие." : "Определи думите, които принадлежат към дадената група (предмет, признак или действие).",
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1: избери думата от темата. 2: свържи три думи с трите групи." },
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 25, def: 4 },
      { key: "theme", label: "Тема", type: "cycle", options: [["item", "Предмет"], ["sign", "Признак"], ["action", "Действие"]], def: "item", enabledIf: s => Number(s.level) !== 2 }
    ],
    paramsLine: s => `ниво ${s.level} · ${s.answersQty} задачи` + (Number(s.level) !== 2 ? ` · ${THEMES[s.theme || "item"].toLowerCase()}` : "")
  };

  /* Кажи друго: 4 двойки думи с подобно значение (синоними) — две колони, свържи ги. Речник 2 (ниво 2): двойки с картинки/противоположности. */
  const SYN = [["голям", "огромен"], ["малък", "мъничък"], ["бърз", "пъргав"], ["хубав", "красив"], ["умен", "мъдър"], ["смел", "храбър"], ["весел", "радостен"], ["тъжен", "натъжен"], ["силен", "як"], ["чист", "спретнат"], ["говори", "приказва"], ["гледа", "наблюдава"], ["тича", "бяга"], ["скача", "подскача"], ["къща", "дом"], ["дете", "хлапе"], ["път", "шосе"], ["приятел", "другар"], ["студен", "леден"], ["топъл", "затоплен"]];
  const ANT = [["голям", "малък"], ["топъл", "студен"], ["ден", "нощ"], ["бърз", "бавен"], ["висок", "нисък"], ["светъл", "тъмен"], ["мокър", "сух"], ["сладък", "горчив"], ["тежък", "лек"], ["дълъг", "къс"], ["чист", "мръсен"], ["пълен", "празен"], ["весел", "тъжен"], ["силен", "слаб"], ["ново", "старо"], ["отворен", "затворен"], ["горе", "долу"], ["ляво", "дясно"], ["зима", "лято"], ["добър", "лош"]];
  class SayDifferentlyGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; this.level = Number(this.s.level) || 1; }
    get gameId() { return "sayDifferently"; } get skillName() { return this.level === 2 ? "Противоположни думи" : "Думи с подобно значение"; }
    render() { this.scene("wt-sd", "scene-space-game"); this.shell.setLabel(this.level === 2 ? "Намери противоположното" : "Намери същото значение"); this.used = new Set(); }
    startRound() {
      this.stepWrong = 0; const src = this.level === 2 ? ANT : SYN; let c = src.filter(p => !this.used.has(p[0])); if (c.length < 4) { this.used.clear(); c = src.slice(); }
      this.pairs = shuffle(c.slice()).slice(0, 4); this.pairs.forEach(p => this.used.add(p[0])); this.matched = 0; this.selA = this.selB = null;
      const A = shuffle(this.pairs.map((p, i) => ({ w: p[0], i }))), B = shuffle(this.pairs.map((p, i) => ({ w: p[1], i })));
      this.box.innerHTML = `<div class="match rows"><div class="col" id="ca">${A.map(x => `<button type="button" class="wtile" data-i="${x.i}">${x.w}</button>`).join("")}</div><div class="col" id="cb">${B.map(x => `<button type="button" class="wtile" data-i="${x.i}">${x.w}</button>`).join("")}</div></div>`;
      this.box.querySelectorAll("#ca .wtile").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(b, "a"); }));
      this.box.querySelectorAll("#cb .wtile").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(b, "b"); }));
      this.say(this.level === 2 ? "Свържи думите с противоположно значение." : "Свържи думите с подобно значение.");
    }
    pick(b, kind) {
      if (this.finished || this.locked || b.classList.contains("used")) return;
      this.box.querySelectorAll(`#c${kind} .wtile`).forEach(x => x.classList.remove("sel")); b.classList.add("sel");
      if (kind === "a") this.selA = b; else this.selB = b;
      if (this.selA && this.selB) {
        const ok = this.selA.dataset.i === this.selB.dataset.i, a = this.selA, c = this.selB; this.selA = this.selB = null;
        if (ok) { [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("good", "used"); }); this.say(`${a.textContent}, ${c.textContent}`); this.matched++; if (this.matched >= 4) this.done(this.pairs.map(p => p.join("–")).join(", "), 900); }
        else { this.miss("двойка", a.textContent + "→" + c.textContent); [a, c].forEach(x => { x.classList.remove("sel"); x.classList.add("bad"); this.shake(x); }); this.later(() => [a, c].forEach(x => x.classList.remove("bad")), 600); this.shell.flash("Тези две думи не са двойка", "bad"); this.later(() => this.shell.hideFlash(), 1200); }
      }
    }
  }
  window.GAMES.sayDifferently = {
    id: "sayDifferently", name: "Кажи друго", module: "readica", skill: "Синоними и антоними", cls: SayDifferentlyGame,
    task: s => Number(s.level) === 2 ? "Намери двойки думи с противоположно значение." : "Намери двойки думи с подобно значение.",
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, q, 2 * q]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1: думи с подобно значение. 2: думи с противоположно значение." },
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 8, def: 4 }
    ],
    paramsLine: s => `ниво ${s.level} · ${s.answersQty} серии по 4 двойки`
  };
})();
