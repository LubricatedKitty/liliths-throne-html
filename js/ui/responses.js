(function () {
  var COLS = 5;
  var ROWS = 3;
  var PAGE_SIZE = COLS * ROWS;
  var page = 0;
  var tab = 0;
  var currentResponses = [];
  var currentTabs = [];
  var HOTKEYS = ["1", "2", "3", "4", "5", "q", "w", "e", "r", "t", "a", "s", "d", "f", "g"];

  var pageFlip = null;

  function lookupResponse(index) {
    if (index === 0 && pageFlip) return pageFlip;
    if (!currentResponses) return null;
    var i;
    for (i = 0; i < currentResponses.length; i++) {
      if (currentResponses[i] && currentResponses[i]._index === index) return currentResponses[i];
    }
    return null;
  }

  function activateResponse(response) {
    if (!response || response.disabled) return;
    if (response._pageFlip) {
      var highest = 0;
      var n;
      for (n = 0; n < currentResponses.length; n++) {
        if (currentResponses[n] && currentResponses[n]._index > highest) highest = currentResponses[n]._index;
      }
      var pages = Math.max(1, Math.ceil(highest / PAGE_SIZE));
      page = (page + 1) % pages;
      LT.renderResponses();
      return;
    }
    LT.game.choose(response);
  }

  function makeBox(response, index, hotkey, id) {
    var box = document.createElement("div");
    box.className = "response-box";
    if (id) box.id = id;
    if (!response) {
      box.classList.add("empty");
      box.innerHTML = '<span class="hotkey-icon">' + hotkey + "</span>";
      return box;
    }
    if (response.disabled) box.classList.add("disabled");
    if (response.colour) box.style.color = response.colour;
    box.innerHTML =
      '<span class="hotkey-icon">' +
      hotkey +
      '</span><span class="response-label">' +
      response.title +
      "</span>";
    if (response.tooltipText) {
      LT.bindTooltip(box, function () {
        return response.tooltipText;
      });
    }
    if (!response.disabled) {
      box.addEventListener("click", function () {
        activateResponse(response);
      });
    }
    return box;
  }

  LT.setResponses = function (responses, tabs, selectedTab) {
    currentResponses = responses || [];
    currentTabs = tabs || [];
    page = 0;
    tab = selectedTab || 0;
    LT.renderResponses();
  };

  LT.renderResponses = function () {
    var tabRow = document.getElementById("response-tabs");
    var grid = document.getElementById("response-grid");
    var leftover = document.getElementById("response-0");
    if (!grid || !tabRow) return;

    tabRow.innerHTML = "";
    if (currentTabs.length > 1) {
      tabRow.hidden = false;
      for (var t = 0; t < currentTabs.length; t++) {
        (function (i) {
          var btn = document.createElement("div");
          btn.className = "response-box tab" + (i === tab ? " selected" : "");
          btn.textContent = currentTabs[i];
          btn.addEventListener("click", function () {
            tab = i;
            page = 0;
            if (LT.combat && LT.game && LT.game.currentNode && LT.game.currentNode.id === "combat.fight") {
              LT.combat.responseTab = i;
            }
            if (LT.sex && LT.game && LT.game.currentNode && LT.game.currentNode.id === "sex.scene") {
              LT.sex.responseTab = typeof LT.sexTabInternal === "function" ? LT.sexTabInternal(i) : i;
            }
            if (LT.game && LT.game.currentNode && LT.game.currentNode.getResponses) {
              var asked = tab;
              if (LT.game.currentNode.id === "sex.scene" && typeof LT.sexTabInternal === "function") asked = LT.sexTabInternal(i);
              var raw = LT.game.currentNode.getResponses(LT.game, asked) || [];
              currentResponses = [];
              for (var r = 0; r < raw.length; r++) {
                if (!raw[r]) continue;
                if (raw[r]._index == null) raw[r]._index = r;
                currentResponses.push(raw[r]);
              }
            }
            LT.renderResponses();
          });
          tabRow.appendChild(btn);
        })(t);
      }
    } else {
      tabRow.hidden = true;
    }

    grid.innerHTML = "";
    for (var i = 0; i < PAGE_SIZE; i++) {
      var index = page * PAGE_SIZE + i + 1;
      grid.appendChild(makeBox(lookupResponse(index), index, HOTKEYS[i]));
    }

    var extraRow = leftover ? leftover.parentElement : document.querySelector(".response-row-extra");
    if (extraRow) {
      extraRow.innerHTML = "";
      pageFlip = null;
      var zero = lookupResponse(0);
      var highest = 0;
      for (var n = 0; n < currentResponses.length; n++) {
        if (currentResponses[n] && currentResponses[n]._index > highest) highest = currentResponses[n]._index;
      }
      var pages = Math.max(1, Math.ceil(highest / PAGE_SIZE));
      if (!zero && pages > 1) {
        zero = new LT.Response(page + 1 < pages ? "Next page" : "First page", "Show more responses.", null, function () {});
        zero._index = 0;
        zero._pageFlip = true;
        pageFlip = zero;
      }
      extraRow.appendChild(makeBox(zero, 0, "0", "response-0"));
    }
  };

  LT.initResponseHotkeys = function () {
    document.addEventListener("keydown", function (e) {
      if (e.target.matches("input, textarea")) return;
      var key = e.key.toLowerCase();
      if (key === "0") {
        activateResponse(lookupResponse(0));
        return;
      }
      var i = HOTKEYS.indexOf(key);
      if (i >= 0) {
        var index = page * PAGE_SIZE + i + 1;
        activateResponse(lookupResponse(index));
      }
    });
  };
})();
