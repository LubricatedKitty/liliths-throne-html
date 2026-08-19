"""Tk GUI for KittyGridPatcher layouts.

KittyLoader-matched dark rounded chrome. Full Lifebound generator options.
Layout only: click tiles to toggle walkable, then save JSON.
"""
from __future__ import annotations

import json
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

from KittyGridPatcher import (
    OFFICIAL_TILE,
    STYLES,
    generate_mask,
    mask_to_tiles,
)

BG = "#141418"
SURFACE = "#1e1e26"
SURFACE2 = "#282832"
SURFACE3 = "#32323e"
TEXT = "#f2f2f6"
MUTED = "#9b9ba8"
ACCENT = "#d46072"
ACCENT_HOVER = "#e27888"
BORDER = "#3d3d4a"

CELL = 18
STYLE_LABELS = (
    ("better_rooms", "Better Rooms"),
    ("corridors", "Corridors Only (DFS)"),
    ("thick_corridors", "Thick Corridors"),
    ("continent", "Continent"),
    ("corridors_rooms", "Corridors & Rooms (DFS + Rooms)"),
    ("cellular", "Cellular Automata Cave"),
    ("drunkards", "Drunkard's Walk"),
)


def widget_bg(parent: tk.Misc) -> str:
    try:
        return str(parent.cget("bg"))
    except Exception:
        return BG


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


class KittyGridTool(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Kitty Grid Tool")
        self.minsize(900, 620)
        self.configure(bg=BG)
        self.size = tk.IntVar(value=21)
        self.prune = tk.IntVar(value=2)
        self.seed = tk.IntVar(value=0)
        self.last_seed = tk.StringVar(value="—")
        self.style = tk.StringVar(value="better_rooms")
        self.symmetrical = tk.BooleanVar(value=True)
        self.center_line = tk.BooleanVar(value=True)
        self.mask = [[0]]
        self._style()
        self._build()
        self.generate()

    def _style(self) -> None:
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(".", background=BG, foreground=TEXT, fieldbackground=SURFACE2, bordercolor=BORDER)
        style.configure("TFrame", background=BG)
        style.configure("TLabel", background=BG, foreground=TEXT, font=("Segoe UI", 10))
        style.configure("Muted.TLabel", background=BG, foreground=MUTED, font=("Segoe UI", 9))
        style.configure("Header.TLabel", background=BG, foreground=TEXT, font=("Segoe UI Semibold", 16))
        style.configure("TCombobox", fieldbackground=SURFACE2, background=SURFACE2, foreground=TEXT, arrowcolor=TEXT)
        style.map("TCombobox", fieldbackground=[("readonly", SURFACE2)], foreground=[("readonly", TEXT)])
        style.configure("TCheckbutton", background=BG, foreground=TEXT, font=("Segoe UI", 10))
        style.configure("TSpinbox", fieldbackground=SURFACE2, foreground=TEXT, arrowcolor=TEXT)
        style.configure("Vertical.TScrollbar", background=SURFACE3, troughcolor=SURFACE, bordercolor=BORDER, arrowcolor=TEXT)

    def _build(self) -> None:
        pad = ttk.Frame(self)
        pad.pack(fill="both", expand=True, padx=18, pady=16)

        ttk.Label(pad, text="Kitty Grid Tool", style="Header.TLabel").pack(anchor="w")
        ttk.Label(
            pad,
            text="Lifebound generator options. Layout only. Official walkable colour is #bbbbbb.",
            style="Muted.TLabel",
        ).pack(anchor="w", pady=(0, 12))

        bar = ttk.Frame(pad)
        bar.pack(fill="x", pady=(0, 8))

        ttk.Label(bar, text="Size").pack(side="left")
        ttk.Spinbox(bar, from_=5, to=25, width=4, textvariable=self.size).pack(side="left", padx=(4, 10))

        ttk.Label(bar, text="Style").pack(side="left")
        ttk.Combobox(
            bar,
            values=[label for _, label in STYLE_LABELS],
            textvariable=self.style_label,
            width=28,
            state="readonly",
        ).pack(side="left", padx=(4, 10))

        ttk.Label(bar, text="Pruner").pack(side="left")
        ttk.Spinbox(bar, from_=0, to=12, width=4, textvariable=self.prune).pack(side="left", padx=(4, 10))

        seed_lab = ttk.Label(bar, text="Seed")
        seed_lab.pack(side="left")
        seed_box = ttk.Spinbox(bar, from_=0, to=999999999, width=10, textvariable=self.seed)
        seed_box.pack(side="left", padx=(4, 6))
        self._tip(
            seed_lab,
            "0 (default) picks a new random seed each Generate. Set a number to repeat a layout.",
        )
        self._tip(
            seed_box,
            "0 (default) picks a new random seed each Generate. Set a number to repeat a layout.",
        )

        ttk.Label(bar, textvariable=self.last_seed, style="Muted.TLabel").pack(side="left", padx=(0, 10))

        checks = ttk.Frame(pad)
        checks.pack(fill="x", pady=(0, 10))
        ttk.Checkbutton(checks, text="Symmetrical generation", variable=self.symmetrical).pack(side="left", padx=(0, 16))
        ttk.Checkbutton(checks, text="Center line (better rooms)", variable=self.center_line).pack(side="left")

        btns = tk.Frame(pad, bg=BG)
        btns.pack(fill="x", pady=(0, 10))
        RoundedButton(btns, "Generate", self.generate, width=110).pack(side="left", padx=3)
        RoundedButton(btns, "Clear", self.clear, width=84, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=3)
        RoundedButton(btns, "Save JSON", self.save, width=110, bg=SURFACE3, hover=SURFACE2).pack(side="left", padx=3)

        wrap = tk.Frame(pad, bg=BORDER)
        wrap.pack(fill="both", expand=True)
        inner = tk.Frame(wrap, bg=SURFACE)
        inner.pack(fill="both", expand=True, padx=1, pady=1)
        self.canvas = tk.Canvas(inner, background=SURFACE, highlightthickness=0)
        self.canvas.pack(fill="both", expand=True)
        self.canvas.bind("<Button-1>", self.on_click)

    @property
    def style_label(self) -> tk.StringVar:
        if not hasattr(self, "_style_label"):
            self._style_label = tk.StringVar(value="Better Rooms")
        return self._style_label

    def _style_key(self) -> str:
        label = self.style_label.get()
        for key, text in STYLE_LABELS:
            if text == label:
                return key
        return "better_rooms"

    def _tip(self, widget: tk.Misc, text: str) -> None:
        tip = tk.Toplevel(self)
        tip.withdraw()
        tip.overrideredirect(True)
        lab = tk.Label(tip, text=text, bg=SURFACE3, fg=TEXT, font=("Segoe UI", 9), padx=8, pady=6, wraplength=280, justify="left")
        lab.pack()

        def show(_e=None):
            tip.deiconify()
            tip.geometry("+%d+%d" % (widget.winfo_rootx() + 12, widget.winfo_rooty() + 28))

        def hide(_e=None):
            tip.withdraw()

        widget.bind("<Enter>", show)
        widget.bind("<Leave>", hide)

    def generate(self) -> None:
        mask, used = generate_mask(
            int(self.size.get()),
            self._style_key(),
            int(self.prune.get()),
            symmetrical=bool(self.symmetrical.get()),
            center_line=bool(self.center_line.get()),
            seed=int(self.seed.get()),
        )
        self.mask = mask
        self.last_seed.set("used seed %s" % used)
        self.redraw()

    def clear(self) -> None:
        n = int(self.size.get())
        self.mask = [[0 for _ in range(n)] for _ in range(n)]
        self.last_seed.set("cleared")
        self.redraw()

    def redraw(self) -> None:
        self.canvas.delete("all")
        n = len(self.mask)
        pad = 10
        for y, row in enumerate(self.mask):
            for x, val in enumerate(row):
                x0 = pad + x * CELL
                y0 = pad + y * CELL
                fill = OFFICIAL_TILE if val else SURFACE2
                outline = BORDER if val else "#111118"
                self.canvas.create_rectangle(x0, y0, x0 + CELL - 1, y0 + CELL - 1, fill=fill, outline=outline)
        self.canvas.config(scrollregion=(0, 0, pad * 2 + n * CELL, pad * 2 + n * CELL))

    def on_click(self, event: tk.Event) -> None:
        x = (event.x - 10) // CELL
        y = (event.y - 10) // CELL
        if y < 0 or x < 0 or y >= len(self.mask) or x >= len(self.mask[0]):
            return
        self.mask[y][x] = 0 if self.mask[y][x] else 1
        self.redraw()

    def save(self) -> None:
        path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON", "*.json")],
            title="Save walkable tiles",
        )
        if not path:
            return
        tiles = mask_to_tiles(self.mask)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(tiles, fh, indent=2)
        messagebox.showinfo("Saved", "Wrote %d walkable tiles." % len(tiles))


if __name__ == "__main__":
    KittyGridTool().mainloop()
