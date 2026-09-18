(function () {
  "use strict";

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) {
      throw new Error("Copy command failed");
    }
  }

  async function copyTarget(button) {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) {
      return;
    }

    const text = target.textContent.trim();
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          fallbackCopy(text);
        }
      } else {
        fallbackCopy(text);
      }
      button.textContent = "Zkopírováno";
      button.classList.add("is-copied");
    } catch {
      button.textContent = "Označte kód ručně";
      button.classList.add("copy-failed");
    }

    window.setTimeout(() => {
      button.textContent = "Kopírovat";
      button.classList.remove("is-copied", "copy-failed");
    }, 2200);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy-target]");
    if (button) {
      copyTarget(button);
    }
  });
})();
