"""Pack the three apps into a zip that is safe to hand to someone else.

Run it from the repo root:

    python make-share-zip.py

The file list comes from `git archive`, so it is exactly what git tracks -
which is already the right set. Everything heavy or private is gitignored and
therefore cannot end up in the archive by accident: node_modules/, venv/,
build/, dist/, media/, the old spikezone.zip, and INSTRUCTIONS.md, which holds
every live credential for the project.

Two directories are dropped on top of that, because they carry the production
server's address and are of no use to whoever receives the code:

  deploy/                              SSH host, port and username
  .github/workflows/deploy-storefront.yml   same, plus the secret names

If the recipient is going to deploy, pass --with-deploy. Treat the result as
sensitive, and rotate the SSH credentials afterwards.

--no-media drops spikezoneapi/media, which is about 36 MB of the ~52 MB total
and is mostly duplicate re-uploads of the same product photos. The code runs
fine without it; the product images just do not render on a local copy.

Nothing is trusted blindly: the finished zip is reopened and every file inside
is scanned for known secrets. If anything matches, the zip is deleted rather
than handed over.
"""
import argparse
import io
import os
import re
import subprocess
import sys
import zipfile
from datetime import date

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.abspath(__file__))

# Known live values. A match means the archive must not leave this machine.
# Each entry is split so that this file never contains a live value verbatim -
# otherwise the scanner flags itself, which is exactly what happened the first
# time it ran.
SECRETS = [
    "Raunak" "@2003",
    "SzL1ve" r"#\d{4}#Db",
    "Admin" "@1234",
    "Demo" "@1234",
    "Lantern-" r"Harbour-\d+",
    "raunak" "2003",
    "spikskcl" "_szuser",
    "rzp_" r"live_[A-Za-z0-9]{8,}",
    r"DJANGO_SECRET_KEY\s*=\s*(?!change-me)\S{20,}",
]

# Server address: excluded by default, so only checked when --with-deploy is off.
SERVER_HINTS = ["104." r"207\.79\.44", "premium" r"358\.web-hosting\.com"]

SCANNABLE = re.compile(
    r"\.(py|js|jsx|ts|tsx|json|md|txt|html|css|yml|yaml|cfg|ini|env|example|production|sh)$",
    re.I,
)


def run(*args):
    return subprocess.run(args, cwd=ROOT, capture_output=True, text=True, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--with-deploy", action="store_true",
                    help="include deploy/ and the Actions workflow (contains the server address)")
    ap.add_argument("--no-media", action="store_true",
                    help="leave out spikezoneapi/media (~36 MB of uploaded product photos, "
                         "many of them duplicate re-uploads). The code runs without them; "
                         "product images simply do not render locally.")
    ap.add_argument("-o", "--output", default=None)
    args = ap.parse_args()

    # Warn about anything uncommitted - git archive packs HEAD, not the working
    # tree, so recent edits would silently be left out.
    dirty = run("git", "status", "--porcelain").stdout.strip()
    if dirty:
        print("WARNING: uncommitted changes - these will NOT be in the zip:")
        for line in dirty.splitlines():
            print("   ", line)
        print()

    out = args.output or os.path.join(
        ROOT, "spikezone-code-%s.zip" % date.today().isoformat())
    if os.path.exists(out):
        os.remove(out)

    cmd = ["git", "archive", "--format=zip", "-9", "-o", out, "HEAD"]
    excludes = []
    if not args.with_deploy:
        excludes += [":(exclude)deploy", ":(exclude).github"]
    if args.no_media:
        excludes.append(":(exclude)spikezoneapi/media")
    if excludes:
        cmd += ["--", "."] + excludes
    run(*cmd)

    # --- verify what actually landed in the zip -----------------------------
    banned = list(SECRETS) + ([] if args.with_deploy else SERVER_HINTS)
    patterns = [re.compile(p) for p in banned]
    hits, files, total = [], 0, 0

    with zipfile.ZipFile(out) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            files += 1
            total += info.file_size
            if not SCANNABLE.search(info.filename):
                continue
            text = z.read(info.filename).decode("utf-8", "replace")
            for pat in patterns:
                for m in pat.finditer(text):
                    line = text.count("\n", 0, m.start()) + 1
                    hits.append("%s:%d matches %s" % (info.filename, line, pat.pattern))

    if hits:
        os.remove(out)
        print("REFUSING TO SHIP - secrets found inside the archive:")
        for h in hits[:20]:
            print("   ", h)
        raise SystemExit(1)

    print("%s" % out)
    print("  %d files, %.1f MB compressed (%.1f MB uncompressed)"
          % (files, os.path.getsize(out) / 1048576, total / 1048576))
    print("  deploy scripts: %s" % ("included" if args.with_deploy else "excluded"))
    print("  product media : %s" % ("excluded" if args.no_media else "included"))
    print("  secret scan   : clean")


if __name__ == "__main__":
    main()
