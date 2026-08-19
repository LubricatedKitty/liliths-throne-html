(function () {
  var LEFT = [
    { id: "menu", icon: "menu.svg", tip: "Main Menu", action: function () {
      if (typeof LT.rememberReturn === "function") LT.rememberReturn();
      LT.game.setContent("boot.menu");
    } },
    { id: "journal", icon: "journal.svg", tip: "Phone / Journal", action: function () { LT.openPhone(); } },
    { id: "inventory", icon: "inventory.svg", tip: "Inventory", action: function () { LT.openInventory(); } },
    { id: "characters", icon: "people.svg", tip: "Characters present", action: function () {
      if (typeof LT.openCharactersPresent === "function") LT.openCharactersPresent();
      else LT.openUI("characters-present");
    } },
    { id: "copy", icon: "copy.svg", tip: "Copy dialogue", action: copyDialogue },
  ];

  var RIGHT = [
    { id: "zoom", icon: "zoomOut.svg", tip: "Zoom map", action: function () { if (typeof cycleGridZoom === "function") cycleGridZoom(); } },
    { id: "north", label: "N", tip: "Move north", dir: "N" },
    { id: "west", label: "W", tip: "Move west", dir: "W" },
    { id: "south", label: "S", tip: "Move south", dir: "S" },
    { id: "east", label: "E", tip: "Move east", dir: "E" },
  ];

  function copyDialogue() {
    var stage = document.getElementById("ui-stage");
    var visible = stage ? stage.querySelector("[data-ui]:not([hidden])") : null;
    var text = visible ? visible.innerText : "";
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
  }

  function makeBtn(spec) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chrome-btn";
    btn.setAttribute("data-chrome", spec.id);
    if (spec.icon) {
      var img = document.createElement("img");
      img.src = LT.uiIcon(spec.icon);
      img.alt = spec.tip;
      btn.appendChild(img);
    } else {
      btn.textContent = spec.label;
    }
    LT.bindTooltip(btn, spec.tip);
    btn.addEventListener("click", function () {
      if (spec.dir) {
        document.dispatchEvent(new CustomEvent("lt-move", { detail: { dir: spec.dir } }));
        return;
      }
      if (spec.action) spec.action();
    });
    return btn;
  }

  LT.initChromeButtons = function () {
    var left = document.getElementById("left-buttons");
    var right = document.getElementById("right-buttons");
    left.innerHTML = "";
    right.innerHTML = "";
    for (var i = 0; i < LEFT.length; i++) left.appendChild(makeBtn(LEFT[i]));
    for (var j = 0; j < RIGHT.length; j++) right.appendChild(makeBtn(RIGHT[j]));
  };
})();
