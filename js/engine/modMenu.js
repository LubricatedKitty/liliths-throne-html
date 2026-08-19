(function () {
  var menus = [];

  function byId(id) {
    var i;
    for (i = 0; i < menus.length; i++) {
      if (menus[i] && menus[i].id === id) return menus[i];
    }
    return null;
  }

  LT.listModMenus = function () {
    return menus.slice();
  };

  LT.getModMenu = function (id) {
    return byId(id);
  };

  LT.registerModMenu = function (spec) {
    if (!spec || !spec.id) {
      console.error("registerModMenu: id is required");
      return null;
    }
    var existing = byId(spec.id);
    var entry = existing || { id: spec.id };
    entry.name = spec.name || entry.name || spec.id;
    entry.author = spec.author != null ? spec.author : entry.author || "";
    entry.description = spec.description != null ? spec.description : entry.description || "";
    if (spec.getHtml) entry.getHtml = spec.getHtml;
    if (spec.onBind) entry.onBind = spec.onBind;
    if (spec.onAct) entry.onAct = spec.onAct;
    if (!existing) menus.push(entry);
    return entry;
  };

  LT.injectModMenuHtml = function (id, htmlOrFn) {
    var entry = byId(id) || LT.registerModMenu({ id: id, name: id });
    entry.getHtml = typeof htmlOrFn === "function" ? htmlOrFn : function () {
      return htmlOrFn || "";
    };
    return entry;
  };

  LT.openModMenu = function (returnNode) {
    if (LT.game && LT.game.flags) LT.game.flags.modMenuReturn = returnNode || "boot.menu";
    if (typeof LT.game.setContent === "function") LT.game.setContent("boot.mod-menu");
  };

  LT.openModMenuPage = function (id, returnNode) {
    if (LT.game && LT.game.flags) {
      LT.game.flags.modMenuId = id;
      if (returnNode) LT.game.flags.modMenuReturn = returnNode;
    }
    if (typeof LT.game.setContent === "function") LT.game.setContent("boot.mod-config");
  };

  var walkListeners = [];

  LT.onWalk = function (fn) {
    if (typeof fn === "function") walkListeners.push(fn);
    return fn;
  };

  LT.emitWalk = function (tile, gridRef) {
    var i;
    for (i = 0; i < walkListeners.length; i++) {
      try {
        walkListeners[i](tile, gridRef);
      } catch (e) {
        console.error("onWalk listener failed", e);
      }
    }
  };

  LT.afterSetContent = function (contentEl, node) {
    if (!contentEl) return;
    var hosts = contentEl.querySelectorAll("[data-mod-menu]");
    var i;
    for (i = 0; i < hosts.length; i++) {
      var id = hosts[i].getAttribute("data-mod-menu");
      var spec = byId(id);
      if (spec && typeof spec.onBind === "function") {
        try {
          spec.onBind(hosts[i], spec);
        } catch (e) {
          console.error("mod menu onBind failed", id, e);
        }
      }
    }
  };

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest && e.target.closest("[data-mod-act]");
    if (!btn) return;
    var host = btn.closest("[data-mod-menu]");
    var id = (host && host.getAttribute("data-mod-menu")) || (LT.game.flags && LT.game.flags.modMenuId);
    var spec = byId(id);
    if (!spec || typeof spec.onAct !== "function") return;
    if (spec.onAct(btn.getAttribute("data-mod-act"), btn, spec) && LT.game && LT.game.currentNode) {
      LT.game.setContent(LT.game.currentNode);
    }
  });
})();
