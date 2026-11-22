#!/usr/bin/env python3
"""Build index.html and tile-forge.html as standalone single-file builds."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
LEX_PATH = SRC / "lexicon.packed.txt"


def main():
    template = (SRC / "template.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    lex = LEX_PATH.read_text(encoding="utf-8").strip()

    js_parts = []
    for name in ["core.js", "tile_forge.js"]:
        content = (SRC / name).read_text(encoding="utf-8")
        js_parts.append(f"// ==== {name} ====\n{content}")
    js_bundle = "\n\n".join(js_parts)

    assert "/*__CSS__*/" in template, "Missing /*__CSS__*/ marker"
    assert "/*__LEXICON__*/" in template, "Missing /*__LEXICON__*/ marker"
    assert "/*__JS__*/" in template, "Missing /*__JS__*/ marker"

    out = template.replace("/*__CSS__*/", css)
    out = out.replace("/*__LEXICON__*/", lex)
    out = out.replace("/*__JS__*/", js_bundle)

    for target in ["index.html", "tile-forge.html"]:
        (ROOT / target).write_text(out, encoding="utf-8")

    print(
        f"Built index.html and tile-forge.html ({len(out):,} bytes, lexicon {len(lex):,} bytes)"
    )


if __name__ == "__main__":
    main()
