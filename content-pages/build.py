"""Prepare the 137 content pages for the React storefront.

Input   D:\\Naveen Kalonia Docs\\SpikeZone
          page-*.html               content fragments (no <html>/<head>)
          spikezone-content.css     stylesheet for those fragments
          SpikeZone-page-manifest.csv   URL / title / meta description per page

Output  vite-test/vite-project/
          public/content/index.json          manifest the app looks pages up in
          public/content/<url>.html          fragments, fetched at runtime
          src/Assets/CSS/content-body.css    scoped copy of the content sheet

The fragments are served from public/ rather than bundled: 1.3 MB of prose has
no business inflating the JS bundle, and the app only ever needs one at a time.
"""

import csv
import json
import pathlib
import re
import shutil

from city_data import CITIES, PRODUCTS, PROFILES

SRC = pathlib.Path(r"D:\Naveen Kalonia Docs\SpikeZone")
APP = pathlib.Path(__file__).parent.parent / "vite-test" / "vite-project"
PUBLIC = APP / "public"
OUT_CONTENT = PUBLIC / "content"
OUT_CSS = APP / "src" / "Assets" / "CSS" / "content-body.css"

# Rewritten pages live here rather than overwriting the authored originals in
# SRC. A file named like the manifest's "Source file" replaces that fragment;
# meta.json overrides the manifest's title/description/H1 per URL.
OVERRIDES = pathlib.Path(__file__).parent / "overrides"

# overrides/append/<source file> is appended to the original instead of
# replacing it - for pages whose content is already good and only need a
# missing section (an FAQ, a closing CTA) added to the end.
APPENDS = OVERRIDES / "append"

COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)

# The fragments were written for a standalone static site; these routes belong
# to the SPA and are served without a trailing slash.
SPA_HREF_FIXES = {
    '"/contact/"': '"/contact"',
    '"/products/"': '"/products"',
}


def city_sections(city_slug, product_slug):
    """One extra section for a /locations/<city>/<product>/ page.

    Deliberately narrow. The authored pages already carry the city's
    specification advice, the areas served, ordering detail and an FAQ - and
    they are better informed than anything generated from a climate profile.
    The Mumbai bird-spikes page, for example, correctly specifies polycarbonate
    and *no metal* because of salt air; a profile lookup produced "SS-304
    stainless steel" and contradicted it on the same page.

    Local building stock is the one thing those pages do not cover, so it is
    the only thing added here.
    """
    city = CITIES.get(city_slug)
    product = PRODUCTS.get(product_slug)
    if not city or not product:
        return ""

    name, pname, plower = city["name"], product["name"], product["lower"]

    # Rotated per product so a city's five pages do not open this section with
    # the same card in the same order.
    order = list(city["buildings"])
    shift = list(PRODUCTS).index(product_slug) % len(order)
    order = order[shift:] + order[:shift]
    cards = "".join(
        f"""
    <div class="card">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>"""
        for title, body in order
    )

    return f"""<section>
  <h2>Buildings We Supply {pname} To in {name}</h2>
  <p>
    For {plower}, the quantity comes from how much {product['surface'].split(',')[0]} a
    building actually has &mdash; running length, not floor area. These are the three
    types we quote most often in {name}:
  </p>
  <div class="grid-3">{cards}
  </div>
</section>"""


def previous_lastmod():
    """URL -> lastmod taken from the sitemap already on disk.

    Every build used to stamp today's date on all 161 URLs, including the
    130-odd pages that had not changed in months. A lastmod that moves for
    every page at once is noise, and Google responds to noisy lastmod by
    ignoring the field - which costs exactly the signal it exists to give.
    Carrying the old dates forward makes the date mean something: only pages
    that really changed carry a new one, and those are the ones worth
    recrawling first.
    """
    path = PUBLIC / "sitemap.xml"
    if not path.exists():
        return {}
    import xml.etree.ElementTree as ET

    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    try:
        root = ET.fromstring(path.read_text(encoding="utf-8"))
    except ET.ParseError:
        return {}
    out = {}
    for url in root.findall(f"{ns}url"):
        loc = url.findtext(f"{ns}loc")
        mod = url.findtext(f"{ns}lastmod")
        if loc and mod:
            out[loc] = mod
    return out


def write_sitemap(index, changed_urls=frozenset()):
    """sitemap.xml + robots.txt.

    Without these the 137 content pages are effectively invisible: nothing on
    the storefront linked into them, and both files previously fell through the
    SPA rewrite and returned index.html instead of existing.

    `changed_urls` holds the content pages whose fragment differed on this run.
    Those get today's date, anything new to the sitemap gets today, and every
    other URL keeps the date it already had.
    """
    import urllib.request

    site = "https://spikezone.in"
    today = __import__("datetime").date.today().isoformat()
    previous = previous_lastmod()

    def lastmod_for(loc):
        if loc in changed_urls:
            return today
        return previous.get(f"{site}{loc}", today)

    # Static storefront routes worth indexing (account/cart/checkout are not).
    urls = [
        ("/", "1.0", "weekly"),
        ("/products", "0.9", "weekly"),
        ("/about", "0.5", "monthly"),
        ("/contact", "0.6", "monthly"),
        ("/gallery", "0.4", "monthly"),
        ("/blogs", "0.5", "weekly"),
        ("/privacy-policy", "0.2", "yearly"),
        ("/terms", "0.2", "yearly"),
        ("/return-policy", "0.2", "yearly"),
    ]

    # Live catalogue: category pages and product detail pages.
    # Windows Python has no system CA store for urllib, so point it at certifi.
    try:
        import ssl

        import certifi

        ctx = ssl.create_default_context(cafile=certifi.where())
        with urllib.request.urlopen(
            "https://api.spikezone.in/api/user/products/", timeout=30, context=ctx
        ) as r:
            products = json.load(r)
        cats = sorted({p["category_name"] for p in products if p.get("category_name")})
        for c in cats:
            urls.append((f"/products/{slugify(c)}", "0.8", "weekly"))
        for p in products:
            if p.get("slug") and p.get("category_name"):
                urls.append(
                    (f"/products/{slugify(p['category_name'])}/{p['slug']}",
                     "0.8", "weekly")
                )
        print(f"  sitemap: {len(cats)} categories + {len(products)} products from API")
    except Exception as e:  # noqa: BLE001 - sitemap should still build offline
        print(f"  sitemap: could not reach product API ({e}); catalogue URLs skipped")

    # Content pages. Hubs rank above leaf pages.
    for entry in index:
        depth = entry["url"].strip("/").count("/")
        priority = "0.8" if depth == 0 else ("0.7" if depth == 1 else "0.6")
        urls.append((entry["url"], priority, "monthly"))

    body = "\n".join(
        f"""  <url>
    <loc>{site}{loc}</loc>
    <lastmod>{lastmod_for(loc)}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{pri}</priority>
  </url>"""
        for loc, pri, freq in urls
    )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n"
    )
    (PUBLIC / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    robots = f"""User-agent: *
Allow: /

# Customer-only areas - nothing to index and nothing useful to a crawler.
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /wishlist
Disallow: /my-reviews
Disallow: /signup
Disallow: /order-detail/
Disallow: /add-review/
Disallow: /products/search

Sitemap: {site}/sitemap.xml
"""
    (PUBLIC / "robots.txt").write_text(robots, encoding="utf-8")
    print(f"  sitemap.xml: {len(urls)} URLs")
    return len(urls)


def slugify(text):
    """Mirror of the storefront's slug helper (src/Utils/slugify.js)."""
    import unicodedata

    t = unicodedata.normalize("NFKD", str(text or "")).lower().strip()
    t = re.sub(r"[^a-z0-9]+", "-", t)
    return t.strip("-")


def anchor_headings(fragment):
    """Give every h2/h3 an id derived from its text.

    The home page links straight at sections inside these guides ("Types of
    Bird Spikes", "Frequently Asked Questions"), which needs a stable target.
    Headings that already carry an id are left alone, and a duplicate slug
    gets a -2, -3 suffix so every id on the page stays unique.
    """
    seen = {}

    def add_id(m):
        tag, attrs, inner = m.group(1), m.group(2), m.group(3)
        if re.search(r"\bid\s*=", attrs):
            return m.group(0)
        text = re.sub(r"<[^>]+>", "", inner)
        slug = slugify(text)
        if not slug:
            return m.group(0)
        seen[slug] = seen.get(slug, 0) + 1
        if seen[slug] > 1:
            slug = f"{slug}-{seen[slug]}"
        return f"<{tag}{attrs} id=\"{slug}\">{inner}</{tag}>"

    return re.sub(r"<(h2|h3)([^>]*)>(.*?)</\1>", add_id, fragment, flags=re.S)


def clean(fragment):
    """Strip internal design notes and photo TODOs, then fix SPA links."""
    out = COMMENT_RE.sub("", fragment)
    for old, new in SPA_HREF_FIXES.items():
        out = out.replace(f"href={old}", f"href={new}")
    return anchor_headings(out.strip())


# Google cuts a title around 60 characters and a description around 160. The
# authored manifest runs longer than that on most pages - 123 titles and 87
# descriptions were over - so both are trimmed here rather than in 137 rows by
# hand. Titles lose the em-dash sub-clause first, because the part before it
# already carries the keyword ("Bird Control Spikes in Chennai"); descriptions
# fall back to the last complete sentence that fits.

TITLE_MAX = 60
DESC_MAX = 160


def trim_title(title):
    t = " ".join((title or "").split())
    if len(t) <= TITLE_MAX:
        return t
    # "<keyword part> — <colour> | SpikeZone" -> "<keyword part> | SpikeZone"
    if "|" in t:
        main, brand = t.rsplit("|", 1)
        for sep in ("—", "–", " - "):
            if sep in main:
                short = f"{main.split(sep)[0].strip()} | {brand.strip()}"
                if len(short) <= TITLE_MAX:
                    return short
        main = main.strip()
        brand = brand.strip()
        room = TITLE_MAX - len(brand) - 3
        if room > 20:
            return f"{main[:room].rsplit(' ', 1)[0].rstrip(' ,-—–')} | {brand}"
    for sep in ("—", "–", " - "):
        if sep in t:
            head = t.split(sep)[0].strip()
            if len(head) <= TITLE_MAX:
                return head
    return t[:TITLE_MAX].rsplit(" ", 1)[0].rstrip(" ,-—–")


def trim_description(desc):
    d = " ".join((desc or "").split())
    if len(d) <= DESC_MAX:
        return d
    cut = max(d.rfind(". ", 0, DESC_MAX + 1), d.rfind("? ", 0, DESC_MAX + 1))
    if cut > 80:
        return d[: cut + 1].strip()
    return d[:DESC_MAX].rsplit(" ", 1)[0].rstrip(" ,;:-—–") + "."


def scope_css(text):
    """Move the sheet's :root variables onto .sz-content.

    The sheet declares --sz-radius, --sz-ink and friends on :root, which
    collide with the storefront's own --sz-* tokens in home-modern.css. Every
    rule in the sheet is already scoped under .sz-content, so hosting the
    variables there keeps them from leaking into the rest of the app.
    """
    return text.replace(":root {", ".sz-content {")


def retheme_dark(text):
    """Re-gate the sheet's dark block on the site's own theme switch.

    The authored sheet flips to dark on @media (prefers-color-scheme: dark),
    which would drag the article body into dark mode for anyone whose OS is
    dark even though the site defaults to light. The storefront drives its
    theme from data-theme on <html> instead, so the media wrapper is unrolled
    and every rule inside it is prefixed with that attribute.

    Every selector in the block already starts with .sz-content (:root having
    been rewritten by scope_css), so a plain prefix is enough.
    """
    open_at = text.find("@media (prefers-color-scheme: dark) {")
    if open_at == -1:
        return text

    # walk to the matching close brace
    i = text.index("{", open_at)
    depth, j = 0, i
    while j < len(text):
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    body = text[i + 1 : j]

    out = []
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sels = ", ".join(
            f':root[data-theme="dark"] {s.strip()}'
            for s in rule.group(1).split(",")
            if s.strip()
        )
        out.append(f"{sels} {{{rule.group(2)}}}")

    return text[:open_at] + "\n".join(out) + text[j + 1 :]


def main():
    rows = list(
        csv.DictReader((SRC / "SpikeZone-page-manifest.csv").open(encoding="utf-8-sig"))
    )

    if OUT_CONTENT.exists():
        shutil.rmtree(OUT_CONTENT)
    OUT_CONTENT.mkdir(parents=True)

    meta_overrides = {}
    meta_file = OVERRIDES / "meta.json"
    if meta_file.exists():
        meta_overrides = json.loads(meta_file.read_text(encoding="utf-8"))

    index = []
    overridden = []
    appended = []
    city_pages = []
    changed_urls = set()
    for row in rows:
        url = row["URL"]
        rel = url.strip("/")  # bird-control/bird-spikes

        override = OVERRIDES / row["Source file"]
        source = override if override.exists() else SRC / row["Source file"]
        if override.exists():
            overridden.append(url)

        text = clean(source.read_text(encoding="utf-8"))

        extra = APPENDS / row["Source file"]
        if extra.exists():
            text = f"{text}\n{clean(extra.read_text(encoding='utf-8'))}"
            appended.append(url)

        # /locations/<city>/<product>/ gets generated city-specific sections.
        if row["Group"] == "City product":
            parts = url.strip("/").split("/")
            generated = city_sections(parts[1], parts[2])
            if generated:
                text = f"{text}\n{generated}"
                city_pages.append(url)

        target = OUT_CONTENT / f"{rel}.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        # Whether the fragment actually changed decides its sitemap
        # lastmod (see write_sitemap): a rebuild that changes nothing
        # must not restamp every page as freshly modified.
        if not target.exists() or target.read_text(encoding="utf-8") != text:
            changed_urls.add(url)
        target.write_text(text, encoding="utf-8")

        entry = {
            "url": url,
            "path": rel,
            "group": row["Group"],
            "h1": row["H1"],
            "title": row["Title tag"],
            "description": row["Meta description"],
            "words": len(re.sub(r"<[^>]+>", " ", text).split()),
        }
        entry.update(meta_overrides.get(url, {}))
        entry["title"] = trim_title(entry["title"])
        entry["description"] = trim_description(entry["description"])
        index.append(entry)

    (OUT_CONTENT / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    OUT_CSS.write_text(
        "/* Generated by content-pages/build.py from spikezone-content.css.\n"
        "   Do not edit here - edit the source sheet and rebuild. */\n\n"
        + retheme_dark(
            scope_css((SRC / "spikezone-content.css").read_text(encoding="utf-8"))
        ),
        encoding="utf-8",
    )

    write_sitemap(index, changed_urls)

    total = sum(p.stat().st_size for p in OUT_CONTENT.rglob("*") if p.is_file())
    print(f"wrote {len(index)} fragments + index.json")
    if overridden:
        print(f"  rewritten from overrides/: {len(overridden)}")
        for u in overridden:
            print(f"    {u}")
    if appended:
        print(f"  extended from overrides/append/: {len(appended)}")
        for u in appended:
            print(f"    {u}")
    if city_pages:
        print(f"  city sections generated: {len(city_pages)}")
    print(f"  -> {OUT_CONTENT}  ({total/1024/1024:.2f} MB)")
    print(f"  -> {OUT_CSS}")


if __name__ == "__main__":
    main()
