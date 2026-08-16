import json
import re
from pathlib import Path

base = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/enforcerHQ")
out_dir = Path("Liliths Throne HTML/js/text")

def convert(src_name, dest_name, pack, want=None):
    xml = (base / src_name).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if want is not None and tag not in want:
            continue
        if tag not in out:
            out[tag] = body
    dest = out_dir / dest_name
    dest.write_text(
        "LT.TEXT = LT.TEXT || {};\n"
        + 'LT.TEXT["'
        + pack
        + '"] = '
        + json.dumps(out, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    print(dest_name, "tags", len(out), "kb", round(dest.stat().st_size / 1024, 1))

convert("generic.xml", "enforcerGeneric.js", "places/dominion/enforcerHQ/generic")
convert(
    "brax.xml",
    "enforcerBrax.js",
    "places/dominion/enforcerHQ/brax",
    {
        "INTERIOR_BRAX",
        "INTERIOR_BRAX_TRUTH",
        "INTERIOR_BRAX_LIE",
        "INTERIOR_BRAX_LIE_IDIOT_BRAX",
        "INTERIOR_BRAX_LIE_BLUFFING",
        "INTERIOR_BRAX_LIE_BLUFFING_SUCCESS",
        "INTERIOR_BRAX_LIE_BLUFFING_IDIOT_BRAX",
        "AFTER_COMBAT_VICTORY",
        "AFTER_COMBAT_VICTORY_NO_SEX",
        "AFTER_COMBAT_VICTORY_DOMINATE",
        "AFTER_COMBAT_VICTORY_SUBMIT",
        "AFTER_COMBAT_DEFEAT",
        "AFTER_DEFEAT_TRANSFORMATION_REFUSED",
        "AFTER_DEFEAT_TRANSFORMATION_REFUSED_DOMINATED",
        "AFTER_SUBMISSIVE_SEX",
        "AFTER_DOMINANT_SEX",
    },
)
