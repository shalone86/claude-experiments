#!/usr/bin/env python3
"""Build scriptorium-vigil.html: inject the packed lexicon and the music loops into the game source."""
import base64, json, pathlib
here = pathlib.Path(__file__).resolve().parent
src = (here / "src/game.src.html").read_text()
lex = (here / "src/lexicon.packed.txt").read_text().strip()
assert "/*__LEXICON__*/" in src and "/*__AUDIO__*/{}" in src
# src/audio/loopA.mp3 … loopF.mp3 → {"A": "data:audio/mpeg;base64,…", …}. Missing files just mean no music.
audio = {f.stem[-1]: "data:audio/mpeg;base64," + base64.b64encode(f.read_bytes()).decode()
         for f in sorted((here / "src/audio").glob("loop?.mp3"))}
out = src.replace("/*__LEXICON__*/", lex).replace("/*__AUDIO__*/{}", json.dumps(audio))
(here / "scriptorium-vigil.html").write_text(out)
print("built scriptorium-vigil.html", len(out), "bytes; music:", "".join(audio) or "none")
