(function () {
  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 8);
  }
  var bugreportmsg =
    "Please make a bug report if you see this in normal gameplay";
  LT.Item = class Item {
    constructor(opts) {
      opts = opts || {};
      this.id = opts.id;
      this.name = opts.name;
      this.description = opts.description || "";
      this.kind = opts.kind;
      this.value = opts.value || 0;
      this.soldBy = opts.soldBy || [];
      this.race = opts.race || bugreportmsg;
      this.fem = opts.fem || bugreportmsg;
      this.masc = opts.masc || bugreportmsg;
      this.tags = {};
      this.flags = {};
      this.dirty = false;
    }
    genUid() {
      this.uid = this.uidPrefix + "_" + Math.random().toString(36).slice(2, 8);
    }
    get uidPrefix() {
      return this.kind;
    }
    copy() {
      var copy = structuredClone(this);
      copy.genUid();
      return copy;
    }
    equip() {
      throw new Error("Not Implemented");
    }
    onEquip() {
      throw new Error("Not Implemented");
    }
    pickup() {
      throw new Error("Not Implemented");
    }
    onPickup() {
      throw new Error("Not Implemented");
    }
  };
  /*
    to define an item correctly:
    create a dict with the following values
    id, kind, name, value, description, soldBy
    tags and flags are optional and not currently used
    if you are adding transformative items add race, fem, masc
    then pipe it into an item class like the first example below
  */
  var ITEMS = (LT.ITEMS = {
    innoxia_items_essence_arcane: new Item({
      id: "innoxia_items_essence_arcane",
      kind: "essence",
      name: "bottled arcane essence",
      value: 0,
      description:
        "A small vial containing a swirling pink shard of arcane essence. Drinking it returns the essence to your aura.",
    }),
    innoxia_bdsm_metal_collar: new Item({
      id: "innoxia_bdsm_metal_collar",
      kind: "collar",
      name: "metal collar",
      value: 2500,
      soldBy: ["finch"],
      description:
        "A sturdy metal slave collar. The ring on the front glows when held near a wanted criminal.",
    }),
    innoxia_race_cat_felines_fancy: new Item({
      id: "innoxia_race_cat_felines_fancy",
      kind: "tf",
      name: "Feline's Fancy",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "cat-morph",
      fem: "cat-girl",
      masc: "cat-boy",
      description:
        "A delicate glass bottle filled with a thick, cream-like liquid.",
    }),
    innoxia_race_dog_canine_crush: new Item({
      id: "innoxia_race_dog_canine_crush",
      kind: "tf",
      name: "Canine Crush",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "dog-morph",
      fem: "dog-girl",
      masc: "dog-boy",
      description: "A beer bottle filled with a dark, fizzy liquid.",
    }),
    innoxia_race_wolf_wolf_whiskey: new Item({
      id: "innoxia_race_wolf_wolf_whiskey",
      kind: "tf",
      name: "Wolf Whiskey",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "wolf-morph",
      fem: "wolf-girl",
      masc: "wolf-boy",
      description: "A bottle of strong whiskey with a wolf on the label.",
    }),
    innoxia_race_horse_equine_cider: new Item({
      id: "innoxia_race_horse_equine_cider",
      kind: "tf",
      name: "Equine Cider",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "horse-morph",
      fem: "horse-girl",
      masc: "horse-boy",
      description: "A bottle of sweet cider.",
    }),
    innoxia_race_fox_vulpines_vineyard: new Item({
      id: "innoxia_race_fox_vulpines_vineyard",
      kind: "tf",
      name: "Vulpine's Vineyard",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "fox-morph",
      fem: "fox-girl",
      masc: "fox-boy",
      description: "A bottle of rich red wine.",
    }),
    innoxia_race_harpy_harpy_perfume: new Item({
      id: "innoxia_race_harpy_harpy_perfume",
      kind: "tf",
      name: "Harpy Perfume",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "harpy",
      fem: "harpy",
      masc: "harpy",
      description: "A bottle of floral perfume favoured by harpies.",
    }),
    innoxia_race_harpy_bubblegum_lollipop: new Item({
      id: "innoxia_race_harpy_bubblegum_lollipop",
      kind: "tf",
      name: "Bubblegum Lollipop",
      value: 10,
      soldBy: ["ralph", "vicky"],
      race: "harpy",
      fem: "harpy",
      masc: "harpy",
      description:
        "A bright pink lollipop, with a little ball of gum at its core. Although it doesn't look out of the ordinary, it's somewhat unusual in the fact that it has an incredibly strong smell of bubblegum.",
    }),
    innoxia_race_human_vanilla_water: new Item({
      id: "innoxia_race_human_vanilla_water",
      kind: "tf",
      name: "Vanilla Water",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "human",
      fem: "human",
      masc: "human",
      description: "A bottle of faintly vanilla-scented water.",
    }),
    innoxia_race_demon_liliths_gift: new Item({
      id: "innoxia_race_demon_liliths_gift",
      kind: "tf",
      name: "Lilith's Gift",
      value: 1500,
      soldBy: ["vicky"],
      race: "demon",
      fem: "succubus",
      masc: "incubus",
      description:
        "A bottle of glowing purple liquid. The label simply reads 'Lilith's Gift'.",
    }),
    REJUVENATION_POTION: new Item({
      id: "REJUVENATION_POTION",
      kind: "consumable",
      name: "rejuvenation potion",
      value: 1000,
      soldBy: ["ralph", "vicky"],
      description:
        "Guaranteed to restore over-used orifices and refill all of your fluids.",
    }),
    innoxia_toy_dildo: new Item({
      id: "innoxia_toy_dildo",
      kind: "toy",
      name: "dildo",
      value: 250,
      soldBy: ["ashley"],
      description: "A plain but well-made dildo.",
    }),
    innoxia_toy_vibrator: new Item({
      id: "innoxia_toy_vibrator",
      kind: "toy",
      name: "vibrator",
      value: 300,
      soldBy: ["ashley"],
      description: "A compact vibrator.",
    }),
    innoxia_gift_heart_box: new Item({
      id: "innoxia_gift_heart_box",
      kind: "gift",
      name: "heart-shaped gift box",
      value: 100,
      soldBy: ["ashley"],
      description: "A gift box from Dream Lover.",
    }),
    innoxia_cosmetic_lipstick: new Item({
      id: "innoxia_cosmetic_lipstick",
      kind: "cosmetic",
      name: "Lipstick",
      value: 150,
      soldBy: ["kate"],
      description: "A tube of lipstick from Succubi's Secrets.",
    }),
    ADDICTION_REMOVAL: new Item({
      id: "ADDICTION_REMOVAL",
      kind: "consumable",
      name: "Angel's Nectar",
      value: 750,
      soldBy: ["ralph"],
      description: "A delicate crystal bottle filled with a cool, blue liquid.",
    }),
    FETISH_UNREFINED: new Item({
      id: "FETISH_UNREFINED",
      kind: "consumable",
      name: "unrefined fetish",
      value: 500,
      description:
        "A cloudy vial of unrefined fetish-infused fluid. Official fetish potions are not fully in this build.",
    }),
    DYE_BRUSH: new Item({
      id: "DYE_BRUSH",
      kind: "consumable",
      name: "dye-brush",
      value: 150,
      description:
        "A small brush used to recolour clothing. Dyes are not in this build.",
    }),
  });

  LT.itemType = function (id) {
    return ITEMS[id] || null;
  };

  LT.itemBuyPrice = function (id) {
    var t = ITEMS[id];
    return t ? Math.round(t.value * 1.5) : 0;
  };

  LT.makeItem = function (id) {
    var t = ITEMS[id];
    if (!t) return null;
    var item = t.copy();
    return item;
  };

  LT.shopItemIds = function (seller) {
    var ids = [];
    var id;
    for (id in ITEMS) {
      if (!Object.prototype.hasOwnProperty.call(ITEMS, id)) continue;
      if ((ITEMS[id].soldBy || []).indexOf(seller) >= 0) ids.push(id);
    }
    return ids;
  };

  LT.addItem = function (player, id, count) {
    if (!player) return null;
    player.items = player.items || [];
    var n = count || 1;
    var last = null;
    var i;
    for (i = 0; i < n; i++) {
      last = LT.makeItem(id);
      if (last) player.items.push(last);
    }
    return last;
  };

  LT.countItems = function (player, id) {
    if (!player || !player.items) return 0;
    var n = 0;
    var i;
    for (i = 0; i < player.items.length; i++) {
      if (player.items[i] && player.items[i].id === id) n++;
    }
    return n;
  };

  LT.removeItemById = function (player, id) {
    if (!player || !player.items) return false;
    var i;
    for (i = 0; i < player.items.length; i++) {
      if (player.items[i] && player.items[i].id === id) {
        player.items.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  LT.removeItemByUid = function (player, itemUid) {
    if (!player || !player.items) return null;
    var i;
    for (i = 0; i < player.items.length; i++) {
      if (player.items[i] && player.items[i].uid === itemUid) {
        return player.items.splice(i, 1)[0];
      }
    }
    return null;
  };

  LT.applyTfItem = function (player, type) {
    if (!player || !type || type.kind !== "tf") return "";
    var fem = player.isFeminine
      ? player.isFeminine()
      : !!(player.gender && player.gender.hasBreasts);
    player.raceName = type.race;
    player.fullRace = fem ? type.fem : type.masc;
    if (player.getRaceName) {
      /* keep method */
    } else {
      player.getRaceName = function () {
        return this.fullRace || this.raceName || "human";
      };
    }
    return (
      "<p>You drink the " +
      type.name +
      ". A rush of arcane energy runs through you, and your body settles into that of " +
      (player.fullRace.indexOf("a") === 0 ||
      player.fullRace.indexOf("e") === 0 ||
      player.fullRace.indexOf("i") === 0 ||
      player.fullRace.indexOf("o") === 0 ||
      player.fullRace.indexOf("u") === 0
        ? "an "
        : "a ") +
      player.fullRace +
      ".</p>"
    );
  };

  LT.useCarriedItem = function (player, item) {
    if (!player || !item) return "You cannot use that.";
    var type = ITEMS[item.id];
    if (!type) return "You cannot use that.";
    if (type.kind === "essence") {
      LT.removeItemByUid(player, item.uid);
      return (
        LT.incrementEssenceCount(1, true) ||
        "<p>You drink the bottled essence.</p>"
      );
    }
    if (type.kind === "tf") {
      var tfHtml = "";
      if (
        item.effects &&
        item.effects.length &&
        typeof LT.applyRacialEffects === "function"
      ) {
        tfHtml = LT.applyRacialEffects(player, item);
        if (!tfHtml) tfHtml = LT.applyTfItem(player, type);
      } else {
        tfHtml = LT.applyTfItem(player, type);
      }
      LT.removeItemByUid(player, item.uid);
      return tfHtml || "<p>You drink the " + type.name + ".</p>";
    }
    if (type.kind === "consumable") {
      LT.removeItemByUid(player, item.uid);
      return "<p>You use the " + type.name + ". You feel refreshed.</p>";
    }
    if (type.kind === "toy") {
      return (
        "<p>You turn the " +
        type.name +
        " over in your hands. It will be more useful during sex than here in your bag.</p>"
      );
    }
    if (type.kind === "gift") {
      return "<p>A neatly wrapped gift. Someone special might appreciate this more than you opening it yourself.</p>";
    }
    if (type.kind === "cosmetic") {
      LT.removeItemByUid(player, item.uid);
      player.makeup = true;
      return "<p>You apply the " + type.name + ".</p>";
    }
    if (type.kind === "collar") {
      return "<p>The metal collar is meant to be locked around a defeated criminal's neck, not worn for show. You'll need a slaver license and a target first.</p>";
    }
    return "You cannot use that.";
  };

  LT.buyItem = function (player, id) {
    var type = ITEMS[id];
    if (!type) return "<p>That is not for sale.</p>";
    var price = LT.itemBuyPrice(id);
    if (typeof LT.getMoney === "function" && LT.getMoney() < price) {
      return (
        "<p>You cannot afford the " + type.name + " (" + price + " flames).</p>"
      );
    }
    if (typeof LT.incrementMoney === "function") LT.incrementMoney(-price);
    LT.addItem(player, id);
    return "<p>You buy the " + type.name + " for " + price + " flames.</p>";
  };

  LT.itemShopHtml = function (seller, intro) {
    var ids = LT.shopItemIds(seller);
    var html = intro || "";
    var i;
    html +=
      "<p>You have <b>£" +
      ((LT.game.player && LT.game.player.money) || 0) +
      "</b>.</p><ul>";
    for (i = 0; i < ids.length; i++) {
      var t = ITEMS[ids[i]];
      html +=
        "<li><b>" +
        t.name +
        "</b> — " +
        LT.itemBuyPrice(ids[i]) +
        " flames. " +
        (t.description || "") +
        "</li>";
    }
    html += "</ul>";
    return html;
  };

  LT.itemShopResponses = function (seller, leaveNode) {
    var list = [
      new LT.Response("Leave", "Step away from the counter.", leaveNode),
    ];
    var ids = LT.shopItemIds(seller);
    var i;
    for (i = 0; i < ids.length; i++) {
      (function (id) {
        var type = ITEMS[id];
        var price = LT.itemBuyPrice(id);
        var title = type.name + " (" + price + ")";
        if (typeof LT.getMoney === "function" && LT.getMoney() < price) {
          list.push(
            new LT.Response(title, "You cannot afford that.", null).disable(
              "You need " + price + " flames.",
            ),
          );
        } else {
          list.push(
            new LT.Response(
              title,
              "Buy " + type.name + " for " + price + " flames.",
              null,
              function () {
                LT.game.textStart = LT.buyItem(LT.game.player, id);
                LT.game.setContent(LT.game.currentNode);
              },
            ),
          );
        }
      })(ids[i]);
    }
    return list;
  };
})();
