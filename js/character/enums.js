(function () {
  var Colour = LT.Colour;

  LT.Femininity = {
    MASCULINE_STRONG: { id: "MASCULINE_STRONG", name: "Very Masculine", value: 10, colour: Colour.MASCULINE },
    MASCULINE: { id: "MASCULINE", name: "Masculine", value: 30, colour: Colour.MASCULINE },
    ANDROGYNOUS: { id: "ANDROGYNOUS", name: "Androgynous", value: 50, colour: Colour.ANDROGYNOUS },
    FEMININE: { id: "FEMININE", name: "Feminine", value: 70, colour: Colour.FEMININE },
    FEMININE_STRONG: { id: "FEMININE_STRONG", name: "Very Feminine", value: 90, colour: Colour.FEMININE },
  };

  function gender(id, name, hasPenis, hasVagina, hasBreasts, feminine, colour) {
    return { id: id, name: name, hasPenis: hasPenis, hasVagina: hasVagina, hasBreasts: hasBreasts, feminine: feminine, colour: colour };
  }

  LT.Gender = {
    M_P_V_B_HERMAPHRODITE: gender("M_P_V_B_HERMAPHRODITE", "hermaphrodite", true, true, true, false, Colour.MASCULINE),
    M_P_V_HERMAPHRODITE: gender("M_P_V_HERMAPHRODITE", "hermaphrodite", true, true, false, false, Colour.MASCULINE),
    M_P_B_BUSTYBOY: gender("M_P_B_BUSTYBOY", "bustyboy", true, false, true, false, Colour.MASCULINE),
    M_P_MALE: gender("M_P_MALE", "male", true, false, false, false, Colour.MASCULINE),
    M_V_B_BUTCH: gender("M_V_B_BUTCH", "butch", false, true, true, false, Colour.MASCULINE),
    M_V_CUNTBOY: gender("M_V_CUNTBOY", "cuntboy", false, true, false, false, Colour.MASCULINE),
    M_B_MANNEQUIN: gender("M_B_MANNEQUIN", "mannequin", false, false, true, false, Colour.MASCULINE),
    M_MANNEQUIN: gender("M_MANNEQUIN", "mannequin", false, false, false, false, Colour.MASCULINE),
    F_P_V_B_FUTANARI: gender("F_P_V_B_FUTANARI", "futanari", true, true, true, true, Colour.FEMININE),
    F_P_V_FUTANARI: gender("F_P_V_FUTANARI", "futanari", true, true, false, true, Colour.FEMININE),
    F_P_B_SHEMALE: gender("F_P_B_SHEMALE", "shemale", true, false, true, true, Colour.FEMININE),
    F_P_TRAP: gender("F_P_TRAP", "trap", true, false, false, true, Colour.FEMININE),
    F_V_B_FEMALE: gender("F_V_B_FEMALE", "female", false, true, true, true, Colour.FEMININE),
    F_V_FEMALE: gender("F_V_FEMALE", "female", false, true, false, true, Colour.FEMININE),
    F_B_DOLL: gender("F_B_DOLL", "doll", false, false, true, true, Colour.FEMININE),
    F_DOLL: gender("F_DOLL", "doll", false, false, false, true, Colour.FEMININE),
    N_P_V_B_HERMAPHRODITE: gender("N_P_V_B_HERMAPHRODITE", "hermaphrodite", true, true, true, true, Colour.ANDROGYNOUS),
    N_P_V_HERMAPHRODITE: gender("N_P_V_HERMAPHRODITE", "hermaphrodite", true, true, false, true, Colour.ANDROGYNOUS),
    N_P_B_SHEMALE: gender("N_P_B_SHEMALE", "shemale", true, false, true, true, Colour.ANDROGYNOUS),
    N_P_TRAP: gender("N_P_TRAP", "trap", true, false, false, true, Colour.ANDROGYNOUS),
    N_V_B_TOMBOY: gender("N_V_B_TOMBOY", "tomboy", false, true, true, true, Colour.ANDROGYNOUS),
    N_V_TOMBOY: gender("N_V_TOMBOY", "tomboy", false, true, false, true, Colour.ANDROGYNOUS),
    N_B_DOLL: gender("N_B_DOLL", "doll", false, false, true, true, Colour.ANDROGYNOUS),
    N_NEUTER: gender("N_NEUTER", "neuter", false, false, false, true, Colour.ANDROGYNOUS),
  };
  LT.Gender.MALE = LT.Gender.M_P_MALE;
  LT.Gender.FEMALE = LT.Gender.F_V_B_FEMALE;

  LT.Orientation = {
    ANDROPHILIC: { id: "ANDROPHILIC", name: "androphilic", colour: Colour.MASCULINE },
    AMBIPHILIC: { id: "AMBIPHILIC", name: "ambiphilic", colour: Colour.ANDROGYNOUS },
    GYNEPHILIC: { id: "GYNEPHILIC", name: "gynephilic", colour: Colour.FEMININE },
  };

  LT.PERSONALITY = [
    { id: "CONFIDENT", name: "confident", colour: "#b8e36f", exclusive: ["SHY"] },
    { id: "SHY", name: "shy", colour: Colour.BASE_YELLOW_LIGHT, exclusive: ["CONFIDENT"] },
    { id: "KIND", name: "kind", colour: Colour.GENERIC_GOOD, exclusive: ["SELFISH"] },
    { id: "SELFISH", name: "selfish", colour: Colour.GENERIC_BAD, exclusive: ["KIND"] },
    { id: "NAIVE", name: "naive", colour: Colour.BASE_PINK_LIGHT, exclusive: ["CYNICAL"] },
    { id: "CYNICAL", name: "cynical", colour: "#8b3a3a", exclusive: ["NAIVE"] },
    { id: "BRAVE", name: "brave", colour: "#e39a6f", exclusive: ["COWARDLY"] },
    { id: "COWARDLY", name: "cowardly", colour: "#e38d8d", exclusive: ["BRAVE"] },
    { id: "LEWD", name: "lewd", colour: Colour.FEMININE, exclusive: ["PRUDE", "INNOCENT"] },
    { id: "INNOCENT", name: "innocent", colour: "#6f9be3", exclusive: ["LEWD", "PRUDE"] },
    { id: "PRUDE", name: "prude", colour: "#6f8aa0", exclusive: ["LEWD", "INNOCENT"] },
  ];

  LT.MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  LT.femininityFromValue = function (n) {
    if (n < 20) return LT.Femininity.MASCULINE_STRONG;
    if (n < 40) return LT.Femininity.MASCULINE;
    if (n < 60) return LT.Femininity.ANDROGYNOUS;
    if (n < 80) return LT.Femininity.FEMININE;
    return LT.Femininity.FEMININE_STRONG;
  };

  LT.article = function (word) {
    return /^[aeiou]/i.test(word) ? "an" : "a";
  };
})();
