import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/characters/enslavement.xml").read_text(encoding="utf-8")
want = {
    "ENSLAVEMENT_SUCCESS_COLLAR",
    "ENSLAVEMENT_SUCCESS",
    "ENSLAVEMENT_FAIL_ALREADY_SLAVE",
    "ENSLAVEMENT_FAIL_NOT_WANTED_DEMON",
    "ENSLAVEMENT_FAIL_NOT_WANTED",
    "ENSLAVEMENT_FAIL_NO_LICENSE",
}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/enslavement.js")
dest.write_text(
    'LT.TEXT["characters/enslavement"] = ' + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
