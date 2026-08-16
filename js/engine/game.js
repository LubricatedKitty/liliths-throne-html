(function () {
  function Game() {
    this.started = false;
    this.currentNode = null;
    this.secondsPassed = 20 * 3600 + 34 * 60;
    this.startingYear = 2019;
    this.startingMonth = 9;
    this.startingDay = 1;
    this.player = null;
    this.npcs = {};
    this.flags = {};
    this.renderAttributes = false;
    this.renderMap = false;
    this.textStart = "";
    this.textEnd = "";
  }

  Game.prototype.setContent = function (node) {
    if (!node) return;
    if (typeof node === "string") node = LT.getNode(node);
    this.currentNode = node;
    if (node.applyPreParsingEffects) node.applyPreParsingEffects(this);
    if (this.flags && this.flags.redirectNode) {
      var redirect = this.flags.redirectNode;
      delete this.flags.redirectNode;
      return this.setContent(redirect);
    }

    var ui = node.ui || "dialogue";
    var title = typeof node.title === "function" ? node.title(this) : node.title;
    LT.setTitle(title || "");
    LT.setChrome({
      left: node.chrome && node.chrome.left != null ? node.chrome.left : this.renderAttributes,
      right: node.chrome && node.chrome.right != null ? node.chrome.right : this.renderMap,
    });
    var app = document.getElementById("app");
    if (app) {
      if (node.travelDisabled) app.classList.add("travel-disabled");
      else app.classList.remove("travel-disabled");
    }
    LT.openUI(ui, { node: node, game: this });

    var contentEl = document.querySelector('[data-ui="' + ui + '"] .dialogue-text, [data-ui="' + ui + '"] [data-node-content]');
    if (contentEl) {
      var body = typeof node.getContent === "function" ? node.getContent(this) : node.content || "";
      var header = typeof node.getHeaderContent === "function" ? node.getHeaderContent(this) : "";
      contentEl.innerHTML = this.textStart + header + body + this.textEnd;
    }

    var tabIndex = 0;
    if (node.id === "combat.fight" && LT.combat && LT.combat.responseTab) tabIndex = LT.combat.responseTab;
    if (node.id === "sex.scene" && LT.sex && LT.sex.responseTab) tabIndex = LT.sex.responseTab;
    var raw = node.getResponses ? node.getResponses(this, tabIndex) : node.responses || [];
    this._responseTab = tabIndex;
    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      if (!r) continue;
      if (r._index == null) r._index = i;
      list.push(r);
    }
    LT.setResponses(list, node.tabs || [], tabIndex);
    this.textStart = "";
    this.textEnd = "";

    document.dispatchEvent(new CustomEvent("lt-content", { detail: { node: node, game: this } }));
  };

  Game.prototype.choose = function (response) {
    if (!response || response.disabled) return;
    if (response.secondsPassed != null) this.advanceTime(response.secondsPassed);
    else if (this.currentNode && this.currentNode.secondsPassed) this.advanceTime(this.currentNode.secondsPassed);
    if (response.effects) response.effects(this);
    if (response.nextDialogue) this.setContent(response.nextDialogue);
  };

  Game.prototype.advanceTime = function (seconds) {
    this.secondsPassed += seconds;
    if (typeof LT.tickWeather === "function") LT.tickWeather(seconds);
    if (typeof LT.tickSlavery === "function") LT.tickSlavery(seconds);
    if (typeof LT.tickWorldStatusEffects === "function" && this.player) LT.tickWorldStatusEffects(this.player, seconds);
    document.dispatchEvent(new CustomEvent("lt-time", { detail: { seconds: this.secondsPassed } }));
  };

  Object.defineProperty(Game.prototype, "clock", {
    get: function () {
      var s = ((this.secondsPassed % 86400) + 86400) % 86400;
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    },
  });

  Game.prototype.flag = function (name) {
    return !!this.flags[name];
  };

  Game.prototype.setFlag = function (name, on) {
    if (on === undefined) on = true;
    if (on) this.flags[name] = true;
    else delete this.flags[name];
  };

  LT.waitUntilHour = function (hour) {
    var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
    var target = ((hour % 24) + 24) % 24 * 3600;
    var delta = target - s;
    if (delta <= 0) delta += 86400;
    LT.game.advanceTime(delta);
  };

  LT.game = new Game();

  LT.STARTING_MONEY = 5000;
  LT.SLAVER_LICENSE_COST = 5000;

  function ordinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + "th";
    if (v % 10 === 1) return n + "st";
    if (v % 10 === 2) return n + "nd";
    if (v % 10 === 3) return n + "rd";
    return n + "th";
  }

  LT.gameNow = function () {
    var y = LT.game && LT.game.startingYear != null ? LT.game.startingYear : 2019;
    var month = LT.game && LT.game.startingMonth != null ? LT.game.startingMonth : 9;
    var day = LT.game && LT.game.startingDay != null ? LT.game.startingDay : 1;
    var dt = new Date(y, month, day, 0, 0, 0, 0);
    dt.setSeconds(dt.getSeconds() + ((LT.game && LT.game.secondsPassed) || 0));
    return dt;
  };

  LT.dayNumber = function () {
    return Math.floor(((LT.game && LT.game.secondsPassed) || 0) / 86400) + 1;
  };

  LT.formatGameDate = function () {
    var dt = LT.gameNow();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return days[dt.getDay()] + ", " + ordinal(dt.getDate()) + " " + months[dt.getMonth()] + " " + dt.getFullYear();
  };

  LT.isDayTime = function () {
    var h = typeof LT.hourOfDay === "function" ? LT.hourOfDay() : 12;
    return h >= 6 && h < 21;
  };

  LT.getMoney = function () {
    return (LT.game.player && LT.game.player.money) || 0;
  };

  LT.incrementMoney = function (delta) {
    var p = LT.game.player;
    if (!p) return "";
    p.money = Math.max(0, (p.money || 0) + delta);
    if (!delta) return "";
    var colour = delta > 0 ? LT.Colour.GENERIC_GOOD : LT.Colour.GENERIC_BAD;
    var verb = delta > 0 ? "gained" : "lost";
    return (
      "<p style='text-align:center;'>You have <b style='color:" +
      colour +
      ";'>" +
      verb +
      " " +
      Math.abs(delta) +
      "</b> <b style='color:" +
      LT.Colour.MONEY +
      ";'>flames</b>!</p>"
    );
  };

  LT.scarlettPrice = function () {
    if (LT.game.flags && LT.game.flags.scarlettPrice) return LT.game.flags.scarlettPrice;
    return LT.game.flags && LT.game.flags.punishedByHelena ? 10000 : 15000;
  };

  var SIDE_SLAVERY_NAMES = {
    SIDE_SLAVER_NEED_RECOMMENDATION: "Letter of recommendation",
    SIDE_SLAVER_RECOMMENDATION_OBTAINED: "Present letter",
  };

  LT.startSlaveryQuest = function () {
    LT.game.flags.slaveryQuest = "SIDE_SLAVER_NEED_RECOMMENDATION";
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>New Quest - Slaver</b><br/><b>New Task - Letter of recommendation</b></p>"
    );
  };

  LT.advanceSlaveryQuest = function (nextId) {
    var prev = LT.game.flags.slaveryQuest;
    LT.game.flags.slaveryQuest = nextId;
    if (nextId === "complete") {
      return (
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>Quest - Slaver</b><br/><b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>Task Completed</b><b> - " +
        (SIDE_SLAVERY_NAMES[prev] || prev) +
        "</b><br/><b>All Tasks Completed!</b></p>"
      );
    }
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>Quest - Slaver</b><br/><b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>Task Completed - " +
      (SIDE_SLAVERY_NAMES[prev] || prev) +
      "</b><br/><b>New Task - " +
      (SIDE_SLAVERY_NAMES[nextId] || nextId) +
      "</b></p>"
    );
  };
})();
