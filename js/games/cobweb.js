/* Улов — три механики според нивото (както в досегашната платформа):
   Ниво 1: полета с картинки и число; избери полето, в което броят съвпада с числото.
   Ниво 2: свържи всяка група картинки с правилното число (докосни група, после число).
   Ниво 3: подреди групите по брой във възходящ (Напред) или низходящ (Назад) ред.
   Полета в реда 2..4, брой примери 4..10, норми за грешки 1 / 3 / 6. */
(function () {
  const OBJS = ["obj/apple", "obj/banana", "obj/carrot", "obj/cherries", "obj/cookie", "obj/cupcake", "obj/donut-sprinkles", "obj/ice-cream-cne", "obj/strawberry", "obj/watermelon", "obj/pear", "obj/pumpkin", "obj/lemon", "obj/orange", "obj/mushroom", "obj/pineapple", "obj/grapes", "obj/coconut", "obj/corn", "obj/tomato", "fish_orange", "fish_blue", "fish_red", "fish_green", "fish_pink", "fish_brown"];
  const MAX = 10; // числата в играта са до 10 (както при тях)
  // адаптивност: -1 → числа до 6, 0 → до 10, +1 → до 10, но по-близки количества (по-трудно различаване)
  const pics = (name, count) => { const cols = count <= 4 ? 2 : count <= 6 ? 3 : 4; return `<span class="pics" style="--cols:${cols}">${Array.from({ length: count }, () => `<img src="assets/img/${name}.png" alt="" draggable="false">`).join("")}</span>`; };
  // различни количества за всички групи в реда
  function distinctCounts(n, adapt) {
    const max = adapt < 0 ? 6 : MAX; const set = new Set();
    if (adapt > 0) { const start = 1 + rnd(max - n); for (let i = 0; i < n; i++) set.add(start + i); } // съседни числа: 4,5,6
    else while (set.size < n) set.add(1 + rnd(max));
    return shuffle([...set]);
  }

  class CobwebGame extends BaseGame {
    get gameId() { return "cobweb"; }
    get skillName() { return ({ 1: "Число и количество до 10", 2: "Свързване на число с количество", 3: "Подреждане по брой" })[Number(this.s.level)] || "Число и количество"; }
    render() {
      this.level = Number(this.s.level || 1); this.n = Number(this.s.fields || 3); this.asc = (this.s.dir || "fwd") === "fwd";
      this.shell.arena.innerHTML = `<svg class="sea" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><use href="#scene-underwater"/></svg><div class="fields" id="fields"></div><div class="numrow" id="numrow"></div>`;
      this.box = this.shell.arena.querySelector("#fields"); this.numrow = this.shell.arena.querySelector("#numrow");
      this.box.style.setProperty("--n", this.n); this.numrow.style.setProperty("--n", this.n);
    }
    startRound() {
      this.numrow.innerHTML = ""; this.numrow.className = "numrow"; this.box.innerHTML = "";
      const names = shuffle(OBJS.slice()).slice(0, this.n), counts = distinctCounts(this.n, this.adapt);
      if (this.level === 1) this.roundMatch(names, counts);
      else if (this.level === 2) this.roundConnect(names, counts);
      else this.roundOrder(names, counts);
    }
    // Показва на детето откъде идва числото: осветява картинките една по една и ги брои на глас.
    countAloud(fieldEl, count, then) {
      const imgs = [...fieldEl.querySelectorAll("img")]; let i = 0;
      const step = () => { if (i >= imgs.length) { this.say(`Общо ${count}`); then && then(); return; } imgs[i].classList.add("counted"); this.say(String(i + 1)); i++; setTimeout(step, 550); };
      step();
    }
    field(name, count, extra = "") {
      const b = document.createElement("button"); b.type = "button"; b.className = "field";
      b.innerHTML = pics(name, count) + extra; b.dataset.count = count;
      b.setAttribute("aria-label", `${count} картинки`);
      return b;
    }
    // ---- ниво 1 ----
    roundMatch(names, counts) {
      this.shell.setLabel("Къде числото е вярно?"); this.say("Къде числото е вярно?");
      const okIdx = rnd(this.n);
      const nums = counts.map((c, i) => { if (i === okIdx) return c; let v; do { v = 1 + rnd(MAX); } while (v === c); return v; });
      this.current = { text: `${counts[okIdx]} = ${counts[okIdx]} картинки`, answer: counts[okIdx] };
      counts.forEach((c, i) => {
        const b = this.field(names[i], c, `<b class="num">${nums[i]}</b>`);
        b.addEventListener("pointerdown", e => {
          e.preventDefault();
          const ok = i === okIdx;
          if (!this.answer(ok, { text: this.current.text, answer: this.current.answer, given: `${c}→${nums[i]}` })) return;
          [...this.box.children].forEach(f => f.disabled = true);
          if (ok) { b.classList.add("right"); this.shell.flash("Точно така!", "good"); this.say("Точно така!"); this.advance(800); }
          else { b.classList.add("wrong"); this.shell.flash(`Да преброим: тук са ${c}, а числото е ${nums[i]}`, "bad"); this.countAloud(b, c, () => { this.box.children[okIdx].classList.add("right"); this.advance(900); }); }
        });
        this.box.appendChild(b);
      });
    }
    // ---- ниво 2 ----
    roundConnect(names, counts) {
      this.shell.setLabel("Свържи картинките с числото"); this.say("Свържи картинките с числото");
      this.current = { text: counts.join(" · "), answer: counts.join(",") };
      let picked = null, done = 0, wrongInRound = 0;
      counts.forEach((c, i) => {
        const b = this.field(names[i], c);
        b.addEventListener("pointerdown", e => { e.preventDefault(); if (b.disabled) return; [...this.box.children].forEach(f => f.classList.remove("picked")); picked = b; b.classList.add("picked"); });
        this.box.appendChild(b);
      });
      shuffle(counts.slice()).forEach(v => {
        const t = document.createElement("button"); t.type = "button"; t.className = "numtile"; t.textContent = v;
        t.addEventListener("pointerdown", e => {
          e.preventDefault(); if (t.disabled || !picked) return;
          if (Number(picked.dataset.count) === v) {
            picked.disabled = true; picked.classList.remove("picked"); picked.classList.add("right"); t.disabled = true; t.classList.add("right");
            const pp = picked; setTimeout(() => { pp.classList.add("gone"); t.classList.add("gone"); setTimeout(() => { t.hidden = true; }, 380); }, 350);
            picked = null; done++;
            if (done === this.n) {
              const ok = wrongInRound === 0;
              this.answer(ok, { text: this.current.text, answer: this.current.answer, given: ok ? this.current.answer : "с грешки" });
              this.shell.flash(ok ? "Всички са свързани!" : "Готово, но с грешка", ok ? "good" : "bad"); this.advance(900);
            }
          } else {
            wrongInRound++; t.classList.add("wrong"); picked.classList.add("wrong"); this.shell.flash(`Да преброим: тук са ${picked.dataset.count}`, "bad");
            const p = picked; this.countAloud(p, Number(p.dataset.count), () => { t.classList.remove("wrong"); p.classList.remove("wrong"); p.querySelectorAll("img.counted").forEach(im => im.classList.remove("counted")); this.shell.hideFlash(); });
            // грешка в средата на задачата: брои се към сърцата веднага
            if (this.tier === 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: `${p.dataset.count}→${v}` }); return; }
            this.livesLeft--; this.renderLives(); if (this.livesLeft < 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: `${p.dataset.count}→${v}` }); }
          }
        });
        this.numrow.appendChild(t);
      });
    }
    // ---- ниво 3 ----
    roundOrder(names, counts) {
      this.shell.setLabel(this.asc ? "От най-малко към най-много" : "От най-много към най-малко"); this.say(this.asc ? "Подреди от най-малко към най-много" : "Подреди от най-много към най-малко");
      const sorted = counts.slice().sort((a, b) => this.asc ? a - b : b - a);
      this.current = { text: sorted.join(this.asc ? " < " : " > "), answer: sorted.join(",") };
      let step = 0, wrongInRound = 0;
      this.numrow.classList.add("seqrow");
      for (let k = 0; k < this.n; k++) { const slot = document.createElement("span"); slot.className = "seqslot"; this.numrow.appendChild(slot); }
      counts.forEach((c, i) => {
        const b = this.field(names[i], c, `<b class="order"></b>`);
        b.addEventListener("pointerdown", e => {
          e.preventDefault(); if (b.disabled) return;
          if (c === sorted[step]) {
            const slot = this.numrow.children[step];
            step++; b.disabled = true; b.classList.add("right"); b.querySelector(".order").textContent = step;
            // оставяме празно място горе и преместваме картата долу в реда
            const ghost = document.createElement("span"); ghost.className = "field empty"; b.replaceWith(ghost); slot.appendChild(b);
            if (step === this.n) {
              const ok = wrongInRound === 0;
              this.answer(ok, { text: this.current.text, answer: this.current.answer, given: ok ? this.current.answer : "с грешки" });
              this.shell.flash(ok ? "Подредено!" : "Готово, но с грешка", ok ? "good" : "bad"); this.advance(900);
            }
          } else {
            wrongInRound++; b.classList.add("wrong"); this.shell.flash(`Първо ${sorted[step]}`, "bad");
            setTimeout(() => { b.classList.remove("wrong"); this.shell.hideFlash(); }, 700);
            if (this.tier === 0) { this.answer(false, { text: this.current.text, answer: this.current.answer, given: String(c) }); return; }
            this.livesLeft--; this.renderLives(); if (this.livesLeft < 0) this.answer(false, { text: this.current.text, answer: this.current.answer, given: String(c) });
          }
        });
        this.box.appendChild(b);
      });
    }
  }
  window.GAMES = window.GAMES || {};
  window.GAMES.cobweb = {
    id: "cobweb", name: "Улов", skill: "Число и количество", top: "jungle", cls: CobwebGame,
    tiers: [1, 3, 6],
    task: s => ({ 1: "Избери квадрата, в който числото отговаря на броя на картинките.", 2: "Свържи всяка група картинки с правилното число.", 3: "Подреди групите по брой във възходящ или низходящ ред." })[Number(s.level)] || "",
    settings: [
      { key: "level", label: "Ниво", type: "range", min: 1, max: 3, def: 1, help: "Ниво 1: намери вярното число. Ниво 2: свържи картинки с числа. Ниво 3: подреди по брой." },
      { key: "fields", label: "Полета в реда", type: "range", min: 2, max: 4, def: 3, help: "Колко групи вижда детето наведнъж." },
      { key: "dir", label: "Посока", type: "cycle", options: [["fwd", "Напред"], ["back", "Назад"]], def: "fwd", help: "Само за ниво 3: Напред е от най-малко към най-много, Назад е обратното." },
      { key: "examples", label: "Брой примери", type: "range", min: 4, max: 10, def: 4 }
    ],
    paramsLine: s => `${s.examples} примера · ${s.fields} полета` + (Number(s.level) === 3 ? ` · ${s.dir === "back" ? "назад" : "напред"}` : "")
  };
})();
