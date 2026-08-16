(function () {
  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function chance(p) {
    return Math.random() < p;
  }

  function feminine(npc) {
    if (npc && npc.isFeminine) return npc.isFeminine();
    return !!(npc && npc.feminine);
  }

  function wear(npc, id) {
    if (!id || typeof LT.makeClothing !== "function") return null;
    var item = LT.makeClothing(id);
    if (!item) return null;
    npc.equipped = npc.equipped || {};
    npc.equipped[item.slot] = item;
    return item;
  }

  LT.dressNpcOutfit = function (npc, outfitType) {
    if (!npc) return npc;
    npc.equipped = {};
    var fem = feminine(npc);
    var kind = outfitType || (npc.occupation === "prostitute" ? "PROSTITUTE" : "MUGGER");

    if (kind === "PROSTITUTE" && fem) {
      wear(npc, pick(["thong", "lacy_panties", "panties"]));
      wear(npc, pick(["plunge_bra", "lacy_bra", "crop_bra"]));
      wear(npc, pick(["blouse", "skater_dress", "slip_dress"]));
      if (!npc.equipped.leg && chance(0.45)) wear(npc, "skirt");
      wear(npc, pick(["pantyhose", "kneehigh"]));
      wear(npc, pick(["heels", "stilettos"]));
      if (chance(0.75)) wear(npc, pick(["heart_necklace", "heart_necklace_gold", "ring_gold", "watch_pink"]));
      return npc;
    }
    if (kind === "PROSTITUTE") {
      wear(npc, pick(["briefs", "boxers"]));
      wear(npc, pick(["tshirt", "shirt_short"]));
      wear(npc, pick(["trousers", "jeans"]));
      wear(npc, "socks");
      wear(npc, pick(["trainers", "skaters"]));
      return npc;
    }
    if (fem) {
      wear(npc, pick(["panties", "thong", "lacy_panties"]));
      wear(npc, pick(["plunge_bra", "crop_bra", "lacy_bra"]));
      wear(npc, pick(["tshirt", "blouse", "shirt_short"]));
      wear(npc, pick(["jeans", "yoga", "skirt"]));
      if (chance(0.6)) wear(npc, pick(["hoodie", "cardigan"]));
      wear(npc, pick(["socks", "socks_white"]));
      wear(npc, pick(["trainers", "skaters"]));
      if (chance(0.25)) wear(npc, pick(["ring_silver", "heart_necklace"]));
      return npc;
    }
    wear(npc, pick(["boxers", "briefs"]));
    wear(npc, pick(["tshirt", "shirt_short"]));
    wear(npc, pick(["cargo", "jeans", "trousers"]));
    if (chance(0.6)) wear(npc, "hoodie");
    wear(npc, "socks");
    wear(npc, pick(["trainers", "skaters"]));
    if (chance(0.25)) wear(npc, pick(["ring_silver", "watch_silver"]));
    return npc;
  };

  LT.supplyNpcInventory = function (npc) {
    if (!npc) return npc;
    npc.items = npc.items || [];
    var n = 2 + Math.floor(Math.random() * 4);
    var i;
    for (i = 0; i < n; i++) {
      var id = typeof LT.getLootItemId === "function" ? LT.getLootItemId(npc) : null;
      if (!id || typeof LT.makeItem !== "function") continue;
      var item = LT.makeItem(id);
      if (item) npc.items.push(item);
    }
    return npc;
  };

  LT.prepareNpcGear = function (npc, opts) {
    opts = opts || {};
    if (!npc) return npc;
    npc.wardrobe = npc.wardrobe || [];
    npc.items = npc.items || [];
    npc.weapons = npc.weapons || [];
    if (!opts.skipClothes) LT.dressNpcOutfit(npc, opts.outfit);
    if (!opts.skipBag) LT.supplyNpcInventory(npc);
    return npc;
  };

  LT.dressUniqueNpc = function (id, npc) {
    if (!npc || (npc.equipped && Object.keys(npc.equipped).length)) return npc;
    npc.equipped = {};
    if (id === "brax") {
      wear(npc, "boxers");
      wear(npc, "shirt_long");
      wear(npc, "tie");
      wear(npc, "trousers");
      wear(npc, "socks");
      wear(npc, "smart_shoes");
    } else if (id === "amber") {
      wear(npc, "lacy_panties");
      wear(npc, "lacy_bra");
      wear(npc, "blouse");
      wear(npc, "skirt");
      wear(npc, "pantyhose");
      wear(npc, "stilettos");
    }
    npc.items = npc.items || [];
    npc.wardrobe = npc.wardrobe || [];
    return npc;
  };

  function givePlayerClothing(item) {
    var p = LT.game && LT.game.player;
    if (!p || !item) return;
    p.wardrobe = p.wardrobe || [];
    p.wardrobe.push(item);
  }

  function givePlayerItem(item) {
    var p = LT.game && LT.game.player;
    if (!p || !item) return;
    p.items = p.items || [];
    p.items.push(item);
  }

  function givePlayerWeapon(item) {
    var p = LT.game && LT.game.player;
    if (!p || !item) return;
    p.weapons = p.weapons || [];
    p.weapons.push(item);
  }

  LT.npcEquippedList = function (npc) {
    var list = [];
    if (!npc || !npc.equipped) return list;
    Object.keys(npc.equipped).forEach(function (slot) {
      if (npc.equipped[slot]) list.push({ slot: slot, item: npc.equipped[slot] });
    });
    return list;
  };

  LT.npcHasLoot = function (npc) {
    if (!npc) return false;
    if (LT.npcEquippedList(npc).length) return true;
    if (npc.items && npc.items.length) return true;
    if (npc.mainWeapon || npc.offhandWeapon) return true;
    if (npc.weapons && npc.weapons.length) return true;
    return false;
  };

  LT.takeNpcClothing = function (npc, slot) {
    if (!npc || !npc.equipped || !npc.equipped[slot]) return null;
    var item = npc.equipped[slot];
    delete npc.equipped[slot];
    givePlayerClothing(item);
    return item;
  };

  LT.takeNpcItem = function (npc, uid) {
    if (!npc || !npc.items) return null;
    var i;
    for (i = 0; i < npc.items.length; i++) {
      if (npc.items[i] && npc.items[i].uid === uid) {
        var item = npc.items.splice(i, 1)[0];
        givePlayerItem(item);
        return item;
      }
    }
    return null;
  };

  LT.takeNpcWeapon = function (npc, which) {
    if (!npc) return null;
    var item = null;
    if (which === "main" && npc.mainWeapon) {
      item = npc.mainWeapon;
      npc.mainWeapon = null;
    } else if (which === "offhand" && npc.offhandWeapon) {
      item = npc.offhandWeapon;
      npc.offhandWeapon = null;
    } else if (npc.weapons) {
      var i;
      for (i = 0; i < npc.weapons.length; i++) {
        if (npc.weapons[i] && npc.weapons[i].uid === which) {
          item = npc.weapons.splice(i, 1)[0];
          break;
        }
      }
    }
    if (item) givePlayerWeapon(item);
    return item;
  };

  LT.stripNpc = function (npc) {
    var taken = [];
    LT.npcEquippedList(npc).forEach(function (entry) {
      var item = LT.takeNpcClothing(npc, entry.slot);
      if (item) taken.push(item);
    });
    return taken;
  };

  LT.takeAllNpcItems = function (npc) {
    var taken = [];
    if (!npc || !npc.items) return taken;
    while (npc.items.length) {
      var item = npc.items.shift();
      givePlayerItem(item);
      taken.push(item);
    }
    return taken;
  };

  LT.takeAllNpcWeapons = function (npc) {
    var taken = [];
    var item;
    item = LT.takeNpcWeapon(npc, "main");
    if (item) taken.push(item);
    item = LT.takeNpcWeapon(npc, "offhand");
    if (item) taken.push(item);
    while (npc.weapons && npc.weapons.length) {
      item = npc.weapons.shift();
      givePlayerWeapon(item);
      taken.push(item);
    }
    return taken;
  };

  LT.openNpcLoot = function (npc, returnNode) {
    if (!npc) return;
    LT.game.flags = LT.game.flags || {};
    LT.game.flags.lootNpcId = npc.id || "npc";
    LT.game.flags.lootReturn = returnNode || LT.game.currentNode || "place.current";
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.lootTarget = npc;
    if (typeof LT.rememberReturn === "function") LT.rememberReturn();
    LT.game.setContent("loot.npc");
  };

  LT.currentLootNpc = function () {
    if (LT.game.npcs && LT.game.npcs.lootTarget) return LT.game.npcs.lootTarget;
    if (LT.game.npcs && LT.game.flags && LT.game.flags.lootNpcId && LT.game.npcs[LT.game.flags.lootNpcId]) {
      return LT.game.npcs[LT.game.flags.lootNpcId];
    }
    return (LT.game.npcs && LT.game.npcs.alleyMugger) || null;
  };
})();
