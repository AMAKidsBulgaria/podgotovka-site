/* Околен свят: „Шоу с маски“, „Чиста каюта“, „Горско царство“, „Страж на времето“, „Сафари“, „На училище“. */
(function () {
  /* Шоу с маски: сетивен орган + 8 карти (4 негови + 4 чужди); детето избира 4; проверка след 4-тия избор, всяка карта се оцветява поотделно. */
  class MasksGame extends CardGame {
    get gameId() { return "masksShow"; } get skillName() { return "Сетивни органи"; }
    render() { this.scene("wt-mk"); this.shell.setLabel("Кое усещаме с този орган?"); this.used = new Set(); }
    startRound() {
      this.stepWrong = 0; const S = window.SENSES; let c = S.filter(s => !this.used.has(s[0])); if (!c.length) { this.used.clear(); c = S.slice(); }
      const sense = c[rnd(c.length)]; this.used.add(sense[0]); this.sense = sense;
      const wrong = shuffle(S.filter(s => s[0] !== sense[0]).flatMap(s => s[2])).slice(0, 4); this.right = new Set(sense[2]);
      this.items = shuffle(sense[2].concat(wrong)); this.sel = [];
      const picKey = { "Око": "pic-oko", "Ухо": "pic-uho", "Нос": "pic-nos", "Уста": "pic-usmivka", "Ръка": "pic-jumruk" }[sense[0]];
      this.box.innerHTML = `<div class="hero"><span class="pic" style="--pic-bg:#E6F4F1"><svg viewBox="0 0 100 100"><use href="#${picKey}"/></svg><b>${sense[0]}</b></span><div><h3>${sense[0]}: ${sense[1]}</h3><p>Избери 4 картинки, които усещаме с този орган.</p></div></div><div class="pcards" id="cards">${this.items.map(n => this.card(window.PIC(n, "sense"))).join("")}</div>`;
      [...this.box.querySelectorAll(".pcard")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, this.items[i]); }));
      this.say(`${sense[0]}. Кои четири картинки усещаме с ${sense[1]}?`);
    }
    tap(b, name) {
      if (this.finished || this.locked || b.classList.contains("sel")) return;
      b.classList.add("sel"); this.sel.push({ b, name });
      if (this.sel.length < 4) return;
      this.locked = true; let bad = 0;
      this.sel.forEach(x => { const ok = this.right.has(x.name); x.b.classList.remove("sel"); x.b.classList.add(ok ? "good" : "bad"); if (!ok) bad++; });
      this.box.querySelectorAll(".pcard:not(.good):not(.bad)").forEach(x => x.classList.add("dim"));
      if (bad === 0) this.done(this.sense[0], 1300);
      else { for (let i = 0; i < bad; i++) this.miss(this.sense[0], "грешна карта"); this.box.querySelectorAll(".pcard").forEach((x, i) => { if (this.right.has(this.items[i]) && !x.classList.contains("good")) x.classList.add("hint"); }); this.shell.flash(bad === 1 ? "Една картинка не е за този орган" : `${bad} картинки не са за този орган`, "bad"); this.say("Виж отбелязаните верни картинки."); this.roundOk.push(false); this.idx++; this.renderProgress(); this.log.push(this.event(false, { text: this.sense[0], answer: [...this.right].join(", "), given: this.sel.map(x => x.name).join(", "), ok: false, ms: 0, adapt: 0 , attempt: true })); this.later(() => { this.shell.hideFlash(); this.nextRound(); }, 2200); }
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.masksShow = { id: "masksShow", name: "Шоу с маски", module: "theWorld", skill: "Сетивни органи", cls: MasksGame, task: "Определи кои картини отговарят на съответния сетивен орган. Избери четирите картинки за показания орган.", tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; }, settings: [{ key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 25, def: 4 }], paramsLine: s => `${s.exampleQty} примера` };

  /* Чиста каюта: 12 предмета (6 играчки + 6 дрехи) разхвърляни в каютата; влачи (или докосни предмет, после кутия) към вярната кутия. Ниво 2 е с време. Край при 12 верни или 3 грешки. */
  class CleanRoomGame extends CardGame {
    constructor(...a) { super(...a); this.level = Number(this.s.level) || 1; this.gameTime = Number(this.s.gameTime) || 30; this.total = 12; }
    get gameId() { return "cleanShipRoom"; } get skillName() { return "Групиране на предмети"; }
    tick() { if (this.level !== 2) return super.tick(); const left = Math.max(0, this.gameTime - Math.floor((Date.now() - this.startedAt) / 1000)); this.shell.timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`; if (left <= 0 && !this.finished) { this.finished = true; this.shell.flash("Времето изтече", "bad"); setTimeout(() => this.finish(true), 1200); } }
    render() {
      this.scene("wt-cr", "scene-cabin"); this.shell.setLabel("Прибери вещите");
      const R = window.ROOM_ITEMS; this.groups = ["Играчки", "Дрехи"]; this.items = shuffle(this.groups.flatMap(g => R[g].slice(0, 6).map(n => ({ n, g }))));
      this.box.innerHTML = `<div class="cr-floor" id="floor">${this.items.map((it, i) => `<button type="button" class="pcard cr-item" data-i="${i}" draggable="true" style="left:${6 + (i % 6) * 15.5}%;top:${(i < 6 ? 4 : 40) + rnd(12)}%">${window.PIC(it.n, "item")}</button>`).join("")}</div><div class="cr-boxes">${this.groups.map(g => `<button type="button" class="cr-box" data-g="${g}"><span class="cr-lid"></span><b>${g}</b></button>`).join("")}</div><div class="az-hint">Докосни предмет и после кутията му, или го завлечи.</div>`;
      this.sel = null;
      this.box.querySelectorAll(".cr-item").forEach(b => { b.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button !== 0) return; this.pick(b); }); b.addEventListener("dragstart", e => { this.pick(b); e.dataTransfer.setData("text/plain", b.dataset.i); }); });
      this.box.querySelectorAll(".cr-box").forEach(x => { x.addEventListener("pointerdown", e => { e.preventDefault(); this.drop(x); }); x.addEventListener("dragover", e => e.preventDefault()); x.addEventListener("drop", e => { e.preventDefault(); this.drop(x); }); });
      this.say("Прибери играчките и дрехите в кутиите им.");
    }
    startRound() { this.stepWrong = 0; this.roundStart = Date.now(); }
    pick(b) { if (this.finished || b.classList.contains("gone")) return; this.box.querySelectorAll(".cr-item").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); this.sel = b; }
    drop(box) {
      if (this.finished || !this.sel) return; const it = this.items[Number(this.sel.dataset.i)], b = this.sel; this.sel = null; b.classList.remove("sel");
      if (it.g === box.dataset.g) { b.classList.add("pop"); this.later(() => b.classList.add("gone"), 400); box.classList.add("open"); this.later(() => box.classList.remove("open"), 600); this.correct++; this.renderScore(); this.log.push(this.event(true, { text: it.n, answer: it.g, given: box.dataset.g, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 })); this.roundOk.push(true); this.idx++; this.renderProgress(); this.say(it.n); if (this.idx >= 12) { this.shell.flash("Каютата е чиста!", "good"); this.later(() => this.finish(), 1200); } }
      else { this.miss(it.g, box.dataset.g); this.shake(b); b.classList.add("bad"); this.later(() => b.classList.remove("bad"), 800); this.shell.flash(`„${it.n}“ е от „${it.g.toLowerCase()}“`, "bad"); this.say(`${it.n} е от ${it.g}`); this.later(() => this.shell.hideFlash(), 1300); }
    }
  }
  window.GAMES.cleanShipRoom = { id: "cleanShipRoom", name: "Чиста каюта", module: "theWorld", skill: "Групиране", cls: CleanRoomGame, task: s => Number(s.level) === 2 ? "Прибери вещите в кутиите. Времето за игра е ограничено." : "Прибери вещите в кутиите. Времето за игра е неограничено.", tiers: () => [1, 3, 5], settings: [{ key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1 }, { key: "gameTime", label: "Време за игра", type: "range", min: 30, max: 300, step: 30, def: 30, unit: "сек.", enabledIf: s => Number(s.level) === 2 }], paramsLine: s => `ниво ${s.level}` + (Number(s.level) === 2 ? ` · ${s.gameTime} сек.` : "") };

  /* Горско царство: тема Дървета — на кое дърво е листото; тема Животни — чие е малкото. 4 карти, един клик. */
  class ForestGame extends CardGame {
    get gameId() { return "forestKingdom"; } get skillName() { return this.s.theme === "animals" ? "Животни и техните малки" : "Дървета и листа"; }
    render() {
      const c = (window.BUK.world || {}).forestKingdom || {}; const animals = this.s.theme === "animals";
      this.pairs = animals ? Object.keys(c.animals ? c.animals.L : { 1: "Котка" }).map(k => [c.animals ? c.animals.L[k] : "Котка", c.animals ? c.animals.S[k] : "Котенце"]) : Object.values(c.trees || { 1: "Дъб", 2: "Бреза", 3: "Липа", 4: "Клен" }).map(t => [t, `Листо от ${t.toLowerCase()}`]);
      this.animals = animals; this.scene("wt-fk"); this.shell.setLabel(animals ? "Чие е малкото?" : "От кое дърво е листото?"); this.used = new Set();
    }
    startRound() {
      this.stepWrong = 0; let c = this.pairs.filter(p => !this.used.has(p[0])); if (c.length < 4) { this.used.clear(); c = this.pairs.slice(); }
      const opts = shuffle(c.slice()).slice(0, 4); const right = opts[rnd(opts.length)]; this.used.add(right[0]); this.right = right; this.opts = opts;
      this.box.innerHTML = `<div class="hero">${window.PIC(right[1], this.animals ? "animal" : "tree")}<div><h3>${right[1]}</h3><p>${this.animals ? "Намери възрастното животно." : "Намери дървото."}</p></div></div><div class="pcards">${opts.map(p => this.card(window.PIC(p[0], this.animals ? "animal" : "tree"))).join("")}</div>`;
      [...this.box.querySelectorAll(".pcard")].forEach((b, i) => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b, opts[i]); }));
      this.say(this.animals ? `${right[1]}. Чие малко е това?` : `${right[1]}. От кое дърво е?`);
    }
    tap(b, p) {
      if (this.finished || this.locked || b.classList.contains("bad")) return;
      if (p === this.right) { b.classList.add("good"); this.box.querySelectorAll(".pcard:not(.good)").forEach(x => x.classList.add("dim")); this.done(this.right[0]); }
      else { this.miss(this.right[0], p[0]); b.classList.add("bad"); this.shake(b); this.shell.flash(`Не е ${p[0].toLowerCase()}`, "bad"); this.later(() => this.shell.hideFlash(), 1200); if (this.stepWrong >= 2) [...this.box.querySelectorAll(".pcard")].forEach((x, i) => { if (this.opts[i] === this.right) x.classList.add("hint"); }); }
    }
  }
  window.GAMES.forestKingdom = { id: "forestKingdom", name: "Горско царство", module: "theWorld", skill: "Природа", cls: ForestGame, task: s => s.theme === "animals" ? "Определи чие малко е изобразено на екрана." : "Определи на кое дърво принадлежи даденото листо.", tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; }, settings: [{ key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 25, def: 4 }, { key: "theme", label: "Тема", type: "cycle", options: [["trees", "Дървета"], ["animals", "Животни"]], def: "trees" }], paramsLine: s => `${s.exampleQty} примера · ${s.theme === "animals" ? "животни" : "дървета"}` };

  /* Страж на времето: ниво 1 — механичният часовник показва час, детето го задава на електронния (+/− по час); ниво 2 — обратно, детето поставя стрелката. Бутон „Провери“. */
  class TimeGame extends CardGame {
    constructor(...a) { super(...a); this.level = Number(this.s.level) || 1; this.total = Number(this.s.exampleQty) || 4; this.hour = 6; }
    get gameId() { return "timeGuardian"; } get skillName() { return "Часовник: цели часове"; }
    clockSvg(h) { const a = (h % 12) * 30; return `<svg class="tg-clock" viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="#FFF8E6" stroke="#B08A5E" stroke-width="8"/>${Array.from({ length: 12 }, (_, i) => { const ang = (i + 1) * 30 * Math.PI / 180; const x = 100 + 72 * Math.sin(ang), y = 100 - 72 * Math.cos(ang); return `<text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="#3B2A14">${i + 1}</text>`; }).join("")}<line x1="100" y1="100" x2="100" y2="40" stroke="#3B2A14" stroke-width="6" stroke-linecap="round" transform="rotate(${a} 100 100)"/><line x1="100" y1="100" x2="100" y2="24" stroke="#E0453A" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#3B2A14"/></svg>`; }
    render() { this.scene("wt-tg", "scene-cabin"); this.shell.setLabel(this.level === 1 ? "Колко е часът?" : "Постави стрелката"); }
    startRound() {
      this.stepWrong = 0; this.hour = (this.hour + 5 + rnd(7)) % 24; this.guess = this.level === 1 ? 0 : 0;
      const dig = h => `${String(h).padStart(2, "0")}:00`;
      const period = this.hour < 6 ? "нощ" : this.hour < 12 ? "сутрин" : this.hour < 18 ? "ден" : "вечер";
      if (this.level === 1) this.box.innerHTML = `<div class="tg-row"><div class="tg-side">${this.clockSvg(this.hour)}<span class="tg-cap">${period}</span></div><div class="tg-side"><div class="tg-digital" id="dig">${dig(this.guess)}</div><div class="tg-btns"><button type="button" class="gbtn gbtn-sky gbtn-sm" id="minus">− 1 час</button><button type="button" class="gbtn gbtn-sky gbtn-sm" id="plus">+ 1 час</button></div></div></div><button type="button" class="gbtn gbtn-green" id="check">Провери</button>`;
      else this.box.innerHTML = `<div class="tg-row"><div class="tg-side"><div class="tg-digital">${dig(this.hour)}</div><span class="tg-cap">${period}</span></div><div class="tg-side" id="clk">${this.clockSvg(this.guess)}<div class="tg-btns"><button type="button" class="gbtn gbtn-sky gbtn-sm" id="minus">− 1 час</button><button type="button" class="gbtn gbtn-sky gbtn-sm" id="plus">+ 1 час</button></div></div></div><button type="button" class="gbtn gbtn-green" id="check">Провери</button>`;
      const upd = () => { if (this.level === 1) this.box.querySelector("#dig").textContent = dig(this.guess); else this.box.querySelector("#clk svg").outerHTML = this.clockSvg(this.guess); };
      this.box.querySelector("#minus").addEventListener("click", () => { this.guess = (this.guess + (this.level === 1 ? 23 : 11)) % (this.level === 1 ? 24 : 12); upd(); });
      this.box.querySelector("#plus").addEventListener("click", () => { this.guess = (this.guess + 1) % (this.level === 1 ? 24 : 12); upd(); });
      this.box.querySelector("#check").addEventListener("click", () => this.check());
      this.say(this.level === 1 ? "Колко часа показва часовникът? Настрой електронния." : "Постави стрелката на часовника на същия час.");
    }
    check() {
      if (this.finished || this.locked) return;
      const ok = this.level === 1 ? this.guess === this.hour : this.guess === this.hour % 12;
      if (ok) { this.box.querySelector(".tg-digital").classList.add("good"); this.done(String(this.hour), 1000); }
      else { this.miss(String(this.hour), String(this.guess)); const d = this.box.querySelector(".tg-digital"); d.classList.add("bad"); this.shake(d); this.later(() => d.classList.remove("bad"), 800); this.shell.flash(this.level === 1 ? `Часът е ${this.hour}:00` : `Стрелката трябва да сочи ${this.hour % 12 || 12}`, "bad"); this.later(() => this.shell.hideFlash(), 1400); }
    }
  }
  window.GAMES.timeGuardian = { id: "timeGuardian", name: "Страж на времето", module: "theWorld", skill: "Часовник", cls: TimeGame, task: s => Number(s.level) === 2 ? "Определи колко часа показва електронният часовник и го задай на механичния." : "Определи колко часа показва механичният часовник и го задай на електронния.", tiers: s => { const q = Number(s.exampleQty) || 4; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; }, settings: [{ key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1 }, { key: "exampleQty", label: "Брой примери", type: "range", min: 4, max: 25, def: 4 }], paramsLine: s => `ниво ${s.level} · ${s.exampleQty} примера` };

  /* Сафари: 20 карти (10 двойки животни). Ниво 1 — всички открити, намери двойките; ниво 2 — обърнати; ниво 3 — обърнати и някои завъртени. Режим = време за 3 звезди. */
  const ANIMALS = ["лъв", "слон", "жираф", "зебра", "маймуна", "тигър", "хипопотам", "крокодил", "носорог", "папагал"];
  const MODES = { simple: ["Лек", 180], middle: ["Среден", 120], complex: ["Труден", 90], extreme: ["Много труден", 60] };
  class SafariGame extends CardGame {
    constructor(...a) { super(...a); this.level = Number(this.s.level) || 1; this.total = 10; this.limit = (MODES[this.s.mode] || MODES.simple)[1]; }
    get gameId() { return "safari"; } get skillName() { return "Памет: двойки"; }
    render() {
      this.scene("wt-sf", "scene-jungle"); this.shell.setLabel("Намери двойките");
      const cards = shuffle(ANIMALS.flatMap(a => [a, a])); this.open = []; this.left = 10;
      this.box.innerHTML = `<div class="sf-board">${cards.map((a, i) => `<button type="button" class="ms-card sf-card${this.level === 1 ? " open" : ""}${this.level === 3 && Math.random() < 0.5 ? " rot" : ""}" data-a="${a}"><span class="ms-face">${window.PIC(a, "animal")}</span><span class="ms-back"></span></button>`).join("")}</div><div class="az-hint">За 3 звезди: до ${this.limit} секунди.</div>`;
      this.box.querySelectorAll(".sf-card").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); this.tap(b); }));
      this.say("Намери всички двойки карти.");
    }
    startRound() { this.stepWrong = 0; this.roundStart = Date.now(); }
    tap(b) {
      if (this.finished || this.locked || b.classList.contains("done") || this.open.includes(b)) return;
      b.classList.add("open"); this.open.push(b); if (this.open.length < 2) return;
      const [x, y] = this.open; this.locked = true;
      if (x.dataset.a === y.dataset.a) { [x, y].forEach(c => c.classList.add("done", "good")); this.open = []; this.correct++; this.renderScore(); this.log.push(this.event(true, { text: x.dataset.a, answer: x.dataset.a, given: x.dataset.a, ok: true, ms: Date.now() - this.roundStart, adapt: 0 , first_attempt_correct: this.stepWrong === 0, attempt_count: this.stepWrong + 1 })); this.roundOk.push(true); this.idx++; this.renderProgress(); this.say(x.dataset.a); this.left--; this.locked = false; if (this.left <= 0) { const sec = Math.round((Date.now() - this.startedAt) / 1000); this.shell.flash(sec <= this.limit ? "Всички двойки! Браво!" : "Всички двойки, но бавно", sec <= this.limit ? "good" : "bad"); this.later(() => this.finish(), 1200); } }
      else { this.wrong++; this.log.push(this.event(false, { text: x.dataset.a, answer: x.dataset.a, given: y.dataset.a, ok: false, ms: 0, adapt: 0 , attempt: true })); [x, y].forEach(c => c.classList.add("bad")); this.later(() => { [x, y].forEach(c => { c.classList.remove("bad"); if (this.level > 1) c.classList.remove("open"); }); this.open = []; this.locked = false; }, this.level === 1 ? 300 : 700); }
    }
    finish(early) { if (this.finished && this.timerId === null) return; super.finish(early); }
  }
  window.GAMES.safari = { id: "safari", name: "Сафари", module: "theWorld", skill: "Памет", cls: SafariGame, task: s => ({ 1: "Намери всички двойки карти. Играта приключва, когато на полето няма останали карти.", 2: "Намери всички двойки карти, като ги обръщаш подред.", 3: "Намери всички двойки карти. Някои карти са завъртени." })[Number(s.level) || 1], tiers: () => [0, 0, 0], settings: [{ key: "level", label: "Ниво", type: "range", min: 1, max: 3, def: 1 }, { key: "mode", label: "Режим", type: "cycle", options: [["simple", "Лек"], ["middle", "Среден"], ["complex", "Труден"], ["extreme", "Много труден"]], def: "simple", help: "Режимът определя за колко секунди трябва да се намерят всички двойки, за да има 3 звезди." }], paramsLine: s => `ниво ${s.level} · режим ${(MODES[s.mode] || MODES.simple)[0].toLowerCase()}` };

  /* На училище: сред N предмета половината са ученически; влачи (или докосни и после раницата) ученическите в раницата. */
  class SchoolGame extends CardGame {
    constructor(...a) { super(...a); this.total = Number(this.s.exampleQty) || 5; this.n = Number(this.s.newItemQty) || 6; }
    get gameId() { return "soonToSchool"; } get skillName() { return "Ученически пособия"; }
    render() { this.scene("wt-sc"); this.shell.setLabel("Какво е за училище?"); }
    startRound() {
      this.stepWrong = 0; const k = Math.floor(this.n / 2); const school = shuffle(window.SCHOOL_ITEMS.slice()).slice(0, k), other = shuffle(window.NON_SCHOOL_ITEMS.slice()).slice(0, this.n - k);
      this.items = shuffle(school.map(n => ({ n, ok: true })).concat(other.map(n => ({ n, ok: false })))); this.left = k; this.sel = null;
      this.box.innerHTML = `<div class="sc-row"><div class="pcards" id="cards">${this.items.map((it, i) => `<button type="button" class="pcard sc-item" data-i="${i}" draggable="true">${window.PIC(it.n, it.ok ? "school" : "item")}</button>`).join("")}</div><button type="button" class="sc-bag" id="bag"><svg viewBox="0 0 100 100"><path d="M26 34 h48 a10 10 0 0 1 10 10 v40 a8 8 0 0 1 -8 8 H24 a8 8 0 0 1 -8 -8 V44 a10 10 0 0 1 10 -10z" fill="#4A6FE0"/><path d="M36 34 v-8 a14 14 0 0 1 28 0 v8" fill="none" stroke="#2F4DB0" stroke-width="6"/><rect x="34" y="56" width="32" height="24" rx="6" fill="#F5B70A"/></svg><b>Раница</b></button></div><div class="az-hint">Докосни ученическо пособие и после раницата, или го завлечи.</div>`;
      this.box.querySelectorAll(".sc-item").forEach(b => { b.addEventListener("pointerdown", e => { if (e.pointerType === "mouse" && e.button !== 0) return; this.pick(b); }); b.addEventListener("dragstart", e => { this.pick(b); e.dataTransfer.setData("text/plain", b.dataset.i); }); });
      const bag = this.box.querySelector("#bag"); bag.addEventListener("pointerdown", e => { e.preventDefault(); this.drop(); }); bag.addEventListener("dragover", e => e.preventDefault()); bag.addEventListener("drop", e => { e.preventDefault(); this.drop(); });
      this.say("Сложи в раницата само ученическите пособия.");
    }
    pick(b) { if (this.finished || this.locked || b.classList.contains("gone")) return; this.box.querySelectorAll(".sc-item").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); this.sel = b; }
    drop() {
      if (this.finished || this.locked || !this.sel) return; const b = this.sel, it = this.items[Number(b.dataset.i)]; this.sel = null; b.classList.remove("sel");
      if (it.ok) { b.classList.add("pop"); this.later(() => b.classList.add("gone"), 400); this.say(it.n); this.left--; if (this.left <= 0) this.done("ученически пособия", 1000); }
      else { this.miss("ученическо пособие", it.n); b.classList.add("bad"); this.shake(b); this.later(() => b.classList.remove("bad"), 900); this.shell.flash(`„${it.n}“ не е за училище`, "bad"); this.say(`${it.n} не е за училище`); this.later(() => this.shell.hideFlash(), 1300); }
    }
  }
  window.GAMES.soonToSchool = { id: "soonToSchool", name: "На училище", module: "theWorld", skill: "Ученически пособия", cls: SchoolGame, task: "Намери ученическите пособия сред общия брой предмети и ги сложи в раницата.", tiers: s => { const q = Number(s.exampleQty) || 5; return [0, Math.ceil(q * 0.3), Math.ceil(q * 0.5)]; }, settings: [{ key: "exampleQty", label: "Брой примери", type: "range", min: 5, max: 25, def: 5 }, { key: "newItemQty", label: "Брой предмети", type: "range", min: 6, max: 12, def: 6, help: "Колко предмета се показват наведнъж; половината са ученически." }], paramsLine: s => `${s.exampleQty} примера · по ${s.newItemQty} предмета` };
})();
