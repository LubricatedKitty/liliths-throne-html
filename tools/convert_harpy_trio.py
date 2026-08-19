"""Dump official harpy trio XML (nests + new Enforcer-post tags)."""
import json
import re
from pathlib import Path

HTML = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parents[2] / "Liliths Throne v0.4.10" / "res" / "txt"


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


def merge_generic():
    path = SRC / "places/dominion/harpyNests/generic.xml"
    text = path.read_text(encoding="utf-8")
    extra = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
        extra[m.group(1)] = m.group(2)
    dest = HTML / "js/text/harpyNests.js"
    existing = dest.read_text(encoding="utf-8")
    marker = 'LT.TEXT["places/dominion/harpyNests/generic"] ='
    assign = existing.find(marker)
    start = existing.find("{", assign if assign >= 0 else 0)
    end = existing.rfind("}")
    pack = json.loads(existing[start : end + 1])
    pack.update(extra)
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["places/dominion/harpyNests/generic"] = '
        + json.dumps(pack, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print("generic tags", len(pack))


if __name__ == "__main__":
    dump_xml("places/dominion/harpyNests/bimbo.xml", "js/text/harpyBimbo.js", "places/dominion/harpyNests/bimbo")
    dump_xml("places/dominion/harpyNests/dominant.xml", "js/text/harpyDominant.js", "places/dominion/harpyNests/dominant")
    dump_xml("places/dominion/harpyNests/nympho.xml", "js/text/harpyNympho.js", "places/dominion/harpyNests/nympho")
    merge_generic()
