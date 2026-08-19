"""Unit tests for Depends On: parse, resolve, missing, and apply order."""
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, ROOT)

errors = []


def check(name, cond, detail=""):
    if cond:
        print("OK  " + name)
    else:
        errors.append(name)
        print("FAIL  " + name + ((" — " + detail) if detail else ""))


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


loader = load(os.path.join(ROOT, "KittyLoader.py"), "kittyloader_deps")
patcher = load(os.path.join(ROOT, "KittyPatcher CC v0.1.6.py"), "kittypatcher_deps")
patcher.handle_output = lambda *a, **k: None

text = """Name: Pets and Animals — Bestiality
Author: Nahlia
Depends On: KittyPetsAndAnimals.mod
Category: Sex

Add Boot:
"mods/NahliaPetsAndAnimalsBeastiality/NahliaPetsAndAnimalsBeastiality.js"
"""
meta_l = loader.parse_mod_meta(text)
meta_p = patcher.parse_mod_meta(text)
check("loader parses Depends On filename", meta_l["depends"] == ["KittyPetsAndAnimals.mod"], repr(meta_l["depends"]))
check("patcher parses the same", meta_p["depends"] == meta_l["depends"], repr(meta_p["depends"]))
check("name still parsed", meta_l["name"] == "Pets and Animals — Bestiality")

multi = loader.parse_mod_meta(
    'Name: Stack\nDepends On: "Pets and Animals", OtherMod.mod\nDepends: third\nAdd Boot:\n"a.js"\n'
)
check(
    "quoted CSV plus second Depends line",
    multi["depends"] == ["Pets and Animals", "OtherMod.mod", "third"],
    repr(multi["depends"]),
)

nahlia_path = os.path.join(ROOT, "mods", "NahliaPetsAndAnimalsBeastiality", "NahliaPetsAndAnimalsBeastiality.mod")
live = loader.parse_mod_meta(open(nahlia_path, encoding="utf-8").read())
check("live Nahlia .mod lists KittyPetsAndAnimals.mod", live["depends"] == ["KittyPetsAndAnimals.mod"], repr(live["depends"]))

pets = {"file": "KittyPetsAndAnimals.mod", "name": "Pets and Animals"}
nahlia = {"file": "NahliaPetsAndAnimalsBeastiality.mod", "name": "Pets and Animals — Bestiality", "depends": ["KittyPetsAndAnimals.mod"]}
loot = {"file": "KittyCompanionAutoLoot.mod", "name": "Companion Auto-Loot"}
mods = [pets, nahlia, loot]

check("resolve by filename", loader.resolve_dep("KittyPetsAndAnimals.mod", mods) is pets)
check("resolve by stem", loader.resolve_dep("KittyPetsAndAnimals", mods) is pets)
check("resolve by Name", loader.resolve_dep("Pets and Animals", mods) is pets)
check("resolve unknown is None", loader.resolve_dep("Nope.mod", mods) is None)

off = loader.missing_depends(nahlia, ["NahliaPetsAndAnimalsBeastiality.mod"], mods)
check("disabled dep is reported", len(off) == 1 and off[0]["reason"] == "disabled", repr(off))
gone = loader.missing_depends({"file": "x.mod", "depends": ["Ghost.mod"]}, [], mods)
check("missing dep is reported", len(gone) == 1 and gone[0]["reason"] == "missing", repr(gone))
ok = loader.missing_depends(nahlia, ["KittyPetsAndAnimals.mod", "NahliaPetsAndAnimalsBeastiality.mod"], mods)
check("satisfied dep is empty", ok == [], repr(ok))
check("no-depends mod is clean", loader.missing_depends(loot, [], mods) == [])

order = loader.sort_enabled_by_depends(
    ["NahliaPetsAndAnimalsBeastiality.mod", "KittyPetsAndAnimals.mod"],
    mods,
)
check(
    "apply order puts Pets before Nahlia",
    order == ["KittyPetsAndAnimals.mod", "NahliaPetsAndAnimalsBeastiality.mod"],
    repr(order),
)
stable = loader.sort_enabled_by_depends(
    ["KittyCompanionAutoLoot.mod", "KittyPetsAndAnimals.mod"],
    mods,
)
check(
    "unrelated enabled order stays",
    stable == ["KittyCompanionAutoLoot.mod", "KittyPetsAndAnimals.mod"],
    repr(stable),
)

if errors:
    print(len(errors), "failed")
    sys.exit(1)
print("ALL DEPENDS TESTS PASSED")
