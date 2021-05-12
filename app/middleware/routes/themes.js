var express = require('express'),
  themesRouter = express.Router();

var themesController = require('../../controllers/themes');

module.exports = function () {
  // Unprotected route for getting app theme data for the keycloak login page
  themesRouter.get('/', themesController().getTheme);

  return themesRouter;
};
