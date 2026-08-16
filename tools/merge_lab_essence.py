import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/lilayasHome/lab.xml").read_text(encoding="utf-8")
js_path = Path(r"Liliths Throne HTML/js/text/lab.js")
js = js_path.read_text(encoding="utf-8")
match = re.search(r'LT\.TEXT\["places/dominion/lilayasHome/lab"\] = (\{.*\});', js, re.S)
if not match:
    raise SystemExit("parse fail")
obj = json.loads(match.group(1))
tags = [
    "LILAYA_EXPLAINS_ESSENCES",
    "LILAYA_EXPLAINS_ESSENCES_2",
    "LILAYA_EXPLAINS_ESSENCES_3",
    "LILAYA_EXPLAINS_ESSENCES_END",
    "ESSENCE_EXTRACTION",
    "ESSENCE_EXTRACTION_BOTTLED",
]
for tag in tags:
    block = re.search(
        r'<htmlContent\s+tag="%s"\s*>\s*<!\[CDATA\[(.*?)\]\]>\s*</htmlContent>' % tag,
        xml,
        re.S,
    )
    if not block:
        print("MISSING", tag)
        continue
    obj[tag] = block.group(1)
    print("ok", tag, len(block.group(1)))
js_path.write_text(
    'LT.TEXT["places/dominion/lilayasHome/lab"] = ' + json.dumps(obj, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("keys", len(obj))
