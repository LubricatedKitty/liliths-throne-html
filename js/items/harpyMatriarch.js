(function () {
  var ITEMS = LT.ITEMS;

  ITEMS.HARPY_MATRIARCH_BIMBO_LOLLIPOP = {
    id: "HARPY_MATRIARCH_BIMBO_LOLLIPOP",
    kind: "tf",
    matriarch: "bimbo",
    name: "Brittany's lollipop",
    value: 1250,
    rarity: "legendary",
    useName: "suck",
    race: "harpy",
    fem: "harpy",
    masc: "harpy",
    description:
      "A swirly lollipop that you got from the harpy matriarch Brittany. Although it doesn't look out of the ordinary, you're pretty sure that eating it would result in a potent transformation...",
    useSelf:
      "Bringing the lollipop up to your [pc.lips+], you dart out your [pc.tongue] and give it a long, wet lick. An intense, sweet flavour fills your mouth, quite unlike anything you've ever tasted before. Before you know what you're doing, you're pressing your [pc.lips] up against the delicious candy, letting out little whining noises as you find yourself unable to stop sucking and licking it...",
  };
  ITEMS.HARPY_MATRIARCH_NYMPHO_LOLLIPOP = {
    id: "HARPY_MATRIARCH_NYMPHO_LOLLIPOP",
    kind: "tf",
    matriarch: "nympho",
    name: "Lexi's lollipop",
    value: 1250,
    rarity: "legendary",
    useName: "suck",
    race: "harpy",
    fem: "harpy",
    masc: "harpy",
    description:
      "A cock-shaped lollipop that you got from the harpy matriarch Lexi. Although it looks to be made from regular candy, you're pretty sure that eating it would result in a potent transformation...",
    useSelf:
      "Bringing the lollipop up to your [pc.lips+], you dart out your [pc.tongue] and give it a long, wet lick. An intense, sweet flavour fills your mouth, quite unlike anything you've ever tasted before. Before you know what you're doing, you're pushing the delicious, cock-shaped candy into your mouth, letting out lewd moans as you find yourself unable to stop sucking and licking it...",
  };
  ITEMS.HARPY_MATRIARCH_DOMINANT_PERFUME = {
    id: "HARPY_MATRIARCH_DOMINANT_PERFUME",
    kind: "tf",
    matriarch: "dominant",
    name: "Diana's perfume",
    value: 1250,
    rarity: "legendary",
    useName: "spray",
    race: "harpy",
    fem: "harpy",
    masc: "harpy",
    description:
      "A bottle of perfume that you got from the harpy matriarch Diana. Although it looks to contain normal perfume, you're pretty sure that using it would result in a potent transformation...",
    useSelf:
      "Bringing the bottle of perfume up to your neck, you give it a little squirt. Although only a small amount of liquid shoots out, the entire bottle's contents are instantly drained, leaving you holding an empty vessel. As you look down at it in surprise, the strong, feminine scent rises up to overpower your senses, and you find yourself letting out a desperate moan as the nature of the perfume's powerful enchantment starts to make itself known...",
  };

  function addFetish(ch, id) {
    ch.fetishes = ch.fetishes || {};
    if (ch.fetishes[id]) return false;
    ch.fetishes[id] = true;
    return true;
  }

  function addPerk(ch, id) {
    ch.perks = ch.perks || {};
    if (ch.perks[id]) return false;
    ch.perks[id] = true;
    return true;
  }

  function setMinCup(ch, id) {
    var list = LT.CUP_LIST || [];
    var want = LT.CUP && LT.CUP[id];
    if (!want) return "";
    var cur = 0;
    var i;
    for (i = 0; i < list.length; i++) {
      if (ch.breastSize === list[i]) cur = i;
      if (list[i] === want && i > cur) {
        ch.breastSize = want;
        return "<p>Your breasts swell into " + want.name + "s.</p>";
      }
    }
    return "";
  }

  function setMinSize(ch, field, index, label) {
    var list = LT.SIZE5 || [];
    var cur = 0;
    var i;
    for (i = 0; i < list.length; i++) if (ch[field] === list[i]) cur = i;
    if (index > cur && list[index]) {
      ch[field] = list[index];
      return "<p>Your " + label + " " + (label === "hips" ? "are" : "is") + " now " + list[index].name + ".</p>";
    }
    return "";
  }

  LT.isAbleToHaveRaceTransformed = function (ch) {
    var race = ((ch && (ch.fullRace || ch.raceName)) || "").toLowerCase();
    if (/demon|lilin|angel|elemental|doll/.test(race)) return false;
    return true;
  };

  LT.applyHarpyMatriarchTf = function (ch, kind) {
    if (!ch) return "";
    var html = "";
    var type = ITEMS[kind === "bimbo" ? "HARPY_MATRIARCH_BIMBO_LOLLIPOP" : kind === "nympho" ? "HARPY_MATRIARCH_NYMPHO_LOLLIPOP" : "HARPY_MATRIARCH_DOMINANT_PERFUME"];
    if (type && type.useSelf) html += "<p>" + LT.parse(type.useSelf) + "</p>";
    html += "<p>As the " + (kind === "dominant" ? "perfume" : "lollipop") + "'s transformative effects start to make themselves known, you start to feel very light-headed...</p>";

    if (kind === "bimbo" && addFetish(ch, "FETISH_BIMBO")) {
      html +=
        "<p>A giggle escapes from between your [pc.lips], and you suddenly find yourself unable to think of anything other than how, like, super awesome bimbos are and stuff!<br/><b style='color:" +
        (LT.Colour.GENERIC_SEX || "#ff66a3") +
        ";'>You have gained the bimbo fetish!</b></p>";
    }
    if (kind === "nympho" && addPerk(ch, "NYMPHOMANIAC")) {
      html +=
        "<p>A desperate moan escapes from between your [pc.lips], and you suddenly find yourself unable to think of anything other than sex, sex, and more sex!<br/><b style='color:" +
        (LT.Colour.GENERIC_SEX || "#ff66a3") +
        ";'>You have gained the nymphomaniac perk!</b></p>";
    }
    if (kind === "dominant" && addFetish(ch, "FETISH_DOMINANT")) {
      html +=
        "<p>A deep groan escapes from between your [pc.lips], and you suddenly find yourself thinking of how much you want to dominate the next person you come across!<br/><b style='color:" +
        (LT.Colour.GENERIC_SEX || "#ff66a3") +
        ";'>You have gained the dominant fetish!</b></p>";
    }

    if ((ch.femininityValue || 0) < 95) {
      ch.femininityValue = 95;
      html += "<p>Your body becomes extremely feminine.</p>";
    }
    if (kind === "bimbo") {
      html += setMinCup(ch, "DD");
      html += setMinSize(ch, "assSize", 4, "ass");
      html += setMinSize(ch, "hipSize", 4, "hips");
    } else {
      html += setMinCup(ch, "C");
      html += setMinSize(ch, "assSize", 3, "ass");
      html += setMinSize(ch, "hipSize", 3, "hips");
    }

    if (!LT.isAbleToHaveRaceTransformed(ch)) {
      html += "<p>As you are immune to racial transformations, the " + (kind === "dominant" ? "perfume" : "lollipop") + " has no further effect!</p>";
    } else {
      ch.raceName = "harpy";
      ch.fullRace = "harpy";
      html += "<p>Your body settles into that of a harpy, with " + (kind === "bimbo" ? "bleach-blonde" : kind === "nympho" ? "pink" : "crimson") + " feathers.</p>";
    }
    return LT.parse(html);
  };

  LT.giveHarpyMatriarchItem = function (id) {
    if (!LT.game.player || typeof LT.addItem !== "function") return "";
    if (LT.countItems(LT.game.player, id)) return "";
    LT.addItem(LT.game.player, id);
    var t = ITEMS[id];
    return "<p>You have received <b>" + ((t && t.name) || id) + "</b>!</p>";
  };

  var oldApply = LT.applyTfItem;
  LT.applyTfItem = function (player, type) {
    if (type && type.matriarch) return LT.applyHarpyMatriarchTf(player, type.matriarch);
    return oldApply ? oldApply(player, type) : "";
  };
})();
