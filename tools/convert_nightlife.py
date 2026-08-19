import json
import re
from pathlib import Path

base = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/nightlife")
out_dir = Path("Liliths Throne HTML/js/text")


def convert(src, dest_name, pack):
    xml = (base / src).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if tag not in out:
            out[tag] = body
    dest = out_dir / dest_name
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["'
        + pack
        + '"] = '
        + json.dumps(out, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(dest_name, "tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))


convert("theWateringHole.xml", "theWateringHole.js", "places/dominion/nightlife/theWateringHole")
convert("lights_out.xml", "lightsOut.js", "places/dominion/nightlife/lights_out")
