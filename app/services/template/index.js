var dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper');

var _instance;

var Template = function () {};

Template.prototype.getTemplates = function (appId) {
  return dataAccess.executeQuery(appId, queryHelper.getTemplates)
    .then(function (result) {
      return result && result.rows ? result.rows : [];
    });
};

module.exports = {
  getInstance: function () {
    if (!_instance) {
      _instance = new Template();
    }
    return _instance;
  }
};
