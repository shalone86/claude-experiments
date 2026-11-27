#!/usr/bin/env python3
"""Draws Tile Forge's icons in the painted look: one cream tile with banded colour, a bold
sepia ink outline, the ink lip under it and a flat cast shadow leaning down and to the right.

  python3 art-src/make_icons.py

Writes web/app/icon.svg and web/app/favicon.svg, the app icons web/app/icon-512.png,
icon-192.png and apple-touch-icon.png, and puts the favicon into src/template.html.
The letters are EB Garamond Bold outlines (the game's tile font, SIL Open Font License),
stored below so no font is needed. Needs Pillow (pip install pillow). Run python3 build.py after.
"""
import math
import pathlib
import re
import urllib.parse

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "web" / "app"

# EB Garamond Bold, font units (1000 per em, y up)
GLYPH_T = "M206 -3 Q199 -3 191 0.5 Q183 4 183 11 Q183 20 190 25 Q197 30 207 32 Q245 40 262.5 53 Q280 66 280 98 L280 511 Q280 550 278 568.5 Q276 587 272.5 593.5 Q269 600 264 602 Q255 607 240.5 607.5 Q226 608 217 608 L195 608 Q163 608 134.5 592.5 Q106 577 89 554 Q84 547 74.5 534.5 Q65 522 54.5 512.5 Q44 503 34 503 Q26 503 23 508.5 Q20 514 20 521 Q20 533 26 546 Q45 584 54 611 Q63 638 66 673 Q68 688 75 693.5 Q82 699 91 699 Q98 699 106 686 Q114 673 123 665 Q133 657 156.5 653 Q180 649 195 649 L571 649 Q596 649 613.5 654 Q631 659 640 664 Q656 673 665.5 684 Q675 695 688 695 Q694 695 696.5 690.5 Q699 686 699 678 Q699 674 698.5 668 Q698 662 697 657 Q692 638 687 620.5 Q682 603 679 587 Q676 571 676 554 L676 534 Q676 518 672.5 508 Q669 498 659 498 Q650 498 644 507.5 Q638 517 631 538 Q620 574 598.5 591 Q577 608 533 608 L481 608 Q464 608 453.5 600.5 Q443 593 438 570.5 Q433 548 433 502 L433 99 Q433 69 449.5 55.5 Q466 42 505 32 Q515 29 522 25 Q529 21 529 12 Q529 5 523 1 Q517 -3 508 -3 Q486 -3 458.5 -1.5 Q431 0 403.5 1 Q376 2 356 2 Q335 2 308.5 1 Q282 0 255.5 -1.5 Q229 -3 206 -3Z"
GLYPH_1 = "M117 -3 Q111 -3 105 1 Q99 5 99 11 Q99 27 118 32 Q146 39 166 46 Q186 53 197 65.5 Q208 78 208 99 L208 461 Q208 485 195.5 497.5 Q183 510 163.5 516 Q144 522 122 525 Q114 527 105 532 Q96 537 96 548 Q96 561 105.5 566.5 Q115 572 127 573 Q186 578 233 592 Q280 606 326 633 Q328 634 331 635 Q334 636 337 636 Q344 636 350.5 633 Q357 630 357 626 Q357 613 354.5 596.5 Q352 580 352 553 L352 98 Q352 79 364 67 Q376 55 398 47.5 Q420 40 449 32 Q457 29 462 25 Q467 21 467 12 Q467 -2 452 -2 Q429 -2 397.5 -1 Q366 0 335.5 1 Q305 2 283 2 Q262 2 232 1 Q202 0 171 -1.5 Q140 -3 117 -3Z"

INK = "#2a1609"
TILE_BANDS = [("#fdf5df", 0.44), ("#ecdab2", 0.80), ("#d8be8c", 1.0)]  # like .tile .face, at 160deg
LETTER = "#2b1b0f"
VALUE = "#5c411f"

# ---------------------------------------------------------------- shapes
# Each design is a list of shapes, drawn in order, that both the SVG writer and the
# Pillow painter understand, so the PNGs match the SVG.

def tile_shapes(x, y, w, h, r, ink, lip, cast, skew, letter_h, value_h=0):
    s = letter_h / 702.0
    tx = x + w / 2 - (20 + 699) / 2 * s
    ty = y + h / 2 - h * 0.035 + 348 * s
    out = [
        ("rrect", dict(x=x + cast[0] + cast[2], y=y + cast[1] + cast[3], w=w, h=h, r=r, fill=(0, 0, 0, 0.2), skew=skew, top=y)),
        ("rrect", dict(x=x + cast[0], y=y + cast[1], w=w, h=h, r=r, fill=(0, 0, 0, 0.42), skew=skew, top=y)),
        ("rrect", dict(x=x, y=y + lip, w=w, h=h, r=r, fill=INK)),
        ("rrect", dict(x=x, y=y, w=w, h=h, r=r, fill=INK)),
        ("rrect", dict(x=x + ink, y=y + ink, w=w - 2 * ink, h=h - 2 * ink, r=max(r - ink, 1), fill="bands")),
        ("glyph", dict(d=GLYPH_T, x=tx, y=ty, s=s, fill=LETTER)),
    ]
    if value_h:
        vs = value_h / 639.0
        out.append(("glyph", dict(d=GLYPH_1, x=x + w - ink - w * 0.1 - 467 * vs, y=y + h - ink - h * 0.045, s=vs, fill=VALUE)))
    return out


def favicon():
    # 64 x 64, see-through, the tile as big as it can be and still read at 16 px
    return 64, None, tile_shapes(4, 2, 49, 53, 8, 3.6, 3.4, (3, 4, 2, 2), 9, 35)


FLAME = "M256 58 C272 98 304 122 304 162 C304 190 282 210 256 210 C230 210 208 190 208 162 C208 122 240 98 256 58 Z"


def app_icon():
    # 512 x 512, full bleed (maskable: everything that matters sits inside the middle 80% circle)
    bg = [
        ("ellipse", dict(cx=256, cy=170, rx=420, ry=420, fill="#140b05")),
        ("ellipse", dict(cx=256, cy=170, rx=330, ry=330, fill="#1c1007")),
        ("ellipse", dict(cx=256, cy=170, rx=250, ry=250, fill="#26160a")),
        ("ellipse", dict(cx=256, cy=170, rx=178, ry=178, fill="#33200e")),
        ("glow", dict(cx=256, cy=160, r=118, fill=(255, 166, 50, 0.38))),
        ("flame", dict(d=FLAME)),
    ]
    return 512, "#140b05", bg + tile_shapes(150, 214, 212, 230, 28, 9, 12, (14, 17, 10, 11), 9, 150, 30)


# ---------------------------------------------------------------- SVG

def rgba(c):
    if isinstance(c, tuple):
        return "rgba(%d,%d,%d,%g)" % c if len(c) == 4 and c[3] <= 1 else "rgb(%d,%d,%d)" % c[:3]
    return c


def band_grad(id_, x, y, w, h):
    a = math.radians(160)
    dx, dy = math.sin(a), -math.cos(a)
    half = (abs(w * dx) + abs(h * dy)) / 2
    cx, cy = x + w / 2, y + h / 2
    stops, prev = [], 0.0
    for col, end in TILE_BANDS:
        stops += ['<stop offset="%g" stop-color="%s"/>' % (prev, col), '<stop offset="%g" stop-color="%s"/>' % (end, col)]
        prev = end
    return ('<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f">%s</linearGradient>'
            % (id_, cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half, "".join(stops)))


def svg(design):
    size, bgc, shapes = design
    defs, body = [], []
    for kind, p in shapes:
        if kind == "rrect":
            fill = p["fill"]
            if fill == "bands":
                defs.append(band_grad("tb", p["x"], p["y"], p["w"], p["h"]))
                fill = "url(#tb)"
            el = '<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="%s"/>' % (p["x"], p["y"], p["w"], p["h"], p["r"], rgba(fill))
            if p.get("skew"):
                t = p["top"]
                el = '<g transform="translate(0 %g) skewX(%g) translate(0 %g)">%s</g>' % (t, p["skew"], -t, el)
            body.append(el)
        elif kind == "glyph":
            body.append('<path transform="translate(%.2f %.2f) scale(%.5f -%.5f)" fill="%s" d="%s"/>' % (p["x"], p["y"], p["s"], p["s"], p["fill"], p["d"]))
        elif kind == "ellipse":
            body.append('<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="%s"/>' % (p["cx"], p["cy"], p["rx"], p["ry"], rgba(p["fill"])))
        elif kind == "glow":
            c = p["fill"]
            defs.append('<radialGradient id="gl"><stop offset="0" stop-color="rgb(%d,%d,%d)" stop-opacity="%g"/><stop offset="1" stop-color="rgb(%d,%d,%d)" stop-opacity="0"/></radialGradient>' % (c[0], c[1], c[2], c[3], c[0], c[1], c[2]))
            body.append('<circle cx="%g" cy="%g" r="%g" fill="url(#gl)"/>' % (p["cx"], p["cy"], p["r"]))
        elif kind == "flame":
            defs.append('<radialGradient id="fl" gradientUnits="userSpaceOnUse" cx="256" cy="178" r="1" gradientTransform="translate(256 178) scale(68 168) translate(-256 -178)">'
                        '<stop offset=".24" stop-color="#fffbe0"/><stop offset=".24" stop-color="#ffd45c"/><stop offset=".48" stop-color="#ffd45c"/>'
                        '<stop offset=".48" stop-color="#ff8d22"/></radialGradient>')
            body.append('<path d="%s" fill="url(#fl)"/>' % p["d"])
    if bgc:
        body.insert(0, '<rect width="%d" height="%d" fill="%s"/>' % (size, size, bgc))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"><defs>%s</defs>%s</svg>\n' % (size, size, "".join(defs), "".join(body)))


# ---------------------------------------------------------------- Pillow

SS = 4  # draw 4x bigger, then shrink, for smooth edges


def tokens(d):
    return re.findall(r"[MLQCZ]|-?\d*\.?\d+", d)


def flatten(d, steps=10):
    tk, pts, i, cur = tokens(d), [], 0, (0, 0)
    num = lambda k: float(tk[k])
    while i < len(tk):
        c = tk[i]; i += 1
        if c in "ML":
            cur = (num(i), num(i + 1)); i += 2; pts.append(cur)
        elif c == "Q":
            q, e = (num(i), num(i + 1)), (num(i + 2), num(i + 3)); i += 4
            for n in range(1, steps + 1):
                t = n / steps
                pts.append(((1 - t) ** 2 * cur[0] + 2 * (1 - t) * t * q[0] + t * t * e[0], (1 - t) ** 2 * cur[1] + 2 * (1 - t) * t * q[1] + t * t * e[1]))
            cur = e
        elif c == "C":
            a, b, e = (num(i), num(i + 1)), (num(i + 2), num(i + 3)), (num(i + 4), num(i + 5)); i += 6
            for n in range(1, steps * 2 + 1):
                t = n / (steps * 2); u = 1 - t
                pts.append((u ** 3 * cur[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t ** 3 * e[0],
                            u ** 3 * cur[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t ** 3 * e[1]))
            cur = e
    return pts


def color(c):
    if isinstance(c, tuple):
        return (c[0], c[1], c[2], round(c[3] * 255) if c[3] <= 1 else c[3])
    c = c.lstrip("#")
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), 255)


def paint(img, mask, fill):
    layer = Image.new("RGBA", img.size, fill)
    a = ImageChops.multiply(mask, layer.getchannel("A"))
    layer.putalpha(a)
    img.alpha_composite(layer)


def rrect_mask(size, p):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([p["x"] * SS, p["y"] * SS, (p["x"] + p["w"]) * SS - 1, (p["y"] + p["h"]) * SS - 1], radius=p["r"] * SS, fill=255)
    if p.get("skew"):
        k = math.tan(math.radians(p["skew"])); t = p["top"] * SS
        m = m.transform(size, Image.AFFINE, (1, -k, k * t, 0, 1, 0), resample=Image.BICUBIC)  # x' = x + k (y - top), like CSS skewX
    return m


def png(design, out_px):
    size, bgc, shapes = design
    W = size * SS
    img = Image.new("RGBA", (W, W), color(bgc) if bgc else (0, 0, 0, 0))
    for kind, p in shapes:
        if kind == "rrect":
            m = rrect_mask(img.size, p)
            if p["fill"] == "bands":
                a = math.radians(160); dx, dy = math.sin(a), -math.cos(a)
                half = (abs(p["w"] * dx) + abs(p["h"] * dy)) / 2
                cx, cy = (p["x"] + p["w"] / 2), (p["y"] + p["h"] / 2)
                prev = 0.0
                for col, end in TILE_BANDS:
                    # the band is the strip of the gradient line between prev and end
                    def pt(f, side):
                        bx, by = cx + dx * half * (2 * f - 1), cy + dy * half * (2 * f - 1)
                        return ((bx - dy * side * size) * SS, (by + dx * side * size) * SS)
                    band = Image.new("L", img.size, 0)
                    ImageDraw.Draw(band).polygon([pt(prev, -1), pt(prev, 1), pt(end + (0.01 if end == 1 else 0), 1), pt(end + (0.01 if end == 1 else 0), -1)], fill=255)
                    paint(img, ImageChops.multiply(m, band), color(col))
                    prev = end
            else:
                paint(img, m, color(p["fill"]))
        elif kind == "glyph":
            m = Image.new("L", img.size, 0)
            pts = [((p["x"] + x * p["s"]) * SS, (p["y"] - y * p["s"]) * SS) for x, y in flatten(p["d"], 6)]
            ImageDraw.Draw(m).polygon(pts, fill=255)
            paint(img, m, color(p["fill"]))
        elif kind == "ellipse":
            m = Image.new("L", img.size, 0)
            ImageDraw.Draw(m).ellipse([(p["cx"] - p["rx"]) * SS, (p["cy"] - p["ry"]) * SS, (p["cx"] + p["rx"]) * SS, (p["cy"] + p["ry"]) * SS], fill=255)
            paint(img, m, color(p["fill"]))
        elif kind == "glow":
            m = Image.new("L", img.size, 0)
            r = p["r"] * SS * 0.55
            ImageDraw.Draw(m).ellipse([p["cx"] * SS - r, p["cy"] * SS - r, p["cx"] * SS + r, p["cy"] * SS + r], fill=255)
            m = m.filter(ImageFilter.GaussianBlur(p["r"] * SS * 0.32))
            paint(img, m, color(p["fill"]))
        elif kind == "flame":
            shape = Image.new("L", img.size, 0)
            ImageDraw.Draw(shape).polygon([(x * SS, y * SS) for x, y in flatten(p["d"])], fill=255)
            for col, f in (("#ff8d22", 9), ("#ffd45c", 0.48), ("#fffbe0", 0.24)):
                e = Image.new("L", img.size, 0)
                rx, ry = 68 * min(f, 9), 168 * min(f, 9)
                ImageDraw.Draw(e).ellipse([(256 - rx) * SS, (178 - ry) * SS, (256 + rx) * SS, (178 + ry) * SS], fill=255)
                paint(img, ImageChops.multiply(shape, e), color(col))
    return img.resize((out_px, out_px), Image.LANCZOS)


def main():
    fav, app = favicon(), app_icon()
    (APP / "favicon.svg").write_text(svg(fav))
    (APP / "icon.svg").write_text(svg(app))
    for name, px in (("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
        png(app, px).convert("RGB").save(APP / name, optimize=True)
    tpl = ROOT / "src" / "template.html"
    uri = "data:image/svg+xml," + urllib.parse.quote(svg(fav).strip(), safe=" =:/'\"-.,()")
    text = tpl.read_text()
    text, n = re.subn(r'<link rel="icon" type="image/svg\+xml" href="[^"]*">', '<link rel="icon" type="image/svg+xml" href="%s">' % uri.replace('"', "'"), text)
    assert n == 1, "favicon link not found in template.html"
    tpl.write_text(text)
    print("Wrote favicon.svg, icon.svg, three PNGs, and the favicon in template.html")


if __name__ == "__main__":
    main()
