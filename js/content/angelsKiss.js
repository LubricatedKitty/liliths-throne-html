(function () {
  function xml(tag) {
    return LT.parseFromXML("places/dominion/redLightDistrict/angelsKiss", tag);
  }

  function hasLicense() {
    return !!(LT.game.flags && LT.game.flags.hasProstitutionLicense);
  }

  function metAngel() {
    return !!(LT.game.flags && LT.game.flags.angelIntroduced);
  }

  LT.PROSTITUTION_LICENSE_COST = 5000;

  LT.defineNode({
    id: "place.DOMINION_RED_LIGHT_DISTRICT",
    ui: "dialogue",
    title: "Red-Light District",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.maybePlaceEncounter === "function") LT.maybePlaceEncounter();
    },
    getContent: function () {
      var info = (typeof getCurrentTile === "function" && getCurrentTile() && getCurrentTile().location) || {};
      return "<p>" + (info.description || LT.places.DOMINION_RED_LIGHT_DISTRICT.description) + "</p>";
    },
    getResponses: function () {
      return LT.travelResponses();
    },
  });

  LT.defineNode({
    id: "place.ANGELS_KISS_ENTRANCE",
    ui: "dialogue",
    title: "Entrance Hall",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml(metAngel() ? "ENTRANCE_REPEAT" : "ENTRANCE");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      list.push(
        new LT.Response("Office", "Follow the corridor to Angel's office and ask about a prostitution license.", null, function () {
          if (typeof LT.enterWorld === "function") LT.enterWorld("ANGELS_KISS_GROUND_FLOOR", "ANGELS_KISS_OFFICE");
          else LT.game.setContent("place.ANGELS_KISS_OFFICE");
        }),
      );
      return list;
    },
  });

  LT.defineNode({
    id: "place.ANGELS_KISS_CORRIDOR",
    ui: "dialogue",
    title: "Corridor",
    secondsPassed: 30,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("CORRIDOR");
    },
    getResponses: function () {
      return LT.travelResponses();
    },
  });

  function officeTag() {
    if (hasLicense()) return "OFFICE_REPEAT_WITH_LICENSE";
    if (metAngel()) return "OFFICE_REPEAT";
    return "OFFICE";
  }

  function officeResponses() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    list.push(new LT.Response("Prostitution", "Ask Angel about the laws and regulations regarding prostitution in Dominion.", "angel.prostitution"));
    if (hasLicense()) return list;
    var cost = LT.PROSTITUTION_LICENSE_COST;
    if (LT.getMoney() >= cost) {
      list.push(
        new LT.Response(
          "License (" + cost + ")",
          "Agree to Angel's deal and purchase a prostitution license.",
          "angel.license",
          function () {
            LT.game.textEnd = LT.incrementMoney(-cost);
            LT.game.flags.hasProstitutionLicense = true;
            LT.game.flags.angelIntroduced = true;
          },
        ),
      );
    } else {
      list.push(
        new LT.Response("License (" + cost + ")", "You don't have enough money to buy a prostitution license.", null).disable(
          "A prostitution license costs " + cost + " flames.",
        ),
      );
    }
    return list;
  }

  LT.defineNode({
    id: "place.ANGELS_KISS_OFFICE",
    ui: "dialogue",
    title: "Angel's Office",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      LT.game.flags = LT.game.flags || {};
      if (typeof LT.ensureAngel === "function") LT.ensureAngel();
    },
    getContent: function () {
      return xml(officeTag());
    },
    getResponses: function () {
      LT.game.flags.angelIntroduced = true;
      return officeResponses();
    },
  });

  LT.defineNode({
    id: "angel.prostitution",
    ui: "dialogue",
    title: "Angel's Office",
    secondsPassed: 120,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("OFFICE_PROSTITUTION");
    },
    getResponses: officeResponses,
  });

  LT.defineNode({
    id: "angel.license",
    ui: "dialogue",
    title: "Angel's Office",
    secondsPassed: 180,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("OFFICE_LICENSE_PURCHASE");
    },
    getResponses: officeResponses,
  });

  LT.BUNNY_SEX_COST = 1500;
  LT.LOPPY_SEX_COST = 2000;
  LT.LOPPY_SUB_COST = 2500;
  LT.WHORE_PAY = 2000;

  function makeClient() {
    var fem = Math.random() < 0.5;
    var name = fem ? "the client" : "the client";
    var n = {
      id: "angelClient",
      name: name,
      feminine: fem,
      gender: fem ? LT.Gender.FEMALE : LT.Gender.MALE,
      fullRace: fem ? "human" : "human",
      speechColour: fem ? LT.Colour.FEMININE : LT.Colour.MASCULINE,
      getName: function () {
        return "the client";
      },
      getFullName: function () {
        return "the client";
      },
      isFeminine: function () {
        return !!this.feminine;
      },
      getSpeechColour: function () {
        return this.speechColour;
      },
      hasVagina: function () {
        return !!(this.gender && this.gender.hasVagina);
      },
      hasPenis: function () {
        return !!(this.gender && this.gender.hasPenis);
      },
      hasBreasts: function () {
        return !!(this.gender && this.gender.hasBreasts);
      },
    };
    LT.game.npcs = LT.game.npcs || {};
    LT.game.npcs.npc = n;
    LT.game.npcs.angelClient = n;
    return n;
  }

  function paySex(cost, partner, startTag, afterNode, playerDom) {
    if (LT.getMoney() < cost) {
      return new LT.Response("Sex (" + cost + ")", "You don't have " + cost + " flames.", null).disable("You need " + cost + " flames.");
    }
    var r = LT.ResponseSex("Sex (" + cost + ")", "Pay " + cost + " flames.", {
      partner: partner,
      playerDom: playerDom !== false,
      consensual: true,
      startText: xml(startTag),
      postSexNode: afterNode,
    });
    var orig = r.effects;
    r.effects = function () {
      LT.incrementMoney(-cost);
      if (orig) orig();
    };
    return r;
  }

  LT.defineNode({
    id: "place.ANGELS_KISS_BEDROOM_BUNNY",
    ui: "dialogue",
    title: "Bunny's Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBunny === "function") LT.ensureBunny();
    },
    getContent: function () {
      return xml(LT.game.flags && LT.game.flags.bunnyIntroduced ? "ANGELS_KISS_BEDROOM_BUNNY_REPEAT" : "ANGELS_KISS_BEDROOM_BUNNY");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      list.push(new LT.Response("Enter", "Enter Bunny's room and say hello.", "bunny.enter"));
      return list;
    },
  });

  LT.defineNode({
    id: "bunny.enter",
    ui: "dialogue",
    title: "Bunny's Bedroom",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureBunny === "function") LT.ensureBunny();
    },
    getContent: function () {
      return xml(LT.game.flags && LT.game.flags.bunnyIntroduced ? "ANGELS_KISS_BEDROOM_BUNNY_ENTER_REPEAT" : "ANGELS_KISS_BEDROOM_BUNNY_ENTER");
    },
    getResponses: function () {
      var bunny = LT.ensureBunny();
      var list = [new LT.Response("Leave", "Step back out.", "place.ANGELS_KISS_BEDROOM_BUNNY")];
      var sex = paySex(LT.BUNNY_SEX_COST, bunny, "BEDROOM_BUNNY_SEX", "bunny.after", true);
      var orig = sex.effects;
      sex.effects = function () {
        LT.game.flags.bunnyIntroduced = true;
        if (orig) orig();
      };
      list.push(sex);
      return list;
    },
  });

  LT.defineNode({
    id: "bunny.after",
    ui: "dialogue",
    title: "Bunny's Bedroom",
    secondsPassed: 300,
    chrome: { left: true, right: true },
    getContent: function () {
      var bunny = LT.game.npcs && LT.game.npcs.bunny;
      var orgasmed = bunny && bunny.orgasmedThisSex;
      return xml(orgasmed ? "AFTER_SEX_BUNNY" : "AFTER_SEX_BUNNY_NO_ORGASM");
    },
    getResponses: function () {
      return [new LT.Response("Leave", "Leave Bunny's room.", "place.ANGELS_KISS_BEDROOM_BUNNY")];
    },
  });

  LT.defineNode({
    id: "place.ANGELS_KISS_BEDROOM_LOPPY",
    ui: "dialogue",
    title: "Loppy's Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureLoppy === "function") LT.ensureLoppy();
    },
    getContent: function () {
      return xml(LT.game.flags && LT.game.flags.loppyIntroduced ? "ANGELS_KISS_BEDROOM_LOPPY_REPEAT" : "ANGELS_KISS_BEDROOM_LOPPY");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      list.push(new LT.Response("Enter", "Enter Loppy's room and say hello.", "loppy.enter"));
      return list;
    },
  });

  LT.defineNode({
    id: "loppy.enter",
    ui: "dialogue",
    title: "Loppy's Bedroom",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureLoppy === "function") LT.ensureLoppy();
    },
    getContent: function () {
      return xml(LT.game.flags && LT.game.flags.loppyIntroduced ? "ANGELS_KISS_BEDROOM_LOPPY_ENTER_REPEAT" : "ANGELS_KISS_BEDROOM_LOPPY_ENTER");
    },
    getResponses: function () {
      var loppy = LT.ensureLoppy();
      var list = [new LT.Response("Leave", "Step back out.", "place.ANGELS_KISS_BEDROOM_LOPPY")];
      function wrap(cost, tag, dom) {
        var r = paySex(cost, loppy, tag, "loppy.after", dom);
        var orig = r.effects;
        r.effects = function () {
          LT.game.flags.loppyIntroduced = true;
          if (orig) orig();
        };
        return r;
      }
      list.push(wrap(LT.LOPPY_SEX_COST, "BEDROOM_LOPPY_SEX", true));
      var sub = wrap(LT.LOPPY_SUB_COST, "BEDROOM_LOPPY_SEX_SUBMISSIVE", false);
      sub.title = "Submissive Sex (" + LT.LOPPY_SUB_COST + ")";
      list.push(sub);
      return list;
    },
  });

  LT.defineNode({
    id: "loppy.after",
    ui: "dialogue",
    title: "Loppy's Bedroom",
    secondsPassed: 300,
    chrome: { left: true, right: true },
    getContent: function () {
      var loppy = LT.game.npcs && LT.game.npcs.loppy;
      var orgasmed = loppy && loppy.orgasmedThisSex;
      return xml(orgasmed ? "BEDROOM_LOPPY_AFTER_SEX" : "BEDROOM_LOPPY_AFTER_SEX_NO_ORGASM");
    },
    getResponses: function () {
      return [new LT.Response("Leave", "Leave Loppy's room.", "place.ANGELS_KISS_BEDROOM_LOPPY")];
    },
  });

  function firstFloor() {
    return !!(LT.game.player && LT.game.player.location && LT.game.player.location.world === "ANGELS_KISS_FIRST_FLOOR");
  }

  LT.defineNode({
    id: "place.ANGELS_KISS_BEDROOM",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
      if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
    },
    getContent: function () {
      var html;
      if (!hasLicense()) html = xml("BEDROOM_EMPTY");
      else if (!firstFloor()) html = xml("BEDROOM_EMPTY_WHORE_SELF_GROUND_FLOOR");
      else html = xml("BEDROOM_EMPTY_WHORE_SELF");
      if (LT.game.flags && LT.game.flags.workSex && typeof LT.jobSexText === "function") {
        var rec = LT.findSlave(LT.game.flags.workSex);
        if (rec) html += LT.jobSexText(rec);
      }
      return html;
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (hasLicense() && firstFloor()) {
        list.push(new LT.Response("Wait (submissive)", "Wait here as the submissive partner for a client.", "angel.wait-sub"));
        list.push(new LT.Response("Wait (dominant)", "Wait here as the dominant partner for a client.", "angel.wait-dom"));
      }
      if (typeof LT.slavePresenceResponses === "function") return LT.slavePresenceResponses(list);
      return list;
    },
  });

  function waitNode(id, tag, startTag, afterTag, playerDom) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: "Bedroom",
      secondsPassed: 1500,
      travelDisabled: true,
      chrome: { left: true, right: true },
      getContent: function () {
        makeClient();
        return xml(tag);
      },
      getResponses: function () {
        var client = LT.game.npcs.angelClient;
        var sex = LT.ResponseSex("Sex (" + LT.WHORE_PAY + ")", "Accept the price of " + LT.WHORE_PAY + " flames.", {
          partner: client,
          playerDom: playerDom,
          consensual: true,
          startText: xml(startTag),
          postSexNode: afterTag,
        });
        var orig = sex.effects;
        sex.effects = function () {
          LT.incrementMoney(LT.WHORE_PAY);
          if (orig) orig();
        };
        return [new LT.Response("Decline", "Send the client away.", "place.ANGELS_KISS_BEDROOM"), sex];
      },
    });
  }
  waitNode("angel.wait-sub", "SELL_SELF_SUB", "SELL_SELF_SUB_START", "angel.after-sub", false);
  waitNode("angel.wait-dom", "SELL_SELF_DOM", "SELL_SELF_DOM_START", "angel.after-dom", true);

  LT.defineNode({
    id: "angel.after-sub",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("SELL_SELF_SUB_AFTER_SEX");
    },
    getResponses: function () {
      return [new LT.Response("Continue", "The client leaves.", "place.ANGELS_KISS_BEDROOM")];
    },
  });
  LT.defineNode({
    id: "angel.after-dom",
    ui: "dialogue",
    title: "Bedroom",
    secondsPassed: 60,
    chrome: { left: true, right: true },
    getContent: function () {
      return xml("SELL_SELF_DOM_AFTER_SEX");
    },
    getResponses: function () {
      return [new LT.Response("Continue", "The client leaves.", "place.ANGELS_KISS_BEDROOM")];
    },
  });
})();
