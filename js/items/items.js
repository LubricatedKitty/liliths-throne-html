(function () {
  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 8);
  }

  var ITEMS = (LT.ITEMS = {
    innoxia_items_essence_arcane: {
      id: "innoxia_items_essence_arcane",
      kind: "essence",
      name: "bottled arcane essence",
      value: 0,
      description: "A small vial containing a swirling pink shard of arcane essence. Drinking it returns the essence to your aura.",
    },
    innoxia_quest_paint_can_premium: {
      id: "innoxia_quest_paint_can_premium",
      kind: "quest",
      name: "'Purple-star' golden paint",
      value: 1500,
      description: "A can of golden paint, branded with the premium-grade 'Purple-star' logo, which you purchased from 'Argus's DIY Depot'. Hopefully Helena will appreciate how much this cost...",
    },
    innoxia_quest_paint_can: {
      id: "innoxia_quest_paint_can",
      kind: "quest",
      name: "'Bronze-star' golden paint",
      value: 250,
      description: "A can of golden paint, branded with the standard-grade 'Bronze-star' logo, which you purchased from 'Argus's DIY Depot'. Hopefully Helena won't be disappointed with this...",
    },
    innoxia_quest_rolled_up_posters: {
      id: "innoxia_quest_rolled_up_posters",
      kind: "quest",
      name: "rolled-up enchanted posters",
      value: 0,
      description: "Half a dozen rolled-up posters, given to you by Helena with the order to paste them onto the walls near the entrance to Slaver Alley.",
    },
    innoxia_bdsm_metal_collar: {
      id: "innoxia_bdsm_metal_collar",
      kind: "collar",
      name: "metal collar",
      value: 2500,
      soldBy: ["finch"],
      description: "A sturdy metal slave collar. The ring on the front glows when held near a wanted criminal.",
    },
    innoxia_race_cat_felines_fancy: {
      id: "innoxia_race_cat_felines_fancy",
      kind: "tf",
      name: "Feline's Fancy",
      value: 150,
      officialValue: 150,
      alcohol: 0.1,
      soldBy: ["ralph", "vicky"],
      race: "cat-morph",
      fem: "cat-girl",
      masc: "cat-boy",
      description: "A delicate glass bottle filled with a thick, cream-like liquid.",
    },
    innoxia_race_dog_canine_crush: {
      id: "innoxia_race_dog_canine_crush",
      kind: "tf",
      name: "Canine Crush",
      value: 150,
      officialValue: 35,
      alcohol: 0.05,
      soldBy: ["ralph", "vicky"],
      race: "dog-morph",
      fem: "dog-girl",
      masc: "dog-boy",
      description: "A beer bottle filled with a dark, fizzy liquid.",
    },
    innoxia_race_wolf_wolf_whiskey: {
      id: "innoxia_race_wolf_wolf_whiskey",
      kind: "tf",
      name: "Wolf Whiskey",
      value: 150,
      officialValue: 120,
      alcohol: 0.4,
      soldBy: ["ralph", "vicky"],
      race: "wolf-morph",
      fem: "wolf-girl",
      masc: "wolf-boy",
      description: "A bottle of strong whiskey with a wolf on the label.",
    },
    innoxia_race_horse_equine_cider: {
      id: "innoxia_race_horse_equine_cider",
      kind: "tf",
      name: "Equine Cider",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "horse-morph",
      fem: "horse-girl",
      masc: "horse-boy",
      description: "A bottle of sweet cider.",
    },
    innoxia_race_fox_vulpines_vineyard: {
      id: "innoxia_race_fox_vulpines_vineyard",
      kind: "tf",
      name: "Vulpine's Vineyard",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "fox-morph",
      fem: "fox-girl",
      masc: "fox-boy",
      description: "A bottle of rich red wine.",
    },
    innoxia_race_harpy_harpy_perfume: {
      id: "innoxia_race_harpy_harpy_perfume",
      kind: "tf",
      name: "Harpy Perfume",
      value: 150,
      soldBy: ["ralph", "vicky"],
      race: "harpy",
      fem: "harpy",
      masc: "harpy",
      description: "A bottle of floral perfume favoured by harpies.",
    },
    innoxia_race_harpy_bubblegum_lollipop: {
      id: "innoxia_race_harpy_bubblegum_lollipop",
      kind: "tf",
      name: "Bubblegum Lollipop",
      value: 10,
      soldBy: ["ralph", "vicky"],
      race: "harpy",
      fem: "harpy",
      masc: "harpy",
      description: "A bright pink lollipop, with a little ball of gum at its core. Although it doesn't look out of the ordinary, it's somewhat unusual in the fact that it has an incredibly strong smell of bubblegum.",
    },
    innoxia_race_human_vanilla_water: {
      id: "innoxia_race_human_vanilla_water",
      kind: "tf",
      name: "Vanilla Water",
      value: 150,
      officialValue: 10,
      alcohol: 0,
      soldBy: ["ralph", "vicky"],
      race: "human",
      fem: "human",
      masc: "human",
      description: "A bottle of faintly vanilla-scented water.",
    },
    innoxia_race_rat_black_rats_rum: {
      id: "innoxia_race_rat_black_rats_rum",
      kind: "tf",
      name: "Black Rat's Rum",
      value: 200,
      officialValue: 200,
      alcohol: 0.5,
      soldBy: ["ralph", "vicky"],
      race: "rat-morph",
      fem: "rat-girl",
      masc: "rat-boy",
      description: "A glass bottle of orange-coloured Black Rat's Rum.",
    },
    innoxia_race_demon_liliths_gift: {
      id: "innoxia_race_demon_liliths_gift",
      kind: "tf",
      name: "Lilith's Gift",
      value: 1500,
      soldBy: ["vicky"],
      race: "demon",
      fem: "succubus",
      masc: "incubus",
      description: "A bottle of glowing purple liquid. The label simply reads 'Lilith's Gift'.",
    },
    REJUVENATION_POTION: {
      id: "REJUVENATION_POTION",
      kind: "consumable",
      name: "rejuvenation potion",
      value: 1000,
      soldBy: ["ralph", "vicky"],
      description: "Guaranteed to restore over-used orifices and refill all of your fluids.",
    },
    innoxia_toy_dildo: {
      id: "innoxia_toy_dildo",
      kind: "toy",
      name: "dildo",
      value: 250,
      soldBy: ["ashley"],
      description: "A plain but well-made dildo.",
    },
    innoxia_toy_vibrator: {
      id: "innoxia_toy_vibrator",
      kind: "toy",
      name: "vibrator",
      value: 300,
      soldBy: ["ashley"],
      description: "A compact vibrator.",
    },
    innoxia_gift_heart_box: {
      id: "innoxia_gift_heart_box",
      kind: "gift",
      name: "heart-shaped gift box",
      value: 100,
      soldBy: ["ashley"],
      description: "A gift box from Dream Lover.",
    },
    innoxia_gift_rose_bouquet: {
      id: "innoxia_gift_rose_bouquet",
      kind: "gift",
      name: "Rose Bouquet",
      value: 500,
      soldBy: ["ashley"],
      helenaGift: "GIFT_ROSES",
      helenaAff: 10,
      description: "A bouquet filled with roses of many colours, it smells pleasant even from a distance.",
    },
    innoxia_gift_chocolates: {
      id: "innoxia_gift_chocolates",
      kind: "gift",
      name: "Chocolates",
      value: 300,
      soldBy: ["ashley"],
      helenaGift: "GIFT_CHOCOLATES",
      helenaAff: 5,
      description: "A box filled with various chocolates.",
    },
    innoxia_gift_perfume: {
      id: "innoxia_gift_perfume",
      kind: "gift",
      name: "Rose Perfume",
      value: 300,
      soldBy: ["ashley"],
      helenaGift: "GIFT_PERFUME",
      helenaAff: 5,
      description: "A small bottle of rose perfume.",
    },
    innoxia_gift_teddy_bear: {
      id: "innoxia_gift_teddy_bear",
      kind: "gift",
      name: "Teddy Bear",
      value: 600,
      soldBy: ["ashley"],
      helenaGift: "GIFT_TEDDY_BEAR",
      helenaAff: -5,
      description: "A cute brown teddy bear, with the words 'Hug me!' sewed onto a little heart that it's holding.",
    },
    innoxia_cosmetic_lipstick: {
      id: "innoxia_cosmetic_lipstick",
      kind: "cosmetic",
      name: "Lipstick",
      value: 150,
      soldBy: ["kate"],
      description: "A tube of lipstick from Succubi's Secrets.",
    },
    innoxia_quest_gym_membership_card: {
      id: "innoxia_quest_gym_membership_card",
      kind: "quest",
      name: "Gym membership card",
      value: 0,
      description: "A rather disappointingly-flimsy cardboard membership card for Pix's Playground.",
    },
    ADDICTION_REMOVAL: {
      id: "ADDICTION_REMOVAL",
      kind: "consumable",
      name: "Angel's Nectar",
      value: 750,
      soldBy: ["ralph"],
      description: "A delicate crystal bottle filled with a cool, blue liquid.",
    },
    FETISH_UNREFINED: {
      id: "FETISH_UNREFINED",
      kind: "consumable",
      name: "unrefined fetish",
      value: 500,
      description: "A cloudy vial of unrefined fetish-infused fluid. Official fetish potions are not fully in this build.",
    },
    DYE_BRUSH: {
      id: "DYE_BRUSH",
      kind: "consumable",
      name: "dye-brush",
      value: 150,
      description: "A small brush used to recolour clothing. Dyes are not in this build.",
    },
  });

  LT.itemType = function (id) {
    return ITEMS[id] || null;
  };

  LT.itemBuyPrice = function (id) {
    var t = ITEMS[id];
    if (!t) return 0;
    var price = Math.round(t.value * 1.5);
    if ((t.soldBy || []).indexOf("ralph") >= 0 && typeof LT.ralphDiscountActive === "function" && LT.ralphDiscountActive()) {
      price = Math.round((price * (100 - LT.ralphDiscount())) / 100);
    }
    return price;
  };

  LT.makeItem = function (id) {
    var t = ITEMS[id];
    if (!t) return null;
    return {
      kind: t.kind,
      id: t.id,
      name: t.name,
      value: t.value,
      uid: uid(t.kind || "item"),
    };
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
    var fem = player.isFeminine ? player.isFeminine() : !!(player.gender && player.gender.hasBreasts);
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
      (player.fullRace.indexOf("a") === 0 || player.fullRace.indexOf("e") === 0 || player.fullRace.indexOf("i") === 0 || player.fullRace.indexOf("o") === 0 || player.fullRace.indexOf("u") === 0 ? "an " : "a ") +
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
      return LT.incrementEssenceCount(1, true) || "<p>You drink the bottled essence.</p>";
    }
    if (type.kind === "tf") {
      var tfHtml = "";
      if (item.effects && item.effects.length && typeof LT.applyRacialEffects === "function") {
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
      return "<p>You turn the " + type.name + " over in your hands. It will be more useful during sex than here in your bag.</p>";
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
      return "<p>You cannot afford the " + type.name + " (" + price + " flames).</p>";
    }
    if (typeof LT.incrementMoney === "function") LT.incrementMoney(-price);
    LT.addItem(player, id);
    return "<p>You buy the " + type.name + " for " + price + " flames.</p>";
  };

  LT.itemShopHtml = function (seller, intro) {
    var ids = LT.shopItemIds(seller);
    var html = intro || "";
    var i;
    html += "<p>You have <b>£" + ((LT.game.player && LT.game.player.money) || 0) + "</b>.</p><ul>";
    for (i = 0; i < ids.length; i++) {
      var t = ITEMS[ids[i]];
      html += "<li><b>" + t.name + "</b> — " + LT.itemBuyPrice(ids[i]) + " flames. " + (t.description || "") + "</li>";
    }
    html += "</ul>";
    return html;
  };

  LT.itemShopResponses = function (seller, leaveNode) {
    var list = [new LT.Response("Leave", "Step away from the counter.", leaveNode)];
    var ids = LT.shopItemIds(seller);
    var i;
    for (i = 0; i < ids.length; i++) {
      (function (id) {
        var type = ITEMS[id];
        var price = LT.itemBuyPrice(id);
        var title = type.name + " (" + price + ")";
        if (typeof LT.getMoney === "function" && LT.getMoney() < price) {
          list.push(new LT.Response(title, "You cannot afford that.", null).disable("You need " + price + " flames."));
        } else {
          list.push(
            new LT.Response(title, "Buy " + type.name + " for " + price + " flames.", null, function () {
              LT.game.textStart = LT.buyItem(LT.game.player, id);
              LT.game.setContent(LT.game.currentNode);
            }),
          );
        }
      })(ids[i]);
    }
    return list;
  };
})();
