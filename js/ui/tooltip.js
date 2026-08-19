(function () {
  var hideTimer = 0;
  var lastX = 0;
  var lastY = 0;

  function positionTooltip(tip, x, y) {
    var pad = 12;
    var rect = tip.getBoundingClientRect();
    var preferLeft = tip.classList.contains("tip-full-art") || x > window.innerWidth * 0.6;
    var left = preferLeft ? x - rect.width - 16 : x + 18;
    var top = y - 24;
    if (left < pad) left = x + 18;
    if (left + rect.width > window.innerWidth - pad) left = window.innerWidth - rect.width - pad;
    if (top + rect.height > window.innerHeight - pad) top = window.innerHeight - rect.height - pad;
    if (top < pad) top = pad;
    if (left < pad) left = pad;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function repositionLoadedImages(tip) {
    var imgs = tip.querySelectorAll("img");
    var i;
    function place() {
      if (!tip.hidden) positionTooltip(tip, lastX, lastY);
    }
    for (i = 0; i < imgs.length; i++) {
      if (imgs[i].complete) place();
      else imgs[i].addEventListener("load", place);
    }
  }

  LT.showTooltip = function (html, x, y) {
    var tip = document.getElementById("tooltip");
    if (!tip) return;
    clearTimeout(hideTimer);
    lastX = x;
    lastY = y;
    tip.innerHTML = html;
    tip.classList.toggle("tip-full-art", /tip-portrait-full|tip-name-card-full/.test(html));
    tip.classList.toggle("tip-wide", /tip-portrait|tip-name-card/.test(html));
    tip.hidden = false;
    positionTooltip(tip, x, y);
    repositionLoadedImages(tip);
  };

  LT.hideTooltip = function (delay) {
    if (delay == null) delay = 40;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      var tip = document.getElementById("tooltip");
      if (tip) {
        tip.hidden = true;
        tip.classList.remove("tip-wide");
        tip.classList.remove("tip-full-art");
      }
    }, delay);
  };

  LT.bindTooltip = function (el, htmlOrFn) {
    if (!el || el._ltTipBound) return;
    el._ltTipBound = true;
    el.addEventListener("mouseenter", function (e) {
      var html = typeof htmlOrFn === "function" ? htmlOrFn() : htmlOrFn;
      if (html) LT.showTooltip(html, e.clientX, e.clientY);
    });
    el.addEventListener("mousemove", function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      var tip = document.getElementById("tooltip");
      if (tip && !tip.hidden) positionTooltip(tip, e.clientX, e.clientY);
    });
    el.addEventListener("mouseleave", function () {
      LT.hideTooltip();
    });
  };

  LT.bindDeclaredTooltips = function (root) {
    if (!root || typeof LT.bindTooltip !== "function") return;
    var tips = root.querySelectorAll("[data-tip-html], [data-tip-char]");
    var i;
    for (i = 0; i < tips.length; i++) {
      (function (el) {
        LT.bindTooltip(el, function () {
          var id = el.getAttribute("data-tip-char");
          if (id && typeof LT.characterHoverTooltipHtml === "function") {
            return LT.characterHoverTooltipHtml(id, { full: el.hasAttribute("data-tip-full") });
          }
          return el.getAttribute("data-tip-html") || "";
        });
      })(tips[i]);
    }
  };
})();
