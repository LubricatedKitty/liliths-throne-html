(function () {
  function registerStubMenus() {
    var stubs = [];
    for (var i = 0; i < stubs.length; i++) {
      var el = document.querySelector('[data-ui="' + stubs[i][0] + '"] [data-node-content]');
      if (el && !el.innerHTML.trim()) el.innerHTML = '<p class="muted">' + stubs[i][1] + "</p>";
    }
  }

  function boot() {
    LT.initOpenUI();
    LT.registerAttributes();
    registerStubMenus();
    LT.initChromeButtons();
    LT.initResponseHotkeys();
    LT.initTimeListener();
    LT.bindCreationClicks();
    document.addEventListener("lt-content", function () {
      var inSex = !!(LT.sex && LT.sex.active);
      if (LT.game.renderAttributes || inSex) {
        LT.openUI("attributes", { target: "left" });
        LT.paintAttributes();
      }
      if (inSex) {
        LT.openUI("characters-present", { target: "right" });
        if (typeof LT.paintSexChrome === "function") LT.paintSexChrome();
        return;
      }
      if (LT.game.renderMap) {
        if (typeof declareGridVariables === "function") declareGridVariables();
        LT.openUI("map", { target: "left-map" });
        if (typeof renderGrid === "function") renderGrid();
        LT.openUI("characters-present", { target: "right" });
        if (typeof LT.paintCharactersPresent === "function") LT.paintCharactersPresent();
      }
    });
    function start() {
      LT.setChrome({ left: false, right: false });
      LT.game.setContent("boot.disclaimer");
    }
    if (typeof LT.refreshAppliedMods === "function") LT.refreshAppliedMods(start);
    else start();
  }

  window.openUI = LT.openUI;
  window.ltGame = LT.game;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
