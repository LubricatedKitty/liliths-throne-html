(function () {
  function session() {
    LT.enchant = LT.enchant || {
      uid: null,
      effects: [],
      primary: "CLOTHING_MAJOR_ATTRIBUTE",
      secondary: "STRENGTH",
      potency: "MINOR_BOOST",
    };
    return LT.enchant;
  }

  function ingredient() {
    var s = session();
    if (!s.uid || !LT.game.player) return null;
    var found = LT.findCarriedByUid(LT.game.player, s.uid);
    return found && found.item;
  }

  function isPotion() {
    return typeof LT.isRacialIngredient === "function" && LT.isRacialIngredient(ingredient());
  }

  function isWeapon() {
    return typeof LT.isWeaponIngredient === "function" && LT.isWeaponIngredient(ingredient());
  }

  function primariesFor() {
    if (isPotion()) return LT.RACIAL_PRIMARIES || [];
    if (isWeapon()) return ["CLOTHING_MAJOR_ATTRIBUTE", "CLOTHING_ATTRIBUTE"];
    return ["CLOTHING_MAJOR_ATTRIBUTE", "CLOTHING_ATTRIBUTE", "CLOTHING_SPECIAL"];
  }

  function secondariesFor(primary) {
    if (isPotion()) return (LT.RACIAL_SECONDARIES && LT.RACIAL_SECONDARIES[primary]) || [];
    if (isWeapon()) {
      if (primary === "CLOTHING_ATTRIBUTE") return LT.WEAPON_ATTRIBUTE_SECONDARIES || [];
      return LT.WEAPON_MAJOR_SECONDARIES || [];
    }
    if (primary === "CLOTHING_ATTRIBUTE") return LT.CLOTHING_ATTRIBUTE_SECONDARIES;
    if (primary === "CLOTHING_SPECIAL") return LT.CLOTHING_SPECIAL_SECONDARIES;
    return LT.CLOTHING_MAJOR_SECONDARIES;
  }

  function chip(label, value, selected, kind) {
    return (
      '<button type="button" class="inv-wep-btn' +
      (selected ? " selected" : "") +
      '" data-enchant-' +
      kind +
      '="' +
      value +
      '">' +
      label +
      "</button>"
    );
  }

  function effectHtml() {
    var s = session();
    var item = ingredient();
    if (!item) return "<p>You have nothing selected to enchant.</p>";
    var lines = "";
    for (var i = 0; i < s.effects.length; i++) {
      lines += "<li>" + LT.effectLabel(s.effects[i]) + " — " + LT.itemEffectCost(s.effects[i]) + " essences</li>";
    }
    if (!lines) lines = "<li class='muted'>No effects added yet.</li>";
    var cost = LT.enchantCost(item, s.effects);
    var ess = (LT.game.player && LT.game.player.essences) || 0;
    var primaries = primariesFor();
    var pHtml = "";
    var p;
    for (p = 0; p < primaries.length; p++) {
      pHtml += chip(LT.TF_MODIFIER[primaries[p]].name, primaries[p], s.primary === primaries[p], "primary");
    }
    var secs = secondariesFor(s.primary);
    var sHtml = "";
    var q;
    for (q = 0; q < secs.length; q++) {
      sHtml += chip(LT.TF_MODIFIER[secs[q]].name, secs[q], s.secondary === secs[q], "secondary");
    }
    var pots = ["MAJOR_DRAIN", "DRAIN", "MINOR_DRAIN", "MINOR_BOOST", "BOOST", "MAJOR_BOOST"];
    var potHtml = "";
    var r;
    for (r = 0; r < pots.length; r++) {
      var pot = LT.TF_POTENCY[pots[r]];
      potHtml +=
        '<button type="button" class="inv-wep-btn' +
        (s.potency === pots[r] ? " selected" : "") +
        '" data-enchant-potency="' +
        pots[r] +
        '" style="color:' +
        pot.colour +
        ';">' +
        pot.name +
        "</button>";
    }
    return (
      "<p>Using the essences stored in your aura, you focus on the <b>" +
      (item.name || "item") +
      "</b> and prepare to bind an enchantment into it.</p>" +
      "<p>You have <b style='color:" +
      LT.Colour.GENERIC_ARCANE +
      ";'>" +
      ess +
      "</b> arcane essences. This design will cost <b>" +
      cost +
      "</b>.</p>" +
      "<div class='inv-col' style='margin-bottom:8px;'><h6>Current effects</h6><ul>" +
      lines +
      "</ul></div>" +
      "<div class='inv-col' style='margin-bottom:8px;'><h6>Primary</h6><div class='inv-grid'>" +
      pHtml +
      "</div></div>" +
      "<div class='inv-col' style='margin-bottom:8px;'><h6>Secondary</h6><div class='inv-grid'>" +
      sHtml +
      "</div></div>" +
      "<div class='inv-col' style='margin-bottom:8px;'><h6>Potency</h6><div class='inv-grid'>" +
      potHtml +
      "</div></div>" +
      "<p class='muted'>" +
      (isPotion()
        ? "Racial drinks become potions. They can hold up to " +
          LT.ENCHANT_MAX_POTION_EFFECTS +
          " effects. Drink the finished potion to apply them."
        : isWeapon()
          ? "Weapons can hold up to " +
            LT.ENCHANT_MAX_WEAPON_EFFECTS +
            " attribute effects. Equip the weapon to apply them. Official type limit is 100; this build caps at " +
            LT.ENCHANT_MAX_WEAPON_EFFECTS +
            "."
          : "Clothing can hold up to " + LT.ENCHANT_MAX_EFFECTS + " effects. Sealed clothing cannot be removed without spending essences.") +
      "</p>"
    );
  }

  LT.openEnchant = function (uid) {
    var s = session();
    var found = LT.findCarriedByUid(LT.game.player, uid);
    if (!found || !found.item) return;
    s.uid = uid;
    s.effects = (found.item.effects || []).slice();
    var racial = typeof LT.isRacialIngredient === "function" && LT.isRacialIngredient(found.item);
    var weapon = typeof LT.isWeaponIngredient === "function" && LT.isWeaponIngredient(found.item);
    if (racial) {
      if (!s.primary || (LT.RACIAL_PRIMARIES || []).indexOf(s.primary) < 0) s.primary = "TF_CORE";
    } else if (weapon) {
      if (!s.primary || s.primary.indexOf("TF_") === 0 || s.primary === "CLOTHING_SPECIAL") s.primary = "CLOTHING_MAJOR_ATTRIBUTE";
    } else if (!s.primary || s.primary.indexOf("TF_") === 0) {
      s.primary = "CLOTHING_MAJOR_ATTRIBUTE";
    }
    if (!s.secondary || secondariesFor(s.primary).indexOf(s.secondary) < 0) s.secondary = secondariesFor(s.primary)[0];
    if (!s.potency) s.potency = "MINOR_BOOST";
    if (typeof LT.rememberReturn === "function") LT.rememberReturn();
    LT.game.setContent("enchant.main");
  };

  LT.defineNode({
    id: "enchant.main",
    ui: "inventory",
    title: "Enchanting",
    chrome: { left: true, right: true },
    getContent: effectHtml,
    getResponses: function () {
      var s = session();
      var item = ingredient();
      var add = new LT.Response("Add effect", "Add the selected modifier to this item.", "enchant.main", function () {
        if (!item) return;
        var racial = typeof LT.isRacialIngredient === "function" && LT.isRacialIngredient(item);
        var weapon = typeof LT.isWeaponIngredient === "function" && LT.isWeaponIngredient(item);
        var cap = racial ? LT.ENCHANT_MAX_POTION_EFFECTS : weapon ? LT.ENCHANT_MAX_WEAPON_EFFECTS : LT.ENCHANT_MAX_EFFECTS;
        if (typeof LT.hasProperty === "function" && !LT.hasProperty("enchantmentLimits")) cap = 99;
        if (s.effects.length >= cap) {
          LT.game.textStart = "<p>This item cannot hold any more effects.</p>";
          return;
        }
        s.effects.push(LT.itemEffect(racial ? "RACIAL" : weapon ? "WEAPON" : "CLOTHING", s.primary, s.secondary, s.potency, 0));
      });
      var remove = new LT.Response("Remove last", "Remove the last effect from the list.", "enchant.main", function () {
        s.effects.pop();
      });
      if (!s.effects.length) remove.disable("There are no effects to remove.");
      var craft = new LT.Response("Craft", "Bind these effects into the item.", null, function () {
        var result = LT.craftEnchantedItem(item, s.effects);
        if (result.error) {
          LT.game.textStart = "<p>" + result.error + "</p>";
          LT.game.setContent("enchant.main");
          return;
        }
        LT.replaceCarried(LT.game.player, s.uid, result.item);
        s.uid = result.item.uid;
        LT.game.textStart =
          "<p>You spend " +
          result.cost +
          " arcane essence" +
          (result.cost === 1 ? "" : "s") +
          " and the " +
          result.item.name +
          " hums with bound energy.</p>";
        LT.game.setContent("inventory.main");
      });
      if (!item) craft.disable("Nothing is selected.");
      return [
        new LT.Response("Back", "Stop enchanting.", "inventory.main"),
        add,
        remove,
        craft,
      ];
    },
  });

  document.addEventListener("click", function (e) {
    if (!LT.game.currentNode || LT.game.currentNode.id !== "enchant.main") return;
    var s = session();
    var primary = e.target.closest("[data-enchant-primary]");
    if (primary) {
      s.primary = primary.getAttribute("data-enchant-primary");
      var allowed = secondariesFor(s.primary);
      if (allowed.indexOf(s.secondary) < 0) s.secondary = allowed[0];
      LT.game.setContent("enchant.main");
      return;
    }
    var secondary = e.target.closest("[data-enchant-secondary]");
    if (secondary) {
      s.secondary = secondary.getAttribute("data-enchant-secondary");
      LT.game.setContent("enchant.main");
      return;
    }
    var potency = e.target.closest("[data-enchant-potency]");
    if (potency) {
      s.potency = potency.getAttribute("data-enchant-potency");
      LT.game.setContent("enchant.main");
    }
  });
})();
