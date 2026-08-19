/* node "Liliths Throne HTML/tools/smoke_boot_mods.js" */
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
  window: {},
  document: {
    createElement: function () {
      return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
    },
    head: { appendChild: function () {} },
    addEventListener: function () {},
  },
  LT: { TEXT: {}, game: {}, Colour: { GENERIC_ARCANE: "#f6a", BASE_YELLOW_LIGHT: "#ffc", GENERIC_GOOD: "#6c6" } },
};
context.window.LT = context.LT;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
["js/content/nodes.js", "js/engine/response.js", "js/content/bootFlow.js"].forEach(load);

var LT = context.LT;
var state = JSON.parse(fs.readFileSync(path.join(root, "mods", "kittyloader.json"), "utf8"));
var list = LT.modsFromLoaderState(state);
assert(Array.isArray(list) && list.length === state.profiles[0].enabled.length, "enabled count matches kittyloader.json");
assert(list[0].file === state.profiles[0].order[0], "first enabled follows order");
assert(list.map(function (m) { return m.file; }).join(",") === state.profiles[0].enabled.join(","), "order matches enabled list");

var empty = LT.modsFromLoaderState({
  active_profile: "Default",
  profiles: [{ name: "Default", enabled: [], order: ["a.mod"] }],
});
assert(empty.length === 0, "disabled mods are omitted");

assert(LT.hasNode("boot.menu"), "main menu exists");
assert(LT.hasNode("boot.mods"), "mod list node exists");
var titles = LT.getNode("boot.menu").getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Mod List") >= 0, "main menu has Mod List");
assert(titles.indexOf("Mod Menu") >= 0, "main menu has Mod Menu");

LT.APPLIED_MODS = list;
LT.APPLIED_MODS_SOURCE = "kittyloader.json";
var html = LT.getNode("boot.mods").getContent();
assert(html.indexOf(list[0].file) >= 0, "mod list shows first enabled file");
assert(html.indexOf("kittyloader.json") >= 0, "mod list says it read kittyloader.json");

LT.APPLIED_MODS = [];
var none = LT.getNode("boot.mods").getContent();
assert(none.indexOf("No mods are enabled") >= 0, "empty list copy");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL BOOT MOD LIST SMOKES PASSED");
