"""Dump official Helena romance XML plus shop / gateway / DIY paint tags."""
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


def merge(rel, dest_rel, key):
    path = SRC / rel
    text = path.read_text(encoding="utf-8")
    extra = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
        extra[m.group(1)] = m.group(2)
    dest = HTML / dest_rel
    existing = dest.read_text(encoding="utf-8")
    marker = 'LT.TEXT["' + key + '"] ='
    assign = existing.find(marker)
    start = existing.find("{", assign if assign >= 0 else 0)
    end = existing.rfind("}")
    pack = json.loads(existing[start : end + 1])
    pack.update(extra)
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n" + marker + " " + json.dumps(pack, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(key, "merged tags", len(pack))


if __name__ == "__main__":
    dump_xml(
        "places/dominion/slaverAlley/helenasBoutique.xml",
        "js/text/helenasBoutique.js",
        "places/dominion/slaverAlley/helenasBoutique",
    )
    dump_xml(
        "places/dominion/slaverAlley/helenaRomance.xml",
        "js/text/helenaRomance.js",
        "places/dominion/slaverAlley/helenaRomance",
    )
    dump_xml(
        "places/dominion/homeImprovements/generic.xml",
        "js/text/homeImprovements.js",
        "places/dominion/homeImprovements/generic",
    )
    merge(
        "places/dominion/slaverAlley/scarlettsShop.xml",
        "js/text/scarlett.js",
        "places/dominion/slaverAlley/scarlettsShop",
    )
    merge(
        "places/dominion/slaverAlley/genericDialogue.xml",
        "js/text/slaverAlley.js",
        "places/dominion/slaverAlley/genericDialogue",
    )
