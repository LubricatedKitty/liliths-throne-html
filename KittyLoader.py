import argparse
import collections
import importlib.util
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tkinter as tk
from tkinter import ttk, messagebox

APP_TITLE = "KittyLoader"
STATE_NAME = "kittyloader.json"

BG = "#141418"
SURFACE = "#1e1e26"
SURFACE2 = "#282832"
SURFACE3 = "#32323e"
TEXT = "#f2f2f6"
MUTED = "#9b9ba8"
ACCENT = "#d46072"
ACCENT_HOVER = "#e27888"
ACCENT_DIM = "#8a3d4c"
BORDER = "#3d3d4a"
ROW_ALT = "#1a1a22"
SELECT = "#4a3040"

COLUMNS = (
    ("enabled", "On", 48, False),
    ("name", "Name", 180, True),
    ("author", "Author", 120, True),
    ("description", "Description", 280, True),
    ("category", "Category", 110, True),
    ("version", "Version", 80, True),
    ("game_version", "Game Version", 110, True),
    ("priority", "Priority", 80, True),
)


def app_root():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def load_patcher():
    root = app_root()
    bundled = getattr(sys, "_MEIPASS", root)
    candidates = [
        os.path.join(root, "KittyPatcher CC v0.1.6.py"),
        os.path.join(bundled, "KittyPatcher CC v0.1.6.py"),
    ]
    import importlib.util
    for path in candidates:
        if os.path.isfile(path):
            spec = importlib.util.spec_from_file_location("kittypatcher_cc", path)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            return mod
    raise FileNotFoundError("Could not find KittyPatcher CC v0.1.6.py")


def _strip_inline_hash_comment(line):
    in_single = False
    in_double = False
    escaped = False
    for i, ch in enumerate(line):
        if escaped:
            escaped = False
            continue
        if ch == "\\" and (in_single or in_double):
            escaped = True
            continue
        if ch == "'" and not in_double:
            in_single = not in_single
        elif ch == '"' and not in_single:
            in_double = not in_double
        elif ch == "#" and not in_single and not in_double:
            return line[:i].rstrip()
    return line


def strip_mod_comments(text):
    kept = []
    for line in text.replace("\r\n", "\n").split("\n"):
        if line.lstrip().startswith("#"):
            continue
        kept.append(_strip_inline_hash_comment(line))
    return "\n".join(kept)


def parse_depends_value(value):
    """Split a Depends On: value into tokens. Commas; quotes optional."""
    value = (value or "").strip()
    if not value:
        return []
    parts = []
    current = []
    in_quote = None
    for ch in value:
        if in_quote:
            if ch == in_quote:
                in_quote = None
            else:
                current.append(ch)
        elif ch in ('"', "'"):
            in_quote = ch
        elif ch == ",":
            token = "".join(current).strip()
            if token:
                parts.append(token)
            current = []
        else:
            current.append(ch)
    token = "".join(current).strip()
    if token:
        parts.append(token)
    return parts


def parse_mod_meta(text):
    meta = {
        "name": "",
        "author": "",
        "description": "",
        "category": "",
        "version": "",
        "game_version": "",
        "depends": [],
    }
    key_map = {
        "name": "name",
        "author": "author",
        "description": "description",
        "category": "category",
        "version": "version",
        "game version": "game_version",
        "game_version": "game_version",
        "depends on": "depends",
        "depends": "depends",
        "dependencies": "depends",
    }
    for raw in strip_mod_comments(text).split("\n"):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("Replace") or line.startswith("Add Javascript") or line.startswith("Add Content") or line.startswith("Add Boot") or line.startswith("~~") or line.startswith("With:"):
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        mapped = key_map.get(key.strip().lower())
        if mapped == "depends":
            meta["depends"].extend(parse_depends_value(value))
        elif mapped:
            meta[mapped] = value.strip()
    return meta


def mod_identity_keys(mod):
    keys = set()
    filename = (mod.get("file") or "").strip()
    if filename:
        keys.add(filename.lower())
        keys.add(os.path.splitext(filename)[0].lower())
    name = (mod.get("name") or "").strip()
    if name:
        keys.add(name.lower())
    return keys


def resolve_dep(token, mods):
    raw = (token or "").strip()
    if not raw:
        return None
    wanted = {raw.lower(), os.path.splitext(raw)[0].lower()}
    if not raw.lower().endswith(".mod"):
        wanted.add(raw.lower() + ".mod")
    for mod in mods or []:
        if wanted & mod_identity_keys(mod):
            return mod
    return None


def missing_depends(mod, enabled_files, mods):
    """Return [{token, reason, file, name}] for deps that are missing or not enabled."""
    enabled = {str(name) for name in (enabled_files or [])}
    out = []
    for token in mod.get("depends") or []:
        found = resolve_dep(token, mods)
        if not found:
            out.append({"token": token, "reason": "missing", "file": "", "name": token})
        elif found["file"] not in enabled:
            out.append({
                "token": token,
                "reason": "disabled",
                "file": found["file"],
                "name": found.get("name") or found["file"],
            })
    return out


def sort_enabled_by_depends(enabled, mods):
    """Stable topological sort: required mods apply before the mods that depend on them."""
    enabled = list(enabled or [])
    if not enabled:
        return enabled
    graph = {name: set() for name in enabled}
    for name in enabled:
        mod = next((m for m in (mods or []) if m.get("file") == name), None)
        if not mod:
            continue
        for token in mod.get("depends") or []:
            found = resolve_dep(token, mods)
            if found and found["file"] in graph and found["file"] != name:
                graph[name].add(found["file"])
    remaining = {name: set(deps) for name, deps in graph.items()}
    out = []
    while remaining:
        ready = [name for name, deps in remaining.items() if not deps]
        if not ready:
            for name in enabled:
                if name in remaining:
                    out.append(name)
            break
        ready.sort(key=enabled.index)
        pick = ready[0]
        out.append(pick)
        del remaining[pick]
        for deps in remaining.values():
            deps.discard(pick)
    return out


def format_missing_depends(missing):
    lines = []
    for item in missing or []:
        if item.get("reason") == "missing":
            lines.append("  • " + item["name"] + " — not installed")
        else:
            label = item["name"]
            if item.get("file") and item["file"] not in label:
                label = label + " (" + item["file"] + ")"
            lines.append("  • " + label + " — not enabled")
    return "\n".join(lines)


SKIP_MOD_DIRS = ("logs", "backup", "cache")


def discover_mod_files(mods_dir):
    """Find .mod files under mods/, including subfolders. Same walk as KittyPatcher.

    Identity is the basename (lowercase), matching KittyPatcher's apply list.
    A later walk hit with the same name replaces an earlier one.
    """
    found = {}
    if not os.path.isdir(mods_dir):
        return []
    for root, dirs, files in os.walk(mods_dir):
        dirs[:] = [d for d in dirs if d.lower() not in SKIP_MOD_DIRS]
        for name in files:
            if not name.lower().endswith(".mod"):
                continue
            path = os.path.join(root, name)
            if not os.path.isfile(path):
                continue
            rel = os.path.relpath(path, mods_dir).replace("\\", "/")
            found[name.lower()] = {
                "file": name,
                "path": path,
                "rel": rel,
            }
    return [found[key] for key in sorted(found)]


def write_mod_meta(path, name, description, category):
    with open(path, "r", encoding="utf-8", errors="ignore") as handle:
        original = handle.read()
    lines = original.replace("\r\n", "\n").split("\n")
    keys = {
        "name": name,
        "description": description,
        "category": category,
    }
    written = set()
    out = []
    stopped = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#"):
            out.append(line)
            continue
        if not stopped and (
            stripped.startswith("Replace")
            or stripped.startswith("Add Javascript")
            or stripped.startswith("Add Content")
            or stripped.startswith("Add Boot")
            or stripped.startswith("~~")
        ):
            for key in ("name", "description", "category"):
                if key not in written:
                    label = "Name" if key == "name" else "Description" if key == "description" else "Category"
                    out.append(f"{label}: {keys[key]}")
                    written.add(key)
            stopped = True
            out.append(line)
            continue
        if not stopped and ":" in stripped:
            key = stripped.split(":", 1)[0].strip().lower()
            if key in ("name", "description", "category"):
                label = "Name" if key == "name" else "Description" if key == "description" else "Category"
                out.append(f"{label}: {keys[key]}")
                written.add(key)
                continue
        out.append(line)
    if not stopped:
        header = []
        for key, label in (("name", "Name"), ("description", "Description"), ("category", "Category")):
            if key not in written:
                header.append(f"{label}: {keys[key]}")
        out = header + ([""] if header else []) + out
    with open(path, "w", encoding="utf-8", errors="ignore") as handle:
        handle.write("\n".join(out))


def configure_mod_highlight(editor):
    editor.tag_configure("comment", foreground="#6fbf73")
    editor.tag_configure("keyword", foreground="#7eb8ff")
    editor.tag_configure("meta", foreground="#c792ea")
    editor.tag_configure("path", foreground="#e0c36e")
    editor.tag_configure("string", foreground="#d9a66c")


def highlight_mod_source(editor):
    for tag in ("comment", "keyword", "meta", "path", "string"):
        editor.tag_remove(tag, "1.0", "end")
    content = editor.get("1.0", "end-1c")
    patterns = (
        (r"#.*$", "comment"),
        (r'"[^"\n]*"', "string"),
        (r"'[^'\n]*'", "string"),
        (r"^Replace(?:\s+\[[^\]]+\])?:", "keyword"),
        (r"^With:", "keyword"),
        (r"^Add (?:Javascript|Content)(?:\s+\[[^\]]+\])?:", "keyword"),
        (r"^Add Boot(?:\s+\[[^\]]+\])?:", "keyword"),
        (r"^Name:|^Author:|^Description:|^Category:|^Version:|^Game Version:|^Depends On:|^Depends:|^Dependencies:", "meta"),
        (r"\[[^\]]+\]", "path"),
    )
    for pattern, tag in patterns:
        for match in re.finditer(pattern, content, re.MULTILINE):
            start = f"1.0+{match.start()}c"
            end = f"1.0+{match.end()}c"
            editor.tag_add(tag, start, end)


def widget_bg(widget, fallback=BG):
    try:
        return widget.cget("bg")
    except tk.TclError:
        pass
    try:
        return widget.cget("background")
    except tk.TclError:
        return fallback


class RoundedButton(tk.Canvas):
    def __init__(self, parent, text, command=None, width=96, height=34, radius=12, bg=ACCENT, fg=TEXT, hover=ACCENT_HOVER):
        super().__init__(parent, width=width, height=height, bg=widget_bg(parent), highlightthickness=0, bd=0, cursor="hand2")
        self.command = command
        self.text = text
        self.radius = radius
        self.bg_color = bg
        self.fg = fg
        self.hover = hover
        self.w = width
        self.h = height
        self.enabled = True
        self.bind("<Button-1>", self._click)
        self.bind("<Enter>", lambda e: self.redraw(self.hover if self.enabled else SURFACE3))
        self.bind("<Leave>", lambda e: self.redraw(self.bg_color if self.enabled else SURFACE3))
        self.redraw(bg)

    def _round_rect(self, x1, y1, x2, y2, r, **kwargs):
        points = [
            x1 + r, y1, x2 - r, y1, x2, y1, x2, y1 + r,
            x2, y2 - r, x2, y2, x2 - r, y2, x1 + r, y2,
            x1, y2, x1, y2 - r, x1, y1 + r, x1, y1,
        ]
        return self.create_polygon(points, smooth=True, **kwargs)

    def redraw(self, fill):
        self.delete("all")
        self._round_rect(1, 1, self.w - 1, self.h - 1, self.radius, fill=fill, outline=BORDER)
        self.create_text(self.w / 2, self.h / 2, text=self.text, fill=self.fg, font=("Segoe UI", 9, "bold"))

    def _click(self, _event):
        if self.enabled and self.command:
            self.command()

    def set_enabled(self, on):
        self.enabled = bool(on)
        self.redraw(self.bg_color if self.enabled else SURFACE3)


class KittyLoader(tk.Tk):
    def __init__(self):
        super().__init__()
        self.root_dir = app_root()
        os.chdir(self.root_dir)
        self.mods_dir = os.path.join(self.root_dir, "mods")
        self.state_path = os.path.join(self.mods_dir, STATE_NAME)
        self.state = self.load_state()
        self.mods = []
        self.sort_key = "priority"
        self.sort_desc = False
        self.drag_iid = None
        self.title(APP_TITLE)
        self.geometry("1180x680")
        self.minsize(900, 480)
        self.configure(bg=BG)
        self._style()
        self._build()
        self.refresh_mods()
        self.refresh_profiles()
        self.refresh_table()

    def _style(self):
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background=BG, foreground=TEXT, fieldbackground=SURFACE2, bordercolor=BORDER)
        style.configure("TFrame", background=BG)
        style.configure("Card.TFrame", background=SURFACE)
        style.configure("TLabel", background=BG, foreground=TEXT, font=("Segoe UI", 10))
        style.configure("Muted.TLabel", background=BG, foreground=MUTED, font=("Segoe UI", 9))
        style.configure("Header.TLabel", background=BG, foreground=TEXT, font=("Segoe UI Semibold", 16))
        style.configure("TCombobox", fieldbackground=SURFACE2, background=SURFACE2, foreground=TEXT, arrowcolor=TEXT)
        style.map("TCombobox", fieldbackground=[("readonly", SURFACE2)], foreground=[("readonly", TEXT)])
        style.configure(
            "Mods.Treeview",
            background=SURFACE,
            fieldbackground=SURFACE,
            foreground=TEXT,
            rowheight=28,
            bordercolor=BORDER,
            font=("Segoe UI", 9),
        )
        style.configure(
            "Mods.Treeview.Heading",
            background=SURFACE3,
            foreground=TEXT,
            relief="flat",
            font=("Segoe UI Semibold", 9),
            bordercolor=BORDER,
        )
        style.map("Mods.Treeview", background=[("selected", SELECT)], foreground=[("selected", TEXT)])
        style.map("Mods.Treeview.Heading", background=[("active", ACCENT_DIM)])
        style.configure("Dark.TEntry", fieldbackground=SURFACE2, foreground=TEXT, insertcolor=TEXT)
        style.configure("Vertical.TScrollbar", background=SURFACE3, troughcolor=SURFACE, bordercolor=BORDER, arrowcolor=TEXT)
        style.configure("Horizontal.TScrollbar", background=SURFACE3, troughcolor=SURFACE, bordercolor=BORDER, arrowcolor=TEXT)

    def load_state(self):
        default = {
            "active_profile": "Default",
            "profiles": [{"name": "Default", "enabled": [], "order": []}],
        }
        if not os.path.isfile(self.state_path):
            return default
        try:
            with open(self.state_path, "r", encoding="utf-8") as handle:
                data = json.load(handle)
            if not data.get("profiles"):
                return default
            return data
        except Exception:
            return default

    def save_state(self):
        os.makedirs(self.mods_dir, exist_ok=True)
        with open(self.state_path, "w", encoding="utf-8") as handle:
            json.dump(self.state, handle, indent=2)
        self.write_applied_mods_js()

    def write_applied_mods_js(self):
        """Fallback the game reads when it cannot fetch kittyloader.json (file://)."""
        by_file = {mod["file"]: mod for mod in (self.mods or [])}
        rows = []
        for name in self.enabled_in_order():
            mod = by_file.get(name) or {}
            rows.append({
                "file": name,
                "name": mod.get("name") or os.path.splitext(name)[0],
                "author": mod.get("author") or "",
                "version": mod.get("version") or "",
                "rel": mod.get("rel") or name,
                "depends": list(mod.get("depends") or []),
            })
        path = os.path.join(self.mods_dir, "appliedMods.js")
        body = "window.LT = window.LT || {};\nLT.APPLIED_MODS = " + json.dumps(rows, indent=2, ensure_ascii=False) + ";\n"
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(body)

    def profile(self):
        name = self.state.get("active_profile")
        for item in self.state["profiles"]:
            if item["name"] == name:
                return item
        self.state["active_profile"] = self.state["profiles"][0]["name"]
        return self.state["profiles"][0]

    def refresh_mods(self):
        found = []
        for item in discover_mod_files(self.mods_dir):
            with open(item["path"], "r", encoding="utf-8", errors="ignore") as handle:
                text = handle.read()
            meta = parse_mod_meta(text)
            found.append({
                "file": item["file"],
                "path": item["path"],
                "rel": item["rel"],
                "name": meta["name"] or os.path.splitext(item["file"])[0],
                "author": meta["author"] or "Unknown",
                "description": meta["description"],
                "category": meta["category"] or "Unsorted",
                "version": meta["version"] or "—",
                "game_version": meta["game_version"] or "—",
                "depends": list(meta.get("depends") or []),
            })
        profile = self.profile()
        known = [m["file"] for m in found]
        order = [name for name in profile.get("order", []) if name in known]
        for name in known:
            if name not in order:
                order.append(name)
        profile["order"] = order
        profile["enabled"] = [name for name in profile.get("enabled", []) if name in known]
        self.mods = found
        self.save_state()

    def _build(self):
        pad = ttk.Frame(self)
        pad.pack(fill="both", expand=True, padx=18, pady=16)

        ttk.Label(pad, text="KittyLoader", style="Header.TLabel").pack(anchor="w")
        ttk.Label(pad, text="Enable mods, set load order, then patch.", style="Muted.TLabel").pack(anchor="w", pady=(0, 12))

        top = ttk.Frame(pad)
        top.pack(fill="x", pady=(0, 10))
        ttk.Label(top, text="Profile").pack(side="left", padx=(0, 8))
        self.profile_var = tk.StringVar()
        self.profile_box = ttk.Combobox(top, textvariable=self.profile_var, state="readonly", width=28)
        self.profile_box.pack(side="left", padx=(0, 10))
        self.profile_box.bind("<<ComboboxSelected>>", self.on_profile_change)

        btn_row = tk.Frame(top, bg=BG)
        btn_row.pack(side="left")
        RoundedButton(btn_row, "Create", self.create_profile, width=84).pack(side="left", padx=3)
        RoundedButton(btn_row, "Remove", self.remove_profile, width=84, bg=SURFACE3, hover=ACCENT_DIM).pack(side="left", padx=3)
        RoundedButton(btn_row, "Up", self.move_profile_up, width=56, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=3)
        RoundedButton(btn_row, "Down", self.move_profile_down, width=64, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=3)

        list_wrap = tk.Frame(pad, bg=BORDER)
        list_wrap.pack(fill="both", expand=True)
        inner = tk.Frame(list_wrap, bg=SURFACE)
        inner.pack(fill="both", expand=True, padx=1, pady=1)

        self.tree = ttk.Treeview(
            inner,
            columns=[col[0] for col in COLUMNS],
            show="headings",
            style="Mods.Treeview",
            selectmode="browse",
        )
        for key, label, width, stretch in COLUMNS:
            self.tree.heading(key, text=label, command=lambda k=key: self.sort_by(k))
            self.tree.column(key, width=width, stretch=stretch, minwidth=48, anchor="w")

        yscroll = ttk.Scrollbar(inner, orient="vertical", command=self.tree.yview)
        xscroll = ttk.Scrollbar(inner, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=yscroll.set, xscrollcommand=xscroll.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        yscroll.grid(row=0, column=1, sticky="ns")
        xscroll.grid(row=1, column=0, sticky="ew")
        inner.grid_rowconfigure(0, weight=1)
        inner.grid_columnconfigure(0, weight=1)

        self.tree.tag_configure("odd", background=SURFACE)
        self.tree.tag_configure("even", background=ROW_ALT)
        self.tree.tag_configure("missingdep", foreground="#ff6b6b")
        self.tree.bind("<Button-1>", self.on_tree_click)
        self.tree.bind("<B1-Motion>", self.on_tree_drag)
        self.tree.bind("<ButtonRelease-1>", self.on_tree_drop)
        self.tree.bind("<Double-1>", self.on_tree_double)
        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)

        # add_row = tk.Frame(pad, bg=BG)
        # add_row.pack(fill="x", pady=(8, 0))

        bottom = ttk.Frame(pad)
        bottom.pack(fill="x", pady=(12, 0))
        RoundedButton(bottom, "Patch", self.run_patch, width=130, height=38).pack(side="left", padx=4)
        RoundedButton(bottom, "Restore", self.restore_backups, width=130, height=38, bg=SURFACE3, hover=ACCENT_DIM).pack(side="left", padx=4)
        RoundedButton(bottom, "Results", self.show_results, width=130, height=38, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=4)
        RoundedButton(bottom, "Conflicts", self.show_conflicts, width=130, height=38, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=4)
        RoundedButton(bottom, "Add Mod", self.add_mod, width=130, height=38, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=4)
        self.status = ttk.Label(bottom, text="Ready", style="Muted.TLabel")
        self.status.pack(side="left", padx=12)

    def refresh_profiles(self):
        names = [item["name"] for item in self.state["profiles"]]
        self.profile_box["values"] = names
        active = self.state.get("active_profile")
        if active not in names:
            active = names[0]
            self.state["active_profile"] = active
        self.profile_var.set(active)

    def on_profile_change(self, _event=None):
        self.state["active_profile"] = self.profile_var.get()
        self.save_state()
        self.refresh_mods()
        self.refresh_table()

    def create_profile(self):
        pop = tk.Toplevel(self)
        pop.title("Create profile")
        pop.configure(bg=SURFACE)
        pop.resizable(False, False)
        pop.transient(self)
        pop.grab_set()
        ttk.Label(pop, text="Profile name", style="TLabel").pack(anchor="w", padx=16, pady=(16, 6))
        entry = ttk.Entry(pop, width=32, style="Dark.TEntry")
        entry.pack(padx=16)
        entry.focus_set()
        err = ttk.Label(pop, text="", style="Muted.TLabel")
        err.pack(anchor="w", padx=16, pady=(6, 0))

        def confirm():
            name = entry.get().strip()
            if not name:
                err.configure(text="Enter a name.")
                return
            if any(item["name"] == name for item in self.state["profiles"]):
                err.configure(text="That profile already exists.")
                return
            current = self.profile()
            self.state["profiles"].append({
                "name": name,
                "enabled": list(current.get("enabled", [])),
                "order": list(current.get("order", [])),
            })
            self.state["active_profile"] = name
            self.save_state()
            self.refresh_profiles()
            self.refresh_table()
            pop.destroy()

        btns = tk.Frame(pop, bg=SURFACE)
        btns.pack(pady=16)
        RoundedButton(btns, "Create", confirm, width=90).pack(side="left", padx=6)
        RoundedButton(btns, "Cancel", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)
        pop.bind("<Return>", lambda e: confirm())

    def add_mod(self):
        pop = tk.Toplevel(self)
        pop.title("Add mod")
        pop.configure(bg=SURFACE)
        pop.resizable(False, False)
        pop.transient(self)
        pop.grab_set()
        ttk.Label(pop, text="Mod name", style="TLabel").pack(anchor="w", padx=16, pady=(16, 6))
        entry = ttk.Entry(pop, width=36, style="Dark.TEntry")
        entry.pack(padx=16)
        entry.focus_set()
        ttk.Label(pop, text="Saved as a .mod file in the mods folder. Subfolders are also listed.", style="Muted.TLabel").pack(anchor="w", padx=16, pady=(6, 0))
        err = ttk.Label(pop, text="", style="Muted.TLabel")
        err.pack(anchor="w", padx=16, pady=(4, 0))

        def safe_filename(name):
            cleaned = "".join(ch if ch.isalnum() or ch in " -_" else "" for ch in name).strip()
            cleaned = "_".join(cleaned.split())
            return cleaned or "NewMod"

        def confirm():
            name = entry.get().strip()
            if not name:
                err.configure(text="Enter a name.")
                return
            filename = safe_filename(name) + ".mod"
            path = os.path.join(self.mods_dir, filename)
            if os.path.exists(path):
                err.configure(text=filename + " already exists.")
                return
            os.makedirs(self.mods_dir, exist_ok=True)
            body = (
                f"# New KittyLoader mod.\n"
                f"Name: {name}\n"
                f"Author: \n"
                f"Description: \n"
                f"Category: Unsorted\n"
                f"Version: 1.0.0\n"
                f"Game Version: 0.1\n"
                f"# Depends On: OtherMod.mod\n"
                f"\n"
                f"# Add Replace / Add Boot / Add Javascript / Add Content blocks below.\n"
            )
            with open(path, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(body)
            profile = self.profile()
            if filename not in profile.get("order", []):
                profile.setdefault("order", []).append(filename)
            self.save_state()
            self.refresh_mods()
            self.refresh_table()
            self.tree.selection_set(filename)
            self.tree.see(filename)
            pop.destroy()
            self.status.configure(text="Created " + filename)
            self.edit_mod(filename)

        btns = tk.Frame(pop, bg=SURFACE)
        btns.pack(pady=16)
        RoundedButton(btns, "Create", confirm, width=90).pack(side="left", padx=6)
        RoundedButton(btns, "Cancel", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)
        pop.bind("<Return>", lambda e: confirm())

    def remove_profile(self):
        if len(self.state["profiles"]) <= 1:
            messagebox.showinfo(APP_TITLE, "You need at least one profile.")
            return
        name = self.profile()["name"]
        if not messagebox.askyesno(APP_TITLE, f"Remove profile '{name}'?"):
            return
        self.state["profiles"] = [item for item in self.state["profiles"] if item["name"] != name]
        self.state["active_profile"] = self.state["profiles"][0]["name"]
        self.save_state()
        self.refresh_profiles()
        self.refresh_mods()
        self.refresh_table()

    def move_profile_up(self):
        self._shift_profile(-1)

    def move_profile_down(self):
        self._shift_profile(1)

    def _shift_profile(self, delta):
        names = [item["name"] for item in self.state["profiles"]]
        current = self.profile()["name"]
        index = names.index(current)
        next_index = index + delta
        if next_index < 0 or next_index >= len(names):
            return
        profiles = self.state["profiles"]
        profiles[index], profiles[next_index] = profiles[next_index], profiles[index]
        self.save_state()
        self.refresh_profiles()

    def sort_by(self, key):
        if self.sort_key == key:
            self.sort_desc = not self.sort_desc
        else:
            self.sort_key = key
            self.sort_desc = False
        for col, label, _width, _stretch in COLUMNS:
            mark = ""
            if col == self.sort_key:
                mark = " ▼" if self.sort_desc else " ▲"
            self.tree.heading(col, text=label + mark)
        self.refresh_table()

    def sorted_mods(self):
        profile = self.profile()
        order = {name: i for i, name in enumerate(profile.get("order", []))}
        rows = []
        for mod in self.mods:
            item = dict(mod)
            item["priority"] = order.get(mod["file"], 9999) + 1
            item["enabled"] = mod["file"] in profile.get("enabled", [])
            rows.append(item)
        key = self.sort_key
        if key == "enabled":
            rows.sort(key=lambda r: (not r["enabled"], r["name"].lower()), reverse=self.sort_desc)
        elif key == "priority":
            rows.sort(key=lambda r: r["priority"], reverse=self.sort_desc)
        else:
            rows.sort(key=lambda r: str(r.get(key, "")).lower(), reverse=self.sort_desc)
        return rows

    def refresh_table(self):
        for iid in self.tree.get_children():
            self.tree.delete(iid)
        for index, mod in enumerate(self.sorted_mods()):
            values = (
                "Yes" if mod["enabled"] else "No",
                mod["name"],
                mod["author"],
                mod["description"],
                mod["category"],
                mod["version"],
                mod["game_version"],
                str(mod["priority"]),
            )
            tags = ["even" if index % 2 else "odd"]
            if missing_depends(mod, self.profile().get("enabled", []), self.mods):
                tags.append("missingdep")
            self.tree.insert("", "end", iid=mod["file"], values=values, tags=tuple(tags))
        mode = "drag to reorder" if self.sort_key == "priority" and not self.sort_desc else "sort by Priority (ascending) to drag load order"
        enabled = len(self.profile().get("enabled", []))
        bad = 0
        enabled_set = self.profile().get("enabled", [])
        for mod in self.mods:
            if missing_depends(mod, enabled_set, self.mods):
                bad += 1
        extra = f" · {bad} missing dependencies" if bad else ""
        self.status.configure(text=f"{enabled} enabled · {len(self.mods)} mods · {mode}{extra}")
        self._table_status = self.status.cget("text")

    def on_tree_click(self, event):
        if self.tree.identify_region(event.x, event.y) != "cell":
            self.drag_iid = None
            return
        iid = self.tree.identify_row(event.y)
        col = self.tree.identify_column(event.x)
        if not iid:
            self.drag_iid = None
            return
        if col == "#1":
            self.toggle_enabled(iid)
            self.drag_iid = None
            return "break"
        self.drag_iid = iid if self.sort_key == "priority" and not self.sort_desc else None

    def on_tree_drag(self, event):
        if not self.drag_iid or self.sort_key != "priority" or self.sort_desc:
            return
        over = self.tree.identify_row(event.y)
        if over:
            self.tree.selection_set(over)

    def on_tree_drop(self, event):
        if not self.drag_iid or self.sort_key != "priority" or self.sort_desc:
            self.drag_iid = None
            return
        target = self.tree.identify_row(event.y)
        source = self.drag_iid
        self.drag_iid = None
        if not target or target == source:
            return
        order = list(self.profile()["order"])
        if source not in order or target not in order:
            return
        order.remove(source)
        order.insert(order.index(target), source)
        self.profile()["order"] = order
        self.save_state()
        self.refresh_table()
        self.tree.selection_set(source)

    def on_tree_select(self, _event=None):
        sel = self.tree.selection()
        if not sel:
            return
        mod = self.find_mod(sel[0])
        if not mod:
            return
        missing = missing_depends(mod, self.profile().get("enabled", []), self.mods)
        if missing:
            detail = "; ".join(
                item["name"] + (" (not installed)" if item["reason"] == "missing" else " (not enabled)")
                for item in missing
            )
            self.status.configure(text=mod["name"] + " needs " + detail)
        elif getattr(self, "_table_status", ""):
            self.status.configure(text=self._table_status)

    def dependents_of(self, filename, enabled_only=True):
        enabled = set(self.profile().get("enabled", []))
        out = []
        for mod in self.mods:
            if enabled_only and mod["file"] not in enabled:
                continue
            if mod["file"] == filename:
                continue
            for token in mod.get("depends") or []:
                found = resolve_dep(token, self.mods)
                if found and found["file"] == filename:
                    out.append(mod)
                    break
        return out

    def place_before(self, earlier, later):
        order = list(self.profile().setdefault("order", []))
        if earlier not in order:
            order.append(earlier)
        if later not in order:
            order.append(later)
        if order.index(earlier) > order.index(later):
            order.remove(earlier)
            order.insert(order.index(later), earlier)
        self.profile()["order"] = order

    def toggle_enabled(self, filename):
        enabled = self.profile().setdefault("enabled", [])
        mod = self.find_mod(filename)
        if filename in enabled:
            kids = self.dependents_of(filename, enabled_only=True)
            if kids:
                names = "\n".join("  • " + (k.get("name") or k["file"]) for k in kids)
                if not messagebox.askyesno(
                    APP_TITLE,
                    f'These enabled mods depend on "{(mod or {}).get("name") or filename}":\n{names}\n\nDisable it anyway? They will turn red until it is on again.',
                ):
                    return
            enabled.remove(filename)
        else:
            missing = missing_depends(mod or {}, enabled, self.mods)
            if missing:
                body = format_missing_depends(missing)
                not_installed = [item for item in missing if item["reason"] == "missing"]
                can_enable = [item for item in missing if item["reason"] == "disabled" and item.get("file")]
                title = (mod or {}).get("name") or filename
                if not_installed and not can_enable:
                    if not messagebox.askokcancel(
                        APP_TITLE,
                        f'"{title}" needs:\n{body}\n\nIt will stay red until that mod is in the mods folder and enabled.\nEnable this one anyway?',
                    ):
                        return
                else:
                    answer = messagebox.askyesnocancel(
                        APP_TITLE,
                        f'"{title}" needs:\n{body}\n\nYes = enable the required mods too.\nNo = enable only this one (it stays red).\nCancel = leave it off.',
                    )
                    if answer is None:
                        return
                    if answer:
                        for item in can_enable:
                            if item["file"] not in enabled:
                                enabled.append(item["file"])
                            self.place_before(item["file"], filename)
            enabled.append(filename)
            for token in (mod or {}).get("depends") or []:
                found = resolve_dep(token, self.mods)
                if found and found["file"] in enabled:
                    self.place_before(found["file"], filename)
        self.save_state()
        self.refresh_table()
        self.tree.selection_set(filename)

    def on_tree_double(self, event):
        if self.tree.identify_region(event.x, event.y) != "cell":
            return
        iid = self.tree.identify_row(event.y)
        if iid:
            self.edit_mod(iid)

    def find_mod(self, filename):
        for mod in self.mods:
            if mod["file"] == filename:
                return mod
        return None

    def edit_mod(self, filename):
        mod = self.find_mod(filename)
        if not mod:
            return
        order = self.profile().get("order", [])
        priority = order.index(filename) + 1 if filename in order else "—"
        pop = tk.Toplevel(self)
        pop.title(mod["name"])
        pop.configure(bg=SURFACE)
        pop.geometry("520x640")
        pop.minsize(480, 420)
        pop.transient(self)
        pop.grab_set()

        btns = tk.Frame(pop, bg=SURFACE)
        btns.pack(side="bottom", fill="x", pady=14)

        form_wrap = tk.Frame(pop, bg=SURFACE)
        form_wrap.pack(side="top", fill="both", expand=True)
        canvas = tk.Canvas(form_wrap, bg=SURFACE, highlightthickness=0)
        scroll = ttk.Scrollbar(form_wrap, orient="vertical", command=canvas.yview)
        form = tk.Frame(canvas, bg=SURFACE)
        form.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=form, anchor="nw", tags="form")
        canvas.configure(yscrollcommand=scroll.set)
        canvas.pack(side="left", fill="both", expand=True)
        scroll.pack(side="right", fill="y")
        form.bind("<Configure>", lambda e: canvas.itemconfigure("form", width=canvas.winfo_width()) or canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.bind("<Configure>", lambda e: canvas.itemconfigure("form", width=e.width))

        def field(label, value, readonly=False, multiline=False):
            ttk.Label(form, text=label).pack(anchor="w", padx=16, pady=(12, 4))
            if multiline:
                box = tk.Text(form, height=5, bg=SURFACE2, fg=TEXT, insertbackground=TEXT, relief="flat", wrap="word", font=("Segoe UI", 9))
                box.insert("1.0", value)
                if readonly:
                    box.configure(state="disabled")
                box.pack(fill="x", padx=16)
                return box
            entry = ttk.Entry(form, style="Dark.TEntry")
            entry.insert(0, value)
            if readonly:
                entry.configure(state="readonly")
            entry.pack(fill="x", padx=16)
            return entry

        name_e = field("Name", mod["name"])
        field("File", mod.get("rel") or mod["file"], readonly=True)
        field("Author", mod["author"], readonly=True)
        desc_e = field("Description", mod["description"], multiline=True)
        cat_e = field("Category", mod["category"])
        field("Version", mod["version"], readonly=True)
        field("Game Version", mod["game_version"], readonly=True)
        field("Depends On", ", ".join(mod.get("depends") or []) or "—", readonly=True)
        field("Priority", str(priority), readonly=True)

        def save():
            write_mod_meta(mod["path"], name_e.get().strip(), desc_e.get("1.0", "end").strip(), cat_e.get().strip())
            self.refresh_mods()
            self.refresh_table()
            pop.destroy()

        def open_source():
            pop.grab_release()
            self.edit_mod_source(mod, info_fields=(name_e, desc_e, cat_e))

        inner = tk.Frame(btns, bg=SURFACE)
        inner.pack()
        RoundedButton(inner, "Save", save, width=90).pack(side="left", padx=6)
        RoundedButton(inner, "Edit Mod", open_source, width=110, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)
        RoundedButton(inner, "Close", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)

    def edit_mod_source(self, mod, info_fields=None):
        path = mod["path"]
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as handle:
                original = handle.read()
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return

        pop = tk.Toplevel(self)
        pop.title("Edit " + mod["file"])
        pop.configure(bg=SURFACE)
        pop.geometry("860x620")
        pop.transient(self)

        ttk.Label(pop, text=mod.get("rel") or mod["file"], style="Muted.TLabel").pack(anchor="w", padx=12, pady=(12, 0))

        body = tk.Frame(pop, bg=SURFACE)
        body.pack(fill="both", expand=True, padx=12, pady=12)
        editor = tk.Text(
            body,
            bg="#121218",
            fg=TEXT,
            insertbackground=TEXT,
            relief="flat",
            wrap="none",
            font=("Consolas", 10),
            undo=True,
            tabs=("1c",),
        )
        yscroll = ttk.Scrollbar(body, orient="vertical", command=editor.yview)
        xscroll = ttk.Scrollbar(body, orient="horizontal", command=editor.xview)
        editor.configure(yscrollcommand=yscroll.set, xscrollcommand=xscroll.set)
        editor.grid(row=0, column=0, sticky="nsew")
        yscroll.grid(row=0, column=1, sticky="ns")
        xscroll.grid(row=1, column=0, sticky="ew")
        body.grid_rowconfigure(0, weight=1)
        body.grid_columnconfigure(0, weight=1)

        configure_mod_highlight(editor)
        editor.insert("1.0", original)
        highlight_mod_source(editor)

        def save_source():
            text = editor.get("1.0", "end-1c")
            try:
                with open(path, "w", encoding="utf-8", errors="ignore") as handle:
                    handle.write(text)
            except Exception as exc:
                messagebox.showerror(APP_TITLE, str(exc))
                return
            self.refresh_mods()
            self.refresh_table()
            updated = self.find_mod(mod["file"])
            if updated and info_fields:
                name_e, desc_e, cat_e = info_fields
                name_e.delete(0, "end")
                name_e.insert(0, updated["name"])
                desc_e.configure(state="normal")
                desc_e.delete("1.0", "end")
                desc_e.insert("1.0", updated["description"])
                cat_e.delete(0, "end")
                cat_e.insert(0, updated["category"])
            self.status.configure(text="Saved " + mod["file"])
            pop.destroy()

        editor.bind("<KeyRelease>", lambda e: highlight_mod_source(editor))

        btns = tk.Frame(pop, bg=SURFACE)
        btns.pack(pady=(0, 12))
        RoundedButton(btns, "Save", save_source, width=110).pack(side="left", padx=6)
        RoundedButton(btns, "Close", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)

    def enabled_in_order(self):
        profile = self.profile()
        enabled = set(profile.get("enabled", []))
        return [name for name in profile.get("order", []) if name in enabled]

    def run_patch(self):
        enabled = self.enabled_in_order()
        if not enabled:
            if not messagebox.askyesno(APP_TITLE, "No mods are enabled. Patch with an empty list? This restores backups and applies nothing."):
                return
        problems = []
        enabled_set = set(enabled)
        for name in enabled:
            mod = self.find_mod(name)
            if not mod:
                continue
            missing = missing_depends(mod, enabled_set, self.mods)
            if missing:
                problems.append((mod.get("name") or name) + " needs:\n" + format_missing_depends(missing))
        if problems:
            if not messagebox.askyesno(
                APP_TITLE,
                "These enabled mods are missing dependencies:\n\n"
                + "\n\n".join(problems)
                + "\n\nApply anyway? The dependent mod may fail or do nothing.",
            ):
                return
        ordered = sort_enabled_by_depends(enabled, self.mods)
        try:
            patcher = load_patcher()
            result = patcher.run_patch(enabled_mod_files=ordered, pause=False, root=self.root_dir)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        processed = ", ".join(result.get("processed") or []) or "(none)"
        note = ""
        if ordered != enabled:
            note = "\nRequired mods were applied first."
        messagebox.showinfo(
            APP_TITLE,
            f"Patch finished.\nEnabled mods applied: {processed}{note}\nLog: {result.get('log')}",
        )
        self.status.configure(text="Patch finished")

    def restore_backups(self):
        if not messagebox.askyesno(APP_TITLE, "Restore every patched file from backup? Enabled mods will stay listed, but their changes will be undone until you Patch again."):
            return
        try:
            patcher = load_patcher()
            result = patcher.restore_backups(root=self.root_dir)
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        count = len(result.get("restored") or [])
        missing = result.get("missing") or []
        extra = ""
        if missing:
            extra = "\nCould not restore:\n" + "\n".join(missing)
        messagebox.showinfo(APP_TITLE, f"Restored {count} file(s).{extra}")
        self.status.configure(text=f"Restored {count} file(s)")

    def show_results(self):
        logs_dir = os.path.join(self.mods_dir, "logs")
        tabs = (
            ("Main Patch Log", os.path.join(logs_dir, "MainPatchLog.txt")),
            ("Mod Patch Log", os.path.join(logs_dir, "ModPatchLog.txt")),
            ("Fails Patch Log", os.path.join(logs_dir, "FailsPatchLog.txt")),
        )
        pop = tk.Toplevel(self)
        pop.title("Patching results")
        pop.configure(bg=SURFACE)
        pop.geometry("860x560")
        pop.transient(self)

        tab_row = tk.Frame(pop, bg=SURFACE)
        tab_row.pack(fill="x", padx=12, pady=(12, 0))
        body = tk.Frame(pop, bg=SURFACE)
        body.pack(fill="both", expand=True, padx=12, pady=12)
        editor = tk.Text(
            body,
            bg="#121218",
            fg=TEXT,
            insertbackground=TEXT,
            relief="flat",
            wrap="none",
            font=("Consolas", 10),
            undo=True,
        )
        yscroll = ttk.Scrollbar(body, orient="vertical", command=editor.yview)
        xscroll = ttk.Scrollbar(body, orient="horizontal", command=editor.xview)
        editor.configure(yscrollcommand=yscroll.set, xscrollcommand=xscroll.set)
        editor.grid(row=0, column=0, sticky="nsew")
        yscroll.grid(row=0, column=1, sticky="ns")
        xscroll.grid(row=1, column=0, sticky="ew")
        body.grid_rowconfigure(0, weight=1)
        body.grid_columnconfigure(0, weight=1)

        editor.tag_configure("comment", foreground="#6fbf73")
        editor.tag_configure("keyword", foreground="#7eb8ff")
        editor.tag_configure("fail", foreground="#ff7b7b")
        editor.tag_configure("ok", foreground="#7ee0b0")
        editor.tag_configure("path", foreground="#e0c36e")
        editor.tag_configure("string", foreground="#d9a66c")

        state = {"index": 0, "texts": {}, "loaded": False}

        def read_log(path):
            if not os.path.isfile(path):
                return ""
            with open(path, "r", encoding="utf-8", errors="ignore") as handle:
                return handle.read()

        def highlight():
            editor.tag_remove("comment", "1.0", "end")
            editor.tag_remove("keyword", "1.0", "end")
            editor.tag_remove("fail", "1.0", "end")
            editor.tag_remove("ok", "1.0", "end")
            editor.tag_remove("path", "1.0", "end")
            editor.tag_remove("string", "1.0", "end")
            content = editor.get("1.0", "end-1c")
            patterns = (
                (r"#.*$", "comment"),
                (r'"[^"\n]*"', "string"),
                (r"'[^'\n]*'", "string"),
                (r"\[[^\]]+\]", "path"),
                (r"\b(Replacing|Appended|Restored|Backup created|Mod patching (?:started|complete)|Successful Mods)\b", "ok"),
                (r"\b(No match found|Failed|Error|Warning|Fails|missing)\b", "fail"),
                (r"\b(Replace|With|Add Boot|Add Javascript|Add Content|Patch|Log)\b", "keyword"),
            )
            for pattern, tag in patterns:
                for match in re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE):
                    start = f"1.0+{match.start()}c"
                    end = f"1.0+{match.end()}c"
                    editor.tag_add(tag, start, end)

        def show_tab(index):
            if state["loaded"]:
                state["texts"][state["index"]] = editor.get("1.0", "end-1c")
            state["loaded"] = True
            state["index"] = index
            editor.delete("1.0", "end")
            editor.insert("1.0", state["texts"].get(index, read_log(tabs[index][1])))
            highlight()
            for i, btn in enumerate(tab_buttons):
                btn.redraw(ACCENT if i == index else SURFACE3)

        def save_current():
            path = tabs[state["index"]][1]
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8", errors="ignore") as handle:
                handle.write(editor.get("1.0", "end-1c"))
            self.status.configure(text=f"Saved {os.path.basename(path)}")

        tab_buttons = []
        for i, (label, path) in enumerate(tabs):
            state["texts"][i] = read_log(path)
            btn = RoundedButton(tab_row, label, lambda idx=i: show_tab(idx), width=160, height=34, bg=SURFACE3, hover=SURFACE2)
            btn.pack(side="left", padx=(0, 6))
            tab_buttons.append(btn)

        editor.bind("<KeyRelease>", lambda e: highlight())

        btns = tk.Frame(pop, bg=SURFACE)
        btns.pack(pady=(0, 12))
        RoundedButton(btns, "Save log", save_current, width=110).pack(side="left", padx=6)
        RoundedButton(btns, "Close", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=6)

        show_tab(0)

    def show_conflicts(self):
        try:
            patcher = load_patcher()
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return
        groups = {}
        for filename in self.enabled_in_order():
            mod = self.find_mod(filename)
            path = mod["path"] if mod else os.path.join(self.mods_dir, filename)
            if not os.path.isfile(path):
                continue
            with open(path, "r", encoding="utf-8", errors="ignore") as handle:
                text = handle.read()
            for op in patcher.collect_replace_ops(text):
                key = (op["target"], op["old"])
                groups.setdefault(key, []).append(filename)
        conflicts = {key: files for key, files in groups.items() if len(files) > 1}
        pop = tk.Toplevel(self)
        pop.title("Conflicts")
        pop.configure(bg=SURFACE)
        pop.geometry("640x420")
        pop.transient(self)
        text = tk.Text(pop, bg=SURFACE2, fg=TEXT, insertbackground=TEXT, relief="flat", wrap="word", font=("Consolas", 9))
        text.pack(fill="both", expand=True, padx=12, pady=12)
        if not conflicts:
            text.insert("1.0", "No replace conflicts among enabled mods.\nAdd Boot and Add Javascript can share a file; that is not treated as a conflict.")
        else:
            lines = []
            for (target, old), files in conflicts.items():
                rel = os.path.relpath(target, self.root_dir)
                lines.append(f"{' + '.join(files)}")
                lines.append(f"  file: {rel}")
                preview = old.replace("\n", " ")[:160]
                lines.append(f"  replace: {preview}")
                lines.append("")
            text.insert("1.0", "\n".join(lines))
        text.configure(state="disabled")
        RoundedButton(pop, "Close", pop.destroy, width=90, bg=SURFACE3, hover=SURFACE2).pack(pady=(0, 12))


if __name__ == "__main__":
    KittyLoader().mainloop()
