(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .CONTROLLER() METHOD
  angular
    .module('commonApp')
    .controller('AppCtrl', AppCtrl);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  AppCtrl.$inject = ['Tooltips', '$rootScope', '$state', '$timeout', 'UserService', 'settingsOptions', 'KEYCLOAK_CONFIG',
    'helpPageDetails', 'LockService', 'NavigateService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function AppCtrl (Tooltips, $rootScope, $state, $timeout, UserService, settingsOptions, KEYCLOAK_CONFIG,
                    helpPageDetails, LockService, NavigateService) {
    // represent the binding scope
    var vm = this;
    var menu = settingsOptions.getMenuOptions($rootScope.currentUser);
    vm.currentState = $state;
    vm.progressBar = $rootScope.progressBar;
    vm.minScenarioLength = 2;

    if ($rootScope.currentUser) vm.currentUser = $rootScope.currentUser;
    vm.appDetails = helpPageDetails.details;
    vm.helpPageDetails = helpPageDetails;

    // TOOLTIPS MESSAGES
    vm.homeTooltips = Tooltips.home;
    vm.settingsTooltips = Tooltips.settings;
    vm.scenarioTooltips = Tooltips.scenario;

    // Connection status
    vm.online = window.navigator.onLine;

    // Adding listeners on the online and offline connection statuses
    window.addEventListener('online', function () {
      // Need to wait for the next cycle to update the connection status
      $timeout(function () {
        vm.online = true;
      });
    });
    window.addEventListener('offline', function () {
      // Need to wait for the next cycle to update the connection status
      $timeout(function () {
        vm.online = false;
      });
    });

    var theme = vm.appDetails.theme;
    var colorScheme = theme.colorSchemes[theme.colorIndex];

    // CSS rules basing on the app theme
    // Colors and background image
    var css =
      ':root {' +
        '--main-color: ' + colorScheme.mainColor + ';' +
        '--extra-color: ' + colorScheme.extraColor + ';' +
        '--complimentary-color: ' + colorScheme.complimentaryColor + ';' +
        '--main-color-rgb: ' + hexToRgb(colorScheme.mainColor) + ';' +
        '--extra-color-rgb: ' + hexToRgb(colorScheme.extraColor) + ';' +
        'complimentary-color-rgb: ' + hexToRgb(colorScheme.complimentaryColor) + ';' +
      '}' +
      '.banner { background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), ' +
        'url(/api/v1/themes/' + theme._id + '/images?type=background); }';

    // Custom logo
    if (theme.images.logo) {
      css += '#scenarios .logo { background-image: url(/api/v1/themes/' + theme._id + '/images?type=logo); display: block;}';
    }

    // // Custom icon
    // if (theme.images.icon) {
    //   css += '.sidebar-nav .sidebar-brand a { background-image: url(/api/v1/themes/' + theme._id + '/images?type=icon); }';
    // }

    // // Hiding Powered by logo
    // if (theme.disableFooter) {
    //   css += '.powered-by { display: none; }';
    // }

    // Creating style element and writing CSS to it
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.appendChild(document.createTextNode(css));

    // Converting hex color to rgb integers
    // https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
    function hexToRgb(hex) {
      var c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
      }
    }

    // defining the functions
    vm.logout = logout;
    vm.openSettings = openSettings;
    vm.unlockScenario = unlockScenario;
    vm.getFirstLetters = getFirstLetters;
    vm.viewProject = NavigateService.viewProject;

    // LOG OUT FROM THE CENTER
    function logout () {
      // CALL SERVICE METHOD TO LOG OUT
      UserService.logOut().then(function (result) {
        window.open(KEYCLOAK_CONFIG.logoutUrl+'?redirect_uri='+window.location.href, '_self');
        // $state.go('login');
      });
    }

    function openSettings () {
      var activeSection = _.find(menu, {show: true}),
        url = '';
      if (activeSection) {
        var submenu = _.find(activeSection.options, {show: true});
        if (submenu) {
          url = submenu.ref;
        } else {
          url = 'base.settings.scenario';
        }
      } else {
        url = 'base.settings.scenario';
      }
      $state.go(url, {templateID: 1});
    }

    function unlockScenario (id, project) {
      vm.progressBar.start();
      LockService.removeScenarioLock(id)
        .then(function () {
          project.locking = {};
          vm.progressBar.complete();
        }, function () {
          vm.progressBar.reset();
        });
    }

    function getFirstLetters() {
      var nameSplit = vm.currentUser.fullname.split(' ');
      var secondChar = nameSplit[1] || '';
      return nameSplit[0].charAt(0) + secondChar.charAt(0);
    }

    $rootScope.$on('updateLock', function (ev, data) {
      // Updating when lock settings chenged
      vm.helpPageDetails.locking = data;
    });
  }
})();
