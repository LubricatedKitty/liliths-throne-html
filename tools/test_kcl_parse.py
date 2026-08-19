import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
spec = importlib.util.spec_from_file_location("kp", os.path.join(ROOT, "KittyPatcher CC v0.1.6.py"))
kp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kp)
kp.handle_output = lambda *a, **k: None

path = os.path.join(ROOT, "mods", "KittyCompanionAutoLoot", "KittyCompanionAutoLoot.mod")
text = open(path, encoding="utf-8").read()
if "~" in text:
    print("FAIL tilde in mod")
    sys.exit(1)
chunks = kp.parse_mod_chunks(text)
kinds = [c["kind"] for c in chunks]
if kinds != ["boot"]:
    print("FAIL chunks", kinds)
    sys.exit(1)
print("OK KittyCompanionAutoLoot.mod parses")
