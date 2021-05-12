var express = require('express'),
  tooltipRouter = express.Router();

var tooltipController = require('../../controllers/tooltip').getInstance();

module.exports = function () {
  tooltipRouter.get('/', tooltipController.getTooltips);
  return tooltipRouter;
};
