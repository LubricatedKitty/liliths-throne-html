import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/zaranixHome/groundFloor.xml").read_text(encoding="utf-8")
want = {
    "OUTSIDE",
    "OUTSIDE_REPEAT",
    "OUTSIDE_REPEAT_HOSTILE_MAIDS",
    "OUTSIDE_REPEAT_NON_HOSTILE_MAIDS",
    "KNOCK_ON_DOOR",
    "KNOCK_ON_DOOR_REPEAT",
    "KNOCK_ON_DOOR_SLAMMED_IN_FACE",
    "KNOCK_ON_DOOR_WRONG_HOUSE",
    "KNOCK_ON_DOOR_ASK_FOR_ARTHUR",
    "ENTRANCE_KICK_DOWN_DOOR",
    "ENTRANCE_KICK_DOWN_DOOR_MAIDS_MET",
    "ENTRANCE_KICK_DOWN_DOOR_MAIDS_NOT_MET",
}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/zaranixGround.js")
dest.write_text(
    "LT.TEXT = LT.TEXT || {};\n"
    + 'LT.TEXT["places/dominion/zaranixHome/groundFloor"] = '
    + json.dumps(out, ensure_ascii=False)
    + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
