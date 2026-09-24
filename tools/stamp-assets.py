"""Fingerprint local CSS/JS references in every page (assets/x.css -> assets/x.css?v=<hash>).

Asset filenames never change, and /assets/ is cached for a day, so after a deploy
browsers kept pairing new HTML with yesterday's CSS. The query string changes
whenever the file's contents change, which forces a fresh fetch. Idempotent:
run after any CSS/JS build (npm run build does this).
"""
import functools
import glob
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = re.compile(r'((?:href|src)=")(/?assets/[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


@functools.lru_cache(maxsize=None)
def fingerprint(path):
    with open(os.path.join(ROOT, path.lstrip('/')), 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:10]


def main():
    changed = 0
    for page in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        with open(page, encoding='utf-8') as f:
            html = f.read()
        stamped = REF.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={fingerprint(m.group(2))}{m.group(3)}', html)
        if stamped != html:
            with open(page, 'w', encoding='utf-8') as f:
                f.write(stamped)
            changed += 1
    print(f'stamped {changed} page(s)')


if __name__ == '__main__':
    sys.exit(main())
