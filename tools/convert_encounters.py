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
    missing = sorted(want - set(out))
    print(dest_name, "tags", sorted(out), "missing", missing, "kb", round(dest.stat().st_size / 1024, 1))


STORM = {
    "STORM_ATTACK",
    "STORM_ATTACK_OFFER_BODY",
    "AFTER_COMBAT_VICTORY_ATTRACTION",
    "AFTER_COMBAT_VICTORY_NO_ATTRACTION",
    "AFTER_COMBAT_VICTORY_SEX",
    "AFTER_COMBAT_DEFEAT_GENERIC_START",
    "AFTER_SEX_VICTORY",
    "AFTER_SEX_DEFEAT",
}

HARPY = {
    "HARPY_ATTACK",
    "HARPY_ATTACK_OFFER_BODY",
    "HARPY_ATTACK_PAY_OFF",
    "AFTER_COMBAT_VICTORY_ATTRACTION",
    "AFTER_COMBAT_VICTORY_NO_ATTRACTION",
    "AFTER_COMBAT_VICTORY_SEX",
    "AFTER_COMBAT_DEFEAT_GENERIC_START",
    "AFTER_SEX_VICTORY",
    "AFTER_SEX_DEFEAT",
}

HARPY_STORM = {
    "HARPY_ATTACK",
    "HARPY_ATTACK_OFFER_BODY",
}

GENERIC = {
    "HARPY_NESTS_FIND_ITEM",
    "DOMINION_STREET_FIND_HAPPINESS",
}

convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/stormStreetAttack.xml",
    "stormStreetAttack.js",
    "encounters/dominion/stormStreetAttack",
    STORM,
)
convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/harpyAttack.xml",
    "harpyAttack.js",
    "encounters/dominion/harpyAttack",
    HARPY,
)
convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/harpyAttackStorm.xml",
    "harpyAttackStorm.js",
    "encounters/dominion/harpyAttackStorm",
    HARPY_STORM,
)
convert(
    r"Liliths Throne v0.4.10/res/txt/encounters/dominion/generic.xml",
    "encounterGeneric.js",
    "encounters/dominion/generic",
    GENERIC,
)
