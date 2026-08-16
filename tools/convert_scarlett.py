import json
import re
from pathlib import Path

base = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/slaverAlley")
out_dir = Path("Liliths Throne HTML/js/text")

def convert(src, dest_name, pack, want=None):
    xml = (base / src).read_text(encoding="utf-8")
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
    print(dest_name, "tags", sorted(out), "kb", round(dest.stat().st_size / 1024, 1))

convert(
    "scarlettsShop.xml",
    "scarlett.js",
    "places/dominion/slaverAlley/scarlettsShop",
    {
        "SCARLETTS_SHOP_EXTERIOR_CLOSED",
        "SCARLETTS_SHOP_EXTERIOR",
        "SCARLETTS_SHOP_INTRO",
        "SCARLETTS_SHOP",
        "SCARLETT_IS_A_BITCH",
        "SCARLETT_IS_A_SUPER_BITCH",
        "HELENAS_SHOP_EXTERIOR_HELENA_RETURNS",
        "HELENAS_SHOP_INTRODUCTION",
        "HELENAS_SHOP_OFFER_SCARLETT",
        "HELENAS_SHOP_SCARLETT_FOR_SALE",
        "HELENAS_SHOP_BUYING_SCARLETT",
        "HELENAS_SHOP_SCARLETT_PURCHASED_GENTLE",
        "HELENAS_SHOP_SCARLETT_PURCHASED_SHOUT",
        "HELENAS_SHOP_SCARLETT_PURCHASED_SLAP",
        "HELENAS_SHOP_SCARLETT_PURCHASED",
        "HELENAS_SHOP_BUYING_SCARLETT_KEEP_HER",
        "HELENAS_SHOP_BUYING_SCARLETT_FREE_HER",
    },
)
convert(
    "slaveryAdministration.xml",
    "slaveryAdministration.js",
    "places/dominion/slaverAlley/slaveryAdministration",
    {
        "SLAVERY_ADMINISTRATION_EXTERIOR",
        "SLAVERY_ADMINISTRATION_POSTERS",
        "SLAVERY_ADMINISTRATION",
        "SLAVERY_ADMINISTRATION_ASK_ABOUT_SLAVER_LICENSE",
        "SLAVERY_ADMINISTRATION_SLAVER_LICENSE_OBTAINED",
        "SLAVERY_ADMINISTRATION_SLAVER_LICENSE_OBTAINED_RULES",
    },
)
convert(
    "genericDialogue.xml",
    "slaverAlley.js",
    "places/dominion/slaverAlley/genericDialogue",
    {"OUTSIDE", "GATEWAY", "ALLEYWAY"},
)
