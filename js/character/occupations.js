(function () {
  function job(id, name, description, speech, feminineOnly, masculineOnly) {
    return {
      id: id,
      name: name,
      description: description,
      speech: speech,
      feminineOnly: !!feminineOnly,
      masculineOnly: !!masculineOnly,
      colour: "#88b8d4",
    };
  }

  LT.OCCUPATIONS = [
    job("UNEMPLOYED", "unemployed", "You've been out of work for a little while now.", "I'm in-between jobs at the moment, I've actually been thinking about applying to work here at the museum."),
    job("OFFICE_WORKER", "office worker", "You work in a local office, handling paperwork, answering phonecalls and emails, and generally doing a little bit of everything.", "I work in one of the corporate offices in the centre of the city, mostly doing admin and paper work."),
    job("STUDENT", "student", "You're a student at the city's university, but you haven't quite decided what to take as your major just yet.", "I'm a student at the city uni, although I haven't quite decided what to take as my major yet."),
    job("MUSICIAN", "musician", "You're a musician, and as well as being able to play a wide variety of instruments, you are also a very good singer.", "I'm a member of the city orchestra, and I also do private music tutoring."),
    job("TEACHER", "teacher", "You're a teacher, and have been working at a local school for a few years.", "I'm a teacher at a local secondary school, but seeing as it's half-term, I get to take it easy this week."),
    job("WRITER", "writer", "You're a writer, and have been working on your latest novel for the last few months.", "I'm a professional author, and I'm currently waiting to hear back from my publisher about my latest novel."),
    job("CHEF", "chef", "You're the head chef at a local restaurant.", "I'm the head chef at a restaurant just around the corner from here, but I took tonight off so I could attend Lily's presentation."),
    job("CONSTRUCTION_WORKER", "construction worker", "You're an experienced and highly skilled construction worker.", "I'm a construction worker, and I'm currently managing a large project on the outskirts of the city."),
    job("SOLDIER", "soldier", "You're a soldier, and are currently making the most of your leave.", "I'm in the army, I'm on leave for the rest of the week, and then it's back to the barracks for me."),
    job("ATHLETE", "athlete", "You're an athlete, and are currently training for your next big event.", "I'm a professional athlete, and I spend most of my time training for and attending competitions."),
    job("ARISTOCRAT", "aristocrat", "You've never had to work a day in your life, thanks to the fact that you're a member of an old, and exceedingly wealthy, aristocratic family.", "I don't need to concern myself with working. My family estate provides all the income I need, so I spend my time travelling and enjoying life."),
    job("MAID", "maid", "You're a maid, hired by a wealthy family to keep their mansion clean.", "I work as the head maid for a highly influential family here in the city, but I took tonight off so I could attend Lily's presentation.", true, false),
    job("BUTLER", "butler", "You're a butler, hired by a wealthy family to oversee the maids and deal with any visitors.", "I work as the butler for a highly influential family here in the city, but I took tonight off so I could attend Lily's presentation.", false, true),
  ];

  LT.availableOccupations = function (player) {
    var out = [];
    var fem = player.isFeminine();
    for (var i = 0; i < LT.OCCUPATIONS.length; i++) {
      var o = LT.OCCUPATIONS[i];
      if (o.feminineOnly && !fem) continue;
      if (o.masculineOnly && fem) continue;
      out.push(o);
    }
    return out;
  };

  LT.findOccupation = function (id) {
    for (var i = 0; i < LT.OCCUPATIONS.length; i++) if (LT.OCCUPATIONS[i].id === id) return LT.OCCUPATIONS[i];
    return null;
  };
})();
