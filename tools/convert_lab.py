import json
import re
from pathlib import Path

xml = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/lilayasHome/lab.xml").read_text(encoding="utf-8")
want = {
    "LAB",
    "LAB_ENTRY_BASE",
    "LAB_ENTRY_NAUGHTY_ROSE",
    "LAB_ENTRY_BASE_END",
    "LAB_EXIT",
    "AUNT_HOME_LABORATORY_TESTING",
    "AUNT_HOME_LABORATORY_TESTING_ARTHUR",
    "AUNT_HOME_LABORATORY_TESTING_ARTHUR_DECLINED",
    "AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA",
    "AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_DECLINED",
    "AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX",
    "AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX_START",
    "AUNT_HOME_LABORATORY_TESTING_HORNY_LILAYA_WANTS_SEX_DECLINED",
    "AUNT_HOME_LABORATORY_TESTING_REPEAT",
    "AUNT_HOME_LABORATORY_TESTING_LEAVE",
    "AUNT_HOME_LABORATORY_TESTING_MORE_SEX",
    "AUNT_HOME_LABORATORY_TESTING_MORE_SEX_START",
    "AUNT_HOME_LABORATORY_TESTING_MORE_SEX_STOP",
    "LAB_END_SEX",
    "LAB_END_SEX_NO_ORGASM",
    "LILAYA_SLAVER_RECOMMENDATION",
    "LILAYA_SLAVER_RECOMMENDATION_SLAVE_ACCOMMODATION",
}
out = {}
for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
    tag, body = m.group(1), m.group(2)
    if tag in want and tag not in out:
        out[tag] = body
dest = Path("Liliths Throne HTML/js/text/lab.js")
dest.write_text(
    "LT.TEXT[\"places/dominion/lilayasHome/lab\"] = " + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))
