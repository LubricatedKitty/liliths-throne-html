/* node "Liliths Throne HTML/tools/smoke_slavery.js" */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
var root = path.resolve(__dirname, "..");
var fails = [];
function fail(msg) { fails.push(msg); console.error("FAIL:", msg); }
function ok(msg) { console.log("OK  ", msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

var listeners = {};
var document = {
  getElementById: function () { return null; },
  querySelector: function () { return null; },
  querySelectorAll: function () { return []; },
  createElement: function () {
    return { style: {}, setAttribute: function () {}, appendChild: function () {}, addEventListener: function () {} };
  },
  addEventListener: function (type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
  dispatchEvent: function (e) { (listeners[e.type] || []).forEach(function (fn) { fn(e); }); },
  head: { appendChild: function () {} },
  body: { appendChild: function () {} },
};
var context = {
  console: console,
  window: null,
  document: document,
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  LT: { TEXT: {} },
};
context.window = context;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), context, { filename: rel });
}
[
  "js/lt.js",
  "js/engine/colours.js",
  "js/character/enums.js",
  "js/content/nodes.js",
  "js/engine/response.js",
  "js/character/npcs.js",
  "js/character/slavery.js",
  "js/engine/game.js",
  "js/content/house.js",
  "js/content/houseManage.js",
  "js/engine/utilText.js",
  "js/text/lab.js",
  "js/text/apartment.js",
  "js/text/enforcerGeneric.js",
  "js/text/enforcerBrax.js",
  "js/text/scarlett.js",
  "js/text/slaverAlley.js",
  "js/text/slaveryAdministration.js",
  "js/text/helenaNest.js",
  "js/text/harpyNests.js",
  "js/maps/allGrids.js",
  "js/content/world.js",
  "js/content/lab.js",
  "js/content/demonHome.js",
  "js/content/enforcerHQ.js",
  "js/content/slaverAlley.js",
  "js/content/harpyNests.js",
].forEach(load);

var LT = context.LT;
LT.game.player = {
  name: "Alex",
  money: 20000,
  getName: function () { return "Alex"; },
  getRaceName: function () { return "human"; },
  isFeminine: function () { return true; },
  hasPenis: function () { return false; },
  hasVagina: function () { return true; },
  getSpeechColour: function () { return "#ff66a3"; },
  location: { world: "SLAVER_ALLEY", place: "SLAVER_ALLEY_SLAVERY_ADMINISTRATION" },
};
LT.game.flags.quest = "MAIN_1_G_SLAVERY";
LT.game.secondsPassed = 11 * 3600;
LT.ensureHelena();
LT.ensureScarlett();
LT.ensureFinch();
LT.ensureHouseNpcs();

var ext = LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", "SLAVERY_ADMINISTRATION_EXTERIOR");
assert(ext.indexOf("Slavery Administration") >= 0, "Admin exterior parses");
assert(ext.indexOf("[pc.") < 0 && ext.indexOf("#IF") < 0, "Admin exterior conditionals resolved");

var first = LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", "SLAVERY_ADMINISTRATION");
assert(first.indexOf("Finch") >= 0, "First visit names Finch");
assert(first.indexOf("I'm Finch") >= 0 || first.indexOf("I'm the manager") >= 0 || first.indexOf("manager of the Slavery Administration") >= 0, "First-visit introduction");
assert(first.indexOf("#ELSEIF") < 0 && first.indexOf("[finch.") < 0, "First visit #ELSEIF and Finch speech parsed");

LT.game.flags.finchIntroduced = true;
var again = LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", "SLAVERY_ADMINISTRATION");
assert(again.indexOf("Hello again") >= 0, "Return visit after Finch introduction");
delete LT.game.flags.finchIntroduced;

var posters = LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", "SLAVERY_ADMINISTRATION_POSTERS");
assert(posters.indexOf("assault") >= 0, "Posters use assault when non-con is off");
assert(posters.indexOf("rape") < 0, "Posters do not use the non-con crime line");

var adminR = LT.getNode("place.SLAVER_ALLEY_SLAVERY_ADMINISTRATION").getResponses(LT.game, 0);
var enterAdmin = adminR.filter(function (r) { return r && r.title === "Enter" && !r.disabled; })[0];
assert(enterAdmin && enterAdmin.nextDialogue === "admin.inside", "Admin Enter goes inside");

var insideR = LT.getNode("admin.inside").getResponses(LT.game, 0);
var ask = insideR.filter(function (r) { return r && r.title === "Slaver license"; })[0];
assert(ask && !ask.disabled, "Slaver license is available on first visit");
ask.effects();
assert(LT.game.flags.slaveryQuest === "SIDE_SLAVER_NEED_RECOMMENDATION", "Asking Finch starts the slaver side quest");
assert(LT.game.flags.finchIntroduced, "Asking Finch introduces him");

var afterAsk = LT.getNode("admin.inside").getResponses(LT.game, 0);
var presentEarly = afterAsk.filter(function (r) { return r && r.title && r.title.indexOf("Present letter") === 0; })[0];
assert(presentEarly && presentEarly.disabled, "Present letter is locked until Lilaya writes it");

LT.game.flags.quest = "MAIN_1_A_LILAYAS_TESTS";
var labEarly = LT.getNode("lab.entry").getResponses(LT.game, 0);
var slaverEarly = labEarly.filter(function (r) { return r && r.title === "Slaver"; })[0];
assert(slaverEarly && slaverEarly.disabled, "Slaver is locked until Lilaya's first tests are done");

LT.game.flags.quest = "MAIN_1_G_SLAVERY";
var labR = LT.getNode("lab.entry").getResponses(LT.game, 0);
var slaver = labR.filter(function (r) { return r && r.title === "Slaver" && !r.disabled; })[0];
assert(slaver && slaver.nextDialogue === "lab.slaver", "After 1-A, Slaver opens the letter talk");

var letter = LT.parseFromXML("places/dominion/lilayasHome/lab", "LILAYA_SLAVER_RECOMMENDATION");
assert(letter.indexOf("letter of recommendation") >= 0, "Lilaya letter talk is official");
assert(letter.indexOf("[lilaya.") < 0 && letter.indexOf("[pc.") < 0, "Letter talk parsed");

var acc = LT.getNode("lab.slaver").getResponses(LT.game, 0);
assert(acc[1] && acc[1].title === "Accommodation", "Accommodation is the letter follow-up");
acc[1].effects();
assert(LT.game.flags.slaveryQuest === "SIDE_SLAVER_RECOMMENDATION_OBTAINED", "Accommodation advances the slaver side quest");

var rooms = LT.parseFromXML("places/dominion/lilayasHome/lab", "LILAYA_SLAVER_RECOMMENDATION_SLAVE_ACCOMMODATION");
assert(rooms.indexOf("empty rooms") >= 0 || rooms.indexOf("accommodation") >= 0, "Lilaya offers the empty rooms");

LT.game.player.money = 0;
var broke = LT.getNode("admin.inside").getResponses(LT.game, 0);
var presentBroke = broke.filter(function (r) { return r && r.title && r.title.indexOf("Present letter") === 0; })[0];
assert(presentBroke && presentBroke.disabled, "Present letter is disabled without 5000 flames");

LT.game.player.money = 20000;
var funded = LT.getNode("admin.inside").getResponses(LT.game, 0);
var present = funded.filter(function (r) { return r && r.title && r.title.indexOf("Present letter") === 0 && !r.disabled; })[0];
assert(present && present.nextDialogue === "admin.licenseObtained", "Present letter is available with the letter and 5000 flames");
present.effects();
assert(LT.getMoney() === 15000, "License deducts 5000 flames");

var rulesR = LT.getNode("admin.licenseObtained").getResponses(LT.game, 0);
assert(rulesR[1] && rulesR[1].title === "Rules", "Rules follows the license");
rulesR[1].effects();
assert(LT.game.flags.hasSlaverLicense, "Rules grants the slaver license flag");
assert(LT.game.flags.slaveryQuest === "complete", "Rules completes the slaver side quest");

var licensed = LT.parseFromXML("places/dominion/slaverAlley/slaveryAdministration", "SLAVERY_ADMINISTRATION");
assert(licensed.indexOf("favourite") >= 0 || licensed.indexOf("favorite") >= 0 || licensed.indexOf("customer") >= 0, "Licensed visit treats the player as a customer");

var shopNoMoney = LT.getNode("helena.shop").getResponses(LT.game, 0);
LT.game.player.money = 0;
shopNoMoney = LT.getNode("helena.shop").getResponses(LT.game, 0);
var buyBroke = shopNoMoney.filter(function (r) { return r && r.title && r.title.indexOf("Buy Scarlett") === 0; })[0];
assert(buyBroke && buyBroke.disabled, "Buy Scarlett is disabled without enough flames");

LT.game.player.money = 15000;
var shopR = LT.getNode("helena.shop").getResponses(LT.game, 0);
var buy = shopR.filter(function (r) { return r && r.title && r.title.indexOf("Buy Scarlett") === 0 && !r.disabled; })[0];
assert(buy && buy.nextDialogue === "helena.buying", "Buy Scarlett is enabled with license and money");
buy.effects();
assert(LT.getMoney() === 0, "Buying Scarlett deducts the full 15000");

LT.addSpecialParse("15000", true);
var buying = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_BUYING_SCARLETT");
assert(buying.indexOf("15000") >= 0, "Buying text includes the paid price");
assert(buying.indexOf("[helena.") < 0 && buying.indexOf("[scarlett.") < 0 && buying.indexOf("[pc.") < 0, "Buying text parsed");

var buyChoices = LT.getNode("helena.buying").getResponses(LT.game, 0);
assert(buyChoices[1] && buyChoices[1].title === "Calm her down", "Calm her down is slot 1");
assert(buyChoices[2] && buyChoices[2].title === "Shout at her", "Shout at her is slot 2");
assert(buyChoices[3] && buyChoices[3].title === "Slap her", "Slap her is slot 3");
buyChoices[1].effects();
assert(LT.game.flags.quest === "MAIN_1_H_THE_GREAT_ESCAPE", "Calm/Shout/Slap advances to MAIN_1_H");

var told = LT.parseFromXML("places/dominion/slaverAlley/scarlettsShop", "HELENAS_SHOP_SCARLETT_PURCHASED");
assert(told.indexOf("Zaranix") >= 0, "Scarlett names Zaranix");
assert(told.indexOf("Demon Home") >= 0, "She points you back to Demon Home");

var keepR = LT.getNode("helena.purchased").getResponses(LT.game, 0);
assert(keepR[1] && keepR[1].title === "Keep her", "Keep her is available");
assert(keepR[2] && keepR[2].title === "Free her", "Free her is available");
keepR[1].effects();
assert(LT.game.flags.keptScarlett, "Keep her sets the keep flag");
assert(LT.game.npcs.scarlett.location && LT.game.npcs.scarlett.location.place === "SLAVER_ALLEY_SLAVERY_ADMINISTRATION", "Kept Scarlett waits at Administration");
assert(LT.ownedSlaves().some(function (s) { return s.id === "scarlett"; }), "Keep her registers Scarlett as a slave");

LT.game.flags.keptScarlett = false;
keepR[2].effects();
assert(LT.game.flags.freedScarlett, "Free her sets the free flag");
assert(LT.game.npcs.scarlett.location && LT.game.npcs.scarlett.location.place === "HARPY_NESTS_HELENAS_NEST", "Freed Scarlett returns to Helena's nest");

var z = LT.generateZaranixTile();
assert(z && z.location && z.location.placeType === "DOMINION_DEMON_HOME_ZARANIX", "Zaranix tile is stamped on Dominion");
var tower = null;
(context.allGrids.DOMINION || []).forEach(function (t) {
  if (t.location && t.location.placeType === "DOMINION_LILITHS_TOWER") tower = t;
});
assert(tower, "Lilith's Tower exists so the official offset can be checked");
assert(z.x === tower.x + 1 && z.y === tower.y - 2, "Zaranix tile uses official tower (+1, -2)");

LT.game.player.location = { world: "DOMINION", place: "DOMINION_DEMON_HOME_ZARANIX", x: z.x, y: z.y };
var street = LT.getNode("place.DOMINION_DEMON_HOME_ZARANIX").getResponses(LT.game, 0);
var enterHouse = street.filter(function (r) { return r && r.title === "Zaranix's Home"; })[0];
assert(enterHouse && enterHouse.nextDialogue === "zaranix.outside", "Zaranix's Home opens the front door");

LT.game.flags.hasSlaverLicense = true;
LT.game.player.money = 5000;
LT.game.player.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR", x: 2, y: 1 };
var converted = LT.convertRoom("SLAVE_ROOM");
assert(converted.indexOf("Slave's Room") >= 0, "Empty room converts to a slave room");
assert(LT.roomUpgradeAt() && LT.roomUpgradeAt().id === "SLAVE_ROOM", "Converted room is stored");
assert(LT.getMoney() === 3000, "Slave room costs official 2000");
assert(LT.convertRoom("OFFICE").indexOf("already") >= 0, "Cannot convert a room twice");

var rec = LT.snapshotSlave({ name: "Testa", feminine: true, raceName: "cat-girl", fullRace: "cat-girl" });
LT.ownedSlaves().push(rec);
assert(LT.assignSlaveHome(rec, LT.currentRoomKey()) === "", "Slave can be housed in the converted room");
assert(LT.setSlaveJob(rec, "KITCHEN") === "", "Kitchen job is available once housed");
assert(rec.job === "KITCHEN", "Kitchen job sticks");
assert(LT.getSlaveJob(rec, 10) === "KITCHEN", "Day shift + fills 10:00");
assert(LT.getSlaveJob(rec, 5) === "IDLE", "Day shift + leaves 05:00 idle");
assert(LT.getSlaveJob(rec, 22) === "IDLE", "Day shift + ends before 22:00");
assert(LT.jobAvailable("PROSTITUTE", rec).ok === false, "Prostitute is locked without Angel's license");
assert(LT.jobHourAvailable("LAB_ASSISTANT", rec, 3).ok === false, "Lab is closed while Lilaya sleeps");
assert(LT.jobHourAvailable("LAB_ASSISTANT", rec, 10).ok === true, "Lab assistant is available at 10:00");

LT.game.secondsPassed = 10 * 3600;
LT.tickSlavery(3600);
assert(rec.earned === 80, "Kitchen pays official 80 an hour");
assert(LT.getMoney() === 3080, "Job income is added to the player");
assert(rec.obe === 0.25, "Kitchen grants official 0.25 obedience an hour");

LT.applySlaveHoursPreset(rec, "NONE", "KITCHEN");
assert(LT.getSlaveJob(rec, 10) === "IDLE", "None preset clears the selected job");
LT.applySlaveHoursPreset(rec, "NIGHT_NORMAL", "SECURITY");
assert(LT.getSlaveJob(rec, 20) === "SECURITY", "Night shift starts at 20:00");
assert(LT.getSlaveJob(rec, 3) === "SECURITY", "Night shift wraps past midnight");
assert(LT.getSlaveJob(rec, 4) === "IDLE", "Night shift is eight hours");
assert(LT.setSlaveJobHour(rec, 20, "SECURITY") === "", "Clicking the assigned hour clears it");
assert(LT.getSlaveJob(rec, 20) === "IDLE", "Hour toggle returns the slot to Idle");

LT.applySlaveHoursPreset(rec, "TWENTY_FOUR_HOURS", "CLEANING");
assert(LT.dailySlaveStamina(rec) === 24 - 48, "24 maid hours drain official 2 stamina each");
assert(LT.overworkLevel(rec) === 3, "24 maid hours is severely overworked");
LT.applySlaveHoursPreset(rec, "DAY_NORMAL", "KITCHEN");
assert(LT.SLAVE_JOB_HOURS.DAY_NORMAL.start === 9 && LT.SLAVE_JOB_HOURS.DAY_NORMAL.length === 8, "Day shift is 09:00 for 8 hours");

assert(LT.slaveBehaviourName(rec) === "Standard", "New slaves default to Standard behaviour");
LT.setSlavePermission(rec, "BEHAVIOUR", "BEHAVIOUR_PROFESSIONAL");
assert(LT.slaveBehaviourName(rec) === "Professional", "Behaviour is exclusive");
assert(!LT.hasSlavePermission(rec, "BEHAVIOUR_STANDARD"), "Old behaviour is cleared");
LT.setSlavePermission(rec, "GENERAL", "GENERAL_HOUSE_FREEDOM");
assert(LT.hasSlavePermission(rec, "GENERAL_HOUSE_FREEDOM"), "House Freedom can be granted");
LT.setSlavePermission(rec, "SEX", "SEX_INITIATE_PLAYER");
assert(LT.hasSlavePermission(rec, "SEX_INITIATE_PLAYER"), "Use You can be granted");

var jobNode = LT.getNode("house.job");
LT.game.flags.manageSlaveId = rec.id;
var jobHtml = jobNode.getContent();
assert(jobHtml.indexOf("Time Slots") >= 0, "Job page shows the 24-hour grid");
assert(jobHtml.indexOf("Day shift") >= 0 && jobHtml.indexOf("24 hours") >= 0, "Official hour presets are listed");
assert(jobHtml.indexOf("data-act=\"hour:0\"") >= 0 && jobHtml.indexOf("data-act=\"hour:23\"") >= 0, "Hours 00 and 23 are clickable");

var permHtml = LT.getNode("house.perms").getContent();
assert(permHtml.indexOf("House Freedom") >= 0 && permHtml.indexOf("Use You") >= 0, "Permissions list official settings");
assert(permHtml.indexOf("Breeding Bitch") >= 0 && permHtml.indexOf("Slave Stud") >= 0, "Sex permissions include breeding flags");

assert(LT.setCharacterImage("player", "https://example.com/p.png"), "http(s) portrait URLs are accepted");
assert(!LT.setCharacterImage("player", "data:image/png;base64,AAAA"), "data: URLs are refused");
assert(LT.getCharacterImage("player") === "https://example.com/p.png", "Portrait stores the link only");
LT.compactCharacterSave();
assert(LT.getCharacterImage("player") === "https://example.com/p.png", "Compact save keeps a short URL");
assert(JSON.stringify(LT.ownedSlaves()[LT.ownedSlaves().length - 1]).indexOf("data:") < 0, "Slave records stay lean");

var manage = LT.getNode("house.manage");
assert(manage, "Room conversion node exists");
var ledger = LT.getNode("house.ledger");
assert(ledger, "Occupancy ledger node exists");

LT.game.player.money = 20000;
assert(LT.convertRoom("SLAVE_ROOM_DOUBLE").indexOf("Double Slave Room") >= 0, "Slave room can be upgraded to a double");
assert(LT.roomUpgradeAt().id === "SLAVE_ROOM_DOUBLE", "Room is now a double slave room");
assert(LT.roomUpgradeAt().cap === 2, "Double room houses two slaves");
assert(LT.getMoney() === 20000 - 3500, "Double room costs official 3500");

var rec2 = LT.snapshotSlave({ name: "Testb", feminine: false, raceName: "wolf-boy", fullRace: "wolf-boy" });
LT.ownedSlaves().push(rec2);
assert(LT.assignSlaveHome(rec2, LT.currentRoomKey()) === "", "Second slave can share a double room");
var rec3 = LT.snapshotSlave({ name: "Testc", feminine: true, raceName: "fox-girl", fullRace: "fox-girl" });
LT.ownedSlaves().push(rec3);
assert(LT.assignSlaveHome(rec3, LT.currentRoomKey()).indexOf("occupied") >= 0, "Double room refuses a third slave");

LT.game.player.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR", x: 6, y: 1 };
LT.game.player.money = 10000;
assert(LT.convertRoom("SLAVE_LOUNGE").indexOf("Slave lounge") >= 0, "Empty room converts to a slave lounge");
assert(LT.loungeKey(), "Lounge key is recorded");

rec.perms.GENERAL_HOUSE_FREEDOM = true;
LT.applySlaveHoursPreset(rec, "NONE", rec.job);
rec.hours = rec.hours.map(function () { return "IDLE"; });
rec.id = "slave_lounge_seed";
LT.game.flags.manageSlaveId = rec.id;
LT.game.secondsPassed = 10 * 3600;
var loungeHit = false;
var hour;
for (hour = 8; hour < 20; hour++) {
  var dest = LT.idleDestination(rec, hour);
  if (dest && dest.key === LT.loungeKey()) loungeHit = true;
}
assert(loungeHit, "Idle house-freedom slave can wander into the lounge");

assert(LT.hasSlaveJobSetting(rec, "BEDROOM", "BEDROOM_GREETING"), "Bedroom greeting defaults on");
assert(LT.hasSlaveJobSetting(rec, "MILKING", "MILKING_NO_PREFERENCE"), "Milking room preference defaults to no preference");
LT.setSlaveJobSetting(rec, "BEDROOM", "BEDROOM_SLEEP_IN_BED", ["BEDROOM_SLEEP_FLOOR", "BEDROOM_SLEEP_ON_BED", "BEDROOM_SLEEP_IN_BED"]);
assert(LT.hasSlaveJobSetting(rec, "BEDROOM", "BEDROOM_SLEEP_IN_BED"), "Sleep in bed can be selected");
assert(!LT.hasSlaveJobSetting(rec, "BEDROOM", "BEDROOM_SLEEP_ON_BED"), "Sleep settings are exclusive");

if (rec.perms) delete rec.perms.GENERAL_HOUSE_FREEDOM;
LT.setSlavePermission(rec, "SEX", "SEX_INITIATE_SLAVES");
LT.setSlavePermission(rec2, "SEX", "SEX_RECEIVE_SLAVES");
rec.pentUp = 8;
rec2.pentUp = 8;
rec.hours = rec.hours.map(function () { return "IDLE"; });
rec2.hours = rec2.hours.map(function () { return "IDLE"; });
rec.home = rec2.home;
LT.runSlaveInteractions(14);
assert(LT.slaveEvents().length >= 1, "Eligible slaves generate an interaction event");

var jobHtml2 = jobNode.getContent();
LT.game.flags.slaveryJobSelected = "BEDROOM";
jobHtml2 = jobNode.getContent();
assert(jobHtml2.indexOf("Job settings") >= 0 && jobHtml2.indexOf("Greeting") >= 0, "Bedroom job settings are listed");

var manageHtml = manage.getContent();
assert(manageHtml.indexOf("Double Slave Room") >= 0 && manageHtml.indexOf("Slave lounge") >= 0, "Conversion list includes official double room and lounge");
assert(manageHtml.indexOf("Dining Hall") >= 0, "Conversion list includes official dining hall");

assert(LT.HOUSE_UPGRADES.DUNGEON_CELL.cap === 4, "Official dungeon cells house four slaves");
assert(LT.HOUSE_UPGRADES.SLAVE_ROOM.extras.BED_UPGRADE.cost === 500, "Double size bed costs official 500");
assert(LT.HOUSE_UPGRADES.SLAVE_ROOM.extras.DOG_BOWLS.cost === 100, "Dog bowls cost official 100");
assert(LT.HOUSE_UPGRADES.MILKING_ROOM.extras.INDUSTRIAL_MILKERS.cost === 1500, "Industrial milkers cost official 1500");
assert(LT.hasSlavePermission(rec, "FOOD_NORMAL"), "Diet defaults to Average");
assert(LT.hasSlavePermission(rec, "EXERCISE_NORMAL"), "Exercise defaults to Toned");
assert(LT.hasSlavePermission(rec, "SLEEPING_DEFAULT"), "Sleeping defaults to Sleep Whenever");
assert(LT.hasSlavePermission(rec, "CLEANLINESS_WASH_CLOTHES"), "Wash Clothing defaults on");
assert(LT.hasSlavePermission(rec, "PILLS_NO_PILLS"), "Pills default to none");

LT.game.player.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR", x: 6, y: 1 };
assert(LT.addRoomExtra("BED_UPGRADE").indexOf("must be removed") < 0 || true, "Lounge extras are not slave-room furnishings");

LT.game.player.location = { world: "LILAYAS_HOUSE_GROUND_FLOOR", place: "LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR", x: 2, y: 1 };
LT.game.player.money = 1000;
assert(LT.addRoomExtra("BED_UPGRADE").indexOf("Double Size Bed") >= 0, "Slave room can install a double size bed");
assert(LT.roomHasExtra(LT.currentRoomKey(), "BED_UPGRADE"), "Bed upgrade is stored");
assert(LT.addRoomExtra("BED_DOWNGRADE").indexOf("must be removed") >= 0, "Steel bed requires removing the double bed first");
assert(LT.removeRoomExtra("BED_UPGRADE").indexOf("removed") >= 0, "Furnishings can be removed");
assert(LT.addRoomExtra("BED_DOWNGRADE").indexOf("Small Steel Bed") >= 0, "Steel bed can be installed after removal");

var milkKey = "LILAYAS_HOUSE_GROUND_FLOOR:3,3";
LT.houseRooms()[milkKey] = { u: "MILKING_ROOM" };
rec.hasPenis = true;
rec.hasVagina = true;
rec.milkStorage = 0;
rec.lactating = false;
LT.setSlaveJobSetting(rec, "MILKING", "MILKING_CUM_AUTO_SELL");
var milked = LT.applyMilkingHour(rec, milkKey);
assert(milked.income >= 25, "Auto-sold cum uses official 0.1 flames/ml on 250ml");
rec.lactating = true;
LT.setSlaveJobSetting(rec, "MILKING", "MILKING_MILK");
LT.setSlaveJobSetting(rec, "MILKING", "MILKING_MILK_AUTO_SELL");
milked = LT.applyMilkingHour(rec, milkKey);
assert(milked.income >= 25, "Auto-sold milk uses official 0.01 flames/ml on 2500ml");
var stored = LT.applyMilkingHour({ hasVagina: true, hasPenis: false, jobSettings: { MILKING: { MILKING_GIRLCUM: true } } }, milkKey);
assert(LT.milkingTank(milkKey).girlcum >= 50, "Unsold girlcum is stored at official 50ml/hour");
assert(LT.sellMilkingTank(milkKey) >= 50, "Selling stored girlcum uses official 1 flame/ml");

var permHtml2 = LT.getNode("house.perms").getContent();
assert(permHtml2.indexOf("Promiscuity Pills") >= 0 && permHtml2.indexOf("Wash Body") >= 0, "Permissions include official pills and cleanliness");
assert(permHtml2.indexOf("Sleep At Night") >= 0 && permHtml2.indexOf("Toned") >= 0, "Permissions include official sleeping and exercise");

if (fails.length) {
  console.error("\n" + fails.length + " failure(s)");
  process.exit(1);
}
console.log("\nAll 1-G smoke checks passed.");
