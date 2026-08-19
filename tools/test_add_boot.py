"""Unit test for KittyPatcher Add Boot (does not write game files)."""
import importlib.util
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, ROOT)

PATCHER_PATH = os.path.join(ROOT, "KittyPatcher CC v0.1.6.py")
spec = importlib.util.spec_from_file_location("kittypatcher", PATCHER_PATH)
kp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kp)

# Keep tests from writing logs if a path is rejected.
kp.handle_output = lambda message, output_type="": None

BOOT = os.path.join(ROOT, "js", "boot.js")
with open(BOOT, "r", encoding="utf-8") as handle:
    boot = handle.read()

errors = []


def check(name, cond, detail=""):
    if cond:
        print("OK  " + name)
    else:
        errors.append(name)
        print("FAIL  " + name + ((" — " + detail) if detail else ""))


# parse_boot_script_lines
paths = kp.parse_boot_script_lines(
    '    "mods/exampleMod/exampleMod.js"\n'
    '    "mods/exampleMod/exampleMod1.js"\n'
)
check(
    "parse quoted paths",
    paths == [
        "mods/exampleMod/exampleMod.js",
        "mods/exampleMod/exampleMod1.js",
    ],
    repr(paths),
)

bare = kp.parse_boot_script_lines(
    "mods/exampleMod/exampleMod.js,\nmods/exampleMod/exampleMod1.js\n"
)
check("parse bare paths + trailing commas", bare == paths, repr(bare))

dupes = kp.parse_boot_script_lines(
    '"mods/a.js"\n"mods/a.js"\n"mods/b.js"\n'
)
check("dedupe in body", dupes == ["mods/a.js", "mods/b.js"], repr(dupes))

unsafe = kp.parse_boot_script_lines("../escape.js\n/abs.js\nmods/ok.js\n")
check("reject .. and absolute", unsafe == ["mods/ok.js"], repr(unsafe))

# parse_mod_chunks
mod_text = """Name: Example
Author: You

    Add Boot:
    "mods/exampleMod/exampleMod.js"
    "mods/exampleMod/exampleMod1.js"
"""
chunks = kp.parse_mod_chunks(mod_text)
check("one Add Boot chunk", len(chunks) == 1 and chunks[0]["kind"] == "boot", repr(chunks))
check("chunk command", chunks[0]["command"] == "Add Boot")
check("default target empty", chunks[0]["target"] == "")

mod_list = []
indexes = {}
kp.proc_replacement(mod_text, mod_list, indexes, "example.mod", "Replace:", "With:")
check("proc one boot item", len(mod_list) == 1 and mod_list[0]["type"] == "boot", repr(mod_list))
check(
    "proc paths",
    mod_list[0]["paths"] == [
        "mods/exampleMod/exampleMod.js",
        "mods/exampleMod/exampleMod1.js",
    ],
    repr(mod_list[0].get("paths")),
)
check(
    "targets js/boot.js",
    os.path.normpath(mod_list[0]["target"]) == os.path.normpath(BOOT),
    repr(mod_list[0].get("target")),
)

# insert into real boot.js
new_boot, added, skipped, error = kp.insert_boot_scripts(boot, paths)
check("insert no error", error is None, repr(error))
check(
    "inserted both",
    added == [
        "mods/exampleMod/exampleMod.js",
        "mods/exampleMod/exampleMod1.js",
    ],
    repr(added),
)
check("nothing skipped first time", skipped == [], repr(skipped))
check('still has "js/main.js"', '"js/main.js"' in new_boot)
check("exampleMod.js after main.js", new_boot.index('"js/main.js"') < new_boot.index('"mods/exampleMod/exampleMod.js"'))
check("exampleMod1.js after exampleMod.js", new_boot.index('"mods/exampleMod/exampleMod.js"') < new_boot.index('"mods/exampleMod/exampleMod1.js"'))
check("array still closes", "  ];" in new_boot.split("var scripts = [", 1)[1][:8000])
check("main.js not duplicated", new_boot.count('"js/main.js"') == boot.count('"js/main.js"'))

# second apply is idempotent
again, added2, skipped2, error2 = kp.insert_boot_scripts(new_boot, paths)
check("second apply no error", error2 is None)
check("second apply adds nothing", added2 == [], repr(added2))
check("second apply skips both", skipped2 == paths, repr(skipped2))
check("second apply content unchanged", again == new_boot)

# second mod stacks after first
more, added3, skipped3, error3 = kp.insert_boot_scripts(
    new_boot, ["mods/otherMod/otherMod.js"]
)
check("second mod no error", error3 is None)
check("second mod added", added3 == ["mods/otherMod/otherMod.js"], repr(added3))
check(
    "second mod after first",
    more.index('"mods/exampleMod/exampleMod1.js"') < more.index('"mods/otherMod/otherMod.js"'),
)

# missing array
bad, _a, _s, bad_err = kp.insert_boot_scripts("no scripts here", paths)
check("missing array errors", bad_err is not None and "Could not find" in bad_err, repr(bad_err))

# tail of the array after insert
idx = new_boot.find('"js/main.js"')
tail = new_boot[idx:idx + 220]
print("--- tail after insert ---")
print(tail)
print("-------------------------")

if errors:
    print("FAILED: " + ", ".join(errors))
    sys.exit(1)
print("ALL ADD BOOT TESTS PASSED")
