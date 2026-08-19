"""Offline PNG + colour-table -> Lifebound-style sparse grid JS.

Reads Lilith's Throne v0.4.10 at rebuild time only. Play uses the written
js/maps files and assets/map/icons — the 0.4.10 tree is not required to play.

Not used at runtime. Re-run after map art or WorldType colour tables change:

    python tools/convert_maps.py

Tiles use the same minified shape as Lifebound/mods/lifeboundGrids.js:
    { x, y, location: { name, description, color, placeType, passage }, travelConfig? }

Y is stored with PNG-top = y:0 so Lifebound renderGrid (row 0 at the top) shows
the painted map right-side up. Official width/height come from the PNG, not 25.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JAVA_SRC = ROOT / "LilithsThrone v0.4.10.jar.src"
JAVA_MAPS = JAVA_SRC / "com" / "lilithsthrone" / "res" / "map"
WORLDTYPE = JAVA_SRC / "com" / "lilithsthrone" / "world" / "WorldType.java"
PLACETYPE = JAVA_SRC / "com" / "lilithsthrone" / "world" / "places" / "PlaceType.java"
XML_MAPS = ROOT / "Liliths Throne v0.4.10" / "res" / "maps"
OUT_DIR = Path(__file__).resolve().parents[1] / "js" / "maps"

IMPASSABLE = {
    "GENERIC_IMPASSABLE",
    "PlaceType.GENERIC_IMPASSABLE",
}

# Stairs / floor links. Destination tile is found by place type on the other grid.
STAIR_LINKS = [
    ("LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_STAIR_UP", "LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_STAIR_DOWN"),
    ("LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_STAIR_UP_SECONDARY", "LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_STAIR_DOWN_SECONDARY"),
    ("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_STAIR_DOWN", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_STAIR_UP"),
    ("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_STAIR_DOWN_SECONDARY", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_STAIR_UP_SECONDARY"),
    ("ZARANIX_HOUSE_GROUND_FLOOR", "ZARANIX_GF_STAIRS", "ZARANIX_HOUSE_FIRST_FLOOR", "ZARANIX_FF_STAIRS"),
    ("ZARANIX_HOUSE_FIRST_FLOOR", "ZARANIX_FF_STAIRS", "ZARANIX_HOUSE_GROUND_FLOOR", "ZARANIX_GF_STAIRS"),
    ("ANGELS_KISS_GROUND_FLOOR", "ANGELS_KISS_STAIRCASE_UP", "ANGELS_KISS_FIRST_FLOOR", "ANGELS_KISS_STAIRCASE_DOWN"),
    ("ANGELS_KISS_FIRST_FLOOR", "ANGELS_KISS_STAIRCASE_DOWN", "ANGELS_KISS_GROUND_FLOOR", "ANGELS_KISS_STAIRCASE_UP"),
    ("BOUNTY_HUNTER_LODGE", "BOUNTY_HUNTER_LODGE_STAIRS", "BOUNTY_HUNTER_LODGE_UPSTAIRS", "BOUNTY_HUNTER_LODGE_UPSTAIRS_STAIRS"),
    ("BOUNTY_HUNTER_LODGE_UPSTAIRS", "BOUNTY_HUNTER_LODGE_UPSTAIRS_STAIRS", "BOUNTY_HUNTER_LODGE", "BOUNTY_HUNTER_LODGE_STAIRS"),
    ("SLIME_QUEENS_LAIR_GROUND_FLOOR", "SLIME_QUEENS_LAIR_STAIRS_UP", "SLIME_QUEENS_LAIR_FIRST_FLOOR", "SLIME_QUEENS_LAIR_STAIRS_DOWN"),
    ("SLIME_QUEENS_LAIR_FIRST_FLOOR", "SLIME_QUEENS_LAIR_STAIRS_DOWN", "SLIME_QUEENS_LAIR_GROUND_FLOOR", "SLIME_QUEENS_LAIR_STAIRS_UP"),
    ("innoxia_fields_elis_abandoned_bakery_f0", "innoxia_fields_elis_abandoned_bakery_f0_stairs", "innoxia_fields_elis_abandoned_bakery_f1", "innoxia_fields_elis_abandoned_bakery_f1_stairs"),
    ("innoxia_fields_elis_abandoned_bakery_f1", "innoxia_fields_elis_abandoned_bakery_f1_stairs", "innoxia_fields_elis_abandoned_bakery_f0", "innoxia_fields_elis_abandoned_bakery_f0_stairs"),
    ("innoxia_fields_elis_tavern_f0", "innoxia_fields_elis_tavern_f0_stairs", "innoxia_fields_elis_tavern_f1", "innoxia_fields_elis_tavern_f1_stairs"),
    ("innoxia_fields_elis_tavern_f1", "innoxia_fields_elis_tavern_f1_stairs", "innoxia_fields_elis_tavern_f0", "innoxia_fields_elis_tavern_f0_stairs"),
    ("innoxia_fields_elis_town_hall_f0", "innoxia_fields_elis_town_hall_f0_stairs", "innoxia_fields_elis_town_hall_f1", "innoxia_fields_elis_town_hall_f1_stairs"),
    ("innoxia_fields_elis_town_hall_f1", "innoxia_fields_elis_town_hall_f1_stairs", "innoxia_fields_elis_town_hall_f0", "innoxia_fields_elis_town_hall_f0_stairs"),
]

# (fromWorld, fromPlace, toWorld, toPlace, label)
WORLD_LINKS = [
    ("LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_ENTRANCE_HALL", "DOMINION", "DOMINION_AUNTS_HOME", "Exit"),
    ("DOMINION", "DOMINION_AUNTS_HOME", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_ENTRANCE_HALL", "Enter"),
    ("DOMINION", "DOMINION_SHOPPING_ARCADE", "SHOPPING_ARCADE", "SHOPPING_ARCADE_ENTRANCE", "Enter"),
    ("SHOPPING_ARCADE", "SHOPPING_ARCADE_ENTRANCE", "DOMINION", "DOMINION_SHOPPING_ARCADE", "Exit"),
    ("SHOPPING_ARCADE", "SHOPPING_ARCADE_PIXS_GYM", "innoxia_dominion_shopping_arcade_gym", "innoxia_dominion_shopping_arcade_gym_exit", "Enter"),
    ("innoxia_dominion_shopping_arcade_gym", "innoxia_dominion_shopping_arcade_gym_exit", "SHOPPING_ARCADE", "SHOPPING_ARCADE_PIXS_GYM", "Exit"),
    ("DOMINION", "DOMINION_ENFORCER_HQ", "ENFORCER_HQ", "ENFORCER_HQ_ENTRANCE", "Enter"),
    ("ENFORCER_HQ", "ENFORCER_HQ_ENTRANCE", "DOMINION", "DOMINION_ENFORCER_HQ", "Exit"),
    ("DOMINION", "DOMINION_SLAVER_ALLEY", "SLAVER_ALLEY", "SLAVER_ALLEY_ENTRANCE", "Enter"),
    ("SLAVER_ALLEY", "SLAVER_ALLEY_ENTRANCE", "DOMINION", "DOMINION_SLAVER_ALLEY", "Exit"),
    ("SLAVER_ALLEY", "SLAVER_ALLEY_BOUNTY_HUNTERS", "BOUNTY_HUNTER_LODGE", "BOUNTY_HUNTER_LODGE_ENTRANCE", "Enter"),
    ("BOUNTY_HUNTER_LODGE", "BOUNTY_HUNTER_LODGE_ENTRANCE", "SLAVER_ALLEY", "SLAVER_ALLEY_BOUNTY_HUNTERS", "Exit"),
    ("DOMINION", "DOMINION_NIGHTLIFE_DISTRICT", "NIGHTLIFE_CLUB", "WATERING_HOLE_ENTRANCE", "Enter"),
    ("NIGHTLIFE_CLUB", "WATERING_HOLE_ENTRANCE", "DOMINION", "DOMINION_NIGHTLIFE_DISTRICT", "Exit"),
    ("DOMINION", "DOMINION_HARPY_NESTS_ENTRANCE", "HARPY_NEST", "HARPY_NESTS_ENTRANCE_ENFORCER_POST", "Enter"),
    ("HARPY_NEST", "HARPY_NESTS_ENTRANCE_ENFORCER_POST", "DOMINION", "DOMINION_HARPY_NESTS_ENTRANCE", "Exit"),
    ("DOMINION", "DOMINION_RED_LIGHT_DISTRICT", "ANGELS_KISS_GROUND_FLOOR", "ANGELS_KISS_ENTRANCE", "Enter"),
    ("ANGELS_KISS_GROUND_FLOOR", "ANGELS_KISS_ENTRANCE", "DOMINION", "DOMINION_RED_LIGHT_DISTRICT", "Exit"),
    ("DOMINION", "DOMINION_HOME_IMPROVEMENT", "HOME_IMPROVEMENTS", "HOME_IMPROVEMENTS_ENTRANCE", "Enter"),
    ("HOME_IMPROVEMENTS", "HOME_IMPROVEMENTS_ENTRANCE", "DOMINION", "DOMINION_HOME_IMPROVEMENT", "Exit"),
    ("DOMINION", "DOMINION_CITY_HALL", "CITY_HALL", "CITY_HALL_ENTRANCE", "Enter"),
    ("CITY_HALL", "CITY_HALL_ENTRANCE", "DOMINION", "DOMINION_CITY_HALL", "Exit"),
    ("DOMINION", "DOMINION_BANK", "innoxia_dominion_bank", "innoxia_dominion_bank_exit", "Enter"),
    ("innoxia_dominion_bank", "innoxia_dominion_bank_exit", "DOMINION", "DOMINION_BANK", "Exit"),
    ("DOMINION", "DOMINION_CALLIE_BAKERY", "nnxx_callie_bakery", "nnxx_callie_bakery_counter", "Enter"),
    ("nnxx_callie_bakery", "nnxx_callie_bakery_counter", "DOMINION", "DOMINION_CALLIE_BAKERY", "Exit"),
    ("DOMINION", "DOMINION_DEMON_HOME_SEX_SHOP", "innoxia_dominion_sex_shop", "innoxia_dominion_sex_shop_exit", "Enter"),
    ("innoxia_dominion_sex_shop", "innoxia_dominion_sex_shop_exit", "DOMINION", "DOMINION_DEMON_HOME_SEX_SHOP", "Exit"),
    ("DOMINION", "DOMINION_WAREHOUSES", "TEXTILES_WAREHOUSE", "TEXTILE_WAREHOUSE_ENTRANCE", "Enter"),
    ("TEXTILES_WAREHOUSE", "TEXTILE_WAREHOUSE_ENTRANCE", "DOMINION", "DOMINION_WAREHOUSES", "Exit"),
    ("DOMINION", "DOMINION_DEMON_HOME_ZARANIX", "ZARANIX_HOUSE_GROUND_FLOOR", "ZARANIX_GF_ENTRANCE", "Enter"),
    ("ZARANIX_HOUSE_GROUND_FLOOR", "ZARANIX_GF_ENTRANCE", "DOMINION", "DOMINION_DEMON_HOME_ZARANIX", "Exit"),
    ("DOMINION", "DOMINION_DEMON_HOME_ARTHUR", "FELICIA_APARTMENT", "FELICIA_APARTMENT_ENTRANCE", "Enter"),
    ("FELICIA_APARTMENT", "FELICIA_APARTMENT_ENTRANCE", "DOMINION", "DOMINION_DEMON_HOME_ARTHUR", "Exit"),
    ("DOMINION", "DOMINION_DEMON_HOME_DADDY", "DADDYS_APARTMENT", "DADDY_APARTMENT_ENTRANCE", "Enter"),
    ("DADDYS_APARTMENT", "DADDY_APARTMENT_ENTRANCE", "DOMINION", "DOMINION_DEMON_HOME_DADDY", "Exit"),
    ("DOMINION", "DOMINION_EXIT_TO_SUBMISSION", "SUBMISSION", "SUBMISSION_ENTRANCE", "Enter"),
    ("SUBMISSION", "SUBMISSION_ENTRANCE", "DOMINION", "DOMINION_EXIT_TO_SUBMISSION", "Exit"),
    ("SUBMISSION", "SUBMISSION_BAT_CAVERNS", "BAT_CAVERNS", "BAT_CAVERN_ENTRANCE", "Enter"),
    ("BAT_CAVERNS", "BAT_CAVERN_ENTRANCE", "SUBMISSION", "SUBMISSION_BAT_CAVERNS", "Exit"),
    ("SUBMISSION", "SUBMISSION_GAMBLING_DEN", "GAMBLING_DEN", "GAMBLING_DEN_ENTRANCE", "Enter"),
    ("GAMBLING_DEN", "GAMBLING_DEN_ENTRANCE", "SUBMISSION", "SUBMISSION_GAMBLING_DEN", "Exit"),
    ("SUBMISSION", "SUBMISSION_LILIN_PALACE", "LYSSIETH_PALACE", "LYSSIETH_PALACE_ENTRANCE", "Enter"),
    ("LYSSIETH_PALACE", "LYSSIETH_PALACE_ENTRANCE", "SUBMISSION", "SUBMISSION_LILIN_PALACE", "Exit"),
    ("SUBMISSION", "SUBMISSION_RAT_WARREN", "RAT_WARRENS", "RAT_WARRENS_ENTRANCE", "Enter"),
    ("RAT_WARRENS", "RAT_WARRENS_ENTRANCE", "SUBMISSION", "SUBMISSION_RAT_WARREN", "Exit"),
    ("SUBMISSION", "SUBMISSION_IMP_FORTRESS_ALPHA", "IMP_FORTRESS_ALPHA", None, "Enter"),
    ("IMP_FORTRESS_ALPHA", None, "SUBMISSION", "SUBMISSION_IMP_FORTRESS_ALPHA", "Exit"),
    ("SUBMISSION", "SUBMISSION_IMP_FORTRESS_DEMON", "IMP_FORTRESS_DEMON", None, "Enter"),
    ("IMP_FORTRESS_DEMON", None, "SUBMISSION", "SUBMISSION_IMP_FORTRESS_DEMON", "Exit"),
    ("SUBMISSION", "SUBMISSION_IMP_FORTRESS_FEMALES", "IMP_FORTRESS_FEMALES", None, "Enter"),
    ("IMP_FORTRESS_FEMALES", None, "SUBMISSION", "SUBMISSION_IMP_FORTRESS_FEMALES", "Exit"),
    ("SUBMISSION", "SUBMISSION_IMP_FORTRESS_MALES", "IMP_FORTRESS_MALES", None, "Enter"),
    ("IMP_FORTRESS_MALES", None, "SUBMISSION", "SUBMISSION_IMP_FORTRESS_MALES", "Exit"),
    ("BAT_CAVERNS", "BAT_CAVERN_SLIME_QUEEN_LAIR", "SLIME_QUEENS_LAIR_GROUND_FLOOR", None, "Enter"),
    ("SLIME_QUEENS_LAIR_GROUND_FLOOR", None, "BAT_CAVERNS", "BAT_CAVERN_SLIME_QUEEN_LAIR", "Exit"),
    ("BAT_CAVERNS", "BAT_CAVERNS_REBEL_BASE_ENTRANCE_EXTERIOR", "REBEL_BASE", "REBEL_BASE_ENTRANCE", "Enter"),
    ("REBEL_BASE", "REBEL_BASE_ENTRANCE", "BAT_CAVERNS", "BAT_CAVERNS_REBEL_BASE_ENTRANCE_EXTERIOR", "Exit"),
    ("DOMINION", "DOMINION_EXIT_NORTH", "WORLD_MAP", "WORLD_MAP_DOMINION", "World map"),
    ("DOMINION", "DOMINION_EXIT_SOUTH", "WORLD_MAP", "WORLD_MAP_DOMINION", "World map"),
    ("DOMINION", "DOMINION_EXIT_EAST", "WORLD_MAP", "WORLD_MAP_DOMINION", "World map"),
    ("DOMINION", "DOMINION_EXIT_WEST", "WORLD_MAP", "WORLD_MAP_DOMINION", "World map"),
    ("WORLD_MAP", "WORLD_MAP_DOMINION", "DOMINION", "DOMINION_PLAZA", "Enter"),
    ("WORLD_MAP", "WORLD_MAP_FIELDS_CITY", "innoxia_fields_elis_town", "innoxia_fields_elis_town_entry_east", "Enter"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_entry_east", "WORLD_MAP", "WORLD_MAP_FIELDS_CITY", "World map"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_entry_west", "WORLD_MAP", "WORLD_MAP_FIELDS_CITY", "World map"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern", "innoxia_fields_elis_tavern_f0", None, "Enter"),
    ("innoxia_fields_elis_tavern_f0", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern_taur", "innoxia_fields_elis_tavern_taur", None, "Enter"),
    ("innoxia_fields_elis_tavern_taur", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern_taur", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern_alley", "innoxia_fields_elis_tavern_alley", None, "Enter"),
    ("innoxia_fields_elis_tavern_alley", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_tavern_alley", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_bank", "innoxia_fields_elis_bank", "innoxia_fields_elis_bank_exit", "Enter"),
    ("innoxia_fields_elis_bank", "innoxia_fields_elis_bank_exit", "innoxia_fields_elis_town", "innoxia_fields_elis_town_bank", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_market", "innoxia_fields_elis_market", None, "Enter"),
    ("innoxia_fields_elis_market", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_market", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_shops", "innoxia_fields_elis_shops", None, "Enter"),
    ("innoxia_fields_elis_shops", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_shops", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_town_hall", "innoxia_fields_elis_town_hall_f0", None, "Enter"),
    ("innoxia_fields_elis_town_hall_f0", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_town_hall", "Exit"),
    ("innoxia_fields_elis_town", "innoxia_fields_elis_town_enforcers", "innoxia_fields_elis_enforcer_station", None, "Enter"),
    ("innoxia_fields_elis_enforcer_station", None, "innoxia_fields_elis_town", "innoxia_fields_elis_town_enforcers", "Exit"),
]


def java_rgb(value: int) -> tuple[int, int, int]:
    return ((value >> 16) & 255, (value >> 8) & 255, value & 255)


def hex_color(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def js_ident(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_]", "_", name)
    if cleaned and cleaned[0].isdigit():
        cleaned = "_" + cleaned
    return cleaned


def strip_java_comments(text: str) -> str:
    return re.sub(r"/\*.*?\*/", "", text, flags=re.S)


def unescape_java(s: str) -> str:
    return s.encode("utf-8").decode("unicode_escape")


def parse_base_colours(text: str) -> dict[str, str]:
    text = strip_java_comments(text)
    out = {}
    for m in re.finditer(r"\b([A-Z][A-Z0-9_]*)\s*\(\s*Util\.newColour\((\d+)\)", text):
        out[m.group(1)] = hex_color(java_rgb(int(m.group(2))))
    return out


def parse_preset_colours(text: str, base: dict[str, str]) -> dict[str, str]:
    text = strip_java_comments(text)
    out = dict(base)
    for m in re.finditer(r"public static Colour\s+(\w+)\s*=\s*new Colour\(false,\s*BaseColour\.(\w+)", text):
        if m.group(2) in base:
            out[m.group(1)] = base[m.group(2)]
    for m in re.finditer(r"public static Colour\s+(\w+)\s*=\s*new Colour\(false,\s*Util\.newColour\((\d+)\)", text):
        out[m.group(1)] = hex_color(java_rgb(int(m.group(2))))
    out.setdefault("MAP_BACKGROUND", "#bbbbbb")
    out.setdefault("MAP_BACKGROUND_GREEN", "#bbddbb")
    out.setdefault("BASE_GREY", "#b3b3b3")
    return out


def parse_place_types(text: str) -> dict[str, dict]:
    places: dict[str, dict] = {}
    text = strip_java_comments(text)
    pattern = re.compile(
        r"public static final AbstractPlaceType\s+(\w+)\s*=.*?"
        r"WorldRegion\.\w+\s*,\s*"
        r"\"((?:\\.|[^\"])*)\"\s*,\s*"
        r"\"((?:\\.|[^\"])*)\"\s*,\s*"
        r"(null|\"((?:\\.|[^\"])*)\")\s*,\s*"
        r"PresetColour\.(\w+)",
        re.S,
    )
    starts = [m.start() for m in re.finditer(r"public static final AbstractPlaceType\s+(\w+)", text)]
    ids = [m.group(1) for m in re.finditer(r"public static final AbstractPlaceType\s+(\w+)", text)]
    starts.append(len(text))
    by_id_block = {ids[i]: text[starts[i] : starts[i + 1]] for i in range(len(ids))}
    for match in pattern.finditer(text):
        pid = match.group(1)
        svg = None if match.group(4) == "null" else match.group(5)
        info = {
            "id": pid,
            "name": unescape_java(match.group(2)),
            "description": unescape_java(match.group(3)),
            "svg": svg,
            "colourName": match.group(6),
            "backgroundName": "MAP_BACKGROUND",
        }
        block = by_id_block.get(pid, "")
        bg = re.search(r"initMapBackgroundColour\s*\(\s*PresetColour\.(\w+)", block)
        if bg:
            info["backgroundName"] = bg.group(1)
        places[pid] = info
    places.setdefault(
        "GENERIC_IMPASSABLE",
        {"id": "GENERIC_IMPASSABLE", "name": "Impassable", "description": ""},
    )
    return places


# Official AbstractGlobalPlaceType only ships icons for dominion/elis/forest/river.
# Unused official grassland.svg plus generated circle icons cover the rest of the world map.
WORLD_MAP_SVG_FALLBACK = {
    "WORLD_MAP_GRASSLANDS": "global/grassland",
    "WORLD_MAP_FIELDS": "global/grassland",
    "WORLD_MAP_ARID_GRASSLAND": "global/grassland",
    "WORLD_MAP_ARID_SAVANNAH": "global/grassland",
    "WORLD_MAP_THICK_JUNGLE": "global/forest",
    "WORLD_MAP_JUNGLE": "global/forest",
    "WORLD_MAP_YOUKO_FOREST": "global/forest",
    "WORLD_MAP_WILD_RIVER": "global/river",
    "WORLD_MAP_GLACIAL_LAKE": "global/river",
    "WORLD_MAP_SEA": "global/river",
    "WORLD_MAP_JUNGLE_CITY": "global/elis",
    "WORLD_MAP_DESERT_CITY": "global/elis",
    "WORLD_MAP_SEA_CITY": "global/elis",
    "WORLD_MAP_FOOTHILLS": "global/mountains",
    "WORLD_MAP_MOUNTAINS": "global/mountains",
    "WORLD_MAP_SNOWY_MOUNTAINS": "global/mountains",
    "WORLD_MAP_SNOWY_VALLEY": "global/snow",
    "WORLD_MAP_DESERT": "global/desert",
    "WORLD_MAP_SAND_DUNES": "global/desert",
    "WORLD_MAP_VOLCANO": "global/volcano",
    "WORLD_MAP_LAVA_FLOWS": "global/lava",
}

HTML_MAP_ASSETS = Path(__file__).resolve().parents[1] / "assets" / "map"


def parse_global_place_types(text: str, colours: dict[str, str]) -> dict[str, dict]:
    """AbstractGlobalPlaceType is a different constructor than AbstractPlaceType."""
    places: dict[str, dict] = {}
    text = strip_java_comments(text)
    starts = [m.start() for m in re.finditer(r"public static final AbstractGlobalPlaceType\s+(\w+)", text)]
    ids = [m.group(1) for m in re.finditer(r"public static final AbstractGlobalPlaceType\s+(\w+)", text)]
    starts.append(len(text))
    for i, pid in enumerate(ids):
        block = text[starts[i] : starts[i + 1]]
        ctor = block.split("{", 1)[0]
        strings = [unescape_java(s) for s in re.findall(r"\"((?:\\.|[^\"])*)\"", ctor)]
        name = strings[0] if strings else pid
        description = ""
        for s in strings[1:]:
            if s and not s.startswith("global/"):
                description = s
                break
        svg = None
        for s in strings:
            if s.startswith("global/"):
                svg = s
                break
        if not svg:
            svg = WORLD_MAP_SVG_FALLBACK.get(pid)
        color_hexes = []
        for cm in re.finditer(r"PresetColour\.(\w+)|Util\.newColour\((\d+)\)", ctor):
            if cm.group(1):
                color_hexes.append(colours.get(cm.group(1), "#b3b3b3"))
            else:
                color_hexes.append(hex_color(java_rgb(int(cm.group(2)))))
        icon = color_hexes[0] if color_hexes else "#b3b3b3"
        background = color_hexes[1] if len(color_hexes) > 1 else icon
        places[pid] = {
            "id": pid,
            "name": name,
            "description": description,
            "svg": svg,
            "colourHex": icon,
            "backgroundHex": background,
            "backgroundName": None,
            "colourName": None,
        }
    return places


def parse_java_worlds(text: str) -> list[dict]:
    worlds = []
    text = strip_java_comments(text)
    starts = [m.start() for m in re.finditer(r"public static AbstractWorldType\s+([A-Z][A-Z0-9_]*)", text)]
    names = [m.group(1) for m in re.finditer(r"public static AbstractWorldType\s+([A-Z][A-Z0-9_]*)", text)]
    starts.append(len(text))
    for i, name in enumerate(names):
        block = text[starts[i] : starts[i + 1]]
        title_match = re.search(r"WorldRegion\.\w+\s*,\s*\"((?:\\.|[^\"])*)\"", block)
        path_match = re.search(r"\"(/com/lilithsthrone/res/map/[^\"]+\.png)\"", block)
        colours = {}
        for cm in re.finditer(r"new Color\((\d+)\)\s*,\s*PlaceType\.(\w+)", block):
            colours[java_rgb(int(cm.group(1)))] = cm.group(2)
        worlds.append(
            {
                "id": name,
                "name": title_match.group(1) if title_match else name,
                "png": JAVA_SRC / path_match.group(1).lstrip("/").replace("/", "\\") if path_match else None,
                "colours": colours,
            }
        )
    return worlds


def cdata(text: str, tag: str) -> str:
    match = re.search(rf"<{tag}><!\[CDATA\[(.*?)\]\]></{tag}>", text, re.S)
    if match:
        return match.group(1).strip()
    match = re.search(rf"<{tag}>(.*?)</{tag}>", text, re.S)
    return match.group(1).strip() if match else ""


def parse_xml_place(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    name = cdata(text, "name") or path.stem.replace("_", " ")
    desc = cdata(text, "tooltipDescription") or cdata(text, "description") or ""
    colour = cdata(text, "colour") or "BASE_GREY"
    background = cdata(text, "backgroundColour") or "MAP_BACKGROUND"
    svg_name = cdata(text, "svgName")
    svg_path = None
    if svg_name:
        candidate = path.with_name(svg_name + ".svg")
        if candidate.exists():
            svg_path = str(candidate)
        else:
            sibling = path.parent / (svg_name + ".svg")
            if sibling.exists():
                svg_path = str(sibling)
    else:
        sibling = path.with_suffix(".svg")
        if sibling.exists():
            svg_path = str(sibling)
    return {
        "name": name,
        "description": desc,
        "colourName": colour,
        "backgroundName": background,
        "svgFile": svg_path,
    }


def parse_xml_worlds() -> list[dict]:
    worlds = []
    if not XML_MAPS.exists():
        return worlds
    for world_xml in XML_MAPS.rglob("worldType.xml"):
        folder = world_xml.parent
        png = folder / "map.png"
        if not png.exists():
            continue
        rel = folder.relative_to(XML_MAPS).as_posix()
        world_id = rel.replace("/", "_")
        text = world_xml.read_text(encoding="utf-8", errors="replace")
        title = cdata(text, "name") or world_id
        colours = {}
        xml_places = {}
        for pm in re.finditer(r'<place\s+colour="([^"]+)">\s*([^<]+?)\s*</place>', text):
            hexcol = pm.group(1).strip().lstrip("#")
            if len(hexcol) == 3:
                hexcol = "".join(c * 2 for c in hexcol)
            rgb = tuple(int(hexcol[i : i + 2], 16) for i in (0, 2, 4))
            pid = pm.group(2).strip()
            colours[rgb] = pid
            place_xml = folder / "placeTypes" / (pid.split("_")[-1] + ".xml")
            # Official files use the last path segment, but ids are full. Try several names.
            xml_places[pid] = {"id": pid, "name": pid, "description": ""}
        place_dir = folder / "placeTypes"
        if place_dir.exists():
            by_stem = {p.stem: parse_xml_place(p) for p in place_dir.glob("*.xml")}
            for pid, info in xml_places.items():
                stem = pid
                if pid.startswith(world_id + "_"):
                    stem = pid[len(world_id) + 1 :]
                elif "_" in pid:
                    stem = pid.split("_")[-1]
                data = by_stem.get(stem) or by_stem.get(pid)
                if not data:
                    # fuzzy: any stem that the id ends with
                    for s, d in by_stem.items():
                        if pid.endswith("_" + s) or pid.endswith(s):
                            data = d
                            break
                if data:
                    info.update(data)
                    info["id"] = pid
        worlds.append(
            {
                "id": world_id,
                "name": title,
                "png": png,
                "colours": colours,
                "xml_places": xml_places,
            }
        )
    return worlds


def decode_png(world: dict, places: dict) -> tuple[list[dict], int, int, list[str]]:
    from PIL import Image

    warnings = []
    img = Image.open(world["png"]).convert("RGB")
    width, height = img.size
    pixels = img.load()
    tiles = []
    unknown = {}
    for y in range(height):
        for x in range(width):
            rgb = pixels[x, y]
            place_id = world["colours"].get(rgb)
            if place_id is None:
                unknown[rgb] = unknown.get(rgb, 0) + 1
                continue
            short = place_id.split(".")[-1]
            if short in IMPASSABLE or place_id in IMPASSABLE:
                continue
            info = places.get(short) or places.get(place_id) or world.get("xml_places", {}).get(place_id)
            if not info:
                info = {"id": short, "name": short.replace("_", " ").title(), "description": ""}
            color = hex_color(rgb)
            loc = {
                "name": info.get("name") or short,
                "color": color,
                "placeType": short,
                "passage": "place." + short,
            }
            if info.get("description"):
                loc["description"] = info["description"]
            tiles.append({"x": x, "y": y, "location": loc})
    for rgb, count in sorted(unknown.items(), key=lambda kv: -kv[1]):
        warnings.append(
            f"{world['id']}: unknown colour {hex_color(rgb)} x{count}"
        )
    return tiles, width, height, warnings


def first_tile(tiles: list[dict], place_id: str | None) -> dict | None:
    if not tiles:
        return None
    if place_id:
        for tile in tiles:
            if tile["location"]["placeType"] == place_id:
                return tile
        return None
    for key in ("exit", "entrance", "entry"):
        for tile in tiles:
            if key in tile["location"]["placeType"].lower():
                return tile
    return tiles[0]


def apply_link(grids: dict, index: dict, src_grid: str, src_place: str | None, dest_grid: str, dest_place: str | None, label: str) -> int:
    src_tiles = grids.get(src_grid)
    dest_tile = first_tile(grids.get(dest_grid, []), dest_place)
    if dest_place and dest_grid in index:
        dest_tile = index[dest_grid].get(dest_place) or dest_tile
    if not src_tiles or not dest_tile:
        return 0
    if src_place:
        targets = [t for t in src_tiles if t["location"]["placeType"] == src_place]
    else:
        targets = [
            t
            for t in src_tiles
            if any(k in t["location"]["placeType"].lower() for k in ("exit", "entrance", "entry"))
        ]
        if not targets:
            targets = [src_tiles[0]]
    for tile in targets:
        tile["travelConfig"] = {
            "travelType": label,
            "label": label,
            "nextLocationName": dest_tile["location"]["name"],
            "nextGridName": dest_grid,
            "coords": {"x": dest_tile["x"], "y": dest_tile["y"]},
        }
    return len(targets)


def apply_travel(grids: dict[str, list[dict]]) -> None:
    index = {}
    for gid, tiles in grids.items():
        by_place = {}
        for tile in tiles:
            by_place.setdefault(tile["location"]["placeType"], tile)
        index[gid] = by_place
    for src_grid, src_place, dest_grid, dest_place in STAIR_LINKS:
        apply_link(grids, index, src_grid, src_place, dest_grid, dest_place, "To")
    for src_grid, src_place, dest_grid, dest_place, label in WORLD_LINKS:
        apply_link(grids, index, src_grid, src_place, dest_grid, dest_place, label)


def shade(hexcol: str, factor: float) -> str:
    h = hexcol.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    r = min(255, int(r + (255 - r) * factor))
    g = min(255, int(g + (255 - g) * factor))
    b = min(255, int(b + (255 - b) * factor))
    return "#{:02x}{:02x}{:02x}".format(r, g, b)


def recolor_svg(text: str, color: str) -> str:
    light = shade(color, 0.35)
    return (
        text.replace("#f55", color)
        .replace("#ff5555", color)
        .replace("#F55", color)
        .replace("#FF5555", color)
        .replace("#ff8080", light)
        .replace("#FF8080", light)
    )


def write_place_icons(places: dict, colours: dict[str, str]) -> dict[str, dict]:
    icon_dir = Path(__file__).resolve().parents[1] / "assets" / "map" / "icons"
    icon_dir.mkdir(parents=True, exist_ok=True)
    visuals = {}
    copied = 0
    for pid, info in places.items():
        if pid in IMPASSABLE:
            continue
        color = info.get("colourHex") or colours.get(info.get("colourName") or "", "#b3b3b3")
        background = info.get("backgroundHex") or colours.get(info.get("backgroundName") or "", "#bbbbbb")
        visual = {"background": background, "color": color}
        src = None
        if info.get("svgFile") and Path(info["svgFile"]).exists():
            src = Path(info["svgFile"])
        elif info.get("svg"):
            rel = info["svg"].replace("/", "\\") + ".svg"
            candidate = JAVA_MAPS / rel
            if not candidate.exists():
                candidate = HTML_MAP_ASSETS / rel
            if candidate.exists():
                src = candidate
        if src:
            dest = icon_dir / (js_ident(pid) + ".svg")
            dest.write_text(recolor_svg(src.read_text(encoding="utf-8", errors="replace"), color), encoding="utf-8")
            visual["icon"] = "assets/map/icons/" + dest.name
            copied += 1
        visuals[pid] = visual
    print("Icons written:", copied)
    return visuals


def emit_visuals(visuals: dict) -> str:
    lines = [
        "/* Generated by tools/convert_maps.py — do not edit by hand. */",
        "(function () {",
        "  window.LT = window.LT || {};",
        "  var GRAY = \"#bbbbbb\";",
        "  LT.placeVisuals = " + json.dumps(visuals, ensure_ascii=False) + ";",
        "  LT.placeVisual = function (placeType) {",
        "    return (LT.placeVisuals && LT.placeVisuals[placeType]) || { background: GRAY };",
        "  };",
        "})();",
        "",
    ]
    return "\n".join(lines)


def emit_js(grids: dict, meta: dict, places: dict) -> str:
    lines = [
        "/* Generated by tools/convert_maps.py — do not edit by hand. */",
        "(function () {",
        "  window.allGrids = window.allGrids || {};",
        "  window.LT_GRID_META = window.LT_GRID_META || {};",
        "  window.LT = window.LT || {};",
        "  LT.places = LT.places || {};",
        "",
    ]
    for gid, tiles in grids.items():
        ident = js_ident(gid)
        lines.append("  window.allGrids." + ident + " = " + json.dumps(tiles, ensure_ascii=False) + ";")
        m = meta[gid]
        lines.append(
            "  window.LT_GRID_META."
            + ident
            + " = "
            + json.dumps(m, ensure_ascii=False)
            + ";"
        )
        lines.append("")
    for pid, info in sorted(places.items()):
        if pid in IMPASSABLE:
            continue
        # svgFile is converter-internal (source SVG on the 0.4.10 tree).
        # Runtime uses LT.placeVisuals / assets/map/icons, never this path.
        dumped = {k: v for k, v in info.items() if k != "svgFile"}
        lines.append("  LT.places." + js_ident(pid) + " = " + json.dumps(dumped, ensure_ascii=False) + ";")
    lines.append("})();")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    base_colours = parse_base_colours(
        (JAVA_SRC / "com" / "lilithsthrone" / "utils" / "colours" / "BaseColour.java").read_text(
            encoding="utf-8", errors="replace"
        )
    )
    colours = parse_preset_colours(
        (JAVA_SRC / "com" / "lilithsthrone" / "utils" / "colours" / "PresetColour.java").read_text(
            encoding="utf-8", errors="replace"
        ),
        base_colours,
    )
    places = parse_place_types(PLACETYPE.read_text(encoding="utf-8", errors="replace"))
    places.update(parse_global_place_types(PLACETYPE.read_text(encoding="utf-8", errors="replace"), colours))
    print("Place types parsed:", len(places))
    worlds = parse_java_worlds(WORLDTYPE.read_text(encoding="utf-8", errors="replace"))
    worlds.extend(parse_xml_worlds())

    grids = {}
    meta = {}
    warnings = []
    skipped = []
    for world in worlds:
        if not world["png"] or not Path(world["png"]).exists():
            skipped.append(world["id"] + " (missing png)")
            continue
        if not world["colours"]:
            skipped.append(world["id"] + " (no colour table)")
            continue
        tiles, width, height, warn = decode_png(world, places)
        warnings.extend(warn)
        for extra in world.get("xml_places", {}).values():
            places.setdefault(extra["id"], extra)
        grids[world["id"]] = tiles
        meta[world["id"]] = {
            "id": world["id"],
            "name": world["name"],
            "width": width,
            "height": height,
            "tiles": len(tiles),
        }

    apply_travel(grids)
    visuals = write_place_icons(places, colours)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "allGrids.js"
    out.write_text(emit_js(grids, meta, places), encoding="utf-8")
    vis = OUT_DIR / "placeVisuals.js"
    vis.write_text(emit_visuals(visuals), encoding="utf-8")

    print("Wrote", out, "({:.1f} KB)".format(out.stat().st_size / 1024))
    print("Wrote", vis, "({:.1f} KB)".format(vis.stat().st_size / 1024))
    print("Worlds:", len(grids))
    for gid, m in meta.items():
        print("  {:>4}x{:<4}  {:>4} tiles  {}".format(m["width"], m["height"], m["tiles"], gid))
    if skipped:
        print("Skipped:")
        for s in skipped:
            print("  ", s)
    if warnings:
        print("Unknown colours:")
        for w in warnings:
            print("  ", w)


if __name__ == "__main__":
    main()
