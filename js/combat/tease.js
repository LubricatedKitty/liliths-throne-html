(function () {
  function nameOf(ch) {
    if (!ch) return "someone";
    if (ch.getName) return ch.getName();
    return ch.name || "someone";
  }

  function fem(ch) {
    return !!(ch && ch.isFeminine && ch.isFeminine());
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function parsePair(text, src, tgt) {
    if (typeof LT.parse !== "function") return text;
    if (typeof LT.withParseTargets === "function") {
      return LT.withParseTargets({ pc: src && src.player ? src : LT.game.player, npc: tgt, npc2: tgt }, function () {
        return LT.parse(text);
      });
    }
    return LT.parse(text);
  }

  LT.seductionDescription = function (src, tgt) {
    var feminine = fem(src);
    var lines;
    if (typeof LT.getStatus === "function" && LT.getStatus(src, "TELEPATHIC_COMMUNICATION")) {
      if (feminine) {
        lines = [
          "You put on a smouldering look, and as your [pc.eyes] meet [npc.namePos], you project an extremely lewd moan into [npc.her] head.",
          "You lock your [pc.eyes] with [npc.namePos], and, putting on your most innocent look as you pout at [npc.herHim], you project an echoing moan deep into [npc.her] mind.",
        ];
      } else {
        lines = [
          "You put on a confident look, and as your [pc.eyes] meet [npc.namePos], you project an extremely lewd groan into [npc.her] head.",
          "You lock your [pc.eyes] with [npc.namePos], and, throwing [npc.herHim] a charming smile, you project an echoing groan deep into [npc.her] mind.",
        ];
      }
    } else if (feminine) {
      lines = [
        "You blow a kiss at [npc.name] and wink suggestively at [npc.herHim].",
        "Biting your lip and putting on your most smouldering look, you run your hands slowly up your inner thighs.",
        "As you give [npc.name] your most innocent look, you blow [npc.herHim] a little kiss.",
        "Turning around, you let out a playful giggle as you give your [pc.ass] a slap.",
        "You slowly run your hands up the length of your body, before pouting at [npc.name].",
      ];
    } else {
      lines = [
        "You blow a kiss at [npc.name] and wink suggestively at [npc.herHim].",
        "Smiling confidently at [npc.name], you slowly run your hands up your inner thighs.",
        "As you give [npc.name] your most seductive look, you blow [npc.herHim] a little kiss.",
        "Turning around, you let out a playful laugh as you give your [pc.ass] a slap.",
        "You try to look as commanding as possible as you smirk playfully at [npc.name].",
      ];
    }
    if (src && !src.player && !src.isPlayer) {
      lines = feminine
        ? [
            "[npc.Name] blows a kiss at [npc2.name] and winks suggestively.",
            "Biting [npc.her] lip, [npc.name] runs [npc.her] hands slowly up [npc.her] inner thighs.",
            "[npc.Name] gives [npc2.name] an innocent look and blows [npc2.herHim] a little kiss.",
            "Turning around, [npc.name] lets out a playful giggle as [npc.she] slaps [npc.her] ass.",
            "[npc.Name] slowly runs [npc.her] hands up [npc.her] body, before pouting at [npc2.name].",
          ]
        : [
            "[npc.Name] blows a kiss at [npc2.name] and winks suggestively.",
            "Smiling confidently, [npc.name] slowly runs [npc.her] hands up [npc.her] inner thighs.",
            "[npc.Name] gives [npc2.name] a seductive look and blows [npc2.herHim] a little kiss.",
            "Turning around, [npc.name] lets out a playful laugh as [npc.she] slaps [npc.her] ass.",
            "[npc.Name] smirks playfully at [npc2.name].",
          ];
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(pick(lines)); }) : pick(lines);
    }
    return parsePair(pick(lines), src, tgt);
  };

  function applyTease(src, tgt, turnIndex, moveId, base, flavour) {
    var dmg = base;
    if (typeof LT.modifyOutgoingLust === "function") dmg = LT.modifyOutgoingLust(src, dmg);
    var crit = typeof LT.applyCrit === "function" ? LT.applyCrit(src, moveId, turnIndex, dmg) : { dmg: dmg, crit: false };
    dmg = crit.dmg;
    if (tgt && tgt.resisting) dmg = Math.max(1, Math.round(dmg * 0.5));
    var dealt = typeof LT.applyLust === "function" ? LT.applyLust(tgt, dmg) : dmg;
    return (
      flavour +
      " <b style='color:" +
      LT.Colour.ATTRIBUTE_LUST +
      ";'>" +
      dealt +
      "</b> lust." +
      (crit.crit ? " <b>Critical hit!</b>" : "")
    );
  }

  function teaseMove(def) {
    LT.MOVES[def.id] = {
      id: def.id,
      name: def.name,
      ap: 1,
      tease: true,
      canUse: def.canUse || function () { return true; },
      cannotUseReason: def.cannotUseReason || function () { return "You cannot use that now."; },
      tooltip: function (src, tgt) {
        return def.tooltip || ("Tease " + nameOf(tgt) + " for " + (def.base || 3) + " lust.");
      },
      predict: function (src, tgt) {
        return (
          "<span style='color:" +
          LT.Colour.ATTRIBUTE_LUST +
          ";'>" +
          def.name +
          "</span> " +
          nameOf(tgt) +
          " for " +
          (def.base || 3) +
          " lust."
        );
      },
      perform: function (src, tgt, turnIndex) {
        var flavour = def.flavour(src, tgt);
        return applyTease(src, tgt, turnIndex, def.id, def.base || 3, flavour);
      },
    };
  }

  function targetFem(tgt) {
    return !!(tgt && tgt.isFeminine && tgt.isFeminine());
  }

  teaseMove({
    id: "tease_breasts",
    name: "Breasts tease",
    base: 3,
    canUse: function (src) {
      return !!(src && src.hasBreasts && src.hasBreasts());
    },
    cannotUseReason: function () {
      return "Available to characters who have breasts.";
    },
    tooltip: "Tease your target with the promise of getting to have a feel of your breasts. Base 3 lust.",
    flavour: function (src, tgt) {
      var line = targetFem(tgt)
        ? pick([
            "Pushing [npc.her] breasts together, [npc.name] [npc.verb(lean)] forwards and [npc.verb(wink)] at [npc2.name], [npc.speech(Let's play together!)]",
            "Running [npc.her] hands suggestively over [npc.her] breasts, [npc.name] [npc.verb(bite)] [npc.her] lip before pouting at [npc2.name], [npc.speech(Don't you want to come and play?)]",
          ])
        : pick([
            "Pushing [npc.her] breasts together, [npc.name] [npc.verb(lean)] forwards and [npc.verb(wink)] at [npc2.name], [npc.speech(Come on, I'll let you have a squeeze!)]",
            "Running [npc.her] hands suggestively over [npc.her] breasts, [npc.name] [npc.verb(bite)] [npc.her] lip before pouting at [npc2.name], [npc.speech(Come on, you know you want a feel!)]",
          ]);
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(line); }) : line;
    },
  });

  teaseMove({
    id: "tease_penis",
    name: "Cock tease",
    base: 3,
    canUse: function (src) {
      return !!(src && src.hasPenis && src.hasPenis());
    },
    cannotUseReason: function () {
      return "Available to characters who have a penis.";
    },
    tooltip: "Tease your target with the promise of using your cock. Base 3 lust.",
    flavour: function (src, tgt) {
      var line = pick([
        "[npc.Name] [npc.verb(grin)] at [npc2.name] and [npc.verb(gesture)] down to [npc.her] groin, [npc.speech(I can't wait to fuck you!)]",
        "Running a hand over [npc.her] bulge, [npc.name] [npc.verb(smirk)] at [npc2.name], [npc.speech(You're going to love my cock!)]",
      ]);
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(line); }) : line;
    },
  });

  teaseMove({
    id: "tease_vaginal",
    name: "Pussy tease",
    base: 3,
    canUse: function (src) {
      return !!(src && src.hasVagina && src.hasVagina());
    },
    cannotUseReason: function () {
      return "Available to characters who have a vagina.";
    },
    tooltip: "Tease your target with the promise of using your pussy. Base 3 lust.",
    flavour: function (src, tgt) {
      var line = pick([
        "[npc.Name] [npc.verb(bite)] [npc.her] lip and [npc.verb(slide)] a hand between [npc.her] thighs, [npc.speech(~Mmm!~ My pussy's wet and ready for you!)]",
        "Parting [npc.her] legs a little, [npc.name] [npc.verb(pout)] at [npc2.name], [npc.speech(Don't you want to come and play?)]",
      ]);
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(line); }) : line;
    },
  });

  teaseMove({
    id: "tease_oral",
    name: "Oral tease",
    base: 3,
    tooltip: "Tell your target that you're going to perform oral on them. Base 3 lust.",
    flavour: function (src, tgt) {
      var line = pick([
        "[npc.Name] [npc.verb(lick)] [npc.her] lips and [npc.verb(look)] down at [npc2.namePos] groin, [npc.speech(I want to taste you!)]",
        "[npc.Name] [npc.verb(tell)] [npc2.name] that [npc.sheIs] going to perform oral on [npc2.herHim].",
      ]);
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(line); }) : line;
    },
  });

  teaseMove({
    id: "tease_dominant",
    name: "Dominant tease",
    base: 3,
    tooltip: "Tell your target that you're going to dominate them. Base 3 lust.",
    flavour: function (src, tgt) {
      var line = pick([
        "[npc.Name] [npc.verb(smirk)] at [npc2.name], [npc.speech(I'm going to pin you down and make you mine!)]",
        "[npc.Name] [npc.verb(tell)] [npc2.name] that [npc.sheIs] going to dominate [npc2.herHim].",
      ]);
      return LT.withParseTargets ? LT.withParseTargets({ npc: src, npc2: tgt }, function () { return LT.parse(line); }) : line;
    },
  });

  LT.TEASE_SPECIAL_IDS = ["tease_breasts", "tease_penis", "tease_vaginal", "tease_oral", "tease_dominant"];

  LT.availableTeases = function (ch) {
    var out = ["tease"];
    for (var i = 0; i < LT.TEASE_SPECIAL_IDS.length; i++) {
      var id = LT.TEASE_SPECIAL_IDS[i];
      var move = LT.MOVES[id];
      if (move && (!move.canUse || move.canUse(ch))) out.push(id);
    }
    return out;
  };
})();
