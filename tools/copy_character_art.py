"""Copy official clothed portraits into Liliths Throne HTML/assets/characters/.

Reads Lilith's Throne v0.4.10 at rebuild time only. Runtime uses the copies
under assets/characters/<id>/clothed1.png. Does not invent art for unique
NPCs who have no official folder — those are generated separately.
"""
from __future__ import annotations

import shutil
from pathlib import Path

HTML = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parents[2] / "Liliths Throne v0.4.10" / "res" / "images" / "characters"
OUT = HTML / "assets" / "characters"

# HTML npc id -> official folder (first existing clothed*.png wins).
OFFICIAL = {
    "lilaya": "LilayaLight",
    "rose": "Rose",
    "scarlett": "Scarlett",
    "helena": "Helena",
    "candi": "CandiReceptionist",
    "amber": "Amber",
    "nyan": "Nyan",
    "kate": "Kate",
    "bunny": "Bunny",
    "loppy": "Loppy",
    "kalahari": "Kalahari",
    "kruger": "Kruger",
    "angel": "Angel",
    "katherine": "ZaranixMaidKatherine",
    "arthur": "Arthur",
    "brax": "Brax",
    "vicky": "Vicky",
    "ralph": "Ralph",
    "pix": "Pix",
    "kay": "Kay",
    "zaranix": "Zaranix",
    "claire": "Claire",
    "kelly": "ZaranixMaidKelly",
}


def find_clothed(folder: Path) -> Path | None:
    hits = []
    for path in folder.rglob("*"):
        if not path.is_file():
            continue
        name = path.name.lower()
        if not name.endswith(".png"):
            continue
        if "clothed" not in name:
            continue
        if "#preg" in name or "pregnant" in name.lower():
            continue
        hits.append(path)
    if not hits:
        return None

    def rank(p: Path) -> tuple:
        n = p.name.lower()
        prefer = 0 if n.startswith("clothed1") or n == "clothed1.png" else 1
        jam = 0 if p.parent.name.lower() == "jam" else 1
        return (prefer, jam, len(n), str(p))

    hits.sort(key=rank)
    return hits[0]


def main() -> None:
    if not SRC.exists():
        raise SystemExit("Official character art not found: " + str(SRC))
    copied = 0
    missing = []
    for npc_id, folder_name in OFFICIAL.items():
        src_dir = SRC / folder_name
        if not src_dir.exists():
            missing.append(npc_id + " (" + folder_name + ")")
            continue
        src = find_clothed(src_dir)
        if not src:
            missing.append(npc_id + " (no clothed png in " + folder_name + ")")
            continue
        dest_dir = OUT / npc_id
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / "clothed1.png"
        shutil.copy2(src, dest)
        copied += 1
        print("copied", npc_id, "<-", src.relative_to(SRC))
    print("Copied:", copied)
    if missing:
        print("Missing:")
        for item in missing:
            print(" ", item)


if __name__ == "__main__":
    main()
