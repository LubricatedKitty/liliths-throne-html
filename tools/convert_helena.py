"""Dump official Helena nest XML. Does not rewrite generic harpy nest text."""
import json
import re
from pathlib import Path

HTML = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parents[2] / "Liliths Throne v0.4.10" / "res" / "txt" / "places" / "dominion" / "harpyNests" / "helena.xml"

text = SRC.read_text(encoding="utf-8")
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
    tag, body = m.group(1), m.group(2)
    if tag not in out:
        out[tag] = body

dest = HTML / "js" / "text" / "helenaNest.js"
dest.write_text(
    "LT.TEXT = LT.TEXT || {};\n"
    + 'LT.TEXT["places/dominion/harpyNests/helena"] = '
    + json.dumps(out, ensure_ascii=False)
    + ";\n",
    encoding="utf-8",
)
print("helenaNest tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))
