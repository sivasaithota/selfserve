'use strict';

var express = require('express'),
  path = require('path'),
  router = express.Router();
 
var commonMiddleware = require('../common');
var UserRouter = require('./user'),
  ScenarioRouter = require('./scenario'),
  SettingRouter = require('./setting'),
  TooltipRouter = require('./tooltip'),
  ExecutionRouter = require('./execution'),
  TableauRouter = require('./tableau'),
  HealthRouter = require('./health'),
  BomRouter = require('./bom'),
  LockingRouter = require('./locking'),
  TemplateRouter = require('./template'),
  ArchivingRouter = require('./archiving'),
  MacroRouter = require('./macro'),
  PowerBiRouter = require('./powerbi'),
  ThemesRouter = require('./themes'),
  ActionsRouter = require('./actions');

var MultiPartParser = require('../parser/multiPartParser'),
  Auth = require('../auth'),
  AccessManager = require('../accessManager'),
  Archiving = require('../archiving'),
  keycloak = require('../keycloak');

module.exports = function () {
  var multiPartParser = new MultiPartParser(),
    auth = new Auth(),
    accessManager = new AccessManager(),
    archiving = new Archiving();

  var userRouter = new UserRouter(keycloak, auth, accessManager),
    scenarioRouter = new ScenarioRouter(keycloak, auth, accessManager, multiPartParser, archiving),
    settingRouter = new SettingRouter(keycloak, auth, accessManager, multiPartParser),
    tooltipRouter = new TooltipRouter(),
    executionRouter = new ExecutionRouter(keycloak, auth, accessManager, multiPartParser, archiving),
    tableauRouter = new TableauRouter(keycloak, auth, accessManager),
    healthRouter = new HealthRouter(),
    bomRouter = new BomRouter(keycloak, auth),
    lockingRouter = new LockingRouter(keycloak, auth, accessManager),
    templateRouter = new TemplateRouter(keycloak, auth, accessManager),
    archivingRouter = new ArchivingRouter(keycloak, auth, accessManager),
    macroRouter = new MacroRouter(auth, multiPartParser),
    powerBiRouter = new PowerBiRouter(keycloak, auth),
    actionsRouter = new ActionsRouter(keycloak, auth, accessManager),
    themesRouter = new ThemesRouter();

  router.use(express.static(path.resolve(__dirname, '../../../public/build')));
  router.get('/', function (req, res) {
    res.render('index');
  });
  router.use(keycloak.middleware());
  // Check if app is active
  router.use('/:all', commonMiddleware.isAppActive);
  router.use('/user', userRouter); //Path for all user related actions.
  router.use('/scenario', scenarioRouter); //Path for all scenario related actions.
  router.use('/setting', settingRouter); //Path for all settings related actions.
  router.use('/tooltip', tooltipRouter); //Path for get tooltips.
  router.use('/execution', executionRouter); //Path for all scenario related actions.
  router.use('/tableau', tableauRouter); //Path for all tableau request.
  router.use('/health', healthRouter); //Path for all health request.
  router.use('/bom', bomRouter); //Path for all bom request.
  router.use('/locking', lockingRouter);
  router.use('/template', templateRouter);
  router.use('/archiving', archivingRouter);
  router.use('/macro', macroRouter);
  router.use('/powerbi', powerBiRouter);
  router.use('/themes', themesRouter);
  router.use('/actions', actionsRouter);
  return router;
};
