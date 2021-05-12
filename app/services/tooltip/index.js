var tooltips = require('./tooltip.json');
var Tooltip = function () {};

var _instance;
/*****
Function to retrieve the tooltips for pages.
*****/

Tooltip.prototype.getTooltips = function () {
  return tooltips;
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Tooltip();
    }
    return _instance;
  }
};