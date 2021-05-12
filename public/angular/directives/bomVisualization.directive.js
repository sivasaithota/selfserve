(function () {
  'use strict';

  // GETTER SYNTAX FOR THE CONTROLLER'S CONSTRUCTOR FUNCTION TO THE MODULE USING THE .DIRECTIVE() METHOD
  angular
    .module('commonApp')
    .directive('bomVisualization', bomVisualization);

  // RETRIEVE OBJECT INSTANCES AS DEFINED BY PROVIDER, INSTANTIATE TYPES, INVOKE METHODS, AND LOAD MODULES FOR CONFIG
  bomVisualization.$inject = ['$window', '$q', 'VisualService', 'ScenarioService', 'BOMConfig', '$timeout', '$rootScope', 'BomService'];

  // A NAMED FUNCTION DEFINITIO AND THE RELEVANT MODULE METHOD
  function bomVisualization($window, $q, VisualService, ScenarioService, BOMConfig, $timeout, $rootScope, BomService) {
    var directive = {
      // restrict provides a way to specify how a directive should be used in HTML
      // 'A' - only matches attribute name
      // 'E' - only matches element name
      // 'C' - only matches class name
      // 'M' - only matches comment
      restrict: 'EA',
      // link option registers DOM listeners as well as updates the DOM
      link: link,
      replace: 'true',
      // bind data to the directive's scope
      scope: {
        scenarioId: '=',
        tabType: '=',
        tabTable: '=',
        labelName: '=',
        bomSettings: '='
      },
      // templateUrlspecifies the HTML markup that will be produced
      // when the directive is compiled and linked by Angular
      templateUrl: 'app/bom-visualization.ejs'
    };

    return directive;

    function link(scope, element, attrs) {
      // scope is an Angular scope object
      // element is the jqLite-wrapped element that this directive matches
      // attrs is a hash object with key-value pairs of normalized attribute names
      // and their corresponding attribute values

      scope.simulateQuery = false;
      scope.numberToDisplay = 20;
      scope.progressBar = $rootScope.progressBar;
      var allCaseName = 'ALL';

      var selectedValue,
        svg,
        selectedNodesNames,
        tooltip;
      var zoom = 1,
        renderOptions = BOMConfig.getOptions(),
        staticElem = document.getElementById('user_icon'),
        styleStaticElem = window.getComputedStyle(staticElem),
        staticColor = VisualService.rgbTohex(styleStaticElem.getPropertyValue('color')),
        exampleElem = document.getElementById('colors_examples'),
        styleExampleElem = window.getComputedStyle(exampleElem),
        extraColor = VisualService.rgbTohex(styleExampleElem.getPropertyValue('color')),
        input = element.find('.new_item input'),
        mdRepeatContainer = element.find('md-virtual-repeat-container'),
        container = element[0].querySelector('.md-virtual-repeat-scroller'),
        mdAutoCompleteSuggestions = element[0].querySelector('.md-autocomplete-suggestions'),
        allCaseName = 'ALL';

      var linksData = [],
        allDaughterElem = [],
        allParentElem = [],
        paths = [],
        nodes = [];

      scope.$watch('tabTable', function (tableName) {
        initBomValues(tableName);
      });

      scope.querySearch        = querySearch;
      scope.selectedItemChange = selectedItemChange;

      // Get list of product items
      function initBomValues (tableName) {
        scope.progressBar.start();
        BomService
          .getBomItems({
            scenarioId: scope.scenarioId,
            tableName: tableName,
            tabType: scope.tabType
          })
          .then(function (result) {
            scope.nodes = result;
            // set all nodes as selected by default
            selectedNodesNames = [];
            for (var index = 0; index < scope.nodes.length; index++) {
              selectedNodesNames.push(scope.nodes[index].node)
            }
            if (!(scope.bomSettings.filters && scope.bomSettings.filters.length)) {
              scope.bomSettings.filters = [{
                label: "node",
                column: "node"
              }]
            }
            // set default selected items for filters
            scope.selectedItems = [];
            scope.selectedItems.length = scope.bomSettings.filters.length;
            scope.selectedItems.fill(allCaseName, 0, scope.selectedItems.length);
            scope.progressBar.complete();
            findInput();
            selectedItemChange();
          }, function () {
            scope.progressBar.reset();
          });
      }

      // Generate nodes for the tree
      function drawNodes(nodes) {
        var i = 0,
          node = svg.selectAll('g.node')
          .data(nodes, function (d) {
            if (!d.id) {
              i += 1;
              d.id = i;
            }
            return d.id;
          });
        return node.enter().append('g')
          .attr('class', function (d) {
            var nodeClasses = renderOptions.classes.nodeClass;
            if (d.class) {
              nodeClasses += ' ' + d.class;
            }
            return nodeClasses;
          })
          .attr('data-index', function (d) {
            return d.index;
          })
          .attr('data-parent-index', function (d) {
            if (d.parent) {
              return d.parent.index;
            }
          })
          .attr('transform', function (d) {
            return 'translate(' + d.y + ',' + d.x + ')';
          })
          .on("mouseover", function(d) {
            tooltip.transition()
              .duration(500)
              .style("opacity", .7);
            tooltip.html(d.tooltipHtml)
              .style("left", d3.event.offsetX + ( (d.children || d._children) ? -180 : 16) + "px")
              .style("top", d3.event.offsetY -16 - (20 * ( Math.round((d.tooltipHtml.match(/<br>/g) || []).length / 2) + 1)) + "px");


          })
          .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
          });
      }

      // Generate paths for the tree
      function drawLinks(links, nodes) {
        var diagonal = d3.svg.diagonal()
          .projection(function (d) {
            return [d.y, d.x];
          }),
          link,
          nodesMap,
          targets,
          maxTargetsCount;
        //Drawing links for one parent
        nodesMap = VisualService.reduceArray(nodes);
        link = svg.selectAll('path.link')
          .data(links, function (d) {
            return d.target.id;
          });

        link.enter().insert('path', 'g')
          .attr('class', function (d) {
            return renderOptions.classes.linkClass + ' ' + d.source.class;
          })
          .attr('stroke', function (d) {
            return d.target.lineColor || staticColor;
          })
          .attr('stroke-width', function (d) {
            return d.target.lineWidth || 2;
          })
          .attr('d', function (d) {
            return diagonal(d);
          });

        var linktext = svg.selectAll("g.link")
          .data(links, function (d) {
            return d.target.id;
          });

        linktext.enter()
          .insert("g")
          .attr("class", function (d) {
            return d.source.class ? d.source.class + ' text' : renderOptions.classes.linkClass + ' text';
          })
          .append("text")
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr('parent-id', function (d) {
            return d.source.product_id;
          })
          .attr('child-id', function (d) {
            return d.target.product_id;
          })
          .text(function (d) {
            return _.find(d.target.parents_id, {
              id: d.source.product_id
            }).arcWeight;
          });

        // Transition link text to their new positions
        linktext.transition()
          .duration(0)
          .attr("transform", function (d) {
            return "translate(" + ((d.source.y + d.target.y) / 2) + "," + ((d.source.x + d.target.x) / 2) + ")";
          });

        maxTargetsCount = 0;
      }

      // Set position parents and children elements in the tree
      function replaceNodeAndChildren(node, root, distance) {
        if (node.children) {
          angular.forEach(node.children, function (child) {
            replaceNodeAndChildren(child, root, distance);
          });
        }
        node.y = (distance + (node.depth - root.depth)) * renderOptions.spaceBetweenDepthLevels;
        node.depth = (distance + (node.depth - root.depth));
      }

      // Find tree depth
      function addFixedDepth(nodes, nodesMap, isBackRelations) {
        angular.forEach(nodes, function (d) {
          if (d.data_targets_id) {
            var targets = d.data_targets_id;
            angular.forEach(targets, function (currentTarget) {
              var target = nodesMap[currentTarget.id],
                source = d;
              if (source.y >= target.y) {
                isBackRelations = true;
                replaceNodeAndChildren(target, target, source.depth + 1);
                target.depth = source.depth + 1;
              }
            });
          }
        });
        if (isBackRelations) {
          isBackRelations = false;
          addFixedDepth(nodes, nodesMap, isBackRelations);
        }
      }

      // Generate new tree
      function renderTree(root, levelWidth) {
        graphContainerResize();
        $window.addEventListener("resize", graphContainerResize);
          d3.select('.graph_content')
            .style({
              position: 'absolute',
              top: 'auto',
              left: 'auto'
            });

        var newHeight = d3.max(levelWidth) * 50;
        var newWidth = (levelWidth.length - 1) * renderOptions.spaceBetweenDepthLevels;
        var margin = renderOptions.svgMargin,
          width = newWidth - margin.right - margin.left,
          tree,
          nodes,
          nodeGroup,
          links,
          nodesMap,
          isBackRelations = false; // Normalize the fixed depth

        tree = d3.layout.tree()
          .size([newHeight, width]);

        d3.select('svg#tree').remove();
        svg = d3.select('.graph_content').append('svg')
          .attr('id', 'tree')
          .attr('width', width + margin.right + margin.left)
          .attr('height', newHeight + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        //Append arrow
        svg.append('svg:defs').selectAll('marker')
          .data([renderOptions.markerClassEnd, renderOptions.markerClassEnd])
          .enter()
          .append('svg:marker')
          .attr('id', "upsale_marker")
          .attr('class', String)
          .attr('viewBox', renderOptions.markerCssStyles.viewBox)
          .attr('refX', renderOptions.markerCssStyles.refX)
          .attr('refY', renderOptions.markerCssStyles.refY)
          .attr('markerWidth', renderOptions.markerCssStyles.markerWidth)
          .attr('markerHeight', renderOptions.markerCssStyles.markerHeight)
          .attr('orient', renderOptions.markerCssStyles.orient)
          .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5');

        // Compute the new tree layout.
        nodes = tree.nodes(root).reverse();

        links = tree.links(nodes);

        nodesMap = VisualService.reduceArray(nodes);

        angular.forEach(nodes, function (d) {
          d.y = d.depth * renderOptions.spaceBetweenDepthLevels;
        });

        angular.forEach(nodes, function (node) {
          if (node.parents_id && node.parents_id.length > 1) {
            angular.forEach(node.parents_id, function (parent) {
              var result = links.find(function (obj) {
                return obj.target.product_id == parent.id;
              });
              var existsLink = links.find(function (obj) {
                return (obj.source.product_id == parent.id && obj.target.product_id == node.product_id);
              });
              if (result && !existsLink) {
                links.push({
                  source: {
                    depth: result.target.depth,
                    id: result.target.id,
                    index: result.target.index,
                    node_name: result.target.name,
                    name: result.target.label,
                    parents_id: result.target.parents_id,
                    product_id: result.target.product_id,
                    x: result.target.x,
                    y: result.target.y
                  },
                  target: {
                    depth: node.depth,
                    id: links.length + 1,
                    index: node.index,
                    node_name: node.name,
                    name: node.label,
                    parents_id: node.parents_id,
                    product_id: node.product_id,
                    x: node.x,
                    y: node.y
                  }
                });
              }
            });
          }
        });

        addFixedDepth(nodes, nodesMap, isBackRelations);

        var arcWeightArr = _.filter(_.map(links, function (l) {
          if (l.source.product_id > 0) {
            return Number(_.find(l.target.parents_id, {
              id: l.source.product_id
            }).arcWeight);
          }
        }));
        arcWeightArr = _.uniq(arcWeightArr).sort(function (a, b) {
          return a - b
        });
        setLineColor(arcWeightArr, links, nodes);

        nodeGroup = drawNodes(nodes);

        nodeGroup.append('circle')
          .attr('r', function (d) {
            if (d.depth === 0) {
              return 16;
            } else {
              return d.radius + 2.5 || 5;
            }
          })
          .attr('class', function (d) {
            return d.class == 'selected-item' ? 'selected-item' : '';
          })
          .attr('stroke-width', function (d) {
            return d.class == 'selected-item' ? 2.5 : '';
          })
          .attr('data-index', function (d) {
            return d.index;
          });

          nodeGroup.append('text')
            .attr('dx', function (d) {
              return (d.children || d._children) ? renderOptions.circleCssStyles.text.dx.right : renderOptions.circleCssStyles.text.dx.left;
            })
            .attr('dy', renderOptions.circleCssStyles.text.dy)
            .attr('text-anchor', function (d) {
              return (d.children || d._children) ? 'end' : 'start';
            })
            .text(function (d) {
              return d.label;
            })
            .style('fill', function (d) {
              return '#000';
            });

        drawLinks(links, nodes);

        renderZoom();
      }

      // Add styles for selected item in the tree
      function setLineColor(arcWeightArr, links, nodes) {
        var allNodesMaxArcWeight = _.max(arcWeightArr);
        var minOpacity = 0.3,
          maxOpacity = 1,
          minLineWidth = 2,
          maxLineWidth = 32;
        var opacityDifference = maxOpacity - minOpacity;
        var lineWidthDifference = maxLineWidth - minLineWidth;
        arcWeightArr.map(function (item, index) {
          angular.forEach(links, function (l) {
            var currentarcWeight = _.find(l.target.parents_id, {
              id: l.source.product_id,
              arcWeight: item.toString()
            });
            if (currentarcWeight) {
              var currentarcWeightNum = parseFloat(currentarcWeight.arcWeight);
              l.target.lineColor = VisualService.hexToRgbA(extraColor, ( (currentarcWeightNum / allNodesMaxArcWeight * opacityDifference) + minOpacity ));
              l.target.lineWidth = (currentarcWeightNum / allNodesMaxArcWeight * lineWidthDifference) + minLineWidth;
            }
            return null;
          });
          angular.forEach(nodes, function (n) {
            if (n.maxArcWeight == item) {
              n.radius = ((n.maxArcWeight / allNodesMaxArcWeight * lineWidthDifference) + minLineWidth) / 2;
            }
          });
          return null;
        });
      }

      // Update zoom after rendering new tree
      function renderZoom() {
        var containerWidth = angular.element('.bom_container').width();
        var containerHeight = angular.element('.bom_container').height();
        var treeWidth = angular.element('#tree').width();
        var treeHeight = angular.element('#tree').height();
        var heightDifference = containerHeight - treeHeight;
        var widthDifference = containerWidth - treeWidth;
        if (heightDifference > 0 && heightDifference < 150) {
          zoom = 1 + (150 - Math.abs(heightDifference)) / 150;
        } else if (heightDifference > 0 && widthDifference > 0) {
          zoom = 1 + (widthDifference - 100) / 1000;
        } else {
          zoom = 1;
        }
        angular.element('#tree').css({
          'zoom': zoom
        });
      }

      // Show new items in the dropdown during the scroll
      function loadMore () {
        if (scope.numberToDisplay + 5 < scope.nodes.length) {
          scope.numberToDisplay += 5;
        } else {
          scope.numberToDisplay = scope.nodes.length;
        }
      }

      // Create filter function for a query string
      function createFilterFor(query, filterIndex) {
        var nodesFilterd = _.cloneDeep(scope.nodes);
        for (var index = 0; index < scope.bomSettings.filters.length; index++) {
          if (index > filterIndex) {
            scope.selectedItems[index] = allCaseName;
          } else if ((index === filterIndex) &&
            query &&
            (query !== '')) {
            nodesFilterd = nodesFilterd.filter(function (node) {
              return node.node && node[scope.bomSettings.filters[index].column].indexOf(query) === 0;
            })
          } else if (scope.selectedItems[index] !== allCaseName &&
            (index !== filterIndex)){
            nodesFilterd = nodesFilterd.filter(function (node) {
              return node[scope.bomSettings.filters[index].column] === scope.selectedItems[index];
            })
          }
        }
        var results = [];
        for (var index = 0; index < nodesFilterd.length; index++) {
          if (nodesFilterd[index][scope.bomSettings.filters[filterIndex].column] !== null) {
            results.push(nodesFilterd[index][scope.bomSettings.filters[filterIndex].column])
          }
        }
        results = _.uniq(results);
        results = results.sort();
        if (!query ||
          (query === '') ||
          (allCaseName.indexOf(query) === 0)) {
          results.unshift(allCaseName);
        }
        return results;
      }

      // Search for bom. Use $timeout to simulate remote data service call.
      function querySearch (query, filterIndex) {
        var results = createFilterFor(query, filterIndex),
          deferred;
        deferred = $q.defer();
        var timeToOut = scope.simulateQuery ? Math.random() * 1000 : 0;
        $timeout(function () {
          deferred.resolve( results );
          }, timeToOut, false
        );
        return deferred.promise;
      }

      function selectedItemChange () {
        for (var index = 0; index < scope.selectedItems.length; index++) {
          if (scope.selectedItems[index] === null ||
            angular.isUndefined(scope.selectedItems[index])) {
            return;
          }
        }
        scope.progressBar.start();
        // here we create initially hidden tooltip
        tooltip = d3.select('.graph_content').append("div")
          .attr("class", "tooltip layout-row")
          .attr("layout", "row")
          .style("opacity", 0);
        var generatedRoot,
          bomItems,
          filteredNodes = scope.nodes
            .filter(function (node) {
              var filterMatch = true;
              for (var index = 0; index < scope.selectedItems.length; index++) {
                if (scope.selectedItems[index] !== allCaseName &&
                  scope.selectedItems[index] !== node[scope.bomSettings.filters[index].column]) {
                  filterMatch = false;
                }
              }
              return filterMatch;
            })
            .map(function (node) {
              return node.node;
            })
        BomService
          .getBomValues({
            scenarioId: scope.scenarioId,
            tableName: scope.tabTable,
            tabType: scope.tabType,
            filteredNodes: filteredNodes
          })
          .then(function (result) {
            bomItems = result;
            bomItems.nodes.push({
              product_id: 0,
              name: renderOptions.rootName,
              class: renderOptions.classes.classToHideElement
            });
            linksData = [{
              'product_id': 0,
              'name': 'Root',
              'class': renderOptions.classes.classToHideElement
            }];
            return VisualService.findNodesWithoutParent(bomItems.path, bomItems.nodes);
          })
          .then(function (nodesWhithoutParents) {
            if (nodesWhithoutParents.length > 1) {
              angular.forEach(nodesWhithoutParents, function (nodeParent) {
                if (nodeParent.name !== 'Root')
                  bomItems.path.unshift({
                    from: nodeParent.name,
                    to: 'Root',
                    arcWeight: 0
                  });
              });
            }
            return VisualService.getLinksData(bomItems.path, linksData, bomItems.nodes, bomItems.selected);
          })
          .then(function (result) {
            linksData = result;
            return VisualService.generateTree(linksData);
          })
          .then(function (result) {
            generatedRoot = result;
            var levelWidth = [1];
            return VisualService.childCount(0, generatedRoot, levelWidth);
          })
          .then(function (result) {
            return renderTree(generatedRoot, result);
          })
          .then(function () {
            scope.progressBar.complete();
          })
          .catch(function () {
            scope.progressBar.reset();
          });
      }

      // Find field for autocomplete form
      function findInput () {
        $timeout(function () {
          input = element.find('.new_item input');
          if(input.length == 0) {
            findInput();
          } else {
            input.addClass('autoCompleteArrow');
            input
              .bind("click", function(e) {
                if (e.currentTarget && e.currentTarget.form && e.currentTarget.form[1]) {
                  e.currentTarget.form[1].click();
                }
              });
          }
        }, 100);
      }

      // change zoom
      angular.element('#zoomIn').click(function (ev) {
        angular.element('#zoomOut').attr('disabled', false);
        if (zoom > 5 && zoom < 10) {
          zoom = zoom + 1;
        } else if (zoom <= 5) {
          zoom = zoom + 0.1;
        } else {
          angular.element('#zoomIn').attr('disabled', true);
        }
        angular.element('#tree').css({
          'zoom': zoom
        });
      });

      angular.element('#zoomOut').click(function (ev) {
        angular.element('#zoomIn').attr('disabled', false);
        if (zoom > 3) {
          zoom += - 1;
        } else if (zoom >= 0.5 && zoom <= 3) {
          zoom += - 0.2;
        } else if (zoom >= 0.1 && zoom <= 0.5) {
          zoom += - 0.05;
        } else {
          angular.element('#zoomOut').attr('disabled', true);
        }
        angular.element('#tree').css({
          'zoom': zoom
        });
      });

      function graphContainerResize() {
        d3.select('.graph-container')
          .style({
            height: ($window.innerHeight - 200 ) + 'px'
          });
      }

      angular.element(container).on('scroll',function(e){
        var scrollableHeight = e.target.scrollHeight;
        var hidden = scrollableHeight - mdRepeatContainer[0].scrollHeight;
        if(hidden - container.scrollTop <= 100) {
          loadMore();
        }
      });
    }
  }

})();
