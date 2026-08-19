(function () {
  function alleyXml(tag) {
    return LT.parseFromXML("places/dominion/slaverAlley/genericDialogue", tag);
  }

  function flags() {
    LT.game.flags = LT.game.flags || {};
    return LT.game.flags;
  }

  function stocksSlaves() {
    return typeof LT.slavesAtCurrentTile === "function" ? LT.slavesAtCurrentTile() : [];
  }

  function allowedUses(rec) {
    var bits = [];
    if (typeof LT.hasSlaveJobSetting !== "function") return ["oral", "vaginal", "anal"];
    if (LT.hasSlaveJobSetting(rec, "PUBLIC_STOCKS", "SEX_ORAL")) bits.push("oral");
    if (LT.hasSlaveJobSetting(rec, "PUBLIC_STOCKS", "SEX_VAGINAL")) bits.push("vaginal");
    if (LT.hasSlaveJobSetting(rec, "PUBLIC_STOCKS", "SEX_ANAL")) bits.push("anal");
    return bits;
  }

  function stocksListHtml() {
    var slaves = stocksSlaves();
    var html = "";
    var i;
    for (i = 0; i < slaves.length; i++) {
      var rec = slaves[i];
      var uses = allowedUses(rec);
      html +=
        "<p><b>" +
        rec.name +
        "</b>, who is your slave, has been marked as available for " +
        (uses.length ? uses.join(", ") : "no penetration at all") +
        " use.</p>";
    }
    return html;
  }

  function stocksBannedAreas(rec) {
    var uses = allowedUses(rec);
    var bans = [];
    if (uses.indexOf("oral") < 0) bans.push("MOUTH");
    if (uses.indexOf("vaginal") < 0) bans.push("VAGINA");
    if (uses.indexOf("anal") < 0) bans.push("ANUS");
    var npc = typeof LT.slaveAsNpc === "function" ? LT.slaveAsNpc(rec) : rec;
    var key = (npc && npc.id) || rec.id || rec.name;
    var out = {};
    if (key && bans.length) out[key] = bans;
    return out;
  }

  function sexResponse(title, tip, opts) {
    if (typeof LT.ResponseSex === "function") return LT.ResponseSex(title, tip, opts);
    return new LT.Response(title, tip, opts.postSexNode || "stocks.afterSex").withColour(LT.Colour.ATTRIBUTE_LUST);
  }

  LT.defineNode({
    id: "place.SLAVER_ALLEY_PUBLIC_STOCKS",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureSean === "function") LT.ensureSean();
      if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
      if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
    },
    getContent: function () {
      var html = alleyXml(flags().slaverAlleySlavesFreed ? "PUBLIC_STOCKS_FREED" : "PUBLIC_STOCKS");
      html += stocksListHtml();
      html += alleyXml("PUBLIC_STOCKS_ENFORCER");
      if (LT.game.flags && LT.game.flags.workSex && typeof LT.jobSexText === "function") {
        var rec = LT.findSlave(LT.game.flags.workSex);
        if (rec) html += LT.jobSexText(rec);
      }
      return html;
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      var seanName = flags().seanIntroduced ? "Sean" : "Enforcer";
      list.push(
        new LT.Response(
          seanName,
          flags().slaverAlleyComplained
            ? "You see Sean watching over the area, so perhaps you could go and talk to him again..."
            : "There appears to be an Enforcer watching over the area. Perhaps you could go and talk to him...",
          "stocks.sean",
        ),
      );
      var slaves = stocksSlaves();
      var i;
      for (i = 0; i < slaves.length; i++) {
        (function (rec) {
          var uses = allowedUses(rec);
          if (!uses.length) {
            list.push(new LT.Response("Use " + rec.name, rec.name + " is not marked for public use.", null).disable(rec.name + " is not marked for public use."));
            return;
          }
          list.push(
            sexResponse("Use " + rec.name, "Walk up to " + rec.name + " and start fucking them right here in public...", {
              partner: typeof LT.slaveAsNpc === "function" ? LT.slaveAsNpc(rec) : rec,
              manager: "stocks",
              consensual: false,
              playerDom: true,
              bannedAreas: stocksBannedAreas(rec),
              postSexNode: "stocks.afterSex",
              startText: alleyXml("PUBLIC_STOCKS_SEX_SOLO"),
            }),
          );
        })(slaves[i]);
      }
      if (typeof LT.slavePresenceResponses === "function") LT.slavePresenceResponses(list);
      return list;
    },
  });

  LT.defineNode({
    id: "stocks.afterSex",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("AFTER_STOCKS_SEX");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Continue on your way.", "place.SLAVER_ALLEY_PUBLIC_STOCKS")];
    },
  });

  LT.defineNode({
    id: "stocks.sean",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureSean === "function") LT.ensureSean();
    },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_SEAN");
    },
    getResponses: function () {
      return [
        new LT.Response("Step back", "Decide against asking anything of Sean and instead step back.", "place.SLAVER_ALLEY_PUBLIC_STOCKS", function () {
          flags().seanIntroduced = true;
        }),
        new LT.Response("Talk", "Ask Sean about himself and his work here.", "stocks.seanTalk", function () {
          flags().seanIntroduced = true;
        }),
        new LT.Response("Complain", "Complain about the public use of slaves in the stocks.", "stocks.complain", function () {
          flags().seanIntroduced = true;
          flags().slaverAlleyComplained = true;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "stocks.seanTalk",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_SEAN_TALK");
    },
    getResponses: function () {
      return LT.getNode("stocks.sean").getResponses(LT.game, 0);
    },
  });

  LT.defineNode({
    id: "stocks.complain",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml(flags().slaverAlleyComplainedRepeat ? "PUBLIC_STOCKS_COMPLAIN_REPEAT" : "PUBLIC_STOCKS_COMPLAIN");
    },
    getResponses: function () {
      flags().slaverAlleyComplainedRepeat = true;
      return [
        new LT.Response("Step back", "Decide against pushing the issue.", "stocks.complainBack"),
        new LT.Response("Persist", "Keep complaining.", "stocks.persist"),
      ];
    },
  });

  LT.defineNode({
    id: "stocks.complainBack",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_COMPLAIN_STEP_BACK");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Step back from Sean.", "place.SLAVER_ALLEY_PUBLIC_STOCKS")];
    },
  });

  LT.defineNode({
    id: "stocks.persist",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_COMPLAIN_PERSIST");
    },
    getResponses: function () {
      return [
        new LT.Response("Step back", "Decide this has gone far enough.", "stocks.persistBack"),
        new LT.Response("Take their place", "Offer to take the slaves' place in the stocks.", "stocks.takePlace"),
      ];
    },
  });

  LT.defineNode({
    id: "stocks.persistBack",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_COMPLAIN_PERSIST_STEP_BACK");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Step back from Sean.", "place.SLAVER_ALLEY_PUBLIC_STOCKS")];
    },
  });

  LT.defineNode({
    id: "stocks.takePlace",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_COMPLAIN_TAKE_PLACE") + alleyXml("PUBLIC_STOCKS_LOCKED_UP");
    },
    getResponses: function () {
      return [null, new LT.Response("Wait", "There's nothing you can do but wait...", "stocks.lockedRandoms")];
    },
  });

  LT.defineNode({
    id: "stocks.lockedRandoms",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 300,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_LOCKED_UP_RANDOMS_APPROACH");
    },
    getResponses: function () {
      return [
        null,
        sexResponse("Endure it", "There's nothing you can do as the public use you.", {
          partner: { id: "stocksStranger", name: "a stranger", feminine: false, getName: function () { return "the stranger"; }, isFeminine: function () { return false; }, getSpeechColour: function () { return LT.Colour.MASCULINE; }, getRaceName: function () { return "human"; } },
          manager: "stocks",
          consensual: false,
          playerDom: false,
          postSexNode: "stocks.lockedAfter",
          startText: alleyXml("PUBLIC_STOCKS_LOCKED_UP_RANDOMS_START_SEX"),
        }),
      ];
    },
  });

  LT.defineNode({
    id: "stocks.lockedAfter",
    ui: "dialogue",
    title: "Public Stocks",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return alleyXml("PUBLIC_STOCKS_LOCKED_UP_AFTER_FIRST_SEX_RANDOMS") + alleyXml("PUBLIC_STOCKS_LOCKED_UP_FINISHED");
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Sean lets you out of the stocks.", "place.SLAVER_ALLEY_PUBLIC_STOCKS", function () {
        LT.game.textStart = alleyXml("PUBLIC_STOCKS_LOCKED_UP_FINISHED_END");
      })];
    },
  });
})();
