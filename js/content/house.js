(function () {
  function isDay() {
    var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
    var h = Math.floor(s / 3600);
    return h >= 6 && h < 21;
  }

  function tile() {
    return typeof getCurrentTile === "function" ? getCurrentTile() : null;
  }

  function placeType() {
    var t = tile();
    return (t && t.location && t.location.placeType) || "";
  }

  function placeInfo() {
    var t = tile();
    if (t && t.location) return t.location;
    return { name: "Unknown", description: "" };
  }

  function p(html) {
    return "<p>" + html + "</p>";
  }

  function placeBody() {
    var pt = placeType();
    var loc = placeInfo();
    if (pt === "LILAYA_HOME_ROOM_PLAYER") {
      return (
        p("Your bedroom is positioned close to the main staircase linking the entrance hall to the first-floor corridor, and is one of the largest chambers in the entire mansion. Opposite the room's main doorway, a set of four large, sash windows provide an excellent view of the courtyard garden below, while off to the left, another door leads through into your private ensuite bathroom.") +
        p("A king-sized bed sits against the right-hand wall, while two sets of drawers and a full-height wardrobe provide you with all the storage space you'd ever need. Other than those items of furniture, you also have a sofa, a writing desk complete with matching chair, and a full-height free-standing mirror.") +
        p("Like everything else that normally would have run on electricity in your world, the lighting, radiators, and plumbing all appear to be powered by the arcane.")
      );
    }
    if (pt === "LILAYA_HOME_CORRIDOR") {
      return (
        p("Immaculately-clean red carpet runs down the centre of the wide corridor which you're currently walking down, while the walls are decorated in a pale, light-blue wallpaper that sports a series of delicate white floral patterns. Fine landscape paintings and portraits of beautiful demons are hung up on the walls at regular intervals, while all manner of antique curiosities are perched upon the many wooden cabinets which line the sides of these hallways.") +
        (isDay()
          ? p("Large glass windows flood the corridor with an impressive amount of natural daylight, and you notice that Rose seems to be taking care to leave some of them open every now and again, making sure that the air in the house always feels fresh.")
          : p("As it's currently night time, heavy fabric curtains have been drawn over the corridor's large glass windows, leaving the area to be illuminated by the many arcane-powered wall-lights.")) +
        p("This corridor is deserted at the moment, and there doesn't really seem to be much to do here.")
      );
    }
    if (pt === "LILAYA_HOME_ENTRANCE_HALL") {
      return (
        p("Lilaya's house is by far the most impressive building you've ever been in. The entrance hall that you find yourself standing in is alone far larger than your old flat, and is extravagantly decorated in a style befitting a royal palace. Fine paintings and marble busts line the walls, and a huge crystal chandelier hangs from the double-height ceiling, casting its warm light over a grand, red-carpeted staircase that leads to the upper floor.") +
        p("From previous explorations, you know that the rest of the house is furnished in much the same manner. You tried to count all the rooms once, but gave up after reaching well over one hundred. Despite its grand appearance and impressive size, the only member of staff you've ever seen is Lilaya's slave; the cat-girl maid called Rose. Lilaya herself spends almost every waking moment working in her lab, resulting in the house being eerily quiet for most of the time.")
      );
    }
    if (pt === "LILAYA_HOME_STAIR_UP") {
      return (
        p("The grand, red-carpeted staircase is one of the first things you see when entering Lilaya's home. Half-way up the shallow steps, there's a secondary landing area, which is home to a couple of antique-looking cabinets and well looked after house plants. Branching off from the sides of this landing, two slightly-narrower staircases wrap around and lead up to the floor above.") +
        p("A huge portrait of two women hangs on the wall of the landing area, overlooking the entire entrance hall. You immediately recognise the half-demon sitting in the chair as Lilaya, and you can only assume that the gorgeous figure standing behind her is her Lilin mother, Lyssieth.")
      );
    }
    if (pt === "LILAYA_HOME_STAIR_DOWN") {
      return p("Standing at the top of the grand, red-carpeted staircase, you find yourself looking down at the huge portrait of Lilaya and her mother. Wondering if you'll ever get to ask Lilaya about the circumstances under which this portrait was painted, you look away and continue on your way...");
    }
    if (pt === "LILAYA_HOME_STAIR_UP_SECONDARY") {
      return p("In this particular section of the corridor, there's a large recess set into the wall which is home to a series of carpeted stairs. While not as grand as the one positioned in front of the mansion's main entrance, this wide, sweeping staircase is nevertheless far more impressive than any you'd find in a regular house, and you wonder whether you should make use of it to travel up to the first floor...");
    }
    if (pt === "LILAYA_HOME_STAIR_DOWN_SECONDARY") {
      return p("In this particular section of the corridor, there's a large recess set into the wall which is home to a series of carpeted stairs. While not as grand as the one positioned in front of the mansion's main entrance, this wide, sweeping staircase is nevertheless far more impressive than any you'd find in a regular house, and you wonder whether you should make use of it to travel down to the ground floor...");
    }
    if (pt === "LILAYA_HOME_GARDEN") {
      return (
        p("The garden courtyard consists of a series of wide, perfectly trimmed grass pathways, each one lined with beds of brightly-coloured flowers. Although Rose is now the one responsible for maintaining it, you guess that Lilaya must have hired a professional company in order to have had this area landscaped so perfectly.") +
        p("Clearly being fond of her maid's namesake, you see that several magnificent rose bushes have been planted throughout the garden.")
      );
    }
    if (pt === "LILAYA_HOME_FOUNTAIN") {
      return p("In the very centre of the garden courtyard, a huge, ornate water fountain happily bubbles away with a mind of its own. The structure is made up of a collection of intricate statues; each one of a beautiful woman in some manner of indecent pose.");
    }
    if (pt === "LILAYA_HOME_ROOM_ROSE") {
      var night = typeof LT.isWorkTime === "function" ? !LT.isWorkTime() : false;
      return (
        p("Evidence of Rose's close relationship with Lilaya is apparent as you approach the cat-girl's room. Hanging on the door, there's a little home-made sign bearing her name, and underneath, in flowing handwriting which you recognise as Lilaya's, a little message reads: <i>'My loving Mistress'</i>") +
        (night
          ? p("It's late. Soft sounds from within suggest Lilaya and Rose have retired here for the night. You shouldn't disturb them.")
          : p("The door appears to be locked at the moment, and there's no sound of anyone stirring within."))
      );
    }
    if (loc.description) return p(loc.description);
    return p("You are in " + (loc.name || "this part of the house") + ".");
  }

  function roomBody() {
    var html = placeBody();
    if (typeof LT.houseRoomContent === "function") return LT.houseRoomContent(html);
    return html;
  }

  function houseActions() {
    var list = LT.travelResponses ? LT.travelResponses() : [null];
    var pt = placeType();
    if (pt === "LILAYA_HOME_ROOM_PLAYER") {
      list.push(
        new LT.Response("Rest (1 hour)", "Rest for an hour. As well as replenishing your health and aura, you will also get the 'Well Rested' status effect.", null, function () {
          if (typeof LT.applySleepEffect === "function") LT.applySleepEffect(LT.game.player, 60);
          LT.game.advanceTime(3600);
          if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
          LT.game.textStart = "<p>After having a good rest, you feel full of energy.</p>";
          LT.game.setContent(LT.game.currentNode);
        }),
        new LT.Response("Sleep", "Sleep until morning (07:00). As well as replenishing your health and aura, you will also get the 'Well Rested' status effect.", null, function () {
          var s = ((LT.game.secondsPassed % 86400) + 86400) % 86400;
          var target = 7 * 3600;
          var delta = target - s;
          if (delta <= 0) delta += 86400;
          if (typeof LT.applySleepEffect === "function") LT.applySleepEffect(LT.game.player, Math.round(delta / 60));
          if (typeof LT.waitUntilHour === "function") LT.waitUntilHour(7);
          else LT.game.advanceTime(delta);
          if (typeof LT.updateHouseNpcLocations === "function") LT.updateHouseNpcLocations();
          LT.game.textStart = "<p>You sleep until morning. After having a good rest, you feel full of energy.</p>";
          LT.game.setContent(LT.game.currentNode);
        }),
      );
    }
    if (typeof LT.houseExtraResponses === "function") return LT.houseExtraResponses(list);
    return list;
  }

  function fastTravel() {
    var here = placeType();
    function go(title, tip, world, place) {
      if (here === place) return new LT.Response(title, tip, null).disable("You are already here.");
      return new LT.Response(title, tip, null, function () {
        LT.game.advanceTime(10);
        LT.travelToPlace(world, place);
      });
    }
    return [
      null,
      go("Your room", "Fast travel up to your room.", "LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_ROOM_PLAYER"),
      go("Lilaya's Lab", "Fast travel to Lilaya's Lab.", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_LAB"),
      go("Kitchen", "Fast travel to the kitchen.", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_KITCHEN"),
      go("Library", "Fast travel to the library.", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_LIBRARY"),
      go("Entrance hall", "Fast travel to the entrance hall.", "LILAYAS_HOUSE_GROUND_FLOOR", "LILAYA_HOME_ENTRANCE_HALL"),
    ];
  }

  function houseResponses(game, tab) {
    if (tab === 1) return fastTravel();
    return houseActions();
  }

  function definePlaceNode(id, fallbackTitle) {
    LT.defineNode({
      id: id,
      ui: "dialogue",
      title: function () {
        return placeInfo().name || fallbackTitle || "Lilaya's Home";
      },
      secondsPassed: 0,
      chrome: { left: true, right: true },
      tabs: ["Actions", "Fast travel"],
      applyPreParsingEffects: function () {
        if (typeof LT.syncSlaveNpcs === "function") LT.syncSlaveNpcs();
        if (typeof LT.maybeWorkplaceSex === "function") LT.maybeWorkplaceSex();
      },
      getContent: roomBody,
      getResponses: houseResponses,
    });
  }

  definePlaceNode("place.current", "Lilaya's Home");

  var housePlaces = [
    "LILAYA_HOME_CORRIDOR",
    "LILAYA_HOME_ROOM_WINDOW_GROUND_FLOOR",
    "LILAYA_HOME_ROOM_GARDEN_GROUND_FLOOR",
    "LILAYA_HOME_ROOM_WINDOW_FIRST_FLOOR",
    "LILAYA_HOME_ROOM_GARDEN_FIRST_FLOOR",
    "LILAYA_HOME_BIRTHING_ROOM",
    "LILAYA_HOME_KITCHEN",
    "LILAYA_HOME_LIBRARY",
    "LILAYA_HOME_STAIR_UP",
    "LILAYA_HOME_STAIR_UP_SECONDARY",
    "LILAYA_HOME_ENTRANCE_HALL",
    "LILAYA_HOME_LAB",
    "LILAYA_HOME_GARDEN",
    "LILAYA_HOME_FOUNTAIN",
    "LILAYA_HOME_ROOM_LILAYA",
    "LILAYA_HOME_ROOM_ROSE",
    "LILAYA_HOME_ROOM_PLAYER",
    "LILAYA_HOME_STAIR_DOWN",
    "LILAYA_HOME_STAIR_DOWN_SECONDARY",
  ];
  for (var i = 0; i < housePlaces.length; i++) definePlaceNode("place." + housePlaces[i], housePlaces[i]);

  LT.defineNode({
    id: "lilaya.room-stub",
    ui: "dialogue",
    title: "Your Room",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    tabs: ["Actions", "Fast travel"],
    getContent: roomBody,
    getResponses: houseResponses,
    applyPreParsingEffects: function () {
      if (!window.grid || !grid.gridName) {
        LT.enterWorld("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_ROOM_PLAYER");
      }
    },
  });
})();
