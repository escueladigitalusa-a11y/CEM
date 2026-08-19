/* CEM Workspace — Panel de Contenido
 * Dos pantallas:
 *   1) Registro  — grid de tarjetas de programas (+ para crear uno nuevo)
 *   2) Programa  — editor de documentos: módulos/submódulos a la izquierda,
 *                  documento enriquecido a la derecha.
 * Estado en localStorage (un almacén por tipo de programa). Sin backend.
 */
(function () {
  "use strict";

  var C = window.CEM_BUILDER || {};
  var KIND = C.kind || "Course";
  var LBL = {
    one: C.one || "programa",
    many: C.many || "programas",
    newOne: C.newOne || "Nuevo programa",
    titlePh: C.titlePh || "Nombre del programa",
    heading: C.heading || "Registro de Programas",
    intro: C.intro || "",
    crumb: C.crumb || "Programas"
  };
  var KEY = "cem-builder:" + (C.type || "programa");
  var STATUS = [
    { id: "live", label: "Live", icon: "", cls: "st-live" },
    { id: "prod", label: "En producción", icon: "build", cls: "st-prod" },
    { id: "plan", label: "Planificación", icon: "schedule", cls: "st-plan" }
  ];

  var state = load();
  var route = { view: "registry", p: null, s: null };
  var filter = "all";
  var openMods = {};
  var savedRange = null;
  var root, tick;

  /* ------------------------------------------------ almacenamiento */

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.programs)) return d;
    } catch (e) {}
    return { programs: [] };
  }

  var t = null;
  function save(now) {
    clearTimeout(t);
    function go() {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        toast("Guardado");
      } catch (e) {
        toast("Sin espacio para guardar. Quita imágenes pesadas.", true);
      }
    }
    if (now) go(); else t = setTimeout(go, 600);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // Vuelca cualquier guardado pendiente al instante: al cerrar/ocultar la
  // pestaña no se puede esperar al debounce de 600 ms.
  function flush() {
    if (!t) return;
    clearTimeout(t);
    t = null;
    var doc = root && root.querySelector("#cem-doc");
    if (doc) {
      var f = findSub(prog(), doc.getAttribute("data-id"));
      if (f) f.sub.doc = doc.innerHTML;
    }
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ------------------------------------------------ utilidades */

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
    tt = setTimeout(function () {
      el.className = "cem-toast" + (bad ? " bad" : "");
    }, bad ? 4500 : 1300);
  }

  function ago(ts) {
    if (!ts) return "sin cambios aún";
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "hace instantes";
    var m = Math.floor(s / 60);
    if (m < 60) return "hace " + m + " min";
    var h = Math.floor(m / 60);
    if (h < 24) return "hace " + h + " h";
    return "hace " + Math.floor(h / 24) + " d";
  }

  function prog() {
    for (var i = 0; i < state.programs.length; i++)
      if (state.programs[i].id === route.p) return state.programs[i];
    return null;
  }

  function findSub(p, id) {
    if (!p) return null;
    for (var i = 0; i < p.modules.length; i++)
      for (var j = 0; j < p.modules[i].submodules.length; j++)
        if (p.modules[i].submodules[j].id === id)
          return { mod: p.modules[i], sub: p.modules[i].submodules[j], mi: i, si: j };
    return null;
  }

  function allSubs(p) {
    return p.modules.reduce(function (a, m) { return a.concat(m.submodules); }, []);
  }

  function written(s) {
    return !!(s.doc && s.doc.replace(/<[^>]*>/g, "").trim().length);
  }

  function stats(p) {
    var all = allSubs(p);
    var n = all.length || 1;
    var w = all.filter(written).length;
    var v = all.filter(function (s) { return s.video; }).length;
    var u = all.filter(function (s) { return s.published; }).length;
    return {
      total: all.length,
      w: w, v: v, u: u,
      pw: all.length ? Math.round(w * 100 / n) : 0,
      pv: all.length ? Math.round(v * 100 / n) : 0,
      pu: all.length ? Math.round(u * 100 / n) : 0
    };
  }

  function pct(p) { return stats(p).pw; }

  var METRICS = [
    { key: "w", p: "pw", label: "Avance del guión", cls: "m-write", noun: "documentos escritos" },
    { key: "v", p: "pv", label: "Videos realizados", cls: "m-video", noun: "grabados" },
    { key: "u", p: "pu", label: "Publicación", cls: "m-pub", noun: "publicados" }
  ];

  function metricsCard(p) {
    var st = stats(p);
    return '<div class="card stats-card">' + METRICS.map(function (m) {
      return '<div class="stat">' +
        '<div class="stat-h"><span class="k">' + m.label + '</span>' +
          '<span class="v" data-m="' + m.p + '">' + st[m.p] + "%</span></div>" +
        '<div class="bar"><i class="' + m.cls + '" data-m="' + m.p + '" style="width:' + st[m.p] + '%"></i></div>' +
        '<p class="hint" data-m="' + m.key + '">' + st[m.key] + " de " + st.total + " " + m.noun + "</p>" +
      "</div>";
    }).join("") + "</div>";
  }

  function statusOf(id) {
    for (var i = 0; i < STATUS.length; i++) if (STATUS[i].id === id) return STATUS[i];
    return STATUS[0];
  }

  function ed(val, ph, path, cls, tag) {
    tag = tag || "div";
    return "<" + tag + ' class="ced ' + (cls || "") + '" contenteditable="true" ' +
      'data-path="' + esc(path) + '" data-ph="' + esc(ph) + '">' + esc(val || "") + "</" + tag + ">";
  }

  /* ------------------------------------------------ vista 1: registro */

  function renderRegistry() {
    var list = state.programs.filter(function (p) {
      return filter === "all" || (p.status || "live") === filter;
    });

    var pills = [{ id: "all", label: "Todos los " + LBL.many }]
      .concat(STATUS.map(function (s) { return { id: s.id, label: s.label }; }))
      .map(function (f) {
        return '<button class="pill' + (filter === f.id ? " on" : "") +
          '" data-act="filter" data-id="' + f.id + '">' + esc(f.label) + "</button>";
      }).join("");

    var cards = list.map(function (p) {
      var st = statusOf(p.status);
      var pc = pct(p);
      return '<article class="pcard ' + (p.featured ? "feat" : "kind") + '" data-act="open" data-id="' + p.id + '">' +
        '<div class="pcard-top">' +
          '<span class="badge">' + esc(KIND) + "</span>" +
          '<button class="icobtn star' + (p.featured ? " on" : "") + '" data-act="star" data-id="' + p.id + '" title="Destacar">' +
            '<span class="material-symbols-outlined">star</span></button>' +
          '<button class="icobtn" data-act="menu" data-id="' + p.id + '" title="Opciones">' +
            '<span class="material-symbols-outlined">more_vert</span></button>' +
          '<div class="menu" id="menu-' + p.id + '">' +
            '<button data-act="dup" data-id="' + p.id + '">Duplicar</button>' +
            '<button class="danger" data-act="del" data-id="' + p.id + '">Eliminar</button>' +
          "</div>" +
        "</div>" +
        '<h3 class="pcard-title">' + esc(p.title || LBL.titlePh) + "</h3>" +
        '<p class="pcard-desc">' + esc(p.description || "Sin descripción todavía.") + "</p>" +
        '<div class="pcard-foot">' +
          (p.featured
            ? (function () {
                var st2 = stats(p);
                return METRICS.map(function (m) {
                  return '<div class="mini"><div class="foot-row"><span>' + m.label + "</span><b>" +
                    st2[m.p] + '%</b></div><div class="bar"><i class="' + m.cls +
                    '" style="width:' + st2[m.p] + '%"></i></div></div>';
                }).join("");
              })()
            : '<div><p class="foot-k">Módulos</p><p class="foot-v">' + p.modules.length + "</p></div>" +
              '<button class="status ' + st.cls + '" data-act="status" data-id="' + p.id + '" title="Cambiar estado">' +
                (st.icon ? '<span class="material-symbols-outlined">' + st.icon + "</span>" : '<i class="dot"></i>') +
                esc(st.label) + "</button>") +
        "</div>" +
      "</article>";
    }).join("");

    var empty = list.length ? "" :
      '<p class="empty">' + (state.programs.length
        ? "Ningún " + esc(LBL.one) + " con ese estado."
        : "Aún no has creado ningún " + esc(LBL.one) + ". Pulsa el botón + para empezar.") + "</p>";

    return '<header class="reg-head">' +
        "<div><h2>" + esc(LBL.heading) + "</h2><p>" + esc(LBL.intro) + "</p></div>" +
        '<div class="pills">' + pills + "</div>" +
      "</header>" + empty +
      '<div class="pgrid">' + cards + "</div>" +
      '<button class="fab" data-act="new" title="' + esc(LBL.newOne) + '">' +
        '<span class="material-symbols-outlined">add</span></button>';
  }

  /* ------------------------------------------------ vista 2: programa */

  function renderProgram() {
    var p = prog();
    if (!p) { route.view = "registry"; return renderRegistry(); }

    var found = findSub(p, route.s);
    if (!found) {
      var first = allSubs(p)[0];
      if (first) { route.s = first.id; found = findSub(p, route.s); }
    }
    if (found) openMods[found.mod.id] = true;

    /* --- columna izquierda: avance + módulos --- */
    var pc = pct(p);
    var mods = p.modules.map(function (m, mi) {
      var isOpen = openMods[m.id];
      var done = m.submodules.length && m.submodules.every(written);
      var here = found && found.mod.id === m.id;
      var icon = done
        ? '<span class="material-symbols-outlined ok">check_circle</span>'
        : here
          ? '<span class="ring"><i></i></span>'
          : '<span class="material-symbols-outlined off">radio_button_unchecked</span>';

      var subs = m.submodules.map(function (s, si) {
        var on = found && found.sub.id === s.id;
        return '<div class="sitem' + (on ? " on" : "") + '" data-act="open-sub" data-id="' + s.id + '">' +
          '<span class="sdot"></span>' +
          '<span class="stxt">' + esc(s.title || "Submódulo sin título") + "</span>" +
          '<span class="sflags">' +
            (s.video ? '<span class="material-symbols-outlined fv" title="Hecho en video">videocam</span>' : "") +
            (s.published ? '<span class="material-symbols-outlined fp" title="Publicado">public</span>' : "") +
          "</span>" +
          '<span class="sdur">' + esc(s.duration || "—") + "</span>" +
          '<button class="xbtn" data-act="del-sub" data-id="' + s.id + '" title="Eliminar">&times;</button>' +
        "</div>";
      }).join("");

      return '<div class="mod' + (isOpen ? " open" : "") + '">' +
        '<div class="mhead" data-act="toggle" data-id="' + m.id + '">' +
          icon +
          ed(m.title, "Nombre del módulo", "mod." + m.id + ".title", "mtitle") +
          '<button class="xbtn" data-act="del-mod" data-id="' + m.id + '" title="Eliminar">&times;</button>' +
          '<span class="material-symbols-outlined chev">' + (isOpen ? "expand_more" : "chevron_right") + "</span>" +
        "</div>" +
        '<div class="msubs">' + subs +
          '<button class="miniadd" data-act="add-sub" data-id="' + m.id + '">+ Submódulo</button>' +
        "</div>" +
      "</div>";
    }).join("");

    var left = metricsCard(p) +
      '<div class="card mods-card">' +
        '<h3 class="mods-h"><span class="material-symbols-outlined">list</span> Módulos</h3>' +
        (p.modules.length ? mods : '<p class="empty sm">Sin módulos todavía.</p>') +
        '<button class="addbtn" data-act="add-mod"><span class="material-symbols-outlined">add</span> Nuevo módulo</button>' +
      "</div>";

    /* --- columna derecha: documento --- */
    var right;
    if (!found) {
      right = '<div class="card doc-empty">' +
        '<span class="material-symbols-outlined">description</span>' +
        "<h3>Sin documentos todavía</h3>" +
        "<p>Crea un módulo y dentro un submódulo. Cada submódulo es un documento donde escribes el guión de esa clase.</p>" +
        '<button class="addbtn solid" data-act="add-mod"><span class="material-symbols-outlined">add</span> Crear primer módulo</button>' +
      "</div>";
    } else {
      var s = found.sub;
      right =
        '<div class="card doc-head">' +
          "<div class=\"dh-left\">" +
            ed(s.title, "Título del documento", "sub." + s.id + ".title", "dh-title", "h3") +
            '<div class="dh-meta">' +
              '<span class="material-symbols-outlined">timer</span>' +
              ed(s.duration, "20 mins", "sub." + s.id + ".duration", "dh-dur", "span") +
              '<span class="sep">•</span>' +
              '<span class="material-symbols-outlined">visibility</span>' +
              "<span>Submódulo " + (found.mi + 1) + "." + (found.si + 1) + "</span>" +
            "</div>" +
            '<div class="checks">' +
              '<button class="chk' + (s.video ? " on vid" : "") + '" data-act="chk" data-f="video" data-id="' + s.id + '">' +
                '<span class="material-symbols-outlined box">' + (s.video ? "check_box" : "check_box_outline_blank") + "</span>" +
                '<span class="material-symbols-outlined ic">videocam</span> Hecho en video</button>' +
              '<button class="chk' + (s.published ? " on pub" : "") + '" data-act="chk" data-f="published" data-id="' + s.id + '">' +
                '<span class="material-symbols-outlined box">' + (s.published ? "check_box" : "check_box_outline_blank") + "</span>" +
                '<span class="material-symbols-outlined ic">public</span> Publicado</button>' +
            "</div>" +
          "</div>" +
          '<div class="dh-actions">' +
            '<button class="btn ghost" data-act="save-now"><span class="material-symbols-outlined">bookmark</span> Guardar</button>' +
            '<button class="btn solid" data-act="video"><span class="material-symbols-outlined">play_circle</span> Video</button>' +
          "</div>" +
        "</div>" +
        '<div class="card doc-card">' +
          '<div class="tools">' +
            '<div class="tgrp">' +
              '<button data-cmd="bold" title="Negrita"><span class="material-symbols-outlined">format_bold</span></button>' +
              '<button data-cmd="italic" title="Cursiva"><span class="material-symbols-outlined">format_italic</span></button>' +
              '<button data-cmd="underline" title="Subrayado"><span class="material-symbols-outlined">format_underlined</span></button>' +
            "</div>" +
            '<div class="tgrp">' +
              '<button data-block="H1" title="Título 1"><span class="material-symbols-outlined">format_h1</span></button>' +
              '<button data-block="H2" title="Título 2"><span class="material-symbols-outlined">format_h2</span></button>' +
              '<button data-block="BLOCKQUOTE" title="Cita"><span class="material-symbols-outlined">format_quote</span></button>' +
              '<button data-cmd="insertUnorderedList" title="Lista"><span class="material-symbols-outlined">format_list_bulleted</span></button>' +
            "</div>" +
            '<div class="tgrp">' +
              '<button class="wide" data-act="insert-media">' +
                '<span class="material-symbols-outlined">add_photo_alternate</span> Insertar imagen</button>' +
            "</div>" +
            '<span class="edited">Editado ' + esc(ago(s.edited)) + "</span>" +
          "</div>" +
          '<div class="doc" id="cem-doc" contenteditable="true" data-id="' + s.id +
            '" data-ph="Escribe aquí el guión y el contenido de esta clase…">' + (s.doc || "") + "</div>" +
        "</div>";
    }

    return '<nav class="crumbs">' +
        '<button data-act="home">' + esc(LBL.crumb) + "</button>" +
        '<span class="material-symbols-outlined">chevron_right</span>' +
        '<span class="now">' + esc(p.title || LBL.titlePh) + "</span>" +
        (found ? '<span class="material-symbols-outlined">chevron_right</span><span class="now">' +
                 esc(found.sub.title || "Documento") + "</span>" : "") +
      "</nav>" +
      '<header class="prog-head">' +
        ed(p.title, LBL.titlePh, "program.title", "ptitle", "h1") +
        ed(p.description, "Descripción del " + LBL.one + "…", "program.description", "pdesc") +
      "</header>" +
      '<div class="layout"><aside class="col-l">' + left + "</aside>" +
      '<section class="col-r">' + right + "</section></div>";
  }

  function render() {
    root.innerHTML = route.view === "registry" ? renderRegistry() : renderProgram();
  }

  /* ------------------------------------------------ acciones */

  function newProgram() {
    var p = {
      id: uid(), title: "", description: "", status: "plan",
      featured: false, modules: []
    };
    state.programs.unshift(p);
    save(true);
    route = { view: "program", p: p.id, s: null };
    render();
    focus(".ptitle");
  }

  function addModule() {
    var p = prog(); if (!p) return;
    var m = { id: uid(), title: "", submodules: [] };
    p.modules.push(m);
    openMods[m.id] = true;
    addSub(m.id, true);
  }

  function addSub(modId, silent) {
    var p = prog(); if (!p) return;
    var m = null;
    for (var i = 0; i < p.modules.length; i++) if (p.modules[i].id === modId) m = p.modules[i];
    if (!m) return;
    var s = { id: uid(), title: "", duration: "", doc: "", edited: 0, video: false, published: false };
    m.submodules.push(s);
    openMods[m.id] = true;
    route.s = s.id;
    save(true);
    render();
    focus(silent ? ".mtitle" : ".dh-title");
  }

  function focus(sel) {
    var e = root.querySelector(sel);
    if (e) { e.focus(); placeCaretEnd(e); }
  }

  function placeCaretEnd(el) {
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    } catch (e) {}
  }

  function setPath(path, val) {
    var a = path.split(".");
    var p = prog();
    if (a[0] === "program" && p) p[a[1]] = val;
    else if (a[0] === "mod" && p) {
      for (var i = 0; i < p.modules.length; i++)
        if (p.modules[i].id === a[1]) p.modules[i][a[2]] = val;
    } else if (a[0] === "sub" && p) {
      var f = findSub(p, a[1]);
      if (f) f.sub[a[2]] = val;
    }
  }

  function closeMenus() {
    var m = root.querySelectorAll(".menu.on");
    for (var i = 0; i < m.length; i++) m[i].classList.remove("on");
  }

  /* ------------------------------------------------ eventos */

  function bind() {
    root.addEventListener("mousedown", function (e) {
      // conserva la selección del documento antes de pulsar la barra
      if (e.target.closest(".tools")) {
        var sel = window.getSelection();
        if (sel.rangeCount && root.querySelector("#cem-doc") &&
            root.querySelector("#cem-doc").contains(sel.anchorNode)) {
          savedRange = sel.getRangeAt(0).cloneRange();
        }
        e.preventDefault();
      }
    });

    root.addEventListener("click", function (e) {
      var b = e.target.closest("button, [data-act]");
      if (!b) { closeMenus(); return; }
      var act = b.getAttribute("data-act");
      var id = b.getAttribute("data-id");

      // barra de formato
      var cmd = b.getAttribute("data-cmd");
      var blk = b.getAttribute("data-block");
      if (cmd || blk) {
        e.preventDefault();
        restoreRange();
        if (cmd) document.execCommand(cmd, false, null);
        else document.execCommand("formatBlock", false, blk);
        syncDoc();
        return;
      }

      if (act === "insert-media") { e.preventDefault(); pickImage(); return; }

      if (act !== "menu") closeMenus();

      switch (act) {
        case "new": newProgram(); return;
        case "filter": filter = id; render(); return;
        case "open":
          route = { view: "program", p: id, s: null };
          render(); window.scrollTo(0, 0); return;
        case "home":
          route = { view: "registry", p: null, s: null };
          render(); window.scrollTo(0, 0); return;
        case "status": {
          e.stopPropagation();
          var ps = byId(id);
          if (ps) {
            var i = 0;
            for (var k = 0; k < STATUS.length; k++) if (STATUS[k].id === (ps.status || "live")) i = k;
            ps.status = STATUS[(i + 1) % STATUS.length].id;
          }
          save(true); render(); return;
        }
        case "star": {
          e.stopPropagation();
          var pr = byId(id); if (pr) pr.featured = !pr.featured;
          save(true); render(); return;
        }
        case "menu": {
          e.stopPropagation();
          var mn = root.querySelector("#menu-" + id);
          var was = mn && mn.classList.contains("on");
          closeMenus();
          if (mn && !was) mn.classList.add("on");
          return;
        }
        case "dup": {
          e.stopPropagation();
          var src = byId(id);
          if (src) {
            var copy = JSON.parse(JSON.stringify(src));
            copy.id = uid();
            copy.title = (src.title || LBL.titlePh) + " (copia)";
            copy.modules.forEach(function (m) {
              m.id = uid();
              m.submodules.forEach(function (s) { s.id = uid(); });
            });
            state.programs.splice(state.programs.indexOf(src) + 1, 0, copy);
            save(true); render();
          }
          return;
        }
        case "del": {
          e.stopPropagation();
          if (!confirm("¿Eliminar este " + LBL.one + " y todo su contenido?")) return;
          state.programs = state.programs.filter(function (x) { return x.id !== id; });
          save(true); render(); return;
        }
        case "add-mod": addModule(); return;
        case "add-sub": e.stopPropagation(); addSub(id); return;
        case "toggle": {
          if (e.target.closest(".mtitle")) return;
          openMods[id] = !openMods[id];
          render(); return;
        }
        case "open-sub": {
          if (e.target.closest(".xbtn")) return;
          route.s = id; render(); return;
        }
        case "del-mod": {
          e.stopPropagation();
          if (!confirm("¿Eliminar este módulo y sus documentos?")) return;
          var pp = prog();
          pp.modules = pp.modules.filter(function (m) { return m.id !== id; });
          save(true); render(); return;
        }
        case "del-sub": {
          e.stopPropagation();
          if (!confirm("¿Eliminar este submódulo y su documento?")) return;
          var p2 = prog();
          p2.modules.forEach(function (m) {
            m.submodules = m.submodules.filter(function (x) { return x.id !== id; });
          });
          if (route.s === id) route.s = null;
          save(true); render(); return;
        }
        case "chk": {
          e.stopPropagation();
          var fx = findSub(prog(), id);
          if (!fx) return;
          var key = b.getAttribute("data-f");
          fx.sub[key] = !fx.sub[key];
          syncDoc();
          save(true);
          var y = window.scrollY;
          render();
          window.scrollTo(0, y);
          return;
        }
        case "save-now": syncDoc(); save(true); return;
        case "video": {
          var f = findSub(prog(), route.s);
          if (!f) return;
          var url = prompt("URL del video de esta clase:", f.sub.video || "");
          if (url === null) return;
          f.sub.video = url.trim();
          save(true);
          if (f.sub.video) window.open(f.sub.video, "_blank", "noopener");
          return;
        }
      }
    });

    root.addEventListener("input", function (e) {
      var f = e.target.closest(".ced");
      if (f) {
        setPath(f.getAttribute("data-path"), f.textContent.trim());
        save();
        var live = root.querySelector(".sitem.on .stxt");
        if (live && f.classList.contains("dh-title")) live.textContent = f.textContent.trim() || "Submódulo sin título";
        var ld = root.querySelector(".sitem.on .sdur");
        if (ld && f.classList.contains("dh-dur")) ld.textContent = f.textContent.trim() || "—";
        return;
      }
      if (e.target.id === "cem-doc") syncDoc();
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".pcard")) closeMenus();
    });
  }

  function byId(id) {
    for (var i = 0; i < state.programs.length; i++)
      if (state.programs[i].id === id) return state.programs[i];
    return null;
  }

  function restoreRange() {
    var doc = root.querySelector("#cem-doc");
    if (!doc) return;
    doc.focus();
    if (savedRange) {
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(savedRange);
    }
  }

  function syncDoc() {
    var doc = root.querySelector("#cem-doc");
    if (!doc) return;
    var f = findSub(prog(), doc.getAttribute("data-id"));
    if (!f) return;
    f.sub.doc = doc.innerHTML;
    f.sub.edited = Date.now();
    save();
    refreshProgress(f);
  }

  // Refresca avance / icono de módulo / "Editado…" sin re-renderizar la vista,
  // para no mover el cursor mientras se escribe.
  function refreshProgress(f) {
    var p = prog();
    if (!p) return;
    var st = stats(p);
    METRICS.forEach(function (m) {
      var v = root.querySelector('.stat .v[data-m="' + m.p + '"]');
      if (v) v.textContent = st[m.p] + "%";
      var bar = root.querySelector('.stat .bar i[data-m="' + m.p + '"]');
      if (bar) bar.style.width = st[m.p] + "%";
      var hint = root.querySelector('.stat .hint[data-m="' + m.key + '"]');
      if (hint) hint.textContent = st[m.key] + " de " + st.total + " " + m.noun;
    });
    var edt = root.querySelector(".edited");
    if (edt) edt.textContent = "Editado " + ago(f.sub.edited);

    // icono del módulo actual (completo / en curso), sin tocar su título
    var head = root.querySelector(".sitem.on");
    head = head && head.closest(".mod");
    head = head && head.querySelector(".mhead");
    if (!head) return;
    var isDone = f.mod.submodules.length && f.mod.submodules.every(written);
    var cur = head.firstElementChild;
    var wantDone = cur.classList.contains("ok");
    if (isDone === wantDone) return;
    var el = document.createElement("span");
    if (isDone) {
      el.className = "material-symbols-outlined ok";
      el.textContent = "check_circle";
    } else {
      el.className = "ring";
      el.appendChild(document.createElement("i"));
    }
    head.replaceChild(el, cur);
  }

  function pickImage() {
    var inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = function () {
      var file = inp.files && inp.files[0];
      if (!file) return;
      var r = new FileReader();
      r.onload = function (ev) {
        restoreRange();
        document.execCommand("insertImage", false, ev.target.result);
        syncDoc();
      };
      r.readAsDataURL(file);
    };
    inp.click();
  }

  /* ------------------------------------------------ estilos */

  function styles() {
    var css = [
      "#cem-root{font-family:Poppins,sans-serif;color:#191c1d}",
      "#cem-root *{box-sizing:border-box}",
      "#cem-root button{font-family:inherit}",
      ".card{background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);border-top:1px solid rgba(255,255,255,.9);border-left:1px solid rgba(255,255,255,.9);border-right:1px solid rgba(255,255,255,.45);border-bottom:1px solid rgba(255,255,255,.45);box-shadow:0 20px 40px rgba(0,0,0,.04);border-radius:16px}",
      ".empty{font-size:14px;color:#747878;margin:6px 0 22px}",
      ".empty.sm{margin:4px 0 10px;font-size:13px}",

      /* --- registro --- */
      ".reg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:26px}",
      ".reg-head h2{font-size:34px;font-weight:700;letter-spacing:-.02em;line-height:1.15;color:#060607}",
      ".reg-head p{font-size:16px;color:#444748;margin-top:4px;max-width:56ch}",
      ".pills{display:flex;gap:10px;flex-wrap:wrap}",
      ".pill{background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.9);box-shadow:0 6px 16px rgba(0,0,0,.05);border-radius:9999px;padding:9px 20px;font-size:14px;font-weight:500;color:#444748;cursor:pointer;white-space:nowrap}",
      ".pill.on{color:#0053ce;border-color:#0053ce;font-weight:600}",
      ".pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:26px;align-items:start}",
      ".pcard{position:relative;border-radius:18px;padding:22px;min-height:300px;display:flex;flex-direction:column;cursor:pointer;border:1px solid rgba(255,255,255,.75);box-shadow:0 18px 38px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s;text-align:left}",
      ".pcard:hover{transform:translateY(-4px);box-shadow:0 26px 52px rgba(0,0,0,.09)}",
      ".pcard.kind{background:linear-gradient(150deg," + (C.g1 || "#e9edfb") + " 0%," + (C.g2 || "#f8f9fe") + " 42%,#fff 100%)}",
      ".pcard.feat{background:linear-gradient(150deg,#dde8fb 0%,#eaf1fd 50%,#f6f9ff 100%)}",
      ".pcard-top{display:flex;align-items:center;gap:6px;margin-bottom:16px}",
      ".badge{background:" + (C.b1 || "#dbe6fb") + ";color:" + (C.b2 || "#2563eb") + ";font-size:13px;font-weight:500;padding:6px 14px;border-radius:8px;margin-right:auto}",
      ".icobtn{background:none;border:none;color:#9aa0a0;cursor:pointer;padding:2px;display:flex;border-radius:6px}",
      ".icobtn:hover{color:#191c1d;background:rgba(0,0,0,.05)}",
      ".icobtn.star{opacity:0}.pcard:hover .icobtn.star,.icobtn.star.on{opacity:1}",
      ".icobtn.star.on{color:#0053ce}",
      ".pcard-title{font-size:25px;font-weight:700;line-height:1.18;color:#060607;margin-bottom:10px;word-break:break-word}",
      ".pcard-desc{font-size:13.5px;line-height:1.5;color:#5c6060;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".pcard-foot{margin-top:auto;padding-top:22px;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;flex-wrap:wrap}",
      ".foot-k{font-size:13px;color:#5c6060}",
      ".foot-v{font-size:21px;font-weight:500;color:#191c1d;margin-top:2px}",
      ".foot-row{display:flex;justify-content:space-between;width:100%;font-size:13px;color:#5c6060;margin-top:8px}",
      ".foot-row b{color:#191c1d;font-weight:600}",
      ".status{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:500;white-space:nowrap;background:none;border:none;padding:2px 4px;border-radius:7px;cursor:pointer}",
      "button.status:hover{background:rgba(0,0,0,.06)}",
      ".status .material-symbols-outlined{font-size:15px}",
      ".status .dot{width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block}",
      ".st-live{color:#16a34a}.st-prod{color:#ea580c}.st-plan{color:#2563eb}",
      ".pcard .bar{width:100%}",
      ".menu{position:absolute;top:52px;right:16px;background:#fff;border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.16);padding:6px;display:none;flex-direction:column;min-width:150px;z-index:20}",
      ".menu.on{display:flex}",
      ".menu button{background:none;border:none;text-align:left;padding:9px 12px;font-size:13.5px;border-radius:8px;cursor:pointer;color:#191c1d}",
      ".menu button:hover{background:#f2f4f5}",
      ".menu button.danger{color:#ba1a1a}",
      ".fab{position:fixed;right:34px;bottom:34px;width:58px;height:58px;border-radius:50%;border:none;background:linear-gradient(135deg,#0053ce,#2a6cf0);color:#fff;box-shadow:0 14px 30px rgba(0,83,206,.36);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:60;transition:transform .2s}",
      ".fab:hover{transform:scale(1.07)}",
      ".fab .material-symbols-outlined{font-size:30px}",

      /* --- programa --- */
      ".crumbs{display:flex;align-items:center;gap:6px;font-size:13px;margin-bottom:10px;flex-wrap:wrap}",
      ".crumbs button{background:none;border:none;color:#0053ce;font-size:13px;font-weight:500;cursor:pointer;padding:0}",
      ".crumbs button:hover{text-decoration:underline}",
      ".crumbs .now{color:#5c6060}",
      ".crumbs .material-symbols-outlined{font-size:16px;color:#c4c7c7}",
      ".prog-head{margin-bottom:26px}",
      ".ptitle{font-size:36px;font-weight:700;letter-spacing:-.02em;line-height:1.15;color:#060607;outline:none}",
      ".pdesc{font-size:16px;line-height:1.55;color:#444748;max-width:70ch;margin-top:6px;outline:none}",
      ".layout{display:grid;grid-template-columns:340px minmax(0,1fr);gap:26px;align-items:start}",
      "@media(max-width:1020px){.layout{grid-template-columns:1fr}}",
      ".col-l{display:flex;flex-direction:column;gap:22px;position:sticky;top:88px}",
      "@media(max-width:1020px){.col-l{position:static}}",
      ".col-r{display:flex;flex-direction:column;gap:22px;min-width:0}",

      ".stats-card{padding:18px 20px;display:flex;flex-direction:column;gap:16px}",
      ".stat .stat-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px}",
      ".stat .k{font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#747878}",
      ".stat .v{font-size:19px;font-weight:700;color:#060607}",
      ".stat .hint{font-size:11.5px;color:#9aa0a0;margin-top:6px}",
      ".m-write{background:linear-gradient(90deg,#0053ce,#00b4d8)}",
      ".m-video{background:linear-gradient(90deg,#7c3aed,#c026d3)}",
      ".m-pub{background:linear-gradient(90deg,#15803d,#65a30d)}",
      ".pcard .mini{width:100%;margin-bottom:9px}",
      ".pcard .mini:last-child{margin-bottom:0}",
      ".pcard .mini .bar{height:6px;margin-top:3px}",
      ".pcard .mini .foot-row{margin-top:0;font-size:12px}",
      ".checks{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}",
      ".chk{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:#747878;background:rgba(255,255,255,.6);border:1px solid #e1e3e4;border-radius:9999px;padding:7px 14px 7px 10px;cursor:pointer;white-space:nowrap}",
      ".chk:hover{border-color:#c4c7c7;color:#444748}",
      ".chk .box{font-size:18px}",
      ".chk .ic{font-size:16px}",
      ".chk.on.vid{color:#7c3aed;border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.09)}",
      ".chk.on.pub{color:#15803d;border-color:rgba(21,128,61,.4);background:rgba(21,128,61,.09)}",
      ".sflags{display:flex;align-items:center;gap:3px;flex-shrink:0}",
      ".sflags .material-symbols-outlined{font-size:14px}",
      ".sflags .fv{color:#7c3aed}",
      ".sflags .fp{color:#15803d}",
      ".prog-card{padding:20px}",
      ".prog-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}",
      ".prog-card .k{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#747878}",
      ".prog-card .v{font-size:30px;font-weight:700;color:#060607;margin-top:2px}",
      ".prog-ico{width:40px;height:40px;border-radius:50%;background:rgba(0,83,206,.1);color:#0053ce;display:flex;align-items:center;justify-content:center}",
      ".bar{height:8px;border-radius:9999px;background:#e1e3e4;overflow:hidden}",
      ".bar i{display:block;height:100%;border-radius:9999px;background:linear-gradient(90deg,#0053ce,#00b4d8)}",
      ".prog-card .hint{font-size:12px;color:#747878;margin-top:8px}",

      ".mods-card{padding:18px}",
      ".mods-h{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:#060607;margin-bottom:12px}",
      ".mods-h .material-symbols-outlined{font-size:19px;color:#0053ce}",
      ".mod{border-radius:12px;margin-bottom:4px}",
      ".mhead{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;cursor:pointer;border:1px solid transparent}",
      ".mhead:hover{background:rgba(255,255,255,.6);border-color:rgba(255,255,255,.9)}",
      ".mod.open>.mhead{background:rgba(255,255,255,.75);border-color:rgba(255,255,255,.95);box-shadow:0 2px 8px rgba(0,0,0,.04)}",
      ".mtitle{flex:1;min-width:0;font-size:14px;font-weight:600;color:#191c1d;outline:none}",
      ".mod.open>.mhead .mtitle{color:#060607}",
      ".mhead .ok{color:#16a34a;font-size:21px}",
      ".mhead .off{color:#c4c7c7;font-size:21px}",
      ".ring{width:19px;height:19px;border-radius:50%;border:2px solid #0053ce;display:flex;align-items:center;justify-content:center;flex-shrink:0}",
      ".ring i{width:9px;height:9px;border-radius:50%;background:#0053ce;display:block}",
      ".chev{color:#747878;font-size:19px}",
      ".msubs{display:none;flex-direction:column;gap:2px;margin:2px 0 8px 21px;padding-left:11px;border-left:1px solid #e1e3e4}",
      ".mod.open .msubs{display:flex}",
      ".sitem{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:9px;cursor:pointer;color:#5c6060;position:relative}",
      ".sitem:hover{background:rgba(255,255,255,.7);color:#191c1d}",
      ".sitem.on{color:#0053ce;font-weight:500}",
      ".sdot{width:6px;height:6px;border-radius:50%;background:transparent;flex-shrink:0}",
      ".sitem.on .sdot{background:#0053ce}",
      ".stxt{flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".sdur{font-size:12px;color:#747878;white-space:nowrap}",
      ".sitem.on .sdur{background:rgba(0,83,206,.1);color:#0053ce;padding:2px 8px;border-radius:6px}",
      ".xbtn{position:absolute;right:4px;background:rgba(255,255,255,.95);border:1px solid rgba(186,26,26,.25);color:#ba1a1a;width:20px;height:20px;border-radius:50%;font-size:14px;line-height:1;cursor:pointer;display:none;align-items:center;justify-content:center;padding:0}",
      ".sitem:hover .xbtn,.mhead:hover .xbtn{display:flex}",
      ".mhead .xbtn{position:static;flex-shrink:0}",
      ".miniadd{background:none;border:none;color:#0053ce;font-size:12.5px;font-weight:600;text-align:left;padding:7px 9px;cursor:pointer;border-radius:8px}",
      ".miniadd:hover{background:rgba(0,83,206,.08)}",
      ".addbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:10px;padding:10px;border:2px dashed rgba(0,83,206,.35);background:rgba(0,83,206,.05);color:#0053ce;font-size:13px;font-weight:600;border-radius:11px;cursor:pointer}",
      ".addbtn:hover{background:rgba(0,83,206,.1)}",
      ".addbtn .material-symbols-outlined{font-size:18px}",
      ".addbtn.solid{border:none;background:linear-gradient(135deg,#0053ce,#2a6cf0);color:#fff;width:auto;padding:11px 22px;border-radius:9999px;margin-top:16px}",

      ".doc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:20px 22px;flex-wrap:wrap}",
      ".dh-title{font-size:23px;font-weight:600;line-height:1.25;color:#060607;outline:none}",
      ".dh-meta{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#747878;margin-top:6px;flex-wrap:wrap}",
      ".dh-meta .material-symbols-outlined{font-size:15px}",
      ".dh-dur{outline:none;min-width:38px}",
      ".dh-meta .sep{color:#c4c7c7}",
      ".dh-actions{display:flex;gap:10px;flex-shrink:0}",
      ".btn{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;padding:10px 18px;border-radius:10px;cursor:pointer;border:1px solid transparent;white-space:nowrap}",
      ".btn .material-symbols-outlined{font-size:18px}",
      ".btn.ghost{background:rgba(255,255,255,.7);border-color:rgba(255,255,255,.95);color:#191c1d}",
      ".btn.ghost:hover{background:#fff}",
      ".btn.solid{background:linear-gradient(135deg,#0053ce,#2a6cf0);color:#fff}",
      ".btn.solid:hover{box-shadow:0 10px 22px rgba(0,83,206,.3)}",

      ".doc-card{overflow:hidden}",
      ".tools{display:flex;align-items:center;gap:14px;padding:11px 16px;border-bottom:1px solid #e6e8e9;background:rgba(255,255,255,.5);flex-wrap:wrap}",
      ".tgrp{display:flex;align-items:center;gap:3px;padding-right:14px;border-right:1px solid #e6e8e9}",
      ".tgrp:last-of-type{border-right:none;padding-right:0}",
      ".tools button{background:none;border:none;cursor:pointer;color:#191c1d;padding:6px;border-radius:7px;display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500}",
      ".tools button:hover{background:rgba(0,0,0,.06)}",
      ".tools button.wide{background:rgba(225,227,228,.5);padding:6px 13px}",
      ".tools .material-symbols-outlined{font-size:19px}",
      ".edited{margin-left:auto;font-size:12px;color:#9aa0a0;white-space:nowrap}",
      ".doc{padding:34px 40px 60px;min-height:520px;outline:none;font-size:16px;line-height:1.65;color:#2b2f30}",
      "@media(max-width:700px){.doc{padding:22px 20px 44px}}",
      ".doc:empty:before{content:attr(data-ph);color:#a9adad}",
      ".doc h1{font-size:31px;font-weight:700;line-height:1.2;color:#060607;margin:8px 0 18px}",
      ".doc h2{font-size:22px;font-weight:600;line-height:1.3;color:#060607;margin:30px 0 12px}",
      ".doc h3{font-size:18px;font-weight:600;color:#060607;margin:22px 0 10px}",
      ".doc p{margin:0 0 15px}",
      ".doc ul,.doc ol{margin:0 0 18px;padding-left:26px}",
      ".doc li{margin-bottom:7px}",
      ".doc blockquote{margin:22px 0;padding:16px 20px;background:rgba(0,83,206,.06);border-left:4px solid #0053ce;border-radius:0 10px 10px 0;color:#2b2f30}",
      ".doc img{max-width:100%;height:auto;border-radius:12px;margin:14px 0;display:block}",
      ".doc a{color:#0053ce}",

      ".doc-empty{padding:70px 30px;text-align:center;display:flex;flex-direction:column;align-items:center}",
      ".doc-empty .material-symbols-outlined{font-size:52px;color:#c4c7c7;margin-bottom:12px}",
      ".doc-empty h3{font-size:19px;font-weight:600;color:#060607;margin-bottom:6px}",
      ".doc-empty p{font-size:14px;color:#747878;max-width:44ch;line-height:1.6}",

      ".ced:empty:before{content:attr(data-ph);color:#a9adad;pointer-events:none}",
      ".cem-toast{position:fixed;left:22px;bottom:22px;z-index:9999;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;color:#0f5132;background:rgba(255,255,255,.95);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.9);box-shadow:0 12px 32px rgba(0,0,0,.12);border-radius:9999px;padding:10px 20px;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;pointer-events:none}",
      ".cem-toast.on{opacity:1;transform:translateY(0)}",
      ".cem-toast.bad{color:#93000a}"
    ].join("");
    var el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ------------------------------------------------ arranque */

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
    // refresca el "Editado hace…" sin tocar lo que estás escribiendo
    tick = setInterval(function () {
      var e = root.querySelector(".edited");
      if (!e) return;
      var f = findSub(prog(), route.s);
      if (f) e.textContent = "Editado " + ago(f.sub.edited);
    }, 30000);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
