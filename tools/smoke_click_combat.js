/* node "Liliths Throne HTML/tools/smoke_click_combat.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var context = {
  console: console,
  window: { allGrids: {}, grid: {} },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    Colour: { GENERIC_GOOD: "#6c6", GENERIC_BAD: "#c66" },
    MAX_LUST: 100,
    MOVES: {
      strike: {
        id: "strike",
        ap: 1,
        perform: function (src, tgt) {
          tgt.health = Math.max(0, (tgt.health || 0) - 5);
          tgt._hits = (tgt._hits || 0) + 1;
          return name(src) + " hits for 5";
        },
      },
      allout: {
        id: "allout",
        ap: 3,
        perform: function (src, tgt) {
          tgt.health = Math.max(0, (tgt.health || 0) - 20);
          return name(src) + " all-out for 20";
        },
      },
    },
    game: {
      player: null,
      npcs: {},
      flags: {},
      setContent: function (id) { this._node = id; },
    },
  },
};
function name(ch) {
  return (ch && ch.name) || "someone";
}
context.window.LT = context.LT;
context.window.document = context.document;

function freshFighters() {
  return {
    player: { name: "Alex", health: 40, maxHealth: 40, lust: 0, remainingAP: 3, turnStartAP: 3, maxAP: 3, selectedMoves: [] },
    enemy: { name: "Kara", health: 30, maxHealth: 30, lust: 0, remainingAP: 3, maxAP: 3, selectedMoves: [] },
  };
}

function vanillaCombat() {
  var C = {
    active: false,
    finished: null,
    lastResolution: "",
    player: null,
    enemy: null,
    remainingAp: function () {
      return this.player ? this.player.remainingAP || 0 : 0;
    },
    canQueue: function (moveId) {
      var move = context.LT.MOVES[moveId];
      if (!this.active || this.finished || !move) return "You cannot use that now.";
      if ((this.player.remainingAP || 0) < move.ap) return "This action can't be used since you don't have enough AP!";
      return null;
    },
    queue: function (moveId) {
      var reason = this.canQueue(moveId);
      if (reason) return reason;
      var move = context.LT.MOVES[moveId];
      this.player.selectedMoves.push({ id: moveId, target: this.enemy });
      this.player.remainingAP -= move.ap;
      return null;
    },
    resolveCharacter: function (ch, lines) {
      var moves = ch.selectedMoves || [];
      if (!moves.length) {
        lines.push("<p>" + name(ch) + " does nothing.</p>");
        return;
      }
      var i;
      for (i = 0; i < moves.length; i++) {
        var move = context.LT.MOVES[moves[i].id];
        if (move) lines.push("<p>" + move.perform(ch, moves[i].target, i) + "</p>");
      }
    },
    endTurn: function () {
      var lines = [];
      this.resolveCharacter(this.player, lines);
      if ((this.enemy.health || 0) > 0) {
        this.enemy.selectedMoves = [{ id: "strike", target: this.player }];
        this.resolveCharacter(this.enemy, lines);
      }
      this.lastResolution = lines.join("");
      if ((this.enemy.health || 0) <= 0) this.finished = "victory";
      else if ((this.player.health || 0) <= 0) this.finished = "defeat";
      this.player.remainingAP = this.player.maxAP;
      this.player.selectedMoves = [];
      this.player.turnStartAP = this.player.maxAP;
    },
    start: function (opts) {
      this.active = true;
      this.finished = null;
      this.lastResolution = "";
      this.player = opts.player;
      this.enemy = opts.enemy;
      this.player.selectedMoves = [];
      this.player.remainingAP = 3;
    },
  };
  return C;
}

context.LT.combat = vanillaCombat();
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
load("js/engine/modMenu.js");
load("mods/KittySingleClickCombat/KittySingleClickCombat.js");

var LT = context.LT;
var api = LT.kittyClickCombat;
assert(api, "API");
assert(LT.combat.queue._kittyClick, "queue wrapped");

var f = freshFighters();
LT.combat.start({ player: f.player, enemy: f.enemy });
assert(!LT.combat.queue("strike"), "first click ok");
assert(f.enemy.health === 25, "strike damages immediately");
assert(f.enemy._hits === 1, "one perform");
assert(f.player.remainingAP === 2, "1 AP spent");
assert(!f.player.selectedMoves.length, "not left queued");
assert(/hits for 5/.test(LT.combat.lastResolution), "log shows the hit");
assert(!LT.combat.finished, "fight continues");
assert(f.player.health === 40, "enemy has not acted yet");

assert(!LT.combat.queue("strike"), "second click");
assert(!LT.combat.queue("strike"), "third click");
assert(f.enemy.health === 15, "three player hits");
assert(f.player.health === 35, "enemy acted after AP empty");
assert(f.player.remainingAP === 3, "AP reset");
assert(!/does nothing/.test(LT.combat.lastResolution), "no dummy player line");
assert(/hits for 5/.test(LT.combat.lastResolution), "player hits still in log");

api.saveMenu({ enabled: false, endTurnEach: false });
f = freshFighters();
LT.combat.start({ player: f.player, enemy: f.enemy });
assert(!LT.combat.queue("strike"), "vanilla queue");
assert(f.enemy.health === 30, "vanilla does not perform yet");
assert(f.player.selectedMoves.length === 1, "vanilla queued");
LT.combat.endTurn();
assert(f.enemy.health === 25, "vanilla endTurn performs");

api.saveMenu({ enabled: true, endTurnEach: true });
f = freshFighters();
LT.combat.start({ player: f.player, enemy: f.enemy });
assert(!LT.combat.queue("strike"), "end-each click");
assert(f.enemy.health === 25, "player hit");
assert(f.player.health === 35, "enemy acted after one click");
assert(f.player.remainingAP === 3, "turn reset after each");

api.saveMenu({ enabled: true, endTurnEach: false });
f = freshFighters();
f.enemy.health = 4;
LT.combat.start({ player: f.player, enemy: f.enemy });
assert(!LT.combat.queue("strike"), "killing blow");
assert(f.enemy.health === 0, "enemy down");
assert(LT.combat.finished === "victory", "victory without extra End Turn");

f = freshFighters();
LT.combat.start({ player: f.player, enemy: f.enemy });
assert(LT.combat.queue("missing"), "bad move rejected");
assert(f.enemy.health === 30, "rejected move does no damage");

assert(typeof LT.listModMenus === "function" && LT.listModMenus().some(function (m) { return m.id === "KittySingleClickCombat"; }), "mod menu");
var html = LT.listModMenus().filter(function (m) { return m.id === "KittySingleClickCombat"; })[0].getHtml();
assert(/Enable/.test(html) && /End the turn after every move/.test(html), "mod menu fields");

var modText = fs.readFileSync(path.join(root, "mods/KittySingleClickCombat/KittySingleClickCombat.mod"), "utf8");
assert(/Add Boot:/.test(modText) && !/Add Javascript:/.test(modText), "pattern B boot only");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL CLICK COMBAT SMOKES PASSED");
