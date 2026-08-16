(function () {
  var nodes = {};

  LT.defineNode = function (node) {
    nodes[node.id] = node;
    return node;
  };

  LT.getNode = function (id) {
    var node = nodes[id];
    if (!node) throw new Error("Unknown dialogue node: " + id);
    return node;
  };

  LT.hasNode = function (id) {
    return !!nodes[id];
  };
})();
