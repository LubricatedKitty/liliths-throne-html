import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/ralphsSnacks.xml").read_text(
    encoding="utf-8"
)
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/ralphsSnacks.js")
dest.write_text(
    'LT.TEXT["places/dominion/shoppingArcade/ralphsSnacks"] = ' + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
