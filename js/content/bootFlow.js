(function () {
  var Colour = LT.Colour;

  var DISCLAIMER =
    '<h6 style="text-align:center;color:' +
    Colour.GENERIC_ARCANE +
    ';">You must read and agree to the following in order to play this game!</h6>' +
    "<p>This game is a <b>fictional</b> text-based erotic RPG. All content contained within this game forms part of a fictional universe that is not related to real-life places, people or events.<br/><br/>" +
    "All of the characters that appear in this story are fictional entities who have given their consent to appear and act in this story. " +
    "If you find yourself concerned for the characters in the story then please be reassured that they are all consenting adults who are speaking lines from a script. " +
    "None of the characters portrayed within this game were or are being harmed in any way during the construction or execution of this game. " +
    "Every character in the game is at least 18 years of age (or is magically the legal age needed to appear in erotic literature in whatever country you are playing this). " +
    "No character in this game is blood-related to any other; once again, they are simply speaking lines from a script.<br/><br/>" +
    "By agreeing to this disclaimer and playing this game you agree to be exposed to graphic sexual and adult content that is presented as part of the game's fictional universe. " +
    "Such content consists of, but is not limited to; graphic depictions of sex, inter-species sex (with fantasy creatures), sexual transformation, " +
    "rape fantasy/implied lack of consent, mild physical violence, sexual violence, and drug use.<br/>" +
    "Extreme fetish content such as gore/extreme violence, scat, and under/questionable age, is <i>not</i> a part of this game.<br/><br/>" +
    "By agreeing to this disclaimer and playing this game you also agree that you are <b>at least 18 years of age</b>, " +
    "or at least the legal age for you to purchase and view pornographic material in your country if that age is over 18.<br/><br/>" +
    "As a final note, the creators of this game wish to stress that the content presented within is entirely fictional and does not reflect any of their personal views or opinions. " +
    "This game has been made in the spirit of creating a piece of artistic interactive literature, and it is imperative that you maintain a clear distinction between reality and the fictional events depicted in this game.</p>";

  LT.defineNode({
    id: "boot.disclaimer",
    ui: "disclaimer",
    title: "Disclaimer",
    chrome: { left: false, right: false },
    getContent: function () {
      return DISCLAIMER;
    },
    getResponses: function () {
      return [
        null,
        new LT.Response(
          "Agree",
          "You agree that you are the legal age to view pornographic material, and consent to being exposed to graphic content.",
          "boot.patch-notes",
        ),
      ];
    },
  });

  LT.defineNode({
    id: "boot.patch-notes",
    ui: "patch-notes",
    title: function () {
      return (
        "Community Edition " +
        (LT.VERSION || "0.38.0") +
        ' | source ' +
        (LT.SOURCE_VERSION || "0.4.10") +
        ' | <b style="color:' +
        Colour.BASE_YELLOW_LIGHT +
        ';">Alpha</b>'
      );
    },
    chrome: { left: false, right: false },
    getContent: function () {
      return (
        '<div class="inner-text-content">' +
        '<h5 class="special-text" style="text-align:center;">Lilith\'s Throne — HTML rebuild</h5>' +
        "<p>This is a browser rebuild of Innoxia's <b>Lilith's Throne</b> " +
        (LT.SOURCE_VERSION || "0.4.10") +
        ". The original game is a Java / JavaFX RPG; this project reimplements the engine in HTML, CSS, and JavaScript.</p>" +
        "<p>This Community Edition build is <b>" +
        (LT.VERSION || "0.38.0") +
        "</b>. Playable through main quest 1-G, with combat, sex, shops, slavery, enchanting, transformation, and pregnancy. It is not the finished 0.4.10 game.</p>" +
        '<p style="text-align:center;color:' +
        Colour.GENERIC_ARCANE +
        ';"><i>Created by Innoxia · HTML rebuild in progress</i></p></div>'
      );
    },
    getResponses: function () {
      return [null, new LT.Response("Start", "Proceed to the main menu.", "boot.menu")];
    },
  });

  LT.defineNode({
    id: "boot.menu",
    ui: "main-menu",
    title: "",
    chrome: { left: false, right: false },
    getContent: function () {
      return (
        '<h1 class="special-text" style="font-size:48px;line-height:52px;text-align:center;">Lilith\'s Throne</h1>' +
        '<h5 class="special-text" style="text-align:center;">Created by Innoxia</h5><br/>' +
        "<p>This game is a text-based erotic RPG, and contains a lot of graphic sexual content. You must agree to the game's disclaimer before playing this game!</p>" +
        "<p>This HTML rebuild is not an official release. Use Innoxia's blog or GitHub for the latest official Java version.</p>" +
        '<p style="text-align:center"><b>Community Edition ' +
        (LT.VERSION || "0.38.0") +
        "</b></p>"
      );
    },
    getResponses: function () {
      var list = [null];
      if (LT.game.started && LT.game.player) {
        list.push(
          new LT.Response("Resume", "Return to the game.", LT.game.returnNode || "place.generic", function () {
            if (!LT.game.returnNode && LT.game.player && LT.game.player.location && typeof LT.enterWorld === "function") {
              var loc = LT.game.player.location;
              LT.enterWorld(loc.world, loc.place, loc.x != null ? { x: loc.x, y: loc.y } : null);
            }
            LT.game.returnNode = null;
          }),
        );
      }
      list.push(
        new LT.Response("New Game", "Start a new game.", "creation.appearance", function () {
          LT.startNewGame();
        }),
        new LT.Response("Save/Load", "Open the save/load window.", null, function () {
          LT.openSaveLoad();
        }),
        new LT.Response("Options", "Open the options menu.", "boot.options"),
        new LT.Response("Mod menu", "Open the work-in-progress mod configuration menu.", "boot.mod-menu"),
        new LT.Response("Disclaimer", "View the game's disclaimer.", "boot.disclaimer"),
      );
      return list;
    },
  });

  LT.defineNode({
    id: "boot.options",
    ui: "options",
    title: "Options",
    chrome: { left: false, right: false },
    getContent: function () {
      return (
        '<div class="container-full-width">' +
        "<p>Options will grow as the rebuild does. Font size and light/dark theme land after the slice's story path is playable.</p>" +
        "<p>Hotkeys already match the original response grid: <b>1–5</b>, <b>Q W E R T</b>, <b>A S D F G</b>, and <b>0</b> for Back.</p></div>"
      );
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the main menu.", "boot.menu")];
    },
  });

  LT.defineNode({
    id: "boot.mod-menu",
    ui: "options",
    title: "Mod menu",
    chrome: { left: false, right: false },
    getContent: function () {
      return (
        "<p><b>Work in progress.</b> This rebuild does not load gameplay mods yet.</p>" +
        "<p>The official Java game has a mod folder under <code>res/mods</code>. When this menu is finished, installed mods will be listed here so you can enable or disable them without editing files by hand.</p>" +
        "<p>For now, nothing here changes the game.</p>"
      );
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the main menu.", "boot.menu")];
    },
  });

})();
