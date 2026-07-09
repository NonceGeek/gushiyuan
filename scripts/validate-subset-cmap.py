#!/usr/bin/env python3
"""Fail if any required code points are missing from a woff2 subset cmap."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

# 子集字体通常不为制表/换行单独保留 cmap 项；空格 (U+0020) 仍须存在。
CMAP_OPTIONAL = {0x9, 0xA, 0xD}


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: validate-subset-cmap.py <font.woff2>", file=sys.stderr)
        sys.exit(2)

    font_path = Path(sys.argv[1])
    glyphs: list[int] = json.loads(sys.stdin.read())
    required = [cp for cp in glyphs if cp not in CMAP_OPTIONAL]
    cmap = TTFont(font_path).getBestCmap()
    missing = [cp for cp in required if cp not in cmap]

    if missing:
        preview = "".join(chr(cp) for cp in missing[:24])
        print(
            f"Subset cmap missing {len(missing)} glyphs (first: {preview})",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Subset cmap covers all {len(required)} required glyphs.")


if __name__ == "__main__":
    main()
