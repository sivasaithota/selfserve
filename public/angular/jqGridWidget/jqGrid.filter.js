(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FACTORY() METHOD
  angular
    .module('jqGridWidget')
    .filter('editOptionFilter', editOptionFilter)
    .filter('updateOptionFilter', updateOptionFilter)
    .filter('hiddenOpt', hiddenOpt)
    .filter('utc', utc)
    .filter('parseUrl', parseUrl);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  editOptionFilter.$inject = [];
  updateOptionFilter.$inject = [];
  hiddenOpt.$inject = [];
  utc.$inject = [];
  parseUrl.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function editOptionFilter() {
    return function (options) {
      var resultString = [];
      angular.forEach(options, function(option) {
        _.forIn(option, function(value) {
          if (typeof value !== 'undefined' || value !== null) resultString.push(value);
        });
      });
      return _.uniq(resultString);
    };
  }

  function updateOptionFilter() {
    return function (options) {
      return _.map(options, function (val) {
        return '\'' + val + '\'';
      });
    };
  }

  function hiddenOpt() {
    return function (options) {
      var array = [];
      angular.forEach(options, function (opt) {
        if (opt.editable) array.push(opt);
      });
      return array;
    };
  }

  function utc () {
    return function(val){
      var date = new Date(val);
      return new Date(date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds());
    };
  }

  function parseUrl () {
    var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    return function(text) {
      if(text && text.match(urls)) {
        text = text.replace(urls, "<a href=\"$1\" target=\"_blank\">$1</a>")
      }
      if(text && text.match(emails)) {
        text = text.replace(emails, "<a href=\"mailto:$1\">$1</a>")
      }
      return text
    }
  }

})();
