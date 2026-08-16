"""Add official street / boulevard / plaza tags to js/text/dominionPlaces.js."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
XML = ROOT / "Liliths Throne v0.4.10" / "res" / "txt" / "places" / "dominion" / "dominionPlaces.xml"
JS = Path(__file__).resolve().parents[1] / "js" / "text" / "dominionPlaces.js"
TAGS = ("STREET", "STREET_SHADED", "BOULEVARD", "DOMINION_PLAZA")


def main() -> None:
    xml = XML.read_text(encoding="utf-8")
    js = JS.read_text(encoding="utf-8")
    match = re.search(r'LT\.TEXT\["places/dominion/dominionPlaces"\] = (\{.*\});', js, re.S)
    if not match:
        raise SystemExit("Could not parse dominionPlaces.js")
    obj = json.loads(match.group(1))
    for tag in TAGS:
        block = re.search(
            r'<htmlContent\s+tag="%s"\s*>\s*<!\[CDATA\[(.*?)\]\]>\s*</htmlContent>' % tag,
            xml,
            re.S,
        )
        if not block:
            raise SystemExit("Missing XML tag " + tag)
        obj[tag] = block.group(1)
    JS.write_text(
        'LT.TEXT["places/dominion/dominionPlaces"] = ' + json.dumps(obj, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print("Wrote", JS, "keys:", ", ".join(sorted(obj)))


if __name__ == "__main__":
    main()
