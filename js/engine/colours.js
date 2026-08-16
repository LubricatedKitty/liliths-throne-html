LT.Colour = {
  BACKGROUND: "#1e1e20",
  BACKGROUND_ALT: "#19191a",
  GENERIC_ARCANE: "#ff6bda",
  GENERIC_GOOD: "#57be7e",
  GENERIC_BAD: "#e36f6f",
  GENERIC_MINOR_BAD: "#e39a6f",
  GENERIC_MINOR_GOOD: "#8dbe57",
  GENERIC_EXCELLENT: "#6fd4e3",
  GENERIC_SEX: "#ff6bda",
  BASE_YELLOW_LIGHT: "#f8e1b9",
  BASE_PINK: "#ff6bda",
  BASE_PINK_LIGHT: "#f5a8ff",
  BASE_PURPLE: "#b98cff",
  BASE_WHITE: "#ffffff",
  BASE_GREY: "#b3b3b3",
  BASE_BLACK: "#777777",
  ATTRIBUTE_HEALTH: "#e36f6f",
  ATTRIBUTE_MANA: "#6f9be3",
  ATTRIBUTE_PHYSIQUE: "#e39a6f",
  ATTRIBUTE_ARCANE: "#c06fe3",
  ATTRIBUTE_CORRUPTION: "#bd0061",
  ATTRIBUTE_AROUSAL: "#ff6bda",
  ATTRIBUTE_LUST: "#e36f9b",
  ATTRIBUTE_EXPERIENCE: "#6fd4e3",
  MONEY: "#e3c66f",
  FEMININE: "#ff6bda",
  MASCULINE: "#6f9be3",
  ANDROGYNOUS: "#b98cff",
};

LT.styleSpan = function (colour, text) {
  return '<span style="color:' + colour + ';">' + text + "</span>";
};
