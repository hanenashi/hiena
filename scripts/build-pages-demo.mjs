import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const editions = [
  { slug: "260918", url: "https://hyena.cz/26/09/260918pes.html" },
  { slug: "260917", url: "https://hyena.cz/26/09/260917pes.html" },
  { slug: "260916", url: "https://hyena.cz/26/09/260916pes.html" },
];

const outputDir = path.resolve("demo");
const assetsDir = path.join(outputDir, "assets", "site");
const assetCache = new Map();

await mkdir(assetsDir, { recursive: true });
await writeFile(
  path.join(outputDir, "hyena-mobile.css"),
  await readFile(path.resolve("web", "hyena-mobile.css")),
);

function safeBasename(url, contentType) {
  const fallbackExtensions = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  let name = decodeURIComponent(path.posix.basename(url.pathname)) || "asset";
  name = name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  if (!path.extname(name)) {
    name += fallbackExtensions[contentType?.split(";")[0]] || ".bin";
  }
  return name;
}

async function localizeAsset(rawUrl, pageUrl) {
  let resolved;
  try {
    resolved = new URL(rawUrl, pageUrl);
  } catch {
    return rawUrl;
  }
  // Archived Hyena pages retain a few homepage-relative `images/...` URLs.
  // Resolve those against the origin root, matching their intended location.
  if (/^images\//i.test(rawUrl)) {
    resolved = new URL(`/${rawUrl}`, pageUrl);
  }
  if (!/^https?:$/.test(resolved.protocol)) {
    return rawUrl;
  }
  resolved.protocol = "https:";
  const cacheKey = resolved.href;
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey);
  }

  try {
    const response = await fetch(resolved, { redirect: "follow" });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const digest = createHash("sha256").update(cacheKey).digest("hex").slice(0, 10);
    const filename = `${digest}-${safeBasename(resolved, response.headers.get("content-type"))}`;
    await writeFile(path.join(assetsDir, filename), bytes);
    const localUrl = `./assets/site/${filename}`;
    assetCache.set(cacheKey, localUrl);
    return localUrl;
  } catch (error) {
    console.warn(`Could not localize ${resolved.href}: ${error.message}`);
    return resolved.href;
  }
}

async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)];
  let cursor = 0;
  let output = "";
  for (const match of matches) {
    output += source.slice(cursor, match.index);
    output += await replacer(...match);
    cursor = match.index + match[0].length;
  }
  return output + source.slice(cursor);
}

function absoluteLink(rawUrl, pageUrl) {
  if (!rawUrl || /^(?:#|mailto:|javascript:|data:)/i.test(rawUrl)) {
    return rawUrl;
  }
  try {
    return new URL(rawUrl, pageUrl).href;
  } catch {
    return rawUrl;
  }
}

for (const edition of editions) {
  const response = await fetch(edition.url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${edition.url}: ${response.status}`);
  }
  const bytes = await response.arrayBuffer();
  let html = new TextDecoder("windows-1250").decode(bytes).replace(/\r\n?/g, "\n");

  html = await replaceAsync(
    html,
    /\b(src|background)\s*=\s*(["']?)([^"'\s>]+)\2/gi,
    async (_whole, attribute, quote, rawUrl) => {
      const localized = await localizeAsset(rawUrl, edition.url);
      const wrapper = quote || '"';
      return `${attribute}=${wrapper}${localized}${wrapper}`;
    },
  );

  html = html.replace(
    /\bhref\s*=\s*(["']?)([^"'\s>]+)\1/gi,
    (_whole, quote, rawUrl) => {
      const wrapper = quote || '"';
      return `href=${wrapper}${absoluteLink(rawUrl, edition.url)}${wrapper}`;
    },
  );

  html = html.replace(
    /<meta\s+http-equiv=["']?content-type["']?\s+content=["'][^"']+["']\s*\/?>/i,
    '<meta charset="utf-8">',
  );
  html = html.replace(
    /<head>/i,
    `<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="robots" content="noindex, nofollow">
    <link rel="stylesheet" href="./hyena-mobile.css">
    <script defer src="./hiena-mobile.js"></script>`,
  );
  html = html.replace(/<title>The Hyena<\/title>/i, "<title>The Hyena — mobilní ukázka</title>");
  html = html.replace(/<form\s+name=(["']?)form\1/i, '<form name="form" action="https://hyena.cz/"');
  html = `${html.replace(/[ \t]+$/gm, "").trim()}\n`;

  await writeFile(path.join(outputDir, `${edition.slug}.html`), html, "utf8");
  console.log(`Built demo/${edition.slug}.html from ${edition.url}`);
}
