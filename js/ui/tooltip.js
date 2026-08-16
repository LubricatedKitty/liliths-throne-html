(function () {
  var hideTimer = 0;

  function positionTooltip(tip, x, y) {
    var pad = 16;
    var rect = tip.getBoundingClientRect();
    var left = x + 18;
    var top = y + 18;
    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - 12;
    if (top + rect.height > window.innerHeight - pad) top = y - rect.height - 12;
    tip.style.left = Math.max(pad, left) + "px";
    tip.style.top = Math.max(pad, top) + "px";
  }

  LT.showTooltip = function (html, x, y) {
    var tip = document.getElementById("tooltip");
    if (!tip) return;
    clearTimeout(hideTimer);
    tip.innerHTML = html;
    tip.hidden = false;
    positionTooltip(tip, x, y);
  };

  LT.hideTooltip = function (delay) {
    if (delay == null) delay = 40;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      var tip = document.getElementById("tooltip");
      if (tip) tip.hidden = true;
    }, delay);
  };

  LT.bindTooltip = function (el, htmlOrFn) {
    el.addEventListener("mouseenter", function (e) {
      var html = typeof htmlOrFn === "function" ? htmlOrFn() : htmlOrFn;
      if (html) LT.showTooltip(html, e.clientX, e.clientY);
    });
    el.addEventListener("mousemove", function (e) {
      var tip = document.getElementById("tooltip");
      if (tip && !tip.hidden) positionTooltip(tip, e.clientX, e.clientY);
    });
    el.addEventListener("mouseleave", function () {
      LT.hideTooltip();
    });
  };
})();
