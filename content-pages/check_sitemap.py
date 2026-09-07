"""Report sitemap drift: what the sitemap claims vs what actually exists.

build.py already generates sitemap.xml from the live product API and the
content index, so the sitemap is only ever correct as of the last content
build. The catalogue moves independently - a product added, renamed or
retired in the admin does not trigger a build - and the sitemap silently
goes stale. On 2026-08-19 the deployed sitemap was five days old and had
drifted by eight URLs: two retired products still listed (soft 404s for
Google to crawl) and the whole Anti Bird Net and Monkey Spikes categories
missing, including their six product pages.

This checks; it does not write. Regenerating is build.py's job, and running
it needs the authored content in SRC. This needs nothing but network, so it
can run anywhere on a schedule and tell you *whether* a rebuild is owed.

    python check_sitemap.py            # check the deployed sitemap
    python check_sitemap.py --local    # check public/sitemap.xml instead

Exit code is 1 when the sitemap has drifted, 0 when it matches, so it can
gate a scheduled job.
"""

import argparse
import json
import pathlib
import re
import ssl
import sys
import urllib.request
import xml.etree.ElementTree as ET

SITE = "https://spikezone.in"
API = "https://api.spikezone.in/api/user"
PUBLIC = pathlib.Path(__file__).parent.parent / "vite-test" / "vite-project" / "public"

NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

# Same reason as build.py: Windows Python has no system CA store for urllib.
try:
    import certifi

    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:  # certifi is optional - fall back to the default context
    CTX = None


def fetch_json(url):
    with urllib.request.urlopen(url, timeout=30, context=CTX) as r:
        return json.load(r)


def slugify(text):
    """Mirror of the storefront's slug helper (src/Utils/slugify.js)."""
    import unicodedata

    t = unicodedata.normalize("NFKD", str(text or "")).lower().strip()
    t = re.sub(r"[^a-z0-9]+", "-", t)
    return t.strip("-")


def sitemap_paths(local):
    """Site-relative paths in the sitemap, plus its lastmod dates."""
    if local:
        source = PUBLIC / "sitemap.xml"
        root = ET.fromstring(source.read_text(encoding="utf-8"))
    else:
        source = f"{SITE}/sitemap.xml"
        with urllib.request.urlopen(source, timeout=30, context=CTX) as r:
            root = ET.fromstring(r.read())

    paths, dates = [], set()
    for url in root.findall(f"{NS}url"):
        loc = url.findtext(f"{NS}loc") or ""
        paths.append(loc.replace(SITE, ""))
        lastmod = url.findtext(f"{NS}lastmod")
        if lastmod:
            dates.add(lastmod)
    return source, paths, dates


def expected():
    """What the sitemap should contain, from the same sources build.py uses."""
    products = fetch_json(f"{API}/products/")
    if isinstance(products, dict):
        products = products.get("data", products)

    # Categories come from the products themselves, not /uploadCategory/ -
    # that is what build.py does, and an empty category has nothing to show.
    cats = {slugify(p["category_name"]) for p in products if p.get("category_name")}
    prods = {
        f"/products/{slugify(p['category_name'])}/{p['slug']}"
        for p in products
        if p.get("slug") and p.get("category_name")
    }
    content = {e["url"] for e in fetch_json(f"{SITE}/content/index.json")}
    return {f"/products/{c}" for c in cats}, prods, content


def report(label, listed, live):
    """Print one section; return True when it has drifted."""
    stale, missing = sorted(listed - live), sorted(live - listed)
    mark = "OK  " if not (stale or missing) else "DRIFT"
    print(f"{mark} {label}: {len(listed)} in sitemap, {len(live)} live")
    for u in stale:
        print(f"        stale (retired, remove): {u}")
    for u in missing:
        print(f"        missing (add):           {u}")
    return bool(stale or missing)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--local",
        action="store_true",
        help="check public/sitemap.xml instead of the deployed one",
    )
    args = ap.parse_args()

    source, paths, dates = sitemap_paths(args.local)
    print(f"sitemap: {source}")
    span = f", lastmod {min(dates)}..{max(dates)}" if dates else ""
    print(f"  {len(paths)} URLs{span}")

    listed = set(paths)
    dupes = sorted(p for p in listed if paths.count(p) > 1)

    cats, prods, content = expected()
    listed_cats = {p for p in listed if p.startswith("/products/") and p.count("/") == 2}
    listed_prods = {p for p in listed if p.startswith("/products/") and p.count("/") == 3}
    listed_content = {
        p
        for p in listed
        if re.match(r"^/(locations|solutions|applications|bird-control|bird-care)/", p)
    }

    drifted = any(
        [
            report("categories  ", listed_cats, cats),
            report("products    ", listed_prods, prods),
            report("content pages", listed_content, content),
        ]
    )

    if dupes:
        drifted = True
        print(f"DRIFT duplicates: {len(dupes)}")
        for u in dupes:
            print(f"        {u}")

    print()
    if drifted:
        print("Sitemap has drifted. Rebuild with: python build.py")
        if not args.local:
            print("(then deploy public/sitemap.xml and resubmit in Search Console)")
    else:
        print("Sitemap matches the live catalogue and content index.")
    return 1 if drifted else 0


if __name__ == "__main__":
    sys.exit(main())
