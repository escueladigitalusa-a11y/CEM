/* CEM Workspace — Proyectos y tableros de tareas
 * Pantalla 1: lista de proyectos internos (+ crear nuevo eligiendo tipo)
 * Pantalla 2: el tablero elegido — Kanban, Checklist, Notas en grid o Post-it
 * Estado en localStorage. Sin backend.
 */
(function () {
  "use strict";

  var KEY = "cem-tasks";
  var TYPES = [
    { id: "kanban",    name: "Kanban",         icon: "view_kanban",  desc: "Columnas por fase y tarjetas que arrastras entre ellas." },
    { id: "checklist", name: "Checklist",      icon: "checklist",    desc: "Listas de verificación agrupadas, con progreso." },
    { id: "notes",     name: "Notas en grid",  icon: "grid_view",    desc: "Tarjetas de nota con título y cuerpo." },
    { id: "postit",    name: "Post-it",        icon: "sticky_note_2", desc: "Notas adhesivas de colores para ideas sueltas." }
  ];
  var PCOLORS = ["#fef3c7", "#fce7f3", "#dbeafe", "#dcfce7", "#ede9fe", "#ffedd5"];
  var KCOLORS = ["#5f5e5e", "#0053ce", "#f72585", "#16a34a", "#ea580c", "#7c3aed"];

  var state = load();
  var route = { view: "list", p: null };
  var picking = false;
  var dragId = null;
  var root;

  /* ---------------------------------------- almacenamiento */

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.projects)) return d;
    } catch (e) {}
    return { projects: [] };
  }

  var t = null;
  function save(now) {
    clearTimeout(t);
    function go() {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        toast("Guardado");
      } catch (e) { toast("Sin espacio para guardar.", true); }
    }
    if (now) go(); else t = setTimeout(go, 600);
  }

  function flush() {
    if (!t) return;
    clearTimeout(t); t = null;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var tt = null;
  function toast(msg, bad) {
    var el = document.getElementById("cem-toast");
    if (!el) return;
    el.textContent = (bad ? "⚠ " : "✓ ") + msg;
    el.className = "cem-toast" + (bad ? " bad" : "") + " on";
    clearTimeout(tt);
    tt = setTimeout(function () { el.className = "cem-toast" + (bad ? " bad" : ""); }, bad ? 4500 : 1300);
  }

  function proj() {
    for (var i = 0; i < state.projects.length; i++)
      if (state.projects[i].id === route.p) return state.projects[i];
    return null;
  }

  function typeOf(id) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i];
    return TYPES[0];
  }

  function ed(val, ph, loc, cls, tag) {
    tag = tag || "div";
    return "<" + tag + ' class="ced ' + (cls || "") + '" contenteditable="true" ' +
      'data-loc="' + esc(loc) + '" data-ph="' + esc(ph) + '">' + esc(val || "") + "</" + tag + ">";
  }

  /* ---------------------------------------- resumen por tipo */

  function summary(p) {
    if (p.type === "kanban") {
      var c = p.kanban.columns.length;
      var n = p.kanban.columns.reduce(function (a, x) { return a + x.cards.length; }, 0);
      return c + (c === 1 ? " columna" : " columnas") + " · " + n + (n === 1 ? " tarjeta" : " tarjetas");
    }
    if (p.type === "checklist") {
      var all = 0, done = 0;
      p.checklist.groups.forEach(function (g) {
        all += g.items.length;
        done += g.items.filter(function (i) { return i.done; }).length;
      });
      return done + " de " + all + " completadas";
    }
    var k = p.type === "notes" ? p.notes.items.length : p.postit.items.length;
    return k + (k === 1 ? " nota" : " notas");
  }

  function progressOf(p) {
    if (p.type === "checklist") {
      var all = 0, done = 0;
      p.checklist.groups.forEach(function (g) {
        all += g.items.length;
        done += g.items.filter(function (i) { return i.done; }).length;
      });
      return all ? Math.round(done * 100 / all) : 0;
    }
    return null;
  }

  /* ---------------------------------------- pantalla 1: proyectos */

  function renderList() {
    if (picking) return renderPicker();

    var cards = state.projects.map(function (p) {
      var ty = typeOf(p.type);
      var pr = progressOf(p);
      return '<article class="pcard" data-act="open" data-id="' + p.id + '">' +
        '<button class="cem-del" data-act="del-proj" data-id="' + p.id + '" title="Eliminar">&times;</button>' +
        '<span class="ptype"><span class="material-symbols-outlined">' + ty.icon + "</span>" + esc(ty.name) + "</span>" +
        '<h3 class="pcard-title">' + esc(p.name || "Proyecto sin nombre") + "</h3>" +
        '<p class="pcard-desc">' + esc(p.desc || "Sin descripción.") + "</p>" +
        '<div class="pcard-foot">' +
          (pr === null ? "" : '<div class="bar"><i style="width:' + pr + '%"></i></div>') +
          '<span class="sum">' + esc(summary(p)) + "</span>" +
        "</div>" +
      "</article>";
    }).join("");

    var empty = state.projects.length ? "" :
      '<p class="empty">Aún no tienes proyectos. Crea el primero con el botón <b>Nuevo proyecto</b>.</p>';

    return '<header class="reg-head"><div>' +
        "<h2>Proyectos</h2><p>Organiza tu trabajo interno con el tablero que mejor te sirva.</p>" +
      "</div>" +
      '<span class="cem-count">' + state.projects.length +
        (state.projects.length === 1 ? " proyecto" : " proyectos") + "</span></header>" +
      empty + '<div class="pgrid">' + cards +
      '<button class="pcard padd" data-act="pick"><span class="material-symbols-outlined">add</span>' +
      "<span>Nuevo proyecto</span></button></div>";
  }

  function renderPicker() {
    var opts = TYPES.map(function (ty) {
      return '<button class="topt" data-act="create" data-id="' + ty.id + '">' +
        '<span class="material-symbols-outlined">' + ty.icon + "</span>" +
        "<h4>" + esc(ty.name) + "</h4><p>" + esc(ty.desc) + "</p></button>";
    }).join("");
    return '<div class="picker"><button class="back" data-act="cancel">' +
      '<span class="material-symbols-outlined">arrow_back</span> Volver</button>' +
      "<h2>¿Qué tipo de tablero quieres para este proyecto?</h2>" +
      "<p class=\"psub\">Podrás cambiar el nombre después. El tipo define cómo se organizan las tareas.</p>" +
      '<div class="topts">' + opts + "</div></div>";
  }

  /* ---------------------------------------- pantalla 2: tableros */

  function renderProject() {
    var p = proj();
    if (!p) { route.view = "list"; return renderList(); }
    var ty = typeOf(p.type);
    var body = p.type === "kanban" ? boardKanban(p)
             : p.type === "checklist" ? boardChecklist(p)
             : p.type === "notes" ? boardNotes(p)
             : boardPostit(p);

    return '<nav class="crumbs"><button data-act="home">Proyectos</button>' +
        '<span class="material-symbols-outlined">chevron_right</span>' +
        '<span class="now">' + esc(p.name || "Proyecto") + "</span></nav>" +
      '<header class="proj-head"><div class="ph-l">' +
        ed(p.name, "Nombre del proyecto", "proj:name", "ptitle", "h1") +
        ed(p.desc, "Descripción del proyecto…", "proj:desc", "pdesc") +
      "</div>" +
      '<span class="ptype big"><span class="material-symbols-outlined">' + ty.icon + "</span>" +
        esc(ty.name) + "</span></header>" + body;
  }

  /* --- Kanban --- */
  function boardKanban(p) {
    var cols = p.kanban.columns.map(function (c) {
      var cards = c.cards.map(function (k) {
        return '<div class="kcard" draggable="true" data-card="' + k.id + '">' +
          '<span class="kbar" style="background:' + esc(c.color) + '"></span>' +
          ed(k.text, "Describe la tarea…", "card:" + k.id + ":text", "ktext") +
          '<button class="cem-del" data-act="del-card" data-id="' + k.id + '">&times;</button>' +
        "</div>";
      }).join("");
      return '<div class="kcol" data-col="' + c.id + '">' +
        '<div class="khead">' +
          '<span class="kdot" style="background:' + esc(c.color) + '"></span>' +
          ed(c.title, "Columna", "col:" + c.id + ":title", "ktitle") +
          '<span class="kn">' + c.cards.length + "</span>" +
          '<button class="cem-del" data-act="del-col" data-id="' + c.id + '">&times;</button>' +
        "</div>" +
        '<div class="kbody" data-col="' + c.id + '">' + cards +
          '<button class="miniadd" data-act="add-card" data-id="' + c.id + '">+ Tarjeta</button>' +
        "</div>" +
      "</div>";
    }).join("");
    return '<div class="kboard">' + cols +
      '<button class="kaddcol" data-act="add-col"><span class="material-symbols-outlined">add</span> Columna</button></div>';
  }

  /* --- Checklist --- */
  function boardChecklist(p) {
    var groups = p.checklist.groups.map(function (g) {
      var done = g.items.filter(function (i) { return i.done; }).length;
      var pr = g.items.length ? Math.round(done * 100 / g.items.length) : 0;
      var items = g.items.map(function (i) {
        return '<div class="citem' + (i.done ? " done" : "") + '">' +
          '<button class="cbox" data-act="toggle" data-id="' + i.id + '">' +
            '<span class="material-symbols-outlined">' + (i.done ? "check_box" : "check_box_outline_blank") + "</span></button>" +
          ed(i.text, "Nueva tarea…", "item:" + i.id + ":text", "ctext") +
          '<button class="cem-del" data-act="del-item" data-id="' + i.id + '">&times;</button>' +
        "</div>";
      }).join("");
      return '<section class="cgroup card">' +
        '<div class="cghead">' +
          ed(g.title, "Nombre del grupo", "grp:" + g.id + ":title", "cgtitle", "h3") +
          '<span class="cgn">' + done + "/" + g.items.length + "</span>" +
          '<button class="cem-del" data-act="del-grp" data-id="' + g.id + '">&times;</button>' +
        "</div>" +
        '<div class="bar"><i style="width:' + pr + '%"></i></div>' +
        '<div class="citems">' + items + "</div>" +
        '<button class="miniadd" data-act="add-item" data-id="' + g.id + '">+ Tarea</button>' +
      "</section>";
    }).join("");
    return '<div class="clist">' + groups +
      '<button class="addbtn" data-act="add-grp"><span class="material-symbols-outlined">add</span> Nuevo grupo</button></div>';
  }

  /* --- Notas en grid --- */
  function boardNotes(p) {
    var notes = p.notes.items.map(function (n) {
      return '<article class="ncard card">' +
        '<button class="cem-del" data-act="del-note" data-id="' + n.id + '">&times;</button>' +
        ed(n.title, "Título de la nota", "note:" + n.id + ":title", "ntitle", "h3") +
        ed(n.body, "Escribe aquí…", "note:" + n.id + ":body", "nbody") +
      "</article>";
    }).join("");
    return '<div class="ngrid">' + notes +
      '<button class="ncard nadd" data-act="add-note"><span class="material-symbols-outlined">add</span>Nueva nota</button></div>';
  }

  /* --- Post-it --- */
  function boardPostit(p) {
    var notes = p.postit.items.map(function (n) {
      var sw = PCOLORS.map(function (c) {
        return '<button class="sw' + (c === n.color ? " on" : "") + '" style="background:' + c +
          '" data-act="color" data-id="' + n.id + '" data-c="' + c + '"></button>';
      }).join("");
      return '<article class="pit" style="background:' + esc(n.color) + '">' +
        '<button class="cem-del" data-act="del-pit" data-id="' + n.id + '">&times;</button>' +
        ed(n.text, "Escribe tu idea…", "pit:" + n.id + ":text", "pittext") +
        '<div class="sws">' + sw + "</div>" +
      "</article>";
    }).join("");
    return '<div class="pgrid-pit">' + notes +
      '<button class="pit padd2" data-act="add-pit"><span class="material-symbols-outlined">add</span>Nuevo post-it</button></div>';
  }

  function render() {
    root.innerHTML = route.view === "list" ? renderList() : renderProject();
  }

  /* ---------------------------------------- acciones */

  function createProject(type) {
    var p = { id: uid(), name: "", desc: "", type: type };
    if (type === "kanban") {
      p.kanban = { columns: [
        { id: uid(), title: "Por hacer", color: KCOLORS[0], cards: [] },
        { id: uid(), title: "En curso", color: KCOLORS[1], cards: [] },
        { id: uid(), title: "Hecho", color: KCOLORS[3], cards: [] }
      ] };
    } else if (type === "checklist") {
      p.checklist = { groups: [{ id: uid(), title: "Pendientes", items: [] }] };
    } else if (type === "notes") {
      p.notes = { items: [] };
    } else {
      p.postit = { items: [] };
    }
    state.projects.unshift(p);
    picking = false;
    save(true);
    route = { view: "project", p: p.id };
    render();
    var e = root.querySelector(".ptitle");
    if (e) e.focus();
  }

  function setLoc(loc, val) {
    var a = loc.split(":");
    var p = proj();
    if (!p) return;
    if (a[0] === "proj") { p[a[1]] = val; return; }
    if (a[0] === "col") {
      p.kanban.columns.forEach(function (c) { if (c.id === a[1]) c[a[2]] = val; });
    } else if (a[0] === "card") {
      p.kanban.columns.forEach(function (c) {
        c.cards.forEach(function (k) { if (k.id === a[1]) k[a[2]] = val; });
      });
    } else if (a[0] === "grp") {
      p.checklist.groups.forEach(function (g) { if (g.id === a[1]) g[a[2]] = val; });
    } else if (a[0] === "item") {
      p.checklist.groups.forEach(function (g) {
        g.items.forEach(function (i) { if (i.id === a[1]) i[a[2]] = val; });
      });
    } else if (a[0] === "note") {
      p.notes.items.forEach(function (n) { if (n.id === a[1]) n[a[2]] = val; });
    } else if (a[0] === "pit") {
      p.postit.items.forEach(function (n) { if (n.id === a[1]) n[a[2]] = val; });
    }
  }

  function focusLast(sel) {
    var all = root.querySelectorAll(sel);
    var e = all[all.length - 1];
    if (e) { e.focus(); e.scrollIntoView({ block: "nearest" }); }
  }

  /* ---------------------------------------- eventos */

  function bind() {
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      var id = b.getAttribute("data-id");
      var p = proj();

      switch (act) {
        case "pick": picking = true; render(); return;
        case "cancel": picking = false; render(); return;
        case "create": createProject(id); return;
        case "open":
          if (e.target.closest(".cem-del")) return;
          route = { view: "project", p: id }; render(); window.scrollTo(0, 0); return;
        case "home": route = { view: "list", p: null }; render(); window.scrollTo(0, 0); return;
        case "del-proj":
          e.stopPropagation();
          if (!confirm("¿Eliminar este proyecto y todo su contenido?")) return;
          state.projects = state.projects.filter(function (x) { return x.id !== id; });
          save(true); render(); return;

        /* kanban */
        case "add-col": {
          var n = p.kanban.columns.length;
          p.kanban.columns.push({ id: uid(), title: "", color: KCOLORS[n % KCOLORS.length], cards: [] });
          save(true); render(); focusLast(".ktitle"); return;
        }
        case "del-col":
          if (!confirm("¿Eliminar esta columna y sus tarjetas?")) return;
          p.kanban.columns = p.kanban.columns.filter(function (c) { return c.id !== id; });
          save(true); render(); return;
        case "add-card":
          p.kanban.columns.forEach(function (c) {
            if (c.id === id) c.cards.push({ id: uid(), text: "" });
          });
          save(true); render();
          focusLast('.kcol[data-col="' + id + '"] .ktext'); return;
        case "del-card":
          p.kanban.columns.forEach(function (c) {
            c.cards = c.cards.filter(function (k) { return k.id !== id; });
          });
          save(true); render(); return;

        /* checklist */
        case "add-grp":
          p.checklist.groups.push({ id: uid(), title: "", items: [] });
          save(true); render(); focusLast(".cgtitle"); return;
        case "del-grp":
          if (!confirm("¿Eliminar este grupo y sus tareas?")) return;
          p.checklist.groups = p.checklist.groups.filter(function (g) { return g.id !== id; });
          save(true); render(); return;
        case "add-item":
          p.checklist.groups.forEach(function (g) {
            if (g.id === id) g.items.push({ id: uid(), text: "", done: false });
          });
          save(true); render(); focusLast(".ctext"); return;
        case "del-item":
          p.checklist.groups.forEach(function (g) {
            g.items = g.items.filter(function (i) { return i.id !== id; });
          });
          save(true); render(); return;
        case "toggle":
          p.checklist.groups.forEach(function (g) {
            g.items.forEach(function (i) { if (i.id === id) i.done = !i.done; });
          });
          save(true);
          var y = window.scrollY; render(); window.scrollTo(0, y); return;

        /* notas */
        case "add-note":
          p.notes.items.push({ id: uid(), title: "", body: "" });
          save(true); render(); focusLast(".ntitle"); return;
        case "del-note":
          if (!confirm("¿Eliminar esta nota?")) return;
          p.notes.items = p.notes.items.filter(function (n) { return n.id !== id; });
          save(true); render(); return;

        /* post-it */
        case "add-pit":
          p.postit.items.push({ id: uid(), text: "", color: PCOLORS[p.postit.items.length % PCOLORS.length] });
          save(true); render(); focusLast(".pittext"); return;
        case "del-pit":
          if (!confirm("¿Eliminar este post-it?")) return;
          p.postit.items = p.postit.items.filter(function (n) { return n.id !== id; });
          save(true); render(); return;
        case "color":
          p.postit.items.forEach(function (n) {
            if (n.id === id) n.color = b.getAttribute("data-c");
          });
          save(true);
          var y2 = window.scrollY; render(); window.scrollTo(0, y2); return;
      }
    });

    root.addEventListener("input", function (e) {
      var f = e.target.closest(".ced");
      if (!f) return;
      setLoc(f.getAttribute("data-loc"), f.textContent.trim());
      save();
    });

    /* arrastrar tarjetas del kanban */
    root.addEventListener("dragstart", function (e) {
      var c = e.target.closest(".kcard");
      if (!c) return;
      dragId = c.getAttribute("data-card");
      c.classList.add("dragging");
      try { e.dataTransfer.setData("text/plain", dragId); } catch (x) {}
      e.dataTransfer.effectAllowed = "move";
    });
    root.addEventListener("dragend", function (e) {
      var c = e.target.closest(".kcard");
      if (c) c.classList.remove("dragging");
      var z = root.querySelectorAll(".kbody.over");
      for (var i = 0; i < z.length; i++) z[i].classList.remove("over");
    });
    root.addEventListener("dragover", function (e) {
      var body = e.target.closest(".kbody");
      if (!body) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      body.classList.add("over");
    });
    root.addEventListener("dragleave", function (e) {
      var body = e.target.closest(".kbody");
      if (body && !body.contains(e.relatedTarget)) body.classList.remove("over");
    });
    root.addEventListener("drop", function (e) {
      var body = e.target.closest(".kbody");
      if (!body || !dragId) return;
      e.preventDefault();
      var to = body.getAttribute("data-col");
      var p = proj();
      var moved = null;
      p.kanban.columns.forEach(function (c) {
        var keep = [];
        c.cards.forEach(function (k) {
          if (k.id === dragId) moved = k; else keep.push(k);
        });
        c.cards = keep;
      });
      if (moved) {
        p.kanban.columns.forEach(function (c) { if (c.id === to) c.cards.push(moved); });
        save(true);
      }
      dragId = null;
      render();
    });

    var sb = document.getElementById("cem-save");
    if (sb) sb.addEventListener("click", function () { save(true); });
    var news = document.querySelectorAll("#cem-new, [data-cem-new]");
    for (var i = 0; i < news.length; i++) {
      news[i].addEventListener("click", function () {
        route = { view: "list", p: null };
        picking = true;
        render();
        window.scrollTo(0, 0);
      });
    }
  }

  /* ---------------------------------------- estilos */

  function styles() {
    var css = [
      "#cem-root{font-family:Poppins,sans-serif;color:#191c1d}",
      "#cem-root *{box-sizing:border-box}",
      "#cem-root button{font-family:inherit}",
      ".card{background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,.9);box-shadow:0 20px 40px rgba(0,0,0,.04);border-radius:16px}",
      ".empty{font-size:14px;color:#747878;margin:6px 0 22px}",
      ".cem-count{font-size:12px;font-weight:600;color:#0053ce;background:rgba(0,83,206,.1);padding:6px 14px;border-radius:9999px;white-space:nowrap}",
      ".reg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:26px}",
      ".reg-head h2{font-size:34px;font-weight:700;letter-spacing:-.02em;color:#060607}",
      ".reg-head p{font-size:16px;color:#444748;margin-top:4px}",
      ".ced:empty:before{content:attr(data-ph);color:#a9adad;pointer-events:none}",
      ".cem-del{position:absolute;top:9px;right:9px;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.92);color:#ba1a1a;border:1px solid rgba(186,26,26,.25);font-size:15px;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s;z-index:6;padding:0}",
      ".pcard:hover .cem-del,.kcard:hover .cem-del,.khead:hover .cem-del,.citem:hover .cem-del,.ncard:hover .cem-del,.pit:hover .cem-del,.cghead:hover .cem-del{opacity:1}",
      ".cem-del:hover{background:#ba1a1a;color:#fff}",

      ".pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:22px}",
      ".pcard{position:relative;background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.9);box-shadow:0 16px 34px rgba(0,0,0,.05);border-radius:16px;padding:20px;min-height:186px;display:flex;flex-direction:column;cursor:pointer;text-align:left;transition:transform .2s,box-shadow .2s}",
      ".pcard:hover{transform:translateY(-3px);box-shadow:0 24px 46px rgba(0,0,0,.09)}",
      ".ptype{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:12px;font-weight:600;color:#0053ce;background:rgba(0,83,206,.1);padding:5px 12px;border-radius:9999px;margin-bottom:12px}",
      ".ptype .material-symbols-outlined{font-size:16px}",
      ".ptype.big{font-size:13px;padding:8px 16px;margin:0;flex-shrink:0}",
      ".pcard-title{font-size:20px;font-weight:700;color:#060607;line-height:1.25;margin-bottom:5px}",
      ".pcard-desc{font-size:13px;color:#5c6060;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".pcard-foot{margin-top:auto;padding-top:16px}",
      ".sum{font-size:12.5px;color:#747878}",
      ".bar{height:7px;border-radius:9999px;background:#e6e8e9;overflow:hidden;margin-bottom:7px}",
      ".bar i{display:block;height:100%;border-radius:9999px;background:linear-gradient(90deg,#0053ce,#00b4d8)}",
      ".padd{align-items:center;justify-content:center;gap:8px;border:2px dashed rgba(0,83,206,.35);background:rgba(0,83,206,.04);color:#0053ce;font-weight:600;font-size:14px}",
      ".padd:hover{background:rgba(0,83,206,.09)}",
      ".padd .material-symbols-outlined{font-size:32px}",

      ".picker{max-width:860px}",
      ".picker .back{background:none;border:none;color:#0053ce;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-bottom:18px;padding:0}",
      ".picker .back .material-symbols-outlined{font-size:18px}",
      ".picker h2{font-size:28px;font-weight:700;color:#060607;line-height:1.25}",
      ".psub{font-size:15px;color:#444748;margin:6px 0 26px}",
      ".topts{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:18px}",
      ".topt{background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.9);box-shadow:0 16px 34px rgba(0,0,0,.05);border-radius:16px;padding:24px 20px;text-align:left;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s}",
      ".topt:hover{transform:translateY(-3px);border-color:#0053ce;box-shadow:0 22px 44px rgba(0,83,206,.14)}",
      ".topt .material-symbols-outlined{font-size:34px;color:#0053ce;margin-bottom:10px}",
      ".topt h4{font-size:17px;font-weight:700;color:#060607;margin-bottom:5px}",
      ".topt p{font-size:13px;color:#5c6060;line-height:1.5}",

      ".crumbs{display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:10px}",
      ".crumbs button{background:none;border:none;color:#0053ce;font-size:13px;font-weight:500;cursor:pointer;padding:0}",
      ".crumbs button:hover{text-decoration:underline}",
      ".crumbs .now{color:#5c6060}",
      ".crumbs .material-symbols-outlined{font-size:16px;color:#c4c7c7}",
      ".proj-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:26px;flex-wrap:wrap}",
      ".ph-l{min-width:240px;flex:1}",
      ".ptitle{font-size:34px;font-weight:700;letter-spacing:-.02em;color:#060607;outline:none}",
      ".pdesc{font-size:15px;color:#444748;margin-top:5px;outline:none;max-width:70ch}",
      ".miniadd{background:none;border:none;color:#0053ce;font-size:12.5px;font-weight:600;text-align:left;padding:8px 10px;cursor:pointer;border-radius:8px;width:100%}",
      ".miniadd:hover{background:rgba(0,83,206,.08)}",
      ".addbtn{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border:2px dashed rgba(0,83,206,.35);background:rgba(0,83,206,.05);color:#0053ce;font-size:13.5px;font-weight:600;border-radius:12px;cursor:pointer}",
      ".addbtn:hover{background:rgba(0,83,206,.1)}",

      /* kanban */
      ".kboard{display:flex;gap:18px;align-items:flex-start;overflow-x:auto;padding-bottom:18px}",
      ".kcol{flex:0 0 292px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.9);border-radius:15px;padding:13px;box-shadow:0 14px 30px rgba(0,0,0,.04)}",
      ".khead{position:relative;display:flex;align-items:center;gap:8px;padding:4px 4px 11px}",
      ".kdot{width:10px;height:10px;border-radius:50%;flex-shrink:0}",
      ".ktitle{flex:1;min-width:0;font-size:14.5px;font-weight:600;color:#060607;outline:none}",
      ".kn{font-size:11.5px;font-weight:600;color:#747878;background:#e6e8e9;padding:2px 9px;border-radius:9999px}",
      ".khead .cem-del{position:static;opacity:0;flex-shrink:0}",
      ".kbody{display:flex;flex-direction:column;gap:9px;min-height:64px;border-radius:11px;padding:3px;transition:background .15s}",
      ".kbody.over{background:rgba(0,83,206,.09);outline:2px dashed rgba(0,83,206,.35)}",
      ".kcard{position:relative;background:#fff;border:1px solid rgba(0,0,0,.05);border-radius:11px;padding:13px 30px 13px 17px;box-shadow:0 3px 10px rgba(0,0,0,.05);cursor:grab;overflow:hidden}",
      ".kcard:active{cursor:grabbing}",
      ".kcard.dragging{opacity:.45}",
      ".kbar{position:absolute;left:0;top:0;bottom:0;width:4px}",
      ".ktext{font-size:13.5px;line-height:1.5;color:#191c1d;outline:none;min-height:19px}",
      ".kaddcol{flex:0 0 210px;display:flex;align-items:center;justify-content:center;gap:6px;padding:16px;border:2px dashed rgba(0,83,206,.32);background:rgba(0,83,206,.04);color:#0053ce;font-size:13.5px;font-weight:600;border-radius:15px;cursor:pointer;margin-top:2px}",
      ".kaddcol:hover{background:rgba(0,83,206,.09)}",

      /* checklist */
      ".clist{display:flex;flex-direction:column;gap:18px;max-width:760px}",
      ".cgroup{padding:18px 20px}",
      ".cghead{position:relative;display:flex;align-items:center;gap:10px;margin-bottom:11px}",
      ".cgtitle{flex:1;min-width:0;font-size:17px;font-weight:600;color:#060607;outline:none}",
      ".cgn{font-size:12px;font-weight:600;color:#747878;background:#e6e8e9;padding:3px 10px;border-radius:9999px}",
      ".cghead .cem-del{position:static;opacity:0;flex-shrink:0}",
      ".citems{display:flex;flex-direction:column;margin-top:12px}",
      ".citem{position:relative;display:flex;align-items:flex-start;gap:9px;padding:8px 30px 8px 4px;border-radius:9px}",
      ".citem:hover{background:rgba(255,255,255,.6)}",
      ".cbox{background:none;border:none;cursor:pointer;color:#c4c7c7;padding:0;display:flex;flex-shrink:0}",
      ".citem.done .cbox{color:#16a34a}",
      ".cbox .material-symbols-outlined{font-size:22px}",
      ".ctext{flex:1;min-width:0;font-size:14.5px;line-height:1.5;color:#191c1d;outline:none;padding-top:1px}",
      ".citem.done .ctext{text-decoration:line-through;color:#9aa0a0}",

      /* notas */
      ".ngrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:18px;align-items:start}",
      ".ncard{position:relative;padding:18px 20px;min-height:158px}",
      ".ntitle{font-size:16.5px;font-weight:700;color:#060607;outline:none;margin-bottom:7px;padding-right:20px}",
      ".nbody{font-size:13.5px;line-height:1.6;color:#444748;outline:none;white-space:pre-wrap}",
      ".nadd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;border:2px dashed rgba(0,83,206,.32);background:rgba(0,83,206,.04);color:#0053ce;font-weight:600;font-size:13.5px;cursor:pointer;box-shadow:none}",
      ".nadd:hover{background:rgba(0,83,206,.09)}",
      ".nadd .material-symbols-outlined{font-size:30px}",

      /* post-it */
      ".pgrid-pit{display:grid;grid-template-columns:repeat(auto-fill,minmax(212px,1fr));gap:18px;align-items:start}",
      ".pit{position:relative;border-radius:4px;padding:18px 18px 12px;min-height:196px;display:flex;flex-direction:column;box-shadow:0 8px 18px rgba(0,0,0,.10);transform:rotate(-.5deg)}",
      ".pit:nth-child(even){transform:rotate(.6deg)}",
      ".pittext{flex:1;font-size:14.5px;line-height:1.55;color:#3f3f2f;outline:none;white-space:pre-wrap}",
      ".sws{display:flex;gap:5px;margin-top:10px;opacity:0;transition:opacity .15s}",
      ".pit:hover .sws{opacity:1}",
      ".sw{width:16px;height:16px;border-radius:50%;border:1px solid rgba(0,0,0,.16);cursor:pointer;padding:0}",
      ".sw.on{outline:2px solid #191c1d;outline-offset:1px}",
      ".padd2{align-items:center;justify-content:center;gap:7px;background:rgba(0,83,206,.04)!important;border:2px dashed rgba(0,83,206,.32);color:#0053ce;font-weight:600;font-size:13.5px;cursor:pointer;box-shadow:none;transform:none!important}",
      ".padd2:hover{background:rgba(0,83,206,.09)!important}",
      ".padd2 .material-symbols-outlined{font-size:30px}",

      ".cem-toast{position:fixed;left:22px;bottom:22px;z-index:9999;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;color:#0f5132;background:rgba(255,255,255,.95);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.9);box-shadow:0 12px 32px rgba(0,0,0,.12);border-radius:9999px;padding:10px 20px;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;pointer-events:none}",
      ".cem-toast.on{opacity:1;transform:translateY(0)}",
      ".cem-toast.bad{color:#93000a}"
    ].join("");
    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  function init() {
    root = document.getElementById("cem-root");
    if (!root) return;
    styles();
    var tp = document.createElement("div");
    tp.id = "cem-toast";
    tp.className = "cem-toast";
    document.body.appendChild(tp);
    bind();
    render();
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flush();
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
