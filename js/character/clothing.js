(function () {
  function C(id, name, slot, colour, colourName, covers) {
    return { id: id, name: name, slot: slot, colour: colour, colourName: colourName, covers: covers || [slot] };
  }

  LT.SLOTS = [
    { id: "head", label: "Head" },
    { id: "eyes", label: "Eyes" },
    { id: "mouth", label: "Mouth" },
    { id: "neck", label: "Neck" },
    { id: "torsoOver", label: "Over-torso" },
    { id: "torso", label: "Torso" },
    { id: "chest", label: "Chest" },
    { id: "stomach", label: "Stomach" },
    { id: "wrist", label: "Wrists" },
    { id: "finger", label: "Fingers" },
    { id: "hand", label: "Hands" },
    { id: "hips", label: "Hips" },
    { id: "groin", label: "Groin" },
    { id: "leg", label: "Legs" },
    { id: "sock", label: "Socks" },
    { id: "ankle", label: "Ankles" },
    { id: "foot", label: "Feet" },
  ];

  var CAT = (LT.CLOTHING = {});
  function add(item) {
    CAT[item.id] = item;
    return item;
  }

  add(C("briefs", "briefs", "groin", "#ffffff", "white"));
  add(C("boxers", "boxers", "groin", "#222222", "black"));
  add(C("panties", "panties", "groin", "#ffffff", "white"));
  add(C("thong", "thong", "groin", "#222222", "black"));
  add(C("lacy_panties", "lacy panties", "groin", "#c0392b", "red"));
  add(C("plunge_bra", "plunge bra", "chest", "#ffffff", "white"));
  add(C("plunge_bra_black", "plunge bra", "chest", "#222222", "black"));
  add(C("crop_bra", "croptop bra", "chest", "#ffffff", "white"));
  add(C("lacy_bra", "lacy plunge bra", "chest", "#c0392b", "red"));
  add(C("fullcup_bra", "fullcup bra", "chest", "#222222", "black"));
  add(C("shirt_long", "long-sleeved shirt", "torso", "#ffffff", "white", ["torso", "chest"]));
  add(C("shirt_short", "short-sleeved shirt", "torso", "#ffffff", "white", ["torso", "chest"]));
  add(C("tshirt", "t-shirt", "torso", "#6f9be3", "light blue", ["torso", "chest"]));
  add(C("blouse", "blouse", "torso", "#6f9be3", "light blue", ["torso", "chest"]));
  add(C("skater_dress", "skater dress", "torso", "#222222", "black", ["torso", "chest", "groin", "leg"]));
  add(C("slip_dress", "slip dress", "torso", "#7b2d3b", "burgundy", ["torso", "chest", "groin", "leg"]));
  add(C("suit_jacket", "suit jacket", "torsoOver", "#222222", "black"));
  add(C("hoodie", "hoodie", "torsoOver", "#222222", "black"));
  add(C("jumper", "ribbed jumper", "torsoOver", "#777777", "grey"));
  add(C("cardigan", "open-front cardigan", "torsoOver", "#222222", "black"));
  add(C("winter_coat", "winter coat", "torsoOver", "#222222", "black"));
  add(C("trousers", "trousers", "leg", "#222222", "black", ["leg", "groin"]));
  add(C("jeans", "jeans", "leg", "#6b7c93", "blue-grey", ["leg", "groin"]));
  add(C("cargo", "cargo trousers", "leg", "#222222", "black", ["leg", "groin"]));
  add(C("skirt", "skirt", "leg", "#222222", "black", ["leg", "groin"]));
  add(C("yoga", "yoga pants", "leg", "#f5a8ff", "pink", ["leg", "groin"]));
  add(C("socks", "socks", "sock", "#222222", "black"));
  add(C("socks_white", "socks", "sock", "#ffffff", "white"));
  add(C("trainer_socks", "trainer socks", "sock", "#ffffff", "white"));
  add(C("pantyhose", "pantyhose", "sock", "#222222", "black"));
  add(C("kneehigh", "knee-high socks", "sock", "#ffffff", "white"));
  add(C("smart_shoes", "smart shoes", "foot", "#222222", "black"));
  add(C("heels", "heels", "foot", "#222222", "black"));
  add(C("stilettos", "stiletto heels", "foot", "#7b2d3b", "burgundy"));
  add(C("skaters", "skater shoes", "foot", "#c0392b", "red"));
  add(C("trainers", "trainers", "foot", "#ffffff", "white"));
  add(C("tie", "tie", "neck", "#c0392b", "red"));
  add(C("heart_necklace", "heart necklace", "neck", "#c0c0c0", "silver"));
  add(C("heart_necklace_gold", "heart necklace", "neck", "#e3c66f", "gold"));
  add(C("scarf", "scarf", "neck", "#222222", "black"));
  add(C("ring_gold", "ring", "finger", "#e3c66f", "gold"));
  add(C("ring_silver", "ring", "finger", "#c0c0c0", "silver"));
  add(C("watch_gold", "watch", "wrist", "#e3c66f", "gold"));
  add(C("watch_silver", "watch", "wrist", "#c0c0c0", "silver"));
  add(C("watch_pink", "women's watch", "wrist", "#f5a8ff", "pink"));
  add(C("watch_black", "women's watch", "wrist", "#222222", "black"));

  function copy(item) {
    return {
      id: item.id,
      name: item.name,
      slot: item.slot,
      colour: item.colour,
      colourName: item.colourName,
      covers: item.covers.slice(),
      uid: item.id + "_" + Math.random().toString(36).slice(2, 8),
    };
  }

  LT.makeClothing = function (id) {
    return copy(CAT[id]);
  };

  LT.coversArea = function (player, area) {
    var slots = Object.keys(player.equipped || {});
    for (var i = 0; i < slots.length; i++) {
      var item = player.equipped[slots[i]];
      if (!item) continue;
      for (var j = 0; j < item.covers.length; j++) if (item.covers[j] === area) return true;
    }
    return false;
  };

  LT.creationClothedEnough = function (player) {
    var feet = !!player.equipped.foot;
    var groin = LT.coversArea(player, "groin");
    var chest = LT.coversArea(player, "chest") || (player.breastSize && player.breastSize.id === "FLAT");
    return feet && groin && chest;
  };

  LT.dressPlayer = function (player) {
    player.equipped = {};
    player.wardrobe = [];
    var fem = player.getFemininity().id;
    var wear = [];
    var pile = [];
    if (fem === "MASCULINE_STRONG") {
      wear = ["briefs", "shirt_long", "tie", "suit_jacket", "trousers", "socks", "smart_shoes", "ring_gold", "watch_gold"];
      pile = ["boxers", "shirt_short", "tshirt", "jeans", "cargo", "hoodie", "jumper", "skaters", "trainers", "scarf"];
    } else if (fem === "MASCULINE") {
      wear = ["boxers", "shirt_short", "trousers", "socks", "smart_shoes", "ring_silver", "watch_silver"];
      pile = ["briefs", "shirt_long", "tshirt", "jeans", "cargo", "hoodie", "jumper", "skaters", "trainers", "tie", "suit_jacket"];
    } else if (fem === "ANDROGYNOUS") {
      wear = ["panties", "crop_bra", "shirt_short", "jeans", "socks_white", "skaters"];
      pile = ["boxers", "briefs", "thong", "trousers", "skirt", "yoga", "heels", "hoodie", "tshirt", "blouse"];
    } else if (fem === "FEMININE_STRONG") {
      wear = ["thong", "plunge_bra_black", "slip_dress", "pantyhose", "stilettos", "watch_black", "ring_gold", "heart_necklace_gold"];
      pile = ["panties", "lacy_panties", "lacy_bra", "fullcup_bra", "skater_dress", "heels", "kneehigh", "cardigan", "winter_coat"];
    } else {
      wear = ["panties", "plunge_bra", "skater_dress", "trainer_socks", "heels", "watch_pink", "ring_silver", "heart_necklace"];
      pile = ["thong", "lacy_panties", "lacy_bra", "fullcup_bra", "slip_dress", "blouse", "skirt", "yoga", "cardigan", "winter_coat", "kneehigh"];
    }
    for (var i = 0; i < wear.length; i++) {
      var w = LT.makeClothing(wear[i]);
      player.equipped[w.slot] = w;
    }
    for (var j = 0; j < pile.length; j++) player.wardrobe.push(LT.makeClothing(pile[j]));
  };

  LT.unequipToWardrobe = function (player, slot) {
    var item = player.equipped[slot];
    if (!item) return false;
    if (typeof LT.itemIsSealed === "function" && LT.itemIsSealed(item)) {
      var cost = LT.sealBreakCost(item);
      if ((player.essences || 0) < cost) {
        if (LT.game) {
          LT.game.textStart =
            "<p>The " +
            item.name +
            " is sealed to you. You need " +
            cost +
            " arcane essences to force it off.</p>";
        }
        return false;
      }
      if (typeof LT.incrementEssenceCount === "function") LT.incrementEssenceCount(-cost, false);
      if (LT.game) {
        LT.game.textStart =
          "<p>You spend " + cost + " arcane essence" + (cost === 1 ? "" : "s") + " and break the seal on the " + item.name + ".</p>";
      }
    }
    delete player.equipped[slot];
    player.wardrobe.push(item);
    if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
    return true;
  };

  LT.clothingValue = function (itemOrId) {
    var item = typeof itemOrId === "string" ? CAT[itemOrId] : itemOrId;
    if (!item) return 0;
    if (item.value) return item.value;
    var slot = item.slot;
    var covers = item.covers || [slot];
    if (covers.length >= 3) return 500;
    if (slot === "groin" || slot === "chest") return 150;
    if (slot === "torso") return 250;
    if (slot === "torsoOver") return 400;
    if (slot === "leg") return 300;
    if (slot === "foot") return 250;
    if (slot === "sock") return 80;
    return 200;
  };

  LT.clothingBuyPrice = function (itemOrId) {
    return Math.round(LT.clothingValue(itemOrId) * 1.5);
  };

  LT.nyanStock = function (group) {
    var female = ["panties", "thong", "lacy_panties", "plunge_bra", "plunge_bra_black", "crop_bra", "lacy_bra", "fullcup_bra", "blouse", "skater_dress", "slip_dress", "skirt", "yoga", "heels", "stilettos", "watch_pink", "watch_black", "heart_necklace", "heart_necklace_gold"];
    var male = ["briefs", "boxers", "shirt_long", "shirt_short", "trousers", "jeans", "cargo", "smart_shoes", "tie", "watch_gold", "watch_silver"];
    var unisex = ["tshirt", "hoodie", "jumper", "cardigan", "winter_coat", "socks", "socks_white", "trainer_socks", "pantyhose", "kneehigh", "skaters", "trainers", "scarf", "ring_gold", "ring_silver"];
    if (group === "female") return female;
    if (group === "male") return male;
    return unisex;
  };

  LT.equipFromWardrobe = function (player, uid) {
    var idx = -1;
    for (var i = 0; i < player.wardrobe.length; i++) if (player.wardrobe[i].uid === uid) idx = i;
    if (idx < 0) return;
    var item = player.wardrobe.splice(idx, 1)[0];
    if (player.equipped[item.slot]) {
      if (LT.unequipToWardrobe(player, item.slot) === false) {
        player.wardrobe.splice(idx, 0, item);
        return false;
      }
    }
    player.equipped[item.slot] = item;
    if (typeof LT.reapplyWornEnchantments === "function") LT.reapplyWornEnchantments(player);
    return true;
  };
})();
