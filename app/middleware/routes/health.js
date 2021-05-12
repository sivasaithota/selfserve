var express = require('express'),
  healthRouter = express.Router();

var healthController = require('../../controllers/health').getInstance();

module.exports = function () {
  healthRouter.get('/', healthController.getHealth);
  return healthRouter;
};
