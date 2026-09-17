<p align="center">
  <img src="assets/hiena.png" alt="Hiena — pixel-art hyena holding a code tag" width="400">
</p>

<p align="center">
  <strong><a href="https://raw.githubusercontent.com/hanenashi/hiena/main/web/hiena.user.js">Install Hiena userscript</a></strong>
</p>

# Hiena

A small mobile readability layer for [Hyena.cz](https://hyena.cz/).

Hyena's live HTML still uses a fixed 770 px table, nested sidebar tables,
legacy `<font>` tags, and no viewport meta tag. Hiena leaves the desktop page
alone and gives narrow screens a readable single-column article view.

On mobile it:

- injects a real device-width viewport;
- keeps the daily brief, lead article, and dog story in the main page;
- replaces the large image masthead with a compact sticky header;
- puts the archive, links, search, and colophon in a slide-out menu;
- loads the responsive rules from a normal standalone CSS file.

## Install

Install the userscript in Tampermonkey or another userscript manager:

```text
https://raw.githubusercontent.com/hanenashi/hiena/main/web/hiena.user.js
```

The userscript loads:

```text
https://raw.githubusercontent.com/hanenashi/hiena/main/web/hyena-mobile.css
```

## Files

- `web/hiena.user.js` — viewport injection, CSS loading, and accessible mobile
  menu controls.
- `web/hyena-mobile.css` — all responsive presentation rules.
- `assets/hiena.png` — README artwork supplied from Teneichan.
- `assets/hiena-icon.png` — lightweight userscript icon derived from that
  artwork.

The changes are scoped to screens up to 780 px wide. The original desktop
layout is not redesigned.
