# Generate Residences Expansion interiors via KittyGridPatcher.
# Settings from Debug 09: better_rooms, prune 2, random seed, symmetry, center line.
# Small 11, normal 13, big 15, mansion 17. Same named rooms, new walkables.

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from KittyGridPatcher import generate_house  # noqa: E402

ROLE_PLACE = {
    "foyer": "KITTY_RES_FOYER",
    "sitting": "KITTY_RES_SITTING",
    "kitchen": "KITTY_RES_KITCHEN",
    "bedroom": "KITTY_RES_BEDROOM",
    "bath": "KITTY_RES_BATH",
    "garden": "KITTY_RES_GARDEN",
    "terrace": "KITTY_RES_TERRACE",
    "paddock": "KITTY_RES_PADDOCK",
    "dining": "KITTY_RES_DINING",
    "slave": "KITTY_RES_SLAVE",
    "guest": "KITTY_RES_GUEST",
    "empty": "KITTY_RES_EMPTY",
    "hall": "KITTY_RES_SITTING",
}

HOUSES = [
    {
        "id": "finchwalk",
        "grid": "KITTY_RES_FINCHWALK",
        "size": 11,
        "door": {"world": "DOMINION", "name": "Finch Walk", "x": 3, "y": 2},
        "rooms": [
            {"name": "Landing", "role": "foyer", "upgrade": "", "description": "A narrow landing with a row of brass letterboxes. One box has been freshly labelled with your name."},
            {"name": "Sitting room", "role": "sitting", "upgrade": "", "description": "One window looks down on Finch Walk. The sofa is new; the wallpaper is not."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A galley kitchen. The range is arcane, the sink is chipped, and the cupboard still has a previous tenant's tea."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "A bedroom just large enough for a double bed and a wardrobe. Cart wheels pass below at dawn."},
            {"name": "Washroom", "role": "bath", "upgrade": "", "description": "A tiled washroom with a copper boiler that complains when you ask too much of it."},
            {"name": "Servant's closet", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A converted closet with a narrow bed. Official slave quarters, just smaller."},
        ],
    },
    {
        "id": "highspire",
        "grid": "KITTY_RES_HIGHSPIRE",
        "size": 15,
        "door": {"world": "DOMINION", "name": "Highspire", "x": 16, "y": 0},
        "rooms": [
            {"name": "Lift lobby", "role": "foyer", "upgrade": "", "description": "A private lift opens onto pale marble. The porter downstairs will not greet you if you arrive muddy."},
            {"name": "Lounge", "role": "sitting", "upgrade": "", "description": "Low furniture and a wall of glass. Demon Home at night is pink light and distant music."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A kitchen meant for someone who hosts, not cooks. Every surface is white."},
            {"name": "Master bedroom", "role": "bedroom", "upgrade": "", "description": "The bed faces the terrace doors. Arcane shutters dim the tower-light if you ask them to."},
            {"name": "Terrace", "role": "terrace", "upgrade": "", "description": "Wind off the rooftops. You can see Lilith's tower from here. Everyone in Demon Home can."},
            {"name": "Terrace edge", "role": "terrace", "upgrade": "", "description": "A stone balustrade and a pair of chairs nobody uses when it rains."},
            {"name": "Staff room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A proper staff bedroom, not a cupboard. Still official slave quarters."},
            {"name": "Second staff room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A matching staff room across the hall."},
        ],
    },
    {
        "id": "ashcourt",
        "grid": "KITTY_RES_ASHCOURT",
        "size": 13,
        "door": {"world": "DOMINION", "name": "Ashcourt House", "x": 13, "y": 3},
        "rooms": [
            {"name": "Hall", "role": "foyer", "upgrade": "", "description": "Black-and-white tiles and a coat stand. The street door still has its original knocker."},
            {"name": "Sitting room", "role": "sitting", "upgrade": "", "description": "A bay window onto the street. Heavy curtains, a fireplace that actually works."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A proper kitchen with a pantry door. Someone baked here for a long time before you."},
            {"name": "Front garden", "role": "garden", "upgrade": "", "description": "A strip of box hedge and two rose bushes. Rose would approve of the soil, not the pruning."},
            {"name": "Side path", "role": "garden", "upgrade": "", "description": "Flagstones down the side of the house to the kitchen door."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "The larger upstairs bedroom. The ceiling slopes. Carts are quieter here than on Finch Walk."},
            {"name": "Guest room", "role": "guest", "upgrade": "GUEST_ROOM", "description": "A spare bedroom already made up. Official guest quarters."},
            {"name": "Servant's room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A back bedroom over the kitchen. Warm in winter."},
            {"name": "Washroom", "role": "bath", "upgrade": "", "description": "A claw-foot bath and a window that fogs immediately."},
            {"name": "Attic room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "An attic room with a dormer. Official slave quarters under the eaves."},
            {"name": "Spare room", "role": "empty", "upgrade": "", "description": "An empty room with dust sheets. You could have it converted."},
        ],
    },
    {
        "id": "blackthorn",
        "grid": "KITTY_RES_BLACKTHORN",
        "size": 17,
        "door": {"world": "DOMINION", "name": "Blackthorn Manor", "x": 20, "y": 1},
        "rooms": [
            {"name": "Entrance hall", "role": "foyer", "upgrade": "", "description": "A double-height hall. Not Lilaya's chandelier, but it tries. The portrait over the stairs is of someone you do not know."},
            {"name": "Drawing room", "role": "sitting", "upgrade": "", "description": "Silk chairs and a piano nobody has tuned. Demon Home guests expect to be seen here."},
            {"name": "Dining room", "role": "dining", "upgrade": "", "description": "A table for twelve. You will not fill it. The windows look onto the hedge."},
            {"name": "Inner hall", "role": "sitting", "upgrade": "", "description": "A quieter hall linking the kitchens to the family rooms."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A kitchen built for staff. Copper, stone, and a servants' bell-board that still has names on it."},
            {"name": "Study", "role": "sitting", "upgrade": "", "description": "A study with a locked cabinet. Not an occupancy ledger office; just a desk and a map of Dominion."},
            {"name": "Front lawn", "role": "garden", "upgrade": "", "description": "A short lawn behind the blackthorn. Demon Home does not do long gardens."},
            {"name": "Courtyard", "role": "garden", "upgrade": "", "description": "A paved courtyard with a dry fountain. Someone meant to restore it."},
            {"name": "Hedge walk", "role": "garden", "upgrade": "", "description": "The blackthorn is older than the house. It scratches anyone who walks too close."},
            {"name": "Master bedroom", "role": "bedroom", "upgrade": "", "description": "The principal bedroom. Heavy drapes, a dressing room alcove, and quiet."},
            {"name": "Guest suite", "role": "guest", "upgrade": "GUEST_ROOM", "description": "A guest suite with its own washstand."},
            {"name": "Second guest room", "role": "guest", "upgrade": "GUEST_ROOM", "description": "A smaller guest room overlooking the hedge."},
            {"name": "Staff room east", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "Staff quarters on the lower passage."},
            {"name": "Staff room mid", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A second staff room. Official slave quarters."},
            {"name": "Staff room west", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A third staff room at the end of the passage."},
            {"name": "Spare chamber", "role": "empty", "upgrade": "", "description": "An unused chamber. Convert it if you have a slaver's licence."},
        ],
    },
    {
        "id": "thatchend",
        "grid": "KITTY_RES_THATCHEND",
        "size": 11,
        "door": {"world": "innoxia_fields_elis_town", "name": "Thatchend", "x": 0, "y": 0},
        "rooms": [
            {"name": "Porch", "role": "foyer", "upgrade": "", "description": "A low porch with muddy boots already waiting, though you have only just arrived."},
            {"name": "Parlour", "role": "sitting", "upgrade": "", "description": "A parlour with a hearth and a window onto the pasture. The beams are darker than the walls."},
            {"name": "Vegetable patch", "role": "garden", "upgrade": "", "description": "A vegetable patch someone kept up until last autumn. The soil is good Foloi dirt."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "A bedroom under the thatch. Rain on the roof is loud when it comes."},
            {"name": "Lean-to", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A lean-to room off the kitchen end. Official slave quarters with a straw mattress swapped for a proper bed."},
        ],
    },
    {
        "id": "willowmere",
        "grid": "KITTY_RES_WILLOWMERE",
        "size": 13,
        "door": {"world": "innoxia_fields_elis_town", "name": "Willowmere", "x": 6, "y": 0},
        "rooms": [
            {"name": "Hall", "role": "foyer", "upgrade": "", "description": "A flagged hall with hooks for coats and a scythe nobody claims."},
            {"name": "Parlour", "role": "sitting", "upgrade": "", "description": "Willow-pattern plates and a settle by the fire. Elis talk comes in with the mud."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A kitchen that still feeds harvest crews in the stories the neighbours tell."},
            {"name": "Orchard edge", "role": "garden", "upgrade": "", "description": "A few apple trees and a willow that drinks from the ditch."},
            {"name": "Yard", "role": "garden", "upgrade": "", "description": "A yard of packed earth and a pump that works if you prime it."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "The main bedroom. Linen smells of lavender someone left in the chest."},
            {"name": "Guest room", "role": "guest", "upgrade": "GUEST_ROOM", "description": "A guest room with a view of the orchard."},
            {"name": "Dairy room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "The old dairy, converted to official slave quarters. Cool even in summer."},
            {"name": "Wash-house", "role": "bath", "upgrade": "", "description": "A wash-house with a tub you fill from the pump."},
            {"name": "Loft room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A loft room up a ladder. Official slave quarters under the thatch."},
            {"name": "Store", "role": "empty", "upgrade": "", "description": "A store-room that could be converted."},
        ],
    },
    {
        "id": "westmead",
        "grid": "KITTY_RES_WESTMEAD",
        "size": 11,
        "door": {"world": "WORLD_MAP", "name": "Westmead", "x": 7, "y": 28},
        "rooms": [
            {"name": "Door", "role": "foyer", "upgrade": "", "description": "A plank door that swells in the wet. The Foloi wind finds every gap."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "One room that is kitchen and parlour together. A pot hangs over the fire on a hook that has been there a long time."},
            {"name": "Paddock gate", "role": "paddock", "upgrade": "", "description": "A paddock of rough grass. Official Foloi farmland, not a Demon Home lawn."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "A bedroom with shutters that rattle. You sleep through the wind after the first night."},
            {"name": "Byre room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "The old byre, cleaned out and fitted as official slave quarters."},
        ],
    },
    {
        "id": "eastmere",
        "grid": "KITTY_RES_EASTMERE",
        "size": 13,
        "door": {"world": "WORLD_MAP", "name": "Eastmere", "x": 38, "y": 31},
        "rooms": [
            {"name": "Threshing doors", "role": "foyer", "upgrade": "", "description": "The old threshing doors are the front now. Light comes in in a wide bar."},
            {"name": "Hall", "role": "sitting", "upgrade": "", "description": "The barn's nave made into a hall. Beams the size of cart-axles."},
            {"name": "Kitchen", "role": "kitchen", "upgrade": "", "description": "A kitchen built into the old tack room. It still smells faintly of leather."},
            {"name": "East paddock", "role": "paddock", "upgrade": "", "description": "Open Foloi grass. A horse could stand here without noticing the house."},
            {"name": "Yard", "role": "paddock", "upgrade": "", "description": "A yard of beaten earth between the barn and the paddock rail."},
            {"name": "Bedroom", "role": "bedroom", "upgrade": "", "description": "A bedroom lofted at one end of the barn. The wind is louder than the boards."},
            {"name": "Guest loft", "role": "guest", "upgrade": "GUEST_ROOM", "description": "A guest loft with a rail instead of a wall."},
            {"name": "Stable room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "A stall rebuilt as official slave quarters. The door is still split."},
            {"name": "Wash trough", "role": "bath", "upgrade": "", "description": "A wash room that was a trough. The pump is outside."},
            {"name": "Hayloft room", "role": "slave", "upgrade": "SLAVE_ROOM", "description": "The hayloft, floored and given a bed."},
            {"name": "Granary", "role": "empty", "upgrade": "", "description": "An empty granary. Convert it if you want another room."},
        ],
    },
]


def prepare_rooms(house: dict) -> list[dict]:
    out = []
    for room in house["rooms"]:
        item = dict(room)
        item["place"] = ROLE_PLACE.get(room["role"], "KITTY_RES_SITTING")
        out.append(item)
    return out


def main() -> None:
    layouts = {}
    for house in HOUSES:
        rooms = prepare_rooms(house)
        tiles, seed = generate_house(
            house["size"],
            house["size"],
            rooms,
            exit_to={
                "world": house["door"]["world"],
                "name": house["door"]["name"],
                "x": house["door"]["x"],
                "y": house["door"]["y"],
                "label": "Exit",
            },
            seed=0,
            prune=2,
        )
        named = []
        for tile in tiles:
            loc = tile["location"]
            if loc["name"] == "Corridor":
                continue
            match = next((r for r in house["rooms"] if r["name"] == loc["name"]), None)
            named.append(
                {
                    "name": loc["name"],
                    "role": match["role"] if match else "sitting",
                    "upgrade": match["upgrade"] if match else "",
                    "description": loc.get("description") or (match["description"] if match else ""),
                    "x": tile["x"],
                    "y": tile["y"],
                }
            )
        names = {r["name"] for r in house["rooms"]}
        got = {r["name"] for r in named}
        missing = names - got
        if missing:
            raise SystemExit(f"{house['id']} missing rooms: {sorted(missing)} (walkables={len(tiles)} seed={seed})")
        layouts[house["id"]] = {
            "size": house["size"],
            "seed": seed,
            "grid": house["grid"],
            "rooms": named,
            "tiles": tiles,
        }
        print(f"{house['id']:12} size={house['size']:2} seed={seed} tiles={len(tiles):3} rooms={len(named)}")

    out_json = ROOT / "mods" / "KittyResidencesExpansion" / "residenceLayouts.json"
    out_js = ROOT / "mods" / "KittyResidencesExpansion" / "residenceLayouts.js"
    payload = json.dumps(layouts, indent=2)
    out_json.write_text(payload, encoding="utf-8")
    out_js.write_text(
        "// Generated by tools/gen_residence_grids.py via KittyGridPatcher.\n"
        "// Better Rooms, prune 2, random seed, symmetry, center line.\n"
        "(function () {\n"
        "  window.KITTY_RES_LAYOUTS = " + payload + ";\n"
        "})();\n",
        encoding="utf-8",
    )
    print("wrote", out_json)
    print("wrote", out_js)


if __name__ == "__main__":
    main()
