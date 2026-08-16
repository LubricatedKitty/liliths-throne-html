import json
import re
from pathlib import Path

out_dir = Path("Liliths Throne HTML/js/text")


def convert(src, dest_name, pack, want):
    xml = Path(src).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if tag in want and tag not in out:
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
    print(dest_name, "tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))


convert(
    r"Liliths Throne v0.4.10/res/txt/places/dominion/dominionPlaces.xml",
    "dominionPlaces.js",
    "places/dominion/dominionPlaces",
    {"BACK_ALLEYS", "BACK_ALLEYS_SAFE", "DARK_ALLEYS", "BACK_ALLEYS_CANAL"},
)
convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/alleywayAttack.xml",
    "alleywayAttack.js",
    "encounters/dominion/alleywayAttack",
    {
        "ALLEY_ATTACK",
        "AFTER_COMBAT_VICTORY_ATTRACTION",
        "AFTER_COMBAT_VICTORY_NO_ATTRACTION",
        "AFTER_COMBAT_DEFEAT_GENERIC_START",
        "ALLEY_ATTACK_OFFER_BODY",
        "AFTER_COMBAT_VICTORY_SEX",
        "AFTER_SEX_VICTORY",
        "AFTER_SEX_DEFEAT",
    },
)
convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/prostitute.xml",
    "prostitute.js",
    "encounters/dominion/prostitute",
    {
        "ALLEY_PROSTITUTE",
        "ALLEY_PROSTITUTE_STORM",
        "ALLEY_PROSTITUTE_LEAVE",
        "ALLEY_PROSTITUTE_DOM_SEX",
        "ALLEY_PROSTITUTE_SUB_SEX",
        "AFTER_SEX_PAID",
        "AFTER_SEX_PAID_LEAVE",
        "AFTER_SEX_STORM",
        "AFTER_SEX_STORM_LEAVE",
    },
)
