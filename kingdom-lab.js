/* Kingdom Lab — Cotizador
 * Asistente de 5 pasos: Tus datos, Organización, Servicios, Cantidades, Plan.
 * Fotografía y Audiovisual se cotizan por proyecto (cantidades libres).
 * Visuales es un plan mensual de diseño, con cantidades sugeridas por
 * sección que el cliente puede reasignar (mismo mecanismo en cada sección:
 * total sugerido, distribución por estilo, botón para restablecer).
 * Estado en localStorage. Sin backend.
 */
(function () {
  "use strict";

  var KEY = "kingdom-lab-cotizador";

  /* ---------------------------------------- catálogo */

  var STEPS = ["datos", "organizacion", "servicios", "cantidades", "plan"];
  var STEP_LABELS = {
    datos: "Tus datos",
    organizacion: "Organización",
    servicios: "Servicios",
    cantidades: "Cantidades",
    plan: "Plan"
  };

  var ORG_TYPES = [
    { id: "personal", name: "Marca personal", factor: 1.00, tag: "Precio base",
      desc: "Perfil profesional o negocio individual, sin equipo de aprobación." },
    { id: "b2c", name: "Marca comercial B2C", factor: 1.20, tag: "+20%",
      desc: "Negocio que vende directo al consumidor final." },
    { id: "b2b", name: "Fábrica, industria o B2B técnico", factor: 1.40, tag: "+40%",
      desc: "Producto o servicio técnico vendido a otras empresas." },
    { id: "institucion", name: "Institución, organismo o marca institucional", factor: 1.60, tag: "+60%",
      desc: "Marca con procesos formales de validación y aprobación." }
  ];
  var ORG_NOTE = "El tipo de organización modifica la inversión porque cambia el nivel de investigación, validación, coordinación, lenguaje y aprobación requerido.";

  var CATEGORIES = [
    { id: "fotografia", name: "Fotografía", icon: "photo_camera",
      desc: "Corporativa, comercial y de producto — por persona, por foto o por producto." },
    { id: "audiovisual", name: "Audiovisual", icon: "videocam",
      desc: "Video, historias en movimiento y contenido hablado." },
    { id: "visuales", name: "Visuales", icon: "palette",
      desc: "Diseño gráfico para redes: posts, historias y carruseles." }
  ];

  var LOCATION_NOTE = "Traslados extraordinarios, locaciones fuera de cobertura, permisos, talentos, utilería o producción especial se cotizan por separado.";

  var CATALOG = {
    fotografia: {
      mode: "project",
      sections: [
        { id: "corporativa", name: "Fotografía corporativa", unit: "persona",
          desc: "La cantidad es el número de personas fotografiadas.",
          items: [
            { id: "headshot-std", name: "Headshot individual estándar", price: 12,
              desc: "Retrato profesional individual, 1–2 poses, fondo neutro." },
            { id: "headshot-dir", name: "Headshot con dirección de poses y vestuario", price: 18,
              desc: "Sesión guiada con más variedad de poses y encuadres." },
            { id: "equipo-actividad", name: "Cobertura de equipo en actividad", price: 15,
              desc: "Personal trabajando o interactuando; se cuenta por persona incluida." }
          ] },
        { id: "comercial", name: "Fotografía comercial", unit: "foto",
          desc: "La cantidad es el número de fotos entregadas.",
          items: [
            { id: "com-basica", name: "Foto comercial básica", price: 10,
              desc: "Producto o servicio en uso, luz natural, sin dirección de arte." },
            { id: "com-arte", name: "Foto comercial con dirección de arte", price: 16,
              desc: "Composición cuidada, props básicos y retoque de color." },
            { id: "com-locacion", name: "Foto comercial con locación y ambientación", price: 24,
              desc: "Incluye escenografía o ambientación adicional en la toma." }
          ] },
        { id: "producto", name: "Fotografía de producto", unit: "producto",
          desc: "La cantidad es el número de productos distintos.",
          items: [
            { id: "prod-blanco", name: "Producto en fondo blanco (catálogo)", price: 6,
              desc: "Ideal para tienda en línea o catálogo." },
            { id: "prod-lifestyle", name: "Producto en contexto / lifestyle", price: 10,
              desc: "El producto se muestra en uso o dentro de una escena." },
            { id: "prod-retoque", name: "Producto con retoque avanzado", price: 15,
              desc: "Incluye composición, limpieza de fondo y retoque detallado." }
          ] },
        { id: "locacion-extra", name: "Fotografía en locación adicional", unit: "foto adicional",
          desc: "La cantidad son las fotos adicionales del lugar, fuera del set principal.",
          note: LOCATION_NOTE,
          items: [
            { id: "loc-extra", name: "Foto adicional del local o espacio", price: 8,
              desc: "Ambientación, fachada o espacio de trabajo adicional." }
          ] }
      ]
    },
    audiovisual: {
      mode: "project",
      sections: [
        { id: "produccion", name: "Producción de video", unit: "video",
          desc: "La cantidad es el número de videos en este formato.",
          note: LOCATION_NOTE,
          items: [
            { id: "ia", name: "Video creado con inteligencia artificial", tag: "Recomendado", price: 40,
              desc: "Concepto, guion, generación audiovisual y edición completa con IA." },
            { id: "archivo-listo", name: "Archivo listo; solo publicación", price: 3,
              desc: "El cliente entrega el video final; Kingdom Lab lo publica." },
            { id: "edicion-express", name: "Edición express de material del cliente", price: 8,
              desc: "Cortes básicos, formato vertical y publicación." },
            { id: "storyboard", name: "Cliente graba con guion y storyboard de Kingdom Lab", price: 12,
              desc: "Creamos guion y storyboard; el cliente graba." },
            { id: "grabacion-fuera", name: "Grabación por nuestro personal fuera del local", price: 40,
              desc: "Guion y grabación con nuestro personal, sin traslado al negocio." },
            { id: "grabacion-local", name: "Producción grabada en el local del cliente", price: 65,
              desc: "Guion, dirección y grabación presencial en el negocio." }
          ] },
        { id: "formatos", name: "Historias y contenido hablado", unit: "pieza",
          desc: "La cantidad son las piezas en este formato.",
          items: [
            { id: "historia-video", name: "Historia en video (movimiento)", price: 5,
              desc: "Historia corta filmada para redes, edición básica." },
            { id: "video-hablado", name: "Video hablado a cámara / testimonial", price: 18,
              desc: "El cliente o un talento habla a cámara; incluye guion y edición." }
          ] }
      ]
    },
    visuales: {
      mode: "monthly",
      sections: [
        { id: "posts", name: "Posts individuales", unit: "post", totalKey: "postsTotal",
          desc: "Tres estilos de producción.", ratios: [0.34, 0.50, 0.16],
          items: [
            { id: "post-foto", name: "Foto con pocas palabras", price: 4 },
            { id: "post-grafico", name: "Diseño gráfico estático sin rostro", price: 7 },
            { id: "post-animado", name: "Post con leve movimiento o animación", price: 10 }
          ] },
        { id: "historias", name: "Historias", unit: "historia", totalKey: "historiasTotal",
          desc: "Tres estilos de producción.", ratios: [0.4, 0.4, 0.2],
          items: [
            { id: "hist-diseno", name: "Historia diseñada", price: 4 },
            { id: "hist-foto", name: "Historia estilo foto", price: 2 },
            { id: "hist-animada", name: "Historia con leve animación", price: 5 }
          ] },
        { id: "carruseles", name: "Carruseles", unit: "carrusel", totalKey: "carruselesTotal",
          desc: "Precio = portada + láminas interiores.", ratios: [0.25, 0.5, 0.25],
          items: [
            { id: "carr-4", name: "Carrusel de 4 láminas", price: 16, formula: "$7 portada + 3 × $3 = $16 base" },
            { id: "carr-6", name: "Carrusel de 6 láminas", price: 22, formula: "$7 portada + 5 × $3 = $22 base" },
            { id: "carr-8", name: "Carrusel de 8 láminas", price: 28, formula: "$7 portada + 7 × $3 = $28 base" }
          ] }
      ]
    }
  };

  var MONTHLY_DEFAULTS = { postsTotal: 12, historiasTotal: 20, carruselesTotal: 4 };
  var MONTHLY_FIELDS = [
    { key: "postsTotal", section: "posts", label: "Publicaciones estimadas por mes" },
    { key: "historiasTotal", section: "historias", label: "Historias estimadas por mes" },
    { key: "carruselesTotal", section: "carruseles", label: "Carruseles estimados por mes" }
  ];

  /* ---------------------------------------- estado */

  function defaultState() {
    return {
      step: "datos",
      datos: { nombre: "", marca: "", email: "", telefono: "", rubro: "" },
      orgType: null,
      categories: { fotografia: false, audiovisual: false, visuales: false },
      monthly: { postsTotal: 12, historiasTotal: 20, carruselesTotal: 4 },
      qty: {},
      activeCatTab: null,
      visualesInit: false
    };
  }

  var state = load();

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.datos && d.categories) {
        var base = defaultState();
        d.monthly = Object.assign(base.monthly, d.monthly || {});
        d.qty = d.qty || {};
        return d;
      }
    } catch (e) {}
    return defaultState();
  }

  var saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    function go() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }
    if (now) go(); else saveTimer = setTimeout(go, 400);
  }

  /* ---------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(n) {
    return "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function qty(id) { return state.qty[id] || 0; }

  function setQty(id, v) {
    v = Math.max(0, Math.round(v) || 0);
    if (v === 0) delete state.qty[id]; else state.qty[id] = v;
  }

  function orgFactor() {
    var org = ORG_TYPES.filter(function (o) { return o.id === state.orgType; })[0];
    return org ? org.factor : 1;
  }

  function selectedCategoryIds() {
    return CATEGORIES.filter(function (c) { return state.categories[c.id]; }).map(function (c) { return c.id; });
  }

  /* cantidades sugeridas por sección "monthly": reparte el total según ratios,
     ajustando el último ítem para que la suma cuadre exacto */
  function suggestedFor(section) {
    var total = state.monthly[section.totalKey] || 0;
    var out = section.items.map(function (it, i) {
      return Math.round(total * section.ratios[i]);
    });
    var sum = out.reduce(function (a, b) { return a + b; }, 0);
    if (out.length) out[out.length - 1] += (total - sum);
    return out;
  }

  function resetSectionToSuggested(section) {
    var sugg = suggestedFor(section);
    section.items.forEach(function (it, i) { setQty(it.id, sugg[i]); });
  }

  function badgeFor(q, sugg) {
    if (sugg === 0 && q === 0) return { label: "Opcional", cls: "bg-slate-100 text-slate-500" };
    if (q === sugg) return { label: "Recomendado · sugerido " + sugg, cls: "bg-emerald-100 text-emerald-700" };
    if (q === 0) return { label: "Sin seleccionar · sugerido " + sugg, cls: "bg-slate-100 text-slate-500" };
    if (q < sugg * 0.5) return { label: "Muy por debajo · sugerido " + sugg, cls: "bg-rose-100 text-rose-700" };
    if (q < sugg) return { label: "Por debajo · sugerido " + sugg, cls: "bg-amber-100 text-amber-700" };
    return { label: "Por encima · sugerido " + sugg, cls: "bg-sky-100 text-sky-700" };
  }

  /* ---------------------------------------- totales */

  function categorySubtotal(catId) {
    var cat = CATALOG[catId], total = 0;
    cat.sections.forEach(function (sec) {
      sec.items.forEach(function (it) { total += qty(it.id) * it.price; });
    });
    return total;
  }

  function grandSubtotal() {
    return selectedCategoryIds().reduce(function (sum, id) { return sum + categorySubtotal(id); }, 0);
  }

  function grandTotal() { return grandSubtotal() * orgFactor(); }

  /* ---------------------------------------- toast */

  var toastEl = null;
  function toast(msg, isError) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-opacity " +
      (isError ? "bg-rose-600 text-white" : "bg-navy text-white");
    toastEl.style.opacity = "1";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.style.opacity = "0"; }, 1800);
  }

  /* ---------------------------------------- render: nav de pasos */

  var navEl, rootEl, backBtn, nextBtn, nextLabel, footerTotal;

  function renderNav() {
    var i = STEPS.indexOf(state.step);
    navEl.innerHTML = STEPS.map(function (s, idx) {
      var done = idx < i, active = idx === i;
      var base = "flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ";
      var cls = active ? base + "bg-navy text-white" :
        done ? base + "bg-emerald-50 text-emerald-700" :
        base + "bg-canvas text-ink-soft";
      var badge = done ?
        '<span class="material-symbols-outlined !text-[16px]">check</span>' :
        '<span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] ' +
          (active ? "bg-gold text-navy" : "bg-white text-ink-soft border border-line") + '">' + (idx + 1) + "</span>";
      return '<button type="button" data-goto="' + s + '" class="' + cls + '">' + badge + "<span>" + STEP_LABELS[s] + "</span></button>";
    }).join("");
  }

  /* ---------------------------------------- render: paso 1, datos */

  function renderDatos() {
    var d = state.datos;
    return "" +
      '<div class="p-6 md:p-10">' +
      '<p class="text-xs font-bold tracking-wide text-gold uppercase mb-1">01 · Datos de contacto</p>' +
      '<h2 class="font-display font-bold text-2xl text-navy mb-6">¿Con quién estamos trabajando?</h2>' +
      '<div class="grid md:grid-cols-2 gap-5 max-w-2xl">' +
      field("nombre", "Nombre de contacto", d.nombre, "Ej. María Torres") +
      field("marca", "Marca o negocio", d.marca, "Ej. Kingdom Lab") +
      field("email", "Correo", d.email, "correo@negocio.com") +
      field("telefono", "Teléfono (opcional)", d.telefono, "+1 809 000 0000") +
      '<div class="md:col-span-2">' + field("rubro", "Rubro o sector (opcional)", d.rubro, "Ej. restaurante, clínica, retail, manufactura") + "</div>" +
      "</div></div>";

    function field(key, label, val, ph) {
      return '<label class="block">' +
        '<span class="text-sm font-semibold text-ink block mb-1.5">' + label + "</span>" +
        '<input type="text" data-field="' + key + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '" ' +
        'class="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"/></label>';
    }
  }

  /* ---------------------------------------- render: paso 2, organización */

  function renderOrganizacion() {
    return "" +
      '<div class="p-6 md:p-10">' +
      '<p class="text-xs font-bold tracking-wide text-gold uppercase mb-1">02 · Tipo de organización</p>' +
      '<h2 class="font-display font-bold text-2xl text-navy mb-6">¿Qué tipo de marca gestionaremos?</h2>' +
      '<div class="grid sm:grid-cols-2 gap-4">' +
      ORG_TYPES.map(function (o) {
        var on = state.orgType === o.id;
        return '<button type="button" data-org="' + o.id + '" class="text-left rounded-xl border-2 p-5 transition-colors ' +
          (on ? "border-gold bg-gold/5" : "border-line hover:border-navy-soft") + '">' +
          '<div class="flex items-center justify-between mb-2">' +
          '<span class="text-xs font-bold ' + (o.factor === 1 ? "text-ink-soft" : "text-navy") + '">' +
          (o.factor === 1 ? "PRECIO BASE" : o.tag) + "</span>" +
          (on ? '<span class="w-5 h-5 rounded-full bg-gold text-navy flex items-center justify-center"><span class="material-symbols-outlined !text-[14px]">check</span></span>' : '<span class="w-5 h-5 rounded-full border border-line"></span>') +
          "</div>" +
          '<p class="font-semibold text-ink mb-1">' + o.name + "</p>" +
          '<p class="text-xs text-ink-soft">Factor ' + o.factor.toFixed(2) + "</p>" +
          "</button>";
      }).join("") +
      "</div>" +
      '<p class="text-xs text-ink-soft bg-canvas rounded-lg p-4 mt-5 max-w-2xl">' + ORG_NOTE + "</p>" +
      "</div>";
  }

  /* ---------------------------------------- render: paso 3, servicios */

  function renderServicios() {
    var monthlyBlock = state.categories.visuales ? "" +
      '<div class="mt-8 pt-6 border-t border-line">' +
      '<p class="text-sm font-semibold text-ink mb-3">Volumen mensual estimado para Visuales</p>' +
      '<div class="grid sm:grid-cols-3 gap-4">' +
      MONTHLY_FIELDS.map(function (f) {
        return '<label class="block">' +
          '<span class="text-xs text-ink-soft block mb-1.5">' + f.label + "</span>" +
          '<input type="number" min="0" data-monthly="' + f.key + '" value="' + state.monthly[f.key] + '" ' +
          'class="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"/></label>';
      }).join("") +
      "</div></div>" : "";

    return "" +
      '<div class="p-6 md:p-10">' +
      '<p class="text-xs font-bold tracking-wide text-gold uppercase mb-1">03 · Servicios</p>' +
      '<h2 class="font-display font-bold text-2xl text-navy mb-2">¿Qué necesita esta marca?</h2>' +
      '<p class="text-sm text-ink-soft mb-6">Selecciona una o varias categorías. En el siguiente paso ajustas las cantidades de cada una.</p>' +
      '<div class="grid sm:grid-cols-3 gap-4">' +
      CATEGORIES.map(function (c) {
        var on = state.categories[c.id];
        return '<button type="button" data-cat="' + c.id + '" class="text-left rounded-xl border-2 p-5 transition-colors ' +
          (on ? "border-gold bg-gold/5" : "border-line hover:border-navy-soft") + '">' +
          '<div class="flex items-center justify-between mb-3">' +
          '<span class="w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center"><span class="material-symbols-outlined">' + c.icon + "</span></span>" +
          (on ? '<span class="w-5 h-5 rounded-full bg-gold text-navy flex items-center justify-center"><span class="material-symbols-outlined !text-[14px]">check</span></span>' : '<span class="w-5 h-5 rounded-full border border-line"></span>') +
          "</div>" +
          '<p class="font-semibold text-ink mb-1">' + c.name + "</p>" +
          '<p class="text-xs text-ink-soft">' + c.desc + "</p>" +
          "</button>";
      }).join("") +
      "</div>" + monthlyBlock +
      "</div>";
  }

  /* ---------------------------------------- render: paso 4, cantidades */

  function renderCantidades() {
    var cats = selectedCategoryIds();
    if (!cats.length) {
      return '<div class="p-10 text-center text-ink-soft">' +
        '<p class="mb-3">Aún no seleccionaste ningún servicio.</p>' +
        '<button type="button" data-goto="servicios" class="text-navy font-semibold underline">Volver a Servicios</button></div>';
    }
    if (!state.activeCatTab || cats.indexOf(state.activeCatTab) === -1) state.activeCatTab = cats[0];

    var tabs = cats.length > 1 ? '<div class="flex gap-2 px-6 md:px-10 pt-6 flex-wrap">' +
      cats.map(function (id) {
        var c = CATEGORIES.filter(function (x) { return x.id === id; })[0];
        var on = state.activeCatTab === id;
        return '<button type="button" data-tab="' + id + '" class="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ' +
          (on ? "bg-navy text-white" : "bg-canvas text-ink-soft") + '">' +
          '<span class="material-symbols-outlined !text-[16px]">' + c.icon + "</span>" + c.name +
          '<span class="text-xs opacity-70">· ' + money(categorySubtotal(id)) + "</span></button>";
      }).join("") + "</div>" : "";

    return '<div class="pb-6">' + tabs +
      '<div class="p-6 md:p-10 pt-6">' + renderCategoryBody(state.activeCatTab) + "</div></div>";
  }

  function renderCategoryBody(catId) {
    var cat = CATALOG[catId];
    if (cat.mode === "project") return cat.sections.map(renderProjectSection).join('<div class="h-px bg-line my-6"></div>');
    return cat.sections.map(renderMonthlySection).join('<div class="h-px bg-line my-6"></div>');
  }

  function renderProjectSection(sec) {
    var subtotal = sec.items.reduce(function (s, it) { return s + qty(it.id) * it.price; }, 0);
    return '<div class="mb-2">' +
      '<div class="flex items-center justify-between mb-1">' +
      '<h3 class="font-display font-semibold text-lg text-navy">' + sec.name + "</h3>" +
      '<span class="text-sm font-semibold text-navy">' + money(subtotal) + "</span></div>" +
      '<p class="text-xs text-ink-soft mb-4">' + sec.desc + "</p>" +
      sec.items.map(itemRow).join("") +
      (sec.note ? '<p class="text-xs text-ink-soft bg-canvas rounded-lg p-3 mt-3">' + sec.note + "</p>" : "") +
      "</div>";

    function itemRow(it) {
      var q = qty(it.id);
      return rowShell(it, q, null,
        '<p class="text-xs text-ink-soft">' + money(it.price) + " / " + sec.unit + "</p>");
    }
  }

  function renderMonthlySection(sec) {
    var sugg = suggestedFor(sec);
    var current = sec.items.reduce(function (s, it) { return s + qty(it.id); }, 0);
    var total = state.monthly[sec.totalKey] || 0;
    var subtotal = sec.items.reduce(function (s, it) { return s + qty(it.id) * it.price; }, 0);
    return '<div class="mb-2">' +
      '<div class="flex items-center justify-between mb-1 flex-wrap gap-2">' +
      '<h3 class="font-display font-semibold text-lg text-navy">' + sec.name + "</h3>" +
      '<div class="flex items-center gap-3">' +
      '<span class="text-xs font-semibold px-2.5 py-1 rounded-full ' + (current === total ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700") + '">' +
      current + " / " + total + " sugeridos</span>" +
      '<button type="button" data-reset-section="' + sec.id + '" class="text-xs font-semibold text-navy underline">Restablecer esta sección</button>' +
      "</div></div>" +
      '<p class="text-xs text-ink-soft mb-4">' + sec.desc + "</p>" +
      sec.items.map(function (it, i) {
        var q = qty(it.id);
        var b = badgeFor(q, sugg[i]);
        var meta = '<p class="text-xs text-ink-soft">' + money(it.price) + " / " + sec.unit + "</p>" +
          (it.formula ? '<p class="text-[11px] text-ink-soft/80 mt-0.5">' + it.formula + "</p>" : "");
        return rowShell(it, q, b, meta);
      }).join("") +
      '<div class="flex justify-end mt-2"><span class="text-sm font-semibold text-navy">' + money(subtotal) + " este mes</span></div>" +
      "</div>";
  }

  function rowShell(it, q, badge, meta) {
    return '<div class="flex items-center justify-between gap-4 py-3 border-b border-line last:border-b-0">' +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex items-center gap-2 flex-wrap">' +
      '<p class="font-medium text-sm text-ink">' + it.name + "</p>" +
      (it.tag ? '<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-navy/10 text-navy">' + it.tag + "</span>" : "") +
      (badge ? '<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ' + badge.cls + '">' + badge.label + "</span>" : "") +
      "</div>" +
      (it.desc ? '<p class="text-xs text-ink-soft mt-0.5">' + it.desc + "</p>" : "") +
      meta +
      "</div>" +
      '<div class="flex flex-col items-end gap-1 shrink-0">' +
      '<span class="text-sm font-bold text-navy">' + money(q * it.price) + "</span>" +
      '<div class="flex items-center rounded-lg border border-line overflow-hidden">' +
      '<button type="button" data-step="-1" data-id="' + it.id + '" class="stepper-btn w-8 h-8 flex items-center justify-center hover:bg-canvas"><span class="material-symbols-outlined !text-[16px]">remove</span></button>' +
      '<span class="w-9 text-center text-sm font-semibold">' + q + "</span>" +
      '<button type="button" data-step="1" data-id="' + it.id + '" class="stepper-btn w-8 h-8 flex items-center justify-center hover:bg-canvas"><span class="material-symbols-outlined !text-[16px]">add</span></button>' +
      "</div></div></div>";
  }

  /* ---------------------------------------- render: paso 5, plan */

  function renderPlan() {
    var cats = selectedCategoryIds();
    var sub = grandSubtotal(), factor = orgFactor(), total = grandTotal();
    var org = ORG_TYPES.filter(function (o) { return o.id === state.orgType; })[0];

    var body = cats.length ? cats.map(function (catId) {
      var cat = CATEGORIES.filter(function (c) { return c.id === catId; })[0];
      var rows = [];
      CATALOG[catId].sections.forEach(function (sec) {
        sec.items.forEach(function (it) {
          var q = qty(it.id);
          if (q > 0) rows.push('<div class="flex items-center justify-between py-1.5 text-sm">' +
            '<span class="text-ink-soft">' + it.name + ' <span class="text-xs">× ' + q + "</span></span>" +
            '<span class="font-semibold text-ink">' + money(q * it.price) + "</span></div>");
        });
      });
      if (!rows.length) return "";
      return '<div class="mb-6">' +
        '<div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-navy">' + cat.icon + '</span>' +
        '<h3 class="font-display font-semibold text-navy">' + cat.name + "</h3></div>" +
        '<div class="pl-1">' + rows.join("") + "</div>" +
        '<div class="flex justify-end pt-2 border-t border-line mt-2">' +
        '<span class="text-sm font-bold text-navy">Subtotal ' + cat.name.toLowerCase() + ": " + money(categorySubtotal(catId)) + "</span></div>" +
        "</div>";
    }).join('<div class="h-px bg-line my-4"></div>') : '<p class="text-ink-soft text-sm">No se seleccionaron servicios.</p>';

    return '<div class="p-6 md:p-10">' +
      '<p class="text-xs font-bold tracking-wide text-gold uppercase mb-1">05 · Tu plan</p>' +
      '<h2 class="font-display font-bold text-2xl text-navy mb-6">Resumen de la cotización</h2>' +

      '<div class="grid md:grid-cols-2 gap-6 mb-8">' +
      '<div class="bg-canvas rounded-xl p-5">' +
      '<p class="text-xs font-semibold text-ink-soft uppercase mb-2">Contacto</p>' +
      '<p class="font-semibold text-ink">' + (state.datos.nombre || "—") + "</p>" +
      '<p class="text-sm text-ink-soft">' + (state.datos.marca || "—") + "</p>" +
      '<p class="text-sm text-ink-soft">' + (state.datos.email || "—") + (state.datos.telefono ? " · " + state.datos.telefono : "") + "</p>" +
      (state.datos.rubro ? '<p class="text-xs text-ink-soft mt-1">' + state.datos.rubro + "</p>" : "") +
      "</div>" +
      '<div class="bg-canvas rounded-xl p-5">' +
      '<p class="text-xs font-semibold text-ink-soft uppercase mb-2">Tipo de organización</p>' +
      '<p class="font-semibold text-ink">' + (org ? org.name : "—") + "</p>" +
      '<p class="text-sm text-ink-soft">Factor ' + factor.toFixed(2) + (factor > 1 ? " (" + Math.round((factor - 1) * 100) + "%)" : "") + "</p>" +
      "</div></div>" +

      body +

      '<div class="mt-6 pt-6 border-t-2 border-navy/10 space-y-1.5">' +
      '<div class="flex justify-between text-sm text-ink-soft"><span>Subtotal servicios</span><span>' + money(sub) + "</span></div>" +
      '<div class="flex justify-between text-sm text-ink-soft"><span>Factor de organización (×' + factor.toFixed(2) + ")</span><span>" + money(total - sub) + "</span></div>" +
      '<div class="flex justify-between text-xl font-display font-bold text-navy pt-2"><span>Total estimado</span><span>' + money(total) + "</span></div>" +
      "</div>" +

      '<div class="mt-6 bg-navy/5 rounded-xl p-4 text-sm text-ink-soft">' +
      "¿Necesitas auditorías, configuración de cuentas, publicidad paga o videos largos de YouTube? " +
      'Eso se cotiza aparte — revisa <a href="kingdom-lab-anexo.html" class="text-navy font-semibold underline">los servicios adicionales</a>.' +
      "</div>" +

      '<div class="no-print flex flex-wrap gap-3 mt-6">' +
      '<button type="button" id="btn-print" class="px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold flex items-center gap-2"><span class="material-symbols-outlined !text-[18px]">print</span>Imprimir / Guardar PDF</button>' +
      '<button type="button" id="btn-copy" class="px-5 py-2.5 rounded-lg border border-line text-sm font-semibold flex items-center gap-2"><span class="material-symbols-outlined !text-[18px]">content_copy</span>Copiar resumen</button>' +
      "</div>" +
      "</div>";
  }

  /* ---------------------------------------- resumen en texto plano (copiar) */

  function plainSummary() {
    var lines = [];
    lines.push("Cotización Kingdom Lab");
    lines.push("Contacto: " + (state.datos.nombre || "—") + " — " + (state.datos.marca || "—"));
    if (state.datos.email) lines.push("Correo: " + state.datos.email);
    var org = ORG_TYPES.filter(function (o) { return o.id === state.orgType; })[0];
    lines.push("Tipo de organización: " + (org ? org.name : "—"));
    lines.push("");
    selectedCategoryIds().forEach(function (catId) {
      var cat = CATEGORIES.filter(function (c) { return c.id === catId; })[0];
      var any = false;
      CATALOG[catId].sections.forEach(function (sec) {
        sec.items.forEach(function (it) {
          var q = qty(it.id);
          if (q > 0) { lines.push("- " + it.name + " x" + q + " = " + money(q * it.price)); any = true; }
        });
      });
      if (any) lines.push("Subtotal " + cat.name + ": " + money(categorySubtotal(catId)));
      lines.push("");
    });
    lines.push("Subtotal servicios: " + money(grandSubtotal()));
    lines.push("Factor de organización: ×" + orgFactor().toFixed(2));
    lines.push("Total estimado: " + money(grandTotal()));
    return lines.join("\n");
  }

  /* ---------------------------------------- validación por paso */

  function validateStep(s) {
    if (s === "datos") {
      if (!state.datos.nombre.trim() || !state.datos.marca.trim()) {
        toast("Ingresa al menos el nombre de contacto y la marca.", true);
        return false;
      }
    } else if (s === "organizacion") {
      if (!state.orgType) { toast("Selecciona un tipo de organización.", true); return false; }
    } else if (s === "servicios") {
      if (!selectedCategoryIds().length) { toast("Selecciona al menos un servicio.", true); return false; }
    }
    return true;
  }

  /* ---------------------------------------- render principal */

  function render() {
    renderNav();
    var html;
    if (state.step === "datos") html = renderDatos();
    else if (state.step === "organizacion") html = renderOrganizacion();
    else if (state.step === "servicios") html = renderServicios();
    else if (state.step === "cantidades") html = renderCantidades();
    else html = renderPlan();
    rootEl.innerHTML = html;

    var i = STEPS.indexOf(state.step);
    backBtn.style.visibility = i === 0 ? "hidden" : "visible";
    if (state.step === "plan") {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "";
      nextLabel.textContent = state.step === "cantidades" ? "Ver plan" : "Continuar";
    }

    if (state.step === "cantidades" || state.step === "plan") {
      footerTotal.innerHTML = "Total estimado: <strong class=\"text-navy\">" + money(grandTotal()) + "</strong>";
    } else {
      footerTotal.textContent = "";
    }

    save();
  }

  /* ---------------------------------------- eventos */

  function goto(step) {
    var from = STEPS.indexOf(state.step), to = STEPS.indexOf(step);
    if (to > from) {
      for (var i = from; i < to; i++) { if (!validateStep(STEPS[i])) return; }
    }
    state.step = step;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindEvents() {
    document.getElementById("btn-reset").addEventListener("click", function () {
      if (!confirm("¿Reiniciar toda la cotización?")) return;
      state = defaultState();
      save(true);
      render();
    });

    backBtn.addEventListener("click", function () {
      var i = STEPS.indexOf(state.step);
      if (i > 0) goto(STEPS[i - 1]);
    });

    nextBtn.addEventListener("click", function () {
      var i = STEPS.indexOf(state.step);
      if (!validateStep(state.step)) return;
      if (i < STEPS.length - 1) goto(STEPS[i + 1]);
    });

    navEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-goto]");
      if (b) goto(b.getAttribute("data-goto"));
    });

    document.body.addEventListener("click", function (e) {
      var t = e.target;

      var gotoBtn = t.closest("[data-goto]");
      if (gotoBtn && rootEl.contains(gotoBtn)) { goto(gotoBtn.getAttribute("data-goto")); return; }

      var orgBtn = t.closest("[data-org]");
      if (orgBtn) { state.orgType = orgBtn.getAttribute("data-org"); render(); return; }

      var catBtn = t.closest("[data-cat]");
      if (catBtn) {
        var id = catBtn.getAttribute("data-cat");
        state.categories[id] = !state.categories[id];
        if (id === "visuales" && state.categories.visuales && !state.visualesInit) {
          CATALOG.visuales.sections.forEach(resetSectionToSuggested);
          state.visualesInit = true;
        }
        render();
        return;
      }

      var tabBtn = t.closest("[data-tab]");
      if (tabBtn) { state.activeCatTab = tabBtn.getAttribute("data-tab"); render(); return; }

      var stepBtn = t.closest("[data-step]");
      if (stepBtn) {
        var iid = stepBtn.getAttribute("data-id");
        var dir = parseInt(stepBtn.getAttribute("data-step"), 10);
        setQty(iid, qty(iid) + dir);
        render();
        return;
      }

      var resetSec = t.closest("[data-reset-section]");
      if (resetSec) {
        var secId = resetSec.getAttribute("data-reset-section");
        var cat = CATALOG[state.activeCatTab];
        var sec = cat.sections.filter(function (s) { return s.id === secId; })[0];
        if (sec) { resetSectionToSuggested(sec); render(); toast("Sección restablecida a lo sugerido."); }
        return;
      }

      if (t.id === "btn-print") { window.print(); return; }

      if (t.id === "btn-copy") {
        var text = plainSummary();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { toast("Resumen copiado."); }, function () { toast("No se pudo copiar.", true); });
        } else {
          toast("Tu navegador no permite copiar automáticamente.", true);
        }
        return;
      }
    });

    document.body.addEventListener("input", function (e) {
      var f = e.target.getAttribute && e.target.getAttribute("data-field");
      if (f) { state.datos[f] = e.target.value; save(); return; }

      var m = e.target.getAttribute && e.target.getAttribute("data-monthly");
      if (m) {
        state.monthly[m] = Math.max(0, parseInt(e.target.value, 10) || 0);
        render();
        var el = document.querySelector('[data-monthly="' + m + '"]');
        if (el) el.focus();
      }
    });
  }

  /* ---------------------------------------- init */

  document.addEventListener("DOMContentLoaded", function () {
    navEl = document.getElementById("step-nav");
    rootEl = document.getElementById("step-root");
    backBtn = document.getElementById("btn-back");
    nextBtn = document.getElementById("btn-next");
    nextLabel = document.getElementById("btn-next-label");
    footerTotal = document.getElementById("footer-total");
    bindEvents();
    render();
  });
})();
