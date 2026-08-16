(function () {
  var RACE_TF = {
    cat: "innoxia_race_cat_felines_fancy",
    "cat-morph": "innoxia_race_cat_felines_fancy",
    "cat-girl": "innoxia_race_cat_felines_fancy",
    "cat-boy": "innoxia_race_cat_felines_fancy",
    dog: "innoxia_race_dog_canine_crush",
    "dog-morph": "innoxia_race_dog_canine_crush",
    "dog-girl": "innoxia_race_dog_canine_crush",
    "dog-boy": "innoxia_race_dog_canine_crush",
    wolf: "innoxia_race_wolf_wolf_whiskey",
    "wolf-morph": "innoxia_race_wolf_wolf_whiskey",
    "wolf-girl": "innoxia_race_wolf_wolf_whiskey",
    "wolf-boy": "innoxia_race_wolf_wolf_whiskey",
    horse: "innoxia_race_horse_equine_cider",
    "horse-morph": "innoxia_race_horse_equine_cider",
    "horse-girl": "innoxia_race_horse_equine_cider",
    "horse-boy": "innoxia_race_horse_equine_cider",
    fox: "innoxia_race_fox_vulpines_vineyard",
    "fox-morph": "innoxia_race_fox_vulpines_vineyard",
    "fox-girl": "innoxia_race_fox_vulpines_vineyard",
    "fox-boy": "innoxia_race_fox_vulpines_vineyard",
    harpy: "innoxia_race_harpy_harpy_perfume",
    human: "innoxia_race_human_vanilla_water",
    demon: "innoxia_race_demon_liliths_gift",
    succubus: "innoxia_race_demon_liliths_gift",
    incubus: "innoxia_race_demon_liliths_gift",
  };

  function enemyLevel(enemy) {
    return Math.max(1, (enemy && enemy.level) || 1);
  }

  function raceKey(enemy) {
    if (!enemy) return "";
    return String(enemy.raceName || enemy.fullRace || (enemy.race && enemy.race.id) || "").toLowerCase();
  }

  LT.tfItemForRace = function (enemy) {
    var key = raceKey(enemy);
    if (RACE_TF[key]) return RACE_TF[key];
    var parts = key.split(/[\s-]+/);
    var i;
    for (i = 0; i < parts.length; i++) if (RACE_TF[parts[i]]) return RACE_TF[parts[i]];
    return null;
  };

  LT.getExperienceFromVictory = function (enemy) {
    return enemyLevel(enemy) * 2;
  };

  LT.getLootMoney = function (enemy) {
    if (enemy && enemy.lootMoney != null) return enemy.lootMoney;
    var id = enemy && enemy.id;
    if (id === "brax") return 2500;
    if (id === "amber") return 5000;
    var level = enemyLevel(enemy);
    return Math.floor(level * 25 * (0.5 + Math.random()));
  };

  LT.getLootEssenceDrops = function (enemy) {
    if (enemy && enemy.lootEssences != null) return enemy.lootEssences;
    if (enemy && enemy.id === "brax") return 8;
    return 1 + Math.floor(Math.random() * enemyLevel(enemy));
  };

  LT.getLootItemId = function (enemy) {
    if (enemy && enemy.lootItems === null) return null;
    if (enemy && enemy.lootItems && !enemy.lootItems.length) return null;
    if (enemy && enemy.id === "brax") return null;
    var rnd = Math.random();
    if (rnd <= 0.05 && LT.itemType && LT.itemType("FETISH_UNREFINED")) return "FETISH_UNREFINED";
    if (rnd <= 0.1 && LT.itemType && LT.itemType("ADDICTION_REMOVAL")) return "ADDICTION_REMOVAL";
    var tf = LT.tfItemForRace(enemy);
    if (rnd < 0.6 && tf) return tf;
    if (rnd <= 0.8) {
      /* Official race book if not already discovered. No books in this build. */
    }
    if (tf) return tf;
    if (LT.itemType && LT.itemType("DYE_BRUSH")) return "DYE_BRUSH";
    return null;
  };

  LT.applyCombatVictoryLoot = function (enemy) {
    var html = "";
    var xp = LT.getExperienceFromVictory(enemy);
    if (xp && typeof LT.incrementExperience === "function") html += LT.incrementExperience(xp);
    var money = LT.getLootMoney(enemy);
    if (money && typeof LT.incrementMoney === "function") html += LT.incrementMoney(money);
    var itemId = LT.getLootItemId(enemy);
    if (itemId && typeof LT.addItem === "function") {
      var item = LT.addItem(LT.game.player, itemId);
      var type = typeof LT.itemType === "function" ? LT.itemType(itemId) : null;
      var name = (item && item.name) || (type && type.name) || itemId;
      html +=
        "<div style='text-align:center;'>You <b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>gained</b> <b>" +
        name +
        "</b>!</div>";
    }
    return html;
  };
})();
