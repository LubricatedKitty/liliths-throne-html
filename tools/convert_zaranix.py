"""Convert official Zaranix house XML (first-visit) plus lab Arthur-return tags."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = Path(__file__).resolve().parents[1]
SRC = ROOT / "Liliths Throne v0.4.10" / "res" / "txt"


def dump_xml(rel, dest_rel, key):
    path = SRC / rel
    text = path.read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
        tag, body = m.group(1), m.group(2)
        if tag not in out:
            out[tag] = body
    dest = HTML / dest_rel
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["'
        + key
        + '"] = '
        + json.dumps(out, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(key, "tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))


def merge_lab_arthur():
    path = SRC / "places/dominion/lilayasHome/lab.xml"
    text = path.read_text(encoding="utf-8")
    want = {
        "LAB_ENTRY_ARTHUR_PREGNANCY_BASE",
        "LAB_ENTRY_ARTHUR_PREGNANT",
        "LAB_ENTRY_ARTHUR_NOT_PREGNANT",
        "LAB_ENTRY_ARTHUR_BASE",
        "LAB_ENTRY_ARTHUR",
        "LAB_ARTHURS_TALE",
    }
    extra = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
        if m.group(1) in want:
            extra[m.group(1)] = m.group(2)
    dest = HTML / "js/text/lab.js"
    existing = dest.read_text(encoding="utf-8")
    marker = 'LT.TEXT["places/dominion/lilayasHome/lab"] ='
    assign = existing.find(marker)
    start = existing.find("{", assign if assign >= 0 else 0)
    end = existing.rfind("}")
    pack = json.loads(existing[start : end + 1])
    pack.update(extra)
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["places/dominion/lilayasHome/lab"] = '
        + json.dumps(pack, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print("lab arthur tags", sorted(extra), "total", len(pack))


if __name__ == "__main__":
    dump_xml(
        "places/dominion/zaranixHome/groundFloor.xml",
        "js/text/zaranixGround.js",
        "places/dominion/zaranixHome/groundFloor",
    )
    dump_xml(
        "places/dominion/zaranixHome/firstFloor.xml",
        "js/text/zaranixFirst.js",
        "places/dominion/zaranixHome/firstFloor",
    )
    dump_xml(
        "places/dominion/lilayasHome/arthursRoom.xml",
        "js/text/arthursRoom.js",
        "places/dominion/lilayasHome/arthursRoom",
    )
    merge_lab_arthur()
