import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/redLightDistrict/angelsKiss.xml").read_text(
    encoding="utf-8"
)
want = {
    "ENTRANCE",
    "ENTRANCE_REPEAT",
    "CORRIDOR",
    "OFFICE",
    "OFFICE_CONTINUE",
    "OFFICE_REPEAT",
    "OFFICE_REPEAT_WITH_LICENSE",
    "OFFICE_PROSTITUTION",
    "OFFICE_LICENSE_PURCHASE",
    "ANGELS_KISS_BEDROOM_BUNNY",
    "ANGELS_KISS_BEDROOM_BUNNY_REPEAT",
    "ANGELS_KISS_BEDROOM_BUNNY_ENTER",
    "ANGELS_KISS_BEDROOM_BUNNY_ENTER_REPEAT",
    "BEDROOM_BUNNY_SEX",
    "BEDROOM_BUNNY_DECLINE",
    "AFTER_SEX_BUNNY",
    "AFTER_SEX_BUNNY_NO_ORGASM",
    "ANGELS_KISS_BEDROOM_LOPPY",
    "ANGELS_KISS_BEDROOM_LOPPY_REPEAT",
    "ANGELS_KISS_BEDROOM_LOPPY_ENTER",
    "ANGELS_KISS_BEDROOM_LOPPY_ENTER_REPEAT",
    "BEDROOM_LOPPY_SEX",
    "BEDROOM_LOPPY_SEX_SUBMISSIVE",
    "BEDROOM_LOPPY_DECLINE",
    "BEDROOM_LOPPY_AFTER_SEX",
    "BEDROOM_LOPPY_AFTER_SEX_NO_ORGASM",
    "BEDROOM_BUNNY_THREESOME",
    "BEDROOM_BUNNY_THREESOME_LOPPY_INTRODUCED",
    "BEDROOM_BUNNY_THREESOME_LOPPY_NOT_INTRODUCED",
    "AFTER_SEX_BUNNY_THREESOME",
    "BEDROOM_LOPPY_THREESOME",
    "BEDROOM_LOPPY_THREESOME_BUNNY_INTRODUCED",
    "BEDROOM_LOPPY_THREESOME_BUNNY_NOT_INTRODUCED",
    "BEDROOM_LOPPY_AFTER_THREESOME",
    "BEDROOM",
    "BEDROOM_EMPTY",
    "BEDROOM_EMPTY_WHORE_SELF_GROUND_FLOOR",
    "BEDROOM_EMPTY_WHORE_SELF",
    "SELL_SELF_SUB",
    "SELL_SELF_DOM",
    "SELL_SELF_SUB_START",
    "SELL_SELF_DOM_START",
    "SELL_SELF_SUB_AFTER_SEX",
    "SELL_SELF_DOM_AFTER_SEX",
}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/angelsKiss.js")
dest.write_text(
    'LT.TEXT["places/dominion/redLightDistrict/angelsKiss"] = ' + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
