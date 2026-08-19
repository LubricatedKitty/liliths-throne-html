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
    this.discoveredTiles = {};
    this.textStart = "";
    this.textEnd = "";
  }

  Game.prototype.setContent = function (node) {
    if (!node) return;
    if (typeof node === "string") {
      var requested = node;
      if (typeof LT.hasNode === "function" && !LT.hasNode(requested)) {
        console.warn("Unknown dialogue node:", requested);
        var appMissing = document.getElementById("app");
        if (appMissing) appMissing.classList.remove("travel-disabled");
        this.textStart =
          (this.textStart || "") +
          "<p>You can't go that way just yet. Whatever was supposed to be here isn't available, so you stay where you are.</p>";
        if (this.currentNode && this.currentNode.id && this.currentNode.id !== requested) {
          return this.setContent(this.currentNode);
        }
        if (LT.hasNode("place.generic")) return this.setContent("place.generic");
        return;
      }
      node = LT.getNode(requested);
    }
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
      var locked = node.travelDisabled;
      if (typeof locked === "function") locked = locked();
      if (locked) app.classList.add("travel-disabled");
      else app.classList.remove("travel-disabled");
    }
    LT.openUI(ui, { node: node, game: this });

    var contentEl = document.querySelector('[data-ui="' + ui + '"] .dialogue-text, [data-ui="' + ui + '"] [data-node-content]');
    if (contentEl) {
      var body = typeof node.getContent === "function" ? node.getContent(this) : node.content || "";
      var header = typeof node.getHeaderContent === "function" ? node.getHeaderContent(this) : "";
      contentEl.innerHTML = this.textStart + header + body + this.textEnd;
      if (typeof LT.bindDeclaredTooltips === "function") LT.bindDeclaredTooltips(contentEl);
      if (typeof LT.afterSetContent === "function") LT.afterSetContent(contentEl, node);
    }

    var tabIndex = 0;
    if (node.id === "combat.fight" && LT.combat && LT.combat.responseTab) tabIndex = LT.combat.responseTab;
    if (node.id === "sex.scene" && LT.sex && LT.sex.responseTab != null) tabIndex = LT.sex.responseTab;
    var raw = node.getResponses ? node.getResponses(this, tabIndex) : node.responses || [];
    this._responseTab = tabIndex;
    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      if (!r) continue;
      if (r._index == null) r._index = i;
      list.push(r);
    }
    var tabs = node.tabs || [];
    if (typeof tabs === "function") tabs = tabs() || [];
    var selectedTab = tabIndex;
    if (node.id === "sex.scene" && typeof LT.sexTabVisual === "function") selectedTab = LT.sexTabVisual(tabIndex);
    LT.setResponses(list, tabs, selectedTab);
    this.textStart = "";
    this.textEnd = "";

    document.dispatchEvent(new CustomEvent("lt-content", { detail: { node: node, game: this } }));
  };

  Game.prototype.choose = function (response) {
    if (!response || response.disabled) return;
    if (response.secondsPassed != null) this.advanceTime(response.secondsPassed);
    else if (this.currentNode && this.currentNode.secondsPassed != null) {
      var secs = this.currentNode.secondsPassed;
      if (typeof secs === "function") secs = secs();
      if (secs) this.advanceTime(secs);
    }
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

  LT.incrementAffection = function (npc, amount) {
    if (!npc) return "";
    npc.affection = Math.max(-100, Math.min(100, (npc.affection || 0) + amount));
    var name = npc.getName ? npc.getName() : npc.name || "They";
    var verb = amount >= 0 ? "likes you more" : "likes you less";
    return "<p style='text-align:center;'><i>" + name + " " + verb + ".</i></p>";
  };

  LT.isAbleToFly = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch) return false;
    var race = ((ch.getRaceName && ch.getRaceName()) || ch.raceName || "").toLowerCase();
    if (race.indexOf("harpy") >= 0) return true;
    var wing = ch.body && ch.body.wing;
    if (wing && wing.type && wing.type !== "NONE") return true;
    return false;
  };

  LT.isAbleToFlyFromExtraParts = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch) return false;
    var wing = ch.body && ch.body.wing;
    return !!(wing && wing.type && wing.type !== "NONE");
  };

  LT.isPartyAbleToFly = function () {
    return !!(LT.isAbleToFly && LT.isAbleToFly());
  };

  LT.minutesUntilTime = function (targetMinutes) {
    var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
    var now = Math.floor(s / 60);
    var diff = targetMinutes - now;
    if (diff < 0) diff += 1440;
    return diff;
  };

  LT.dayMinutes = function () {
    var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
    return Math.floor(s / 60);
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

  var HARPY_QUEST_ORDER = [
    "HARPY_PACIFICATION_ONE",
    "HARPY_PACIFICATION_TWO",
    "HARPY_PACIFICATION_THREE",
    "HARPY_PACIFICATION_REWARD",
  ];
  var HARPY_QUEST_NAMES = {
    HARPY_PACIFICATION_ONE: "Nests in chaos",
    HARPY_PACIFICATION_TWO: "One down, two to go",
    HARPY_PACIFICATION_THREE: "One matriarch left",
    HARPY_PACIFICATION_REWARD: "Harpy queen",
  };
  var HARPY_QUEST_XP = {
    HARPY_PACIFICATION_ONE: 25,
    HARPY_PACIFICATION_TWO: 25,
    HARPY_PACIFICATION_THREE: 25,
    HARPY_PACIFICATION_REWARD: 50,
  };

  var HELENA_ROMANCE_NAMES = {
    ROMANCE_HELENA_1_OFFER_HELP: "Offer to help",
    ROMANCE_HELENA_2_PURCHASE_PAINT: "Purchase Paint",
    ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR: "Exterior Decorator (1/3)",
    ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR: "Exterior Decorator (2/3)",
    ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR: "Exterior Decorator (3/3)",
    ROMANCE_HELENA_4_SCARLETTS_RETURN: "Scarlett's Return",
    ROMANCE_HELENA_5_SCARLETT_TRAINER: "Harpy Helper",
    ROMANCE_HELENA_6_ADVERTISING: "Advertising",
    ROMANCE_HELENA_7_GRAND_OPENING_PREPARATION: "Preparing for the Grand Opening",
    ROMANCE_HELENA_8_FINISH: "Preparing Drinks",
  };
  var HELENA_ROMANCE_XP = {
    ROMANCE_HELENA_1_OFFER_HELP: 5,
    ROMANCE_HELENA_2_PURCHASE_PAINT: 25,
    ROMANCE_HELENA_3_A_EXTERIOR_DECORATOR: 10,
    ROMANCE_HELENA_3_B_EXTERIOR_DECORATOR: 10,
    ROMANCE_HELENA_3_C_EXTERIOR_DECORATOR: 10,
    ROMANCE_HELENA_4_SCARLETTS_RETURN: 100,
    ROMANCE_HELENA_5_SCARLETT_TRAINER: 5,
    ROMANCE_HELENA_6_ADVERTISING: 15,
    ROMANCE_HELENA_7_GRAND_OPENING_PREPARATION: 15,
    ROMANCE_HELENA_8_FINISH: 100,
  };

  LT.startHelenaRomance = function () {
    LT.game.flags.helenaRomance = "ROMANCE_HELENA_1_OFFER_HELP";
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>New Quest - Her Highness's Helper</b><br/><b>New Task - Offer to help</b></p>"
    );
  };

  LT.advanceHelenaRomance = function (nextId) {
    var prev = LT.game.flags.helenaRomance;
    LT.game.flags.helenaRomance = nextId;
    var html;
    if (nextId === "complete") {
      html =
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>Quest - Her Highness's Helper</b><br/><b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>Task Completed</b><b> - " +
        (HELENA_ROMANCE_NAMES[prev] || prev) +
        "</b><br/><b>All Tasks Completed!</b></p>";
    } else if (nextId === "failed") {
      LT.game.flags.helenaRomance = "failed";
      html =
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_BAD +
        ";'>Quest Failed - Her Highness's Helper</b></p>";
    } else {
      html =
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>Quest - Her Highness's Helper</b><br/><b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>Task Completed - " +
        (HELENA_ROMANCE_NAMES[prev] || prev) +
        "</b><br/><b>New Task - " +
        (HELENA_ROMANCE_NAMES[nextId] || nextId) +
        "</b></p>";
    }
    var xp = HELENA_ROMANCE_XP[prev];
    if (xp && typeof LT.gainXp === "function") html += LT.gainXp(LT.game.player, xp);
    return html;
  };

  LT.startHarpyQuest = function () {
    LT.game.flags.harpyQuest = "HARPY_PACIFICATION_ONE";
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>New Quest - Angry Harpies</b><br/><b>New Task - Nests in chaos</b></p>"
    );
  };

  LT.advanceHarpyQuest = function (nextId) {
    var prev = LT.game.flags.harpyQuest;
    LT.game.flags.harpyQuest = nextId;
    var html;
    if (nextId === "complete") {
      LT.game.flags.harpyPacified = true;
      html =
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>Quest - Angry Harpies</b><br/><b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>Task Completed</b><b> - " +
        (HARPY_QUEST_NAMES[prev] || prev) +
        "</b><br/><b>All Tasks Completed!</b></p>";
    } else {
      html =
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_ARCANE +
        ";'>Quest - Angry Harpies</b><br/><b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>Task Completed - " +
        (HARPY_QUEST_NAMES[prev] || prev) +
        "</b><br/><b>New Task - " +
        (HARPY_QUEST_NAMES[nextId] || nextId) +
        "</b></p>";
    }
    if (typeof LT.incrementExperience === "function" && HARPY_QUEST_XP[prev]) {
      html += LT.incrementExperience(HARPY_QUEST_XP[prev]);
    }
    return html;
  };

  LT.pacifyHarpyNest = function (flag) {
    LT.game.flags[flag] = true;
    var cur = LT.game.flags.harpyQuest;
    var i = HARPY_QUEST_ORDER.indexOf(cur);
    if (i === 0) return LT.advanceHarpyQuest("HARPY_PACIFICATION_TWO");
    if (i === 1) return LT.advanceHarpyQuest("HARPY_PACIFICATION_THREE");
    if (i === 2) return LT.advanceHarpyQuest("HARPY_PACIFICATION_REWARD");
    return "";
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
