import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/warehouseDistrict/kaysTextiles.xml").read_text(
    encoding="utf-8"
)
want = {
    "WAREHOUSE_DISTRICT_KAYS_TEXTILES",
    "INITIAL_ENTRY",
    "DOBERMANNS",
    "DOBERMANNS_COMBAT_PLAYER_VICTORY",
    "DOBERMANNS_BANISHED",
}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/kaysTextiles.js")
dest.write_text(
    'LT.TEXT["places/dominion/warehouseDistrict/kaysTextiles"] = ' + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
