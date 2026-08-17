(function () {
  
  class Clothing extends LT.item {
    constructor(id, name, slot, colour, colourName, covers) {
      opts = {
        id:id,
        name:name,
        type:"clothing"
      }
      super(opts)
      this.slot = slot;
      this.colour = colour;
      this.colourName = colourName;
      this.covers = covers || [slot];
    }
  }
  class Slot {
    constructor(id,label,active) {
      this.id = id;
      this.label = label;
      this.active = active === undefined ? true : active;
      this.covered = false;
      this.visible = true; // Could a character make out what's under this slot? (e.g. a bra under a shirt)
      this.coveredBy = null;
      this.flags = {};
      this.owner = null;
    }
    get owner() {
      return this.owner
    }
    set owner(id) {
      this.owner = id
    }

  }
  LT.SLOTS = [
    new Slot("head", "Head"),
    new Slot("eyes", "Eyes"),
    new Slot("mouth", "Mouth"),
    new Slot("neck", "Neck"),
    new Slot("torsoOver", "Over-torso"),
    new Slot("torso", "Torso"),
    new Slot("chest", "Chest"),
    new Slot("stomach", "Stomach"),
    new Slot("wrist", "Wrists"),
    new Slot("finger", "Fingers"),
    new Slot("hand", "Hands"),
    new Slot("hips", "Hips"),
    new Slot("groin", "Groin"),
    new Slot("leg", "Legs"),
    new Slot("thigh", "Thighs"),
    new Slot("calf", "Calves"),
    new Slot("sock", "Socks"),
    new Slot("ankle", "Ankles"),
    new Slot("foot", "Feet"),
    new Slot("nipple", "Nipples"),
    new Slot("anus", "Anus"),
    new Slot("tail", "Tail",false),
    new Slot("penis", "Penis", false),
    new Slot("vagina", "Vagina", false),
    new Slot("clit", "Clitoris", false),
  ];

  var CAT = (LT.CLOTHING = {});
  function add(item) {
    CAT[item.id] = item;
    return item;
  }

  add(new Clothing("briefs", "briefs", "groin", "#ffffff", "white"));
  add(new Clothing("boxers", "boxers", "groin", "#222222", "black"));
  add(new Clothing("panties", "panties", "groin", "#ffffff", "white"));
  add(new Clothing("thong", "thong", "groin", "#222222", "black"));
  add(new Clothing("lacy_panties", "lacy panties", "groin", "#c0392b", "red"));
  add(new Clothing("plunge_bra", "plunge bra", "chest", "#ffffff", "white"));
  add(new Clothing("plunge_bra_black", "plunge bra", "chest", "#222222", "black"));
  add(new Clothing("crop_bra", "croptop bra", "chest", "#ffffff", "white"));
  add(new Clothing("lacy_bra", "lacy plunge bra", "chest", "#c0392b", "red"));
  add(new Clothing("fullcup_bra", "fullcup bra", "chest", "#222222", "black"));
  add(new Clothing("shirt_long", "long-sleeved shirt", "torso", "#ffffff", "white", ["torso", "chest"]));
  add(new Clothing("shirt_short", "short-sleeved shirt", "torso", "#ffffff", "white", ["torso", "chest"]));
  add(new Clothing("tshirt", "t-shirt", "torso", "#6f9be3", "light blue", ["torso", "chest"]));
  add(new Clothing("blouse", "blouse", "torso", "#6f9be3", "light blue", ["torso", "chest"]));
  add(new Clothing("skater_dress", "skater dress", "torso", "#222222", "black", ["torso", "chest", "groin", "leg"]));
  add(new Clothing("slip_dress", "slip dress", "torso", "#7b2d3b", "burgundy", ["torso", "chest", "groin", "leg"]));
  add(new Clothing("suit_jacket", "suit jacket", "torsoOver", "#222222", "black"));
  add(new Clothing("hoodie", "hoodie", "torsoOver", "#222222", "black"));
  add(new Clothing("jumper", "ribbed jumper", "torsoOver", "#777777", "grey"));
  add(new Clothing("cardigan", "open-front cardigan", "torsoOver", "#222222", "black"));
  add(new Clothing("winter_coat", "winter coat", "torsoOver", "#222222", "black"));
  add(new Clothing("trousers", "trousers", "leg", "#222222", "black", ["leg", "groin"]));
  add(new Clothing("jeans", "jeans", "leg", "#6b7c93", "blue-grey", ["leg", "groin"]));
  add(new Clothing("cargo", "cargo trousers", "leg", "#222222", "black", ["leg", "groin"]));
  add(new Clothing("skirt", "skirt", "leg", "#222222", "black", ["leg", "groin"]));
  add(new Clothing("yoga", "yoga pants", "leg", "#f5a8ff", "pink", ["leg", "groin"]));
  add(new Clothing("socks", "socks", "sock", "#222222", "black"));
  add(new Clothing("socks_white", "socks", "sock", "#ffffff", "white"));
  add(new Clothing("trainer_socks", "trainer socks", "sock", "#ffffff", "white"));
  add(new Clothing("pantyhose", "pantyhose", "sock", "#222222", "black"));
  add(new Clothing("kneehigh", "knee-high socks", "sock", "#ffffff", "white"));
  add(new Clothing("smart_shoes", "smart shoes", "foot", "#222222", "black"));
  add(new Clothing("heels", "heels", "foot", "#222222", "black"));
  add(new Clothing("stilettos", "stiletto heels", "foot", "#7b2d3b", "burgundy"));
  add(new Clothing("skaters", "skater shoes", "foot", "#c0392b", "red"));
  add(new Clothing("trainers", "trainers", "foot", "#ffffff", "white"));
  add(new Clothing("tie", "tie", "neck", "#c0392b", "red"));
  add(new Clothing("heart_necklace", "heart necklace", "neck", "#c0c0c0", "silver"));
  add(new Clothing("heart_necklace_gold", "heart necklace", "neck", "#e3c66f", "gold"));
  add(new Clothing("scarf", "scarf", "neck", "#222222", "black"));
  add(new Clothing("ring_gold", "ring", "finger", "#e3c66f", "gold"));
  add(new Clothing("ring_silver", "ring", "finger", "#c0c0c0", "silver"));
  add(new Clothing("watch_gold", "watch", "wrist", "#e3c66f", "gold"));
  add(new Clothing("watch_silver", "watch", "wrist", "#c0c0c0", "silver"));
  add(new Clothing("watch_pink", "women's watch", "wrist", "#f5a8ff", "pink"));
  add(new Clothing("watch_black", "women's watch", "wrist", "#222222", "black"));

  function copy(item) {
    var item = structuredClone(item)
    item.genUid(item.id)
    return item
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
