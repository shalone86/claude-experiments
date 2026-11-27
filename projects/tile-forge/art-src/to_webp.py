#!/usr/bin/env python3
"""Turns the Blender renders into the game's three painted pictures (src/art/*.webp).

  python3 art-src/to_webp.py RENDERS_DIR

RENDERS_DIR holds desk-wide.png, desk-tall.png and vellum.png from build_backgrounds.py.
Needs Pillow (pip install pillow). Run python3 build.py afterwards.
"""
import pathlib
import sys

from PIL import Image, ImageEnhance

ART = pathlib.Path(__file__).resolve().parent.parent / "src" / "art"
# name, size, webp quality, brightness (the page paper is lifted a little so ink reads on it)
JOBS = [("desk-wide", (1600, 1000), 80, 1.0),
        ("desk-tall", (960, 1600), 80, 1.0),
        ("vellum", (768, 480), 80, 1.1)]


def main():
    renders = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    ART.mkdir(exist_ok=True)
    for name, size, quality, bright in JOBS:
        im = Image.open(renders / f"{name}.png").convert("RGB")
        if im.size != size:
            im = im.resize(size, Image.LANCZOS)
        if bright != 1.0:
            im = ImageEnhance.Brightness(im).enhance(bright)
        out = ART / f"{name}.webp"
        im.save(out, "WEBP", quality=quality, method=6)
        print(out.name, out.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
