(function () {
  var VALUE = {
    FIREBALL: 2500,
    ICE_SHARD: 2500,
    SLAM: 2500,
    ARCANE_AROUSAL: 2500,
    POISON_VAPOURS: 2500,
    FLASH: 5000,
    RAIN_CLOUD: 5000,
    VACUUM: 5000,
    TELEPATHIC_COMMUNICATION: 5000,
    ARCANE_CLOUD: 5000,
    CLOAK_OF_FLAMES: 10000,
    SOOTHING_WATERS: 10000,
    STONE_SHELL: 10000,
  };

  LT.SPELL_BOOK_IDS = [
    "ICE_SHARD",
    "FIREBALL",
    "FLASH",
    "RAIN_CLOUD",
    "POISON_VAPOURS",
    "VACUUM",
    "SLAM",
    "STONE_SHELL",
    "CLOAK_OF_FLAMES",
    "SOOTHING_WATERS",
    "ARCANE_AROUSAL",
    "ARCANE_CLOUD",
    "TELEPATHIC_COMMUNICATION",
  ];

  LT.spellBookValue = function (id) {
    return VALUE[id] || 2500;
  };

  LT.spellBookBuyPrice = function (id) {
    return Math.round(LT.spellBookValue(id) * 1.5);
  };

  LT.makeSpellBook = function (id) {
    var spell = LT.SPELLS && LT.SPELLS[id];
    if (!spell) return null;
    return {
      kind: "spellbook",
      id: "SPELL_BOOK_" + id,
      spellId: id,
      name: "Spellbook: " + spell.name,
      value: LT.spellBookValue(id),
      uid: "book_" + id + "_" + Math.random().toString(36).slice(2, 8),
    };
  };

  LT.vickyBookStock = function () {
    LT.game.flags = LT.game.flags || {};
    var day = Math.floor(((LT.game && LT.game.secondsPassed) || 0) / 86400);
    if (LT.game.flags.vickyBookDay === day && LT.game.flags.vickyBooks) return LT.game.flags.vickyBooks;
    var stock = {};
    for (var i = 0; i < LT.SPELL_BOOK_IDS.length; i++) stock[LT.SPELL_BOOK_IDS[i]] = 1;
    LT.game.flags.vickyBookDay = day;
    LT.game.flags.vickyBooks = stock;
    return stock;
  };

  LT.readSpellBook = function (player, book) {
    if (!player || !book || !book.spellId) return "That is not a spell book.";
    var spell = LT.SPELLS[book.spellId];
    if (!spell) return "That spell is not in this build.";
    var known = player.knownSpells || [];
    if (known.indexOf(book.spellId) >= 0) {
      return (
        "<p>Reading through the spell book again, you quickly discover that you've already learned all there is to know about the spell '" +
        spell.name +
        "'. Apart from some well-detailed diagrams of a demon casting this spell, there's nothing within the tome's pages to hold your attention, and you find yourself closing it after just a couple of minutes, having not learned anything new...</p>"
      );
    }
    if (typeof LT.learnSpell === "function") LT.learnSpell(player, book.spellId);
    player.items = (player.items || []).filter(function (it) {
      return it !== book && it.uid !== book.uid;
    });
    return (
      "<p>Opening the spell book, you read its contents...</p>" +
      "<p>It doesn't take you long to get the general idea of what to do, and after completing the book's practice exercises, you feel confident that you'll be able to cast this spell whenever you'd like.</p>" +
      "<p style='text-align:center;'>You learn the spell <b>" +
      spell.name +
      "</b>!<br/><i>Having served its purpose, the spell book disappears in a flash of purple light!</i></p>"
    );
  };
})();
