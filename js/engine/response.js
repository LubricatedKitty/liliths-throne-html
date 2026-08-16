LT.Response = function (title, tooltipText, nextDialogue, effects) {
  this.title = title;
  this.tooltipText = tooltipText || "";
  this.nextDialogue = nextDialogue || null;
  this.effects = effects || null;
  this.disabled = false;
  this.colour = null;
  this.secondsPassed = null;
  this.sexStub = false;
};

LT.Response.prototype.disable = function (reason) {
  this.disabled = true;
  if (reason) this.tooltipText = reason;
  return this;
};

LT.Response.prototype.withColour = function (hex) {
  this.colour = hex;
  return this;
};

LT.Response.prototype.withTime = function (seconds) {
  this.secondsPassed = seconds;
  return this;
};

LT.effectsOnly = function (title, tooltipText, effects) {
  return new LT.Response(title, tooltipText, null, effects);
};
