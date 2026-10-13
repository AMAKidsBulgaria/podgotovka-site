/* Пиратски шифър — по кода им (27.js): Ниво 1..2, Размер на полето 3x3/4x4/5x5, Брой примери 4..10.
   На полето има начални риби (3x3: 2–3, 4x4: 3–4, 5x5: 4–6). Задачата: [риба] [над/под/вляво/вдясно] [риба на полето].
   Ниво 1: над/под; Ниво 2: и вляво/вдясно. Проверено на живо: рибата се влачи от страничния панел върху клетката;
   при вярно остава на полето и идва следваща задача. */
(function () {
  const FISH = ["fish_orange", "fish_blue", "fish_red", "fish_green", "fish_pink", "fish_brown", "obj/apple", "obj/banana", "obj/cherries", "obj/strawberry", "obj/lemon", "obj/pear", "obj/mushroom", "obj/pumpkin", "obj/orange", "obj/grapes"];
  const INIT = { 3: [2, 3], 4: [3, 4], 5: [4, 6] };
  const DIRS = { "над": [0, -1], "под": [0, 1], "наляво от": [-1, 0], "надясно от": [1, 0] };
  class PirateCipherGame extends BaseGame {
    get gameId() { return "pirateCipher"; }
    get skillName() { return "Ориентиране: над, под, вляво, вдясно"; }
    render() {
      this.level = Number(this.s.level || 1); this.n = Number((this.s.field || "3x3")[0]);
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-chartroom"/></svg>
        <div class="pc"><div class="pc-task" id="pc-task"></div><div class="pc-mid"><div class="pc-palette" id="pal-l"></div><div class="pc-grid" id="pc-grid" style="--n:${this.n}"></div><div class="pc-palette" id="pal-r"></div></div></div>`;
      this.grid = this.shell.arena.querySelector("#pc-grid"); this.taskEl = this.shell.arena.querySelector("#pc-task");
      const pl = this.shell.arena.querySelector("#pal-l"), pr = this.shell.arena.querySelector("#pal-r");
      FISH.forEach((f, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "pc-bubble"; b.dataset.f = f; b.innerHTML = `<img src="assets/img/${f}.png" alt="" draggable="false">`; b.addEventListener("pointerdown", e => this.dragStart(e, b)); (i < 8 ? pl : pr).appendChild(b); });
      this.cells = [];
      for (let i = 0; i < this.n * this.n; i++) { const c = document.createElement("div"); c.className = "pc-cell"; c.dataset.i = i; this.grid.appendChild(c); this.cells.push(c); }
    }
    startRound() {
      this.cells.forEach(c => { c.innerHTML = ""; c.className = "pc-cell"; c.dataset.f = ""; });
      const n = this.n, [mn, mx] = INIT[n], count = mn + rnd(mx - mn + 1);
      const used = new Set(), fishes = shuffle(FISH.slice());
      while (used.size < count) used.add(rnd(n * n));
      [...used].forEach((idx, k) => { this.cells[idx].dataset.f = fishes[k]; this.cells[idx].innerHTML = `<img src="assets/img/${fishes[k]}.png" alt="" draggable="false">`; });
      // избираме референтна риба и посока, така че целевата клетка да е в полето и празна
      const dirs = this.level === 1 ? ["над", "под"] : Object.keys(DIRS);
      let tries = 0, ref, dir, target;
      do { ref = [...used][rnd(used.size)]; dir = dirs[rnd(dirs.length)]; const [dx, dy] = DIRS[dir]; const x = ref % n + dx, y = Math.floor(ref / n) + dy; target = (x < 0 || y < 0 || x >= n || y >= n) ? -1 : y * n + x; tries++; } while ((target < 0 || used.has(target)) && tries < 200);
      const place = fishes[count]; this.target = target; this.place = place; this.refFish = this.cells[ref].dataset.f;
      this.current = { text: `${place} ${dir} ${this.refFish}`, answer: String(target) };
      this.taskEl.innerHTML = `<img src="assets/img/${place}.png" alt="" draggable="false"><b>${dir}</b><img src="assets/img/${this.refFish}.png" alt="" draggable="false">`;
      this.shell.setLabel(`Сложи ${dir}`); this.say(`Сложи рибата ${dir} другата`);
    }
    dragStart(e, btn) {
      if (this.locked) return; e.preventDefault();
      const ghost = document.createElement("img"); ghost.src = btn.querySelector("img").src; ghost.className = "pc-ghost"; document.body.appendChild(ghost);
      const move = ev => { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; };
      move(e);
      const up = ev => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); ghost.remove(); const el = document.elementFromPoint(ev.clientX, ev.clientY); const cell = el && el.closest(".pc-cell"); if (cell) this.drop(btn.dataset.f, cell); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    }
    drop(f, cell) {
      if (this.locked || cell.dataset.f) return;
      const ok = f === this.place && Number(cell.dataset.i) === this.target;
      if (f !== this.place) { cell.classList.add("wrong"); this.shell.flash("Не тази риба", "bad"); this.say("Не тази риба"); setTimeout(() => { cell.classList.remove("wrong"); this.shell.hideFlash(); }, 800); this.miss(cell); return; }
      if (!ok) { cell.classList.add("wrong"); this.shell.flash("Не тук", "bad"); this.say("Не тук"); setTimeout(() => { cell.classList.remove("wrong"); this.shell.hideFlash(); }, 800); this.miss(cell); return; }
      if (!this.answer(true, { text: this.current.text, answer: this.current.answer, given: cell.dataset.i })) return;
      cell.dataset.f = f; cell.innerHTML = `<img src="assets/img/${f}.png" alt="" draggable="false">`; cell.classList.add("right");
      this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.advance(1400);
    }
    miss(cell) {
      // грешен опит: брои се като грешка, но задачата остава, за да я довърши
      if (this.tier === 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: cell.dataset.i }); return; }
      this.livesLeft--; this.renderLives(); this.wrong++; this.streak = 0;
      if (this.livesLeft < 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: cell.dataset.i }); return; }
      this.cells[this.target].classList.add("hint");
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.pirateCipher = {
    id: "pirateCipher", name: "Пиратски шифър", skill: "Ориентиране в поле", top: "deadtree", cls: PirateCipherGame, tiers: [0, 1, 2],
    task: "Подреди предметите на игралното поле според задачата: завлечи рибата на вярното място.",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 2, def: 1, help: "Ниво 1: над и под. Ниво 2: и вляво, вдясно." },
      { key: "field", label: "Размер на полето", type: "cycle", options: [["3x3", "3x3"], ["4x4", "4x4"], ["5x5", "5x5"]], def: "3x3" },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `${s.examples} примера · поле ${s.field}`
  };
})();
