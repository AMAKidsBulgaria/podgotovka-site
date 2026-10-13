/* Обвивка: екрани, карта с острови, настройки по схема, игра, резултат, прогрес. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CHILD = { name: "Мила" };
  const STORE_KEY = "platforma.sessions.v1";
  const G = window.GAMES || {};
  let current = null;      // текущата игра (описание от регистъра)
  let settings = {};       // настройки на текущата игра
  let game = null;         // инстанция по време на игра

  // Редът и върховете на островите в Математика (12 игри; наличните са в GAMES)
  const MATH_ORDER = [
    ["brightNumbers", "Ярки числа", "crystal"], ["numberComposition", "Състав на числата", "palm"], ["order", "Последователност", "volcano"], ["cobweb", "Улов", "jungle"],
    ["pirateCipher", "Пиратски шифър", "deadtree"], ["brainCrush", "Главоблъсканица", "waterfall"], ["shadowMap", "Карта на диаманти", "bluecrystal"], ["brainstorm", "Мозъчна атака", "slime"],
    ["underwaterKingdom", "Подводно царство", "gold"], ["intellectScales", "Умни везни", "pink"], ["secretCards", "Тайни карти", "trees"], ["piratesTreasures", "Пиратско съкровище", "chest"]
  ];
  // Ред на къщичките в Букварика (6 игри)
  const BUK_ORDER = [
    ["alphabet", "Азбука", 1], ["letterOfElements", "Елементи на букви", 2], ["phonemicHearing", "Фонематичен слух", 3],
    ["phonetics", "Фонетика", 4], ["soundLetterParsing", "Звуково-буквен анализ", 5], ["readca", "Читалка", 6]
  ];
  // Планети на Читарика и палатки на Околен свят
  const READ_ORDER = [
    ["constructor", "Конструктор", "#E9573F", "#B23A2A"], ["order", "Словоред", "#F2A65A", "#C77A2C"], ["accents", "Ударения", "#8E5BD9", "#5E3AA6"], ["guessWord", "Познай думата", "#3FBF8F", "#2A8F68"], ["trueWords", "Правилни думи", "#4A6FE0", "#2F4DB0"],
    ["buildSentence", "Построй изречение", "#F26D8F", "#C04468"], ["conformity", "Съответствие", "#5CD0D6", "#2E9AA0"], ["readcaR", "Читалка", "#C9CCD6", "#8E93A3"], ["words", "Думи", "#F2C838", "#C79A12"], ["sayDifferently", "Кажи друго", "#9CB74A", "#6B8F2E"]
  ];
  const WORLD_ORDER = [
    ["professions", "Професии", "#E9573F", "#B23A2A"], ["outwardThings", "Обкръжалка", "#4A6FE0", "#2F4DB0"], ["masksShow", "Шоу с маски", "#8E5BD9", "#5E3AA6"], ["cleanShipRoom", "Чиста каюта", "#3FBF8F", "#2A8F68"], ["forestKingdom", "Горско царство", "#2E8F3B", "#1F6B2A"],
    ["timeGuardian", "Страж на времето", "#F2A65A", "#C77A2C"], ["safari", "Сафари", "#F2C838", "#C79A12"], ["soonToSchool", "На училище", "#F26D8F", "#C04468"], ["hideAndSeek", "Криеница", "#5CD0D6", "#2E9AA0"], ["memoryStick", "Запоминалка", "#9CB74A", "#6B8F2E"]
  ];
  const TOPS = {
    crystal: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#B07AF0"/><polygon points="58,80 68,34 80,80" fill="#8C5BE0"/><polygon points="78,80 92,22 106,80" fill="#B48CF2"/><polygon points="100,82 112,46 122,82" fill="#7A4FD0"/><polygon points="80,80 92,22 96,60" fill="#D7C2FA" opacity=".7"/>`,
    palm: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#E9A34F"/><rect x="76" y="40" width="7" height="44" fill="#8B4A1E"/><g fill="#4FB04A"><ellipse cx="62" cy="40" rx="24" ry="8" transform="rotate(-25 62 40)"/><ellipse cx="98" cy="40" rx="24" ry="8" transform="rotate(25 98 40)"/><ellipse cx="80" cy="32" rx="8" ry="22"/></g><circle cx="56" cy="78" r="7" fill="#F2C14E"/><circle cx="102" cy="76" r="6" fill="#F2C14E"/>`,
    volcano: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#5C4A4A"/><polygon points="44,82 72,30 90,30 118,82" fill="#5C4A4A"/><polygon points="72,30 90,30 84,44 78,44" fill="#FF7A2F"/><path d="M78 44 q-6 20 2 38 M84 44 q10 18 4 38" stroke="#FF7A2F" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="24" r="8" fill="#9A8C8C" opacity=".8"/><circle cx="100" cy="18" r="6" fill="#9A8C8C" opacity=".7"/>`,
    jungle: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#6DB553"/><rect x="60" y="46" width="6" height="36" fill="#8B4A1E"/><rect x="96" y="52" width="6" height="30" fill="#8B4A1E"/><g fill="#2E8F3B"><ellipse cx="63" cy="44" rx="20" ry="8"/><ellipse cx="99" cy="50" rx="18" ry="7"/></g><ellipse cx="80" cy="80" rx="14" ry="5" fill="#4FC3D9"/>`,
    deadtree: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#B08A5A"/><path d="M80 84 v-40 M80 60 l-16 -18 M80 52 l14 -16 M64 42 l-8 -6 M94 36 l8 -8" stroke="#6B3E1E" stroke-width="6" fill="none" stroke-linecap="round"/><polygon points="52,86 58,70 64,86" fill="#8D6A44"/>`,
    waterfall: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#6DB553"/><polygon points="56,82 80,30 104,82" fill="#8FA7B8"/><polygon points="72,48 80,30 88,48" fill="#E8F1F7"/><path d="M92 62 q4 14 0 26" stroke="#8FD3F0" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="#2E8F3B"><polygon points="44,84 52,64 60,84"/><polygon points="102,84 110,66 118,84"/></g>`,
    bluecrystal: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#C8965A"/><polygon points="62,82 74,40 86,82" fill="#5FC8F0"/><polygon points="82,82 96,28 110,82" fill="#8EDBF7"/><polygon points="48,84 56,60 64,84" fill="#5FC8F0"/><polygon points="82,82 96,28 100,60" fill="#DDF3FF" opacity=".7"/>`,
    slime: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#7B6E8C"/><path d="M50 84 q30 -30 60 0 z" fill="#9CE86A"/><path d="M62 74 l-10 -30 l14 22 M98 74 l10 -30 l-14 22 M80 66 l0 -34 l6 30" stroke="#5E5470" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="72" cy="78" r="4" fill="#5FD64A"/><circle cx="90" cy="80" r="3" fill="#5FD64A"/>`,
    gold: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#F2C14E"/><polygon points="52,82 80,30 108,82" fill="#F5CE5C"/><polygon points="80,30 108,82 80,82" fill="#D9A63A"/><rect x="72" y="60" width="16" height="22" fill="#B9860A"/><g fill="#4FB04A"><ellipse cx="60" cy="40" rx="12" ry="5" transform="rotate(-25 60 40)"/></g><rect x="58" y="40" width="4" height="30" fill="#8B4A1E"/>`,
    pink: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#E86AA6"/><polygon points="54,82 70,32 86,82" fill="#F08BBD"/><polygon points="82,82 96,40 110,82" fill="#D94A93"/><polygon points="70,32 86,82 76,70" fill="#FBC4E0" opacity=".8"/><g fill="#F26D8F"><circle cx="112" cy="72" r="6"/><circle cx="50" cy="74" r="5"/></g>`,
    trees: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#6DB553"/><rect x="66" y="52" width="6" height="30" fill="#8B4A1E"/><rect x="92" y="56" width="6" height="26" fill="#8B4A1E"/><circle cx="69" cy="46" r="14" fill="#2E8F3B"/><circle cx="95" cy="52" r="11" fill="#4FB04A"/><rect x="74" y="70" width="18" height="12" fill="#F2C14E"/><rect x="74" y="66" width="18" height="6" fill="#D9A63A"/>`,
    chest: `<ellipse cx="80" cy="82" rx="46" ry="12" fill="#6FB79E"/><rect x="62" y="56" width="36" height="26" rx="4" fill="#8B4A1E"/><rect x="62" y="50" width="36" height="10" rx="5" fill="#A65A26"/><rect x="76" y="58" width="8" height="8" fill="#F2C14E"/><g fill="#F5D76E"><circle cx="70" cy="48" r="4"/><circle cx="84" cy="44" r="4"/><circle cx="92" cy="49" r="3"/></g><g fill="#2E8F3B"><polygon points="46,84 54,62 62,84"/><polygon points="102,84 108,68 116,84"/></g>`
  };
  const islandSvg = top => `<svg class="island-art" viewBox="0 0 160 150" aria-hidden="true"><use href="#isl-base" width="160" height="150"/><g transform="translate(80 84) scale(1.35) translate(-80 -84)">${TOPS[top] || TOPS.palm}</g><path d="M30 80 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/></svg>`;

  // ---------- навигация ----------
  function show(id) {
    $$(".screen").forEach(s => s.hidden = s.id !== `screen-${id}`);
    window.scrollTo(0, 0);
    if (id === "map") renderMap();
    if (id === "bmap") renderVillage();
    if (id === "rmap") renderNodes("#planets", READ_ORDER, "planet", "planet-art", "--p1", "--p2");
    if (id === "wmap") renderNodes("#booths", WORLD_ORDER, "booth", "booth-art", "--b1", "--b2");
    if (id === "intro") renderIntro();
    if (id === "settings") renderSettings();
    if (id === "parent") renderParent();
    if (id !== "game" && game) { game.destroy(); game = null; }
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (!b) return; let go = b.dataset.go; if (go === "map" && current && current.module) go = ({ bukvarica: "bmap", readica: "rmap", theWorld: "wmap" })[current.module] || "map"; show(go); });

  // ---------- данни ----------
  const sessions = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; } };
  const saveSession = r => { const all = sessions(); all.unshift(r); localStorage.setItem(STORE_KEY, JSON.stringify(all.slice(0, 200))); };
  const setKey = id => `platforma.settings.${id}`;
  function loadSettings(def) {
    const base = {}; def.settings.forEach(c => base[c.key] = String(c.def));
    return Object.assign(base, JSON.parse(localStorage.getItem(setKey(def.id)) || "{}"));
  }
  function selectGame(id) {
    current = G[id]; settings = loadSettings(current);
    // Фонът на настройки/инструкция/игра следва модула: пиратски за Математика, селце за Букварика.
    $$("use.bg-theme").forEach(u => { if (!u.dataset.def) u.dataset.def = u.getAttribute("href"); u.setAttribute("href", ({ bukvarica: u.dataset.buk, readica: u.dataset.read, theWorld: u.dataset.world })[current.module] || u.dataset.def); });
  }

  // ---------- модули ----------
  $$(".module-card").forEach(c => c.addEventListener("click", () => { if (c.dataset.module === "mathematics") show("map"); else if (c.dataset.module === "bukvarica") show("bmap"); else if (c.dataset.module === "readica") show("rmap"); else if (c.dataset.module === "theWorld") show("wmap"); }));
  $("#btn-homework").addEventListener("click", () => { const b = $("#btn-homework"); b.textContent = "Домашна работа: следващ етап"; setTimeout(() => b.textContent = "Домашна работа", 1800); });

  // ---------- карта с острови ----------
  function renderMap() {
    const box = $("#islands"); box.innerHTML = "";
    const done = new Set(sessions().filter(s => !s.early).map(s => s.gameId));
    MATH_ORDER.forEach(([id, name, top]) => {
      const b = document.createElement("button");
      b.className = "island" + (done.has(id) ? " done" : ""); b.setAttribute("role", "listitem");
      const available = !!G[id];
      if (!available) b.disabled = true;
      b.innerHTML = `${islandSvg(top)}<span class="done-mark" aria-label="Изиграна"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#fff"/></svg></span><span class="island-label">${name}</span>`;
      if (available) b.addEventListener("click", () => { selectGame(id); show("settings"); });
      box.appendChild(b);
    });
  }

  // ---------- селце на Букварика ----------
  function renderVillage() {
    const box = $("#houses"); box.innerHTML = "";
    const done = new Set(sessions().filter(s => !s.early).map(s => s.gameId));
    BUK_ORDER.forEach(([id, name, art]) => {
      const b = document.createElement("button");
      b.className = "house" + (done.has(id) ? " done" : ""); b.setAttribute("role", "listitem");
      const available = !!G[id];
      if (!available) b.disabled = true;
      b.innerHTML = `<svg class="house-art" viewBox="0 0 200 200" aria-hidden="true"><use href="#house-${art}"/></svg><span class="done-mark" aria-label="Изиграна"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#fff"/></svg></span><span class="house-label">${name}</span>`;
      if (available) b.addEventListener("click", () => { selectGame(id); show("settings"); });
      box.appendChild(b);
    });
  }

  // ---------- планети / палатки (общ рендер на възли на карта) ----------
  function renderNodes(sel, order, cls, artCls, v1, v2) {
    const box = $(sel); box.innerHTML = "";
    const done = new Set(sessions().filter(s => !s.early).map(s => s.gameId));
    order.forEach(([id, name, c1, c2]) => {
      const b = document.createElement("button");
      b.className = `${cls}${done.has(id) ? " done" : ""}`; b.setAttribute("role", "listitem"); b.style.setProperty(v1, c1); b.style.setProperty(v2, c2);
      const available = !!G[id]; if (!available) b.disabled = true;
      b.innerHTML = `<svg class="${artCls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#${cls}"/></svg><span class="done-mark" aria-label="Изиграна"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="#fff"/></svg></span><span class="node-label">${name}</span>`;
      if (available) b.addEventListener("click", () => { selectGame(id); show("settings"); });
      box.appendChild(b);
    });
  }

  // ---------- настройки по схема ----------
  const cardsBox = $("#cards"), infoPanel = $("#info-panel");
  function renderSettings() {
    $("#settings-title").textContent = current.name;
    cardsBox.innerHTML = ""; infoPanel.innerHTML = ""; infoPanel.hidden = true;
    current.settings.forEach(c => {
      const v = settings[c.key];
      let el;
      if (c.type === "range") {
        el = document.createElement("label"); el.className = "card";
        el.innerHTML = `<span class="card-title">${c.label}</span><span class="card-value-row"><output class="card-value" id="out-${c.key}">${v}</output>${c.unit ? `<span class="unit">${c.unit}</span>` : ""}</span><input type="range" name="${c.key}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${v}" aria-label="${c.label}"><span class="range-ends"><i>${c.min}</i><i>${c.max}</i></span>`;
        el.querySelector("input").addEventListener("input", e => { settings[c.key] = e.target.value; el.querySelector("output").value = e.target.value; applyEnabled(); });
      } else if (c.type === "select") {
        el = document.createElement("label"); el.className = "card";
        el.innerHTML = `<span class="card-title">${c.label}</span><span class="select-wrap"><select name="${c.key}" aria-label="${c.label}">${c.options.map(o => `<option value="${o}" ${String(o) === String(v) ? "selected" : ""}>${o}</option>`).join("")}</select></span>`;
        el.querySelector("select").addEventListener("change", e => settings[c.key] = e.target.value);
      } else if (c.type === "cycle") {
        el = document.createElement("div"); el.className = "card";
        const label = () => c.options.find(o => o[0] === settings[c.key])[1];
        el.innerHTML = `<span class="card-title">${c.label}</span><div class="arrows"><button type="button" class="arrow" data-d="-1" aria-label="Предишно"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><output class="arrow-value">${label()}</output><button type="button" class="arrow" data-d="1" aria-label="Следващо"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`;
        $$(".arrow", el).forEach(a => a.addEventListener("click", () => { const i = c.options.findIndex(o => o[0] === settings[c.key]); const n = (i + Number(a.dataset.d) + c.options.length) % c.options.length; settings[c.key] = c.options[n][0]; el.querySelector("output").value = label(); }));
      }
      el.dataset.key = c.key;
      cardsBox.appendChild(el);
      if (c.help) { const p = document.createElement("p"); p.innerHTML = `<b>${c.label}</b> — ${c.help}`; infoPanel.appendChild(p); }
    });
    applyEnabled();
  }
  // Настройка, която не важи за избраното ниво, стои на екрана, но е затъмнена (както в оригинала).
  function applyEnabled() {
    current.settings.forEach(c => {
      if (!c.enabledIf) return;
      const on = c.enabledIf(settings), el = cardsBox.querySelector(`[data-key="${c.key}"]`);
      if (!el) return;
      el.classList.toggle("card-off", !on);
      $$("input,select,button", el).forEach(i => i.disabled = !on);
    });
  }
  $("#btn-info").addEventListener("click", () => { infoPanel.hidden = !infoPanel.hidden; });
  $("#settings-form").addEventListener("submit", e => e.preventDefault());
  $("#btn-settings-start").addEventListener("click", () => { localStorage.setItem(setKey(current.id), JSON.stringify(settings)); infoPanel.hidden = true; show("intro"); });

  // ---------- инструкция ----------
  function renderIntro() {
    $("#intro-title").textContent = current.name;
    $("#intro-level").textContent = `Ниво ${settings.level || 1}`;
    $("#intro-task").textContent = typeof current.task === "function" ? current.task(settings) : current.task;
    $("#intro-params").textContent = current.paramsLine ? current.paramsLine(settings) : "";
    const tiers = (typeof current.tiers === "function" ? current.tiers(settings) : current.tiers) || [0, 1, 2];
    $$(".tier").forEach((lab, i) => {
      const n = tiers[i]; const inp = lab.querySelector("input"); inp.value = n; inp.checked = i === 1;
      lab.querySelector("b").textContent = n === 0 ? "Не допускай грешки" : n === 1 ? "Имаш право на 1 грешка" : `Имаш право на ${n} грешки`;
      const h = lab.querySelector(".hearts"); h.innerHTML = ""; h.classList.toggle("zero", n === 0);
      for (let k = 0; k < Math.max(Math.min(n, 6), 1); k++) h.appendChild(document.createElement("i"));
    });
  }
  $("#btn-speak").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance($("#intro-task").textContent); u.lang = "bg-BG"; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("bg")); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  });
  $("#btn-start").addEventListener("click", () => { speechSynthesis && speechSynthesis.cancel(); startGame(Number($("input[name=tier]:checked").value)); });

  // ---------- игра ----------
  // Глас: инструкции, числа и обратна връзка се четат на български. Може да се изключи от бутона в играта.
  const SOUND_KEY = "platforma.sound";
  let soundOn = localStorage.getItem(SOUND_KEY) !== "off";
  function say(text) {
    if (!soundOn || !("speechSynthesis" in window) || !text) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = "bg-BG"; u.rate = 0.95;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith("bg")); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  const soundBtn = $("#btn-sound");
  function renderSound() { soundBtn.classList.toggle("off", !soundOn); soundBtn.setAttribute("aria-label", soundOn ? "Изключи звука" : "Включи звука"); }
  soundBtn.addEventListener("click", () => { soundOn = !soundOn; localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off"); if (!soundOn) speechSynthesis.cancel(); renderSound(); });
  renderSound();
  const shell = {
    arena: $("#arena"), timer: $("#timer"), score: $("#score"), lives: $("#lives"), progress: $("#progress"), say,
    setLabel: t => { $("#example").textContent = t; },
    flash: (text, kind) => { const f = $("#feedback"); f.textContent = text; f.className = `feedback show ${kind}`; },
    hideFlash: () => { $("#feedback").className = "feedback"; }
  };
  function startGame(tier) {
    $("#game-title").textContent = current.name;
    show("game"); shell.hideFlash(); shell.setLabel("");
    const ready = (window.BUK && window.BUK.ready) ? window.BUK.ready : Promise.resolve();
    ready.then(() => { if (!document.getElementById("screen-game").hidden) { game = new current.cls(shell, settings, tier, onFinish); requestAnimationFrame(() => game.start()); } });
  }
  $("#btn-exit-game").addEventListener("click", () => { if (game) game.finish(true); });
  $("#btn-game-settings").addEventListener("click", () => { if (game) { game.destroy(); game = null; } show("settings"); });
  const DAY_KEY = () => "platforma.playtime." + new Date().toISOString().slice(0, 10);
  function onFinish(r) {
    game = null; r.child = CHILD.name; r.gameName = current.name; if (window.HW_CTX) Object.assign(r, window.HW_CTX); saveSession(r);
    const today = Number(localStorage.getItem(DAY_KEY()) || 0) + r.seconds; localStorage.setItem(DAY_KEY(), today);
    r.todaySeconds = today;
    renderResult(r); show("result");
  }

  // ---------- резултат ----------
  const STAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>`;
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function renderResult(r) {
    $("#result-stars").innerHTML = [0, 1, 2].map(i => STAR.replace("<svg", `<svg class="${i < r.stars ? "on" : ""}"`)).join("");
    $("#result-title").textContent = r.mode === "learn" ? (r.wrong ? `Готово, ${r.child}! Опита ${r.answered + r.wrong} пъти и стигна до края.` : `Готово, ${r.child}! Всичко от първия път.`) : r.stars === 3 ? `Без грешка, ${r.child}!` : r.stars === 2 ? `Браво, ${r.child}!` : r.stars === 1 ? `Добър опит, ${r.child}` : `Опитай пак, ${r.child}`;
    $("#result-sub").textContent = r.early ? `Спря на ${r.answered} от ${r.total} примера.` : `${r.total} примера, ${r.skill.toLowerCase()}.`;
    $("#r-correct").textContent = r.correct; $("#r-wrong").textContent = r.wrong; $("#r-time").textContent = fmt(r.seconds); $("#r-streak").textContent = r.bestStreak;
    $("#p-skill").textContent = r.skill; $("#p-acc").textContent = r.answered ? Math.round(r.accuracy * 100) + " %" : "—";
    $("#p-rt").textContent = r.avgRt != null ? r.avgRt + " сек." : "—"; $("#p-hard").textContent = r.hard.length ? r.hard.join(", ") : "нито един";
    const rest = $("#rest-note"); const mins = Math.round((r.todaySeconds || 0) / 60);
    if (mins >= 15) { rest.hidden = false; rest.textContent = `Днес игра ${mins} минути. Време е за почивка, утре пак.`; $("#btn-again").textContent = "Още един урок"; }
    else { rest.hidden = true; $("#btn-again").textContent = "Още един урок"; }
    say(r.stars === 3 ? "Браво! Без нито една грешка." : r.stars >= 1 ? "Браво! Урокът е готов." : "Нищо, следващия път ще стане.");
  }
  $("#btn-again").addEventListener("click", () => show("intro"));

  // ---------- прогрес за родителя ----------
  function renderParent() {
    const all = sessions(), bySkill = {};
    all.forEach(s => (bySkill[s.skill] = bySkill[s.skill] || []).push(s));
    const list = $("#skill-list"); list.innerHTML = all.length ? "" : `<p class="hint">Още няма изиграна сесия.</p>`;
    Object.entries(bySkill).forEach(([skill, ss]) => {
      const acc = ss.reduce((a, s) => a + s.accuracy, 0) / ss.length, lvl = Math.max(...ss.map(s => s.level)), seg = Math.round(acc * 8);
      const label = acc >= 0.9 ? "Уверено" : acc >= 0.7 ? "В процес" : "Начало";
      const div = document.createElement("div"); div.className = "skill";
      div.innerHTML = `<b>${skill}</b><span class="lvl">${label} · ниво ${lvl} · ${ss.length} ${ss.length === 1 ? "сесия" : "сесии"}</span><span class="bar">${Array.from({ length: 8 }, (_, i) => `<i class="${i < seg ? "on" : ""}"></i>`).join("")}</span>`;
      list.appendChild(div);
    });
    const tb = $("#sessions tbody"); tb.innerHTML = "";
    all.slice(0, 10).forEach(s => { const d = new Date(s.at); const tr = document.createElement("tr"); tr.innerHTML = `<td>${d.toLocaleDateString("bg-BG", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })}</td><td>${s.gameName || s.gameId}</td><td>${s.level}</td><td>${s.correct}</td><td>${s.wrong}</td><td>${fmt(s.seconds)}</td>`; tb.appendChild(tr); });
  }

  // ---------- старт + маршрути за преглед: #map, #settings/<игра>, #intro/<игра>, #game/<игра>, #result, #parent ----------
  // Отворени от офиса (?office=1): бутон за връщане към страницата на офиса в същия прозорец
  if (/[?&]office=1/.test(location.search)) { document.documentElement.classList.add("in-office"); let back = ""; try { if (document.referrer && !/office=1/.test(document.referrer)) sessionStorage.setItem("platforma.officeUrl", document.referrer); back = sessionStorage.getItem("platforma.officeUrl") || ""; } catch (e) {} const b = document.createElement("a"); b.textContent = "← Моят свят"; b.className = "office-back"; b.href = back || "#"; if (window.parent !== window) b.addEventListener("click", ev => { ev.preventDefault(); window.parent.postMessage("office-back", "*"); }); else if (!back) b.addEventListener("click", ev => { ev.preventDefault(); history.back(); }); document.body.appendChild(b); }
  // Кодиран маршрут за споделени линкове: #g~<игра>~ключ_стойност~... (артефактният адрес пропуска само букви, цифри и ~ _ . -)
  let rawHash = (location.hash || "").slice(1);
  if (rawHash.startsWith("g~")) { const parts = rawHash.split("~").slice(1); rawHash = "game/" + parts[0] + "?" + parts.slice(1).map(kv => { const i = kv.indexOf("_"); return i < 0 ? kv : kv.slice(0, i) + "=" + kv.slice(i + 1); }).join("&"); }
  const [h, argRaw] = rawHash.split("/");
  const [arg, qs] = (argRaw || "").split("?");
  const overrides = Object.fromEntries((qs || "").split("&").filter(Boolean).map(kv => kv.split("=")));
  // контекст на домашната (hw = домашна, st = етап): записва се в сесията, за да се движи картата на детето
  const CTX_KEYS = ["hw", "st", "lesson", "round", "skill", "skill2", "meas", "mode", "adaptive", "bank", "tpl", "mm", "ovr"];
  if (CTX_KEYS.some(k => k in overrides)) { window.HW_CTX = {}; CTX_KEYS.forEach(k => { if (k in overrides) { window.HW_CTX[k] = k === "st" ? Number(overrides[k] || 0) : overrides[k]; delete overrides[k]; } }); }
  if (["settings", "intro", "game"].includes(h)) { selectGame(G[arg] ? arg : "underwaterKingdom"); Object.assign(settings, overrides); if (h === "game") { show("intro"); startGame(1); if (overrides.sim === "box") setTimeout(() => { if (game) game.advance = () => {}; const b=document.querySelector(".abox"); b&&b.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})); }, 1500); else if (overrides.sim === "2") setTimeout(() => { const f=document.querySelector("#fields .field"); f.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})); const t=[...document.querySelectorAll("#numrow .numtile")].find(x=>Number(x.textContent)===Number(f.dataset.count)); t&&t.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})); }, 1500); else if (overrides.sim) setTimeout(() => { const fs=[...document.querySelectorAll("#fields .field")]; const cs=fs.map(f=>Number(f.dataset.count)); const i=cs.indexOf(Math.min(...cs)); fs[i]&&fs[i].dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})); }, 1500); } else show(h); }
  else if (h === "result") { selectGame("underwaterKingdom"); renderResult({ child: CHILD.name, stars: 2, early: false, total: 8, answered: 8, correct: 7, wrong: 1, seconds: 74, bestStreak: 5, skill: "Събиране до 6", accuracy: 7 / 8, avgRt: 2.4, hard: ["3 + 2"] }); show("result"); }
  else if (["map", "bmap", "rmap", "wmap", "parent"].includes(h)) show(h);
  else show("modules");
})();
