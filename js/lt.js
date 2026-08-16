window.LT = window.LT || {};

/* Rebuild ship number. Bump only for a public zip, not every work session.
   Last public release was 0.37.1. Java source remains 0.4.10. */
LT.VERSION = "0.38.0";
LT.SOURCE_VERSION = "0.4.10";

LT.isDevMode = function () {
  if (LT.devMode) return true;
  try {
    if (typeof location !== "undefined" && /(?:\?|&)dev=1(?:&|$)/.test(location.search || "")) return true;
    if (typeof localStorage !== "undefined" && localStorage.getItem("lt-devMode") === "1") return true;
  } catch (e) {}
  return false;
};
