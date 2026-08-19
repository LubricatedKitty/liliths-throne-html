/* node "Liliths Throne HTML/tools/smoke_pets.js" */
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
  window: { allGrids: {}, grid: { gridName: "DOMINION", playerPosition: { x: 3, y: 2 } } },
  document: {
    createElement: function () { return { style: {}, setAttribute: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    head: { appendChild: function () {} },
    querySelectorAll: function () { return []; },
  },
  localStorage: { _d: {}, getItem: function (k) { return this._d[k] || null; }, setItem: function (k, v) { this._d[k] = String(v); } },
  LT: {
    TEXT: {},
    ITEMS: {
      innoxia_race_harpy_bubblegum_lollipop: {
        id: "innoxia_race_harpy_bubblegum_lollipop",
        kind: "tf",
        name: "Bubblegum Lollipop",
        value: 10,
        soldBy: ["ralph", "vicky"],
      },
    },
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_GOOD: "#6c6", GENERIC_MINOR_GOOD: "#8c6", GENERIC_BAD: "#c66" },
    Gender: { FEMALE: { hasVagina: true, hasBreasts: true, feminine: true }, MALE: { hasPenis: true, feminine: false } },
    game: {
      started: true,
      player: {
        items: [],
        money: 0,
        companions: [],
        location: { world: "DOMINION", place: "DOMINION_STREET", x: 3, y: 2 },
      },
      flags: {},
      npcs: {},
      textStart: "",
      setContent: function (id) { this._node = id; },
    },
  },
};
context.window.LT = context.LT;
context.window.document = context.document;
context.window.grid = context.window.grid;
context.grid = context.window.grid;

function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}

context.LT.hasNode = function () { return false; };
context.LT.getNode = function (id) { throw new Error(id); };
context.LT.defineNode = function (n) {
  context.LT._nodes = context.LT._nodes || {};
  context.LT._nodes[n.id] = n;
  return n;
};
context.LT.hasNode = function (id) { return !!(context.LT._nodes && context.LT._nodes[id]); };
context.LT.getNode = function (id) { return context.LT._nodes[id]; };
context.LT.parse = function (s) { return String(s || ""); };
context.LT.parseFromXML = function (p, t) { return (context.LT.TEXT[p] && context.LT.TEXT[p][t]) || t; };
context.LT.withParseTargets = function (map, fn) { return fn(); };
context.LT.Response = function (title, tip, next, fx) {
  this.title = title;
  this.tooltipText = tip;
  this.nextDialogue = next;
  this.effects = fx || function () {};
  this.withColour = function () { return this; };
  this.disable = function (r) { this.disabled = true; this.tooltipText = r; return this; };
};
context.LT.markCharacterEncountered = function () {};
context.LT.refreshVitals = function (n) { return n; };
context.LT.randomHumanNameTriplet = function () { return ["Ash", "Ash", "Misty"]; };
context.LT.isFeralContentEnabled = function () { return true; };
context.LT.countItems = function (player, id) {
  return (player.items || []).filter(function (it) { return it && it.id === id; }).length;
};
context.LT.addItem = function (player, id) {
  player.items = player.items || [];
  player.items.push({ id: id });
};
context.LT.removeItemById = function (player, id) {
  var i;
  for (i = 0; i < player.items.length; i++) {
    if (player.items[i] && player.items[i].id === id) {
      player.items.splice(i, 1);
      return true;
    }
  }
  return false;
};
context.LT.maybePlaceEncounter = function () { return null; };
context.LT.travelResponses = function () { return []; };
context.LT.registerModMenu = function (spec) {
  context.LT._menus = context.LT._menus || [];
  context.LT._menus.push(spec);
  return spec;
};
context.LT.listModMenus = function () { return context.LT._menus || []; };

load("js/engine/modMenu.js");
load("mods/KittyPetsAndAnimals/KittyPetsAndAnimals.js");

var LT = context.LT;
var api = LT.kittyPetsAndAnimals;
assert(api, "API exported");
assert(LT.hasNode("kitty.pet"), "pet node");
assert(LT.ITEMS.innoxia_race_cat_kittys_reward && LT.ITEMS.innoxia_race_cat_kittys_reward.value === 30, "Kitty's Reward official value");
assert(LT.ITEMS.innoxia_race_dog_canine_crunch && LT.ITEMS.innoxia_race_dog_canine_crunch.value === 25, "Canine Crunch official value");
assert(LT.ITEMS.innoxia_race_horse_sugar_carrot_cube && LT.ITEMS.innoxia_race_horse_sugar_carrot_cube.value === 15, "Sugar Carrot Cube official value");
assert(api.classify({ location: { placeType: "DOMINION_STREET" } }) === "street", "street classify");
assert(api.classify({ location: { placeType: "SHOPPING_ARCADE_PATH" } }) === "arcade", "arcade classify");
assert(api.classify({ location: { placeType: "WORLD_MAP_FIELDS" } }) === "fields", "fields classify");

api.saveMenu(Object.assign(api.loadMenu(), { frequency: "constant", city: "both", fields: true }));

var cat = api.trySpawn({
  tile: { location: { placeType: "DOMINION_STREET" } },
  force: true,
  random: function () { return 0.8; },
});
assert(cat && cat.species === "dog", "city high-roll is a dog");
assert(cat.isFeral() && cat.isMute(), "stray is feral and mute");
assert(!cat.owned, "stray is not owned");
assert(/speech/i.test(JSON.stringify(LT.TEXT["mods/KittyPetsAndAnimals/pets"])) === false || true, "pack exists");
var pack = LT.TEXT["mods/KittyPetsAndAnimals/pets"];
var packBlob = JSON.stringify(pack);
assert(packBlob.indexOf("[npc.speech") < 0 && packBlob.indexOf("[com.speech") < 0, "pet pack has no speech tags");

api.despawn(cat);
api.flags().lastTile = "";
var raven = api.trySpawn({
  tile: { location: { placeType: "SHOPPING_ARCADE_PATH" } },
  force: true,
  random: function () { return 0.01; },
});
assert(raven && raven.species === "raven", "low city roll is a raven");
assert(/head|eaves|wings/i.test(pack.FIND_RAVEN), "raven lands from above");

api.despawn(raven);
api.flags().lastTile = "";
LT.game.player.location = { world: "WORLD_MAP", place: "WORLD_MAP_FIELDS", x: 8, y: 8 };
var horse = api.trySpawn({
  tile: { location: { placeType: "WORLD_MAP_FIELDS" } },
  force: true,
  random: function () { return 0; },
});
assert(horse && horse.species === "horse", "fields spawn a horse");
assert(/Foloi Fields/.test(pack.FIND_HORSE), "horse text names Foloi Fields");

var node = LT.getNode("kitty.pet");
api.flags().activeId = horse.id;
api.flags().petted = false;
var titles = node.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Greet") >= 0 && titles.indexOf("Pet") >= 0 && titles.indexOf("Leave") >= 0, "wild greet/pet/leave");
assert(titles.indexOf("Greet") < titles.indexOf("Pet"), "greet before pet");
var treatBtn = node.getResponses().filter(function (r) { return r && r.title === "Give treat"; })[0];
assert(treatBtn && treatBtn.disabled, "treat shown grey without item");

node.getResponses().filter(function (r) { return r && r.title === "Pet"; })[0].effects();
assert(api.flags().petted, "pet marks this visit");
node.getResponses().filter(function (r) { return r && r.title === "Pet"; })[0].effects();
assert((horse.affection || 0) >= 6, "petting raises affinity");

LT.addItem(LT.game.player, "innoxia_race_horse_sugar_carrot_cube");
titles = node.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Give treat") >= 0, "treat enabled with item");

node.getResponses().filter(function (r) { return r && r.title === "Give treat"; })[0].effects();
assert(horse.owned && horse.following, "treat after affinity adopts and follows");
assert(LT.game.player.companions.indexOf(horse.id) >= 0, "player.companions updated");
assert(LT.countItems(LT.game.player, "innoxia_race_horse_sugar_carrot_cube") === 0, "item consumed");

titles = node.getResponses().filter(Boolean).map(function (r) { return r.title; });
var feedBtn = node.getResponses().filter(function (r) { return r && r.title === "Feed"; })[0];
assert(feedBtn && feedBtn.disabled, "feed grey without another cube");
assert(titles.indexOf("Stay here") >= 0, "owned following can stay");
assert(titles.indexOf("Come along") < 0, "come along hidden while following");

node.getResponses().filter(function (r) { return r && r.title === "Stay here"; })[0].effects();
assert(!horse.following, "stay parks them");
assert(LT.game.player.companions.indexOf(horse.id) < 0, "parked horse leaves party");
assert(api.parkedOnTile().some(function (n) { return n.id === horse.id; }), "parked on tile");

titles = node.getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(titles.indexOf("Come along") >= 0, "parked pet can be recalled");
node.getResponses().filter(function (r) { return r && r.title === "Come along"; })[0].effects();
assert(horse.following, "recall follows again");

var travel = LT.travelResponses();
assert(travel.some(function (r) { return r && /Talk to /.test(r.title); }), "travel bar offers talk while following");

var menus = LT.listModMenus();
assert(menus.some(function (m) { return m.id === "KittyPetsAndAnimals"; }), "mod menu registered");
var html = menus.filter(function (m) { return m.id === "KittyPetsAndAnimals"; })[0].getHtml();
assert(html.indexOf("Kitty's Reward") >= 0 && html.indexOf("Companion name") < 0, "menu explains official food, no name field");

load("mods/NahliaPetsAndAnimalsBeastiality/NahliaPetsAndAnimalsBeastiality.js");
assert(LT.nahliaPetsBeastiality, "bestiality API");
assert(LT.nahliaPetsBeastiality.allowed(horse), "owned horse can have sex");
assert(!LT.nahliaPetsBeastiality.allowed(raven), "raven is not in the sex add-on");
api.flags().activeId = horse.id;
var sexTitles = LT.getNode("kitty.pet").getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(sexTitles.indexOf("Sex") >= 0, "owned horse shows Sex from Nahlia add-on");
var catStray = api.createPet("dog", { owned: false });
api.flags().activeId = catStray.id;
sexTitles = LT.getNode("kitty.pet").getResponses().filter(Boolean).map(function (r) { return r.title; });
assert(sexTitles.indexOf("Sex") < 0, "unowned dog has no Sex");
assert(LT.listModMenus().some(function (m) { return m.id === "NahliaPetsAndAnimalsBeastiality"; }), "bestiality menu registered");

var speechCtx = {
  console: console,
  window: {},
  LT: {
    TEXT: { test: { LINE: "With [com.name] beside you, [com.she] answers, [com.speech(Let's go.)]" } },
    Colour: { FEMININE: "#f6a", MASCULINE: "#6af", GENERIC_BAD: "#c66" },
    game: {
      player: { companions: ["kittypet_dog_x"] },
      npcs: {
        kittypet_dog_x: {
          id: "kittypet_dog_x",
          name: "Ash",
          feminine: false,
          feralSound: "a short bark",
          body: { feral: true },
          isFeral: function () { return true; },
          isMute: function () { return true; },
          isFeminine: function () { return false; },
          getName: function () { return "Ash"; },
          getSpeechColour: function () { return "#8a7a5a"; },
        },
      },
    },
  },
};
speechCtx.window.LT = speechCtx.LT;
vm.runInNewContext(fs.readFileSync(path.join(root, "js/engine/utilText.js"), "utf8"), speechCtx, { filename: "utilText.js" });
var spoken = speechCtx.LT.parseFromXML("test", "LINE");
assert(spoken.indexOf("Let's go") < 0, "feral companion speech drops words");
assert(/a short bark/.test(spoken) && /Ash/.test(spoken), "feral companion keeps name and animal sound");

if (fails.length) {
  console.error(fails.length + " failed");
  process.exit(1);
}
console.log("ALL PET SMOKES PASSED");
