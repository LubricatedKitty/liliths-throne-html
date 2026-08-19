import json
import re
from pathlib import Path

def convert(src, dest_key, dest_path, want):
    xml = Path(src).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if tag in want and tag not in out:
            out[tag] = body
    Path(dest_path).write_text(
        "LT.TEXT[" + json.dumps(dest_key) + "] = " + json.dumps(out, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(dest_key, sorted(out), "kb", round(Path(dest_path).stat().st_size / 1024, 1))

convert(
    "Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/clothingEmporium.xml",
    "places/dominion/shoppingArcade/clothingEmporium",
    "Liliths Throne HTML/js/text/clothingEmporium.js",
    {
        "NYAN_EXTERIOR",
        "SHOP_CLOTHING",
        "NYAN_GREETING_REPEAT",
        "NYAN_EXIT",
        "SHOP_ENCHANTED_CLOTHING",
        "SHOP_OFFER_HELP",
        "SHOP_REPORT_BACK",
        "NYAN_EXIT_EMBARRASSED",
        "NYAN_HIDING",
        "NYAN_HIDING_NEXT_DAY",
        "NYAN_HIDING_LEAVE",
        "NYAN_HIDING_END",
        "NYAN_HIDING_END_GIRLFRIEND",
        "NYAN_HIDING_END_DECLINE",
        "SHOP_CLOTHING_REPEAT_GIRLFRIEND",
    },
)
convert(
    "Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/succubisSecrets.xml",
    "places/dominion/shoppingArcade/succubisSecrets",
    "Liliths Throne HTML/js/text/succubisSecrets.js",
    {
        "EXTERIOR",
        "SHOP_BEAUTY_SALON_ENTER",
        "SHOP_BEAUTY_SALON_MAIN",
        "SHOP_BEAUTY_SALON_HAIR",
        "SHOP_BEAUTY_SALON_EYES",
        "SHOP_BEAUTY_SALON_COSMETICS",
        "SHOP_BEAUTY_SALON_TATTOOS",
    },
)
convert(
    "Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/dreamLover.xml",
    "places/dominion/shoppingArcade/dreamLover",
    "Liliths Throne HTML/js/text/dreamLover.js",
    {
        "EXTERIOR",
        "EXTERIOR_CLOSED",
        "ENTRY",
        "ENTRY_REPEAT",
        "ENTRY_REPEAT_ATTITUDE",
        "EXPLORE_SHELVES",
        "EXIT",
        "CONFRONT_ASHLEY",
        "IGNORE_ASHLEY",
        "SEX_TOY_DISCOVERY",
    },
)

def dump_all(src, dest_key, dest_path):
    xml = Path(src).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if tag not in out:
            out[tag] = body
    Path(dest_path).write_text(
        "LT.TEXT[" + json.dumps(dest_key) + "] = " + json.dumps(out, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(dest_key, "tags", len(out), "kb", round(Path(dest_path).stat().st_size / 1024, 1))

dump_all(
    "Liliths Throne v0.4.10/res/txt/places/dominion/shoppingArcade/pixsPlayground.xml",
    "places/dominion/shoppingArcade/pixsPlayground",
    "Liliths Throne HTML/js/text/pixsPlayground.js",
)
