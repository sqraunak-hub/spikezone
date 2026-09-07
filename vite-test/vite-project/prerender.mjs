// Post-build prerender for the generated content pages.
//
// Google reported 142 of these as "Discovered - currently not indexed". The
// cause is visible in dist/index.html: every route ships the same 5 KB shell
// with an empty <div id="root">, so the first pass of the crawler gets a page
// with no h1, no copy and no links. Rendering happens later on a separate
// queue that can lag by weeks, and until it runs there is nothing to index.
//
// The fix is cheap here because the content already exists as static HTML in
// public/content: this writes a real file per URL with the copy in the body
// and the right head tags. Apache's SPA rewrite only fires for paths that do
// not exist on disk, so these files are served directly and the bundle still
// boots on top of them exactly as before.
//
// Deliberately NOT applied to product pages. Their price lives in the admin
// and changes without a rebuild, so a prerendered price would go stale and
// show a crawler a number the site no longer charges. Those keep rendering
// client-side.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = "dist";
const SITE = "https://spikezone.in";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const template = readFileSync(join(DIST, "index.html"), "utf8");
const index = JSON.parse(
  readFileSync(join(DIST, "content", "index.json"), "utf8")
);

if (!template.includes('<div id="root"></div>')) {
  throw new Error("prerender: #root placeholder not found in dist/index.html");
}

let written = 0;
const skipped = [];

for (const entry of index) {
  const fragmentPath = join(DIST, "content", `${entry.path}.html`);
  if (!existsSync(fragmentPath)) {
    skipped.push(entry.url);
    continue;
  }
  const fragment = readFileSync(fragmentPath, "utf8");
  const canonical = `${SITE}${entry.url}`;

  let html = template;

  // Head: the shell's static title/description describe the home page.
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${esc(entry.title)}</title>`
  );
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?>/,
    `<meta name="description" content="${esc(entry.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"[\s\S]*?>/,
    `<meta property="og:title" content="${esc(entry.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"[\s\S]*?>/,
    `<meta property="og:description" content="${esc(entry.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"[\s\S]*?>/,
    `<meta property="og:url" content="${canonical}" />`
  );

  // The shell ships no canonical on purpose (it is served for every route).
  // A prerendered file IS one specific route, so it can carry its own - and
  // useSeo sets the same value once the bundle boots.
  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${canonical}" />\n  </head>`
  );

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${fragment}</div>`
  );

  const out = join(DIST, entry.url.replace(/^\/+/, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, "utf8");
  written++;
}

console.log(`prerendered ${written} content pages`);
if (skipped.length) {
  console.log(`  skipped (fragment missing): ${skipped.length}`);
  skipped.forEach((u) => console.log(`    ${u}`));
}
