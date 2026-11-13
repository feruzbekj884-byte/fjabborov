/* Sayt maʼlumotlari /api/data dan olinadi (admin panelda tahrirlanadi). */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => Number(v) || 0;
const fmt = (n) => num(n).toLocaleString("ru-RU").replace(/[ ,]/g, " ");
const icon = (v) => esc(String(v || "fa-circle").replace(/[^a-z0-9- ]/gi, ""));
const safeUrl = (u) => (/^(https?:|mailto:|tel:)/i.test(String(u || "").trim()) ? String(u).trim() : "#");
const stat = (v, l) => `<div class="stat reveal"><b>${esc(v)}</b><span>${esc(l)}</span></div>`;
const arr = (v) => (Array.isArray(v) ? v : []);
const EMPTY = "Hozirça maʼlumot kiritilmagan.";
const emptyNote = `<p class="note">${EMPTY}</p>`;

// Rasm uslublari alohida faylda (asosiy style.css oʻzgarmaydi)
document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="/css/photos.css">');

const DAYS = ["yakşanba", "duşanba", "seşanba", "çorşanba", "payşanba", "juma", "şanba"];
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

function bindTabs(name, onChange) {
  const box = $(`[data-tabs="${name}"]`);
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".tab");
    if (!b) return;
    $$(".tab", box).forEach((t) => t.classList.toggle("active", t === b));
    onChange(b.dataset.tab);
  });
}
function bindChips(container, attr, onChange) {
  container.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    $$(".chip", container).forEach((x) => x.classList.toggle("active", x === c));
    onChange(c.dataset[attr]);
  });
}

function initNav() {
  $("#burger").addEventListener("click", () => $("#menu").classList.toggle("open"));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => $("#menu").classList.remove("open")));
  const links = $$("#menu a");
  let ticking = false;
  const update = () => {
    ticking = false;
    $("#toTop").classList.toggle("show", scrollY > 600);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  const spy = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id], footer[id]").forEach((s) => spy.observe(s));
  $("#toTop").addEventListener("click", () => scrollTo({ top: 0 }));
}

function render(D) {
  const S = D.site || {};
  $$("[data-bind]").forEach((el) => { el.textContent = S[el.dataset.bind] ?? ""; });
  $("#avatar").textContent = String(S.author || "").split(/[\s.]+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (S.photo) $("#avatar").innerHTML = `<img src="${esc(S.photo)}" alt="${esc(S.author)}" width="56" height="56">`;
  if (S.author) document.title = `${S.author} | Taʼlim portali`;

  const NA = D.newAssessment || {};
  $("#naStats").innerHTML = arr(NA.stats).map((s) => stat(s.value, s.label)).join("");
  $("#naCards").innerHTML = arr(NA.cards).map((c) => `
    <div class="card reveal"><div class="ic"><i class="fa-solid ${icon(c.icon)}"></i></div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("");

  $("#dirCards").innerHTML = arr(D.directions).map((d) => `
    <div class="card reveal"><div class="ic"><i class="fa-solid ${icon(d.icon)}"></i></div><span class="tag">${esc(d.tag)}</span><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div>`).join("");

  const O = D.official || {};
  $("#cntOly").textContent = arr(O.olympiads).length;
  $("#cntCon").textContent = arr(O.contests).length;
  const renderOfficial = (k) => {
    const list = arr(O[k]);
    $("#officialList").innerHTML = list.map((x) => `<li>${esc(typeof x === "object" ? x.name : x)}</li>`).join("");
    $("#officialSource").textContent = list.length ? O.source || "" : EMPTY;
  };
  renderOfficial("olympiads");
  bindTabs("official", renderOfficial);

  renderWinners(arr(D.winners));
  renderResults(S.resultsUrl);
  renderSchedule(D.schedule || {});
  renderUniversity(D.university || {});
  renderChsb(D.chsb || {});
  renderQuarter(D.quarter || {});
  renderAccreditation(D.accreditation || {});

  const C = S.contacts || {};
  $("#socials").innerHTML = [
    ["fa-brands fa-telegram", "Telegram", C.telegram],
    ["fa-brands fa-instagram", "Instagram", C.instagram],
    ["fa-brands fa-facebook", "Facebook", C.facebook],
    ["fa-solid fa-phone", C.phone, C.phone && "tel:" + String(C.phone).replace(/[^\d+]/g, "")],
    ["fa-solid fa-envelope", C.email, C.email && "mailto:" + C.email]
  ].filter(([, t, h]) => t && h).map(([i, t, h]) => `<a href="${esc(safeUrl(h))}" target="_blank" rel="noopener"><i class="${i}"></i>${esc(t)}</a>`).join("");

  initReveal();
}

function photo(src, alt) { return src ? `<img class="ph" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" width="66" height="88">` : ""; }

function renderWinners(W) {
  const st = { mode: "students", subject: "", grade: "", place: "", limit: 8 };
  const subjects = [...new Set(W.map((w) => w.subject).filter(Boolean))].sort();
  const grades = [...new Set(W.map((w) => String(w.grade)).filter(Boolean))].sort((a, b) => a - b);
  $("#winSubject").innerHTML = `<option value="">Barça fanlar</option>` + subjects.map((s) => `<option>${esc(s)}</option>`).join("");
  $("#winGrade").innerHTML = `<option value="">Barça sinflar</option>` + grades.map((g) => `<option value="${esc(g)}">${esc(g)}-sinf</option>`).join("");
  $("#winStats").innerHTML = [
    stat(W.length, "sovrinli örin"),
    stat(new Set(W.map((w) => w.school)).size, "maktab"),
    stat(new Set(W.map((w) => w.teacher).filter(Boolean)).size, "fan öqituvçisi"),
    stat(subjects.length, "fan")
  ].join("");

  const draw = () => {
    let list = W.filter((w) =>
      (!st.subject || w.subject === st.subject) &&
      (!st.grade || String(w.grade) === st.grade) &&
      (!st.place || String(w.place) === st.place));
    let html;
    if (st.mode === "teachers") {
      const map = {};
      list.filter((w) => w.teacher).forEach((w) => {
        const t = (map[w.teacher] ||= { name: w.teacher, school: w.school, subjects: new Set(), count: 0, best: 3, photo: "" });
        if (!t.photo && w.teacherPhoto) t.photo = w.teacherPhoto;
        t.subjects.add(w.subject); t.count++; t.best = Math.min(t.best, num(w.place) || 3);
      });
      list = Object.values(map).sort((a, b) => b.count - a.count);
      html = list.slice(0, st.limit).map((t) => `
        <div class="win">${t.photo ? photo(t.photo, t.name) : ""}<div class="medal p${t.best}">${t.count}</div><div>
          <h4>${esc(t.name)}</h4><p>${esc(t.school)} · ${t.count} ta ğolib tayyorlagan</p>
          <span class="subj">${esc([...t.subjects].join(", "))}</span></div></div>`).join("");
    } else {
      list = [...list].sort((a, b) => num(a.place) - num(b.place));
      html = list.slice(0, st.limit).map((w) => {
        const p = [1, 2, 3].includes(num(w.place)) ? num(w.place) : 3;
        return `
        <div class="win">${photo(w.photo, w.student)}<div class="medal p${p}">${["I", "II", "III"][p - 1]}</div><div>
          <h4>${esc(w.student)}</h4><p>${esc(w.school)}${w.grade ? ` · ${esc(w.grade)}-sinf` : ""}</p>
          ${w.teacher ? `<p class="tch">${w.teacherPhoto ? `<img class="tph" src="${esc(w.teacherPhoto)}" alt="${esc(w.teacher)}" loading="lazy">` : `<i class="fa-solid fa-chalkboard-user"></i>`} Ustozi: ${esc(w.teacher)}</p>` : ""}
          <span class="subj">${esc(w.subject)}</span></div></div>`;
      }).join("");
    }
    $("#winList").innerHTML = html || (W.length ? `<p class="note">Tanlangan filtr böyiça maʼlumot topilmadi.</p>` : emptyNote);
    $("#winMore").classList.toggle("hidden", list.length <= st.limit);
  };
  bindTabs("winners", (m) => { st.mode = m; st.limit = 8; draw(); });
  bindChips($("#winChips"), "place", (p) => { st.place = p; st.limit = 8; draw(); });
  $("#winSubject").addEventListener("change", (e) => { st.subject = e.target.value; st.limit = 8; draw(); });
  $("#winGrade").addEventListener("change", (e) => { st.grade = e.target.value; st.limit = 8; draw(); });
  $("#winMore").addEventListener("click", () => { st.limit += 8; draw(); });
  draw();
}

function renderResults(url) {
  if (url && /^https:\/\//i.test(url)) {
    $("#resultsFrame").innerHTML = `<iframe src="${esc(url)}" loading="lazy" title="Olimpiada natijalari"></iframe>`;
  }
}

function renderSchedule(SC) {
  $("#schTitle").textContent = SC.title || "";
  $("#schPeriod").textContent = SC.period || "";
  $("#schRule").textContent = SC.rule || "";
  const exams = arr(SC.items).map((e) => {
    const s = new Date(`${e.date}T${e.start || "00:00"}:00`), f = new Date(`${e.date}T${e.end || e.start || "00:00"}:00`);
    return { ...e, s, f, mins: Math.max(0, Math.round((f - s) / 60000)) };
  }).filter((e) => !isNaN(e.s)).sort((a, b) => a.s - b.s);

  const st = { grade: "", q: "", day: "" };
  const status = (e, now = new Date()) => now < e.s ? ["upcoming", "Kutilmoqda"] : now <= e.f ? ["live", "Jarayonda"] : ["done", "Yakunlangan"];
  const dayLabel = (d) => `${d.getDate()}-${MONTHS[d.getMonth()]}`;

  const grades = [...new Set(exams.map((e) => String(e.grade)).filter(Boolean))].sort((a, b) => a - b);
  $("#gradeChips").innerHTML = `<button class="chip active" data-grade="">Barça sinflar</button>` + grades.map((g) => `<button class="chip" data-grade="${esc(g)}">${esc(g)}-sinf</button>`).join("");

  const uniqueDays = [...new Set(exams.map((e) => e.date))];
  $("#dateStripTrack").innerHTML = `<button class="date-pill active" data-day=""><b>•</b><span>Barçasi</span></button>` +
    uniqueDays.map((d) => { const x = new Date(d + "T00:00:00"); return `<button class="date-pill" data-day="${esc(d)}"><b>${x.getDate()}</b><span>${MONTHS[x.getMonth()].slice(0, 3)}, ${DAYS[x.getDay()].slice(0, 3)}</span></button>`; }).join("");
  $("#dateStripTrack").addEventListener("click", (e) => {
    const p = e.target.closest(".date-pill"); if (!p) return;
    $$(".date-pill").forEach((x) => x.classList.toggle("active", x === p));
    st.day = p.dataset.day; draw();
  });

  function draw() {
    const q = st.q.toLowerCase();
    const list = exams.filter((e) => (!st.grade || String(e.grade) === st.grade) && (!st.day || e.date === st.day) && String(e.subject || "").toLowerCase().includes(q));
    $("#cardsDeckContainer").innerHTML = list.map((e) => {
      const [cls, txt] = status(e);
      return `<div class="exam ${cls}"><span class="status ${cls}">${txt}</span><h4>${esc(e.subject)}</h4>
        <div class="row"><span>Sana</span><b>${dayLabel(e.s)}, ${DAYS[e.s.getDay()]}</b></div>
        <div class="row"><span>Sinf / smena</span><b>${esc(e.grade)}-sinf, ${esc(e.shift)}-smena</b></div>
        <div class="row"><span>Vaqt</span><b>${esc(e.start)} – ${esc(e.end)}</b></div>
        <div class="row"><span>Savollar / ball</span><b>${esc(e.questions)}</b></div></div>`;
    }).join("") || (exams.length ? `<p class="note">Heç narsa topilmadi.</p>` : emptyNote);
    $("#masterTableBody").innerHTML = list.map((e) => {
      const [cls, txt] = status(e);
      return `<tr><td>${dayLabel(e.s)}</td><td>${DAYS[e.s.getDay()]}</td><td><b>${esc(e.subject)}</b></td><td>${esc(e.shift)}-smena, ${esc(e.grade)}-sinf</td><td>${esc(e.start)} – ${esc(e.end)}</td><td>${e.mins} daqiqa</td><td>${esc(e.questions)}</td><td><span class="status ${cls}">${txt}</span></td></tr>`;
    }).join("") || `<tr><td colspan="8">${exams.length ? "Heç narsa topilmadi." : EMPTY}</td></tr>`;
  }
  bindChips($("#gradeChips"), "grade", (g) => { st.grade = g; draw(); });
  $("#subjectSearchInput").addEventListener("input", (e) => { st.q = e.target.value; draw(); });
  bindTabs("view", (v) => {
    $("#cardsDeckContainer").classList.toggle("hidden", v !== "cards");
    $("#tableDeckContainer").classList.toggle("hidden", v !== "table");
  });
  draw();

  const els = { subj: $("#nextExamSubject"), date: $("#nextExamDate"), time: $("#nextExamTime"), shift: $("#nextExamShift"), label: $("#countdownLabel"), timer: $("#liveCountdownTimer") };
  let lastKey = "";
  function tick() {
    const now = new Date();
    const live = exams.find((e) => now >= e.s && now <= e.f);
    const next = live || exams.find((e) => e.s > now);
    if (!next) {
      if (lastKey !== "end") {
        lastKey = "end";
        els.subj.textContent = exams.length ? "Barça imtihonlar yakunlandi" : "Imtihonlar rejalaştirilmagan";
        els.date.textContent = SC.period || "—"; els.time.textContent = "—"; els.shift.textContent = "—";
        els.label.textContent = "Holat"; els.timer.textContent = exams.length ? "Yakunlangan" : "—";
      }
      return;
    }
    const key = next.date + next.start + next.subject + !!live;
    if (key !== lastKey) {
      lastKey = key;
      els.subj.textContent = next.subject;
      els.date.textContent = `${dayLabel(next.s)}, ${DAYS[next.s.getDay()]}`;
      els.time.textContent = `${next.start} – ${next.end}`;
      els.shift.textContent = `${next.grade}-sinf, ${next.shift}-smena`;
      els.label.textContent = live ? "Tugaşiga" : "Boşlanişiga";
      draw();
    }
    const diff = Math.max(0, (live ? next.f : next.s) - now);
    const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    els.timer.textContent = (d ? `${d} kun ` : "") + [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
  }
  tick();
  let timer = setInterval(tick, 1000);
  document.addEventListener("visibilitychange", () => {
    clearInterval(timer);
    if (!document.hidden) { tick(); timer = setInterval(tick, 1000); }
  });
}

function renderUniversity(U) {
  $("#otmCards").innerHTML = arr(U.cards).map((c) => `
    <div class="card reveal"><div class="ic"><i class="fa-solid ${icon(c.icon)}"></i></div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("");
  const adm = arr(U.admissions), types = arr(U.types);
  $(".charts").classList.toggle("hidden", !adm.length && !types.length);
  if (!adm.length && !types.length) return;
  const io = new IntersectionObserver((ents, obs) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    obs.disconnect();
    if (!window.Chart) return;
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = "#64748b";
    new Chart($("#chartAdmit"), {
      type: "bar",
      data: { labels: adm.map((a) => a.year), datasets: [
        { label: "Grant", data: adm.map((a) => num(a.grant)), backgroundColor: "#2563eb", borderRadius: 8 },
        { label: "Şartnoma", data: adm.map((a) => num(a.contract)), backgroundColor: "#0ea5e9", borderRadius: 8 }
      ] },
      options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true, grid: { color: "#e2e8f0" } }, x: { grid: { display: false } } } }
    });
    new Chart($("#chartTypes"), {
      type: "doughnut",
      data: { labels: types.map((t) => t.label), datasets: [{ data: types.map((t) => num(t.value)), backgroundColor: ["#2563eb", "#f59e0b", "#0ea5e9", "#16a34a", "#dc2626", "#7c3aed"], borderWidth: 0 }] },
      options: { responsive: true, cutout: "62%", plugins: { legend: { position: "bottom" } } }
    });
  }, { rootMargin: "200px" });
  io.observe($("#otm"));
}

function renderChsb(C) {
  $("#chsbIntro").textContent = C.intro || "";
  $("#chsbStats").innerHTML = arr(C.stats).map((s) => stat(s.value, s.label)).join("");
  $("#tab-jadval").innerHTML = arr(C.schedule).map((r) => `
    <div class="tl reveal"><div class="g">${esc(r.grade)}</div><div><h4>${esc(r.subjects)}</h4>
    <p><i class="fa-regular fa-calendar"></i> ${esc(r.date)} · Format: onlayn</p></div></div>`).join("") || emptyNote;
  const schools = arr(C.schools).map((s, i) => ({ ...s, n: i + 1 }));
  const draw = (q = "") => {
    q = q.toLowerCase();
    const rows = schools.filter((s) => (String(s.name) + String(s.address)).toLowerCase().includes(q));
    $("#schoolsTableBody").innerHTML = rows.map((s) => `<tr><td>${s.n}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.address)}</td><td>${esc(s.classes)}</td></tr>`).join("");
    $("#noSchoolMatch").textContent = schools.length ? "Heç narsa topilmadi." : EMPTY;
    $("#noSchoolMatch").classList.toggle("hidden", rows.length > 0);
  };
  draw();
  $("#schoolSearchInput").addEventListener("input", (e) => draw(e.target.value));
  bindTabs("chsb", (t) => {
    $("#tab-jadval").classList.toggle("hidden", t !== "jadval");
    $("#tab-maktablar").classList.toggle("hidden", t !== "maktablar");
  });
}

function renderQuarter(Q) {
  const pct = (a, b, c) => (num(c) ? Math.round(((num(a) + num(b)) / num(c)) * 100) : 0);
  const quality = pct(Q.excellent, Q.good, Q.graded);
  $("#qFormula").innerHTML = `
    <span class="op">(</span><span class="term">Aʼlo (5) <b>${fmt(Q.excellent)}</b> nafar</span><span class="op">+</span>
    <span class="term">Yaxşi (4) <b>${fmt(Q.good)}</b> nafar</span><span class="op">)</span><span class="op">÷</span>
    <span class="term">Baho olganlar <b>${fmt(Q.graded)}</b> nafar</span><span class="op">=</span>
    <span class="res">${quality}% bilim sifati</span>`;
  $("#qStats").innerHTML = [
    stat(fmt(Q.graded), "barça fanlardan baho olgan öquvçi"),
    stat(quality + "%", "tuman böyiça bilim sifati"),
    stat(num(Q.mastery) + "%", "özlaştiriş körsatkiçi"),
    stat(num(Q.failed), "muvaffaqiyatsiz öquvçi")
  ].join("");
  $("#qTable").innerHTML = arr(Q.schools)
    .map((s) => ({ ...s, q: Math.min(100, pct(s.excellent, s.good, s.graded)) }))
    .sort((a, b) => b.q - a.q)
    .map((s, i) => {
      const col = s.q >= 70 ? "#16a34a" : s.q >= 50 ? "#d97706" : "#dc2626";
      return `<tr><td>${i + 1}</td><td><b>${esc(s.name)}</b></td><td>${num(s.excellent)}</td><td>${num(s.good)}</td><td>${num(s.graded)}</td>
        <td><div class="q-cell"><div class="bar"><i style="width:${s.q}%;background:${col}"></i></div><span style="color:${col}">${s.q}%</span></div></td></tr>`;
    }).join("") || `<tr><td colspan="6">${EMPTY}</td></tr>`;
}

function renderAccreditation(A) {
  const orgs = arr(A.orgs).map((o, i) => ({ ...o, n: i + 1 }));
  const experts = arr(A.experts).map((e, i) => ({ ...e, n: i + 1 }));
  const schCount = orgs.filter((o) => o.type === "sch").length;
  $("#accIntro").textContent = A.intro || "";
  $("#accStats").innerHTML = [
    stat(orgs.length + " ta", "taşkilot rejasi"),
    stat(schCount + " ta", "maktab"),
    stat(orgs.length - schCount + " ta", "DMTT (boğça)"),
    stat(experts.length + " nafar", "ekspertlar")
  ].join("");
  const drawOrgs = (q = "") => {
    q = q.toLowerCase();
    $("#orgsBody").innerHTML = orgs.filter((o) => (String(o.name) + String(o.head)).toLowerCase().includes(q))
      .map((o) => `<tr><td>${o.n}</td><td><b>${esc(o.name)}</b></td><td>${esc(o.head)}</td><td>${esc(o.internal)}</td><td><span class="status upcoming">${esc(o.external)}</span></td></tr>`).join("")
      || `<tr><td colspan="5">${orgs.length ? "Heç narsa topilmadi." : EMPTY}</td></tr>`;
  };
  const ex = { type: "", q: "" };
  const drawExperts = () => {
    const q = ex.q.toLowerCase();
    $("#expertsBody").innerHTML = experts.filter((e) => (!ex.type || e.type === ex.type) && (String(e.name) + String(e.workplace) + String(e.subject)).toLowerCase().includes(q))
      .map((e) => `<tr><td>${e.n}</td><td><b>${esc(e.name)}</b></td><td>${esc(e.workplace)}</td><td>${esc(e.subject)}</td></tr>`).join("")
      || `<tr><td colspan="4">${experts.length ? "Heç narsa topilmadi." : EMPTY}</td></tr>`;
  };
  $("#eAll").textContent = experts.length;
  $("#eSch").textContent = experts.filter((e) => e.type === "sch").length;
  $("#eMtt").textContent = experts.filter((e) => e.type === "mtt").length;
  drawOrgs(); drawExperts();
  $("#orgSearch").addEventListener("input", (e) => drawOrgs(e.target.value));
  $("#expSearch").addEventListener("input", (e) => { ex.q = e.target.value; drawExperts(); });
  bindChips($("#tab-ekspert .chips"), "exp", (t) => { ex.type = t; drawExperts(); });
  bindTabs("acc", (t) => {
    $("#tab-reja").classList.toggle("hidden", t !== "reja");
    $("#tab-ekspert").classList.toggle("hidden", t !== "ekspert");
  });
}

function initReveal() {
  const items = $$(".reveal:not(.in)");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
}

async function loadData() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch("/api/data", { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch { /* qayta urinamiz */ }
  }
  throw new Error("Maʼlumotlarni yuklab bölmadi");
}

initNav();
loadData()
  .then(render)
  .catch((e) => {
    console.error(e);
    document.body.insertAdjacentHTML("afterbegin", `<div class="load-error">Maʼlumotlarni yuklaşda xatolik. Sahifani yangilang.</div>`);
  })
  .finally(() => document.documentElement.classList.add("ready"));
