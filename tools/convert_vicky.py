"""Convert official Arcane Arts XML tags used by the Vicky shop."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
xml = (ROOT / "Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/arcaneArts.xml").read_text(
    encoding="utf-8"
)
want = {"EXTERIOR", "SHOP_WEAPONS"}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = ROOT / "Liliths Throne HTML/js/text/arcaneArts.js"
dest.write_text(
    "LT.TEXT = LT.TEXT || {};\n"
    + 'LT.TEXT["places/dominion/shoppingArcade/arcaneArts"] = '
    + json.dumps(out, ensure_ascii=False)
    + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
