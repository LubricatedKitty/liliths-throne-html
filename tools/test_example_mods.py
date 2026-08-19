"""Parse the live example .mod files with KittyPatcher (no game writes)."""
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, ROOT)

spec = importlib.util.spec_from_file_location("kittypatcher", os.path.join(ROOT, "KittyPatcher CC v0.1.6.py"))
kp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kp)
kp.handle_output = lambda message, output_type="": None

MODS = [
    os.path.join("mods", "sweetTea", "sweetTea.mod"),
    os.path.join("mods", "examples", "exampleHub.mod"),
    os.path.join("mods", "examples", "ralphTeaTalk.mod"),
    os.path.join("mods", "examples", "miraQuest.mod"),
    os.path.join("mods", "examples", "cellarHatch.mod"),
    os.path.join("mods", "examples", "streetPurse.mod"),
    os.path.join("mods", "examples", "teaShield.mod"),
    os.path.join("mods", "examples", "exampleSexAction.mod"),
]

errors = []


def check(name, cond, detail=""):
    if cond:
        print("OK  " + name)
    else:
        errors.append(name)
        print("FAIL  " + name + ((" — " + detail) if detail else ""))


for rel in MODS:
    path = os.path.join(ROOT, rel)
    check(rel + " exists", os.path.isfile(path), path)
    text = open(path, encoding="utf-8").read()
    check(rel + " has no tilde", "~" not in text)
    chunks = kp.parse_mod_chunks(text)
    kinds = [c["kind"] for c in chunks]
    check(rel + " has boot", "boot" in kinds, repr(kinds))
    check(rel + " has append", "append" in kinds, repr(kinds))
    check(rel + " has no replace", "replace" not in kinds, repr(kinds))
    mod_list = []
    indexes = {}
    kp.proc_replacement(text, mod_list, indexes, os.path.basename(rel), "Replace:", "With:")
    types = [item.get("type") for item in mod_list]
    check(rel + " proc boot", "boot" in types, repr(types))
    check(rel + " proc append", "append" in types, repr(types))
    for item in mod_list:
        if item.get("type") == "boot":
            check(rel + " boot path count", len(item.get("paths") or []) >= 1, repr(item.get("paths")))

if errors:
    print("FAILED: " + ", ".join(errors))
    sys.exit(1)
print("ALL EXAMPLE MOD PARSE TESTS PASSED")
