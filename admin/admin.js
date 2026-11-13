/* ADMIN PANEL — sayt ma'lumotlarini tahrirlash */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

document.head.insertAdjacentHTML("beforeend", '<link rel="stylesheet" href="/admin/photos.css">');

const F = {
  text: (key, label, extra = {}) => ({ key, label, type: "text", ...extra }),
  area: (key, label, extra = {}) => ({ key, label, type: "textarea", ...extra }),
  num: (key, label, extra = {}) => ({ key, label, type: "number", ...extra }),
  date: (key, label) => ({ key, label, type: "date" }),
  time: (key, label) => ({ key, label, type: "time" }),
  url: (key, label) => ({ key, label, type: "url" }),
  sel: (key, label, options) => ({ key, label, type: "select", options }),
  photo: (key, label) => ({ key, label, type: "photo" })
};
const ICON_HINT = "Font Awesome ikon nomi, masalan: fa-trophy, fa-chart-line (fontawesome.com/icons)";
const ORG_TYPES = [["sch", "Maktab"], ["mtt", "DMTT"]];

const SECTIONS = [
  { id: "site", title: "Umumiy ma'lumotlar", icon: "fa-house", blocks: [
    { type: "object", path: "site", title: "Sayt va muallif", fields: [
      F.text("author", "Muallif (F.I.Sh.)"), F.text("position", "Lavozimi"), F.text("district", "Tuman nomi"),
      F.text("year", "O'quv yili"), F.text("motto", "Shior"), F.area("about", "Sayt haqida (footer)", { wide: true }),
      F.url("resultsUrl", "Olimpiada natijalari havolasi (Google Sheets, https://...)")] },
    { type: "object", path: "site.contacts", title: "Aloqa va ijtimoiy tarmoqlar", fields: [
      F.url("telegram", "Telegram havola"), F.url("instagram", "Instagram havola"), F.url("facebook", "Facebook havola"),
      F.text("phone", "Telefon"), F.text("email", "Email")] }
  ] },
  { id: "newAssessment", title: "Yangi baholash", icon: "fa-star", blocks: [
    { type: "list", path: "newAssessment.stats", title: "Raqamlar", fields: [F.text("value", "Qiymat"), F.text("label", "Izoh")] },
    { type: "list", path: "newAssessment.cards", title: "Kartalar", fields: [F.text("icon", "Ikon", { hint: ICON_HINT }), F.text("title", "Sarlavha"), F.area("text", "Matn")] }
  ] },
  { id: "directions", title: "Asosiy yo'nalishlar", icon: "fa-compass", blocks: [
    { type: "list", path: "directions", title: "Yo'nalishlar", fields: [F.text("tag", "Teg"), F.text("icon", "Ikon", { hint: ICON_HINT }), F.text("title", "Sarlavha"), F.area("text", "Matn")] }
  ] },
  { id: "official", title: "Olimpiadalar ro'yxati", icon: "fa-list-check", blocks: [
    { type: "object", path: "official", title: "Manba", fields: [F.area("source", "Manba (izoh)", { wide: true })] },
    { type: "strings", path: "official.olympiads", title: "Fan olimpiadalari", label: "Nomi" },
    { type: "strings", path: "official.contests", title: "Ko'rik-tanlov va musobaqalar", label: "Nomi" }
  ] },
  { id: "winners", title: "G'oliblar va ustozlar", icon: "fa-trophy", blocks: [
    { type: "list", path: "winners", title: "G'olib o'quvchilar", fields: [
      F.text("student", "O'quvchi F.I.Sh."), F.photo("photo", "O'quvchi rasmi"), F.text("school", "Maktab"), F.text("subject", "Fan"),
      F.num("grade", "Sinf"), F.sel("place", "O'rin", [[1, "I o'rin"], [2, "II o'rin"], [3, "III o'rin"]]), F.text("teacher", "Ustoz F.I.Sh."), F.photo("teacherPhoto", "Ustoz rasmi")] }
  ] },
  { id: "schedule", title: "Olimpiada grafigi", icon: "fa-calendar-days", blocks: [
    { type: "object", path: "schedule", title: "Umumiy", fields: [F.text("title", "Sarlavha"), F.text("period", "Muddat (matn)"), F.area("rule", "Nizom", { wide: true })] },
    { type: "list", path: "schedule.items", title: "Imtihonlar", fields: [
      F.date("date", "Sana"), F.text("subject", "Fan"), F.num("grade", "Sinf"), F.num("shift", "Smena"),
      F.time("start", "Boshlanish"), F.time("end", "Tugash"), F.text("questions", "Savollar / ball")] }
  ] },
  { id: "university", title: "OTM tahlili", icon: "fa-graduation-cap", blocks: [
    { type: "list", path: "university.cards", title: "Kartalar", fields: [F.text("icon", "Ikon", { hint: ICON_HINT }), F.text("title", "Sarlavha"), F.area("text", "Matn")] },
    { type: "list", path: "university.admissions", title: "Grant va shartnoma (diagramma)", fields: [F.text("year", "Yil"), F.num("grant", "Grant"), F.num("contract", "Shartnoma")] },
    { type: "list", path: "university.types", title: "OTM turlari (%)", fields: [F.text("label", "Turi"), F.num("value", "Foiz")] }
  ] },
  { id: "chsb", title: "Onlayn ChSB", icon: "fa-laptop-code", blocks: [
    { type: "object", path: "chsb", title: "Kirish matni", fields: [F.area("intro", "Matn", { wide: true })] },
    { type: "list", path: "chsb.stats", title: "Raqamlar", fields: [F.text("value", "Qiymat"), F.text("label", "Izoh")] },
    { type: "list", path: "chsb.schedule", title: "Sinov jadvali", fields: [F.text("grade", "Sinf"), F.text("date", "Sana"), F.text("subjects", "Fanlar")] },
    { type: "list", path: "chsb.schools", title: "Maktablar ro'yxati", fields: [F.text("name", "Maktab nomi"), F.text("address", "Manzil"), F.num("classes", "Sinflar soni")] }
  ] },
  { id: "quarter", title: "Chorak tahlili", icon: "fa-chart-pie", blocks: [
    { type: "object", path: "quarter", title: "Tuman bo'yicha jami", fields: [
      F.num("excellent", "A'lo (5) olganlar"), F.num("good", "Yaxshi (4) olganlar"), F.num("graded", "Baho olganlar"),
      F.num("mastery", "O'zlashtirish (%)"), F.num("failed", "Muvaffaqiyatsiz o'quvchilar")] },
    { type: "list", path: "quarter.schools", title: "Maktablar kesimida", fields: [F.text("name", "Maktab"), F.num("excellent", "A'lo (5)"), F.num("good", "Yaxshi (4)"), F.num("graded", "Baho olganlar")] }
  ] },
  { id: "accreditation", title: "Akkreditatsiya", icon: "fa-file-signature", blocks: [
    { type: "object", path: "accreditation", title: "Kirish matni", fields: [F.area("intro", "Matn", { wide: true })] },
    { type: "list", path: "accreditation.orgs", title: "Tashkilotlar rejasi", fields: [
      F.text("name", "Tashkilot nomi"), F.text("head", "Rahbar F.I.Sh."), F.sel("type", "Turi", ORG_TYPES), F.text("internal", "Ichki baholash"), F.text("external", "Tashqi baholash")] },
    { type: "list", path: "accreditation.experts", title: "Ekspertlar", fields: [
      F.text("name", "F.I.Sh."), F.sel("type", "Turi", ORG_TYPES), F.text("workplace", "Ish joyi"), F.text("subject", "Yo'nalish / fan")] }
  ] },
  { id: "users", title: "Foydalanuvchilar", icon: "fa-users", adminOnly: true, custom: renderUsers },
  { id: "backup", title: "Zaxira nusxa", icon: "fa-box-archive", custom: renderBackup }
];

let DATA = null;
let ME = null;
let dirty = false;
let current = "site";

function ensurePath(obj, path, init) {
  const keys = path.split(".");
  let o = obj;
  keys.forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== "object") o[k] = i === keys.length - 1 ? init : {};
    o = o[k];
  });
  return o;
}

async function api(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...opts,
    headers: { ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(opts.headers || {}) }
  });
  let body = {};
  try { body = await r.json(); } catch { /* bo'sh javob */ }
  if (r.status === 401 && !url.includes("/api/auth")) { showLogin(); throw new Error(body.error || "Sessiya tugadi, qayta kiring"); }
  if (!r.ok) throw new Error(body.error || `Xatolik (${r.status})`);
  return body;
}

let toastTimer;
function toast(msg, err = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("err", err);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), err ? 5000 : 2500);
}

function setDirty(v) {
  dirty = v;
  $("#saveBtn").disabled = !v;
  const s = $("#saveState");
  s.textContent = v ? "Saqlanmagan o'zgarishlar bor" : DATA?.updatedAt ? "Saqlangan: " + new Date(DATA.updatedAt).toLocaleString("uz-UZ") : "";
  s.classList.toggle("dirty", v);
}
addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

async function save() {
  const btn = $("#saveBtn");
  btn.disabled = true;
  btn.querySelector("span").textContent = "Saqlanmoqda...";
  try {
    const r = await api("/api/data", { method: "PUT", body: JSON.stringify(DATA) });
    DATA.updatedAt = r.updatedAt;
    setDirty(false);
    toast("Saqlandi! Saytda darhol ko'rinadi.");
  } catch (e) {
    toast(e.message, true);
    btn.disabled = false;
  } finally {
    btn.querySelector("span").textContent = "Saqlash";
  }
}
$("#saveBtn").addEventListener("click", save);
addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (dirty) save(); }
});

function showLogin() {
  $("#appView").classList.add("hidden");
  $("#loginView").classList.remove("hidden");
  setTimeout(() => $("#loginForm [name=username]").focus(), 50);
}
$(".pw-toggle").addEventListener("click", () => {
  const i = $("#loginForm [name=password]");
  i.type = i.type === "password" ? "text" : "password";
});
$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  $("#loginError").textContent = "";
  $("#loginBtn").disabled = true;
  try {
    const r = await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "login", username: f.get("username"), password: f.get("password") }) });
    ME = r.user;
    e.target.reset();
    await startApp();
  } catch (err) {
    $("#loginError").textContent = err.message;
  } finally {
    $("#loginBtn").disabled = false;
  }
});
$("#logoutBtn").addEventListener("click", async () => {
  if (dirty && !confirm("Saqlanmagan o'zgarishlar yo'qoladi. Chiqasizmi?")) return;
  await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "logout" }) }).catch(() => {});
  dirty = false;
  ME = null;
  showLogin();
});

async function startApp() {
  DATA = await api("/api/data");
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
  $("#whoami").textContent = `${ME.username} · ${ME.role === "admin" ? "admin" : "muharrir"}`;
  renderNav();
  const fromHash = location.hash.slice(1);
  openSection(SECTIONS.some((s) => s.id === fromHash && visible(s)) ? fromHash : "site");
  setDirty(false);
}
const visible = (s) => !s.adminOnly || ME?.role === "admin";

function renderNav() {
  $("#sideNav").innerHTML = SECTIONS.filter(visible).map((s) =>
    `<button class="nav-item" data-id="${s.id}"><i class="fa-solid ${s.icon}"></i>${esc(s.title)}</button>`).join("");
}
$("#sideNav").addEventListener("click", (e) => {
  const b = e.target.closest(".nav-item");
  if (b) openSection(b.dataset.id);
});
$("#menuBtn").addEventListener("click", () => { $("#side").classList.add("open"); $("#backdrop").classList.add("show"); });
$("#backdrop").addEventListener("click", closeSide);
function closeSide() { $("#side").classList.remove("open"); $("#backdrop").classList.remove("show"); }

function openSection(id) {
  const sec = SECTIONS.find((s) => s.id === id);
  current = id;
  history.replaceState(null, "", "#" + id);
  $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.id === id));
  $("#pageTitle").textContent = sec.title;
  const c = $("#content");
  c.innerHTML = "";
  if (sec.custom) sec.custom(c);
  else sec.blocks.forEach((b) => c.appendChild(b.type === "object" ? objectBlock(b) : listBlock(b)));
  closeSide();
  scrollTo({ top: 0 });
}

/* Rasmni brauzerda 300x400 gacha kichraytirib, JPEG qilib serverga yuklaydi */
function resizeToJpeg(file, maxW = 300, maxH = 400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const g = c.getContext("2d");
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Rasmni o'qib bo'lmadi")); };
    img.src = url;
  });
}

function photoInput(f, value, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "photo-cell";
  const img = document.createElement("img");
  img.alt = f.label;
  const label = document.createElement("label");
  label.className = "btn sm photo-up";
  label.innerHTML = '<i class="fa-solid fa-camera"></i>';
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.setAttribute("aria-label", f.label);
  label.appendChild(file);
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "icon-btn del";
  clear.title = "Rasmni olib tashlash";
  clear.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  const show = (v) => {
    img.src = v || "";
    wrap.classList.toggle("has", !!v);
  };
  show(value);
  file.addEventListener("change", async () => {
    const fl = file.files[0];
    file.value = "";
    if (!fl) return;
    wrap.classList.add("busy");
    try {
      const data = await resizeToJpeg(fl);
      const r = await api("/api/upload", { method: "POST", body: JSON.stringify({ data }) });
      onChange(r.url);
      show(r.url);
      setDirty(true);
    } catch (e) {
      toast(e.message || "Rasm yuklanmadi", true);
    } finally {
      wrap.classList.remove("busy");
    }
  });
  clear.addEventListener("click", () => { onChange(""); show(""); setDirty(true); });
  wrap.append(img, label, clear);
  return wrap;
}

function fieldInput(f, value, onChange) {
  if (f.type === "photo") return photoInput(f, value, onChange);
  let el;
  if (f.type === "textarea") {
    el = document.createElement("textarea");
    el.value = value ?? "";
  } else if (f.type === "select") {
    el = document.createElement("select");
    el.innerHTML = f.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
    el.value = value ?? f.options[0][0];
  } else {
    el = document.createElement("input");
    el.type = f.type === "url" ? "url" : f.type;
    if (f.type === "number") el.step = "any";
    el.value = value ?? "";
  }
  if (f.hint) el.title = f.hint;
  el.setAttribute("aria-label", f.label);
  el.addEventListener("input", () => {
    let v = el.value;
    if (f.type === "number") v = v === "" ? "" : Number(v);
    if (f.type === "select" && f.options.every(([o]) => typeof o === "number")) v = Number(v);
    onChange(v);
    setDirty(true);
  });
  return el;
}

function objectBlock(b) {
  const obj = ensurePath(DATA, b.path, {});
  const box = document.createElement("section");
  box.className = "block";
  box.innerHTML = `<div class="block-head"><h3>${esc(b.title)}</h3></div><div class="block-body"><div class="grid-fields"></div></div>`;
  const grid = $(".grid-fields", box);
  b.fields.forEach((f) => {
    const lab = document.createElement("label");
    if (f.wide || f.type === "textarea") lab.className = "wide";
    lab.textContent = f.label;
    lab.appendChild(fieldInput(f, obj[f.key], (v) => { obj[f.key] = v; }));
    grid.appendChild(lab);
  });
  return box;
}

function listBlock(b) {
  const isStrings = b.type === "strings";
  const fields = isStrings ? [F.text("_", b.label || "Qiymat")] : b.fields;
  const list = ensurePath(DATA, b.path, []);
  const box = document.createElement("section");
  box.className = "block";
  box.innerHTML = `
    <div class="block-head">
      <h3>${esc(b.title)} <span class="count"></span></h3>
      <div class="tools">
        <input type="search" placeholder="Qidirish..." class="q">
        <button class="btn sm paste-toggle" type="button"><i class="fa-solid fa-paste"></i> Excel'dan qo'yish</button>
        <button class="btn sm btn-primary add" type="button"><i class="fa-solid fa-plus"></i> Qo'shish</button>
      </div>
    </div>
    <div class="paste-box hidden">
      <span class="muted">Excel yoki Google Sheets'dan qatorlarni nusxalab shu yerga qo'ying. Ustunlar tartibi: <b>${fields.filter((f) => f.type !== "photo").map((f) => esc(f.label)).join(" | ")}</b></span>
      <textarea placeholder="Ctrl+V"></textarea>
      <div class="row"><button class="btn sm btn-primary do-append" type="button">Oxiriga qo'shish</button><button class="btn sm btn-danger do-replace" type="button">Hammasini almashtirish</button></div>
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>№</th>${fields.map((f) => `<th>${esc(f.label)}</th>`).join("")}<th></th></tr></thead><tbody></tbody></table></div>`;
  const tbody = $("tbody", box);
  const q = $(".q", box);

  const blankItem = () => {
    if (isStrings) return "";
    const o = {};
    fields.forEach((f) => { o[f.key] = f.type === "select" ? f.options[0][0] : ""; });
    return o;
  };

  function draw() {
    $(".count", box).textContent = `(${list.length})`;
    tbody.innerHTML = "";
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="${fields.length + 2}" class="empty">Hozircha bo'sh. "Qo'shish" tugmasini bosing.</td></tr>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="n">${i + 1}</td>`;
      fields.forEach((f) => {
        const td = document.createElement("td");
        const val = isStrings ? (typeof item === "object" ? item?.name : item) : item?.[f.key];
        td.appendChild(fieldInput(f, val, (v) => {
          if (isStrings) list[i] = v;
          else list[i][f.key] = v;
        }));
        tr.appendChild(td);
      });
      const act = document.createElement("td");
      act.className = "act";
      act.innerHTML = `
        <button class="icon-btn" data-a="up" title="Yuqoriga" ${i === 0 ? "disabled" : ""}><i class="fa-solid fa-arrow-up"></i></button>
        <button class="icon-btn" data-a="down" title="Pastga" ${i === list.length - 1 ? "disabled" : ""}><i class="fa-solid fa-arrow-down"></i></button>
        <button class="icon-btn" data-a="copy" title="Nusxa"><i class="fa-regular fa-copy"></i></button>
        <button class="icon-btn del" data-a="del" title="O'chirish"><i class="fa-solid fa-trash"></i></button>`;
      act.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const a = btn.dataset.a;
        if (a === "del") {
          if (!confirm("Ushbu qatorni o'chirasizmi?")) return;
          list.splice(i, 1);
        } else if (a === "up" && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
        else if (a === "down" && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
        else if (a === "copy") list.splice(i + 1, 0, JSON.parse(JSON.stringify(item)));
        setDirty(true);
        draw();
      });
      tr.appendChild(act);
      tr.dataset.row = "1";
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
    filter();
  }
  function filter() {
    const v = q.value.trim().toLowerCase();
    $$("tr", tbody).forEach((tr, i) => {
      if (!tr.dataset.row) return;
      const cur = JSON.stringify(list[i] ?? "").toLowerCase();
      tr.classList.toggle("filtered", !!v && !cur.includes(v));
    });
  }
  q.addEventListener("input", filter);

  $(".add", box).addEventListener("click", () => {
    list.push(blankItem());
    setDirty(true);
    q.value = "";
    draw();
    const last = tbody.lastElementChild;
    last?.scrollIntoView({ block: "center" });
    last?.querySelector("input, textarea, select")?.focus();
  });

  const pasteBox = $(".paste-box", box);
  $(".paste-toggle", box).addEventListener("click", () => pasteBox.classList.toggle("hidden"));
  const parsePaste = () => $("textarea", pasteBox).value.split(/\r?\n/).filter((l) => l.trim()).map((line) => {
    const cols = line.split("\t");
    if (isStrings) return cols[0].trim();
    const o = blankItem();
    fields.filter((f) => f.type !== "photo").forEach((f, k) => {
      let v = (cols[k] ?? "").trim();
      if (f.type === "number") v = v === "" ? "" : Number(v.replace(",", ".")) || 0;
      if (f.type === "select") {
        const opt = f.options.find(([ov, ol]) => String(ov) === v || ol.toLowerCase() === v.toLowerCase());
        v = opt ? opt[0] : f.options[0][0];
      }
      o[f.key] = v;
    });
    return o;
  });
  const applyPaste = (replace) => {
    const rows = parsePaste();
    if (!rows.length) return toast("Qo'yish uchun ma'lumot yo'q", true);
    if (replace && !confirm(`Mavjud ${list.length} ta qator o'chirilib, ${rows.length} ta yangi qator qo'yiladi. Davom etasizmi?`)) return;
    if (replace) list.splice(0, list.length);
    list.push(...rows);
    $("textarea", pasteBox).value = "";
    pasteBox.classList.add("hidden");
    setDirty(true);
    draw();
    toast(`${rows.length} ta qator qo'shildi. "Saqlash"ni bosing.`);
  };
  $(".do-append", pasteBox).addEventListener("click", () => applyPaste(false));
  $(".do-replace", pasteBox).addEventListener("click", () => applyPaste(true));

  draw();
  return box;
}

async function renderUsers(c) {
  c.innerHTML = `
    <section class="block">
      <div class="block-head"><h3>Yangi foydalanuvchi qo'shish / parolni almashtirish</h3></div>
      <form class="block-body grid-fields" id="userForm" autocomplete="off">
        <label>Login<input name="username" required pattern="[a-zA-Z0-9_.\\-]{3,32}" placeholder="masalan: aziz"></label>
        <label>Ismi<input name="name" placeholder="F.I.Sh."></label>
        <label>Parol<input name="password" type="text" minlength="8" placeholder="kamida 8 belgi"></label>
        <label>Roli<select name="role"><option value="editor">Muharrir — faqat ma'lumot qo'shadi</option><option value="admin">Admin — foydalanuvchilarni ham boshqaradi</option></select></label>
        <div class="wide"><button class="btn btn-primary" type="submit"><i class="fa-solid fa-user-plus"></i> Saqlash</button></div>
      </form>
      <p class="hint">Mavjud login yozilsa — roli yangilanadi, parol kiritilgan bo'lsa almashtiriladi.</p>
    </section>
    <section class="block">
      <div class="block-head"><h3>Foydalanuvchilar</h3></div>
      <div class="tbl-wrap"><table><thead><tr><th>Login</th><th>Ismi</th><th>Roli</th><th></th></tr></thead><tbody id="usersBody"><tr><td colspan="4" class="empty">Yuklanmoqda...</td></tr></tbody></table></div>
    </section>`;
  const load = async () => {
    try {
      const { users } = await api("/api/users");
      $("#usersBody").innerHTML = users.map((u) => `
        <tr><td><b>${esc(u.username)}</b></td><td>${esc(u.name || "")}</td>
        <td><span class="badge ${u.role === "editor" ? "editor" : ""}">${u.super ? "bosh admin" : u.role === "admin" ? "admin" : "muharrir"}</span></td>
        <td class="act">${u.super ? "" : `<button class="icon-btn del" data-u="${esc(u.username)}" title="O'chirish"><i class="fa-solid fa-trash"></i></button>`}</td></tr>`).join("");
    } catch (e) { toast(e.message, true); }
  };
  $("#usersBody").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-u]");
    if (!b || !confirm(`"${b.dataset.u}" foydalanuvchisini o'chirasizmi?`)) return;
    try {
      await api("/api/users", { method: "DELETE", body: JSON.stringify({ username: b.dataset.u }) });
      toast("O'chirildi");
      load();
    } catch (err) { toast(err.message, true); }
  });
  $("#userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(f) });
      e.target.reset();
      toast("Foydalanuvchi saqlandi");
      load();
    } catch (err) { toast(err.message, true); }
  });
  load();
}

function renderBackup(c) {
  c.innerHTML = `
    <section class="block">
      <div class="block-head"><h3>Barcha ma'lumotlarni yuklab olish</h3></div>
      <div class="block-body"><button class="btn btn-primary" id="dl"><i class="fa-solid fa-download"></i> JSON faylni yuklab olish</button></div>
      <p class="hint">Vaqti-vaqti bilan zaxira nusxa olib qo'ying.</p>
    </section>
    <section class="block">
      <div class="block-head"><h3>Zaxiradan tiklash</h3></div>
      <div class="block-body"><input type="file" id="up" accept="application/json,.json"></div>
      <p class="hint">Fayl yuklangach "Saqlash" tugmasini bosing — shundan keyin saytga qo'llanadi.</p>
    </section>`;
  $("#dl", c).addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sayt-malumotlari-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#up", c).addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (!d || typeof d !== "object" || !d.site) throw new Error("Bu fayl sayt zaxirasi emas");
      DATA = d;
      setDirty(true);
      toast("Zaxira yuklandi. Endi \"Saqlash\"ni bosing.");
    } catch (err) { toast(err.message, true); }
  });
}

(async () => {
  try {
    const r = await api("/api/auth");
    ME = r.user;
    await startApp();
  } catch {
    showLogin();
  }
})();
