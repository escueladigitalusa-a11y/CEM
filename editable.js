/* CEM Workspace — in-browser editing layer.
 * Adds an "Editar" toggle, "+" add buttons on marked list sections, and a
 * "Guardar" button that persists the page's <main> content to localStorage
 * (per page, per browser — no backend involved).
 */
(function () {
  "use strict";

  var STORAGE_PREFIX = "cem-edit:";
  var pageKey = STORAGE_PREFIX + location.pathname;
  var editing = false;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function getMain() {
    return document.querySelector("main");
  }

  function restoreSavedContent() {
    var saved = localStorage.getItem(pageKey);
    var main = getMain();
    if (!saved || !main) return;
    main.innerHTML = saved;
  }

  function saveContent() {
    var main = getMain();
    if (!main) return;
    localStorage.setItem(pageKey, main.innerHTML);
    flashSaved();
  }

  function resetContent() {
    localStorage.removeItem(pageKey);
    location.reload();
  }

  function flashSaved() {
    var btn = document.getElementById("cem-save-btn");
    if (!btn) return;
    var original = btn.textContent;
    btn.textContent = "✓ Guardado";
    setTimeout(function () {
      btn.textContent = original;
    }, 1500);
  }

  function setEditing(on) {
    editing = on;
    var main = getMain();
    if (main) main.contentEditable = on ? "true" : "false";
    document.body.classList.toggle("cem-editing", on);
    document.querySelectorAll(".cem-add-btn").forEach(function (b) {
      b.style.display = on ? "flex" : "none";
    });
    var editBtn = document.getElementById("cem-edit-toggle");
    if (editBtn) editBtn.textContent = on ? "✅ Listo" : "✏️ Editar";
    var saveBtn = document.getElementById("cem-save-btn");
    var resetBtn = document.getElementById("cem-reset-btn");
    if (saveBtn) saveBtn.style.display = on ? "inline-flex" : "none";
    if (resetBtn) resetBtn.style.display = on ? "inline-flex" : "none";
  }

  function injectControls() {
    var bar = document.createElement("div");
    bar.id = "cem-edit-bar";
    bar.innerHTML =
      '<button id="cem-edit-toggle" type="button">✏️ Editar</button>' +
      '<button id="cem-save-btn" type="button" style="display:none">💾 Guardar</button>' +
      '<button id="cem-reset-btn" type="button" style="display:none">↺ Restablecer</button>';
    document.body.appendChild(bar);
    document.getElementById("cem-edit-toggle").addEventListener("click", function () {
      setEditing(!editing);
    });
    document.getElementById("cem-save-btn").addEventListener("click", saveContent);
    document.getElementById("cem-reset-btn").addEventListener("click", function () {
      if (confirm("¿Restablecer esta página a su versión original? Se perderán los cambios guardados en este navegador.")) {
        resetContent();
      }
    });
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.textContent =
      "#cem-edit-bar{position:fixed;bottom:20px;left:20px;z-index:9999;display:flex;gap:8px;font-family:'Poppins',sans-serif;}" +
      "#cem-edit-bar button{background:rgba(255,255,255,0.85);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.9);box-shadow:0 10px 30px rgba(0,0,0,0.12);border-radius:9999px;padding:10px 18px;font-size:13px;font-weight:600;color:#191c1d;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;}" +
      "#cem-edit-bar button:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(0,0,0,0.16);}" +
      "#cem-save-btn{background:linear-gradient(135deg,#0053ce,#2a6cf0) !important;color:#fff !important;}" +
      "body.cem-editing main{outline:2px dashed rgba(0,83,206,0.35);outline-offset:8px;border-radius:8px;}" +
      "body.cem-editing [contenteditable] :focus{outline:2px solid #0053ce;outline-offset:2px;border-radius:4px;}" +
      ".cem-add-btn{display:none;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:12px;padding:10px;border:2px dashed rgba(0,83,206,0.4);border-radius:12px;background:rgba(0,83,206,0.05);color:#0053ce;font-weight:600;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;}" +
      ".cem-add-btn:hover{background:rgba(0,83,206,0.1);}";
    document.head.appendChild(style);
  }

  function injectAddButtons() {
    document.querySelectorAll("[data-repeat-container]").forEach(function (container) {
      if (container.querySelector(":scope > .cem-add-btn")) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cem-add-btn";
      btn.textContent = "+ " + (container.getAttribute("data-repeat-label") || "Agregar");
      btn.addEventListener("click", function () {
        addItem(container);
      });
      container.appendChild(btn);
    });
  }

  function addItem(container) {
    var selector = container.getAttribute("data-repeat-item") || ".cem-item";
    var addBtn = container.querySelector(":scope > .cem-add-btn");
    var items = Array.prototype.filter.call(container.children, function (el) {
      return el.matches(selector);
    });
    var template = items[items.length - 1];
    if (!template) return;
    var clone = template.cloneNode(true);
    clone.querySelectorAll("[data-clear-on-add]").forEach(function (el) {
      el.textContent = el.getAttribute("data-clear-on-add");
    });
    container.insertBefore(clone, addBtn);
    if (!editing) setEditing(true);
    var focusTarget = clone.querySelector("[data-clear-on-add]") || clone;
    if (focusTarget && focusTarget.focus) focusTarget.focus();
  }

  ready(function () {
    restoreSavedContent();
    injectStyles();
    injectControls();
    injectAddButtons();
    setEditing(false);
  });

  window.cemInjectAddButtons = injectAddButtons;
})();
