(function () {
  "use strict";

  function rebuildLegacyLinks(sidebar) {
    const firstLink = [...sidebar.querySelectorAll("a")].find(
      (link) => link.textContent.trim() === "NEVIDITELNÝ PES",
    );
    const legacyBlock = firstLink?.closest("p");
    if (!legacyBlock) {
      return;
    }

    const definitions = [
      ["NEVIDITELNÝ PES", "neviditelnypes.zpravy.cz/"],
      ["ZVÍŘETNÍK", "p_zviretnik.asp"],
      ["SCI-FI", "p_scifi.asp"],
      ["WOLESCHKO.CZ", "woleschko.cz/", "Knéblův web"],
      ["NEFF.CZ", "www.neff.cz/", "Astonův web"],
      ["Neffova galerie", "galerie/webgalerie/"],
      ["BOSKOWAN.COM", "boskowan.com/", "Wagnerův web"],
    ];
    const originalLinks = [...legacyBlock.querySelectorAll("a[href]")];
    const list = document.createElement("ul");

    for (const [label, hrefPart, description] of definitions) {
      const original = originalLinks.find((link) => link.href.includes(hrefPart));
      if (!original) {
        continue;
      }

      const item = document.createElement("li");
      if (description) {
        const detail = document.createElement("span");
        detail.textContent = description;
        item.appendChild(detail);
      }

      const link = document.createElement("a");
      link.href = original.href;
      link.textContent = label;
      if (original.target) {
        link.target = original.target;
      }
      item.appendChild(link);
      list.appendChild(item);
    }

    const navigation = document.createElement("nav");
    navigation.className = "hiena-sidebar-links";
    navigation.setAttribute("aria-label", "Odkazy");
    navigation.appendChild(list);
    legacyBlock.replaceWith(navigation);
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
    if (window.matchMedia("(max-width: 780px)").matches) {
      rebuildLegacyLinks(sidebar);
    }

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
      (open ? close : toggle).focus();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildMobileMenu, { once: true });
  } else {
    buildMobileMenu();
  }
})();
