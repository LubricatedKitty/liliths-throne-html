(function () {
  LT.TF_POTENCY = {
    MAJOR_DRAIN: { id: "MAJOR_DRAIN", name: "Major Drain", value: 8, clothingBonus: -3, colour: "#e36f6f", negative: true },
    DRAIN: { id: "DRAIN", name: "Drain", value: 4, clothingBonus: -2, colour: "#e36f6f", negative: true },
    MINOR_DRAIN: { id: "MINOR_DRAIN", name: "Minor Drain", value: 1, clothingBonus: -1, colour: "#e39a6f", negative: true },
    MINOR_BOOST: { id: "MINOR_BOOST", name: "Minor Boost", value: 1, clothingBonus: 1, colour: "#8dbe57", negative: false },
    BOOST: { id: "BOOST", name: "Boost", value: 4, clothingBonus: 2, colour: "#57be7e", negative: false },
    MAJOR_BOOST: { id: "MAJOR_BOOST", name: "Major Boost", value: 8, clothingBonus: 3, colour: "#6fd4e3", negative: false },
  };

  var RARITY_COST = { COMMON: 1, UNCOMMON: 2, RARE: 4, EPIC: 8, LEGENDARY: 12 };

  function mod(id, name, rarity, extra) {
    extra = extra || {};
    extra.id = id;
    extra.name = name;
    extra.rarity = rarity;
    extra.value = RARITY_COST[rarity] || 1;
    return extra;
  }

  LT.TF_MODIFIER = {
    NONE: mod("NONE", "Empty", "COMMON"),
    CLOTHING_MAJOR_ATTRIBUTE: mod("CLOTHING_MAJOR_ATTRIBUTE", "core attribute", "LEGENDARY"),
    CLOTHING_ATTRIBUTE: mod("CLOTHING_ATTRIBUTE", "attribute", "UNCOMMON"),
    CLOTHING_SPECIAL: mod("CLOTHING_SPECIAL", "special effects", "LEGENDARY"),
    CLOTHING_SEALING: mod("CLOTHING_SEALING", "sealing", "LEGENDARY"),
    HEALTH_MAXIMUM: mod("HEALTH_MAXIMUM", "maximum health", "EPIC", { attr: "health" }),
    MANA_MAXIMUM: mod("MANA_MAXIMUM", "maximum aura", "EPIC", { attr: "mana" }),
    STRENGTH: mod("STRENGTH", "physique", "LEGENDARY", { attr: "physique" }),
    INTELLIGENCE: mod("INTELLIGENCE", "arcane", "LEGENDARY", { attr: "arcane" }),
    CORRUPTION: mod("CORRUPTION", "corruption", "LEGENDARY", { attr: "corruption" }),
    FERTILITY: mod("FERTILITY", "fertility", "RARE", { attr: "fertility" }),
    VIRILITY: mod("VIRILITY", "virility", "RARE", { attr: "virility" }),
    DAMAGE_UNARMED: mod("DAMAGE_UNARMED", "unarmed damage", "RARE", { attr: "damageUnarmed" }),
    DAMAGE_MELEE_WEAPON: mod("DAMAGE_MELEE_WEAPON", "melee weapon damage", "RARE", { attr: "damageMelee" }),
    DAMAGE_RANGED_WEAPON: mod("DAMAGE_RANGED_WEAPON", "ranged weapon damage", "RARE", { attr: "damageRanged" }),
    DAMAGE_PHYSICAL: mod("DAMAGE_PHYSICAL", "physical damage", "RARE", { attr: "damagePhysical" }),
    DAMAGE_LUST: mod("DAMAGE_LUST", "lust damage", "RARE", { attr: "damageLust" }),
    DAMAGE_FIRE: mod("DAMAGE_FIRE", "fire damage", "RARE", { attr: "damageFire" }),
    DAMAGE_ICE: mod("DAMAGE_ICE", "ice damage", "RARE", { attr: "damageIce" }),
    DAMAGE_POISON: mod("DAMAGE_POISON", "poison damage", "RARE", { attr: "damagePoison" }),
    DAMAGE_SPELLS: mod("DAMAGE_SPELLS", "spell damage", "RARE", { attr: "damageSpells" }),
    RESISTANCE_PHYSICAL: mod("RESISTANCE_PHYSICAL", "physical resistance", "RARE", { attr: "resistPhysical" }),
    RESISTANCE_LUST: mod("RESISTANCE_LUST", "lust resistance", "RARE", { attr: "resistLust" }),
    RESISTANCE_FIRE: mod("RESISTANCE_FIRE", "fire resistance", "RARE", { attr: "resistFire" }),
    RESISTANCE_ICE: mod("RESISTANCE_ICE", "ice resistance", "RARE", { attr: "resistIce" }),
    RESISTANCE_POISON: mod("RESISTANCE_POISON", "poison resistance", "RARE", { attr: "resistPoison" }),
    SPELL_COST_MODIFIER: mod("SPELL_COST_MODIFIER", "spell cost", "RARE", { attr: "spellCost" }),
    CRITICAL_DAMAGE: mod("CRITICAL_DAMAGE", "critical power", "RARE", { attr: "criticalDamage" }),
    REMOVAL: mod("REMOVAL", "removal", "UNCOMMON"),
    TF_TYPE_1: mod("TF_TYPE_1", "transformative I", "COMMON"),
    TF_MOD_SIZE: mod("TF_MOD_SIZE", "size", "COMMON"),
    TF_MOD_SIZE_SECONDARY: mod("TF_MOD_SIZE_SECONDARY", "secondary size", "COMMON"),
    TF_MOD_SIZE_TERTIARY: mod("TF_MOD_SIZE_TERTIARY", "tertiary size", "COMMON"),
    TF_MOD_FEMININITY: mod("TF_MOD_FEMININITY", "femininity", "COMMON"),
    TF_MOD_CAPACITY: mod("TF_MOD_CAPACITY", "capacity", "COMMON"),
    TF_CORE: mod("TF_CORE", "core", "RARE"),
    TF_FACE: mod("TF_FACE", "face", "EPIC"),
    TF_HAIR: mod("TF_HAIR", "hair", "UNCOMMON"),
    TF_SKIN: mod("TF_SKIN", "torso", "EPIC"),
    TF_ASS: mod("TF_ASS", "ass", "UNCOMMON"),
    TF_BREASTS: mod("TF_BREASTS", "breasts", "UNCOMMON"),
    TF_PENIS: mod("TF_PENIS", "penis", "UNCOMMON"),
    TF_VAGINA: mod("TF_VAGINA", "vagina", "UNCOMMON"),
  };

  LT.CLOTHING_MAJOR_SECONDARIES = ["HEALTH_MAXIMUM", "MANA_MAXIMUM", "STRENGTH", "INTELLIGENCE", "CORRUPTION"];
  LT.CLOTHING_ATTRIBUTE_SECONDARIES = [
    "FERTILITY",
    "VIRILITY",
    "DAMAGE_UNARMED",
    "DAMAGE_PHYSICAL",
    "DAMAGE_LUST",
    "RESISTANCE_PHYSICAL",
    "RESISTANCE_LUST",
    "SPELL_COST_MODIFIER",
  ];
  LT.CLOTHING_SPECIAL_SECONDARIES = ["CLOTHING_SEALING"];
  LT.WEAPON_MAJOR_SECONDARIES = ["HEALTH_MAXIMUM", "MANA_MAXIMUM", "STRENGTH", "INTELLIGENCE", "CORRUPTION"];
  LT.WEAPON_ATTRIBUTE_SECONDARIES = [
    "FERTILITY",
    "VIRILITY",
    "DAMAGE_UNARMED",
    "DAMAGE_MELEE_WEAPON",
    "DAMAGE_RANGED_WEAPON",
    "DAMAGE_PHYSICAL",
    "DAMAGE_LUST",
    "DAMAGE_FIRE",
    "DAMAGE_ICE",
    "DAMAGE_POISON",
    "DAMAGE_SPELLS",
    "RESISTANCE_FIRE",
    "RESISTANCE_ICE",
    "RESISTANCE_LUST",
    "RESISTANCE_PHYSICAL",
    "RESISTANCE_POISON",
    "SPELL_COST_MODIFIER",
    "CRITICAL_DAMAGE",
  ];
  LT.ENCHANT_MAX_EFFECTS = 3;
  LT.ENCHANT_MAX_POTION_EFFECTS = 8;
  LT.ENCHANT_MAX_WEAPON_EFFECTS = 8;

  LT.isWeaponIngredient = function (item) {
    return !!(item && (item.kind === "weapon" || (typeof LT.getWeaponType === "function" && LT.getWeaponType(item.id))));
  };

  LT.SEALED_COST = {
    MINOR_BOOST: 5,
    MINOR_DRAIN: 25,
    DRAIN: 100,
    MAJOR_DRAIN: 500,
    BOOST: 5,
    MAJOR_BOOST: 5,
  };

  LT.itemEffect = function (type, primary, secondary, potency, limit) {
    return {
      type: type || "CLOTHING",
      primary: primary || "NONE",
      secondary: secondary || "NONE",
      potency: potency || "MINOR_BOOST",
      limit: limit == null ? 0 : limit,
    };
  };

  LT.itemEffectCost = function (effect) {
    var cost = 1;
    var p = LT.TF_MODIFIER[effect.primary];
    var s = LT.TF_MODIFIER[effect.secondary];
    var pot = LT.TF_POTENCY[effect.potency];
    if (p && effect.primary !== "NONE") cost += p.value;
    if (s && effect.secondary !== "NONE") cost += s.value;
    if (pot) cost += pot.value;
    if (effect.limit !== -1 && effect.limit != null) cost += 1;
    if (effect.secondary === "CLOTHING_SEALING" && pot) {
      if (effect.potency === "MAJOR_BOOST") cost *= 4;
      else if (effect.potency === "BOOST") cost *= 2;
    }
    return cost;
  };

  LT.enchantCost = function (ingredient, effects) {
    var incoming = effects || [];
    var cost = 0;
    for (var i = 0; i < incoming.length; i++) cost += LT.itemEffectCost(incoming[i]);
    return Math.max(0, cost);
  };

  LT.effectLabel = function (effect) {
    var pot = LT.TF_POTENCY[effect.potency] || LT.TF_POTENCY.MINOR_BOOST;
    var sec = LT.TF_MODIFIER[effect.secondary] || LT.TF_MODIFIER.NONE;
    var pri = LT.TF_MODIFIER[effect.primary] || LT.TF_MODIFIER.NONE;
    if (effect.secondary === "CLOTHING_SEALING") return pot.name + " sealing";
    if (sec.attr) return pot.name + " " + sec.name + " (" + (pot.clothingBonus > 0 ? "+" : "") + pot.clothingBonus + ")";
    if (effect.type === "RACIAL" || (pri.id && pri.id.indexOf("TF_") === 0)) {
      if (effect.secondary === "TF_TYPE_1") return pri.name + " — racial type";
      if (effect.secondary === "REMOVAL") return "remove " + pri.name;
      return pot.name + " " + pri.name + " " + sec.name;
    }
    return pri.name + " / " + sec.name + " / " + pot.name;
  };

  LT.emptyEnchantBonus = function () {
    return {
      physique: 0,
      arcane: 0,
      health: 0,
      mana: 0,
      corruption: 0,
      fertility: 0,
      virility: 0,
      damageUnarmed: 0,
      damageMelee: 0,
      damageRanged: 0,
      damagePhysical: 0,
      damageLust: 0,
      damageFire: 0,
      damageIce: 0,
      damagePoison: 0,
      damageSpells: 0,
      resistPhysical: 0,
      resistLust: 0,
      resistFire: 0,
      resistIce: 0,
      resistPoison: 0,
      spellCost: 0,
      criticalDamage: 0,
    };
  };

  LT.clearEnchantBonus = function (ch) {
    ch.enchantBonus = LT.emptyEnchantBonus();
  };

  LT.applyEffectToBonus = function (bonus, effect, sign) {
    var sec = LT.TF_MODIFIER[effect.secondary];
    var pot = LT.TF_POTENCY[effect.potency];
    if (!sec || !sec.attr || !pot) return;
    bonus[sec.attr] = (bonus[sec.attr] || 0) + pot.clothingBonus * (sign || 1);
  };

  LT.reapplyWornEnchantments = function (ch) {
    if (!ch) return;
    LT.clearEnchantBonus(ch);
    var equipped = ch.equipped || {};
    Object.keys(equipped).forEach(function (slot) {
      var item = equipped[slot];
      var effects = item && item.effects;
      if (!effects) return;
      for (var i = 0; i < effects.length; i++) LT.applyEffectToBonus(ch.enchantBonus, effects[i], 1);
    });
    function addWeapon(wep) {
      var effects = wep && wep.effects;
      if (!effects) return;
      var i;
      for (i = 0; i < effects.length; i++) LT.applyEffectToBonus(ch.enchantBonus, effects[i], 1);
    }
    addWeapon(ch.mainWeapon);
    if (typeof LT.getOffhandWeapon === "function") addWeapon(LT.getOffhandWeapon(ch));
    else addWeapon(ch.offhandWeapon);
    if (typeof LT.refreshVitals === "function") LT.refreshVitals(ch);
  };

  LT.itemIsSealed = function (item) {
    var effects = item && item.effects;
    if (!effects) return false;
    for (var i = 0; i < effects.length; i++) if (effects[i].secondary === "CLOTHING_SEALING") return true;
    return false;
  };

  LT.sealBreakCost = function (item) {
    var effects = item && item.effects;
    if (!effects) return 0;
    var cost = 0;
    for (var i = 0; i < effects.length; i++) {
      if (effects[i].secondary === "CLOTHING_SEALING") {
        cost += LT.SEALED_COST[effects[i].potency] || 5;
      }
    }
    return cost;
  };

  LT.incrementEssenceCount = function (amount, withText) {
    var p = LT.game && LT.game.player;
    if (!p || !amount) return "";
    p.essences = Math.max(0, (p.essences || 0) + amount);
    if (!withText) return "";
    var colour = amount > 0 ? LT.Colour.GENERIC_ARCANE : LT.Colour.GENERIC_BAD;
    var verb = amount > 0 ? "gained" : "lost";
    return (
      "<p style='text-align:center;'>You have <b style='color:" +
      colour +
      ";'>" +
      verb +
      " " +
      Math.abs(amount) +
      "</b> <b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>arcane essence" +
      (Math.abs(amount) === 1 ? "" : "s") +
      "</b>!</p>"
    );
  };

  LT.startEnchantmentQuest = function () {
    var f = LT.game.flags;
    if (f.enchantmentQuest) return "";
    f.enchantmentQuest = "SIDE_ENCHANTMENTS_LILAYA_HELP";
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>New Quest - Essences and Enchantments</b><br/><b>New Task - Ask Lilaya for help</b></p>"
    );
  };

  LT.completeEnchantmentQuest = function () {
    var f = LT.game.flags;
    if (f.enchantmentQuest === "complete") return "";
    f.enchantmentQuest = "complete";
    f.canEnchant = true;
    return (
      "<p style='text-align:center;'><b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>Quest - Essences and Enchantments</b><br/><b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>Task Completed</b><b> - Ask Lilaya for help</b><br/><b>All Tasks Completed!</b></p>"
    );
  };

  LT.canEnchant = function () {
    return !!(LT.game && LT.game.flags && (LT.game.flags.canEnchant || LT.game.flags.enchantmentQuest === "complete"));
  };

  LT.awardCombatEssences = function (enemy) {
    var gained = typeof LT.getLootEssenceDrops === "function" ? LT.getLootEssenceDrops(enemy) : 1 + Math.floor(Math.random() * ((enemy && enemy.level) || 1));
    if (typeof LT.stormDoublesEssences === "function" && LT.stormDoublesEssences()) gained *= 2;
    var html = "";
    var f = LT.game.flags;
    if (!f.essencePostCombatDiscovered) {
      f.essencePostCombatDiscovered = true;
      var name = (enemy && (enemy.name || (enemy.getName && enemy.getName()))) || "your opponent";
      html +=
        "<p><i>" +
        name +
        " staggers back, defeated, but before you have a chance to react to your victory, the world around you seems to somehow shift out of focus. A shimmering pink glow materialises around " +
        name +
        "'s body, just like the one you saw in Lilaya's lab. A shard of that aura breaks away and launches itself into your chest, merging with your own arcane aura.</i></p>";
      html += LT.startEnchantmentQuest();
    }
    html += LT.incrementEssenceCount(gained, true);
    return html;
  };

  LT.awardOrgasmEssences = function () {
    var p = LT.game && LT.game.player;
    if (p && typeof LT.hasStatusEffect === "function" && LT.hasStatusEffect(p, "RECOVERING_AURA")) return "";
    var gained = 1 + Math.floor(Math.random() * 4);
    if (typeof LT.stormDoublesEssences === "function" && LT.stormDoublesEssences()) gained *= 2;
    var html = "";
    var f = LT.game.flags;
    if (!f.essenceOrgasmDiscovered) {
      f.essenceOrgasmDiscovered = true;
      html +=
        "<p><i>As you climax, the world seems to shift out of focus. You glimpse a shimmering pink aura around your partner, and a shard of that energy breaks away and sinks into your chest.</i></p>";
      html += LT.startEnchantmentQuest();
    }
    html += LT.incrementEssenceCount(gained, true);
    return html;
  };

  LT.craftEnchantedItem = function (ingredient, effects) {
    if (!ingredient) return { error: "Nothing to enchant." };
    var next = effects || [];
    var racial = typeof LT.isRacialIngredient === "function" && LT.isRacialIngredient(ingredient);
    var weapon = typeof LT.isWeaponIngredient === "function" && LT.isWeaponIngredient(ingredient);
    var cap = racial ? LT.ENCHANT_MAX_POTION_EFFECTS : weapon ? LT.ENCHANT_MAX_WEAPON_EFFECTS : LT.ENCHANT_MAX_EFFECTS;
    if (typeof LT.hasProperty === "function" && !LT.hasProperty("enchantmentLimits")) cap = 99;
    if (next.length > cap) {
      return {
        error: racial
          ? "A potion can only hold " + cap + " effects."
          : weapon
            ? "A weapon can only hold " + cap + " effects."
            : "A piece of clothing can only hold " + cap + " effects.",
      };
    }
    var cost = LT.enchantCost(ingredient, next);
    var p = LT.game.player;
    if ((p.essences || 0) < cost) return { error: "You need " + cost + " arcane essences." };
    p.essences -= cost;
    var crafted = {};
    Object.keys(ingredient).forEach(function (k) {
      crafted[k] = ingredient[k];
    });
    crafted.effects = next.slice();
    crafted.enchanted = true;
    crafted.enchantmentKnown = true;
    if (racial) crafted.kind = "tf";
    if (crafted.name && crafted.name.indexOf("enchanted ") !== 0) crafted.name = "enchanted " + crafted.name;
    crafted.uid = (ingredient.uid || "item") + "_e" + Math.random().toString(36).slice(2, 6);
    return { item: crafted, cost: cost };
  };

  LT.findCarriedByUid = function (player, uid) {
    var lists = [player.wardrobe || [], player.items || [], player.weapons || []];
    var i, j, list;
    for (i = 0; i < lists.length; i++) {
      list = lists[i];
      for (j = 0; j < list.length; j++) if (list[j] && list[j].uid === uid) return { list: list, index: j, item: list[j] };
    }
    var equipped = player.equipped || {};
    var slot;
    for (slot in equipped) {
      if (equipped[slot] && equipped[slot].uid === uid) return { equipped: true, slot: slot, item: equipped[slot] };
    }
    return null;
  };

  LT.replaceCarried = function (player, uid, next) {
    var found = LT.findCarriedByUid(player, uid);
    if (!found) return false;
    if (found.equipped) {
      player.equipped[found.slot] = next;
      LT.reapplyWornEnchantments(player);
      return true;
    }
    found.list[found.index] = next;
    return true;
  };
})();
