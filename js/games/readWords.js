/* Читарика: „Правилни думи“ (картинка + 2 думи) и „Построй изречение“ (подреди думите). */
(function () {
  const DICT = () => window.BUK.readica || {};
  /* Правилни думи: ниво 1 — вярната дума към картинката срещу друга дума; ниво 2 — вярната срещу сгрешен правопис (двойката от речника). */
  class TrueWordsGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; this.level = Number(this.s.level) || 1; }
    get gameId() { return "trueWords"; } get skillName() { return this.level === 2 ? "Правопис: разпознаване на грешка" : "Четене на дума към картинка"; }
    render() {
      let pairs = DICT().pairs || []; if (!Array.isArray(pairs)) pairs = Object.values(pairs).flat(); const byW = {}; pairs.forEach(p => { if (p && p.word) byW[String(p.word).toLowerCase()] = p.pair; });
      this.words = window.BUK_WORDS.map(w => ({ ...w, pair: byW[w.w] })).filter(w => this.level === 1 || w.pair);
      if (this.words.length < 4) this.words = window.BUK_WORDS.map(w => ({ ...w, pair: w.pair || w.w.replace(/[аоуеи]/, m => ({ а: "о", о: "а", у: "о", е: "и", и: "е" })[m]) }));
      this.scene("wt-tw", "scene-space-game"); this.used = new Set(); this.shell.setLabel(this.level === 2 ? "Кой правопис е верен?" : "Коя дума е за картинката?");
    }
    startRound() {
      this.stepWrong = 0; let c = this.words.filter(w => !this.used.has(w.w)); if (!c.length) { this.used.clear(); c = this.words.slice(); }
      const it = c[rnd(c.length)]; this.used.add(it.w); this.cur = it;
      const other = this.level === 2 ? it.pair : this.words.filter(w => w.w !== it.w)[rnd(this.words.length - 1)].w;
      this.opts = shuffle([it.w, other]);
      this.box.innerHTML = `<div class="pcard big-pic">${window.BUK_PIC(it)}</div><div class="pcards">${this.opts.map(o => `<button type="button" class="wtile">${o.toUpperCase()}</button>`).join("")}</div>`;
      [...this.box.querySelectorAll(".wtile")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, this.opts[i]); }));
      this.say(this.level === 2 ? "Коя дума е написана правилно?" : "Коя дума е за картинката?");
    }
    tap(b, w) {
      if (this.finished || this.locked || b.classList.contains("bad")) return;
      if (w === this.cur.w) { b.classList.add("good"); this.done(this.cur.w, 900); }
      else { this.miss(this.cur.w, w); b.classList.add("bad"); this.shake(b); this.shell.flash(this.level === 2 ? `Правилно е „${this.cur.w}“` : `Картинката е „${this.cur.w}“`, "bad"); this.say(this.cur.w); this.later(() => this.shell.hideFlash(), 1300); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.trueWords = {
    id: "trueWords", name: "Правилни думи", module: "readica", skill: "Четене на думи", cls: TrueWordsGame,
    task: s => Number(s.level) === 2 ? "Избери думата с правилния правопис към картинката." : "Избери правилната дума към картинката.",
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "1: вярната дума срещу друга дума. 2: вярната дума срещу същата с грешка в правописа." },
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 25, def: 4 }
    ],
    paramsLine: s => `ниво ${s.level} · ${s.answersQty} думи`
  };

  /* Построй изречение: разбъркани думи, докосни ги в правилния ред; долу се изгражда изречението. */
  class BuildSentenceGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.answersQty) || 4; }
    get gameId() { return "buildSentence"; } get skillName() { return "Словоред в изречение"; }
    render() {
      const all = (DICT().sentences || {}); const key = String(this.s.dataComplexity || 1);
      this.pool = (all[key] || all["1"] || [["Мама чете книга"], ["Котката спи на дивана"], ["Децата играят в парка"]]).map(x => Array.isArray(x) ? x[0] : x).filter(x => x && x.split(" ").length >= 2);
      this.scene("wt-bs", "scene-space-game"); this.used = new Set(); this.shell.setLabel("Сглоби изречението");
    }
    startRound() {
      this.stepWrong = 0; let c = this.pool.filter(s => !this.used.has(s)); if (!c.length) { this.used.clear(); c = this.pool.slice(); }
      const s = c[rnd(c.length)]; this.used.add(s); this.words = s.split(" ").map(w => w.replace(/[.!?]$/, "")); this.k = 0;
      let tiles; let g = 0; do { tiles = shuffle(this.words.map((w, i) => ({ w, i }))); } while (tiles.every((t, i) => t.i === i) && g++ < 20 && this.words.length > 1);
      this.tiles = tiles;
      this.box.innerHTML = `<div class="bs-row" id="src">${tiles.map(t => `<button type="button" class="wtile">${t.w.toLowerCase()}</button>`).join("")}</div><div class="bs-built" id="built">${this.words.map(() => `<span class="bs-slot"></span>`).join("")}</div>`;
      [...this.box.querySelectorAll("#src .wtile")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, tiles[i]); }));
      this.say("Подреди думите, за да се получи изречение.");
    }
    tap(b, t) {
      if (this.finished || this.locked || b.classList.contains("used")) return;
      if (t.i === this.k) {
        b.classList.add("used"); const slot = this.box.querySelectorAll(".bs-slot")[this.k];
        slot.textContent = (this.k === 0 ? t.w[0].toUpperCase() + t.w.slice(1).toLowerCase() : t.w.toLowerCase()) + (this.k === this.words.length - 1 ? "." : ""); slot.classList.add("on");
        this.k++; if (this.k >= this.words.length) { this.say(this.words.join(" ")); this.done(this.words.join(" "), 1400); }
      } else { this.miss(this.words.join(" "), t.w); b.classList.add("bad"); this.shake(b); this.later(() => b.classList.remove("bad"), 1000); this.shell.flash(this.k === 0 ? "С коя дума започва изречението?" : `Коя дума идва след „${this.words[this.k - 1]}“?`, "bad"); this.later(() => this.shell.hideFlash(), 1300); if (this.stepWrong >= 2) [...this.box.querySelectorAll("#src .wtile")].forEach((x, i) => { if (this.tiles[i].i === this.k) x.classList.add("hint"); }); }
    }
  }
  window.GAMES.buildSentence = {
    id: "buildSentence", name: "Построй изречение", module: "readica", skill: "Словоред", cls: BuildSentenceGame,
    task: "Сглоби изречението: докосвай думите в правилния ред.",
    tiers: s => { const q = Number(s.answersQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; },
    settings: [
      { key: "answersQty", label: "Количество отговори", type: "range", min: 4, max: 25, def: 4 },
      { key: "dataComplexity", label: "Речник", type: "range", min: 1, max: 3, def: 1, help: "1: кратки изречения от 3 думи. 2 и 3: по-дълги изречения." }
    ],
    paramsLine: s => `${s.answersQty} изречения · речник ${s.dataComplexity}`
  };
})();
