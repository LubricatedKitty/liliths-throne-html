"""Dump official Helena hotel date XML."""
import json
import re
from pathlib import Path

HTML = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parents[2] / "Liliths Throne v0.4.10" / "res" / "txt" / "places" / "dominion" / "helenaHotel"


def dump(name, key):
    text = (SRC / name).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', text, re.S):
        tag, body = m.group(1), m.group(2)
        if tag not in out:
            out[tag] = body
    dest = HTML / "js" / "text" / ("helenaHotel_" + name.replace(".xml", "") + ".js")
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["places/dominion/helenaHotel/'
        + name.replace(".xml", "")
        + '"] = '
        + json.dumps(out, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(dest.name, "tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))


if __name__ == "__main__":
    dump("hotelDate.xml", "hotelDate")
    dump("hotel.xml", "hotel")
    dump("apartment.xml", "apartment")
