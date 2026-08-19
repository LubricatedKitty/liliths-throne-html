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
        new LT.Response("Mod Menu", "Configure installed mods.", null, function () {
          if (typeof LT.openModMenu === "function") LT.openModMenu("boot.menu");
          else LT.game.setContent("boot.mod-menu");
        }),
        new LT.Response("Mod List", "See which KittyLoader mods are enabled, in apply order.", null, function () {
          if (typeof LT.refreshAppliedMods === "function") {
            LT.refreshAppliedMods(function () {
              LT.game.setContent("boot.mods");
            });
          } else {
            LT.game.setContent("boot.mods");
          }
        }),
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

  LT.modsFromLoaderState = function (data) {
    var empty = [];
    if (!data || !data.profiles || !data.profiles.length) return empty;
    var wanted = data.active_profile;
    var profile = data.profiles[0];
    var i;
    for (i = 0; i < data.profiles.length; i++) {
      if (data.profiles[i] && data.profiles[i].name === wanted) {
        profile = data.profiles[i];
        break;
      }
    }
    if (!profile) return empty;
    var enabled = profile.enabled || [];
    var order = profile.order || [];
    var on = {};
    for (i = 0; i < enabled.length; i++) on[enabled[i]] = true;
    var list = [];
    var seen = {};
    function add(file) {
      if (!file || !on[file] || seen[file]) return;
      seen[file] = true;
      list.push({
        file: file,
        name: String(file).replace(/\.mod$/i, ""),
        author: "",
        version: "",
        rel: file,
      });
    }
    for (i = 0; i < order.length; i++) add(order[i]);
    for (i = 0; i < enabled.length; i++) add(enabled[i]);
    return list;
  };

  LT.refreshAppliedMods = function (done) {
    function finish() {
      if (typeof done === "function") done();
    }
    function useJson(data) {
      LT.APPLIED_MODS = LT.modsFromLoaderState(data);
      LT.APPLIED_MODS_SOURCE = "kittyloader.json";
      finish();
    }
    function useJs() {
      var script = document.createElement("script");
      script.src = "mods/appliedMods.js";
      script.onload = function () {
        if (!Array.isArray(LT.APPLIED_MODS)) LT.APPLIED_MODS = [];
        LT.APPLIED_MODS_SOURCE = "appliedMods.js";
        finish();
      };
      script.onerror = function () {
        if (!Array.isArray(LT.APPLIED_MODS)) LT.APPLIED_MODS = [];
        finish();
      };
      document.head.appendChild(script);
    }
    try {
      if (typeof fetch !== "function") {
        useJs();
        return;
      }
      fetch("mods/kittyloader.json", { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) throw new Error("no kittyloader.json");
          return res.json();
        })
        .then(useJson)
        .catch(useJs);
    } catch (e) {
      useJs();
    }
  };

  LT.defineNode({
    id: "boot.mods",
    ui: "options",
    title: "Mod List",
    chrome: { left: false, right: false },
    getContent: function () {
      var mods = Array.isArray(LT.APPLIED_MODS) ? LT.APPLIED_MODS : [];
      var source = LT.APPLIED_MODS_SOURCE;
      var html =
        "<p>Mods enabled in KittyLoader, in apply order. Enable or disable them in KittyLoader, then Apply and reload.</p>";
      if (source === "kittyloader.json") {
        html += "<p class='muted'>Read from mods/kittyloader.json.</p>";
      } else if (source === "appliedMods.js") {
        html += "<p class='muted'>Could not read kittyloader.json (common when opening index.html as a file). Showing mods/appliedMods.js instead.</p>";
      }
      if (!mods.length) {
        return html + "<p>No mods are enabled.</p>";
      }
      html += "<ol>";
      var i;
      for (i = 0; i < mods.length; i++) {
        var m = mods[i] || {};
        var title = m.name || m.file || "Unnamed mod";
        var bits = [];
        if (m.file && m.file !== title) bits.push(m.file);
        if (m.rel && m.rel !== m.file) bits.push(m.rel);
        if (m.author && m.author !== "Unknown") bits.push(m.author);
        if (m.version && m.version !== "—") bits.push(m.version);
        if (m.depends && m.depends.length) bits.push("needs " + m.depends.join(", "));
        html +=
          "<li><b>" +
          title +
          "</b>" +
          (bits.length ? "<br><span class='muted'>" + bits.join(" · ") + "</span>" : "") +
          "</li>";
      }
      html += "</ol>";
      return html;
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the main menu.", "boot.menu")];
    },
  });

  function modMenuReturn() {
    return (LT.game.flags && LT.game.flags.modMenuReturn) || "boot.menu";
  }

  LT.defineNode({
    id: "boot.mod-menu",
    ui: "options",
    title: "Mod Menu",
    chrome: { left: false, right: false },
    getContent: function () {
      var list = typeof LT.listModMenus === "function" ? LT.listModMenus() : [];
      var html =
        "<p>Installed mods can inject a settings page here. Enable a mod in KittyLoader, Apply, and reload if a page is missing.</p>";
      if (!list.length) {
        return html + "<p>No mods have registered a menu yet.</p>";
      }
      html += "<ul class='mod-menu-index'>";
      var i;
      for (i = 0; i < list.length; i++) {
        var spec = list[i];
        html +=
          "<li><b>" +
          (spec.name || spec.id) +
          "</b>" +
          (spec.author ? " <span class='muted'>by " + spec.author + "</span>" : "") +
          (spec.description ? "<br><span class='muted'>" + spec.description + "</span>" : "") +
          "</li>";
      }
      html += "</ul>";
      return html;
    },
    getResponses: function () {
      var list = [new LT.Response("Back", "Leave the mod menu.", modMenuReturn())];
      var menus = typeof LT.listModMenus === "function" ? LT.listModMenus() : [];
      var i;
      for (i = 0; i < menus.length; i++) {
        (function (spec) {
          list.push(
            new LT.Response(spec.name || spec.id, spec.description || "Open this mod's settings.", null, function () {
              LT.openModMenuPage(spec.id);
            }),
          );
        })(menus[i]);
      }
      list.push(new LT.Response("Enabled list", "See KittyLoader apply order.", "boot.mods"));
      return list;
    },
  });

  LT.defineNode({
    id: "boot.mod-config",
    ui: "options",
    title: function () {
      var spec = typeof LT.getModMenu === "function" && LT.game.flags ? LT.getModMenu(LT.game.flags.modMenuId) : null;
      return (spec && spec.name) || "Mod settings";
    },
    chrome: { left: false, right: false },
    getContent: function () {
      var spec = typeof LT.getModMenu === "function" && LT.game.flags ? LT.getModMenu(LT.game.flags.modMenuId) : null;
      if (!spec) return "<p>That mod menu is not loaded.</p>";
      var inner = typeof spec.getHtml === "function" ? spec.getHtml() : "";
      return '<div class="mod-menu-page" data-mod-menu="' + spec.id + '">' + (inner || "<p>This mod has not injected any settings HTML.</p>") + "</div>";
    },
    getResponses: function () {
      return [new LT.Response("Back", "Return to the mod list.", "boot.mod-menu")];
    },
  });

})();
