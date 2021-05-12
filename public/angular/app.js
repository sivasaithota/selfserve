(function () {
  'use strict';

  angular
  // GLOBAL PLACE FOR CREATING, REGISTERING AND RETRIEVING ANGULAR MODULES
    .module('commonApp', [
      'ngMaterial',
      'ui.router',
      'ngAnimate',
      'toastr',
      'nsPopover',
      'ngPassword',
      'ui.bootstrap',
      'ngFileSaver',
      angularDragula(angular),
      'angular-clipboard',
      'color.picker',
      'ngFileUpload',
      'msl.uploads',
      'perfect_scrollbar',
      'draggableModule',
      'inputDropdown',
      'btford.socket-io',
      'ngCookies',
      'LocalStorageModule',
      'ngProgress',
      'ngSanitize',
    ])
    .config(config)
    .run(run)
    .factory('socket', function ($location, socketFactory) {
      var absUrl = $location.absUrl();
      var appUrl = absUrl.split('/')[3];
      var mainUrl = absUrl.split('/' + appUrl)[0];
      var myIoSocket = io(mainUrl, { path: '/' + appUrl + '/socket.io'});
      var socket = socketFactory({
        ioSocket: myIoSocket
      });
      return socket;
    });

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  config.$inject = ['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider',
    'toastrConfig', '$provide'];
  run.$inject = ['$rootScope', '$state', 'UserService', 'ngProgressFactory'];

  // USE THIS METHOD TO REGISTER WORK WHICH NEEDS TO BE PERFORMED ON MODULE LOADING

  function config($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider,
    toastrConfig, $provide) {
    // if the path doesn't match any of the urls you configured
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/');

    // adding service factory 'TokenInterceptor' that is registered with the $httpProvider
    $httpProvider.interceptors.push('TokenInterceptor');

    // disabling caching GET-requests globally in the $httpProvider
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

    function resolve(page) {
      return {
        auth: ['$q', 'UserService',
          function ($q, UserService) {
            // check user access for current page
            return setUserRoles(UserService)
              .then(function (result) {
                return result
                  ? UserService.getUserInfo().functions[page]
                    ? $q.when()
                    : $q.reject({ accessFunc: false })
                  : $q.reject({ authenticated: false });
              });
          }
        ]
      };
    }

    $stateProvider
    // A LOGIN PAGE
      .state('login', {
        url: '/',
        templateProvider: function ($templateCache) {
          return $templateCache.get('userManagement/login.ejs');
        },
        controller: 'LoginCtrl',
        controllerAs: 'login',
        resolve: {
          auth: ['$q', 'UserService',
            function ($q, UserService) {
              // if the user object is stored in the storage switch to the user's home page
              return setUserRoles(UserService)
                .then(function (userEmail) {
                  return UserService.getUserInfo(userEmail)
                    ? $q.reject({
                        accessFunc: false
                      })
                    : $q.when();
                });
            }
          ]
        }
      })
      .state('inactive', {
        url: '/inactive',
        templateProvider: function ($templateCache) {
          return $templateCache.get('inactive.ejs');
        },
        controller: 'Inactive',
        controllerAs: 'inactive',
      })
      // MAIN ABSTRACT STATE, ALWAYS ON
      .state('base', {
        abstract: true,
        views: {
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('includes/container.ejs');
            },
            controller: 'AppCtrl',
            controllerAs: 'main',
            resolve: {
              helpPageDetails: function (ScenarioSetService) {
                return ScenarioSetService.getSettings({ keys: 'helpPageStatus,helpPageName,locking,details' });
              },
              Tooltips: function (TooltipService) {
                return TooltipService.getTooltips();
              }
            }
          },
          // the child views for scenario list will be defined here (absolutely named)
          'top_bar@base': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('app/breadcrumbs.ejs');
            }
          }
        }
      })
      // Jupyter notebook page
      .state('base.jupyter', {
        url: '/jupyter/:pid',
        views: {
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('jupyter.ejs');
            },
            controller: 'jupyter',
            controllerAs: 'jupyterAs',
            resolve: {
              auth: ['$stateParams', '$q', 'UserService',
                function ($stateParams, $q, UserService) {
                  // check user access for current page
                  var userInfo = UserService.getUserInfo();
                  var isAccessible = UserService.checkAccess($stateParams.projId)
                      && userInfo && userInfo.functions && userInfo.functions.Exec_Debug;
                  if (isAccessible) {
                    return $q.when();
                  } else {
                    return userInfo ? $q.reject({
                      accessFunc: false
                    }) : $q.reject({
                      authenticated: false
                    });
                  }
                }
              ],
            }
          },
        }
      })
      // Help page
      .state('base.help', {
        url: '/help',
        templateProvider: function ($templateCache) {
          return $templateCache.get('helpPage.ejs');
        },
        controller: 'HelpPageCtrl',
        controllerAs: 'pageCtrl'
      })
      // A COMPLEX HOME PAGE
      .state('base.WSProjects', {
        url: '/WSProjects',
        templateProvider: function ($templateCache) {
          return $templateCache.get('wsManagement.ejs');
        },
        controller: 'projectCtrl',
        controllerAs: 'scenario',
        resolve: {
          auth: ['$q', 'UserService',
          function ($q, UserService) {
            // check user access for current page
            return setUserRoles(UserService)
              .then(function (result) {
                return result
                  ? !UserService.getUserInfo().functions['home_page']
                    ? $q.when()
                    : $q.reject({ accessFunc: false })
                  : $q.reject({ authenticated: false });
              });
          }],
          allScenarios: getAllScenarios
        }
      })
      // The top level abstract state for all the scenario pages containing top bar and app version
      .state('base.settings', {
        abstract: true,
        views: {
          // the main template
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settingsContent.ejs');
            },
            controller: 'allSettings',
            controllerAs: 'settings',
            resolve: {
              appSettings: function ($q, ScenarioSetService) {
                var deferred = $q.defer();
                ScenarioSetService.getSettings({ keys: 'version,inputVizType,outputVizType' })
                  .then(function (data) {
                    deferred.resolve(data);
                  });
                return deferred.promise;
              }
            }
          }
        },
        resolve: resolve('Setting')
      })
      // Abstract state for Scenario settings page containing list of Scenario templates and menu
      .state('base.settings.scenario', {
        url: '/settings/:templateID',
        // abstract: true,
        views: {
          // the main template
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/scenario/scenarioSettings.ejs');
            }
          },
          // Scenario templates list
          'templates_list@base.settings.scenario': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/scenario/templatesList.ejs');
            },
            controller: 'templatesList',
            controllerAs: 'tempListCtrl',
            resolve: {
              templates: getTemplates
            }
          },
          // Left menu
          'settings_menu@base.settings.scenario': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/scenario/settingsMenu.ejs');
            },
            controller: 'settingsMenu',
            controllerAs: 'setMenuCtrl'
          }
        }
      })
      // Reports Extract/Authentication Settings page
      .state('base.settings.scenario.report-settings', {
        url: '/report-settings',
        views: {
          // the main template
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/reports/reportSettings.ejs');
            },
            controller: 'TableauSettingsCtrl',
            controllerAs: 'tableauSettingsCtrl',
            resolve: {
              allTableau: getTableau,
              powerReports: powerReports
            }
          },
          // Data validation settings
          'tableau-settings@base.settings.scenario.report-settings': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/reports/tableauSettings.ejs');
            }
          },
          // Action triggers settings
          'powerbi-settings@base.settings.scenario.report-settings': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('settings/reports/powerbiSettings.ejs');
            }
          }
        }
      })
      // Tableau Reports Settings page
      .state('base.settings.scenario.visualization-reports', {
        url: '/visualization-reports',
        templateProvider: function ($templateCache) {
          return $templateCache.get('settings/reports/visualizationReports.ejs');
        },
        controller: 'TableauSettingsCtrl',
        controllerAs: 'tableauSettingsCtrl',
        resolve: {
          allTableau: getTableau,
          powerReports: powerReports
        }
      })
      // Locking Settings page
      .state('base.settings.scenario.common', {
        url: '/common',
        templateProvider: function ($templateCache) {
          return $templateCache.get('settings/scenario/commonSettings.ejs');
        },
        controller: 'CommonSettingsCtrl',
        controllerAs: 'commonSettingsCtrl',
        resolve: {
          tabViews: function ($q, ScenarioSetService, $stateParams) {
            var deferred = $q.defer();
            ScenarioSetService.getTabView({
              templateID: $stateParams.templateID
            })
              .then(function (data) {
                deferred.resolve(data);
              });
            return deferred.promise;
          }
        }
      })
      // Help Content page
      .state('base.settings.scenario.help', {
        url: '/help',
        templateProvider: function ($templateCache) {
          return $templateCache.get('settings/scenario/helpSettings.ejs');
        },
        controller: 'HelpSettingsCtrl',
        controllerAs: 'helpCtrl'
      })
      // User settings
      .state('base.settings.user', {
          url: '/settings/user',
          templateProvider: function ($templateCache) {
              return $templateCache.get('settings/user.ejs');
          },
          controller: 'userSettings',
          controllerAs: 'userset',
          resolve: {
              userRoles: function ($q, UserSetService) {
                  var deferred = $q.defer();
                  UserSetService.userRoles()
                      .then(function (data) {
                          deferred.resolve(data);
                      });
                  return deferred.promise;
              }
          }
      })
      // A CURRENT PROJECT PAGE
      .state('base.project', {
        url: '/project/:projId',
        abstract: true,
        views: {
          // the main template will be placed here (relatively named)
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('workspace.ejs');
            },
            controller: 'workspaceDetails',
            controllerAs: 'work',
            resolve: {
              actions: function (ScenarioSetService) {
                return ScenarioSetService.getActions();
              },
              triggers: function (ScenarioSetService) {
                return ScenarioSetService.getTriggers();
              },
              allScenarios: getAllScenarios
            }
          }
        },
        resolve: {
          auth: ['$stateParams', '$q', 'UserService',
            function ($stateParams, $q, UserService) {
              return setUserRoles(UserService)
              .then(function () {
                // check user access for current page
                if (UserService.checkAccess($stateParams.projId)) {
                  return $q.when();
                } else {
                  return UserService.getUserInfo() ? $q.reject({
                    accessFunc: false
                  }) : $q.reject({
                    authenticated: false
                  });
                }
              });

            }
          ],
          infoScenario: function ($q, ScenarioService, $stateParams, $rootScope) {
            var deferred = $q.defer();
            ScenarioService.getCurrentProject($stateParams.projId)
              .then(function (data) {
                $rootScope.projectDetails = data;
                deferred.resolve(data);
              });
            return deferred.promise;
          },
          resourceCount: function ($q, TableService, $stateParams, UserService) {
            return TableService.getResourceCount($stateParams.projId, UserService.getUserInfo().id);
          }
        },
        params: {
          tab: 'none'
        }
      })
      .state('base.project.inputs', {
        url: '/inputs',
        templateProvider: function ($templateCache) {
          return $templateCache.get('app/table.ejs');
        },
        controller: 'tabCtrl',
        controllerAs: 'tabAs',
        resolve: {
          uploadedTables: function ($q, TableService, $stateParams, UserService) {
            var deferred = $q.defer();
            TableService.getTables('input', $stateParams.projId, UserService.getUserInfo().id)
              .then(function (data) {
                deferred.resolve(data);
              });
            return deferred.promise;
          },
          typeTab: function () {
            return 'input';
          }
        }
      })
      .state('base.project.outputs', {
        url: '/outputs',
        templateProvider: function ($templateCache) {
          return $templateCache.get('app/table.ejs');
        },
        controller: 'tabCtrl',
        controllerAs: 'tabAs',
        resolve: {
          uploadedTables: function ($q, TableService, $stateParams, UserService) {
            var deferred = $q.defer();
            TableService.getTables('output', $stateParams.projId, UserService.getUserInfo().id)
              .then(function (data) {
                deferred.resolve(data);
              });
            return deferred.promise;
          },
          typeTab: function () {
            return 'output';
          }
        }
      })
      .state('base.project.parameters', {
        url: '/parameters',
        views: {
          '': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('app/parameters.ejs');
            },
            controller: 'parameters',
            controllerAs: 'paramAs'
          },
          'execution@base.project.parameters': {
            templateProvider: function ($templateCache) {
              return $templateCache.get('app/execution.ejs');
            }
          }
        }
      });

    // SETTINGS COLORS FOR ANGULAR MATERIAL
    $mdThemingProvider.definePalette('opexBlue', {
      '50': 'DDF1F8',
      '100': 'AFDEEE',
      '200': '7FCBE5',
      '300': '4BB6DA',
      '400': '25A7D2',
      '500': '009688',
      '600': 'FF4081',
      '700': '007CA5',
      '800': '01A69C',
      '900': '00506A',
      'A100': 'ff8a80',
      'A200': 'ff5252',
      'A400': 'ff1744',
      'A700': 'd50000',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
      'contrastLightColors': undefined
    });
    $mdThemingProvider
      .theme('default')
      .primaryPalette('opexBlue');

    var opLGreyMap = $mdThemingProvider.extendPalette('grey', {
      '500': 'ebebeb'
    });
    $mdThemingProvider.definePalette('opLGrey', opLGreyMap);
    $mdThemingProvider.theme('lgTheme')
      .primaryPalette('opLGrey');

    // SETTINGS STYLES FOR POPUP MESSAGES
    angular.extend(toastrConfig, {
      allowHtml: true,
      closeButton: true,
      tapToDismiss: false,
      preventOpenDuplicates: true,
      extendedTimeOut: 5000,
      iconClasses: {
        error: 'toast-error',
        success: 'toast-success'
      },
    });

    $provide.decorator('ColorPickerOptions', function ($delegate) {
      var options = angular.copy($delegate);
      options.alpha = false;
      options.format = 'hex';
      options.swatchOnly = true;
      return options;
    });
  }

  // Common functions for dependency injection
  function getAllScenarios ($q, ScenarioService) {
    var deferred = $q.defer();
    ScenarioService.getAllScenarios()
      .then(function (data) {
        deferred.resolve(data);
      });
    return deferred.promise;
  }

  function getTemplates ($q, TemplateService) {
    var deferred = $q.defer();
    TemplateService.getTemplates()
      .then(function (data) {
        deferred.resolve(data);
      });
    return deferred.promise;
  }

  function getTableau ($q, TableauService, $stateParams) {
    var deferred = $q.defer();
    TableauService.getAllTableau({
      templateID: $stateParams.templateID,
    })
        .then(function (data) {
          deferred.resolve(data);
        }, function (err) {
          deferred.reject(err);
        });
    return deferred.promise;
  }

  function powerReports ($q, PowerBiService, $stateParams) {
    var deferred = $q.defer();
    PowerBiService.getReports({
      templateID: $stateParams.templateID
    })
      .then(function (data) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  }

  // USE THIS METHOD TO REGISTER WORK WHICH SHOULD BE PERFORMED WHEN THE INJECTOR IS DONE LOADING ALL MODULES
  function run($rootScope, $state, UserService, ngProgressFactory) {
    $rootScope.progressBar = ngProgressFactory.createInstance();
    // SET STATE OBJECT TO GLOBAL VARIABLE
    $rootScope.$state = $state;
    // SET infoPage OBJECT TO GLOBAL VARIABLE before routing
    $rootScope.infoPage = {};
    // CHECK ACCESS AT THE TRANSITION TO THE PAGE
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {
      var cookieObject = UserService.getUserInfo();
      // SET USER OBJECT FROM STORAGE TO GLOBAL VARIABLE
      if (cookieObject) $rootScope.currentUser = cookieObject;
      $rootScope.progressBar.complete();
    });
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      var cookieObject = UserService.getUserInfo();
      if (error && error.authenticated === false) {
        $state.go('login');
      }
      if (error && error.accessFunc === false) {
        var scenarioId = cookieObject && cookieObject.scenarios;
        // $state.go(cookieObject.home_page, scenarioId ? {
        $state.go(cookieObject ? cookieObject.home_page : 'login', scenarioId ? {
          projId: scenarioId
        } : {});
      }
      $rootScope.progressBar.reset();
    });

    $rootScope.$on('$stateChangeStart', function(event){
      $rootScope.progressBar.start();
    });

  }

  // SETS USER ROLES IN LOCAL STORAGE
  function setUserRoles(UserService) {
    var authEmail;
    return UserService.checkAuth()
      .then(function (userEmail) {
        authEmail = userEmail;
        return UserService.getUserInfo()
      })
      .then(function (user) {
        if (user && user.username === authEmail) {
          return user;
        } else {
          return UserService.getUserRole(authEmail);
        }
      })
      .catch(function(error){
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      });
  }

})();
