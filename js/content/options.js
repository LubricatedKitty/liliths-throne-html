(function () {
  var Colour = LT.Colour;

  var MISC = [
    { key: "artwork", colour: "#8ec8f0", title: "Artwork", description: "Enables artwork to be displayed in characters' information screens." },
    { key: "thumbnail", colour: "#5d6d7e", title: "Thumbnails", description: "Enables preview thumbnails for artwork." },
    { key: "hudCharacterImages", colour: "#8ec8f0", title: "Show character images in HUD", description: "When enabled, character portraits are shown below their status icons on the left-hand HUD." },
    { key: "sexMainStatusBars", colour: Colour.ATTRIBUTE_AROUSAL, title: "Sex status bars in main view", description: "When enabled, name, arousal, and lust bars are shown at the top of the sex scene. Official sex scenes put this information on the side character panels instead." },
    { key: "weatherInterruptions", colour: "#6f9be3", title: "Weather interruptions", description: "When enabled, arriving at some outdoor destinations during an arcane storm will be interrupted by the weather." },
    { key: "automaticDialogueCopy", colour: "#b3b3b3", title: "Automatic dialogue copy", description: "Automatically copy the current dialogue to the clipboard when the scene changes." },
    { key: "sillyMode", colour: Colour.GENERIC_ARCANE, title: "Silly mode", description: "Enables additional silly/joke text in some scenes." },
    { key: "sharedEncyclopedia", colour: Colour.GENERIC_EXCELLENT, title: "Shared encyclopedia", description: "Shares encyclopedia discoveries across all playthroughs on this device." },
  ];

  var GAMEPLAY = [
    { key: "enchantmentLimits", colour: Colour.GENERIC_ARCANE, title: "Enchantment Capacity", description: "Toggle the 'enchantment capacity' mechanic, which restricts how many enchanted items you can wear. This is on by default, and you will potentially break the balance of the game's combat by turning it off." },
    { key: "badEndContent", colour: "#b14a4a", title: "Bad Ends", description: "Toggle the ability to trigger 'bad ends', which effectively end the game for your character when encountered.<br/>Please note that bad ends involve non-con content, regardless of whether or not your non-con option is enabled." },
    { key: "levelDrain", colour: "#b14a4a", title: "Level Drain", description: "Toggle the use of the 'orgasmic level drain' perk by unique NPCs (such as some scenes with Amber), which causes them to drain your level for each orgasm you have in sex with them." },
    { key: "opportunisticAttackers", colour: Colour.GENERIC_BAD, title: "Opportunistic attackers", description: "This makes random attacks more likely when you're high on lust, low on health, covered in fluids, exposed, or drunk." },
    { key: "offspringEncounters", colour: "#5b4b8a", title: "Offspring Encounters", description: "This enables you to randomly encounter your offspring throught the world.<br/><i>This setting has no effect on the Offspring Map, nor on offspring who you've already met.</i>" },
    { key: "spittingEnabled", colour: Colour.ATTRIBUTE_MANA, title: "Rejecting TF potions", description: "Forced TF potions may be spat out if this is enabled." },
    { key: "companionContent", colour: Colour.GENERIC_MINOR_GOOD, title: "Companions", description: "Enable the ability to add slaves or friendly occupants as your companion.<br/><b>Warning:</b> This is an experimental feature, and support for companions was dropped in v0.3.9, so there will be no special dialogue or actions involving your companions outside of Dominion." },
  ];

  function percentRow(key, title, description) {
    var n = LT.getNumericProperty(key, 40);
    return (
      '<div class="option-row"><div class="option-copy"><b style="color:#ad1457;">' +
      title +
      ":</b> " +
      description +
      "</div>" +
      '<div class="option-toggles">' +
      '<div data-act="body:' +
      key +
      ':-10" class="cosmetics-button">−−</div>' +
      '<div data-act="body:' +
      key +
      ':-5" class="cosmetics-button">−</div>' +
      '<div class="cosmetics-button selected"><b>' +
      n +
      "%</b></div>" +
      '<div data-act="body:' +
      key +
      ':+5" class="cosmetics-button">+</div>' +
      '<div data-act="body:' +
      key +
      ':+10" class="cosmetics-button">++</div>' +
      "</div></div>"
    );
  }

  var SEX = [
    { key: "nonConContent", colour: Colour.GENERIC_BAD, title: "Non-consent", description: "This enables the 'resist' pace in sex scenes, which contains some more extreme non-consensual descriptions, as well as dialogue references and actions related to this content.<br/><i>Please note that bad ends involve non-con content, regardless of whether or not this option is enabled.</i>" },
    { key: "sadisticSexContent", colour: Colour.GENERIC_BAD, title: "Sadistic sex", description: "This unlocks 'sadistic' sex actions, such as choking, slapping, and spitting on partners in sex." },
    { key: "lipstickMarkingContent", colour: "#8b1e3f", title: "Lipstick marking", description: "This enables lipstick marking of bodyparts via kisses during sex." },
    { key: "voluntaryNTR", colour: Colour.GENERIC_MINOR_BAD, title: "Voluntary NTR", description: "When enabled, you will get the option to offer certain enemies sex with your companions as a way to avoid combat." },
    { key: "involuntaryNTR", colour: Colour.GENERIC_BAD, title: "Involuntary NTR", description: "When enabled, enemies might choose to only have sex with your companion after beating your party in combat. When disabled, all post-combat-loss sex scenes will involve you." },
    { key: "incestContent", colour: "#e39ab8", title: "Incest", description: "This will enable sexual actions between characters who are related to one another." },
    { key: "lactationContent", colour: Colour.BASE_YELLOW_LIGHT, title: "Lactation", description: "This enables lactation content." },
    { key: "udderContent", colour: "#e3b06f", title: "Crotch-boob & udder content", description: "This enables crotch-boob & udder-related sex actions and allows crotch-boob & udder transformations to be inflicted upon the player." },
    { key: "urethralContent", colour: "#ad1457", title: "Urethral content", description: "This enables urethral transformations and penetrations." },
    { key: "nipplePenContent", colour: "#ad1457", title: "Nipple penetrations", description: "This enables nipple-penetration transformations and sex actions." },
    { key: "analContent", colour: "#e39a6f", title: "Anal content", description: "When disabled, removes all anal-related actions from being available during sex." },
    { key: "gapeContent", colour: "#ad1457", title: "Gape content", description: "When disabled, changes descriptions of gaping orifices to simply be 'loose', and also hides any special gape-related content." },
    { key: "penetrationLimitations", colour: "#ad1457", title: "Penetrative size-difference", description: "When enabled, orifices will have a limited depth to them, meaning that penetrative objects (penises and tails) can be too long to fit all the way inside." },
    { key: "elasticityAffectDepth", colour: "#ad1457", title: "Elasticity depth effects", description: "When enabled, if an orifice has an elasticity of at least 'limber', the maximum 'uncomfortable depth' value will be increased, with greater elasticity values increasing it further. (Note: Only applies when 'Penetrative size-difference' is also turned on.)" },
    { key: "footContent", colour: "#c4a574", title: "Foot content", description: "When disabled, removes all foot-related actions from being available during sex." },
    { key: "armpitContent", colour: Colour.BASE_PINK_LIGHT, title: "Armpit content", description: "When disabled, removes all armpit-related actions from being available during sex." },
    { key: "muskContent", colour: Colour.BASE_YELLOW_LIGHT, title: "Musk content", description: "When disabled, some scenes will either have reduced musk content or be omitted entirely, and the 'marked by musk' status effect will be disabled." },
    { key: "furryTailPenetrationContent", colour: Colour.BASE_PURPLE, title: "Furry tail penetrations", description: "This marks all tail types as being suitable for penetration, thereby enabling furry tails to engage in penetrative actions in sex." },
    { key: "inflationContent", colour: Colour.GENERIC_SEX, title: "Cum inflation", description: "This enables cum inflation mechanics." },
    { key: "autoSexClothingManagement", colour: "#5d6d7e", title: "Post-sex clothing replacement", description: "Enables equipped clothing to be automatically pulled back into their pre-sex states after sex scenes." },
    { key: "autoSexStrip", colour: Colour.BASE_PINK_LIGHT, title: "Automatic stripping", description: "When enabled, all non-spectating characters which you are allowed to strip during sex (including yourself) will start sex naked." },
    { key: "rapePlayAtSexStart", colour: Colour.GENERIC_BAD, title: "Rape-play allowed by default", description: "When enabled, submissive characters in sex who have the 'unwilling fuck-toy' fetish will be able to engage in rape-play without first being given permission to do so." },
  ];

  var BODIES = [
    { key: "ageContent", colour: Colour.GENERIC_MINOR_GOOD, title: "Age", description: "This enables descriptions of the age that characters appear to be." },
    { key: "feralContent", colour: "#c4a574", title: "Feral", description: "This enables feral content, which contains sexual and non-sexual interactions with sapient characters who have fully-animal bodies." },
    { key: "cumRegenerationContent", colour: Colour.GENERIC_SEX, title: "Cum Regeneration", description: "This enables cum regeneration related content, such as decreasing quantity for multiple orgasms in one session and the full balls status effect.<br>When disabled, balls will always be treated as full, but without any negative effects." },
    { key: "futanariTesticles", colour: Colour.BASE_PINK, title: "Futanari Testicles", description: "When enabled, futanari NPCs will be able to have external testicles. When disabled, they are locked to always being internal." },
    { key: "bipedalCloaca", colour: Colour.BASE_PINK_LIGHT, title: "Bipedal Cloacas", description: "When enabled, certain bipedal races (such as harpies and alligator-morphs) will have cloacas. When disabled, all bipeds with cloacas will be treated as having a regular genitalia configuration. Some special races, such as lamia, always have cloacas, and are not affected by this." },
    { key: "vestigialMultiBreasts", colour: Colour.BASE_PURPLE, title: "Vestigial Multi-breasts", description: "When enabled, characters who have multiple rows of breasts will have the rows beneath their top one described as being vestigial in size. When disabled, breast rows will be described as being one cup size smaller than the one above them." },
    { key: "facialHairContent", colour: "#d7b8e8", title: "Facial hair", description: "This enables facial hair descriptions and content." },
    { key: "pubicHairContent", colour: "#c39bd3", title: "Pubic hair", description: "This enables pubic hair descriptions and content." },
    { key: "bodyHairContent", colour: Colour.BASE_PURPLE, title: "Underarm hair", description: "This enables underarm hair descriptions and content." },
    { key: "assHairContent", colour: "#6c3483", title: "Ass hair", description: "This enables ass hair descriptions and content." },
    { key: "feminineBeardsContent", colour: "#5d6d7e", title: "Feminine beards", description: "This enables feminine characters to grow beards." },
    { key: "furryHairContent", colour: "#8d6e63", title: "Furry hair", description: "Toggles whether or not characters with a furry head type will spawn with human-like hair on their heads." },
    { key: "scalyHairContent", colour: "#1e8449", title: "Scaly Hair", description: "Toggles whether or not characters with a reptilian or amphibious head type will spawn with human-like hair on their heads." },
    { key: "lipLispContent", colour: "#1e8449", title: "Lip lisps", description: "Toggles whether or not characters with very large lips will speak with a lisp." },
  ];

  function toggleRow(opt) {
    var on = LT.hasProperty(opt.key);
    return (
      '<div class="option-row"><div class="option-copy"><b style="color:' +
      opt.colour +
      ';">' +
      opt.title +
      ":</b> " +
      opt.description +
      '</div><div class="option-toggles">' +
      (on
        ? '<div class="cosmetics-button selected" style="color:' +
          Colour.GENERIC_GOOD +
          ';"><b>ON</b></div><div data-act="opt:' +
          opt.key +
          ':0" class="cosmetics-button" style="color:#888;">OFF</div>'
        : '<div data-act="opt:' +
          opt.key +
          ':1" class="cosmetics-button" style="color:#888;">ON</div><div class="cosmetics-button selected" style="color:' +
          Colour.GENERIC_BAD +
          ';"><b>OFF</b></div>') +
      "</div></div>"
    );
  }

  function pageHtml(title, rows, extra) {
    var html = '<div class="container-full-width"><h5 style="text-align:center;">' + title + "</h5>";
    var i;
    for (i = 0; i < rows.length; i++) html += toggleRow(rows[i]);
    if (extra) html += extra;
    html += "</div>";
    return html;
  }

  function durationRow() {
    var n = LT.pregnancyDurationWeeks();
    var label = n + " week" + (n === 1 ? "" : "s");
    return (
      '<div class="option-row"><div class="option-copy"><b style="color:#ad1457;">Pregnancy duration:</b> This sets the maximum time it takes for a pregnancy to progress from conception to birth.</div>' +
      '<div class="option-toggles">' +
      '<div data-act="preg:-" class="cosmetics-button">−</div>' +
      '<div class="cosmetics-button selected"><b>' +
      label +
      "</b></div>" +
      '<div data-act="preg:+" class="cosmetics-button">+</div>' +
      "</div></div>"
    );
  }

  function optionResponses(current, extra) {
    function go(id, label, already, tip) {
      var here = id === current || (current === "boot.options" && id === "options.misc");
      if (here) return new LT.Response(label, already, null).disable(already);
      return new LT.Response(label, tip, id);
    }
    var list = [
      new LT.Response("Back", "Go back to the main menu.", "boot.menu"),
      go("options.misc", "Misc.", "You are already viewing the miscellaneous content options!", "View the game's miscellaneous content options."),
      go("options.gameplay", "Gameplay", "You are already viewing the gameplay content options!", "View the game's gameplay content options."),
      go("options.sex", "Sex & Fetishes", "You are already viewing the sex & fetishes content options!", "View the game's sex & fetishes content options."),
      go("options.bodies", "Bodies", "You are already viewing the bodies content options!", "View the game's bodies content options."),
      new LT.Response(
        "Reset",
        "Resets all 'Misc.', 'Gameplay', 'Sex & Fetishes', and 'Bodies' content preferences to their default values! Does not reset Gender, Orientation, Age, Furry, or Fetish preferences.",
        current,
        function () {
          LT.resetContentOptions();
          LT.game.textStart = "<p>All content preferences have been reset to their official defaults.</p>";
        },
      ),
      go("options.gender", "Gender preferences", "You are already viewing the gender preferences screen!", "Set your preferred gender encounter rates."),
      go("options.orientation", "Orientation preferences", "You are already viewing the sexual orientation preferences screen!", "Set your preferred sexual orientation encounter rates."),
      go("options.age", "Age preferences", "You are already viewing the age preferences screen!", "Set your preferred age encounter rates."),
      go("options.furry", "Furry preferences", "You are already viewing the furry preferences screen!", "Set your preferred furry level for encounters."),
      go("options.fetish", "Fetish preferences", "You are already viewing the fetish preferences screen!", "Set your preferred fetish encounter rates."),
    ];
    if (extra) list.push(extra);
    return list;
  }

  function definePage(id, title, getHtml) {
    LT.defineNode({
      id: id,
      ui: "options",
      title: title,
      chrome: { left: false, right: false },
      getContent: getHtml,
      getResponses: function () {
        return optionResponses(id);
      },
    });
  }

  definePage("boot.options", "Content Options (Misc.)", function () {
    return pageHtml("Content Options (Misc.)", MISC);
  });
  definePage("options.misc", "Content Options (Misc.)", function () {
    return pageHtml("Content Options (Misc.)", MISC);
  });
  definePage("options.gameplay", "Content Options (Gameplay)", function () {
    return pageHtml(
      "Content Options (Gameplay)",
      GAMEPLAY,
      durationRow() +
        percentRow(
          "forcedFetishPercentage",
          "Forced fetish",
          "Chance that a random NPC will try to force a fetish onto you during sex. 0% disables forced-fetish attempts. Fetish likes/loves on the Fetish preferences page still decide which fetishes random NPCs have.",
        ) +
        percentRow(
          "forcedTFPercentage",
          "Forced transformation",
          "Chance that a random NPC will try to force a transformation onto you after they have beaten you. 0% disables forced-TF attempts.",
        ),
    );
  });
  definePage("options.sex", "Content Options (Sex & Fetishes)", function () {
    return pageHtml("Content Options (Sex & Fetishes)", SEX);
  });
  definePage("options.bodies", "Content Options (Bodies)", function () {
    return pageHtml("Content Options (Bodies)", BODIES, bodyExtrasHtml());
  });

  var CUP_FROM_MEASUREMENT = [
    "flat",
    "training-AAA",
    "training-AA",
    "training-A",
    "AA",
    "A",
    "B",
    "C",
    "D",
    "DD",
    "E",
    "F",
    "FF",
    "G",
    "GG",
    "H",
    "HH",
    "J",
    "JJ",
    "K",
    "KK",
    "L",
    "LL",
    "M",
    "MM",
    "N",
    "X-AA",
    "X-A",
    "X-B",
    "X-C",
    "X-D",
    "X-DD",
    "X-E",
    "X-F",
    "X-FF",
    "X-G",
    "X-GG",
    "X-H",
    "X-HH",
    "X-J",
    "X-JJ",
    "X-K",
    "X-KK",
    "X-L",
    "X-LL",
    "X-M",
    "X-MM",
    "X-N",
    "XX-AA",
    "XX-A",
    "XX-B",
    "XX-C",
    "XX-D",
    "XX-DD",
    "XX-E",
    "XX-F",
    "XX-FF",
    "XX-G",
    "XX-GG",
    "XX-H",
    "XX-HH",
    "XX-J",
    "XX-JJ",
    "XX-K",
    "XX-KK",
    "XX-L",
    "XX-LL",
    "XX-M",
    "XX-MM",
    "XX-N",
    "XXX-AA",
    "XXX-A",
    "XXX-B",
    "XXX-C",
    "XXX-D",
    "XXX-DD",
    "XXX-E",
    "XXX-F",
    "XXX-FF",
    "XXX-G",
    "XXX-GG",
    "XXX-H",
    "XXX-HH",
    "XXX-J",
    "XXX-JJ",
    "XXX-K",
    "XXX-KK",
    "XXX-L",
    "XXX-LL",
    "XXX-M",
    "XXX-MM",
    "XXX-N",
  ];

  function cupNameFromMeasurement(n) {
    n = Number(n) || 0;
    if (n <= 0) return "flat";
    if (n < CUP_FROM_MEASUREMENT.length) return CUP_FROM_MEASUREMENT[n];
    return "XXX-N";
  }

  function cupLabel(n) {
    var name = cupNameFromMeasurement(n);
    if (name === "flat") return "flat";
    if (name.indexOf("training") === 0) return name;
    return name + "-cup";
  }

  function fluidLabel(ml) {
    if (!ml) return "Disabled";
    return ml + "mL";
  }

  function signedLabel(n, unit) {
    return (n > 0 ? "+" : "") + n + (unit || "");
  }

  function stepperPair(actMinus, actPlus, label, valueHtml, atMin, atMax) {
    return (
      '<div class="body-stepper-line"><span class="body-stepper-name">' +
      label +
      "</span>" +
      '<div data-act="' +
      actMinus +
      '" class="cosmetics-button' +
      (atMin ? " disabled" : "") +
      '">−</div>' +
      '<div class="cosmetics-button selected"><b>' +
      valueHtml +
      "</b></div>" +
      '<div data-act="' +
      actPlus +
      '" class="cosmetics-button' +
      (atMax ? " disabled" : "") +
      '">+</div></div>'
    );
  }

  function choiceRow(colour, title, description, buttons) {
    var html =
      '<div class="option-row"><div class="option-copy"><b style="color:' +
      colour +
      ';">' +
      title +
      ":</b> " +
      description +
      '</div><div class="option-toggles">';
    var i;
    for (i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      html +=
        '<div data-act="' +
        b.act +
        '" class="cosmetics-button' +
        (b.selected ? " selected" : "") +
        '"' +
        (b.title ? ' title="' + b.title.replace(/"/g, "&quot;") + '"' : "") +
        ">" +
        (b.selected ? "<b>" + b.label + "</b>" : b.label) +
        "</div>";
    }
    html += "</div></div>";
    return html;
  }

  function variableRow(colour, title, description, steppers) {
    var html =
      '<div class="option-row body-var-row"><div class="option-copy"><b style="color:' +
      colour +
      ';">' +
      title +
      ":</b> " +
      description +
      '</div><div class="option-toggles body-steppers">';
    var i;
    for (i = 0; i < steppers.length; i++) html += steppers[i];
    html += "</div></div>";
    return html;
  }

  function bodyExtrasHtml() {
    var p = LT.ensureProperties();
    var skin = LT.ensureSkinColourPreferences();
    var growthVar = LT.getNumericProperty("pregnancyBreastGrowthVariance", 2);
    var lactVar = LT.getNumericProperty("pregnancyLactationIncreaseVariance", 100);
    var html = "";
    html += choiceRow(
      Colour.BASE_PINK,
      "Multi-breasts",
      "Choose whether randomly-generated furry characters should be given multiple rows of breasts.",
      [
        { act: "multib:2", label: "Furry-only", selected: p.multiBreasts === 2, title: "Randomly-generated NPCs will only have multiple rows of breasts if they have furry skin. (Default setting.)" },
        { act: "multib:1", label: "Off", selected: p.multiBreasts === 1, title: "Randomly-generated NPCs will never have multiple rows of breasts." },
        { act: "multib:3", label: "On", selected: p.multiBreasts === 3, title: "Randomly-generated NPCs will have multiple rows of breasts if their breast type is furry." },
      ],
    );
    html += choiceRow(
      Colour.BASE_PINK_LIGHT,
      "Crotch-boobs &amp; Udders",
      "Choose whether randomly-generated taurs and furry characters should be given udders or crotch-boobs.",
      [
        { act: "udders:2", label: "On", selected: p.udders === 2, title: "Randomly-generated greater-anthro-morphs, as well as taurs, will have udders and crotch boobs." },
        { act: "udders:1", label: "Taur-only", selected: p.udders === 1, title: "Randomly-generated NPCs will only have udders or crotch-boobs if they have a non-bipedal body. (Default setting.)" },
        { act: "udders:0", label: "Off", selected: p.udders === 0, title: "Neither randomly-generated taurs nor anthro-morphs will ever have udders or crotch-boobs." },
      ],
    );
    html += variableRow(
      Colour.BASE_PINK,
      "Average Pregnancy Breast Growth",
      "Set the <b>average</b> cup size growth that characters will gain from each pregnancy. Actual breast growth will be within " +
        growthVar +
        " sizes of this value.",
      [
        stepperPair(
          "body:pregnancyBreastGrowth:-1",
          "body:pregnancyBreastGrowth:1",
          "Breasts",
          p.pregnancyBreastGrowth === 0 ? "Disabled" : p.pregnancyBreastGrowth + " cup" + (p.pregnancyBreastGrowth === 1 ? "" : "s"),
          p.pregnancyBreastGrowth <= 0,
          p.pregnancyBreastGrowth >= 10,
        ),
        stepperPair(
          "body:pregnancyUdderGrowth:-1",
          "body:pregnancyUdderGrowth:1",
          "Udders",
          p.pregnancyUdderGrowth === 0 ? "Disabled" : p.pregnancyUdderGrowth + " cup" + (p.pregnancyUdderGrowth === 1 ? "" : "s"),
          p.pregnancyUdderGrowth <= 0,
          p.pregnancyUdderGrowth >= 10,
        ),
      ],
    );
    html += variableRow(
      Colour.BASE_PINK_LIGHT,
      "Pregnancy Breast Growth Limit",
      "Set the maximum limit of cup size that characters' breasts will grow to from pregnancies.",
      [
        stepperPair("body:pregnancyBreastGrowthLimit:-1", "body:pregnancyBreastGrowthLimit:1", "Breasts", cupLabel(p.pregnancyBreastGrowthLimit), p.pregnancyBreastGrowthLimit <= 0, p.pregnancyBreastGrowthLimit >= 100),
        stepperPair("body:pregnancyUdderGrowthLimit:-1", "body:pregnancyUdderGrowthLimit:1", "Udders", cupLabel(p.pregnancyUdderGrowthLimit), p.pregnancyUdderGrowthLimit <= 0, p.pregnancyUdderGrowthLimit >= 100),
      ],
    );
    html += variableRow(
      Colour.BASE_YELLOW_LIGHT,
      "Average Pregnancy Lactation",
      "Set the <b>average</b> increase in lactation that characters will gain as a result of each pregnancy. Actual lactation increase will be within " +
        lactVar +
        "mL of this value.",
      [
        stepperPair(
          "body:pregnancyLactationIncrease:-50",
          "body:pregnancyLactationIncrease:50",
          "Breasts",
          p.pregnancyLactationIncrease === 0 ? "Disabled" : fluidLabel(p.pregnancyLactationIncrease),
          p.pregnancyLactationIncrease <= 0,
          p.pregnancyLactationIncrease >= 1000,
        ),
        stepperPair(
          "body:pregnancyUdderLactationIncrease:-50",
          "body:pregnancyUdderLactationIncrease:50",
          "Udders",
          p.pregnancyUdderLactationIncrease === 0 ? "Disabled" : fluidLabel(p.pregnancyUdderLactationIncrease),
          p.pregnancyUdderLactationIncrease <= 0,
          p.pregnancyUdderLactationIncrease >= 1000,
        ),
      ],
    );
    html += variableRow(
      "#f0e6a8",
      "Pregnancy Lactation Limit",
      "Set the maximum limit of lactation that characters will gain from pregnancies.",
      [
        stepperPair("body:pregnancyLactationLimit:-500", "body:pregnancyLactationLimit:500", "Breasts", fluidLabel(p.pregnancyLactationLimit), p.pregnancyLactationLimit <= 0, p.pregnancyLactationLimit >= 100000),
        stepperPair("body:pregnancyUdderLactationLimit:-500", "body:pregnancyUdderLactationLimit:500", "Udders", fluidLabel(p.pregnancyUdderLactationLimit), p.pregnancyUdderLactationLimit <= 0, p.pregnancyUdderLactationLimit >= 100000),
      ],
    );
    html += variableRow(
      Colour.BASE_PINK,
      "Cup Size Preference",
      "Affects randomly-generated NPCs' cup sizes (will not be reduced to below AA-cup).",
      [
        stepperPair("body:breastSizePreference:-1", "body:breastSizePreference:1", "Breasts", signedLabel(p.breastSizePreference), p.breastSizePreference <= -20, p.breastSizePreference >= 20),
        stepperPair("body:udderSizePreference:-1", "body:udderSizePreference:1", "Udders", signedLabel(p.udderSizePreference), p.udderSizePreference <= -20, p.udderSizePreference >= 20),
      ],
    );
    html += variableRow(
      Colour.GENERIC_SEX,
      "Penis Size Preference",
      "Affects randomly-generated NPCs' penis sizes (will not be reduced to below 8cm).",
      [stepperPair("body:penisSizePreference:-1", "body:penisSizePreference:1", "", signedLabel(p.penisSizePreference, "cm"), p.penisSizePreference <= -20, p.penisSizePreference >= 20)],
    );
    html += variableRow(
      Colour.BASE_PINK_LIGHT,
      "Trap penis size",
      "The penis size of randomly-generated traps. 100% represents an unaltered size. Testicle size and cum production will also be altered in proportion to this setting.",
      [stepperPair("body:trapPenisSizePreference:-10", "body:trapPenisSizePreference:10", "", 100 + p.trapPenisSizePreference + "%", p.trapPenisSizePreference <= -90, p.trapPenisSizePreference >= 100)],
    );
    html += variableRow(
      Colour.GENERIC_SEX,
      "Cum multiplier preference",
      "Scales randomly-generated NPCs' cum production. 100% is the unaltered official amount.",
      [stepperPair("body:cumMultiplierPreference:-10", "body:cumMultiplierPreference:10", "", LT.cumMultiplierPercent() + "%", LT.cumMultiplierPercent() <= 0, LT.cumMultiplierPercent() >= 1000)],
    );
    html += variableRow(
      Colour.BASE_YELLOW_LIGHT,
      "Milk multiplier preference",
      "Scales randomly-generated NPCs' milk production. 100% is the unaltered official amount.",
      [stepperPair("body:milkMultiplierPreference:-10", "body:milkMultiplierPreference:10", "", LT.milkMultiplierPercent() + "%", LT.milkMultiplierPercent() <= 0, LT.milkMultiplierPercent() >= 1000)],
    );
    html +=
      '<div class="option-row body-var-row"><div class="option-copy"><b style="color:' +
      Colour.RACE_HUMAN +
      ';">Skin Colour Preference:</b> Affects the weighting of human skin colour for randomly-generated NPCs. This does not affect \'Greater\' furry NPCs, as they have no human skin coverings.</div><div class="option-toggles body-steppers">';
    var i;
    var colours = LT.HUMAN_SKIN_COLOURS || [];
    for (i = 0; i < colours.length; i++) {
      var sc = colours[i];
      var val = skin[sc.id];
      html += stepperPair("skin:" + sc.id + ":-1", "skin:" + sc.id + ":1", '<span style="color:' + sc.hex + ';">' + LT.capitaliseSentence(sc.name) + "</span>", String(val), val <= 0, val >= 10);
    }
    html += "</div></div>";
    return html;
  }

  function prefButton(act, label, selected) {
    return (
      '<div data-act="' +
      act +
      '" class="preference-button' +
      (selected ? " selected" : "") +
      '">' +
      LT.capitaliseSentence(label) +
      "</div>"
    );
  }

  function genderPage() {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().genderPreferences;
    var html =
      "<div class='container-full-width'>These options will determine the gender encounter rates of random NPCs. Some NPCs, such as random succubi attackers, have restrictions on their gender, but your preferences will be taken into account wherever possible.<br/><b>A visual representation of the encounter chances can be seen in the bars at the bottom of each section.</b> (The different shades of each gender are solely for recognition in the bars, and don't mean anything other than that.)<br/>A character is considered to have breasts if they are at least an AA-cup.</div>";
    var types = [LT.PronounType.MASCULINE, LT.PronounType.NEUTRAL, LT.PronounType.FEMININE];
    var t;
    var i;
    var j;
    for (t = 0; t < types.length; t++) {
      var type = types[t];
      html += '<div class="container-full-width" style="text-align:center;"><p><b style="color:' + type.colour + ';">' + LT.capitaliseSentence(type.name) + "</b></p>";
      for (i = 0; i < LT.GENDER_LIST.length; i++) {
        var g = LT.GENDER_LIST[i];
        if (g.type !== type.id) continue;
        html += '<div class="pref-row"><div class="pref-name" style="color:' + g.colour + ';">' + LT.capitaliseSentence(g.name) + "</div><div class='pref-buttons'>";
        for (j = 0; j < LT.ContentPreferenceValue.length; j++) {
          var pv = LT.ContentPreferenceValue[j];
          html += prefButton("gender:" + g.id + ":" + pv.value, pv.name, prefs[g.id] === pv.value);
        }
        html +=
          "</div><p><span style='color:" +
          g.colour +
          ";'>" +
          LT.capitaliseSentence(g.name) +
          "s</span> have " +
          (g.hasVagina ? "a <span style='color:" + Colour.GENERIC_GOOD + ";'>vagina</span>" : "no <span style='color:" + Colour.GENERIC_BAD + ";'>vagina</span>") +
          ", " +
          (g.hasPenis ? "a <span style='color:" + Colour.GENERIC_GOOD + ";'>penis</span>" : "no <span style='color:" + Colour.GENERIC_BAD + ";'>penis</span>") +
          ", and " +
          (g.hasBreasts ? "<span style='color:" + Colour.GENERIC_GOOD + ";'>breasts</span>" : "no <span style='color:" + Colour.GENERIC_BAD + ";'>breasts</span>") +
          ".</p></div><hr/>";
      }
      html += LT.genderBarHtml() + "</div>";
    }
    return html;
  }

  function orientationPage() {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().orientationPreferences;
    var html =
      "<div class='container-full-width'>These options will determine the sexual orientation encounter rates of random NPCs. Note that the race and femininity of NPCs can have an influence on their orientation, and that some NPCs have pre-determined orientations, but your preferences will be taken into account wherever possible.<br/><b>A visual representation of the encounter chances can be seen in the bars at the bottom.</b> (The different shades of each orientation are solely for recognition in the bars, and don't mean anything other than that.)</div><div class='container-full-width' style='text-align:center;'>";
    var i;
    var j;
    for (i = 0; i < LT.ORIENTATION_LIST.length; i++) {
      var o = LT.ORIENTATION_LIST[i];
      html += '<div class="pref-row"><div class="pref-name" style="color:' + o.colour + ';">' + LT.capitaliseSentence(o.name) + "</div><div class='pref-buttons'>";
      for (j = 0; j < LT.SexualOrientationPreference.length; j++) {
        var pv = LT.SexualOrientationPreference[j];
        html += prefButton("orient:" + o.id + ":" + pv.value, pv.name, prefs[o.id] === pv.value);
      }
      html += "</div></div><hr/>";
    }
    html += LT.orientationBarHtml() + "</div>";
    return html;
  }

  function agePage() {
    LT.ensurePreferenceMaps();
    var html =
      "<div class='container-full-width'>These options will determine the age encounter rates of random NPCs, based on their femininity. Some NPCs, such as demons and harpies, may appear to be younger than they actually are, but your preferences will be taken into account wherever possible.<br/><b>A visual representation of the age chances can be seen in the bars at the bottom of each section.</b></div>";
    var types = [LT.PronounType.MASCULINE, LT.PronounType.NEUTRAL, LT.PronounType.FEMININE];
    var t;
    var i;
    var j;
    for (t = 0; t < types.length; t++) {
      var type = types[t];
      var prefs = LT.ensureProperties().agePreferences[type.id];
      html += '<div class="container-full-width" style="text-align:center;"><p><b style="color:' + type.colour + ';">' + LT.capitaliseSentence(type.name) + "</b></p>";
      for (i = 0; i < LT.AgeCategory.length; i++) {
        var cat = LT.AgeCategory[i];
        html += '<div class="pref-row"><div class="pref-name" style="color:' + cat.colour + ';">' + LT.capitaliseSentence(cat.name) + "</div><div class='pref-buttons'>";
        for (j = 0; j < LT.ContentPreferenceValue.length; j++) {
          var pv = LT.ContentPreferenceValue[j];
          html += prefButton("age:" + type.id + ":" + cat.id + ":" + pv.value, pv.name, prefs[cat.id] === pv.value);
        }
        html += "</div></div><hr/>";
      }
      html += LT.ageBarHtml(type.id) + "</div>";
    }
    return html;
  }

  function spawnRateBox(id, colour, title, value) {
    return (
      '<div class="spawn-rate-box"><b style="color:' +
      colour +
      ';">' +
      title +
      "</b><div class='spawn-rate-row'>" +
      '<div data-act="rate:' +
      id +
      ':-10" class="cosmetics-button">−−</div>' +
      '<div data-act="rate:' +
      id +
      ':-1" class="cosmetics-button">−</div>' +
      '<div class="cosmetics-button selected"><b>' +
      value +
      "%</b></div>" +
      '<div data-act="rate:' +
      id +
      ':+1" class="cosmetics-button">+</div>' +
      '<div data-act="rate:' +
      id +
      ':+10" class="cosmetics-button">++</div>' +
      "</div></div>"
    );
  }

  function furryPage() {
    LT.ensurePreferenceMaps();
    var p = LT.ensureProperties();
    var html =
      "<div class='container-full-width'>These options determine the amount of furry content that you'll encounter in the game. The 'Human encounters' option determines what the chance is for random NPCs to be fully human. <b>These options only affect random NPCs at the moment, but I'll do my best to add reduced-furry versions of each major NPC as well!</b><br/>Please note that some races, such as demons and harpies, are limited in their available furry preference options.</div>";
    html += '<div class="spawn-rate-grid">';
    html += spawnRateBox("humanSpawnRate", Colour.RACE_HUMAN, "Human Spawn Rate", p.humanSpawnRate);
    html += spawnRateBox("taurSpawnRate", Colour.RACE_CENTAUR, "Taur Spawn Rate", p.taurSpawnRate);
    html += spawnRateBox("halfDemonSpawnRate", Colour.RACE_HALF_DEMON, "Half-Demon Spawn Rate", p.halfDemonSpawnRate);
    html += "</div>";
    html += "<div class='container-full-width'><b>Tauric Upper-body Furriness</b><div class='pref-buttons'>";
    var taurLevels = [
      { n: 0, name: "Untouched", colour: Colour.TRANSFORMATION_GENERIC },
      { n: 1, name: "Human", colour: Colour.TRANSFORMATION_HUMAN },
      { n: 2, name: "Minimum", colour: Colour.TRANSFORMATION_PARTIAL },
      { n: 3, name: "Lesser", colour: Colour.TRANSFORMATION_PARTIAL_FULL },
      { n: 4, name: "Greater", colour: Colour.TRANSFORMATION_LESSER },
      { n: 5, name: "Maximum", colour: Colour.TRANSFORMATION_GREATER },
    ];
    var i;
    for (i = 0; i < taurLevels.length; i++) {
      var tl = taurLevels[i];
      html += prefButton("taur:" + tl.n, tl.name, p.taurFurryLevel === tl.n);
    }
    html += "</div></div>";
    html += "<div class='container-full-width'><div class='pref-row'><div class='pref-name'>Set all furry preferences:</div><div class='pref-buttons'>";
    for (i = 0; i < LT.FurryPreference.length; i++) {
      html += prefButton("allfurry:" + LT.FurryPreference[i].id, LT.FurryPreference[i].name, false);
    }
    html += "</div></div><div class='pref-row'><div class='pref-name'>Set all spawn frequencies:</div><div class='pref-buttons'>";
    for (i = 0; i < LT.SubspeciesPreference.length; i++) {
      html += prefButton("allspawn:" + LT.SubspeciesPreference[i].value, LT.SubspeciesPreference[i].name, false);
    }
    html += "</div></div></div>";
    html +=
      "<div class='container-full-width' style='text-align:center;'><div class='furry-head'><span style='color:" +
      Colour.TRANSFORMATION_GENERIC +
      ";'>Furry Preference</span><span style='color:" +
      Colour.BASE_YELLOW_LIGHT +
      ";'>Spawn frequency</span></div>";
    for (i = 0; i < LT.SPAWN_SUBSPECIES.length; i++) {
      var race = LT.SPAWN_SUBSPECIES[i];
      html += subspeciesRow(race, "feminine", Colour.FEMININE, p.furryFeminine[race.id], p.spawnFeminine[race.id], race.fem);
      html += subspeciesRow(race, "masculine", Colour.MASCULINE, p.furryMasculine[race.id], p.spawnMasculine[race.id], race.masc);
    }
    html += "</div>";
    return html;
  }

  function subspeciesRow(race, side, colour, furryId, spawnValue, name) {
    var html = '<div class="furry-row" style="border-left:4px solid ' + race.colour + ';"><div class="pref-name" style="color:' + colour + ';">' + LT.capitaliseSentence(name) + "</div>";
    var i;
    html += '<div class="pref-buttons">';
    for (i = 0; i < LT.FurryPreference.length; i++) {
      var fp = LT.FurryPreference[i];
      if (!race.furryEnabled) {
        html += '<div class="preference-button disabled">' + fp.button + "</div>";
      } else {
        html += prefButton("furry:" + side + ":" + race.id + ":" + fp.id, fp.button, furryId === fp.id);
      }
    }
    html += "</div><div class='pref-buttons'>";
    for (i = 0; i < LT.SubspeciesPreference.length; i++) {
      var sp = LT.SubspeciesPreference[i];
      if (!race.spawnEnabled) {
        html += '<div class="preference-button disabled">' + LT.capitaliseSentence(sp.name) + "</div>";
      } else {
        html += prefButton("spawn:" + side + ":" + race.id + ":" + sp.value, sp.name, spawnValue === sp.value);
      }
    }
    html += "</div></div>";
    return html;
  }

  function fetishPage() {
    LT.ensurePreferenceMaps();
    var prefs = LT.ensureProperties().fetishPreferences;
    var html =
      "<div class='container-full-width'>These options will determine the likelihood of random NPCs having these fetishes & preferences. Some races are more likely to get specific fetishes, but your preferences will be taken into account wherever possible.<br/> Content settings will enable/disable related fetishes.</div><div class='container-full-width' style='text-align:center;'>";
    var i;
    var j;
    for (i = 0; i < LT.FETISH_LIST.length; i++) {
      var f = LT.FETISH_LIST[i];
      var disabled = LT.fetishContentDisabledLabel(f);
      if (disabled && f.def != null) prefs[f.id] = f.def;
      else if (disabled) prefs[f.id] = 3;
      var pref = LT.getFetishPreference(prefs[f.id]);
      html += '<div class="pref-row"><div class="pref-name" style="color:' + pref.colour + ';" title="' + pref.tip + '">' + LT.capitaliseSentence(f.name) + "</div>";
      if (disabled) {
        html += "<div class='pref-buttons'><span class='option-disabled'>Fetish forcibly disabled due to " + disabled + " setting!</span></div>";
      } else {
        html += "<div class='pref-buttons'>";
        for (j = 0; j < LT.FetishPreference.length; j++) {
          var fp = LT.FetishPreference[j];
          html += prefButton("fetish:" + f.id + ":" + fp.value, fp.name, prefs[f.id] === fp.value);
        }
        html += "</div>";
      }
      html += "</div><hr/>";
    }
    html += "</div>";
    return html;
  }

  function defaultsResponse(current, label, tip, fn) {
    return new LT.Response(label, tip, current, function () {
      fn();
    });
  }

  LT.defineNode({
    id: "options.gender",
    ui: "options",
    title: "Gender preferences",
    chrome: { left: false, right: false },
    getContent: genderPage,
    getResponses: function () {
      return optionResponses(
        "options.gender",
        defaultsResponse("options.gender", "Defaults", "Restore all gender preferences to their default values.", LT.resetGenderPreferences),
      );
    },
  });
  LT.defineNode({
    id: "options.orientation",
    ui: "options",
    title: "Orientation preferences",
    chrome: { left: false, right: false },
    getContent: orientationPage,
    getResponses: function () {
      return optionResponses(
        "options.orientation",
        defaultsResponse("options.orientation", "Defaults", "Restore all orientation preferences to their default values.", LT.resetOrientationPreferences),
      );
    },
  });
  LT.defineNode({
    id: "options.age",
    ui: "options",
    title: "Age preferences",
    chrome: { left: false, right: false },
    getContent: agePage,
    getResponses: function () {
      return optionResponses("options.age", defaultsResponse("options.age", "Defaults", "Restore all age preferences to their default values.", LT.resetAgePreferences));
    },
  });
  LT.defineNode({
    id: "options.furry",
    ui: "options",
    title: "Furry preferences",
    chrome: { left: false, right: false },
    getContent: furryPage,
    getResponses: function () {
      return optionResponses(
        "options.furry",
        defaultsResponse("options.furry", "Defaults", "Reset all furry and spawn preferences to their default settings.", LT.resetFurryPreferences),
      );
    },
  });
  LT.defineNode({
    id: "options.fetish",
    ui: "options",
    title: "Fetish preferences",
    chrome: { left: false, right: false },
    getContent: fetishPage,
    getResponses: function () {
      return optionResponses("options.fetish", defaultsResponse("options.fetish", "Defaults", "Reset all fetish preferences to their default settings.", LT.resetFetishPreferences));
    },
  });

  function handleAct(act) {
    if (!act) return false;
    var bits = act.split(":");
    if (act.indexOf("opt:") === 0) {
      LT.setProperty(bits[1], bits[2] === "1");
      return true;
    }
    if (act === "preg:+") {
      LT.setProperty("pregnancyDuration", LT.pregnancyDurationWeeks() + 1);
      return true;
    }
    if (act === "preg:-") {
      LT.setProperty("pregnancyDuration", LT.pregnancyDurationWeeks() - 1);
      return true;
    }
    if (bits[0] === "gender") {
      LT.setGenderPreference(bits[1], Number(bits[2]));
      return true;
    }
    if (bits[0] === "orient") {
      LT.setOrientationPreference(bits[1], Number(bits[2]));
      return true;
    }
    if (bits[0] === "age") {
      LT.setAgePreference(bits[1], bits[2], Number(bits[3]));
      return true;
    }
    if (bits[0] === "fetish") {
      LT.setFetishPreference(bits[1], Number(bits[2]));
      return true;
    }
    if (bits[0] === "furry") {
      LT.setFurryPreference(bits[1], bits[2], bits[3]);
      return true;
    }
    if (bits[0] === "spawn") {
      LT.setSpawnPreference(bits[1], bits[2], Number(bits[3]));
      return true;
    }
    if (bits[0] === "allfurry") {
      LT.setAllFurryPreferences(bits[1]);
      return true;
    }
    if (bits[0] === "allspawn") {
      LT.setAllSpawnPreferences(Number(bits[1]));
      return true;
    }
    if (bits[0] === "taur") {
      LT.setProperty("taurFurryLevel", Number(bits[1]));
      return true;
    }
    if (bits[0] === "rate") {
      LT.setProperty(bits[1], LT.getNumericProperty(bits[1], 5) + Number(bits[2]));
      return true;
    }
    if (bits[0] === "body") {
      LT.setProperty(bits[1], LT.getNumericProperty(bits[1], 0) + Number(bits[2]));
      return true;
    }
    if (bits[0] === "multib") {
      LT.setProperty("multiBreasts", Number(bits[1]));
      return true;
    }
    if (bits[0] === "udders") {
      LT.setProperty("udders", Number(bits[1]));
      return true;
    }
    if (bits[0] === "skin") {
      LT.adjustSkinColourPreference(bits[1], Number(bits[2]));
      return true;
    }
    return false;
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest && e.target.closest("[data-act]");
      if (!btn || btn.classList.contains("disabled")) return;
      var node = LT.game && LT.game.currentNode;
      if (!node) return;
      if (node.id !== "boot.options" && String(node.id || "").indexOf("options.") !== 0) return;
      if (!handleAct(btn.getAttribute("data-act"))) return;
      LT.game.setContent(node);
    });
  }
})();
