(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .FILTER() METHOD
  angular
    .module('commonApp')
    .filter('filterByTags', filterByTags)
    .filter('filterTag', filterTag)
    .filter('filterTagName', filterTagName);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  filterByTags.$inject = ['$filter'];
  filterTag.$inject = [];
  filterTagName.$inject = [];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function filterByTags ($filter) {
    return function (items, filter, tags, activeObj) {
      // showActive, showArchived
      var filterObject = {},
        activity = [];
      // View scenario by value of status
      if (activeObj && activeObj.showActive) activity.push('active');
      if (activeObj && activeObj.showArchived) activity.push('archived');
      items = _.filter(items, function(p){
        return _.includes(activity, p.status);
      });
      // Filter by scenario name and tag id
      if (filter.tag || filter.name) {
        var filterByName = {},
          filterByTag = {},
          filteredScenarios = [];
        if (filter.tag) filterByName.tag_id = filter.tag;
        if (filter.name) {
          filterByName.name = filter.name;
          filterByTag.tag_name = filter.name;
          var tagFilter = $filter('filter')(tags, filterByTag);
          angular.forEach(tagFilter, function (tag) {
            var newItem = items.filter(function (el) {
              return el.tag_id === tag.id;
            });
            filteredScenarios = filteredScenarios.concat(newItem);
          });
        }
        var nameFilter = $filter('filter')(items, filterByName);
        return _.uniq(nameFilter.concat(filteredScenarios));
      }
      // Sort scenario
      if (filter.propertyName) {
        return $filter('orderBy')(items, ['status', (filter.reverseVal ? '+' : '-') + filter.propertyName]);
      }
      return $filter('orderBy')(items, ['status', 'order_id']);
    };
  }

  function filterTag () {
    return function (id, filters) {
      if (filters) {
        var currentFilter = filters.find(function (item) {
          return item.id === id;
        });
        return currentFilter && currentFilter.tag_name ? currentFilter.tag_name : '';
      } else {
        return '';
      }
    }
  }

  function filterTagName () {
    return function (name) {
      return name ? name.substring(0,2) : '';
    }
  }
})();
