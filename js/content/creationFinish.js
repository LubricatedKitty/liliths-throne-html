(function () {
  function femaleNpc() {
    var p = LT.game.player;
    return p.orientation.id === "GYNEPHILIC" || (p.orientation.id === "AMBIPHILIC" && p.hasPenis());
  }

  function npcName() {
    return "Alex";
  }

  function they() {
    return femaleNpc() ? "she" : "he";
  }

  function their() {
    return femaleNpc() ? "her" : "his";
  }

  function them() {
    return femaleNpc() ? "her" : "him";
  }

  function slotRow(player, slot) {
    var item = player.equipped[slot.id];
    var inner = item
      ? '<div class="inv-item" data-unequip="' +
        slot.id +
        '" style="border-color:' +
        item.colour +
        ';"><b>' +
        item.name +
        '</b><br><span class="muted">' +
        item.colourName +
        "</span></div>"
      : '<div class="inv-item empty-slot"><span class="muted">empty</span></div>';
    return '<div class="inv-slot"><div class="inv-slot-label">' + slot.label + "</div>" + inner + "</div>";
  }

  function wardrobeHtml() {
    var p = LT.game.player;
    if (!p.wardrobeReady || p.wardrobeFem !== p.getFemininity().id) {
      LT.dressPlayer(p);
      p.wardrobeReady = true;
      p.wardrobeFem = p.getFemininity().id;
    }
    var hot = p.isFeminine() ? "hot" : "handsome";
    var equipped = "";
    for (var i = 0; i < LT.SLOTS.length; i++) equipped += slotRow(p, LT.SLOTS[i]);
    var pile = "";
    for (var j = 0; j < p.wardrobe.length; j++) {
      var it = p.wardrobe[j];
      pile +=
        '<div class="inv-item" data-equip="' +
        it.uid +
        '" style="border-color:' +
        it.colour +
        ';"><b>' +
        it.name +
        '</b><br><span class="muted">' +
        it.colourName +
        " · " +
        it.slot +
        "</span></div>";
    }
    if (!pile) pile = '<p class="muted">Nothing left in the pile.</p>';
    var ready = LT.creationClothedEnough(p);
    return (
      '<div class="wardrobe-banner" style="text-align:center;"><i>Choose what you decided to wear to the museum.</i><br/>' +
      "<i>Click a wardrobe item to put it on. Click a worn item to take it off.</i><br/>" +
      "<i>You'll need to be wearing some kind of footwear, as well as clothing that conceals your genitals and chest, before being able to proceed.</i>" +
      (ready ? "" : '<br/><span style="color:' + LT.Colour.GENERIC_BAD + ';">You are not decent enough to continue yet.</span>') +
      '</div><div class="inv-wrap"><div class="inv-col"><h6>Worn</h6><div class="inv-grid">' +
      equipped +
      '</div></div><div class="inv-col"><h6>Wardrobe</h6><div class="inv-grid pile">' +
      pile +
      "</div></div></div>" +
      "<p>There doesn't seem to be any sign of activity on the main stage, so, afforded a few more minutes, you decide to smarten up your clothes a little. After all, this is a big evening for Lily, and you want her to see that you've put some effort into your appearance.</p>" +
      "<p>Turning this way and that to get a better look at yourself in the mirror, you begin to notice just how " +
      hot +
      " you're looking tonight...</p>" +
      "<p><i>Why am I feeling so horny all of a sudden?</i></p>"
    );
  }

  function backgroundHtml() {
    var p = LT.game.player;
    var aroused = p.hasPenis()
      ? "you're struggling to keep yourself from getting an erection."
      : "you can feel your pussy getting wet from arousal.";
    var title = p.isFeminine() ? "Ms. ...?" : "Mr. ...?";
    var body;
    if (!femaleNpc()) {
      body =
        ' <span class="speech">"Taking a break from the crowds as well?"</span></p><p>Turning around, you see a tall, handsome-looking man, who must be only a couple of years older than you, giving you the most charming smile you\'ve ever seen. Before you know what you\'re doing, your eyes are travelling up and down every inch of his manly, muscular body, and you only just manage to stop yourself from letting out a desperate little whine.</p>' +
        "<p><i>Focus, " +
        p.getName() +
        ", focus!</i> you think, trying to act as casual as possible as you smile back at the stranger before you.</p>" +
        "<p><span class=\"speech\">\"Actually,\"</span> you say, <span class=\"speech\">\"I've only just arrived. I thought I was going to be late, but it looks like nothing's started yet.\"</span></p>" +
        "<p><span class=\"speech\">\"Ah, you must have just missed the announcement,\"</span> he replies, <span class=\"speech\">\"the opening speech is being delayed by half an hour. I tried hanging around in that crowd back there, but I'm no historian, and most of the conversation is pretty dry...\"</span></p>" +
        "<p><span class=\"speech\">\"Haha,\"</span> you laugh, desperately trying not to imagine how he looks naked, <span class=\"speech\">\"I know <i>exactly</i> what you mean. My aunt is the lady giving the opening speech, and every time I meet her friends from the museum, I can never follow their conversations. Well, apart from Arthur that is. He's closer to our age, and is really easy-going and fun to talk to.\"</span></p>" +
        "<p><span class=\"speech\">\"Hah! You know Arthur? I'm here by his invitation. He and I go way back,\"</span> the man cheerily replies, his smile causing your heart to race. <span class=\"speech\">\"I'm " +
        npcName() +
        " by the way, pleased to meet you " +
        title +
        '"</span></p>' +
        "<p><span class=\"speech\">\"Likewise,\"</span> you respond, shaking his offered hand while trying not to think of how powerful and dominant his grip is. <span class=\"speech\">\"I'm " +
        p.getName() +
        '."</span></p>' +
        "<p>You and " +
        npcName() +
        " continue talking with one another as you wait for the presentation to start. Before long, the subject shifts to work, and you find out that he's an airline pilot, based out of the airport on the city's outskirts. Conversation then moves on to what it is you do, and you end up talking about that for a little while...</p>";
    } else {
      body =
        ' <span class="speech">"Taking a break from the crowds as well?"</span></p><p>Turning around, you see a beautiful woman, who looks to be about the same age as you, giving you the most stunning smile you\'ve ever seen. Before you know what you\'re doing, your eyes are travelling up and down every inch of her curvy, womanly body, and you only just manage to stop yourself from letting out a hungry groan.</p>' +
        "<p><i>Focus " +
        p.getName() +
        ", focus!</i> you think, trying to act as casual as possible as you smile back at the stranger before you.</p>" +
        "<p><span class=\"speech\">\"Actually,\"</span> you say, <span class=\"speech\">\"I've only just arrived. I thought I was going to be late, but it looks like nothing's started yet.\"</span></p>" +
        "<p><span class=\"speech\">\"Ah, you must have just missed the announcement,\"</span> she replies, <span class=\"speech\">\"the opening speech is being delayed by half an hour. I tried hanging around in that crowd back there, but I'm no historian, and most of the conversation is pretty dry...\"</span></p>" +
        "<p><span class=\"speech\">\"Haha,\"</span> you laugh, desperately trying not to imagine how she looks naked, <span class=\"speech\">\"I know <i>exactly</i> what you mean. My aunt is the lady giving the opening speech, and every time I meet her friends from the museum, I can never follow their conversations. Well, apart from Arthur that is. He's closer to our age, and is really easy-going and fun to talk to.\"</span></p>" +
        "<p><span class=\"speech\">\"Oh! You know Arthur? I'm here by his invitation, actually. He and I go way back,\"</span> the woman cheerily replies, her smile causing your heart to race. <span class=\"speech\">\"I'm " +
        npcName() +
        " by the way, pleased to meet you " +
        title +
        '"</span></p>' +
        "<p><span class=\"speech\">\"Likewise,\"</span> you respond, shaking her offered hand while trying not to think of how soft and delicate her skin is. <span class=\"speech\">\"I'm " +
        p.getName() +
        '."</span></p>' +
        "<p>You and " +
        npcName() +
        " continue talking with one another as you wait for the presentation to start. Before long, the subject shifts to work, and you find out that she's training to become a doctor, and is studying here at the city's university. Conversation then moves on to what it is you do, and you end up talking about that for a little while...</p>";
    }
    return (
      "<p>Satisfied with your appearance, you turn away from the mirror and begin to walk towards the main stage. With each step you take, you inexplicably find yourself getting more and more turned on, and by the time you've barely covered half the distance to the bustling crowd of visitors, " +
      aroused +
      "</p><p>Ducking behind a nearby pillar, you shake your head to try and dislodge the dirty thoughts that are starting to seep into your mind. As you lean back against the cold stone and take a deep breath, a voice suddenly interrupts your thoughts," +
      body
    );
  }

  function jobsHtml() {
    var p = LT.game.player;
    var jobs = LT.availableOccupations(p);
    var html =
      '<div class="container-full-width"><h6 style="text-align:center">Job Selection</h6><p style="text-align:center">Click on the job that you\'d like, and then choose Continue.</p></div>';
    for (var i = 0; i < jobs.length; i++) {
      var o = jobs[i];
      var sel = p.occupation && p.occupation.id === o.id;
      html +=
        '<div class="job-row' +
        (sel ? " selected" : "") +
        '" data-job="' +
        o.id +
        '"><div class="job-name" style="color:' +
        (sel ? LT.Colour.GENERIC_GOOD : o.colour) +
        ';">' +
        o.name.charAt(0).toUpperCase() +
        o.name.slice(1) +
        "</div><p>" +
        o.description +
        "</p></div>";
    }
    return html;
  }

  function sexHtml() {
    var p = LT.game.player;
    var job = p.occupation;
    var speech = job ? job.speech : "I work around the city.";
    var flush =
      "<p>As the two of you continue to talk, first about work, and then about more general subjects, you find yourself getting more and more turned on. What's more, you begin to notice that " +
      npcName() +
      "'s cheeks are starting to flush red, and " +
      they() +
      " keeps on glancing hungrily down at your body when " +
      they() +
      " thinks that you aren't looking.</p>" +
      "<p>As final evidence that " +
      they() +
      "'s getting just as turned on as you are, " +
      they() +
      " starts openly talking about " +
      their() +
      " sex life. To begin with, you're a little taken aback at " +
      their() +
      " openness, but the more " +
      they() +
      " talks, the more comfortable you find yourself with talking to this relative stranger about sex.</p>" +
      "<p>And so, after talking with " +
      npcName() +
      " for no longer than ten minutes, you're telling " +
      them() +
      " every little detail about your sexual experiences...</p>";
    function step(key, label) {
      return (
        '<div class="sex-row"><b>' +
        label +
        '</b> <div class="stepper"><div data-sex="' +
        key +
        '_DEC" class="normal-button">−</div><span class="stepper-value">' +
        p.sex[key] +
        '</span><div data-sex="' +
        key +
        '_INC" class="normal-button">+</div></div></div>'
      );
    }
    var virgins = "";
    if (p.hasPenis()) {
      virgins +=
        '<div class="sex-row"><b>Penile virginity</b> ' +
        '<span data-sex="penisVirgin" class="cosmetics-button' +
        (p.sex.penisVirgin ? " active" : "") +
        '">' +
        (p.sex.penisVirgin ? "Virgin" : "Not virgin") +
        "</span></div>";
    }
    if (p.hasVagina()) {
      virgins +=
        '<div class="sex-row"><b>Vaginal virginity</b> ' +
        '<span data-sex="vaginaVirgin" class="cosmetics-button' +
        (p.sex.vaginaVirgin ? " active" : "") +
        '">' +
        (p.sex.vaginaVirgin ? "Virgin" : "Not virgin") +
        "</span></div>";
    }
    recalcCorruption(p);
    return (
      "<p><span class=\"speech\">\"" +
      speech +
      '"</span></p>' +
      flush +
      '<div class="container-full-width" style="text-align:center;"><i>More sexual experience will result in gaining more corruption. (You can see your corruption in the character panel to the left.)</i></div>' +
      '<div class="container-full-width">' +
      virgins +
      step("vaginal", "Vaginal experience") +
      step("anal", "Anal experience") +
      step("oral", "Oral experience") +
      "<p style=\"text-align:center;\">Corruption: <b style=\"color:" +
      LT.Colour.ATTRIBUTE_CORRUPTION +
      ';">' +
      p.corruption +
      "</b></p></div>"
    );
  }

  function recalcCorruption(p) {
    var c = 0;
    c += p.sex.vaginal * 2;
    c += p.sex.anal * 2;
    c += p.sex.oral;
    if (p.hasPenis() && !p.sex.penisVirgin) c += 5;
    if (p.hasVagina() && !p.sex.vaginaVirgin) c += 5;
    p.corruption = Math.min(100, c);
  }

  function finalHtml() {
    var p = LT.game.player;
    var job = p.occupation ? p.occupation.name : "unemployed";
    return (
      '<div class="container-full-width" style="text-align:center;"><i>Once you\'re happy with your appearance, press the Start Game button to begin!<br/>' +
      '<span style="color:' +
      LT.Colour.GENERIC_GOOD +
      ';">This is the end of character creation, so only proceed once you\'re happy with your choices!</span></i></div><br/>' +
      '<div class="container-full-width"><h5 style="text-align:center;">Final Appearance</h5>' +
      "<p style=\"text-align:center;\">" +
      p.getName() +
      (p.surname ? " " + p.surname : "") +
      " · " +
      job +
      "</p>" +
      LT.describeBody(p) +
      clothesSummary(p) +
      "</div>"
    );
  }

  function clothesSummary(p) {
    var parts = [];
    var slots = Object.keys(p.equipped);
    for (var i = 0; i < slots.length; i++) {
      var it = p.equipped[slots[i]];
      if (it) parts.push(it.colourName + " " + it.name);
    }
    if (!parts.length) return "";
    return "<p>You are wearing " + parts.join(", ") + ".</p>";
  }

  LT.defineNode({
    id: "creation.wardrobe",
    ui: "creation-wardrobe",
    title: "In the Museum",
    chrome: { left: true, right: false },
    getContent: wardrobeHtml,
    getResponses: function () {
      var ready = LT.game.player && LT.creationClothedEnough(LT.game.player);
      var cont = new LT.Response(
        "Continue",
        "Satisfied with your appearance, you walk towards the stage.",
        "creation.background",
      ).withTime(150);
      if (!ready) cont.disable("You need footwear, and clothing that conceals your genitals and chest.");
      return [new LT.Response("Back", "Return to the appearance menu.", "creation.advanced"), cont];
    },
  });

  LT.defineNode({
    id: "creation.background",
    ui: "creation-background",
    title: "In the Museum",
    chrome: { left: true, right: false },
    getContent: backgroundHtml,
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to clothing selection.", "creation.wardrobe").withTime(-150),
        new LT.Response("Select Job", "Proceed to the job selection screen.", "creation.jobs").withTime(150),
      ];
    },
  });

  LT.defineNode({
    id: "creation.jobs",
    ui: "creation-jobs",
    title: "In the Museum",
    chrome: { left: true, right: false },
    getContent: jobsHtml,
    getResponses: function () {
      var has = LT.game.player && LT.game.player.occupation;
      var cont = new LT.Response(
        "Continue",
        "Tell " + npcName() + " what it is you do for a living.",
        "creation.sex",
      ).withTime(150);
      if (!has) cont.disable("You need to select a job before continuing!");
      return [new LT.Response("Back", "Return to the previous screen.", "creation.background").withTime(-150), cont];
    },
  });

  LT.defineNode({
    id: "creation.sex",
    ui: "creation-sex-experience",
    title: "Start",
    chrome: { left: true, right: false },
    getContent: sexHtml,
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to background selection.", "creation.jobs").withTime(-150),
        new LT.Response(
          "Continue",
          "Once you're happy with your sexual experience, proceed to the final part of the character creation.",
          "creation.confirm",
        ).withTime(150),
      ];
    },
  });

  LT.defineNode({
    id: "creation.confirm",
    ui: "creation-confirm",
    title: "Start",
    chrome: { left: true, right: false },
    getContent: finalHtml,
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to sexual experience.", "creation.sex").withTime(-150),
        new LT.Response("Start Game", "Use this character and start the game at the very beginning, trying to find Arthur in the museum.", "prologue.intro", function () {
          LT.game.started = true;
        }),
        new LT.Response(
          "Skip prologue",
          "Start the game and skip the prologue. Not recommended for a first play.",
          "place.LILAYA_HOME_ROOM_PLAYER",
          function () {
            LT.game.started = true;
            if (typeof LT.startArrivalStorm === "function") LT.startArrivalStorm();
            LT.game.player.money = (LT.game.player.money || 0) + (LT.STARTING_MONEY || 5000);
            LT.game.flags.quest = "MAIN_1_A_LILAYAS_TESTS";
            if (typeof LT.incrementExperience === "function") LT.incrementExperience(5);
            if (typeof LT.refreshVitals === "function") LT.refreshVitals(LT.game.player, true);
            LT.game.renderAttributes = true;
            LT.game.renderMap = true;
            if (typeof LT.enterWorld === "function") {
              LT.enterWorld("LILAYAS_HOUSE_FIRST_FLOOR", "LILAYA_HOME_ROOM_PLAYER");
            }
            if (typeof LT.markCharacterEncountered === "function") {
              LT.markCharacterEncountered("lilaya");
              LT.markCharacterEncountered("rose");
            }
          },
        ),
      ];
    },
  });

  document.addEventListener("click", function (e) {
    var node = LT.game.currentNode;
    if (!node) return;
    var p = LT.game.player;
    if (!p) return;
    var jobEl = e.target.closest("[data-job]");
    if (jobEl && node.id === "creation.jobs") {
      p.occupation = LT.findOccupation(jobEl.getAttribute("data-job"));
      LT.game.setContent(node);
      return;
    }
    var unequip = e.target.closest("[data-unequip]");
    if (unequip && node.id === "creation.wardrobe") {
      LT.unequipToWardrobe(p, unequip.getAttribute("data-unequip"));
      LT.game.setContent(node);
      return;
    }
    var equip = e.target.closest("[data-equip]");
    if (equip && node.id === "creation.wardrobe") {
      LT.equipFromWardrobe(p, equip.getAttribute("data-equip"));
      LT.game.setContent(node);
      return;
    }
    var sex = e.target.closest("[data-sex]");
    if (sex && node.id === "creation.sex") {
      var act = sex.getAttribute("data-sex");
      if (act === "penisVirgin" || act === "vaginaVirgin") p.sex[act] = !p.sex[act];
      else if (act.slice(-4) === "_INC") {
        var k = act.slice(0, -4);
        p.sex[k] = Math.min(50, (p.sex[k] || 0) + 1);
        if (k === "vaginal" && p.hasVagina()) p.sex.vaginaVirgin = false;
      } else if (act.slice(-4) === "_DEC") {
        var k2 = act.slice(0, -4);
        p.sex[k2] = Math.max(0, (p.sex[k2] || 0) - 1);
      }
      recalcCorruption(p);
      LT.game.setContent(node);
    }
  });
})();
