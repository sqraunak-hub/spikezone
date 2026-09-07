// Lookup + product matching for the generated content pages.
// The manifest and fragments live in public/content (see content-pages/build.py).

let indexPromise = null;

// These files sit at fixed URLs and change on every content deploy, so they
// must be revalidated rather than served from cache - otherwise returning
// visitors keep the previous build's titles and copy. `no-cache` still gets a
// cheap 304 when nothing has changed.
const FETCH_OPTS = { cache: "no-cache" };

export const loadContentIndex = () => {
  if (!indexPromise) {
    // A failed fetch must NOT stay in the cache. It used to resolve to [] and
    // that empty array was memoised for the rest of the session, so one
    // network blip turned every one of the 137 guides into a 404 until the
    // visitor hard-reloaded. Clearing the handle lets the next page retry.
    indexPromise = fetch("/content/index.json", FETCH_OPTS)
      .then((r) => {
        if (!r.ok) throw new Error(`content index ${r.status}`);
        return r.json();
      })
      .catch(() => {
        indexPromise = null;
        return [];
      });
  }
  return indexPromise;
};

// "/bird-control/bird-spikes" and "/bird-control/bird-spikes/" are the same page.
export const normalizePath = (pathname) => {
  const p = pathname.replace(/\/+$/, "");
  return `${p}/`;
};

export const findContentPage = (index, pathname) => {
  const want = normalizePath(pathname);
  return (index || []).find((e) => e.url === want) || null;
};

export const loadFragment = (path) =>
  fetch(`/content/${path}.html`, FETCH_OPTS).then((r) => (r.ok ? r.text() : ""));

// ---------------------------------------------------------------- products --

// URL segments that name a product line, mapped to the storefront category
// they belong to (where one exists) plus title keywords as a fallback.
const PRODUCT_SEGMENTS = {
  "bird-spikes": { category: "Bird Spikes", keywords: ["spike"] },
  "pigeon-spikes": { category: "Pigeon Spikes", keywords: ["pigeon", "spike"] },
  "monkey-spikes": { category: null, keywords: ["monkey"] },
  "anti-bird-net": { category: null, keywords: ["net"] },
  "bird-feeders": { category: null, keywords: ["feeder"] },
  "bird-food-feeders": { category: null, keywords: ["feeder", "food"] },
  "bird-water-feeders": { category: null, keywords: ["water", "feeder"] },
};

const loose = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");

export const productIntent = (url) => {
  const segments = url.split("/").filter(Boolean);
  // Deepest match wins: /locations/delhi/bird-spikes/ -> bird-spikes
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (PRODUCT_SEGMENTS[segments[i]]) {
      return { slug: segments[i], ...PRODUCT_SEGMENTS[segments[i]] };
    }
  }
  return null;
};

/**
 * Pick the products to show on a content page.
 * Category match -> keyword match -> bestsellers -> whatever exists.
 */
export const matchProducts = (products, url, limit = 4) => {
  const all = products || [];
  if (!all.length) return { items: [], reason: "none" };

  const intent = productIntent(url);

  if (intent?.category) {
    const byCategory = all.filter(
      (p) => loose(p.category_name) === loose(intent.category)
    );
    if (byCategory.length) {
      return { items: byCategory.slice(0, limit), reason: "category" };
    }
  }

  if (intent?.keywords?.length) {
    const byKeyword = all.filter((p) => {
      const hay = `${p.title} ${p.short_desc} ${p.category_name}`.toLowerCase();
      return intent.keywords.every((k) => hay.includes(k));
    });
    if (byKeyword.length) {
      return { items: byKeyword.slice(0, limit), reason: "keyword" };
    }
  }

  const best = all.filter((p) => p.isBest);
  if (best.length) return { items: best.slice(0, limit), reason: "bestsellers" };

  return { items: all.slice(0, limit), reason: "fallback" };
};

/**
 * Group live products by their category, most relevant category first.
 * Feeds the "Shop Now" section so it reads like the storefront's category
 * layout rather than one undifferentiated wall of cards.
 */
export const groupByCategory = (products, url, perCategory = 4) => {
  const all = products || [];
  if (!all.length) return [];

  const intent = productIntent(url);
  const buckets = new Map();

  all.forEach((p) => {
    const name = p.category_name || "Other";
    if (!buckets.has(name)) buckets.set(name, []);
    buckets.get(name).push(p);
  });

  const groups = [...buckets.entries()].map(([name, items]) => ({
    name,
    items: items.slice(0, perCategory),
    relevant: intent?.category
      ? loose(name) === loose(intent.category)
      : false,
  }));

  // The category this page is about leads; the rest follow in place.
  groups.sort((a, b) => Number(b.relevant) - Number(a.relevant));
  return groups;
};

// Heading above the grid, so it never reads like a generic "related items" rail.
export const gridHeading = (url, reason, h1) => {
  const intent = productIntent(url);
  const name = intent ? intent.slug.replace(/-/g, " ") : null;
  if (reason === "category" || reason === "keyword") {
    return {
      eyebrow: "Shop this range",
      title: `${name.replace(/\b\w/g, (c) => c.toUpperCase())} available online`,
    };
  }
  return {
    eyebrow: "Popular products",
    title: "Our bestsellers",
  };
};
