(function () {
  function xml(tag) {
    return LT.parseFromXML("places/dominion/shoppingArcade/arcaneArts", tag);
  }

  function shopOpen() {
    return typeof LT.isOfficeHours === "function" && LT.isOfficeHours();
  }

  function parseExterior() {
    var prev = LT.isWorkTime;
    LT.isWorkTime = shopOpen;
    var html = xml("EXTERIOR");
    LT.isWorkTime = prev;
    return html;
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_VICKYS_SHOP",
    ui: "dialogue",
    title: "Arcane Arts (Exterior)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureVicky === "function") LT.ensureVicky();
    },
    getContent: parseExterior,
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!shopOpen()) {
        list.push(
          new LT.Response("Enter", "Arcane Arts is currently closed. You'll have to come back later if you want to do some shopping here.", null).disable(
            "Arcane Arts is currently closed. Opening hours are 09:00–17:00.",
          ),
        );
      } else {
        list.push(new LT.Response("Enter", "Step inside Arcane Arts.", "vicky.shop"));
      }
      return list;
    },
  });

  LT.defineNode({
    id: "vicky.shop",
    ui: "dialogue",
    title: "Arcane Arts",
    secondsPassed: 120,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureVicky === "function") LT.ensureVicky();
    },
    getContent: function () {
      return xml("SHOP_WEAPONS");
    },
    getResponses: function () {
      return [
        new LT.Response("Leave", "Leave Arcane Arts and head back out into the arcade.", "place.SHOPPING_ARCADE_VICKYS_SHOP", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Weapons", "Walk over to the counter and see what weapons Vicky has in stock.", "vicky.weapons", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Potions & Spells", "See what spell books Vicky has in stock.", "vicky.spells", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Transformations", "See what transformative drinks Vicky has behind the counter.", "vicky.tf", function () {
          if (LT.game.flags) LT.game.flags.vickyIntroduced = true;
        }),
        new LT.Response("Clothing", "Vicky doesn't have any clothing in stock at the moment.", null).disable("Vicky doesn't have any clothing in stock at the moment."),
      ];
    },
  });

  function stockHtml() {
    var p = LT.game.player;
    var stock = LT.vickyStock();
    var ids = LT.vickyWeaponIds();
    var buy = "";
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var qty = stock[id] || 0;
      if (qty <= 0) continue;
      var type = LT.getWeaponType(id);
      var price = LT.weaponBuyPrice(id);
      buy +=
        '<div class="inv-item" data-vicky-buy="' +
        id +
        '" style="border-color:' +
        (typeof LT.weaponRarityColour === "function" ? LT.weaponRarityColour(type && type.rarity) : "#888") +
        ';"><b>' +
        type.name +
        "</b><br><span class='muted'>£" +
        price +
        " · " +
        qty +
        " in stock · " +
        (type.twoHanded ? "two-handed" : "one-handed") +
        " · " +
        type.damage +
        " dmg</span></div>";
    }
    if (!buy) buy = '<p class="muted">Vicky has no weapons in stock.</p>';
    var sell = "";
    for (var j = 0; j < (p.weapons || []).length; j++) {
      var it = p.weapons[j];
      var sp = LT.weaponSellPrice(it.id);
      sell +=
        '<div class="inv-item" data-vicky-sell="' +
        it.uid +
        '"><b>' +
        it.name +
        "</b><br><span class='muted'>Sell for £" +
        sp +
        "</span></div>";
    }
    if (!sell) sell = '<p class="muted">You have no spare weapons to sell.</p>';
    return (
      "<p>You walk over to the counter. Vicky growls and waits for you to make a decision.</p>" +
      '<p>You have <b style="color:' +
      LT.Colour.MONEY +
      ';">£' +
      (p.money || 0) +
      "</b>.</p>" +
      '<div class="inv-wrap"><div class="inv-col"><h6>For sale</h6><div class="inv-grid pile">' +
      buy +
      '</div></div><div class="inv-col"><h6>Sell</h6><div class="inv-grid pile">' +
      sell +
      "</div></div></div>"
    );
  }

  LT.defineNode({
    id: "vicky.weapons",
    ui: "inventory",
    title: "Arcane Arts — Weapons",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: stockHtml,
    getResponses: function () {
      return [new LT.Response("Back", "Step back from the counter.", "vicky.shop")];
    },
  });

  function bookStockHtml() {
    var p = LT.game.player;
    var stock = LT.vickyBookStock();
    var buy = "";
    for (var i = 0; i < LT.SPELL_BOOK_IDS.length; i++) {
      var id = LT.SPELL_BOOK_IDS[i];
      if ((stock[id] || 0) <= 0) continue;
      var spell = LT.SPELLS[id];
      var price = LT.spellBookBuyPrice(id);
      var known = p.knownSpells && p.knownSpells.indexOf(id) >= 0;
      buy +=
        '<div class="inv-item" data-vicky-book="' +
        id +
        '" style="border-color:' +
        LT.Colour.GENERIC_ARCANE +
        ';"><b>Spellbook: ' +
        (spell && spell.name) +
        "</b><br><span class='muted'>£" +
        price +
        (known ? " · already known" : "") +
        " · 1 in stock</span></div>";
    }
    if (!buy) buy = '<p class="muted">Vicky has no spell books in stock today.</p>';
    return (
      "<p>Vicky's spell books are stacked behind the counter. She'll sell you one if you can pay.</p>" +
      '<p>You have <b style="color:' +
      LT.Colour.MONEY +
      ';">£' +
      (p.money || 0) +
      "</b>.</p>" +
      '<div class="inv-wrap"><div class="inv-col"><h6>Spell books</h6><div class="inv-grid pile">' +
      buy +
      "</div></div></div>"
    );
  }

  LT.defineNode({
    id: "vicky.spells",
    ui: "inventory",
    title: "Arcane Arts — Spell books",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: bookStockHtml,
    getResponses: function () {
      return [new LT.Response("Back", "Step back from the counter.", "vicky.shop")];
    },
  });

  document.addEventListener("click", function (e) {
    if (LT.game.currentNode && LT.game.currentNode.id === "vicky.spells") {
      var bookBtn = e.target.closest("[data-vicky-book]");
      if (!bookBtn) return;
      var sid = bookBtn.getAttribute("data-vicky-book");
      var stock = LT.vickyBookStock();
      var price = LT.spellBookBuyPrice(sid);
      var p = LT.game.player;
      if ((stock[sid] || 0) <= 0 || (p.money || 0) < price) return;
      var book = LT.makeSpellBook(sid);
      if (!book) return;
      p.money -= price;
      p.items = p.items || [];
      p.items.push(book);
      stock[sid] -= 1;
      LT.game.setContent("vicky.spells");
      return;
    }
    if (!LT.game.currentNode || LT.game.currentNode.id !== "vicky.weapons") return;
    var p = LT.game.player;
    if (!p) return;
    var buy = e.target.closest("[data-vicky-buy]");
    if (buy) {
      var id = buy.getAttribute("data-vicky-buy");
      var stock = LT.vickyStock();
      var price = LT.weaponBuyPrice(id);
      if ((stock[id] || 0) <= 0) return;
      if ((p.money || 0) < price) return;
      var made = LT.makeWeapon(id);
      if (!made) return;
      p.money -= price;
      p.weapons = p.weapons || [];
      p.weapons.push(made);
      stock[id] -= 1;
      LT.game.setContent("vicky.weapons");
      return;
    }
    var sell = e.target.closest("[data-vicky-sell]");
    if (sell) {
      var uid = sell.getAttribute("data-vicky-sell");
      var idx = -1;
      for (var i = 0; i < (p.weapons || []).length; i++) if (p.weapons[i].uid === uid) idx = i;
      if (idx < 0) return;
      var item = p.weapons[idx];
      p.money = (p.money || 0) + LT.weaponSellPrice(item.id);
      p.weapons.splice(idx, 1);
      LT.game.setContent("vicky.weapons");
    }
  });

  function ralphOpen() {
    return typeof LT.isWorkTime === "function" && LT.isWorkTime();
  }

  function ralphSpeech(text) {
    return '<span class="speech" style="color:' + (LT.Colour.MASCULINE || "#6fa8dc") + ';">"' + text + '"</span>';
  }

  function pcSpeech(text) {
    var col = LT.game.player && LT.game.player.getSpeechColour ? LT.game.player.getSpeechColour() : LT.Colour.FEMININE;
    return '<span class="speech" style="color:' + col + ';">"' + text + '"</span>';
  }

  LT.ralphDiscount = function () {
    return (LT.game.flags && LT.game.flags.ralphDiscount) || 0;
  };

  LT.ralphDiscountActive = function () {
    if (!LT.ralphDiscount()) return false;
    var start = (LT.game.flags && LT.game.flags.ralphDiscountTimer) || 0;
    return ((LT.game.secondsPassed || 0) - start) < 4320 * 60;
  };

  LT.resetRalphDiscountCheck = function () {
    if (!LT.ralphDiscountActive()) {
      LT.game.flags = LT.game.flags || {};
      LT.game.flags.ralphDiscount = 0;
    }
  };

  LT.applyRalphDiscount = function (percent) {
    LT.game.flags = LT.game.flags || {};
    LT.game.flags.ralphDiscount = percent;
    LT.game.flags.ralphDiscountTimer = LT.game.secondsPassed || 0;
    return (
      "<p><b>You have earned a</b> <b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>" +
      percent +
      "%</b> <b>discount for the next three days!</b></p>"
    );
  };

  function ralphInteriorHtml() {
    var flags = LT.game.flags || {};
    var html;
    if (!flags.ralphIntroduced) {
      html =
        "<p>You push the door open and step inside, looking up as a little bell rings to announce your arrival. " +
        ralphSpeech("Hey there! If you need any help, just ask!") +
        " a horse-boy shouts to you from behind the counter.</p>" +
        "<p>You thank the horse-boy, who you assume to be Ralph, and start to have a look around his shop. Most of the goods aren't anything special, and are just the typical sorts of food and drink that you could pick up almost anywhere. What sets this shop apart, however, is a special display of arcane-imbued consumables. The prices aren't listed, and instead, a little label reads 'Please ask Ralph for assistance with these items'.</p>";
    } else {
      var greet = flags.ralphDiscountTimer
        ? ralphSpeech("Ah, well if it isn't my favourite regular! If you need any help, you know how to ask!")
        : ralphSpeech("Hello again! If you need any help, just ask!");
      html =
        "<p>You make your way over, once again, to the only place in the shopping arcade that sells food to go. From the outside, it looks like an old-fashioned sweet shop, with large glass windows displaying all manner of exotic-looking food and drink. The words 'Ralph's Snacks' are painted in gold cursive letters above the entrance, and as you push the door open and step inside, a little bell rings to announce your arrival.</p>" +
        "<p>" +
        greet +
        " the familiar horse-boy shouts to you from behind the counter.</p>" +
        "<p>You thank Ralph, and start to have a look around his shop. Most of the goods aren't anything special, and are just the typical sorts of food and drink that you could pick up anywhere. What sets this shop apart, however, is a special display of arcane-imbued consumables. The prices aren't listed, and instead, a little label reads 'Please ask Ralph for assistance with these items'.</p>";
    }
    if (LT.ralphDiscountActive()) {
      html +=
        "<p><b>Ralph is giving you a</b> <b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>" +
        LT.ralphDiscount() +
        "%</b> <b>discount!</b></p>";
    }
    return html;
  }

  function ralphDiscountAskHtml() {
    var repeat = !!(LT.game.flags && LT.game.flags.ralphDiscountTimer);
    if (repeat) {
      return (
        "<p>Glancing over to the other side of the shop, you see Ralph giving you a cheerful wave from behind the counter. Images of his massive equine cock flash across your mind, and you let out a tiny moan as you remember it sliding deep down your throat... His wide, flared head ramming its way past your lips... And the taste of his salty precum as saliva drools from your mouth...</p>" +
        "<p>A familiar voice suddenly snaps you out of your daydream, " +
        ralphSpeech("Hey, are you alright?") +
        "</p>" +
        "<p>You were so engrossed in your fantasy that you didn't notice Ralph walking up to you, and, having been caught completely off-guard, you blurt out a reply in the affirmative. As you turn to face the muscular horse-boy, you notice that his eyes have started to roam up and down your body, and you get the feeling that he knows exactly what you were imagining. Glancing down, you see a distinctive bulge forming between his legs, but before you can react to the sight of Ralph's growing erection, he steps forwards, pinning you back against the wall.</p>" +
        "<p>" +
        ralphSpeech("Fancy another taste?") +
        " he slyly asks, before grinning deviously at you and leaning in a little closer. As you feel his hot breath on your face, the horse-boy continues, " +
        ralphSpeech("Let me blow a load down that pretty little throat of yours, and I'll give you twenty-five percent off everything I have in stock for a few days.") +
        "</p>" +
        "<p>As Ralph steps forwards and presses his hot body against yours, you struggle to get the image of his massive, throbbing black horse-cock out of your mind, and as the tent in his trousers comes into contact with your leg, you blurt out your reply.</p>"
      );
    }
    return (
      "<p>You get the feeling that the price of many of these items is inflated past what would be considered a fair markup. Glancing over to the other side of the shop, you see Ralph giving you a cheerful wave from behind the counter. Encouraged by his disarming smile and friendly face, you decide to ask him if there's any way you can get a discount on some of these transformative items, and start to walk over to him.</p>" +
      "<p>As he sees you approaching, Ralph calls out to you, " +
      ralphSpeech("Hello! Is there anything I can help you with?") +
      "</p>" +
      "<p>" +
      pcSpeech("Hi there, I was wondering if you could show me the prices of some of these items,") +
      " you reply.</p>" +
      "<p>Ralph cheerfully leads you back over to the special display, and as he informs you of some of the prices, your suspicions prove to be correct. While some of the items are a reasonable price, the more exotic foodstuffs are quite expensive. Looking across at the friendly shopkeeper, you ask him if there's any way he'd drop the prices a little.</p>" +
      "<p>" +
      ralphSpeech("Hmm,") +
      " he says, glancing over at you, " +
      ralphSpeech("I suppose we could work something out...") +
      "</p>" +
      "<p>You notice that his smile has suddenly lost its friendly appearance, and as his eyes roam up and down your body, you get the feeling that this horse-boy is having some dirty thoughts. Glancing down, you see a distinctive bulge forming between his legs, but before you can react to the sight of Ralph's growing erection, he steps forwards, pinning you back against the wall.</p>" +
      "<p>" +
      ralphSpeech("Fancy another taste?") +
      " he slyly asks, before grinning deviously at you and leaning in a little closer. As you feel his hot breath on your face, the horse-boy continues, " +
      ralphSpeech("Let me blow a load down that pretty little throat of yours, and I'll give you twenty-five percent off everything I have in stock for a few days.") +
      "</p>" +
      "<p>As Ralph steps forwards and presses his hot body against yours, you struggle to get the image of his massive, throbbing black horse-cock out of your mind, and as the tent in his trousers comes into contact with your leg, you blurt out your reply.</p>"
    );
  }

  function ralphAgreeHtml() {
    return (
      "<p>" +
      pcSpeech("Ok, I'll do it,") +
      " you say, looking up at Ralph to see his smile grow even wider.</p>" +
      "<p>He leans in, and you half-expect him to try and kiss you, but instead, he simply grabs your arm and starts to drag you back to his desk. As he walks, he starts instructing you on what's about to happen.</p>" +
      "<p>" +
      ralphSpeech("You're going to kneel under my desk over here, and I don't expect to have to do any of the work, understood?") +
      " he asks, and as you answer in the affirmative, he continues, " +
      ralphSpeech("This is a respectable shop, so if anyone comes in, you're to keep quiet! For each customer that hears you, I'm going to knock five percent off our deal.") +
      "</p>" +
      "<p>By this time, Ralph's led you behind the shop's front desk, and you see that there's a hollow space beneath the counter-top, large enough for you to kneel inside quite comfortably. The desk's solid front conceals you from the rest of the shop, and you realise that if you keep quiet, any customers will be completely oblivious as to what's going on. Ralph places his hands on your shoulders, and, feeling that it's too late to back out now, you allow him to push you to your knees. Shuffling back, you occupy the space under his desk, and Ralph steps forwards, bringing the massive bulge in his trousers right up to your face.</p>" +
      "<p>" +
      ralphSpeech("Make sure you give my balls some attention as well,") +
      " you hear him command.</p>" +
      "<p>Just as you're about to answer him, you hear the little bell over the shop's front door ring out, announcing the arrival of a customer. You hear Ralph calling out his friendly greeting, but as he does so, he pushes his hips forwards, making it quite clear that he wants you to get started. There isn't much room for you to move around, and you realise that you're going to be totally restricted to using just your mouth in order to earn your discount.</p>" +
      "<p>As the customer walks off to another part of the shop, Ralph reaches down and unbuttons his trousers. With a quick tug, he pulls them, along with his boxers, down to pool around his ankles. You feel your eyes go wide as you see the gigantic length of Ralph's rapidly-hardening horse-cock rise up to bump against your chin. His huge pair of black-skinned balls droop down loosely at the base of his bestial shaft, and you gulp at the thought of what's about to happen...</p>" +
      "<p><b>There are</b> <b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>no customers</b> <b>near the counter.</b> <b>You will earn a</b> <b style='color:" +
      LT.Colour.GENERIC_GOOD +
      ";'>25%</b> <b>discount.</b></p>"
    );
  }

  LT.defineNode({
    id: "place.SHOPPING_ARCADE_RALPHS_SHOP",
    ui: "dialogue",
    title: "Ralph's Snacks (Exterior)",
    secondsPassed: 0,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureRalph === "function") LT.ensureRalph();
    },
    getContent: function () {
      return LT.parseFromXML("places/dominion/shoppingArcade/ralphsSnacks", "EXTERIOR");
    },
    getResponses: function () {
      var list = LT.travelResponses ? LT.travelResponses() : [null];
      if (!ralphOpen()) {
        list.push(
          new LT.Response("Enter", "Ralph's Snacks is currently closed.", null).disable("Ralph's Snacks is closed. Opening hours are 06:00–22:00."),
        );
      } else {
        list.push(
          new LT.Response("Enter", "Step inside Ralph's Snacks.", "ralph.shop", function () {
            LT.resetRalphDiscountCheck();
          }),
        );
      }
      return list;
    },
  });

  function ralphShopResponses() {
    var list = [
      new LT.Response("Leave", "Leave Ralph's shop.", "place.SHOPPING_ARCADE_RALPHS_SHOP", function () {
        LT.game.flags.ralphIntroduced = true;
        LT.resetRalphDiscountCheck();
      }),
      new LT.Response("Trade with Ralph", "Go and ask Ralph about the special consumables on display.", "ralph.trade", function () {
        LT.game.flags.ralphIntroduced = true;
        LT.resetRalphDiscountCheck();
      }),
    ];
    list.push(
      new LT.Response("Discount", "Ask Ralph if there's anything you can do to get a discount.", "ralph.discount", function () {
        LT.game.flags.ralphIntroduced = true;
        LT.resetRalphDiscountCheck();
        LT.game.flags.ralphDeskHeard = false;
        LT.game.flags.ralphDeskDiscount = 25;
      }),
    );
    return list;
  }

  LT.defineNode({
    id: "ralph.shop",
    ui: "dialogue",
    title: "Ralph's Snacks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      if (typeof LT.ensureRalph === "function") LT.ensureRalph();
      LT.resetRalphDiscountCheck();
    },
    getContent: ralphInteriorHtml,
    getResponses: ralphShopResponses,
  });

  LT.defineNode({
    id: "ralph.trade",
    ui: "dialogue",
    title: "Ralph's Snacks",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.itemShopHtml("ralph", ralphInteriorHtml());
    },
    getResponses: function () {
      var list = LT.itemShopResponses("ralph", "ralph.shop");
      list[0] = new LT.Response("Back", "Finish trading and talk to Ralph again.", "ralph.shop");
      return list;
    },
  });

  LT.defineNode({
    id: "ralph.discount",
    ui: "dialogue",
    title: "Ralph's Snacks",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: ralphDiscountAskHtml,
    getResponses: function () {
      return [
        null,
        new LT.Response("Agree", "Agree to do as Ralph says and suck his cock.", "ralph.desk", function () {
          LT.game.flags.ralphDeskDiscount = 25;
          LT.game.flags.ralphDeskHeard = false;
        }).withColour(LT.Colour.ATTRIBUTE_LUST),
        new LT.Response("Refuse", "Tell him that you're not willing to do that.", "ralph.discountRefuse"),
      ];
    },
  });

  LT.defineNode({
    id: "ralph.discountRefuse",
    ui: "dialogue",
    title: "Ralph's Snacks",
    secondsPassed: 30,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      if (LT.game.flags && LT.game.flags.ralphDiscountTimer) {
        return (
          "<p>" +
          pcSpeech("No thanks,") +
          " you force yourself to say, stepping to one side and moving away from the horny shopkeeper.</p>" +
          "<p>" +
          ralphSpeech("Well, if you get a craving, I'm always ready to satisfy it!") +
          " he laughs, turning around and heading back to his counter, " +
          ralphSpeech("If you need anything else, just let me know.") +
          "</p>" +
          "<p>You go back to browsing the shop's wares, the images of Ralph's massive black horse-cock refusing to budge from your head.</p>"
        );
      }
      return (
        "<p>" +
        pcSpeech("No thanks,") +
        " you say, stepping to one side and moving away from the horny shopkeeper.</p>" +
        "<p>" +
        ralphSpeech("Well, no harm in either of us asking!") +
        " he laughs, turning around and heading back to his counter. " +
        ralphSpeech("If you need anything else, just let me know.") +
        "</p>" +
        "<p>You go back to browsing the shop's wares, but you find it hard to shake the image of Ralph's massive bulge from your head.</p>"
      );
    },
    getResponses: ralphShopResponses,
  });

  LT.defineNode({
    id: "ralph.desk",
    ui: "dialogue",
    title: "Under the desk",
    secondsPassed: 180,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: ralphAgreeHtml,
    getResponses: function () {
      var sex = typeof LT.ResponseSex === "function"
        ? LT.ResponseSex("Get started", "Kneel under Ralph's desk and earn your discount.", {
            partner: LT.ensureRalph(),
            manager: "ralph_desk",
            consensual: true,
            playerDom: false,
            postSexNode: "ralph.afterDesk",
            startText: "<p>You lean forwards and wrap your lips around Ralph's flared equine head, just as another customer starts browsing the nearest aisle...</p>",
          })
        : new LT.Response("Get started", "Kneel under Ralph's desk and earn your discount.", "ralph.afterDesk");
      return [
        null,
        sex,
        new LT.Response("Stay quiet", "Keep quiet while a customer is near the counter. You will keep the full twenty-five percent.", "ralph.deskQuiet", function () {
          LT.game.flags.ralphDeskHeard = false;
          LT.game.flags.ralphDeskDiscount = 25;
        }),
        new LT.Response("Can't stay quiet", "A moan slips out. Ralph knocks five percent off the deal.", "ralph.deskHeard", function () {
          LT.game.flags.ralphDeskHeard = true;
          LT.game.flags.ralphDeskDiscount = 20;
        }),
      ];
    },
  });

  LT.defineNode({
    id: "ralph.deskQuiet",
    ui: "dialogue",
    title: "Under the desk",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return (
        "<p>You clamp your mouth around Ralph's shaft and stay as quiet as you can. The customer pays, thanks Ralph, and leaves without noticing you.</p>" +
        "<p><b>There are</b> <b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>no customers</b> <b>near the counter.</b> <b>You will earn a</b> <b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>25%</b> <b>discount.</b></p>"
      );
    },
    getResponses: function () {
      var sex = typeof LT.ResponseSex === "function"
        ? LT.ResponseSex("Finish him", "Finish earning your discount.", {
            partner: LT.ensureRalph(),
            manager: "ralph_desk",
            consensual: true,
            playerDom: false,
            postSexNode: "ralph.afterDesk",
            startText: "<p>Ralph's hips jerk as you take him as deep as you can.</p>",
          })
        : new LT.Response("Finish him", "Finish earning your discount.", "ralph.afterDesk");
      return [null, sex];
    },
  });

  LT.defineNode({
    id: "ralph.deskHeard",
    ui: "dialogue",
    title: "Under the desk",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return (
        "<p>A wet moan escapes around Ralph's cock. The customer at the counter pauses, then hurriedly pays and leaves. Ralph chuckles and pats your head.</p>" +
        "<p>" +
        ralphSpeech("That's five percent off our deal, like I said.") +
        "</p>" +
        "<p><b>You will now earn a</b> <b style='color:" +
        LT.Colour.GENERIC_GOOD +
        ";'>20%</b> <b>discount.</b></p>"
      );
    },
    getResponses: function () {
      var sex = typeof LT.ResponseSex === "function"
        ? LT.ResponseSex("Finish him", "Finish earning your discount.", {
            partner: LT.ensureRalph(),
            manager: "ralph_desk",
            consensual: true,
            playerDom: false,
            postSexNode: "ralph.afterDesk",
            startText: "<p>Ralph's hips jerk as you take him as deep as you can.</p>",
          })
        : new LT.Response("Finish him", "Finish earning your discount.", "ralph.afterDesk");
      return [null, sex];
    },
  });

  LT.defineNode({
    id: "ralph.afterDesk",
    ui: "dialogue",
    title: "Shopping",
    secondsPassed: 60,
    travelDisabled: true,
    chrome: { left: true, right: true },
    applyPreParsingEffects: function () {
      var pct = (LT.game.flags && LT.game.flags.ralphDeskDiscount) || 25;
      LT.game.textEnd = LT.applyRalphDiscount(pct);
    },
    getContent: function () {
      return "<p>Ralph returns to running his shop, and you walk back over to the transformative consumables section, wondering if you should buy anything with your discount. When he's sure that nobody else is watching, Ralph gazes lustfully at your body, and you're pretty sure that you could convince him to give you another \"discount\" any time you wanted it.</p>";
    },
    getResponses: function () {
      return [null, new LT.Response("Continue", "Carry on browsing the wares in Ralph's shop.", "ralph.shop")];
    },
  });

  LT.defineNode({
    id: "vicky.tf",
    ui: "dialogue",
    title: "Arcane Arts — Transformations",
    secondsPassed: 0,
    travelDisabled: true,
    chrome: { left: true, right: true },
    getContent: function () {
      return LT.itemShopHtml(
        "vicky",
        "<p>Vicky keeps a short row of transformative drinks under the counter, next to the spell books.</p>",
      );
    },
    getResponses: function () {
      return LT.itemShopResponses("vicky", "vicky.shop");
    },
  });
})();
