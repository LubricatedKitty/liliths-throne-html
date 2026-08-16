(function () {
  var PREG_0_MIN_HOURS = 4;
  var PREG_0_EXTRA_HOURS = 5;
  var PREGNANCY_DURATION_WEEKS = 1;

  function bag(ch) {
    if (!ch.pregnancy) {
      ch.pregnancy = { possibilities: [], litter: null, incubating: {}, seconds: 0, pregnant: false };
    }
    if (!ch.pregnancy.possibilities) ch.pregnancy.possibilities = [];
    if (!ch.offspring) ch.offspring = [];
    return ch.pregnancy;
  }

  function fertilityOf(ch) {
    var base = (ch && ch.attributes && ch.attributes.fertility != null) ? ch.attributes.fertility : 10;
    var bonus = (typeof LT.statusBonus === "function" && LT.statusBonus(ch).fertility) || 0;
    return base + bonus;
  }

  function virilityOf(ch) {
    var base = (ch && ch.attributes && ch.attributes.virility != null) ? ch.attributes.virility : 10;
    var bonus = (typeof LT.statusBonus === "function" && LT.statusBonus(ch).virility) || 0;
    return base + bonus;
  }

  function offspringRange(race) {
    var id = String(race || "HUMAN").toUpperCase();
    if (id === "DEMON" || id === "IMP" || id === "LILIN") return { low: 2, high: 3 };
    if (id === "HARPY") return { low: 2, high: 4 };
    return { low: 1, high: 1 };
  }

  function raceOf(ch) {
    if (!ch) return "HUMAN";
    if (ch.body && ch.body.subspecies) return String(ch.body.subspecies).toUpperCase();
    return String(ch.raceName || "human").toUpperCase().replace(/-/g, "_");
  }

  LT.isPregnant = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    return !!(ch && ch.pregnancy && ch.pregnancy.litter);
  };

  LT.isVisiblyPregnant = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch) return false;
    return (
      LT.hasStatusEffect(ch, "PREGNANT_1") ||
      LT.hasStatusEffect(ch, "PREGNANT_2") ||
      LT.hasStatusEffect(ch, "PREGNANT_3")
    );
  };

  LT.isAbleToBeImpregnated = function (ch) {
    if (!ch || !(ch.hasVagina && ch.hasVagina())) return false;
    if (LT.isVisiblyPregnant(ch)) return false;
    if (ch.pregnancy && ch.pregnancy.incubating && ch.pregnancy.incubating.VAGINA) return false;
    return true;
  };

  LT.pregnancyChance = function (mother, father) {
    if (!LT.isAbleToBeImpregnated(mother)) return 0;
    if (father && father.hasPenis && !father.hasPenis()) return 0;
    var chance = 0.1;
    chance += virilityOf(father) / 100 / 2;
    chance += fertilityOf(mother) / 100 / 2;
    if (chance < 0) chance = 0;
    if (chance > 1) chance = 1;
    return chance;
  };

  function chanceLabel(chance) {
    if (chance <= 0) return { id: "NO_CHANCE", name: "no chance" };
    if (chance < 0.2) return { id: "LOW", name: "small chance" };
    if (chance < 0.6) return { id: "AVERAGE", name: "chance" };
    return { id: "HIGH", name: "high chance" };
  }

  function makeLitter(mother, father, count) {
    var takesAfterMother = 0;
    var sons = 0;
    var daughters = 0;
    var i;
    for (i = 0; i < count; i++) {
      var fem = Math.random() < 0.5;
      if (fem) daughters += 1;
      else sons += 1;
      if (Math.random() < 0.5) takesAfterMother += 1;
    }
    return {
      id: (mother.id || "pc") + "-" + ((mother.pregnancy && mother.pregnancy.littersGenerated) || 0),
      motherId: mother.id || "player",
      fatherId: (father && father.id) || "unknown",
      fatherName: father && father.getName ? father.getName() : (father && father.name) || "someone",
      motherRace: raceOf(mother),
      fatherRace: raceOf(father),
      count: count,
      sons: sons,
      daughters: daughters,
      conceptionSeconds: (LT.game && LT.game.secondsPassed) || 0,
    };
  }

  LT.rollForPregnancy = function (mother, father) {
    mother = mother || (LT.game && LT.game.player);
    if (!mother) return "";
    var preg = bag(mother);
    if (LT.isVisiblyPregnant(mother)) {
      return "<p class='centre noPad'>You're already pregnant, so there's no chance of another impregnation right now!</p>";
    }
    var chance = LT.pregnancyChance(mother, father);
    var poss = {
      motherId: mother.id || "player",
      fatherId: (father && father.id) || "unknown",
      probability: chance,
    };
    preg.possibilities.push(poss);
    if (father && father.pregnancy) bag(father);
    if (father && father.pregnancy) {
      father.pregnancy.possibilities = father.pregnancy.possibilities || [];
      father.pregnancy.possibilities.push(poss);
    }
    var label = chanceLabel(chance);
    var html =
      "<p class='centre noPad'>As " +
      ((father && father.getName && father.getName()) || "they") +
      " climax, you realise there's a <b>" +
      label.name +
      "</b> that you'll get pregnant!</p>";
    if (!LT.isPregnant(mother)) {
      if (!LT.hasStatusEffect(mother, "PREGNANT_0")) {
        var hours = PREG_0_MIN_HOURS + Math.floor(Math.random() * PREG_0_EXTRA_HOURS);
        LT.addStatusEffect(mother, "PREGNANT_0", { secondsRemaining: hours * 3600 });
      }
      if (chance > 0 && Math.random() <= chance) {
        var range = offspringRange(raceOf(mother) === "HUMAN" ? raceOf(father) : raceOf(mother));
        var count = range.low + Math.floor(Math.random() * (range.high - range.low + 1));
        preg.litter = makeLitter(mother, father, count);
        preg.pregnant = true;
        preg.littersGenerated = (preg.littersGenerated || 0) + 1;
      }
    }
    return html;
  };

  LT.endPregnancy = function (ch, withBirth) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch) return null;
    var preg = bag(ch);
    var litter = preg.litter;
    if (withBirth && litter) {
      litter.birthSeconds = (LT.game && LT.game.secondsPassed) || 0;
      ch.offspring = ch.offspring || [];
      ch.offspring.push(litter);
    }
    preg.litter = null;
    preg.pregnant = false;
    preg.possibilities = [];
    LT.removeStatusEffect(ch, "PREGNANT_0");
    LT.removeStatusEffect(ch, "PREGNANT_1");
    LT.removeStatusEffect(ch, "PREGNANT_2");
    LT.removeStatusEffect(ch, "PREGNANT_3");
    return litter;
  };

  LT.lastLitterBirthed = function (ch) {
    ch = ch || (LT.game && LT.game.player);
    if (!ch || !ch.offspring || !ch.offspring.length) return null;
    return ch.offspring[ch.offspring.length - 1];
  };

  function pregStageHours() {
    return Math.floor((PREGNANCY_DURATION_WEEKS * 7 * 24) / 2);
  }

  function stageDuration() {
    var maxH = pregStageHours();
    return 3600 * (maxH - 12 + Math.floor(Math.random() * 13));
  }

  function startFirstPregnancyQuest() {
    var flags = LT.game && LT.game.flags;
    if (!flags) return;
    if (flags.pregnancyQuest === "complete") return;
    flags.pregnancyQuest = "SIDE_PREGNANCY_CONSULT_LILAYA";
  }

  LT.advanceFirstPregnancyQuest = function (next) {
    if (!LT.game.flags) return;
    LT.game.flags.pregnancyQuest = next;
  };

  LT.completeFirstPregnancyQuest = function () {
    if (!LT.game.flags) return;
    LT.game.flags.pregnancyQuest = "complete";
  };

  LT.applyPregnancyStageExpire = function (ch, id) {
    if (!ch) return "";
    if (id === "PREGNANT_0") {
      if (LT.isPregnant(ch)) {
        LT.addStatusEffect(ch, "PREGNANT_1", { secondsRemaining: stageDuration() });
        if (ch.player) startFirstPregnancyQuest();
        if (!ch.player) return "";
        var count = (ch.pregnancy.litter && ch.pregnancy.litter.count) || 1;
        return (
          "<p>For the last few hours, your belly has been gradually swelling. The progress was so slow that you didn't even realise anything was happening, but as you glance down at your stomach, there's no mistaking it. You're pregnant.</p>" +
          "<p>[pc.thought(I-I'm pregnant?<br/>...<br/>Oh my God! <b>I'm pregnant!</b>)]</p>" +
          "<p>The sudden shock of not only discovering that you're pregnant, but also that you're showing physical signs after only a few hours, hits you like a sledgehammer. If anyone knows what to do, it'll be Lilaya.</p>" +
          "<p style='text-align:center;'><b style='color:" +
          LT.Colour.GENERIC_SEX +
          ";'>You're pregnant!</b></p>" +
          (count > 1 ? "<p>You have a feeling that there is more than one child growing inside of you.</p>" : "")
        );
      }
      LT.endPregnancy(ch, false);
      if (!ch.player) return "";
      return (
        "<p>Enough time has passed now for you to be sure that you're in the clear. There's no sign of any bump in your belly, and you realise that despite having unprotected sex, you managed to avoid getting pregnant.</p>" +
        "<p>[pc.thought(Well, that's a relief...)]</p>" +
        "<p style='text-align:center;'><b style='color:" +
        LT.Colour.GENERIC_SEX +
        ";'>You aren't pregnant!</b></p>"
      );
    }
    if (id === "PREGNANT_1") {
      LT.addStatusEffect(ch, "PREGNANT_2", { secondsRemaining: stageDuration() });
      if (!ch.player) return "";
      return "<p>Your belly has swollen considerably. You're now <b>heavily pregnant</b>.</p>";
    }
    if (id === "PREGNANT_2") {
      if (!ch.player) return "";
      return "<p>Your belly has inflated to a colossal size. You're ready to give birth — it might be a good idea to visit Lilaya...</p>";
    }
    return "";
  };

  function birthXml(tag) {
    return typeof LT.parseFromXML === "function" ? LT.parseFromXML("places/dominion/lilayasHome/lilayaBirthing", tag) : "";
  }

  function consultHtml(first) {
    if (!first) return birthXml("LILAYA_ASSISTS_PREGNANCY_REPEAT");
    var html = birthXml("LILAYA_ASSISTS_PREGNANCY_START");
    var p = LT.game.player;
    var lilaya = LT.game.npcs && LT.game.npcs.lilaya;
    var hadSex = !!(LT.game.flags && LT.game.flags.hadSexWithLilaya);
    if (hadSex && p && p.pregnancy && p.pregnancy.possibilities) {
      var anyLilaya = p.pregnancy.possibilities.some(function (x) {
        return x.fatherId === "lilaya" || (lilaya && x.fatherId === lilaya.id);
      });
      var anyOther = p.pregnancy.possibilities.some(function (x) {
        return x.fatherId !== "lilaya" && (!lilaya || x.fatherId !== lilaya.id);
      });
      if (anyLilaya && anyOther) html += birthXml("LILAYA_ASSISTS_PREGNANCY_LILAYA_POSSIBLY_FATHER");
      else if (anyLilaya) html += birthXml("LILAYA_ASSISTS_PREGNANCY_LILAYA_DEFINITELY_FATHER");
      else html += birthXml("LILAYA_ASSISTS_PREGNANCY_LILAYA_DEFINITELY_NOT_FATHER");
    }
    html += birthXml("LILAYA_ASSISTS_PREGNANCY_END");
    return html;
  }

  function birthResponses() {
    var ready = LT.hasStatusEffect(LT.game.player, "PREGNANT_3") || (LT.isPregnant(LT.game.player) && !LT.hasStatusEffect(LT.game.player, "PREGNANT_1") && !LT.hasStatusEffect(LT.game.player, "PREGNANT_2") && !LT.hasStatusEffect(LT.game.player, "PREGNANT_0"));
    var give = new LT.Response("Give birth", ready ? "Tell Lilaya that you're ready to give birth." : "You need to wait until your belly has finished growing before you're able to give birth.", ready ? "lab.birth.type" : null);
    if (!ready) give.disable("You need to wait until your belly has finished growing before you're able to give birth.");
    return [
      new LT.Response("Back", "Tell Lilaya that you need a moment to think.", "lab.entry"),
      give,
    ];
  }

  LT.defineNode({
    id: "lab.pregnancy",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return consultHtml(true);
    },
    getResponses: birthResponses,
  });

  LT.defineNode({
    id: "lab.pregnancyRepeat",
    ui: "dialogue",
    title: "Lilaya's Laboratory",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return consultHtml(false);
    },
    getResponses: birthResponses,
  });

  LT.defineNode({
    id: "lab.birth.type",
    ui: "dialogue",
    title: "Giving birth",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return birthXml("LILAYA_DETECTS_BIRTHING_TYPE");
    },
    getResponses: function () {
      return [
        new LT.Response("Follow Lilaya", "Allow Lilaya to lead you to the birthing room.", "lab.birth.room"),
      ];
    },
  });

  LT.defineNode({
    id: "lab.birth.room",
    ui: "dialogue",
    title: "Birthing Room",
    secondsPassed: 600,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var first = !(LT.game.flags && LT.game.flags.pregnancyQuest === "complete");
      return birthXml(first ? "ASSIST_BIRTHING_FIRST_TIME" : "ASSIST_BIRTHING");
    },
    getResponses: function () {
      return [
        new LT.Response("Start", "Tell Lilaya that you're ready to give birth now.", "lab.birth.delivers", function () {
          LT.endPregnancy(LT.game.player, true);
          if (LT.game.player) LT.game.player.mana = 0;
          LT.completeFirstPregnancyQuest();
        }).withTime(14400),
        new LT.Response("Knock out", "Ask Lilaya if she could give you something to knock you out.", "lab.birth.knockout", function () {
          LT.endPregnancy(LT.game.player, true);
          if (LT.game.player) LT.game.player.mana = 0;
          LT.completeFirstPregnancyQuest();
        }).withTime(14400),
      ];
    },
  });

  LT.defineNode({
    id: "lab.birth.delivers",
    ui: "dialogue",
    title: "Birthing Room",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var litter = LT.lastLitterBirthed();
      var count = (litter && litter.count) || 1;
      return (
        birthXml("LILAYA_ASSISTS_BIRTHING_DELIVERS") +
        "<p><i>You hear Lilaya speaking from somewhere beneath you, but you can't make out what she's saying...</i></p>" +
        "<p>You feel a weight on your chest, and you're vaguely aware of something greedily drinking a bottle of milk as you cradle it in your arms...</p>" +
        "<p>Some time later, you imagine seeing " +
        count +
        " strangely familiar " +
        (count === 1 ? "child" : "children") +
        " bending down over you, before departing...</p>"
      );
    },
    getResponses: function () {
      return [new LT.Response("Finished", "Lilaya has finished delivering your children.", "lab.birth.finished")];
    },
  });

  LT.defineNode({
    id: "lab.birth.knockout",
    ui: "dialogue",
    title: "Birthing Room",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return birthXml("LILAYA_ASSISTS_BIRTHING_KNOCK_OUT");
    },
    getResponses: function () {
      return [new LT.Response("Wake up", "You slowly start to come to.", "lab.birth.finished")];
    },
  });

  LT.defineNode({
    id: "lab.birth.finished",
    ui: "dialogue",
    title: "Birthing Room",
    secondsPassed: 600,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      var litter = LT.lastLitterBirthed();
      var count = (litter && litter.count) || 1;
      return (
        birthXml("LILAYA_ASSISTS_BIRTHING_FINISHED") +
        "<p style='text-align:center;'>You gave birth to <b>" +
        count +
        "</b> " +
        (count === 1 ? "child" : "children") +
        ".</p>"
      );
    },
    getResponses: function () {
      return [new LT.Response("Leave", "Thank Lilaya and leave the birthing room.", "lab.entry")];
    },
  });
})();
