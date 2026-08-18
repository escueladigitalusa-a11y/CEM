/* CEM Workspace — Panel de Contenido
 * Navegación por niveles: Programa -> Módulo -> Submódulo.
 * Los datos viven en localStorage como JSON estructurado (uno por tipo de
 * programa). Local, de un solo usuario, sin backend.
 */
(function () {
  "use strict";

  var CFG = window.CEM_BUILDER || {};
  var TYPE = CFG.type || "programa";
  var LBL = {
    one: CFG.one || "programa",
    many: CFG.many || "programas",
    newOne: CFG.newOne || "Nuevo programa",
    titlePh: CFG.titlePh || "Nombre del programa",
    heading: CFG.heading || "Programas",
    intro: CFG.intro || ""
  };
  var KEY = "cem-builder:" + TYPE;

  var state = load();
  var route = { view: "list", p: null, m: null };
  var open = {};
  var root;

  /* ---------------- almacenamiento ---------------- */

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && Array.isArray(d.programs)) return d;
      }
    } catch (e) {}
    return { programs: [] };
  }

  var saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    function commit() {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        flash("Guardado", false);
      } catch (e) {
        flash("Sin espacio para guardar. Borra imágenes pesadas.", true);
      }
    }
    if (now) commit();
    else saveTimer = setTimeout(commit, 500);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------------- utilidades ---------------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var flashTimer = null;
  function flash(msg, isError) {
    var el = document.getElementById("cem-toast");
    if (!el) return;
    el.textContent = (isError ? "⚠ " : "✓ ") + msg;
    el.className = "cem-toast" + (isError ? " cem-toast-error" : "") + " cem-toast-on";
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      el.className = "cem-toast" + (isError ? " cem-toast-error" : "");
    }, isError ? 4000 : 1400);
  }

  function program() {
    for (var i = 0; i < state.programs.length; i++)
      if (state.programs[i].id === route.p) return state.programs[i];
    return null;
  }

  function moduleOf(p) {
    if (!p) return null;
    for (var i = 0; i < p.modules.length; i++)
      if (p.modules[i].id === route.m) return p.modules[i];
    return null;
  }

  function countSubs(p) {
    return p.modules.reduce(function (a, m) { return a + m.submodules.length; }, 0);
  }

  /* ---------------- campos editables ---------------- */

  function field(value, ph, path, cls, tag) {
    tag = tag || "div";
    return "<" + tag + ' class="cem-ed ' + (cls || "") + '" contenteditable="true" ' +
      'data-path="' + esc(path) + '" data-ph="' + esc(ph) + '">' + esc(value || "") + "</" + tag + ">";
  }

  function imageBox(src, path, extraCls) {
    return '<label class="cem-img ' + (extraCls || "") + '" data-path="' + esc(path) + '">' +
      '<input type="file" accept="image/*" class="hidden cem-img-input">' +
      (src
        ? '<img src="' + esc(src) + '" alt="">' +
          '<span class="cem-img-swap"><span class="material-symbols-outlined text-[18px]">edit</span> Cambiar</span>'
        : '<span class="cem-img-ph"><span class="material-symbols-outlined text-3xl">add_photo_alternate</span>' +
          '<span class="font-label-sm">Imagen 16:9</span></span>') +
      "</label>";
  }

  /* ---------------- vistas ---------------- */

  function renderList() {
    var cards = state.programs.map(function (p) {
      return '<article class="cem-card glass-panel" data-act="open-program" data-id="' + p.id + '">' +
        '<button class="cem-del" data-act="del-program" data-id="' + p.id + '" title="Eliminar">&times;</button>' +
        '<div class="cem-card-media">' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="">'
                   : '<span class="material-symbols-outlined">image</span>') +
        "</div>" +
        '<div class="cem-card-body">' +
          '<h3 class="cem-card-title">' + esc(p.title || LBL.titlePh) + "</h3>" +
          '<p class="cem-card-desc">' + esc(p.description || "Sin descripción") + "</p>" +
          '<div class="cem-card-meta">' +
            '<span><span class="material-symbols-outlined text-[16px]">folder</span>' +
              p.modules.length + " módulo" + (p.modules.length === 1 ? "" : "s") + "</span>" +
            '<span><span class="material-symbols-outlined text-[16px]">play_lesson</span>' +
              countSubs(p) + " submódulo" + (countSubs(p) === 1 ? "" : "s") + "</span>" +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");

    var addCard = '<button class="cem-card cem-card-add" data-act="add-program">' +
      '<span class="material-symbols-outlined">add</span>' +
      "<span>" + esc(LBL.newOne) + "</span></button>";

    var empty = state.programs.length ? "" :
      '<p class="cem-empty">Aún no has creado ningún ' + esc(LBL.one) +
      '. Empieza con el botón de la derecha.</p>';

    return '<header class="cem-head">' +
        "<div>" +
          '<h2 class="cem-h1">' + esc(LBL.heading) + "</h2>" +
          '<p class="cem-lead">' + esc(LBL.intro) + "</p>" +
        "</div>" +
        '<span class="cem-count">' + state.programs.length + " " +
          esc(state.programs.length === 1 ? LBL.one : LBL.many) + "</span>" +
      "</header>" + empty +
      '<div class="cem-grid">' + cards + addCard + "</div>";
  }

  function renderProgram() {
    var p = program();
    if (!p) { route.view = "list"; return renderList(); }

    var mods = p.modules.map(function (m, i) {
      return '<article class="cem-row glass-panel" data-act="open-module" data-id="' + m.id + '">' +
        '<button class="cem-del" data-act="del-module" data-id="' + m.id + '" title="Eliminar">&times;</button>' +
        '<span class="cem-row-num">' + (i + 1) + "</span>" +
        '<div class="cem-row-body">' +
          '<h3 class="cem-row-title">' + esc(m.title || "Módulo sin nombre") + "</h3>" +
          '<p class="cem-row-desc">' + esc(m.description || "Sin descripción") + "</p>" +
        "</div>" +
        '<span class="cem-row-meta">' + m.submodules.length + " submódulo" +
          (m.submodules.length === 1 ? "" : "s") + "</span>" +
        '<span class="material-symbols-outlined cem-row-go">chevron_right</span>' +
      "</article>";
    }).join("");

    var empty = p.modules.length ? "" :
      '<p class="cem-empty">Este ' + esc(LBL.one) + " todavía no tiene módulos.</p>";

    return crumbs([{ label: LBL.heading, act: "go-list" }, { label: p.title || LBL.titlePh }]) +
      '<section class="cem-hero glass-panel">' +
        imageBox(p.image, "program.image", "cem-img-hero") +
        '<div class="cem-hero-body">' +
          '<span class="cem-tag">' + esc(LBL.one) + "</span>" +
          field(p.title, LBL.titlePh, "program.title", "cem-h1", "h2") +
          field(p.description, "Descripción breve…", "program.description", "cem-lead") +
        "</div>" +
      "</section>" +
      '<div class="cem-section-head"><h3>Módulos</h3>' +
        '<button class="cem-btn" data-act="add-module">' +
        '<span class="material-symbols-outlined text-[18px]">add</span> Nuevo módulo</button></div>' +
      empty + '<div class="cem-rows">' + mods + "</div>";
  }

  function renderModule() {
    var p = program();
    var m = moduleOf(p);
    if (!m) { route.view = "program"; return renderProgram(); }

    var subs = m.submodules.map(function (s, i) {
      var isOpen = open[s.id] !== false;
      return '<article class="cem-sub glass-panel' + (isOpen ? " is-open" : "") + '">' +
        '<header class="cem-sub-head" data-act="toggle-sub" data-id="' + s.id + '">' +
          '<span class="cem-row-num">' + (i + 1) + "</span>" +
          '<h4 class="cem-sub-title">' + esc(s.title || "Submódulo sin nombre") + "</h4>" +
          '<span class="cem-sub-dur"><span class="material-symbols-outlined text-[15px]">timer</span>' +
            esc(s.duration || "—") + "</span>" +
          '<span class="material-symbols-outlined cem-sub-chev">expand_more</span>' +
          '<button class="cem-del cem-del-inline" data-act="del-sub" data-id="' + s.id + '" title="Eliminar">&times;</button>' +
        "</header>" +
        '<div class="cem-sub-body">' +
          '<div class="cem-sub-top">' +
            '<div class="cem-f cem-f-grow"><label>Título del submódulo</label>' +
              field(s.title, "Nombre del submódulo", "sub." + s.id + ".title", "cem-in") + "</div>" +
            '<div class="cem-f cem-f-dur"><label>Duración</label>' +
              field(s.duration, "15 min", "sub." + s.id + ".duration", "cem-in") + "</div>" +
          "</div>" +
          '<div class="cem-sub-grid">' +
            '<div class="cem-f"><label>Imagen (16:9)</label>' +
              imageBox(s.image, "sub." + s.id + ".image") + "</div>" +
            '<div class="cem-f"><label>Texto</label>' +
              field(s.texto, "Contenido de este submódulo…", "sub." + s.id + ".texto", "cem-ta") + "</div>" +
          "</div>" +
          '<div class="cem-sub-grid">' +
            '<div class="cem-f"><label class="cem-l-script">Guión</label>' +
              field(s.guion, "Palabra por palabra lo que dirás en cámara…", "sub." + s.id + ".guion", "cem-ta cem-ta-script") + "</div>" +
            '<div class="cem-f"><label class="cem-l-note">Nota extra</label>' +
              field(s.nota, "Recordatorios, materiales, referencias…", "sub." + s.id + ".nota", "cem-ta cem-ta-note") + "</div>" +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");

    var empty = m.submodules.length ? "" :
      '<p class="cem-empty">Este módulo todavía no tiene submódulos.</p>';

    return crumbs([
        { label: LBL.heading, act: "go-list" },
        { label: p.title || LBL.titlePh, act: "go-program" },
        { label: m.title || "Módulo" }
      ]) +
      '<section class="cem-hero glass-panel cem-hero-flat">' +
        '<div class="cem-hero-body">' +
          '<span class="cem-tag">Módulo</span>' +
          field(m.title, "Nombre del módulo", "module.title", "cem-h1", "h2") +
          field(m.description, "Descripción breve del módulo…", "module.description", "cem-lead") +
        "</div>" +
      "</section>" +
      '<div class="cem-section-head"><h3>Submódulos</h3>' +
        '<button class="cem-btn" data-act="add-sub">' +
        '<span class="material-symbols-outlined text-[18px]">add</span> Nuevo submódulo</button></div>' +
      empty + '<div class="cem-subs">' + subs + "</div>";
  }

  function crumbs(items) {
    return '<nav class="cem-crumbs">' + items.map(function (it, i) {
      var last = i === items.length - 1;
      var sep = i ? '<span class="material-symbols-outlined text-[16px]">chevron_right</span>' : "";
      return sep + (last
        ? '<span class="cem-crumb-now">' + esc(it.label) + "</span>"
        : '<button class="cem-crumb" data-act="' + it.act + '">' + esc(it.label) + "</button>");
    }).join("") + "</nav>";
  }

  function render() {
    var html = route.view === "list" ? renderList()
             : route.view === "program" ? renderProgram()
             : renderModule();
    root.innerHTML = html;
  }

  /* ---------------- acciones ---------------- */

  function newProgram() {
    var p = { id: uid(), title: "", description: "", image: "", modules: [] };
    state.programs.push(p);
    save(true);
    route = { view: "program", p: p.id, m: null };
    render();
    focusFirst();
  }

  function newModule() {
    var p = program();
    if (!p) return;
    var m = { id: uid(), title: "", description: "", submodules: [] };
    p.modules.push(m);
    save(true);
    route = { view: "module", p: p.id, m: m.id };
    render();
    focusFirst();
  }

  function newSub() {
    var m = moduleOf(program());
    if (!m) return;
    var s = { id: uid(), title: "", duration: "", image: "", texto: "", guion: "", nota: "" };
    m.submodules.push(s);
    open[s.id] = true;
    save(true);
    render();
    var el = root.querySelector('[data-path="sub.' + s.id + '.title"]');
    if (el) { el.focus(); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }

  function focusFirst() {
    var el = root.querySelector(".cem-ed");
    if (el) el.focus();
  }

  function setPath(path, value) {
    var parts = path.split(".");
    if (parts[0] === "program") {
      var p = program();
      if (p) p[parts[1]] = value;
    } else if (parts[0] === "module") {
      var m = moduleOf(program());
      if (m) m[parts[1]] = value;
    } else if (parts[0] === "sub") {
      var mm = moduleOf(program());
      if (!mm) return;
      for (var i = 0; i < mm.submodules.length; i++) {
        if (mm.submodules[i].id === parts[1]) { mm.submodules[i][parts[2]] = value; return; }
      }
    }
  }

  /* ---------------- eventos ---------------- */

  function bind() {
    root.addEventListener("click", function (e) {
      var del = e.target.closest("[data-act^='del-']");
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        var id = del.getAttribute("data-id");
        var act = del.getAttribute("data-act");
        if (act === "del-program") {
          if (!confirm("¿Eliminar este " + LBL.one + " y todo su contenido?")) return;
          state.programs = state.programs.filter(function (x) { return x.id !== id; });
        } else if (act === "del-module") {
          if (!confirm("¿Eliminar este módulo y sus submódulos?")) return;
          var p = program();
          p.modules = p.modules.filter(function (x) { return x.id !== id; });
        } else {
          if (!confirm("¿Eliminar este submódulo?")) return;
          var m = moduleOf(program());
          m.submodules = m.submodules.filter(function (x) { return x.id !== id; });
        }
        save(true);
        render();
        return;
      }

      var el = e.target.closest("[data-act]");
      if (!el || el.closest(".cem-ed")) return;
      var act = el.getAttribute("data-act");

      if (act === "add-program") { newProgram(); return; }
      if (act === "add-module") { newModule(); return; }
      if (act === "add-sub") { newSub(); return; }
      if (act === "go-list") { route = { view: "list", p: null, m: null }; render(); return; }
      if (act === "go-program") { route.view = "program"; route.m = null; render(); return; }
      if (act === "open-program") {
        route = { view: "program", p: el.getAttribute("data-id"), m: null };
        render(); window.scrollTo(0, 0); return;
      }
      if (act === "open-module") {
        route.view = "module"; route.m = el.getAttribute("data-id");
        render(); window.scrollTo(0, 0); return;
      }
      if (act === "toggle-sub") {
        var sid = el.getAttribute("data-id");
        open[sid] = open[sid] === false;
        el.parentElement.classList.toggle("is-open", open[sid]);
        return;
      }
    });

    // Texto: actualiza el estado sin re-renderizar (mantiene el cursor).
    root.addEventListener("input", function (e) {
      var f = e.target.closest(".cem-ed");
      if (!f) return;
      setPath(f.getAttribute("data-path"), f.textContent.trim());
      save();
    });

    root.addEventListener("change", function (e) {
      if (!e.target.classList.contains("cem-img-input")) return;
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var path = e.target.closest(".cem-img").getAttribute("data-path");
      var reader = new FileReader();
      reader.onload = function (ev) {
        setPath(path, ev.target.result);
        save(true);
        render();
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------- estilos ---------------- */

  function styles() {
    var css = [
      ".cem-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:28px;flex-wrap:wrap}",
      ".cem-h1{font-family:Poppins;font-size:32px;font-weight:700;line-height:1.2;color:#060607;outline:none}",
      ".cem-lead{font-family:Poppins;font-size:16px;line-height:1.5;color:#444748;max-width:60ch;outline:none}",
      ".cem-count{font-family:Poppins;font-size:12px;font-weight:600;color:#0053ce;background:rgba(0,83,206,.1);padding:6px 14px;border-radius:9999px;white-space:nowrap}",
      ".cem-empty{font-family:Poppins;font-size:14px;color:#747878;margin:8px 0 20px}",

      ".cem-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:24px}",
      ".cem-card{position:relative;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;text-align:left}",
      ".cem-card:hover{transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.10)}",
      ".cem-card-media{aspect-ratio:16/9;background:#f3f4f5;display:flex;align-items:center;justify-content:center;color:#c4c7c7}",
      ".cem-card-media img{width:100%;height:100%;object-fit:cover}",
      ".cem-card-media .material-symbols-outlined{font-size:40px}",
      ".cem-card-body{padding:18px}",
      ".cem-card-title{font-family:Poppins;font-size:20px;font-weight:700;color:#060607;line-height:1.25;margin-bottom:4px}",
      ".cem-card-desc{font-family:Poppins;font-size:13px;color:#444748;line-height:1.45;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".cem-card-meta{display:flex;gap:16px;font-family:Poppins;font-size:12px;color:#747878;border-top:1px solid rgba(255,255,255,.5);padding-top:12px}",
      ".cem-card-meta span{display:flex;align-items:center;gap:4px}",
      ".cem-card-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:220px;border:2px dashed rgba(0,83,206,.35);background:rgba(0,83,206,.04);color:#0053ce;font-family:Poppins;font-weight:600;font-size:14px}",
      ".cem-card-add:hover{background:rgba(0,83,206,.09)}",
      ".cem-card-add .material-symbols-outlined{font-size:36px}",

      ".cem-del{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:9999px;background:rgba(255,255,255,.9);color:#ba1a1a;border:1px solid rgba(186,26,26,.25);font-size:18px;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s ease;z-index:5;font-family:Poppins}",
      ".cem-card:hover .cem-del,.cem-row:hover .cem-del,.cem-sub:hover .cem-del,.cem-del:focus{opacity:1}",
      ".cem-del:hover{background:#ba1a1a;color:#fff}",
      ".cem-del-inline{position:static;opacity:0;flex-shrink:0}",

      ".cem-crumbs{display:flex;align-items:center;gap:6px;margin-bottom:20px;flex-wrap:wrap}",
      ".cem-crumb{font-family:Poppins;font-size:13px;font-weight:600;color:#0053ce;background:none;border:none;cursor:pointer;padding:4px 2px}",
      ".cem-crumb:hover{text-decoration:underline}",
      ".cem-crumb-now{font-family:Poppins;font-size:13px;font-weight:600;color:#444748;padding:4px 2px}",
      ".cem-crumbs .material-symbols-outlined{color:#c4c7c7}",

      ".cem-hero{display:flex;gap:24px;padding:20px;border-radius:16px;margin-bottom:32px;flex-wrap:wrap}",
      ".cem-hero-flat{display:block}",
      ".cem-hero-body{flex:1;min-width:240px;display:flex;flex-direction:column;gap:6px}",
      ".cem-tag{align-self:flex-start;font-family:Poppins;font-size:12px;font-weight:600;text-transform:capitalize;color:#0053ce;background:rgba(0,83,206,.12);padding:4px 12px;border-radius:9999px;margin-bottom:2px}",

      ".cem-img{display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;border-radius:12px;overflow:hidden;border:2px dashed #c4c7c7;background:#f3f4f5;cursor:pointer;position:relative;color:#747878}",
      ".cem-img-hero{width:300px;flex-shrink:0}",
      ".cem-img img{width:100%;height:100%;object-fit:cover}",
      ".cem-img-ph{display:flex;flex-direction:column;align-items:center;gap:4px;font-family:Poppins}",
      ".cem-img-swap{position:absolute;inset:auto 0 0 0;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px;font-family:Poppins;font-size:12px;font-weight:600;color:#fff;background:rgba(0,0,0,.55);opacity:0;transition:opacity .15s ease}",
      ".cem-img:hover .cem-img-swap{opacity:1}",

      ".cem-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}",
      ".cem-section-head h3{font-family:Poppins;font-size:20px;font-weight:600;color:#060607}",
      ".cem-btn{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#0053ce,#2a6cf0);color:#fff;font-family:Poppins;font-size:13px;font-weight:600;padding:9px 18px;border:none;border-radius:9999px;cursor:pointer;transition:box-shadow .2s ease,transform .2s ease}",
      ".cem-btn:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(0,83,206,.28)}",

      ".cem-rows{display:flex;flex-direction:column;gap:12px}",
      ".cem-row{position:relative;display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:14px;cursor:pointer;transition:transform .15s ease}",
      ".cem-row:hover{transform:translateX(3px)}",
      ".cem-row-num{width:30px;height:30px;flex-shrink:0;border-radius:9999px;background:rgba(0,83,206,.12);color:#0053ce;font-family:Poppins;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}",
      ".cem-row-body{flex:1;min-width:0}",
      ".cem-row-title{font-family:Poppins;font-size:16px;font-weight:600;color:#060607}",
      ".cem-row-desc{font-family:Poppins;font-size:13px;color:#747878;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".cem-row-meta{font-family:Poppins;font-size:12px;color:#747878;white-space:nowrap}",
      ".cem-row-go{color:#c4c7c7}",

      ".cem-subs{display:flex;flex-direction:column;gap:14px}",
      ".cem-sub{border-radius:14px;overflow:hidden}",
      ".cem-sub-head{display:flex;align-items:center;gap:14px;padding:14px 18px;cursor:pointer}",
      ".cem-sub-title{flex:1;min-width:0;font-family:Poppins;font-size:15px;font-weight:600;color:#060607;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".cem-sub-dur{display:flex;align-items:center;gap:4px;font-family:Poppins;font-size:12px;color:#747878;white-space:nowrap}",
      ".cem-sub-chev{color:#747878;transition:transform .2s ease}",
      ".cem-sub.is-open .cem-sub-chev{transform:rotate(180deg)}",
      ".cem-sub-body{display:none;padding:0 18px 18px;flex-direction:column;gap:14px}",
      ".cem-sub.is-open .cem-sub-body{display:flex}",
      ".cem-sub-top{display:flex;gap:14px;flex-wrap:wrap}",
      ".cem-sub-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}",
      "@media(max-width:820px){.cem-sub-grid{grid-template-columns:1fr}.cem-img-hero{width:100%}}",
      ".cem-f{display:flex;flex-direction:column;gap:5px;min-width:0}",
      ".cem-f-grow{flex:1;min-width:200px}",
      ".cem-f-dur{width:130px}",
      ".cem-f label{font-family:Poppins;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#747878}",
      ".cem-f .cem-l-script{color:#0053ce}",
      ".cem-f .cem-l-note{color:#c2410c}",
      ".cem-in{font-family:Poppins;font-size:15px;color:#191c1d;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);border-radius:9px;padding:9px 12px;outline:none}",
      ".cem-ta{font-family:Poppins;font-size:14px;line-height:1.6;color:#191c1d;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);border-radius:9px;padding:11px 13px;min-height:112px;outline:none;white-space:pre-wrap}",
      ".cem-ta-script{background:rgba(0,83,206,.05);border-color:rgba(0,83,206,.18)}",
      ".cem-ta-note{background:rgba(249,115,22,.06);border-color:rgba(249,115,22,.2)}",
      ".cem-in:focus,.cem-ta:focus{border-color:#0053ce;box-shadow:0 0 0 3px rgba(0,83,206,.12)}",
      ".cem-ed:empty:before{content:attr(data-ph);color:#a9adad;pointer-events:none}",

      ".cem-toast{position:fixed;left:20px;bottom:20px;z-index:9999;font-family:Poppins;font-size:13px;font-weight:600;color:#0f5132;background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.9);box-shadow:0 12px 32px rgba(0,0,0,.12);border-radius:9999px;padding:10px 20px;opacity:0;transform:translateY(8px);transition:opacity .2s ease,transform .2s ease;pointer-events:none}",
      ".cem-toast-on{opacity:1;transform:translateY(0)}",
      ".cem-toast-error{color:#93000a}"
    ].join("");
    var tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ---------------- arranque ---------------- */

  function init() {
    root = document.getElementById("cem-root");
    if (!root) return;
    styles();
    var toast = document.createElement("div");
    toast.id = "cem-toast";
    toast.className = "cem-toast";
    document.body.appendChild(toast);
    bind();
    render();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
