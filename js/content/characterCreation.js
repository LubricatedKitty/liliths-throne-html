(function () {
  var Colour = LT.Colour;

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pill(active, id, label, colour) {
    if (active) {
      return '<div class="cosmetics-button active"><span style="color:' + colour + ';">' + label + "</span></div>";
    }
    return (
      '<div data-act="' +
      id +
      '" class="cosmetics-button"><span style="color:' +
      colour +
      ';opacity:0.55;">' +
      label +
      "</span></div>"
    );
  }

  function femPills(female, fem) {
    var opts = female
      ? [LT.Femininity.ANDROGYNOUS, LT.Femininity.FEMININE, LT.Femininity.FEMININE_STRONG]
      : [LT.Femininity.ANDROGYNOUS, LT.Femininity.MASCULINE, LT.Femininity.MASCULINE_STRONG];
    var html = "";
    for (var i = 0; i < opts.length; i++) {
      html += pill(fem.id === opts[i].id, "CHOOSE_FEM_" + opts[i].id, opts[i].name, opts[i].colour);
    }
    return html;
  }

  function stepper(title, id, value, decDisabled, incDisabled) {
    return (
      '<div class="date-col"><p style="width:100%;margin:0;padding:0;text-align:center;"><b>' +
      title +
      "</b></p><div class=\"stepper\">" +
      '<div data-act="' +
      id +
      '_DECREASE_LARGE" class="normal-button' +
      (decDisabled ? " disabled" : "") +
      '">−−</div>' +
      '<div data-act="' +
      id +
      '_DECREASE" class="normal-button' +
      (decDisabled ? " disabled" : "") +
      '">−</div>' +
      '<span class="stepper-value">' +
      value +
      "</span>" +
      '<div data-act="' +
      id +
      '_INCREASE" class="normal-button' +
      (incDisabled ? " disabled" : "") +
      '">+</div>' +
      '<div data-act="' +
      id +
      '_INCREASE_LARGE" class="normal-button' +
      (incDisabled ? " disabled" : "") +
      '">++</div></div></div>'
    );
  }

  function birthdayBlock(p) {
    var age = p.getAgeValue();
    var b = p.birthday;
    return (
      '<div class="container-full-width"><p style="text-align:center;margin:0;padding:0;"><b>Birthday</b></p>' +
      '<p style="text-align:center;">You were born on the ' +
      ordinal(b.getDate()) +
      " of " +
      LT.MONTHS[b.getMonth()] +
      " " +
      b.getFullYear() +
      ", making you " +
      age +
      ' years old.</p><div class="date-row">' +
      stepper("Day", "BIRTH_DAY", String(b.getDate()), false, false) +
      stepper("Month", "BIRTH_MONTH", LT.MONTHS[b.getMonth()], false, false) +
      stepper("Age", "AGE", String(age), age <= 18, age >= 50) +
      "</div></div>"
    );
  }

  function appearanceHtml() {
    var p = LT.game.player;
    if (!p) return "<p>No player.</p>";
    var female = p.gender === LT.Gender.FEMALE;
    var fem = p.getFemininity();
    var month = LT.game.startingMonth != null ? LT.game.startingMonth : 9;
    var months = "";
    for (var i = 0; i < LT.MONTHS.length; i++) {
      months += pill(i === month, "START_MONTH_" + i, LT.MONTHS[i], Colour.GENERIC_MINOR_GOOD);
    }
    var orients = "";
    var oKeys = ["ANDROPHILIC", "AMBIPHILIC", "GYNEPHILIC"];
    for (var j = 0; j < oKeys.length; j++) {
      var o = LT.Orientation[oKeys[j]];
      orients += pill(p.orientation === o, "SEXUAL_ORIENTATION_" + o.id, cap(o.name), o.colour);
    }
    var traits = "";
    for (var t = 0; t < LT.PERSONALITY.length; t++) {
      var trait = LT.PERSONALITY[t];
      traits += pill(p.hasPersonalityTrait(trait.id), "PERSONALITY_TRAIT_" + trait.id, cap(trait.name), trait.colour);
    }
    return (
      "<p>By the time the taxi finally pulls up to the British Museum, you're already almost five minutes late. The whole reason you're visiting London is to attend your aunt Lily's opening evening for her new exhibition, and as you hurriedly pay the driver his fare and step out of the car, you hope that she hasn't started her speech yet.</p>" +
      "<p>The street lights flicker into life as you rush over to the entrance, illuminating your surroundings with a dull orange glow. It only takes a moment before you're standing at the museum's front doors, where, much to your dismay, you see that a small queue has formed. Having no choice but to step in line and wait your turn, you briefly glance over at the large glass windows of the building's modern facade to see your blurry reflection in the glass...</p>" +
      '<br/><div class="cosmetics-inner-container full"><p style="text-align:center;margin:0;padding:0;"><b>Start Date</b></p>' +
      '<p style="text-align:center;">Select the month in which the game starts.</p>' +
      months +
      '</div><div class="cosmetics-container" style="background:transparent;">' +
      '<div class="container-half-width" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>Gender</b></p>' +
      '<p style="text-align:center;">Your gender is used to determine what genitals you start the game with.</p>' +
      pill(!female, "CHOOSE_GENDER_MALE", "Male", Colour.MASCULINE) +
      pill(female, "CHOOSE_GENDER_FEMALE", "Female", Colour.FEMININE) +
      '</div><div class="container-half-width" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>Femininity</b></p>' +
      '<p style="text-align:center;">Femininity is a measure of how masculine or feminine your face and body are.</p>' +
      femPills(female, fem) +
      '</div><div class="container-full-width" style="text-align:center;">You will be referred to as <span style="color:' +
      p.getGenderColour() +
      ';">' +
      LT.article(p.gender.name) +
      " " +
      p.gender.name +
      "</span>.<br/><i>You can change all gender names in the options menu.</i></div>" +
      birthdayBlock(p) +
      '<div class="container-full-width" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>Sexual Orientation</b></p>' +
      '<p style="text-align:center;">Sexual orientation is determined by your attraction towards femininity or masculinity.</p>' +
      orients +
      '</div><div class="container-full-width" style="text-align:center;"><p style="text-align:center;margin:0;padding:0;"><b>Personality</b></p>' +
      '<p style="text-align:center;">Your personality will have a minor influence in some situations. It will not lock out any options during the game, and is more for roleplaying purposes.</p>' +
      traits +
      "</div></div>"
    );
  }

  function nameHtml() {
    var p = LT.game.player;
    var sir = p.isFeminine() ? "Miss" : "Sir";
    var bag = p.isFeminine() ? "purse" : "pocket";
    return (
      "<p><span class=\"speech\">\"" +
      sir +
      ',"</span> the doorman calls out to you, evidently having finished with the other people in the queue, <span class="speech">"do you have an invitation?"</span></p>' +
      '<p>You turn away from the glass and step forwards, smiling. <span class="speech">"Yes, I have it right here... erm... hold on..."</span></p>' +
      "<p>Reaching into your " +
      bag +
      ', you feel your heart start to race as you discover that the invitation isn\'t in there. <span class="speech">"No, no, no! I must have left it in the taxi!"</span></p>' +
      "<p>The doorman raises an eyebrow. After a moment he takes pity on you and asks for your name so he can check the guest list.</p>" +
      '<div class="container-full-width" style="text-align:center;"><p style="margin:0;padding:0;"><b>Name</b></p><div class="name-grid">' +
      "<label>Masculine<br><input id=\"name-masc\" value=\"" +
      escapeHtml(p.names.masculine) +
      '"></label>' +
      "<label>Androgynous<br><input id=\"name-andro\" value=\"" +
      escapeHtml(p.names.androgynous) +
      '"></label>' +
      "<label>Feminine<br><input id=\"name-fem\" value=\"" +
      escapeHtml(p.names.feminine) +
      '"></label></div>' +
      '<p style="margin:8px 0 0;"><b>Surname</b></p>' +
      '<input id="name-surname" value="' +
      escapeHtml(p.surname) +
      '" style="min-width:220px;">' +
      '<p class="muted">The name used in play is the one that matches your femininity.</p></div>'
    );
  }

  function stepDate(p, field, act) {
    var large = /_LARGE$/.test(act);
    var dir = act.indexOf("DECREASE") >= 0 ? -1 : 1;
    var amount = large ? (field === "age" ? 5 : field === "month" ? 3 : 7) : 1;
    var d = new Date(p.birthday.getTime());
    if (field === "day") d.setDate(d.getDate() + dir * amount);
    else if (field === "month") d.setMonth(d.getMonth() + dir * amount);
    else p.setAge(p.getAgeValue() + dir * amount);
    if (field !== "age") p.birthday = d;
    LT.clampPlayerAge(p);
  }

  LT.clampPlayerAge = function (p) {
    if (!p || !p.getAgeValue) return;
    var age = p.getAgeValue();
    if (age < 18) p.setAge(18);
    if (age > 50) p.setAge(50);
  };

  function handleAct(act) {
    var p = LT.game.player;
    if (act === "CHOOSE_GENDER_MALE") p.setGender(LT.Gender.MALE);
    else if (act === "CHOOSE_GENDER_FEMALE") p.setGender(LT.Gender.FEMALE);
    else if (act.indexOf("CHOOSE_FEM_") === 0) p.setFemininity(LT.Femininity[act.slice("CHOOSE_FEM_".length)]);
    else if (act.indexOf("SEXUAL_ORIENTATION_") === 0) p.orientation = LT.Orientation[act.slice("SEXUAL_ORIENTATION_".length)];
    else if (act.indexOf("PERSONALITY_TRAIT_") === 0) p.togglePersonality(act.slice("PERSONALITY_TRAIT_".length));
    else if (act.indexOf("START_MONTH_") === 0) {
      LT.game.startingMonth = Number(act.slice("START_MONTH_".length));
      LT.clampPlayerAge(p);
    }
    else if (act.indexOf("BIRTH_DAY_") === 0) stepDate(p, "day", act);
    else if (act.indexOf("BIRTH_MONTH_") === 0) stepDate(p, "month", act);
    else if (act.indexOf("AGE_") === 0) stepDate(p, "age", act);
    else return;
    LT.game.setContent(LT.game.currentNode);
  }

  LT.startNewGame = function () {
    LT.game.player = LT.createNewPlayer();
    LT.game.started = false;
    LT.game.renderAttributes = true;
    LT.game.renderMap = false;
    LT.game.flags = {};
    LT.game.secondsPassed = 20 * 3600 + 34 * 60;
    LT.game.startingYear = 2019;
    LT.game.startingMonth = 9;
    LT.game.startingDay = new Date().getDate();
    if (typeof LT.ensureWeather === "function") LT.ensureWeather();
    if (LT.game.player) {
      LT.game.player.wardrobeReady = false;
      LT.game.player.occupation = null;
    }
  };

  LT.bindCreationClicks = function () {
    document.getElementById("ui-stage").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn || btn.classList.contains("disabled")) return;
      if (!LT.game.player) return;
      handleAct(btn.getAttribute("data-act"));
    });
    document.getElementById("ui-stage").addEventListener("input", function (e) {
      if (!LT.game.player) return;
      var id = e.target.id;
      if (id === "name-masc") LT.game.player.names.masculine = e.target.value;
      if (id === "name-andro") LT.game.player.names.androgynous = e.target.value;
      if (id === "name-fem") LT.game.player.names.feminine = e.target.value;
      if (id === "name-surname") LT.game.player.surname = e.target.value;
    });
  };

  LT.defineNode({
    id: "creation.appearance",
    ui: "creation-appearance",
    title: "A Night Out",
    chrome: { left: true, right: false },
    getContent: appearanceHtml,
    getResponses: function () {
      return [
        new LT.Response("Back", "Return to the main menu.", "boot.menu"),
        new LT.Response("Continue", "Wait your turn, and hope that the event hasn't started yet.", "creation.name").withTime(120),
      ];
    },
  });

  LT.defineNode({
    id: "creation.name",
    ui: "creation-name",
    title: "A Night Out",
    chrome: { left: true, right: false },
    applyPreParsingEffects: function () {
      var p = LT.game.player;
      if (!p || p._nameRolled) return;
      p._nameRolled = true;
      var names = p.names || {};
      var unknown = !names.masculine || names.masculine === "Unknown" || !names.feminine || names.feminine === "Unknown";
      if (!unknown) return;
      if (typeof LT.randomHumanNameTriplet === "function") {
        var trip = LT.randomHumanNameTriplet();
        p.setName(trip[0], trip[1], trip[2]);
      }
    },
    getContent: nameHtml,
    getResponses: function () {
      return [
        new LT.Response("Back", "Look back at your reflection and change your appearance.", "creation.appearance"),
        new LT.Response("Continue", "Give the doorman your name.", "creation.advanced"),
        new LT.Response("Random", "Generate a random name based on your gender.", "creation.name", function () {
          var trip = typeof LT.randomHumanNameTriplet === "function" ? LT.randomHumanNameTriplet() : ["Alex", "Alex", "Alex"];
          LT.game.player.setName(trip[0], trip[1], trip[2]);
        }),
        new LT.Response("Random Surname", "Generate a random surname.", "creation.name", function () {
          LT.game.player.surname = typeof LT.randomHumanSurname === "function" ? LT.randomHumanSurname() : "Smith";
        }),
      ];
    },
  });

})();
