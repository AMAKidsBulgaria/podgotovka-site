/* Демонстрационни данни за офиса (измислени имена). Пазят се в localStorage `platforma.office.v1`. */
(function () {
  const day = 86400000, now = new Date();
  const d = (offsetDays, h = 0, m = 0) => { const x = new Date(now); x.setDate(x.getDate() + offsetDays); x.setHours(h, m, 0, 0); return x.toISOString(); };
  const iso = x => x.toISOString();
  const partners = [{ id: "p1", name: "Партньор Разград ЕООД", contact: "Ива Стоянова", centers: ["c1", "c2"], territory: "Разград, София изток", royaltyRate: 0.08, materialsBalance: 120, since: "2019-01-28" }];
  const centers = [
    { id: "c1", name: "Разград", city: "Разград", address: "ул. Демонстрация 1", phone: "0888 000 100", partnerId: "p1" },
    { id: "c2", name: "София, Дружба", city: "София", address: "бул. Пример 12", phone: "0888 000 200", partnerId: "p1" }
  ];
  const users = [
    { id: "u1", centerId: "c1", centerIds: ["c1", "c2"], role: "manager", name: "Ива Стоянова", email: "manager@example.bg" },
    { id: "u2", centerId: "c1", role: "teacher", name: "Виктория Найденова", email: "viktoria@example.bg", programIds: ["pts", "buk"] },
    { id: "u3", centerId: "c1", role: "teacher", name: "Николай Петров", email: "nikolay@example.bg", programIds: ["buk", "read"] },
    { id: "u4", centerId: "c2", centerIds: ["c2"], role: "manager", name: "Десислава Ангелова", email: "manager2@example.bg" },
    { id: "u5", centerId: "c2", role: "teacher", name: "Елена Георгиева", email: "elena@example.bg", programIds: ["pts"] },
    { id: "u9", centerId: null, role: "hq", name: "Централен офис", email: "hq@example.bg" }
  ];
  const programs = [{ id: "pts", name: "Подготовка за училище", ageGroup: "5-7" }, { id: "buk", name: "Букварика", ageGroup: "5-7" }, { id: "read", name: "Читарика", ageGroup: "7-10" }];
  const packages = [{ id: "p4", centerId: "c1", programId: "pts", name: "4 занятия", lessons: 4, price: 80 }, { id: "p12", centerId: "c1", programId: "pts", name: "12 занятия", lessons: 12, price: 220 }];
  const groups = [
    { id: "g1", centerId: "c1", programId: "pts", teacherId: "u2", name: "ПкУ Сряда 17:30", ageGroup: "5-7", weekday: 3, time: "17:30", room: "Зала 1", status: "active", startDate: d(-120), lessonsHeld: 17 },
    { id: "g2", centerId: "c1", programId: "pts", teacherId: "u2", name: "ПкУ Събота 10:00", ageGroup: "5-7", weekday: 6, time: "10:00", room: "Зала 1", status: "active", startDate: d(-60), lessonsHeld: 8 },
    { id: "g3", centerId: "c1", programId: "buk", teacherId: "u3", name: "Букварика Четвъртък 18:00", ageGroup: "5-7", weekday: 4, time: "18:00", room: "Зала 2", status: "active", startDate: d(-90), lessonsHeld: 12 },
    { id: "g4", centerId: "c2", programId: "pts", teacherId: "u5", name: "ПкУ Вторник 17:00", ageGroup: "5-7", weekday: 2, time: "17:00", room: "Зала A", status: "active", startDate: d(-100), lessonsHeld: 14 }
  ];
  const kids = [
    ["Мила", "Иванова", "g1", 5, "Петя Иванова", "0888 000 001", "Facebook"], ["Калоян", "Димитров", "g1", 6, "Георги Димитров", "0888 000 002", "приятел"], ["Ема", "Тодорова", "g1", 5, "Нина Тодорова", "0888 000 003", "Google"],
    ["Дария", "Петкова", "g1", 6, "Елица Петкова", "0888 000 004", "сайт"], ["Борис", "Колев", "g1", 6, "Иван Колев", "0888 000 005", "Facebook"], ["Ния", "Стефанова", "g1", 5, "Ана Стефанова", "0888 000 006", "приятел"],
    ["Александър", "Митев", "g2", 6, "Мила Митева", "0888 000 007", "Facebook"], ["Виктория", "Христова", "g2", 5, "Росица Христова", "0888 000 008", "Google"], ["Матей", "Симеонов", "g2", 6, "Даниела Симеонова", "0888 000 009", "сайт"],
    ["Рая", "Николова", "g2", 5, "Веселина Николова", "0888 000 010", "приятел"], ["Теодор", "Василев", "g3", 6, "Цветелина Василева", "0888 000 011", "Facebook"], ["Лора", "Йорданова", "g3", 5, "Йордан Йорданов", "0888 000 012", "друго"],
    ["Явор", "Маринов", "g3", 6, "Ирина Маринова", "0888 000 013", "Google"], ["Ася", "Радева", "g4", 5, "Радост Радева", "0888 000 014", "Facebook"], ["Мартин", "Илиев", "g4", 6, "Илияна Илиева", "0888 000 015", "приятел"],
    ["Габриела", "Ангелова", "g4", 6, "Мария Ангелова", "0888 000 016", "сайт"], ["Стефан", "Русев", "g4", 5, "Румяна Русева", "0888 000 017", "Google"]
  ];
  const families = [], children = [], enrollments = [], payments = [], charges = [];
  kids.forEach((k, i) => {
    const g = groups.find(x => x.id === k[2]); const fid = "f" + (i + 1), cid = "k" + (i + 1);
    families.push({ id: fid, centerId: g.centerId, contactName: k[4], phone: k[5], email: `family${i + 1}@example.bg`, emailConsent: i % 7 !== 3, source: k[6] });
    const birth = new Date(now); birth.setFullYear(birth.getFullYear() - k[3]); birth.setMonth((i * 5) % 12); birth.setDate(1 + (i * 7) % 27);
    const status = i === 12 ? "paused" : "active";
    children.push({ id: cid, familyId: fid, centerId: g.centerId, firstName: k[0], lastName: k[1], birthDate: iso(birth), status, createdAt: g.startDate, groupId: g.id, streakDays: [4, 0, 9, 2, 0, 12, 1, 0, 6, 3, 0, 7, 0, 5, 2, 0, 8][i] });
    const lessonsLeft = [3, 1, 4, 2, 0, 3, 4, 2, 1, 3, 2, 4, 0, 3, 1, 2, 4][i];
    enrollments.push({ id: "e" + (i + 1), childId: cid, groupId: g.id, programId: g.programId, packageId: "p4", startDate: g.startDate, status, pricePerLesson: 20, discount: i === 4 ? 0.1 : 0, lessonsLeft, balance: lessonsLeft * 20 });
    payments.push({ id: "pay" + (i + 1), enrollmentId: "e" + (i + 1), childId: cid, amount: 80, lessons: 4, note: "4 занятия", method: ["в брой", "карта", "банка"][i % 3], kind: "пакет", at: d(-((i * 3) % 25) - 2), userId: g.centerId === "c1" ? "u1" : "u4" });
  });
  // занятия: последни 8 седмици + следващите 2 за всяка група
  const lessons = [], attendance = [];
  groups.forEach(g => {
    for (let w = -8; w <= 2; w++) {
      const dt = new Date(now); dt.setDate(dt.getDate() + (g.weekday - dt.getDay() + 7) % 7 + 7 * w); const [h, m] = g.time.split(":").map(Number); dt.setHours(h, m, 0, 0);
      const past = dt < now; const id = `${g.id}-l${w + 8}`;
      lessons.push({ id, groupId: g.id, centerId: g.centerId, at: iso(dt), lessonNumber: g.lessonsHeld + w + 1, status: past ? "held" : "planned", teacherId: g.teacherId });
      if (past) children.filter(c => c.groupId === g.id).forEach((c, i) => { const present = !((w + i) % 5 === 0 && i % 2 === 1) && !(c.id === "k5" && w > -4) && !(c.id === "k13" && w > -3); attendance.push({ lessonId: id, childId: c.id, present, paid: present }); });
    }
  });
  const lessonAt = (gid, n) => { const ls = lessons.filter(l => l.groupId === gid); const pl = ls.filter(l => l.status === "planned"), hd = ls.filter(l => l.status === "held"); return n < 0 ? hd[hd.length + n].at : pl[n].at; };
  // Каталог на централния офис: артикулите са по образец на реалния ценоразпис, цените са примерни.
  const catalog = [
    { id: "a1", cat: "Сметала", name: "Сметало малко", price: 9, unit: "бр.", active: true, stock: 38, min: 20 },
    { id: "a2", cat: "Сметала", name: "Сметало голямо", price: 18, unit: "бр.", active: true, stock: 14, min: 10 },
    { id: "a3", cat: "Сметала", name: "Сметало голямо стационарно (за дъска)", price: 45, unit: "бр.", active: true, stock: 3, min: 2 },
    { id: "a4", cat: "Учебници", name: "Учебник „Начален курс“ (малки)", price: 12, unit: "бр.", active: true, stock: 52, min: 20 },
    { id: "a5", cat: "Учебници", name: "Учебник „Начален курс“ (големи)", price: 12, unit: "бр.", active: true, stock: 9, min: 20 },
    { id: "a6", cat: "Учебници", name: "Правила (малки)", price: 6, unit: "бр.", active: true, stock: 40, min: 20 },
    { id: "a7", cat: "Учебници", name: "Правила (големи)", price: 6, unit: "бр.", active: true, stock: 22, min: 20 },
    { id: "a8", cat: "Учебници", name: "Сборник със задачи", price: 10, unit: "бр.", active: true, stock: 6, min: 15 },
    { id: "a9", cat: "Учебници", name: "Учебник „Таблица за умножение“", price: 12, unit: "бр.", active: true, stock: 30, min: 10 },
    { id: "a10", cat: "Учебници", name: "Учебник „Умножение и деление“, част 1", price: 12, unit: "бр.", active: true, stock: 25, min: 10 },
    { id: "a11", cat: "Учебници", name: "Учебник „Умножение и деление“, част 2", price: 12, unit: "бр.", active: false, stock: 0, min: 0 },
    { id: "a12", cat: "Игри", name: "Игра за развитие на паметта „По двойки“", price: 14, unit: "бр.", active: true, stock: 11, min: 5 },
    { id: "a13", cat: "Награди", name: "Значка, ниво 1", price: 2, unit: "бр.", active: true, stock: 140, min: 50 },
    { id: "a14", cat: "Награди", name: "Значка, ниво 2", price: 2, unit: "бр.", active: true, stock: 95, min: 50 },
    { id: "a15", cat: "Награди", name: "Значка, ниво 3", price: 2, unit: "бр.", active: true, stock: 32, min: 50 },
    { id: "a16", cat: "Награди", name: "Поименна купа", price: 15, unit: "бр.", active: true, stock: 4, min: 3 },
    { id: "a17", cat: "Брандирани", name: "Силиконова гривна с лого", price: 1.5, unit: "бр.", active: true, stock: 210, min: 100 },
    { id: "a18", cat: "Брандирани", name: "Моливник с лого", price: 4, unit: "бр.", active: true, stock: 60, min: 30 },
    { id: "a19", cat: "Брандирани", name: "Бележник", price: 3, unit: "бр.", active: true, stock: 48, min: 30 },
    { id: "a20", cat: "Брандирани", name: "3D стикер", price: 1, unit: "бр.", active: true, stock: 300, min: 100 },
    { id: "a21", cat: "Реклама", name: "Листовки, пакет 100 бр.", price: 8, unit: "пакет", active: true, stock: 12, min: 5 }
  ];
  const mkOrder = (id, centerId, daysAgo, lines, status, extra = {}) => { const items = lines.map(([aid, qty]) => { const a = catalog.find(x => x.id === aid); return { id: aid, name: a.name, price: a.price, qty }; }); const o = Object.assign({ id, no: Number(id.slice(1)), centerId, createdAt: d(-daysAgo, 10, 15), items, total: items.reduce((s, i) => s + i.price * i.qty, 0), payMethod: "по банков път", delivery: "Еконт, до офис", recipient: "Офис на центъра", phone: "0888 000 100", comment: "", status, userId: centerId === "c1" ? "u1" : "u4" }, extra); if (status === "paid" || status === "shipped") { o.paidAt = extra.paidAt || d(-daysAgo + 2, 14); o.invoiceNo = "00000" + (o.no - 200); } if (status === "shipped") { o.shippedAt = extra.shippedAt || d(-daysAgo + 4, 12); o.carrier = /офиса/.test(o.delivery) ? "лично" : "Еконт"; o.tracking = o.carrier === "лично" ? "" : (extra.tracking || "1051" + String(o.no).padStart(6, "0")); } return o; };
  const orders = [
    mkOrder("o1041", "c1", 40, [["a1", 10], ["a4", 10], ["a6", 10]], "shipped"),
    mkOrder("o1052", "c2", 26, [["a2", 5], ["a5", 12], ["a7", 12], ["a13", 20]], "shipped"),
    mkOrder("o1058", "c1", 12, [["a3", 1], ["a12", 3]], "shipped", { delivery: "Ще взема от офиса", comment: "Ще ги взема в понеделник." }),
    mkOrder("o1063", "c1", 6, [["a1", 15], ["a8", 15], ["a17", 30]], "paid"),
    mkOrder("o1066", "c2", 2, [["a9", 8], ["a10", 8], ["a16", 2]], "pending", { comment: "Купите са за края на модула, моля до 10-ти." }),
    mkOrder("o1067", "c1", 0, [["a13", 30], ["a14", 30], ["a15", 20]], "pending", { payMethod: "в брой", delivery: "Ще взема от офиса" })
  ];
  // Складови движения: приемане на доставка (in), изпращане по поръчка (out), корекция при инвентаризация (adjust).
  const stockMoves = [];
  orders.filter(o => o.status === "shipped").forEach(o => o.items.forEach(i => stockMoves.push({ id: "sm" + o.no + i.id, at: o.shippedAt, itemId: i.id, qty: -i.qty, kind: "out", ref: o.id, note: `Поръчка № ${o.no}, ${centers.find(c => c.id === o.centerId).name}`, userId: "u9" })));
  [["a1", 50, 30], ["a4", 60, 30], ["a13", 200, 30], ["a17", 250, 30], ["a2", 20, 18], ["a5", 20, 18], ["a20", 300, 12]].forEach(([id, qty, days], i) => stockMoves.push({ id: "smin" + i, at: d(-days, 11), itemId: id, qty, kind: "in", note: "Доставка от печатница / доставчик", userId: "u9" }));
  stockMoves.push({ id: "smadj1", at: d(-8, 17), itemId: "a8", qty: -2, kind: "adjust", note: "Инвентаризация: два повредени екземпляра", userId: "u9" });
  const leads = [
    { id: "L1", centerId: "c1", childName: "Боян", age: 5, contactName: "Мая Георгиева", phone: "0899 100 001", email: "roditel1@example.bg", source: "Facebook", hot: true, programId: "pts", status: "new", createdAt: d(-2, 9), nextActionAt: null, ownerUserId: null, comms: [] },
    { id: "L2", centerId: "c1", childName: "Сияна", age: 6, contactName: "Стела Петрова", phone: "0899 100 002", email: "roditel2@example.bg", source: "Google", hot: false, programId: "pts", status: "contacted", createdAt: d(-6), nextActionAt: d(0, 15), ownerUserId: "u1", comms: [{ at: d(-5, 11), channel: "call", summary: "Интерес към съботна група, ще потвърди.", userId: "u1" }] },
    { id: "L3", centerId: "c1", childName: "Мартина", age: 5, contactName: "Ралица Тонева", phone: "0899 100 003", email: "roditel3@example.bg", source: "приятел", hot: true, programId: "pts", status: "trialScheduled", createdAt: d(-9), trial: { at: lessonAt("g1", 0), teacherId: "u2", groupId: "g1", status: "scheduled", confirmed: false, kind: "group" }, ownerUserId: "u1", comms: [{ at: d(-8, 10), channel: "call", summary: "Записана за пробен урок.", userId: "u1" }] },
    { id: "L4", centerId: "c1", childName: "Кристиан", age: 6, contactName: "Антония Ковачева", phone: "0899 100 004", email: "roditel4@example.bg", source: "сайт", hot: false, programId: "buk", status: "trialVisited", createdAt: d(-14), trial: { at: d(-3, 18), teacherId: "u3", groupId: "g3", status: "visited", teacherNote: "Знае буквите, чете срички. Подходящ за групата.", offerSentAt: d(-3, 20) }, ownerUserId: "u1", comms: [{ at: d(-3, 20), channel: "email", summary: "Изпратено предложение: 4 занятия 80 €.", userId: "u1" }] },
    { id: "L5", centerId: "c1", childName: "Йоана", age: 5, contactName: "Гергана Милева", phone: "0899 100 005", email: "roditel5@example.bg", source: "Facebook", hot: false, programId: "pts", status: "trialScheduled", createdAt: d(-10), trial: { at: lessonAt("g1", -1), teacherId: "u2", groupId: "g1", status: "noShow" }, ownerUserId: "u1", comms: [] },
    { id: "L6", centerId: "c1", childName: "Петър", age: 7, contactName: "Стоян Стоянов", phone: "0899 100 006", email: "roditel6@example.bg", source: "Google", hot: false, programId: "read", status: "lost", lostReason: "далеч от центъра", createdAt: d(-30), ownerUserId: "u1", comms: [] },
    { id: "L7", centerId: "c1", childName: "Елица", age: 6, contactName: "Надежда Иванова", phone: "0899 100 007", email: "roditel7@example.bg", source: "приятел", hot: true, programId: "pts", status: "new", createdAt: d(0, 8), ownerUserId: null, comms: [] },
    { id: "L8", centerId: "c2", childName: "Виктор", age: 5, contactName: "Камелия Динева", phone: "0899 100 008", email: "roditel8@example.bg", source: "Facebook", hot: false, programId: "pts", status: "contacted", createdAt: d(-4), nextActionAt: d(1, 10), ownerUserId: "u4", comms: [] },
    { id: "L9", centerId: "c2", childName: "Анна", age: 6, contactName: "Илияна Дочева", phone: "0899 100 009", email: "roditel9@example.bg", source: "сайт", hot: true, programId: "pts", status: "trialScheduled", createdAt: d(-7), trial: { at: lessonAt("g4", 0), teacherId: "u5", groupId: "g4", status: "scheduled", confirmed: true, kind: "group" }, ownerUserId: "u4", comms: [] },
    { id: "L10", centerId: "c1", childName: "Александра", age: 5, contactName: "Десислава Христова", phone: "0899 100 010", email: "roditel10@example.bg", source: "сайт", channel: "site", hot: false, programId: "pts", status: "trialScheduled", createdAt: d(-6), statusAt: d(-5), trialScheduledAt: d(-5), trial: { at: lessonAt("g1", 0), teacherId: "u2", groupId: "g1", status: "scheduled", confirmed: true, kind: "group" }, ownerUserId: "u1", comms: [{ at: d(-5, 11), channel: "call", summary: "Записана за пробен урок, родителят потвърди.", userId: "u1" }] },
    { id: "L11", centerId: "c1", childName: "Мартин", age: 6, contactName: "Петя Георгиева", phone: "0899 100 011", email: "roditel11@example.bg", source: "Google", channel: "manual", hot: true, programId: "pts", status: "trialScheduled", createdAt: d(-4), statusAt: d(-3), trialScheduledAt: d(-3), trial: { at: lessonAt("g1", 0), teacherId: "u2", groupId: "g1", status: "scheduled", confirmed: false, kind: "group" }, ownerUserId: "u1", comms: [] },
    { id: "L12", centerId: "c1", childName: "Елена", age: 5, contactName: "Йорданка Маринова", phone: "0899 100 012", email: "roditel12@example.bg", source: "приятел", channel: "manual", hot: false, programId: "pts", status: "trialScheduled", createdAt: d(-2), statusAt: d(-2), trialScheduledAt: d(-2), trial: { at: lessonAt("g1", 1), teacherId: "u2", groupId: "g1", status: "scheduled", confirmed: false, kind: "group" }, ownerUserId: "u1", comms: [] },
    { id: "L10", centerId: "c2", childName: "Денис", age: 6, contactName: "Севда Османова", phone: "0899 100 010", email: "roditel13@example.bg", source: "Google", hot: false, programId: "pts", status: "enrolled", createdAt: d(-40), ownerUserId: "u4", comms: [] }
  ];
  // канал и времена по статус за фунията
  leads.forEach((l, i) => { l.channel = ["сайт"].includes(l.source) ? "site" : "manual"; l.statusAt = l.trial ? l.trial.at : l.createdAt; if (l.status !== "new") l.contactedAt = iso(new Date(new Date(l.createdAt).getTime() + day)); if (l.trial) l.trialScheduledAt = iso(new Date(new Date(l.createdAt).getTime() + 2 * day)); if (l.trial && l.trial.status === "visited") l.trialVisitedAt = l.trial.at; if (l.status === "enrolled") { l.trial = l.trial || { at: d(-36, 17), teacherId: "u5", groupId: "g4", status: "visited", kind: "group" }; l.trialVisitedAt = l.trial.at; l.enrolledAt = d(-33); } if (l.status === "lost") l.lostAt = d(-28); });
  // още лидове за обем (сайт + ръчни), различни статуси
  const extraNames = ["Симона", "Калин", "Ралица", "Теодора", "Огнян", "Ивайла", "Радост", "Валери", "Здравко", "Мила-Мария", "Емил", "Дениса"];
  extraNames.forEach((n, i) => { const cidx = i % 2 ? "c2" : "c1"; const st = ["new", "contacted", "trialScheduled", "enrolled", "lost", "contacted"][i % 6]; const created = d(-3 - i * 2, 10); const l = { id: "LX" + i, centerId: cidx, childName: n, age: 5 + (i % 5), contactName: "Родител " + n, phone: "0898 2" + String(10000 + i * 731).slice(0, 5), email: i % 4 === 0 || i % 3 === 0 ? "roditel-x" + i + "@example.bg" : null, source: ["сайт", "Facebook", "Google", "приятел"][i % 4], channel: i % 4 === 0 ? "site" : "manual", hot: i % 5 === 0, programId: ["pts", "buk", "read"][i % 3], status: st, createdAt: created, statusAt: created, ownerUserId: st === "new" ? null : (cidx === "c1" ? "u1" : "u4"), comms: [] }; if (st === "contacted") { l.contactedAt = d(-2 - i * 2); l.nextActionAt = d(1 + (i % 3), 11); } if (st === "trialScheduled") { l.trial = { at: lessonAt(cidx === "c1" ? "g1" : "g4", (i >> 1) % 2), teacherId: cidx === "c1" ? "u2" : "u5", groupId: cidx === "c1" ? "g1" : "g4", status: "scheduled", confirmed: i % 2 === 0, kind: "group" }; l.trialScheduledAt = d(-1 - i); } if (st === "enrolled") { l.trial = { at: d(-10 - i, 18), teacherId: "u2", groupId: "g2", status: "visited", kind: "group" }; l.trialVisitedAt = l.trial.at; l.enrolledAt = d(-7 - i); } if (st === "lost") { l.lostAt = d(-5 - i); l.lostReason = ["цена", "далеч от центъра", "неудобно време"][i % 3]; } leads.push(l); });
  // Шаблони за домашна по урок (Подготовка за училище)
  const templates = {
    pts: {
      1: { stages: [{ gameId: "underwaterKingdom", settings: { level: 1, examples: 6, range: 5, op: "add", speed: 1 }, levels: 2 }, { gameId: "cobweb", settings: { level: 1, examples: 6 }, levels: 2 }, { gameId: "professions", settings: { exampleQty: 4 }, levels: 1 }], rounds: 4 },
      2: { stages: [{ gameId: "underwaterKingdom", settings: { level: 2, examples: 6, range: 6, op: "add", speed: 2 }, levels: 2 }, { gameId: "numberComposition", settings: { numbers: 5, complexity: 1, examples: 6 }, levels: 2 }, { gameId: "alphabet", settings: { level: 1 }, levels: 1 }], rounds: 4 },
      3: { stages: [{ gameId: "intellectScales", settings: { level: 1, range: 6, examples: 6 }, levels: 2 }, { gameId: "order", settings: { level: 1, range: 10, examples: 5 }, levels: 2 }, { gameId: "phonemicHearing", settings: { level: 1, tasks: 4 }, levels: 2 }, { gameId: "memoryStick", settings: { level: 1, gameFieldSize: "3x3", exampleQty: 4 }, levels: 1 }], rounds: 4 },
      4: { stages: [{ gameId: "brainstorm", settings: { level: 1, range: 10, op: "add", examples: 5 }, levels: 2 }, { gameId: "alphabet", settings: { level: 3, lettersQty: 4, rounds: 4 }, levels: 2 }, { gameId: "soundLetterParsing", settings: { level: 1, answersQty: 5, lessonNumber: 4 }, levels: 2 }, { gameId: "safari", settings: { level: 1, mode: "simple" }, levels: 1 }], rounds: 4 }
    }
  };
  const GAME_NAMES = { underwaterKingdom: "Подводно царство", cobweb: "Улов", intellectScales: "Умни везни", numberComposition: "Състав на числата", order: "Последователност", brainCrush: "Главоблъсканица", brainstorm: "Мозъчна атака", pirateCipher: "Пиратски шифър", brightNumbers: "Ярки числа", shadowMap: "Карта на диаманти", secretCards: "Тайни карти", piratesTreasures: "Пиратско съкровище", alphabet: "Азбука", letterOfElements: "Елементи на букви", phonemicHearing: "Фонематичен слух", phonetics: "Фонетика", soundLetterParsing: "Звуково-буквен анализ", readca: "Читалка", professions: "Професии", outwardThings: "Обкръжалка", masksShow: "Шоу с маски", cleanShipRoom: "Чиста каюта", forestKingdom: "Горско царство", timeGuardian: "Страж на времето", safari: "Сафари", soonToSchool: "На училище", hideAndSeek: "Криеница", memoryStick: "Запоминалка", constructor: "Конструктор", accents: "Ударения", guessWord: "Познай думата", trueWords: "Правилни думи", buildSentence: "Построй изречение", conformity: "Съответствие", readcaR: "Читалка (Читарика)", wordOrder: "Словоред", numberLine: "Числова права", words: "Думи", sayDifferently: "Кажи друго" };
  const SKILLS = { underwaterKingdom: "Събиране и изваждане", cobweb: "Броене", intellectScales: "Сравняване", numberComposition: "Състав на числата", order: "Ред на числата", brainstorm: "Текстови задачи", alphabet: "Ред на буквите", phonemicHearing: "Първи звук", soundLetterParsing: "Звуков анализ", professions: "Околен свят", memoryStick: "Памет", safari: "Памет", letterOfElements: "Елементи на буквите", readca: "Четене на срички" };
  // Домашни: за всяка активна група — текущата от последното занятие; изпълнение по дете
  const homeworks = [], sessions = [];
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  let sid = 1;
  groups.forEach(g => {
    if (!templates[g.programId]) return;
    const lastHeld = lessons.filter(l => l.groupId === g.id && l.status === "held").sort((a, b) => a.at < b.at ? 1 : -1)[0];
    const tKey = Object.keys(templates.pts)[(g.lessonsHeld) % 4]; const t = templates.pts[tKey];
    children.filter(c => c.groupId === g.id).forEach((c, i) => {
      const hw = { id: "hw-" + c.id, childId: c.id, groupId: g.id, teacherId: g.teacherId, lessonId: lastHeld.id, lessonNumber: lastHeld.lessonNumber, stages: JSON.parse(JSON.stringify(t.stages)), rounds: t.rounds, comment: i % 3 === 0 ? "Обърни внимание на сричките." : "", assignedAt: lastHeld.at, dueAt: iso(new Date(new Date(lastHeld.at).getTime() + 7 * day)), status: "open" };
      const totalSteps = hw.stages.reduce((s, st) => s + st.levels, 0) * hw.rounds;
      const doneSteps = c.status === "paused" ? 0 : Math.min(totalSteps, [Math.max(1, Math.round(totalSteps * 0.4)), 2, totalSteps, 5, 0, totalSteps, 3, 0, 7, 4, 0, totalSteps, 0, 6, 1, 0, totalSteps][children.indexOf(c)] || 0);
      hw.doneSteps = doneSteps; hw.totalSteps = totalSteps; if (doneSteps >= totalSteps) hw.status = "done";
      homeworks.push(hw);
      // сесии за напредък по умения
      let k = 0;
      for (let r = 0; r < hw.rounds && k < doneSteps; r++) for (const st of hw.stages) for (let lv = 0; lv < st.levels && k < doneSteps; lv++) { k++; const total = Number(st.settings.examples || st.settings.answersQty || st.settings.exampleQty || st.settings.tasks || 6); const acc = Math.min(1, 0.55 + (children.indexOf(c) % 5) * 0.09 + r * 0.04); const correct = Math.round(total * acc); sessions.push({ id: "s" + sid++, childId: c.id, gameId: st.gameId, homeworkId: hw.id, stageIndex: hw.stages.indexOf(st), level: Number(st.settings.level || 1), startedAt: iso(new Date(new Date(hw.assignedAt).getTime() + day * (1 + r) + 3600000 * k)), seconds: rnd(60, 240), total, answered: total, correct, wrong: total - correct, accuracy: acc, avgRt: 1.5 + rnd(0, 20) / 10, stars: acc >= 0.99 ? 3 : 2, early: false, skill: SKILLS[st.gameId] || GAME_NAMES[st.gameId] }); }
    });
  });
  children[0].lessonsDone = 5; // демо: Мила е в средата на Букварика (занятие 6 се строи)
  children.forEach(c => { c.gender = /[ая]$/.test(c.firstName) && !/Никола$|Илия$/.test(c.firstName) ? "f" : "m"; });
  // Достъп на детето до игрите: създава се автоматично при записване в група; линкът отива при родителя.
  children.forEach((c, i) => { if (c.groupId) { const at = d(-60 + i, 12); c.access = { code: ["KOTE", "RIBA", "LUNA", "SLON", "ZVEZDA", "OBLAK", "PTICA", "MECHO", "ZAEK", "LISA", "BUHAL", "DELFIN", "ZHABA", "TIGAR", "PANDA", "KOALA", "LAMA"][i % 17] + "-" + (100 + i * 7), createdAt: at, sentAt: at, activatedAt: i % 5 === 3 ? null : d(-59 + i, 18), devices: i % 5 === 3 ? 0 : 1 + (i % 2) }; } });
  // Роялти: юли е платен (история); август се изчислява автоматично от записаните деца и проведените занятия и е просрочен.
  const royalties = [
    { id: "roy-p1-2026-07", partnerId: "p1", month: "2026-07", children: 16, lessons: 14, childLessons: 78, base: 1560, rate: 0.08, amount: 124.8, status: "paid", createdAt: "2026-08-01T06:00:00.000Z", dueAt: "2026-08-10T20:59:59.000Z", invoiceNo: "0000000341", invoicedAt: "2026-08-02T09:10:00.000Z", paidAt: "2026-08-07T11:30:00.000Z" },
    { id: "roy-p1-2026-08", partnerId: "p1", month: "2026-08", status: "invoiced", createdAt: "2026-09-01T06:00:00.000Z", dueAt: "2026-09-10T20:59:59.000Z", invoiceNo: "0000000362", invoicedAt: "2026-09-02T09:40:00.000Z" }
  ];
  const events = [];
  orders.forEach(o => { const cn = centers.find(c => c.id === o.centerId).name; events.push({ at: o.createdAt, centerId: o.centerId, userId: o.userId, type: "order.created", subject: o.id, text: `Поръчка № ${o.no} от ${cn}: ${o.items.length} артикула, ${o.total} €` }); events.push({ at: o.createdAt, centerId: o.centerId, userId: null, auto: true, type: "email.hq", subject: o.id, text: `Автоматичен имейл до централния офис: нова поръчка № ${o.no} от ${cn}, ${o.total} €` }); if (o.paidAt) { events.push({ at: o.paidAt, centerId: o.centerId, userId: "u9", type: "order.paid", subject: o.id, text: `Поръчка № ${o.no}: платена, фактура ${o.invoiceNo}` }); events.push({ at: o.paidAt, centerId: o.centerId, userId: null, auto: true, type: "email.partner", subject: o.id, text: `Автоматичен имейл до ${cn}: плащането по поръчка № ${o.no} е получено, предстои изпращане` }); } if (o.shippedAt) { events.push({ at: o.shippedAt, centerId: o.centerId, userId: "u9", type: "order.shipped", subject: o.id, text: `Поръчка № ${o.no}: ${o.tracking ? `изпратена с ${o.carrier}, товарителница ${o.tracking}` : "предадена в офиса"}` }); events.push({ at: o.shippedAt, centerId: o.centerId, userId: null, auto: true, type: "email.partner", subject: o.id, text: `Автоматичен имейл до ${cn}: поръчка № ${o.no} е ${o.tracking ? "изпратена, товарителница " + o.tracking : "предадена"}` }); } });
  leads.forEach(l => { events.push({ at: l.createdAt, centerId: l.centerId, userId: null, type: "lead.created", subject: l.id, text: `Нов лид: ${l.childName}, ${l.source}` }); l.comms.forEach(c => events.push({ at: c.at, centerId: l.centerId, userId: c.userId, type: "lead." + c.channel, subject: l.id, text: `${l.childName}: ${c.summary}` })); if (l.trial) { const sd = new Date(l.trialScheduledAt || new Date(l.createdAt).getTime() + 2 * day); sd.setHours(11, 20, 0, 0); const sch = iso(sd); events.push({ at: sch, centerId: l.centerId, userId: l.ownerUserId, type: "trial.scheduled", subject: l.id, text: `Пробен урок насрочен: ${l.childName}` }); if (l.trial.confirmed) events.push({ at: iso(new Date(new Date(sch).getTime() + day)), centerId: l.centerId, userId: l.ownerUserId, type: "trial.confirmed", subject: l.id, text: `Пробен урок потвърден: ${l.childName}` }); if (l.trial.status === "visited" || l.trial.status === "noShow") events.push({ at: iso(new Date(new Date(l.trial.at).getTime() + 2 * 3600000)), centerId: l.centerId, userId: l.trial.teacherId, type: "trial." + l.trial.status, subject: l.id, text: `Пробен урок: ${l.childName}`, note: l.trial.teacherNote || "" }); } });
  lessons.filter(l => l.status === "held").forEach(l => { const g = groups.find(x => x.id === l.groupId); const pres = attendance.filter(a => a.lessonId === l.id && a.present).length; events.push({ at: l.at, centerId: l.centerId, userId: g.teacherId, type: "lesson.held", subject: l.id, text: `${g.name}: занятие ${l.lessonNumber}, присъствали ${pres}` }); });
  homeworks.forEach(h => { const c = children.find(x => x.id === h.childId); events.push({ at: h.assignedAt, centerId: c.centerId, userId: h.teacherId, type: "homework.assigned", subject: c.id, text: `Домашна за ${c.firstName}: ${h.stages.length} етапа, ${h.rounds} рунда` }); if (h.status === "done") events.push({ at: iso(new Date(new Date(h.assignedAt).getTime() + 4 * day)), centerId: c.centerId, userId: null, type: "homework.done", subject: c.id, text: `${c.firstName} изпълни домашната` }); });
  payments.forEach(p => { const c = children.find(x => x.id === p.childId); events.push({ at: p.at, centerId: c.centerId, userId: p.userId, type: "payment.added", subject: c.id, text: `Плащане ${p.amount} € (${p.method}) за ${c.firstName}` }); });
  events.sort((a, b) => a.at < b.at ? 1 : -1);
  // Наличност на учителите: седмичен шаблон (ден, от, до) + изключения по дата
  const availability = [
    { id: "av1", teacherId: "u2", centerId: "c1", weekday: 1, from: "17:00", to: "20:00" }, { id: "av2", teacherId: "u2", centerId: "c1", weekday: 3, from: "17:00", to: "20:00" }, { id: "av3", teacherId: "u2", centerId: "c1", weekday: 6, from: "09:00", to: "13:00" },
    { id: "av4", teacherId: "u3", centerId: "c1", weekday: 2, from: "17:30", to: "20:00" }, { id: "av5", teacherId: "u3", centerId: "c1", weekday: 4, from: "17:30", to: "20:00" },
    { id: "av6", teacherId: "u5", centerId: "c2", weekday: 2, from: "17:00", to: "20:00" }, { id: "av7", teacherId: "u5", centerId: "c2", weekday: 4, from: "17:00", to: "20:00" }
  ];
  const exceptions = [{ id: "ex1", teacherId: "u3", date: d(6).slice(0, 10), note: "отпуск" }];
  const availabilityConfirmed = { u2: d(25).slice(0, 10), u3: d(-2).slice(0, 10), u5: d(20).slice(0, 10) };
  const rooms = [{ id: "r1", centerId: "c1", name: "Зала 1" }, { id: "r2", centerId: "c1", name: "Зала 2" }, { id: "r3", centerId: "c2", name: "Зала A" }];
  window.SEED = { seedVersion: 20, royalties, catalog, orders, stockMoves, partners, availability, exceptions, availabilityConfirmed, rooms, centers, users, programs, packages, groups, families, children, enrollments, payments, charges, lessons, attendance, leads, templates, homeworks, sessions, events, GAME_NAMES, SKILLS };
})();
