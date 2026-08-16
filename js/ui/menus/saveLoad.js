(function () {
  var confirm = { overwrite: "", load: "", delete: "" };

  function fmtTime(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    var months = LT.MONTHS || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return (
      d.getDate() +
      " " +
      months[d.getMonth()].slice(0, 3) +
      " " +
      d.getFullYear() +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  function iconBtn(action, name, src, tip, extraClass) {
    return (
      '<button type="button" class="square-button saveIcon' +
      (extraClass ? " " + extraClass : "") +
      '" data-save-action="' +
      action +
      '" data-save-name="' +
      (name || "") +
      '" title="' +
      tip +
      '"><img src="' +
      src +
      '" alt="' +
      tip +
      '"></button>'
    );
  }

  function row(dateHtml, nameHtml, buttons, alt) {
    return (
      '<div class="save-row' +
      (alt ? " alt" : "") +
      '"><div class="save-time">' +
      dateHtml +
      '</div><div class="save-name">' +
      nameHtml +
      '</div><div class="save-actions">' +
      buttons +
      "</div></div>"
    );
  }

  function saveLoadHtml() {
    var started = !!(LT.game && LT.game.started && LT.game.player);
    var html =
      "<p style='text-align:center;'><b>Please Note:</b></p>" +
      "<p>1. Only letters, numbers, spaces, and dashes work in save names.<br/>" +
      "2. The <b>AutoSave</b> file is overwritten when you move between maps.<br/>" +
      "3. Saves are stored in this browser (<code>localStorage</code>). <b>Save to file</b> downloads a <code>.ltjson</code> you can keep or import later.</p>" +
      '<div class="save-row save-head"><div class="save-time">Time</div><div class="save-name">Name</div><div class="save-actions">Save | File | Load | Delete</div></div>';

    if (started) {
      html += row(
        "-",
        "<input type='text' id='new_save_name' value='New Save' maxlength='40'>",
        iconBtn("new", "", LT.uiIcon("diskSave.svg"), "Save") +
          iconBtn("export-current", "", LT.uiIcon("export.svg"), "Save to file", "export-file"),
        false,
      );
    }

    var saves = LT.listSaves();
    for (var i = 0; i < saves.length; i++) {
      var s = saves[i];
      var over = confirm.overwrite === s.name;
      var load = confirm.load === s.name;
      var del = confirm.delete === s.name;
      html += row(
        '<span class="muted">' + fmtTime(s.savedAt) + "</span>",
        s.name,
        iconBtn("overwrite", s.name, LT.uiIcon("diskSave.svg"), over ? "Click again to overwrite" : "Overwrite", over ? "confirm" : "") +
          iconBtn("export", s.name, LT.uiIcon("export.svg"), "Save to file", "export-file") +
          iconBtn("load", s.name, LT.uiIcon("diskLoad.svg"), load ? "Click again to load" : "Load", load ? "confirm" : "") +
          iconBtn("delete", s.name, LT.uiIcon("diskDelete.svg"), del ? "Click again to delete" : "Delete", del ? "confirm" : ""),
        i % 2 === 0,
      );
    }
    if (!saves.length && !started) {
      html += "<p class='muted' style='text-align:center;'>No saved games yet.</p>";
    }
    return html;
  }

  function refresh() {
    LT.game.setContent("boot.save-load");
  }

  LT.openSaveLoad = function () {
    if (typeof LT.rememberReturn === "function") LT.rememberReturn();
    confirm = { overwrite: "", load: "", delete: "" };
    LT.game.setContent("boot.save-load");
  };

  function onAction(action, name) {
    if (action === "new") {
      var input = document.getElementById("new_save_name");
      var n = (input && input.value) || "New Save";
      if (LT.readSave(n) && confirm.overwrite !== n) {
        confirm = { overwrite: n, load: "", delete: "" };
        refresh();
        return;
      }
      LT.saveGame(n);
      confirm = { overwrite: "", load: "", delete: "" };
      refresh();
      return;
    }
    if (action === "export-current") {
      var input2 = document.getElementById("new_save_name");
      LT.exportSave((input2 && input2.value) || "export");
      return;
    }
    if (action === "export") {
      LT.exportSave(name);
      return;
    }
    if (action === "overwrite") {
      if (confirm.overwrite !== name) {
        confirm = { overwrite: name, load: "", delete: "" };
        refresh();
        return;
      }
      LT.saveGame(name);
      confirm = { overwrite: "", load: "", delete: "" };
      refresh();
      return;
    }
    if (action === "load") {
      if (confirm.load !== name) {
        confirm = { overwrite: "", load: name, delete: "" };
        refresh();
        return;
      }
      confirm = { overwrite: "", load: "", delete: "" };
      LT.game.returnNode = null;
      LT.loadGame(name);
      return;
    }
    if (action === "delete") {
      if (confirm.delete !== name) {
        confirm = { overwrite: "", load: "", delete: name };
        refresh();
        return;
      }
      LT.deleteSave(name);
      confirm = { overwrite: "", load: "", delete: "" };
      refresh();
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-save-action]");
    if (!btn) return;
    if (!LT.game.currentNode || LT.game.currentNode.id !== "boot.save-load") return;
    onAction(btn.getAttribute("data-save-action"), btn.getAttribute("data-save-name"));
  });

  LT.defineNode({
    id: "boot.save-load",
    ui: "options",
    title: "Save game files",
    chrome: { left: false, right: false },
    getHeaderContent: saveLoadHtml,
    getContent: function () {
      return "";
    },
    getResponses: function () {
      var dest = LT.game.returnNode || "boot.menu";
      return [
        new LT.Response("Back", "Return.", dest, function () {
          LT.game.returnNode = null;
        }),
        new LT.Response("Import file", "Load a .ltjson save from disk into a new browser slot.", null, function () {
          var input = document.getElementById("lt-import-file");
          if (!input) {
            input = document.createElement("input");
            input.type = "file";
            input.id = "lt-import-file";
            input.accept = ".ltjson,application/json";
            input.hidden = true;
            input.addEventListener("change", function () {
              if (!input.files || !input.files[0]) return;
              LT.importSave(input.files[0], function () {
                refresh();
              });
              input.value = "";
            });
            document.body.appendChild(input);
          }
          input.click();
        }),
      ];
    },
  });
})();
