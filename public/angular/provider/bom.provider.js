(function() {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .provider('BOMConfig', BOMConfig);

  BOMConfig.$inject = [];

  function BOMConfig () {
    var SVG_WIDTH = 10000,
      SVG_HEIGHT = 5000,
      SVG_MARGIN = {
        top: 70,
        right: -200,
        bottom: 20,
        left: -200
      },
      MARKER_CLASS_END = '_marker',
      CLASS_TO_HIDE_ELEMENT = 'hidden',
      LINK_CLASS = 'link',
      NODE_CLASS = 'node',
      SPACE_BETWEEN_DEPTH_LEVELS = 400,
      TOP_DIRECTED_LINK_PATH_COORD = 0,
      BOTTOM_DIRECTED_LINK_PATH_COORD = 300,
      MARKER_CSS_STYLES = {
        viewBox: '0 -5 10 10',
        refX: 12,
        refY: 0,
        markerWidth: 6,
        markerHeight: 6,
        orient: 'auto'
      },
      CIRCLE_CSS_STYLES = {
        r: 10,
        fill: '#fff',
        fillOpacity: 1,
        text: {
          dy: '-1em',
          dx: {
            left: '18px',
            right: '-18px'
          }
        }
      },
      ROOT_NAME = 'Root';
    var options = {
      svgWidth: SVG_WIDTH,
      svgHeight: SVG_HEIGHT,
      svgMargin: SVG_MARGIN,
      classes: {
        classToHideElement: CLASS_TO_HIDE_ELEMENT,
        linkClass: LINK_CLASS,
        nodeClass: NODE_CLASS
      },
      spaceBetweenDepthLevels: SPACE_BETWEEN_DEPTH_LEVELS,
      topDirectedLinkPathCoord: TOP_DIRECTED_LINK_PATH_COORD,
      bottomDirectedLinkPathCoord: BOTTOM_DIRECTED_LINK_PATH_COORD,
      markerClassEnd: MARKER_CLASS_END,
      markerCssStyles: MARKER_CSS_STYLES,
      circleCssStyles: CIRCLE_CSS_STYLES,
      rootName: ROOT_NAME
    };

    this.$get = function () {
      return {
        getOptions: function () {
          return options;
        }
      };
    };
  }
})();
