"""Grid generation for Kitty LT mods.

Port of the Lifebound/index.html tile techniques (better_rooms corridors,
cellular caves, drunkard's walk, continent blobs, prune, symmetry).
Used by KittyGridTool.py and by generate_house / generate_interior when
building layouts for Residences, Oaken Glade, University, Cellar, etc.

Output is a list of walkable tiles in the same shape as window.allGrids:
    { "x": int, "y": int, "location": { "name", "color", "placeType", "passage", "description" } }
Corridors are #bbbbbb to match ~97% of official LT tiles.
"""
from __future__ import annotations

import json
import math
import random
from collections import deque
from copy import deepcopy
from typing import Any

OFFICIAL_TILE = "#bbbbbb"

# Official-style icons already shipped under assets/map/icons/.
ICON = {
    "corridor": "assets/map/icons/GENERIC_EMPTY_TILE.svg",
    "foyer": "assets/map/icons/FELICIA_APARTMENT_ENTRYWAY.svg",
    "sitting": "assets/map/icons/FELICIA_APARTMENT_LIVING_AREA.svg",
    "lounge": "assets/map/icons/DADDY_APARTMENT_LOUNGE.svg",
    "kitchen": "assets/map/icons/FELICIA_APARTMENT_KITCHEN.svg",
    "bedroom": "assets/map/icons/FELICIA_APARTMENT_BEDROOM.svg",
    "bath": "assets/map/icons/FELICIA_APARTMENT_BATHROOM.svg",
    "dining": "assets/map/icons/FELICIA_APARTMENT_DINING_AREA.svg",
    "office": "assets/map/icons/HELENA_APARTMENT_OFFICE.svg",
    "guest": "assets/map/icons/ANGELS_KISS_BEDROOM.svg",
    "slave": "assets/map/icons/GENERIC_HOLDING_CELL.svg",
    "garden": "assets/map/icons/acexp_dungeon_stairs_garden.svg",
    "terrace": "assets/map/icons/HELENA_APARTMENT_HOT_TUB.svg",
    "paddock": "assets/map/icons/DOMINION_EXPRESS_STABLES.svg",
    "empty": "assets/map/icons/GENERIC_EMPTY_TILE.svg",
    "cellar": "assets/map/icons/acexp_dungeon_stairs.svg",
    "racks": "assets/map/icons/HOME_IMPROVEMENTS_SHELVING_STANDARD.svg",
    "hall": "assets/map/icons/CITY_HALL_WAITING_AREA.svg",
    "library": "assets/map/icons/CITY_HALL_ARCHIVES.svg",
    "lecture": "assets/map/icons/GENERIC_MUSEUM.svg",
    "yard": "assets/map/icons/acexp_dungeon_stairs_garden.svg",
    "pantry": "assets/map/icons/HOME_IMPROVEMENTS_SHELVING_PREMIUM.svg",
    "bar": "assets/map/icons/BOUNTY_HUNTER_LODGE_BAR.svg",
    "lab": "assets/map/icons/FORTRESS_LAB.svg",
    "cafeteria": "assets/map/icons/FELICIA_APARTMENT_DINING_AREA.svg",
    "lounge": "assets/map/icons/DADDY_APARTMENT_LOUNGE.svg",
    "dorm": "assets/map/icons/FELICIA_APARTMENT_BEDROOM.svg",
    "bath": "assets/map/icons/FELICIA_APARTMENT_BATHROOM.svg",
    "infirmary": "assets/map/icons/GENERIC_HOLDING_CELL.svg",
    "store": "assets/map/icons/HOME_IMPROVEMENTS_SHELVING_STANDARD.svg",
    "registry": "assets/map/icons/CITY_HALL_INFORMATION_DESK.svg",
    "museum": "assets/map/icons/GENERIC_MUSEUM.svg",
}

STYLES = (
    "corridors",
    "better_rooms",
    "thick_corridors",
    "continent",
    "corridors_rooms",
    "cellular",
    "drunkards",
)


def empty_mask(size: int, fill: int = 0) -> list[list[int]]:
    return [[fill for _ in range(size)] for _ in range(size)]


def generate_dungeon(grid: list[list[int]], x: int = 1, y: int = 1, rng: random.Random | None = None) -> None:
    rng = rng or random
    size = len(grid)
    dirs = [(0, 2), (2, 0), (0, -2), (-2, 0)]
    rng.shuffle(dirs)
    for dx, dy in dirs:
        nx, ny = x + dx, y + dy
        if 0 < nx < size - 1 and 0 < ny < size - 1 and grid[ny][nx] == 0:
            grid[y + dy // 2][x + dx // 2] = 1
            grid[ny][nx] = 1
            generate_dungeon(grid, nx, ny, rng)


def add_rooms(grid: list[list[int]], rng: random.Random | None = None) -> None:
    rng = rng or random
    size = len(grid)
    for _ in range(5):
        rx = rng.randint(1, max(1, size - 5))
        ry = rng.randint(1, max(1, size - 5))
        rw = rng.randint(2, 4)
        rh = rng.randint(2, 4)
        for y in range(ry, min(ry + rh, size - 1)):
            for x in range(rx, min(rx + rw, size - 1)):
                grid[y][x] = 1


def add_better_rooms(grid: list[list[int]], prune: int = 8) -> None:
    size = len(grid)
    if prune <= 4:
        n = 16
    elif prune <= 6:
        n = 12
    elif prune <= 8:
        n = 6
    elif prune <= 10:
        n = 4
    else:
        n = 2
    col = size // 2
    start = size // 2 - n // 2 + 2
    for i in range(n):
        y = start + i
        if 0 <= y < size:
            grid[y][col] = 1


def count_neighbors(grid: list[list[int]], x: int, y: int) -> int:
    size = len(grid)
    count = 0
    for j in range(-1, 2):
        for i in range(-1, 2):
            if i == 0 and j == 0:
                continue
            nx, ny = x + i, y + j
            if nx < 0 or ny < 0 or nx >= size or ny >= size:
                count += 1
            elif grid[ny][nx] == 1:
                count += 1
    return count


def smooth_grid(old: list[list[int]]) -> list[list[int]]:
    size = len(old)
    out = empty_mask(size)
    for y in range(size):
        for x in range(size):
            n = count_neighbors(old, x, y)
            if old[y][x] == 1:
                out[y][x] = 1 if n >= 4 else 0
            else:
                out[y][x] = 1 if n >= 5 else 0
    return out


def generate_cellular(size: int, rng: random.Random | None = None) -> list[list[int]]:
    rng = rng or random
    grid = empty_mask(size)
    for y in range(size):
        for x in range(size):
            if x == 0 or y == 0 or x == size - 1 or y == size - 1:
                grid[y][x] = 0
            else:
                grid[y][x] = 1 if rng.random() < 0.45 else 0
    for _ in range(3):
        grid = smooth_grid(grid)
    return grid


def thicken_corridors(grid: list[list[int]], radius: int = 1) -> None:
    size = len(grid)
    copy = [row[:] for row in grid]
    r2 = radius * radius
    for y in range(size):
        for x in range(size):
            if grid[y][x] != 1:
                continue
            for dy in range(-radius, radius + 1):
                for dx in range(-radius, radius + 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < size and 0 <= ny < size and dx * dx + dy * dy <= r2:
                        copy[ny][nx] = 1
    for y in range(size):
        grid[y] = copy[y]


def generate_drunkards(size: int, rng: random.Random | None = None) -> list[list[int]]:
    rng = rng or random
    grid = empty_mask(size)
    target = size * size * 4 // 10
    x = y = size // 2
    grid[y][x] = 1
    carved = 1
    dirs = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    while carved < target:
        dx, dy = rng.choice(dirs)
        nx, ny = x + dx, y + dy
        if nx < 1 or ny < 1 or nx >= size - 1 or ny >= size - 1:
            continue
        x, y = nx, ny
        if grid[y][x] == 0:
            grid[y][x] = 1
            carved += 1
    return grid


def apply_pruner(grid: list[list[int]], prune: int) -> None:
    size = len(grid)
    if prune <= 0:
        return
    for y in range(size):
        for x in range(size):
            if x < prune or x >= size - prune or y < prune or y >= size - prune:
                grid[y][x] = 0


def apply_symmetry(grid: list[list[int]]) -> None:
    size = len(grid)
    for y in range(size):
        for x in range(size // 2):
            grid[y][size - x - 1] = grid[y][x]


def generate_continent(size: int, rng: random.Random | None = None) -> list[list[int]]:
    rng = rng or random
    grid = empty_mask(size)

    def noise(x: int, y: int) -> float:
        n = math.sin(x * 127.1 + y * 311.7) * 43758.5453123
        return n - math.floor(n)

    scale = 0.08
    threshold = 0.52
    for y in range(size):
        for x in range(size):
            grid[y][x] = 1 if noise(int(x * scale * 100), int(y * scale * 100)) > threshold else 0
    center = size / 2
    for y in range(size):
        for x in range(size):
            dx = (x - center) / center
            dy = (y - center) / center
            if math.sqrt(dx * dx + dy * dy) > 0.75:
                grid[y][x] = 0
    for _ in range(4):
        grid = smooth_grid(grid)
    return grid


def resolve_seed(seed: int | None) -> int:
    if seed is None or seed == 0:
        return random.randrange(1, 1_000_000_000)
    return int(seed)


def generate_mask(
    size: int = 11,
    style: str = "better_rooms",
    prune: int = 2,
    symmetrical: bool = True,
    center_line: bool = True,
    seed: int | None = None,
) -> tuple[list[list[int]], int]:
    used = resolve_seed(seed)
    rng = random.Random(used)
    if style == "cellular":
        grid = generate_cellular(size, rng)
    elif style == "drunkards":
        grid = generate_drunkards(size, rng)
    elif style == "continent":
        grid = generate_continent(size, rng)
    else:
        grid = empty_mask(size)
        generate_dungeon(grid, 1, 1, rng)
        if style == "corridors_rooms":
            add_rooms(grid, rng)
        if style == "thick_corridors":
            thicken_corridors(grid, 2)
        if style == "better_rooms":
            add_better_rooms(grid, prune)
    if center_line and style != "better_rooms":
        add_better_rooms(grid, prune)
    if symmetrical:
        apply_symmetry(grid)
    apply_pruner(grid, prune)
    # Future gens only. Do not re-run this against shipped annex/house grids.
    ensure_grid_connectivity(grid, symmetrical=symmetrical)
    return grid, used


def ensure_grid_connectivity(mask: list[list[int]], symmetrical: bool = False) -> list[list[int]]:
    """4-dir BFS + L-corridor carve so walkable cells form one component.

    Port of Lifebound ensureGridConnectivity. Call from generate_mask for
    future grids. Do not regenerate already-shipped annex or house layouts.
    Isolated leftovers after carving are dropped so nothing is stranded.
    """
    if not mask:
        return mask
    rows = len(mask)
    cols = len(mask[0]) if rows else 0
    if rows == 0 or cols == 0:
        return mask

    def in_bounds(r: int, c: int) -> bool:
        return 0 <= r < rows and 0 <= c < cols

    def neighbors(r: int, c: int) -> tuple[tuple[int, int], ...]:
        return ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1))

    visited = [[False] * cols for _ in range(rows)]
    components: list[list[tuple[int, int]]] = []
    for r in range(rows):
        for c in range(cols):
            if visited[r][c]:
                continue
            if not mask[r][c]:
                visited[r][c] = True
                continue
            comp: list[tuple[int, int]] = []
            queue: deque[tuple[int, int]] = deque([(r, c)])
            visited[r][c] = True
            while queue:
                cr, cc = queue.popleft()
                comp.append((cc, cr))
                for nr, nc in neighbors(cr, cc):
                    if not in_bounds(nr, nc) or visited[nr][nc]:
                        continue
                    visited[nr][nc] = True
                    if mask[nr][nc]:
                        queue.append((nr, nc))
            if comp:
                components.append(comp)

    if len(components) <= 1:
        return mask

    components.sort(key=len, reverse=True)
    main = components[0]
    main_set = set(main)

    def mark(x: int, y: int) -> None:
        if in_bounds(y, x):
            mask[y][x] = 1
        if symmetrical:
            sx = cols - 1 - x
            if in_bounds(y, sx):
                mask[y][sx] = 1

    for comp in components[1:]:
        best_dist: int | None = None
        best_main: tuple[int, int] | None = None
        best_comp: tuple[int, int] | None = None
        for cm in comp:
            for m in main:
                d = abs(cm[0] - m[0]) + abs(cm[1] - m[1])
                if best_dist is None or d < best_dist:
                    best_dist = d
                    best_main = m
                    best_comp = cm
        if not best_main or not best_comp:
            main.extend(comp)
            main_set.update(comp)
            continue
        cx, cy = best_comp
        tx, ty = best_main
        while cx != tx:
            mark(cx, cy)
            main_set.add((cx, cy))
            cx += 1 if cx < tx else -1
        while cy != ty:
            mark(cx, cy)
            main_set.add((cx, cy))
            cy += 1 if cy < ty else -1
        mark(tx, ty)
        main_set.add((tx, ty))
        for p in comp:
            if p not in main_set:
                main.append(p)
                main_set.add(p)

    start = main[0]
    seen = [[False] * cols for _ in range(rows)]
    queue = deque([(start[1], start[0])])
    seen[start[1]][start[0]] = True
    while queue:
        rr, cc = queue.popleft()
        for nr, nc in neighbors(rr, cc):
            if not in_bounds(nr, nc) or seen[nr][nc]:
                continue
            if mask[nr][nc]:
                seen[nr][nc] = True
                queue.append((nr, nc))
    for r in range(rows):
        for c in range(cols):
            if mask[r][c] and not seen[r][c]:
                mask[r][c] = 0
    return mask


def mask_to_tiles(mask: list[list[int]], name: str = "Corridor", place: str = "KITTY_CORRIDOR") -> list[dict[str, Any]]:
    tiles = []
    for y, row in enumerate(mask):
        for x, val in enumerate(row):
            if not val:
                continue
            tiles.append(make_tile(x, y, name, place, "corridor", "A connecting passage."))
    return tiles


def make_tile(
    x: int,
    y: int,
    name: str,
    place: str,
    role: str = "corridor",
    description: str = "",
    exit_to: dict[str, Any] | None = None,
) -> dict[str, Any]:
    tile: dict[str, Any] = {
        "x": x,
        "y": y,
        "location": {
            "name": name,
            "color": OFFICIAL_TILE,
            "placeType": place,
            "passage": "place." + place,
            "description": description,
            "icon": {"src": ICON.get(role, ICON["corridor"])},
        },
    }
    if exit_to:
        tile["travelConfig"] = {
            "label": exit_to.get("label", "Exit"),
            "nextGridName": exit_to["world"],
            "nextLocationName": exit_to.get("name", "outside"),
            "coords": {"x": exit_to["x"], "y": exit_to["y"]},
        }
    return tile


def generate_house(
    width: int,
    height: int,
    rooms: list[dict[str, Any]],
    exit_to: dict[str, Any] | None = None,
    seed: int | None = 0,
    prune: int = 2,
) -> tuple[list[dict[str, Any]], int]:
    """Better-rooms house: prune 2, symmetry, center line, random seed if 0."""
    size = max(width, height, 5)
    attempts = 0
    used = resolve_seed(seed)
    walk: list[tuple[int, int]] = []
    while attempts < 12:
        mask, used = generate_mask(
            size=size,
            style="better_rooms",
            prune=prune,
            symmetrical=True,
            center_line=True,
            seed=used if attempts == 0 and seed not in (None, 0) else 0,
        )
        walk = [(x, y) for y in range(size) for x in range(size) if mask[y][x]]
        if len(walk) >= max(len(rooms), 3):
            break
        attempts += 1
        used = resolve_seed(0)
    if not walk:
        cx, cy = size // 2, size // 2
        mask = empty_mask(size)
        for y in range(1, size - 1):
            mask[y][cx] = 1
        for x in range(1, size - 1):
            mask[cy][x] = 1
        walk = [(x, y) for y in range(size) for x in range(size) if mask[y][x]]
    rng = random.Random(used)

    foyer_role = next((r for r in rooms if r.get("role") == "foyer"), rooms[0] if rooms else None)
    south = [p for p in walk if p[1] == max(p2[1] for p2 in walk)]
    foyer_xy = min(south, key=lambda p: abs(p[0] - size // 2)) if south else walk[0]

    remaining = [p for p in walk if p != foyer_xy]
    rng.shuffle(remaining)
    assigned: dict[tuple[int, int], dict[str, Any]] = {}
    if foyer_role:
        assigned[foyer_xy] = foyer_role
    for room in rooms:
        if room is foyer_role:
            continue
        if not remaining:
            break
        assigned[remaining.pop(0)] = room

    tiles = []
    for x, y in walk:
        spec = assigned.get((x, y))
        if spec:
            tile = make_tile(
                x,
                y,
                spec.get("name", "Room"),
                spec.get("place") or spec.get("placeType") or "KITTY_RES_SITTING",
                spec.get("role", "sitting"),
                spec.get("description", ""),
                exit_to if spec.get("role") == "foyer" else None,
            )
        else:
            tile = make_tile(x, y, "Corridor", spec_place(rooms, "KITTY_RES_SITTING"), "corridor", "A connecting corridor.")
        tiles.append(tile)
    return tiles, used


def spec_place(rooms: list[dict[str, Any]], fallback: str) -> str:
    for r in rooms:
        if r.get("role") == "sitting":
            return r.get("place") or r.get("placeType") or fallback
    return fallback


def tiles_js(name: str, tiles: list[dict[str, Any]]) -> str:
    return "window.allGrids." + name + " = " + json.dumps(tiles, indent=2) + ";\n"


UNIVERSITY_ROOMS = [
    {"name": "Foyer", "place": "KITTY_ANNEX_FOYER", "role": "foyer", "description": "The main entrance. A porter desk, a slate of lecture times, and doors into the halls."},
    {"name": "Registry", "place": "KITTY_ANNEX_REGISTRY", "role": "registry", "description": "Enrolment desks and pass slates. Staff take payment here."},
    {"name": "Dean's office", "place": "KITTY_ANNEX_OFFICE", "role": "office", "description": "Merrin's office. Enrolment records and a map of Thinis on the wall."},
    {"name": "Library", "place": "KITTY_ANNEX_LIBRARY", "role": "library", "description": "Shelves of primers. Tables for revision. No spell tomes."},
    {"name": "Library stacks", "place": "KITTY_ANNEX_LIBRARY", "role": "library", "description": "Further shelves. Quiet. A few students copy notes."},
    {"name": "Fire lecture hall", "place": "KITTY_ANNEX_LECTURE_FIRE", "role": "lecture", "description": "Stepped benches. A fire-warded board. Pyra teaches here."},
    {"name": "Water lecture hall", "place": "KITTY_ANNEX_LECTURE_WATER", "role": "lecture", "description": "Stepped benches. A basin at the front. Nerei teaches here."},
    {"name": "Earth lecture hall", "place": "KITTY_ANNEX_LECTURE_EARTH", "role": "lecture", "description": "Stepped benches. Stone weights along the wall. Tarran teaches here."},
    {"name": "Air lecture hall", "place": "KITTY_ANNEX_LECTURE_AIR", "role": "lecture", "description": "Stepped benches. Open vents in the ceiling. Sylas teaches here."},
    {"name": "Arcane lecture hall", "place": "KITTY_ANNEX_LECTURE", "role": "lecture", "description": "The largest hall. Calder teaches general arcane work here."},
    {"name": "Practice lab", "place": "KITTY_ANNEX_LAB", "role": "lab", "description": "Warded benches for supervised casting practice."},
    {"name": "Second lab", "place": "KITTY_ANNEX_LAB", "role": "lab", "description": "A second practice room. Scorch marks on the stone."},
    {"name": "Yard", "place": "KITTY_ANNEX_YARD", "role": "yard", "description": "An open yard used for outdoor drills between lectures."},
    {"name": "Courtyard", "place": "KITTY_ANNEX_YARD", "role": "yard", "description": "Benches and a pump. Students wait here between hours."},
    {"name": "Cafeteria", "place": "KITTY_ANNEX_CAFETERIA", "role": "cafeteria", "description": "Long tables. A serving hatch. Cheap meals during work hours."},
    {"name": "Kitchen hatch", "place": "KITTY_ANNEX_CAFETERIA", "role": "cafeteria", "description": "The serving side of the cafeteria."},
    {"name": "Student lounge", "place": "KITTY_ANNEX_LOUNGE", "role": "lounge", "description": "Chairs, a board of notices, and a kettle that is usually empty."},
    {"name": "Dorm hall", "place": "KITTY_ANNEX_DORM", "role": "dorm", "description": "A corridor of student rooms."},
    {"name": "Dorm room", "place": "KITTY_ANNEX_DORM", "role": "dorm", "description": "Two beds, two desks, one window."},
    {"name": "Second dorm", "place": "KITTY_ANNEX_DORM", "role": "dorm", "description": "Another student room. Clothes on the chairs."},
    {"name": "Washroom", "place": "KITTY_ANNEX_BATH", "role": "bath", "description": "Sinks, stalls, and a notice about water hours."},
    {"name": "Infirmary", "place": "KITTY_ANNEX_INFIRMARY", "role": "infirmary", "description": "Three cots and a locked cabinet of salves."},
    {"name": "Store", "place": "KITTY_ANNEX_STORE", "role": "store", "description": "Chalk, slates, and spare chairs."},
]


def generate_university(
    size: int = 21,
    prune: int = 2,
    seed: int | None = 0,
    exit_to: dict[str, Any] | None = None,
) -> tuple[list[dict[str, Any]], int]:
    mask, used = generate_mask(
        size=size,
        style="better_rooms",
        prune=prune,
        symmetrical=True,
        center_line=True,
        seed=seed,
    )
    walk = [(x, y) for y in range(size) for x in range(size) if mask[y][x]]
    if not walk:
        raise RuntimeError("University generator produced no walkable tiles.")
    south = [p for p in walk if p[1] == max(p2[1] for p2 in walk)]
    foyer_xy = min(south, key=lambda p: abs(p[0] - size // 2))
    remaining = [p for p in walk if p != foyer_xy]
    remaining.sort(key=lambda p: (abs(p[0] - size // 2) + abs(p[1] - size // 2)))
    assigned: dict[tuple[int, int], dict[str, Any]] = {foyer_xy: UNIVERSITY_ROOMS[0]}
    idx = 0
    for room in UNIVERSITY_ROOMS[1:]:
        if idx >= len(remaining):
            break
        assigned[remaining[idx]] = room
        idx += 1
    tiles = []
    for x, y in walk:
        spec = assigned.get((x, y))
        if spec:
            tile = make_tile(
                x,
                y,
                spec["name"],
                spec["place"],
                spec.get("role", "hall"),
                spec.get("description", ""),
                exit_to if spec.get("role") == "foyer" else None,
            )
        else:
            tile = make_tile(x, y, "Hall", "KITTY_ANNEX_HALL", "hall", "A connecting hall.")
        tiles.append(tile)
    return tiles, used


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser(description="Generate an LT-shaped grid mask or house.")
    p.add_argument("--size", type=int, default=11)
    p.add_argument("--style", default="better_rooms", choices=STYLES)
    p.add_argument("--prune", type=int, default=2)
    p.add_argument("--seed", type=int, default=0, help="0 randomizes")
    p.add_argument("--no-symmetry", action="store_true")
    p.add_argument("--no-center-line", action="store_true")
    p.add_argument("--json", action="store_true")
    p.add_argument("--university", action="store_true")
    args = p.parse_args()
    if args.university:
        tiles, used = generate_university(
            size=args.size,
            prune=args.prune,
            seed=args.seed,
            exit_to={"world": "DOMINION", "name": "the boulevard", "x": 10, "y": 8, "label": "Exit"},
        )
        print(json.dumps({"seed": used, "tiles": tiles}, indent=2))
    else:
        mask, used = generate_mask(
            args.size,
            args.style,
            args.prune,
            symmetrical=not args.no_symmetry,
            center_line=not args.no_center_line,
            seed=args.seed,
        )
        if args.json:
            print(json.dumps({"seed": used, "tiles": mask_to_tiles(mask)}, indent=2))
        else:
            print("seed", used)
            for row in mask:
                print("".join("#" if c else "." for c in row))
