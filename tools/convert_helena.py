import json
import re
from pathlib import Path

base = Path(r"Liliths Throne v0.4.10/res/txt/places/dominion/harpyNests")
out_dir = Path("Liliths Throne HTML/js/text")

def convert(src, dest_name, pack, want):
    xml = (base / src).read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'<htmlContent tag="([^"]+)">\s*<!\[CDATA\[(.*?)\]\]>', xml, re.S):
        tag, body = m.group(1), m.group(2)
        if tag in want and tag not in out:
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
    "helena.xml",
    "helenaNest.js",
    "places/dominion/harpyNests/helena",
    {
        "HELENAS_NEST_EXTERIOR",
        "HELENAS_NEST_EXTERIOR_SLEEPING",
        "HELENAS_NEST_MAIN_QUEST",
        "HELENAS_NEST_MAIN_QUEST_SCARLETT",
        "HELENAS_NEST_MAIN_QUEST_NO_PUNISHMENT",
        "HELENAS_NEST_MAIN_QUEST_LEAVING",
        "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT",
        "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_ENDURE",
        "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_END",
        "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_STRUGGLE",
        "HELENAS_NEST_MAIN_QUEST_TAKE_PUNISHMENT_ENJOY",
    },
)
convert(
    "generic.xml",
    "harpyNests.js",
    "places/dominion/harpyNests/generic",
    {
        "OUTSIDE",
        "ENTRANCE_ENFORCER_POST",
        "ENTRANCE_ENFORCER_POST_ASK_FOR_ACCESS",
        "WALKWAY",
        "WALKWAY_BRIDGE",
    },
)
