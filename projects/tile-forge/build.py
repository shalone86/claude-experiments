#!/usr/bin/env python3
"""Build index.html and tile-forge.html as standalone single-file builds."""
import base64
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
LEX_PATH = SRC / "lexicon.packed.txt"


def main():
    template = (SRC / "template.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    lex = LEX_PATH.read_text(encoding="utf-8").strip()

    js_parts = []
    for name in ["audio.js", "core.js", "scenes.js", "tile_forge.js"]:
        content = (SRC / name).read_text(encoding="utf-8")
        js_parts.append(f"// ==== {name} ====\n{content}")
    js_bundle = "\n\n".join(js_parts)
    # src/audio/loop?.mp3 -> {"B": "data:audio/mpeg;base64,...", ...}; missing files just mean no music
    audio = {f.stem[-1]: "data:audio/mpeg;base64," + base64.b64encode(f.read_bytes()).decode()
             for f in sorted((SRC / "audio").glob("loop?.mp3"))}
    assert "/*__AUDIO__*/{}" in js_bundle, "Missing /*__AUDIO__*/ marker"
    js_bundle = js_bundle.replace("/*__AUDIO__*/{}", json.dumps(audio))

    assert "/*__CSS__*/" in template, "Missing /*__CSS__*/ marker"
    assert "/*__LEXICON__*/" in template, "Missing /*__LEXICON__*/ marker"
    assert "/*__JS__*/" in template, "Missing /*__JS__*/ marker"

    out = template.replace("/*__CSS__*/", css)
    out = out.replace("/*__LEXICON__*/", lex)
    out = out.replace("/*__JS__*/", js_bundle)

    for target in ["index.html", "tile-forge.html"]:
        (ROOT / target).write_text(out, encoding="utf-8")

    print(
        f"Built index.html and tile-forge.html ({len(out):,} bytes, lexicon {len(lex):,} bytes, music {''.join(audio) or 'none'})"
    )


if __name__ == "__main__":
    main()
