angular.module('inputDropdown', [])
  .directive('inputDropdown', ['DataService', 'tMessages', '$rootScope', '$http', function (DataService, tMessages, $rootScope, $http) {
    var templateString =
      '<div class="input-dropdown">' +
      '<input type="text"' +
      'id="{{inputName}}"' +
      'name="{{inputName}}"' +
      'placeholder="{{inputPlaceholder}}"' +
      'autocomplete="off"' +
      'ng-model="inputValue"' +
      'class="{{inputClassName}}"' +
      'ng-required="inputRequired"' +
      'ng-change="inputChange()"' +
      'ng-focus="inputFocus()"' +
      'ng-blur="inputBlur($event)"' +
      'ng-pattern="inputPattern"' +
      'input-dropdown-validator>' +
      '<ul ng-show="dropdownVisible">' +
      '<li ng-repeat="item in dropdownItems"' +
      'ng-click="selectItem(item, $index)"' +
      'ng-mouseenter="setActive($index)"' +
      'ng-mousedown="dropdownPressed()"' +
      'ng-class="{\'active\': activeItemIndex === $index}"' +
      '>' +
      '<span ng-if="itemProperty">{{item[itemProperty]}}</span>' +
      '<div ng-if="structuredProperty" layout="row" layout-align="start center" class="user-management">' +
        '<div class="tag" layout="row" layout-align="center center" ng-bind="item.email | filterTagName"></div>' +
        '<div layout="column">' +
          '<div class="email">{{ item.email }}</div>' +
        '</div>' +
      '</div>' +
      '<span ng-if="!itemProperty && !structuredProperty">{{item}}</span>' +
      '</li>' +
      '</ul>' +
      '</div>';

    return {
      restrict: 'E',
      scope: {
        defaultDropdownItems: '=',
        dropdownCallbackFn: '&',
        selectedItem: '=',
        allowCustomInput: '=',
        inputRequired: '=',
        inputName: '@',
        inputClassName: '@',
        inputPlaceholder: '@',
        filterListMethod: '&',
        itemSelectedMethod: '&',
        itemProperty: '@',
        displayProperty: '@', // Which property to use as the value if items in the list are objects
        inputPattern: '=',
        dropdownListUrl: '@',
        structuredProperty: '@',
        emitName: '@',
      },
      template: templateString,
      controller: function ($scope) {
        this.getSelectedItem = function () {
          return $scope.selectedItem;
        };
        this.isRequired = function () {
          return $scope.inputRequired;
        };
        this.customInputAllowed = function () {
          return $scope.allowCustomInput;
        };
        this.getInput = function () {
          return $scope.inputValue;
        };
      },
      link: function (scope, element) {
        var pressedDropdown = false;
        var inputScope = element.find('input').isolateScope();
        var scrollValue = 30;

        angular.element(element).siblings().click(function (ev) {
          angular.element(element).find('input').focus();
        });
        scope.activeItemIndex = 0;
        scope.inputValue = '';
        scope.dropdownVisible = false;
        scope.dropdownItems = angular.copy(scope.defaultDropdownItems) || [];

        scope.$watch('defaultDropdownItems', function (newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            scope.dropdownItems = newValue;
            scope.inputValue = '';
            scope.selectedItem = '';
          }
        });

        scope.$watch('dropdownItems', function (newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            // If new dropdownItems were retrieved, reset active item
            if (scope.allowCustomInput) {
              scope.setInputActive();
            } else {
              scope.setActive(0);
            }
          }
        });

        scope.$watch('selectedItem', function (newValue) {
          inputScope.updateInputValidity();
          if (newValue !== null || newValue !== undefined) {
            // Update value in input field to match readableName of selected item
            scope.inputValue = scope.displayProperty ? newValue[scope.displayProperty] : newValue;
          }
        });

        scope.setInputActive = function () {
          scope.setActive(-1);
        };

        scope.setActive = function (itemIndex) {
          scope.activeItemIndex = itemIndex;
        };

        scope.inputChange = function () {
          scope.selectedItem = '';
          showDropdown();
          var newDropdownItems = angular.copy(scope.defaultDropdownItems) || [];
          if (!scope.inputValue) {
            scope.dropdownItems = newDropdownItems;
            return;
          } else if (scope.allowCustomInput) {
            inputScope.updateInputValidity();
          }

          if (scope.filterListMethod) {
            var promise = scope.filterListMethod({
              userInput: scope.inputValue,
              dropdownItems: newDropdownItems
            });
            if (promise) {
              promise.then(function (dropdownItems) {
                scope.dropdownItems = dropdownItems;
              });
            }
          }
        };

        function initFocusVal() {
          if (scope.allowCustomInput) {
            scope.setInputActive();
          } else {
            scope.setActive(0);
          }
          showDropdown();
        }

        scope.inputFocus = function () {
          if (scope.dropdownListUrl) {
            $http.get(scope.dropdownListUrl)
              .success(function (data, status, headers, config) {
                scope.dropdownItems = data;
                scope.defaultDropdownItems = data;
                initFocusVal();
              })
              .error(function (err) {
                DataService.error(err);
              });
          } else {
            initFocusVal();
          }
        };

        scope.inputBlur = function (event) {
          if (pressedDropdown) {
            // Blur event is triggered before click event, which means a click on a dropdown item wont be triggered if we hide the dropdown list here.
            pressedDropdown = false;
            return;
          }
          hideDropdown();
          var selectedIndex;
          if (scope.itemProperty) {
            var itemObject = {};
            itemObject[scope.itemProperty] = scope.inputValue;
            selectedIndex = _.findIndex(scope.defaultDropdownItems, itemObject);
          } else {
            selectedIndex = _.indexOf(scope.defaultDropdownItems, scope.inputValue);
          }
          if (selectedIndex > -1 || scope.allowCustomInput) {
            scope.selectedItem = scope.inputValue;
            if (scope.itemSelectedMethod) {
              var newItem = !scope.allowCustomInput ? scope.defaultDropdownItems[selectedIndex] : scope.inputValue;
              scope.itemSelectedMethod({
                item: newItem
              });
            }
          }
        };

        scope.dropdownPressed = function () {
          pressedDropdown = true;
        };

        scope.selectItem = function (item, index) {
          var oldValue = !angular.isUndefined(scope.selectedItem) ? angular.copy(scope.selectedItem) : '';
          scope.selectedItem = scope.itemProperty ? item[scope.itemProperty] : item;
          hideDropdown();
          scope.dropdownItems.splice(index, 1);
          if (oldValue) {
            scope.dropdownItems.push(oldValue);
          }
          if (scope.itemSelectedMethod) {
            scope.itemSelectedMethod({
              item: item
            });
          }
          if (scope.emitName) $rootScope.$emit(scope.emitName, item);
        };

        var showDropdown = function () {
          scope.dropdownVisible = true;
        };
        var hideDropdown = function () {
          scope.dropdownVisible = false;
        };

        var selectPreviousItem = function () {
          var prevIndex = scope.activeItemIndex - 1;
          var listOfDropDownItems = element.find('ul')[0];
          listOfDropDownItems.scrollTop = listOfDropDownItems.scrollTop - scrollValue;
          if (prevIndex >= 0) {
            scope.setActive(prevIndex);
          } else if (scope.allowCustomInput) {
            scope.setInputActive();
          }
        };

        var selectNextItem = function () {
          var nextIndex = scope.activeItemIndex + 1;
          var listOfDropDownItems = element.find('ul')[0];
          if (nextIndex < scope.dropdownItems.length) {
            scope.setActive(nextIndex);
          }
          if (nextIndex > 0) {
            listOfDropDownItems.scrollTop = listOfDropDownItems.scrollTop + scrollValue;
          }
        };

        var selectActiveItem = function () {
          if (scope.activeItemIndex >= 0 && scope.activeItemIndex < scope.dropdownItems.length) {
            scope.selectItem(scope.dropdownItems[scope.activeItemIndex]);
          }
        };

        element.bind("keydown keypress", function (event) {
          switch (event.which) {
            case 38: //up
              scope.$apply(selectPreviousItem);
              break;
            case 40: //down
              scope.$apply(selectNextItem);
              break;
            case 13: // return
              if (scope.dropdownVisible && scope.dropdownItems && scope.dropdownItems.length > 0 && scope.activeItemIndex !== -1) {
                // only preventDefault when there is a list so that we can submit form with return key after a selection is made
                event.preventDefault();
                event.stopPropagation();
                scope.$apply(selectActiveItem);
              }
              break;
            case 9: // tab
              if (scope.dropdownVisible && scope.dropdownItems && scope.dropdownItems.length > 0 && scope.activeItemIndex !== -1) {
                scope.$apply(selectActiveItem);
              }
              break;
          }
        });
      }
    }
  }]);

angular.module('inputDropdown').directive('inputDropdownValidator', function () {
  return {
    require: ['^inputDropdown', 'ngModel'],
    restrict: 'A',
    scope: {},
    link: function (scope, element, attrs, ctrls) {
      var inputDropdownCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];
      var validatorName = 'itemSelectedValid';

      scope.updateInputValidity = function () {
        var selection = inputDropdownCtrl.getSelectedItem();
        var isValid = false;

        if (!inputDropdownCtrl.isRequired()) {
          // Input isn't required, so it's always valid
          isValid = true;
        } else if (inputDropdownCtrl.customInputAllowed() && inputDropdownCtrl.getInput()) {
          // Custom input is allowed so we just need to make sure the input field isn't empty
          isValid = true;
        } else if (selection) {
          // Input is required and custom input is not allowed, so only validate if an item is selected
          isValid = true;
        }

        ngModelCtrl.$setValidity(validatorName, isValid);
      };
    }
  };
});
