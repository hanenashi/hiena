// ==UserScript==
// @name         Hiena Mobile
// @namespace    https://github.com/hanenashi/hiena
// @version      0.1.2
// @description  Make Hyena.cz readable on phones without changing its desktop character.
// @icon         https://raw.githubusercontent.com/hanenashi/hiena/main/assets/hiena-icon.png
// @icon64       https://raw.githubusercontent.com/hanenashi/hiena/main/assets/hiena-icon.png
// @match        https://hyena.cz/*
// @match        https://www.hyena.cz/*
// @match        http://hyena.cz/*
// @match        http://www.hyena.cz/*
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/hanenashi/hiena/main/web/hiena.user.js
// @downloadURL  https://raw.githubusercontent.com/hanenashi/hiena/main/web/hiena.user.js
// ==/UserScript==

(function () {
  "use strict";

  const cssUrl =
    "https://raw.githubusercontent.com/hanenashi/hiena/main/web/hyena-mobile.css";
  let viewportObserver;

  function ensureViewport() {
    if (document.querySelector("meta[name='viewport']")) {
      viewportObserver?.disconnect();
      viewportObserver = undefined;
      return;
    }

    const parent = document.head || document.documentElement;
    if (!parent) {
      if (!viewportObserver) {
        viewportObserver = new MutationObserver(ensureViewport);
        viewportObserver.observe(document, { childList: true, subtree: true });
      }
      return;
    }

    viewportObserver?.disconnect();
    viewportObserver = undefined;

    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    parent.appendChild(viewport);
  }

  function addCss(css) {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(css);
      return;
    }

    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function loadCss() {
    fetch(cssUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`CSS load failed: ${response.status}`);
        }
        return response.text();
      })
      .then(addCss)
      .catch((error) => {
        console.warn("[Hiena] Could not load mobile CSS", error);
      });
  }

  function buildMobileMenu() {
    if (document.querySelector(".hiena-mobile-header")) {
      return;
    }

    const sidebar = document.querySelector(
      'body > table:first-of-type table[width="215"][align="right"]',
    );
    if (!sidebar) {
      console.warn("[Hiena] Legacy sidebar was not found");
      return;
    }

    sidebar.id = "hiena-mobile-menu";
    sidebar.classList.add("hiena-mobile-menu");

    const header = document.createElement("header");
    header.className = "hiena-mobile-header";
    header.innerHTML = `
      <a class="hiena-mobile-brand" href="/" aria-label="The Hyena – dnešní vydání">
        <span aria-hidden="true">The</span> Hyena
      </a>
      <button class="hiena-menu-toggle" type="button"
              aria-expanded="false" aria-controls="hiena-mobile-menu">
        <span aria-hidden="true">☰</span>
        <span>Archiv a menu</span>
      </button>
    `;

    const backdrop = document.createElement("button");
    backdrop.className = "hiena-menu-backdrop";
    backdrop.type = "button";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-label", "Zavřít menu");

    const close = document.createElement("button");
    close.className = "hiena-menu-close";
    close.type = "button";
    close.setAttribute("aria-label", "Zavřít menu");
    close.textContent = "×";
    sidebar.insertBefore(close, sidebar.firstChild);

    document.body.insertBefore(backdrop, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);

    const toggle = header.querySelector(".hiena-menu-toggle");

    function setOpen(open) {
      document.body.classList.toggle("hiena-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        close.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("hiena-menu-open"));
    });
    close.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("hiena-menu-open")) {
        setOpen(false);
      }
    });
  }

  ensureViewport();
  loadCss();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildMobileMenu, { once: true });
  } else {
    buildMobileMenu();
  }
})();
