import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/lilayasHome/lilayaBirthing.xml").read_text(encoding="utf-8")
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    if m.group(1) not in out:
        out[m.group(1)] = m.group(2)
dest = Path(r"Liliths Throne HTML/js/text/lilayaBirthing.js")
dest.write_text(
    'LT.TEXT["places/dominion/lilayasHome/lilayaBirthing"] = ' + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))
print(sorted(out))
