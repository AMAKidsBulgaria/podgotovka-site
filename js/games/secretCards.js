/* Тайни карти — маджонг с примери. По кода им (23.js) и на живо: карти с число, пример или картинка, подредени на пластове;
   взимат се само свободни („крайни“) карти — без карта отгоре и със свободна лява или дясна страна; покритите са сиви.
   Двойка: пример ↔ числото-отговор, картинка ↔ същата картинка. Играе се на време: цели 2:30 / 2:00 / 1:30. */
(function () {
  const IMGS = ["fish_orange", "fish_blue", "obj/apple", "obj/cherries", "obj/strawberry", "obj/lemon"];
  // Карти: [x, y, layer] в единици 1 = ширина на карта; координатите може да са дробни (полукарти)
  const MAPS = {
    1: [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0],[0,1,0],[1,1,0],[2,1,0],[3,1,0],[4,1,0],[0,2,0],[1,2,0],[2,2,0],[3,2,0],[4,2,0],[1.5,0.5,1],[2.5,0.5,1],[1.5,1.5,1],[2.5,1.5,1],[2,1,2]],
    2: [[2,0,0],[1,1,0],[2,1,0],[3,1,0],[0,2,0],[1,2,0],[2,2,0],[3,2,0],[4,2,0],[1,3,0],[2,3,0],[3,3,0],[2,4,0],[1.5,1.5,1],[2.5,1.5,1],[1.5,2.5,1],[2.5,2.5,1],[2,2,2]],
    3: [[0,0,0],[1,0,0],[3,0,0],[4,0,0],[0,1,0],[1,1,0],[2,1,0],[3,1,0],[4,1,0],[0,2,0],[1,2,0],[2,2,0],[3,2,0],[4,2,0],[0,3,0],[1,3,0],[3,3,0],[4,3,0],[0.5,0.5,1],[3.5,0.5,1],[0.5,2.5,1],[3.5,2.5,1],[2,1.5,1],[2,1.5,2]]
  };
  class SecretCardsGame extends BaseGame {
    get gameId() { return "secretCards"; }
    get skillName() { return `Примери и отговори до ${this.s.range}`; }
    render() {
      this.map = MAPS[Number(this.s.map || 1)] || MAPS[1]; this.range = Number(this.s.range || 5); this.pairsLeft = 0;
      const n = this.map.length, pairs = n / 2, imgPairs = Math.min(3, Math.floor(pairs * 0.3)), exPairs = pairs - imgPairs;
      const cards = [];
      for (let i = 0; i < exPairs; i++) { const add = this.s.op === "mix" ? Math.random() < .5 : this.s.op !== "sub"; let a, b; if (add) { a = rnd(this.range + 1); b = rnd(this.range - a + 1); } else { a = rnd(this.range + 1); b = rnd(a + 1); } const ans = add ? a + b : a - b; const key = "p" + i; cards.push({ kind: "ex", text: `${a} ${add ? "+" : "−"} ${b}`, key }, { kind: "num", text: String(ans), key }); }
      const imgs = shuffle(IMGS.slice()).slice(0, imgPairs); imgs.forEach((im, i) => { cards.push({ kind: "img", img: im, key: "i" + i }, { kind: "img", img: im, key: "i" + i }); });
      shuffle(cards); this.total = pairs; this.pairsLeft = pairs; this.matched = 0;
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-night"/></svg><div class="sc"><div class="sc-board" id="sc-board"></div></div>`;
      const board = this.shell.arena.querySelector("#sc-board");
      const maxX = Math.max(...this.map.map(m => m[0])) + 1, maxY = Math.max(...this.map.map(m => m[1])) + 1; board.style.setProperty("--cols", maxX); board.style.setProperty("--rows", maxY);
      this.cards = this.map.map((m, i) => { const c = cards[i]; const el = document.createElement("button"); el.type = "button"; el.className = "sc-card"; el.style.setProperty("--x", m[0]); el.style.setProperty("--y", m[1]); el.style.setProperty("--l", m[2]); el.dataset.key = c.key; el.innerHTML = c.kind === "img" ? `<img src="assets/img/${c.img}.png" alt="" draggable="false">` : `<span>${c.text}</span>`; el.addEventListener("pointerdown", e => { e.preventDefault(); this.pick(el); }); board.appendChild(el); return { el, x: m[0], y: m[1], l: m[2], c, alive: true }; });
      this.refreshFree(); this.sel = null;
      this.renderProgress = () => { const p = this.shell.progress; p.innerHTML = ""; for (let i = 0; i < this.total; i++) { const li = document.createElement("li"); li.className = i < this.matched ? "ok" : ""; p.appendChild(li); } };
    }
    startRound() { this.shell.setLabel("Събери двойките"); if (this.idx === 0) this.say("Събери картите по двойки. Взимат се само крайните карти."); }
    isFree(k) {
      if (!k.alive) return false;
      const covered = this.cards.some(o => o.alive && o.l === k.l + 1 && Math.abs(o.x - k.x) < 1 && Math.abs(o.y - k.y) < 1);
      if (covered) return false;
      const left = this.cards.some(o => o.alive && o !== k && o.l === k.l && Math.abs(o.y - k.y) < 1 && o.x < k.x && k.x - o.x < 1.01);
      const right = this.cards.some(o => o.alive && o !== k && o.l === k.l && Math.abs(o.y - k.y) < 1 && o.x > k.x && o.x - k.x < 1.01);
      return !(left && right);
    }
    refreshFree() { this.cards.forEach(k => k.el.classList.toggle("blocked", !this.isFree(k))); }
    pick(el) {
      if (this.finished) return;
      const k = this.cards.find(c => c.el === el); if (!k || !k.alive || !this.isFree(k)) { el.classList.add("shake-s"); setTimeout(() => el.classList.remove("shake-s"), 400); return; }
      if (!this.sel) { this.sel = k; el.classList.add("sel"); this.say(k.c.kind === "img" ? "Намери същата" : k.c.text.replace("+", "плюс").replace("−", "минус")); return; }
      if (this.sel === k) { el.classList.remove("sel"); this.sel = null; return; }
      const ok = this.sel.c.key === k.c.key && this.sel.c.kind !== k.c.kind || (this.sel.c.kind === "img" && k.c.kind === "img" && this.sel.c.key === k.c.key);
      this.locked = false;
      if (!this.answer(ok, { text: `${this.sel.c.text || this.sel.c.img} ~ ${k.c.text || k.c.img}`, answer: this.sel.c.key, given: k.c.key })) return;
      this.locked = false;
      if (ok) { this.sel.alive = false; k.alive = false; this.sel.el.classList.add("gone"); k.el.classList.add("gone"); this.sel.el.classList.remove("sel"); this.sel = null; this.matched++; this.idx = this.matched; this.renderProgress(); this.refreshFree(); this.say("Да!"); if (this.matched === this.total) { this.shell.flash("Всички двойки са събрани!", "good"); this.say("Браво!"); setTimeout(() => this.finish(false), 1200); } }
      else { const a = this.sel; a.el.classList.remove("sel"); a.el.classList.add("wrong"); k.el.classList.add("wrong"); setTimeout(() => { a.el.classList.remove("wrong"); k.el.classList.remove("wrong"); }, 600); this.sel = null; this.shell.flash("Не са двойка", "bad"); this.say("Не са двойка"); setTimeout(() => this.shell.hideFlash(), 1100); }
    }
    finish(early) {
      // звездите са по време, както при тях: 3 до 1:30, 2 до 2:00, 1 до 2:30
      const seconds = Math.round((Date.now() - this.startedAt) / 1000);
      super.finish(early);
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.secretCards = {
    id: "secretCards", name: "Тайни карти", skill: "Памет и смятане", top: "trees", cls: SecretCardsGame, tiers: [0, 1, 2],
    task: "Събери картите по двойки според тяхното значение. Можеш да събираш само крайни карти.",
    settings: [
      { key: "map", label: "Карта", type: "range", min: 1, max: 3, def: 1, help: "Подредба на картите: 1 е най-малка." },
      { key: "range", label: "Диапазон на смятане", type: "range", min: 5, max: 20, def: 5 },
      { key: "op", label: "Избор на действие", type: "cycle", options: [["add", "Събиране"], ["sub", "Изваждане"], ["mix", "Смесено"]], def: "add" }
    ],
    paramsLine: s => `карта ${s.map} · до ${s.range} · ${({ add: "събиране", sub: "изваждане", mix: "смесено" })[s.op]}`
  };
})();
