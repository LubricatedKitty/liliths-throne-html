/* node "Liliths Throne HTML/tools/smoke_artwork.js" */
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
  document: { addEventListener: function () {} },
  LT: {
    Colour: { ANDROGYNOUS: "#aaa", FEMININE: "#f6a", MASCULINE: "#68f" },
    game: { player: { id: "player" }, npcs: { vesper: { id: "vesper", hasVagina: function () { return true; }, hasPenis: function () { return false; } } }, flags: {} },
    hasProperty: function () { return true; },
    hasStatusEffect: function (ch, id) { return !!(ch && ch._preg && id.indexOf("PREGNANT") === 0); },
    isVisiblyPregnant: function (ch) { return !!(ch && ch._preg); },
    sex: { active: false },
  },
};
context.window.LT = context.LT;
context.LT.characterById = function (id) {
  if (id === "vesper") return context.LT.game.npcs.vesper;
  return context.LT.game.player;
};
vm.runInNewContext(fs.readFileSync(path.join(root, "js/character/slavery.js"), "utf8"), context, { filename: "slavery.js" });
var LT = context.LT;

LT.registerArtwork("vesper", {
  defaultArtist: "jam",
  artist: "jam",
  artists: {
    jam: [
      "mods/x/jam/clothed1.jpg",
      "mods/x/jam/clothed1#preg.jpg",
      "mods/x/jam/naked1.jpg",
      "mods/x/jam/naked1#preg.jpg",
    ],
  },
});

var ch = LT.game.npcs.vesper;
var clothed = LT.filterArtworkList(ch, LT.artworkListFor("vesper"));
assert(clothed.length === 2 && clothed[0].indexOf("clothed1.jpg") >= 0, "not pregnant: drop #preg, keep untagged");
assert(clothed.every(function (f) { return f.indexOf("#preg") < 0; }), "no preg files when not pregnant");

ch._preg = true;
var preg = LT.filterArtworkList(ch, LT.artworkListFor("vesper"));
assert(preg.length === 2 && preg.every(function (f) { return f.indexOf("#preg") >= 0; }), "pregnant: only #preg files");

ch._preg = false;
assert(LT.artworkClothingTier(ch) === "clothed", "default clothed");
LT.sex.active = true;
LT.sex.partner = ch;
ch.sexExposed = { VAGINA: true };
assert(LT.artworkClothingTier(ch) === "naked", "sex with groin exposed uses naked");
var naked = LT.filteredArtworkByTier("vesper");
assert(naked.length === 1 && naked[0].indexOf("naked1.jpg") >= 0, "naked bucket without preg");

ch._preg = true;
naked = LT.filteredArtworkByTier("vesper");
assert(naked.length === 1 && naked[0].indexOf("naked1#preg") >= 0, "naked+preg");

assert(LT.pickArtworkUrl("vesper").indexOf("naked1#preg") >= 0, "resolved preg nude");
assert(LT.incrementArtworkIndex("vesper", 1) === false, "single image does not cycle");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL ARTWORK SMOKES PASSED");
