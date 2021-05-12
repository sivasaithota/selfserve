var Bluebird = require('bluebird');
var path = require('path'),
  util = require('util'),
  constants = require('../../common/constants');

var Transformer = require('../../common/converter'),
  Filer = require('../../common/filer'),
  escapeString = require('../../common/escapeString'),
  logger = require('../../logger'),
  dataAccess = require('../../dataAccess/postgres'),
  queryHelper = require('./queryHelper'),
  Executor = require('../../common/executor'),
  gridFileUpload = require('config').get('fileSystem.gridFileUpload'),
  downloadGridData = require('config').get('fileSystem.downloadGridData'),
  Archive = require('./archive');

var GridManager = function () {

  /********
  countGridQuery is used to fetch record count of the table.
  queryParams contain tablename , scenarioId, filter and query
  _getfilters() method will return the condition to be attached along  with the query based on queryparam
  queryparam.query will contains the fields to be selected
  If query contains "columnName" parameter select count for this particular column.
  ********/

  var countGridQuery = function (queryParams) {
    var countQuery = 'SELECT COUNT(' +
      (!queryParams.columnName ? '1' : ('DISTINCT "' + queryParams.columnName + '"')) +
      ') as totalrows FROM scenario_' + queryParams.scenarioId + '."' + queryParams.tablename + '" ' +
      getFilters(queryParams.filter);
    return countQuery;
  };

  /********
  generateLoadGridQuery is used to generate query for loading the grid data.
  queryParams contains tablename, scenarioid, filters, query, column to be sorted and record limit.
  If query contains "columnName" parameter select unique values for this particular column
  ********/

  var generateLoadGridQuery = function (queryParams) {
    queryParams.visiblecolumns = ('"' + queryParams.visiblecolumns + '"').replace(/,/g, '","');
    var query = 'SELECT ';
    if (!queryParams.columnName) {
      query += '"jqgrid_id",' + (queryParams.metaInfo ? '"op_created_by","op_created_at","op_updated_by","op_updated_at",' : '') + queryParams.visiblecolumns;
    } else {
      query += 'DISTINCT("' + queryParams.columnName + '")';
    }
    query += ' FROM scenario_' + queryParams.scenarioId + '."' + queryParams.tablename + '" ';
    query += getFilters(queryParams.filter);
    if (!queryParams.columnName) {
      query += _getOrderBy(queryParams.sortColumns, queryParams.sort);
    } else {
      query += _getOrderBy(queryParams.columnName, 'asc');
    }
    if (queryParams.limit) {
      query += ' LIMIT ' + queryParams.limit;
      query += ' OFFSET ' + _getCurretPage(queryParams.countRows, queryParams.limit, queryParams.page).start;
    }
    query += ';';
    return query;
  };

  /********
  generateLoadValue prepares the custom object and returns it.
  it returns rows (table records), records count, total records in table and page number
  ********/

  var generateLoadValue = function (rows, count, limit, page) {
    var pageInfo = _getCurretPage(count, limit, page);
    return {
      rows: rows,
      total: pageInfo.total,
      records: count,
      page: page
    };
  };

  /********
  _groupBy are used to groupby on a JavaScript array of objects by keys
  ********/

  var _groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  /********
  getFilters are used to prepare SQL filter condition based on input filters and query
  ********/

  var getFilters = function (filters) {
    var filterQuery = '',
      filterFlag,
      symbolConstants = {
        'eq': '=',
        'ne': '!=',
        'lt': '<',
        'le': '<=',
        'gt': '>',
        'ge': '>=',
        'nu': 'IS NULL',
        'nn': 'IS NOT NULL',
        'in': 'IN',
        'ni': 'NOT IN',
        'cn': 'ILIKE',
        'sw': 'ILIKE',
        'nc': 'NOT ILIKE',
        'bw': '~',
        'bn': '~',
        'ew': '~',
        'en': '~'
      };

    if (filters && (filters.groupOp === 'AND' || filters.groupOp === 'OR') && filters.rules && filters.rules.length > 0) {
      filterQuery = 'WHERE', filterFlag = false;
      var groupedFilter = _groupBy(filters.rules, 'field');
      var groupedFilterZeroKey = Object.keys(groupedFilter)[0];
      for (var key in groupedFilter) {
        var groups = groupedFilter[key];
        // Finding "OR" condition in array of rules
        var orFilters = groups.filter(function (gr) {
          return gr.groupOp;
        });
        if (key !== groupedFilterZeroKey) {
          filterQuery += ' ' + filters.groupOp;
        }
        groups.forEach(function (rule, index) {
          if (rule.field && rule.op) {
            if (!index) {
              filterQuery += (!orFilters.length || (orFilters.length && groups.length == 1)) ? ' (' : ' ((';
            }
            if (!(rule.groupOp && index) && rule.op !== 'sw') {
              filterQuery += '"' + rule.field + '" ' + symbolConstants[rule.op] + _setFilterValue(rule.op, rule.data);
            }
            if (!(rule.groupOp && index) && rule.op === 'sw') {
              filterQuery += 'CAST("' + rule.field + '" AS text) ' + symbolConstants[rule.op] + _setFilterValue(rule.op, rule.data);
            }
            if (orFilters.length && groups.length > 1 && !rule.groupOp) {
              // Concat few rules with "OR" operator
              orFilters.forEach(function (orFilter, fIndex) {
                filterQuery += ' OR "' + orFilter.field + '" ' + symbolConstants[orFilter.op] + _setFilterValue(orFilter.op, orFilter.data);
              });
              if (index < groups.length - 2 && orFilters.length < 2) {
                filterQuery += ') AND (';
              }
            }
            if (index == groups.length - 1) {
              filterQuery += (!orFilters.length || (orFilters.length && groups.length == 1)) ? ' )' : ' ))';
            } else if (!orFilters.length) {
              filterQuery += ' AND ';
            }
            filterFlag = true;
          }
        });
      }

      if (!filterFlag) {
        filterQuery = '';
      }
    }
    return filterQuery;
  };

  /********
  _setFilterValue is a helper method to set filters which is called in _getFilterVale()
  ********/

  var _setFilterValue = function (key, value) {
    value = escapeString([value])[0];
    switch (key) {
      case 'nu':
        return '';
      case 'nn':
        return '';
      case 'in':
        return ' (\'' + value + '\')';
      case 'ni':
        return ' (\'' + value + '\')';
      case 'cn':
        return ' \'%\' || \'' + value + '\' || \'%\'';
      case 'sw':
        return ' \'' + value + '\' || \'%\'';
      case 'nc':
        return ' \'%\' || \'' + value + '\' || \'%\'';
      case 'bw':
        return ' \'^(' + value + ')\'';
      case 'bn':
        return ' \'^(?!' + value + ').*\'';
      case 'ew':
        return ' \'' + value + '$\'';
      case 'en':
        return ' \'.*[^' + value + ']$\'';
      default:
        return ' \'' + value + '\'';
    }
  };

  /********
  _getOrderBy is  a helper method used to generate SQL query for SORT clause based on input columns and sort type
  ********/

  var _getOrderBy = function (sortColumns, sort) {
    var orderQuery = ' ORDER BY ',
      sortArr;
    if (sortColumns && sortColumns !== '' && (sort === 'asc' || sort === 'desc')) {
      sortColumns += ' ' + sort;
      sortArr = sortColumns.split(', ');
      if (sortArr && sortArr.length > 0) {
        for (var i = sortArr.length - 1; i >= 0; i--) {
          var column;
          if (sortArr[i].indexOf(' asc') + 4 === sortArr[i].length) {
            column = '"' + (sortArr[i].replace(/\basc\b/g, '')).trim() + '"' + ' asc,';
          } else if (sortArr[i].indexOf(' desc') + 5 === sortArr[i].length) {
            column = '"' + (sortArr[i].replace(/\bdesc\b/g, '')).trim() + '"' + ' desc,';
          }
          orderQuery += column;
        }
        orderQuery = orderQuery.substring(orderQuery, orderQuery.length - 1);
      }
    } else {
      orderQuery += '"jqgrid_id"';
    }
    return orderQuery;
  };


  /********
  _getCurretPage is  a helper method to get current page number by using below formulae.
  ********/

  var _getCurretPage = function (count, limit, page) {
    var total_pages,
      start;
    total_pages = (count > 0) ? Math.ceil(count / limit) : 0;
    if (page > total_pages) page = total_pages;
    start = limit * page - limit;
    if (start < 0) start = 0;
    return {
      start: start,
      total: total_pages
    }
  };

  /********
  processUploadFile is used to transform input files based on file types and writes the transformed file to the path and return the path.
  Currently we can process csv, xls and xlsx file
  Size of xlsx and xls should not execeed 40mb
  ********/

  var processUploadFile = function (fileObject, appId) {
    var promise,
      executor = new Executor(),
      filer = new Filer(),
      extension = fileObject.file.name.split('.').pop();
    var gridFileUploadPath = util.format(gridFileUpload, appId);
    // Destination file path as /uploads/<app ID>-<scenario ID>-<file name>/
    var destPath = path.resolve(
      __dirname,
      gridFileUploadPath + '/' +
      appId + '-' +
      fileObject.scenarioId + '-' +
      fileObject.file.name.split('/').pop().replace('.' + extension, '.csv')
    );

    // Different operations basing on the file extension
    return new Bluebird(function (resolve, reject) {
        switch (extension.toLowerCase()) {
          case 'xls':
          case 'xlsx':
            logger.info(appId, 'Writing to CSV file.', destPath);
            promise = new Transformer().convertXLSXToCSV(fileObject, destPath);
            break;

          case 'csv':
            // Deleting a folder with a name equal to the file name with extension if exists
            // Quite rare case but sometimes happening
            promise = filer.deleteFolder(destPath).then(function () {
              return filer.copyFile(fileObject.file.path, destPath);
            });
            break;

          case 'zip':
            destPath = path.resolve('/tmp/' + Date.now().toString());
            promise = executor.execute(util.format('unzip -o "%s" -d "%s"', fileObject.file.path, destPath));
            break;
        }

        promise.then(function () {
          resolve(destPath);
        }).catch(function (err) {
          reject(err);
        });
      })
      .catch(function (err) {
        logger.error(appId, 'Error processing uploaded file', err);
        throw err;
      });
  };


  var constructCondition = function (arr, column_name, condition = ' WHERE 1=1 ') {
    arr.forEach((obj) => {
      if (obj.dependent_column_name === column_name) {
        if (obj.value) {
          condition += ` and ${obj.dependent_column_name} = '${obj.value}' `
        }
        if (obj.parent_column_name) {
          condition = constructCondition(arr, obj.parent_column_name, condition);
        }
      }
    })
    return condition;
  }

  /**
   * Function to get parentcoumns of parameter
   */

  var getParameterByDependentColumnName = async function (schemaId, column_name, appId) {
    return dataAccess.executeQuery(appId, util.format(queryHelper.getParameters, schemaId)).then(async function (result) {
      if (result.rowCount !== 0) {
        return constructCondition(result.rows, column_name);
      }
    })
  }


  /*****
  Used to get edit column values from dependent table.
  Query object contains scenarioId, tableName, columnName, type
  *****/

  var getDependencyValues = async function (queryObject, editObject, appId) {
    var query = '';
    if (editObject.custom_sql && editObject.custom_sql.length > 0) { // Execute custom sql if present.
      query = editObject.custom_sql;
    } else {
      var schemaName = !editObject.dependent_schema_name ? 'scenario_' + queryObject.scenarioId : editObject.dependent_schema_name; // Select current schema if schema name is not provided.
      if (editObject.functionType === "parameter") {
        var allCondition = await getParameterByDependentColumnName(queryObject.scenarioId, editObject.parentColumnName, appId)
        query = 'SELECT DISTINCT("' + editObject.dependent_column_name + '") FROM ' + schemaName + '."' + editObject.dependent_table_name + '"' + allCondition + ' ORDER BY 1;';
      } else {
        query = 'SELECT DISTINCT("' + editObject.dependent_column_name + '") FROM ' + schemaName + '."' + editObject.dependent_table_name + '"';
        if (editObject.parentColumnName && queryObject.parentColumnValue && queryObject.parentColumnValue.trim() !== '') {
          query += ' WHERE "' + editObject.parentColumnName + '" = \'' + queryObject.parentColumnValue + '\'';
        }
        query += ' ORDER BY 1;';
      }
    }
    logger.info(appId, 'Executing query to find dependency values...', query);
    return dataAccess.executeQuery(appId, query) // Return result of built query.
      .then(function (result) {
        var resultArray = [];
        if (result && result.rows && result.rows.length > 0) {
          for (var irow in result.rows) {
            var keys = Object.keys(result.rows[irow]);
            if (resultArray.indexOf(result.rows[irow][keys[0]]) === -1) {
              resultArray.push(result.rows[irow][keys[0]]);
            }
          }
        }
        return resultArray;
      });
  };

  var getKeyRow = function (rows, key, value) {
    for (var irow in rows) {
      if (rows[irow][key] === value) {
        return rows[irow];
      }
    }
  };

  /*****
  Used to get id column values after filtering.
  Query object contains scenarioId, tableName, filter
  *****/

  var getGridIdQuery = function (queryParams) {
    var gridIdQuery = 'SELECT ARRAY (SELECT "jqgrid_id" FROM scenario_' + queryParams.scenarioId + '."' + queryParams.tablename + '" ' + getFilters(queryParams.filter) + ' ORDER BY "jqgrid_id");';
    return gridIdQuery;
  };

  var checkIfViewExist = function (viewObject, appId) {
    return dataAccess.executeQuery(appId, util.format(queryHelper.checkIfViewExist, viewObject.scenarioId, viewObject.tablename))
      .then(function (result) {
        return result && result.rows && result.rows.length === 1;
      });
  };

  var createView = function (viewObject, appId) {
    if (viewObject.type.indexOf('view') >= 0) {
      logger.info(appId, 'check if view exist...');
      return checkIfViewExist(viewObject, appId)
        .then(function (exist) {
          if (!exist && viewObject.definition) {
            logger.info(appId, 'creating view...');
            return dataAccess.executeQuery(appId, util.format(queryHelper.createView, viewObject.scenarioId, viewObject.tablename, viewObject.definition));
          } else {
            return;
          }
        });
    } else {
      return Bluebird.resolve();
    }
  };

  /*****
  while uploading, if skip header is set to false, we consider the header row which is basically columns
  So, to get the columns, we use this method. Stream basically read chunks of data
  Once we read first line, we close the stream, don't want to read all the data .
  *****/
  var getFileColumns = function (filePath) {
    return new Bluebird(function (resolve, reject) {
      var stream = new Filer().createReadStream(filePath);
      var columns = '';
      stream.on('data', function (data) {
        var lines = data.toString().split('\n');
        if (lines && lines.length > 0) {
          columns = lines[0].replace(/\r/g, '');
          stream.close();
        } else {
          reject({
            code: constants.httpCodes.conflict,
            message: constants.scenario.columnNotFound
          });
        }
      });
      stream.on('error', function (err) {
        reject(err);
      });
      stream.on('close', function () {
        resolve({
          columns: columns,
          filePath: filePath
        });
      })
    });
  };

  var getColumnsFromTable = function (scenarioId, dataTableName, tableType, appId) {
    var query = `SELECT l."columnlist", l."columnlistwithtypes"
      FROM "lkp_data_upload_tables" l
      INNER JOIN "projects" p
      ON l."version" = p."version"
      AND p."id" = ${scenarioId}
      AND l.scenario_template_id = p.scenario_template_id
      WHERE l."tablename" = '${dataTableName}' AND l."type" = '${tableType}';`;
    return dataAccess.executeQuery(appId, query);
  };

  var downloadTables = function (queryParams, tables, dbConfig, appId) {
    var zipfilename = '';
    var filer = new Filer();
    var downloadPath = '/tmp/' + Date.now().toString();
    zipfilename = queryParams.scenarioId + '-' + tables[0].type + 's.zip';
    var promises = [];

    var promise = Promise.resolve();
    promise = filer.makeDirectory(downloadPath, 0o777);

    return promise
      .then(function () {
        tables.forEach(function (table) {
          if (!queryParams.useDisplayName) table.columnlist = `"${table.columnlist.replace(/,/g, '","')}"`;
          table.columnlist = table.columnlist.replace(/"/g, '\\"');
          queryParams.filterQuery = queryParams.filterQuery ||'';
          queryParams.filterQuery = queryParams.filterQuery.replace(/"/g, '\\"');
          promises.push(downloadTable(downloadPath, queryParams, table, dbConfig));
        });

        return Bluebird.all(promises);
      })
      .then(function (files) {
        return new Archive().download(zipfilename, files, downloadPath);
      });
  };

  var downloadTable = function (downloadPath, queryParams, tableObject, dbConfig) {
    const fileName = queryParams.scenarioId + '-' + tableObject.tablename;
    const filePath = path.resolve(__dirname, downloadPath + '/' + fileName + '.csv');
    return new Filer().deleteFileIfExist(filePath)
      .then(function () {
        var command = util.format(queryHelper.downloadTable, dbConfig.password, dbConfig.serverName,
          dbConfig.port, dbConfig.databaseName, dbConfig.username, tableObject.columnlist, queryParams.scenarioId,
          tableObject.tablename, queryParams.filterQuery, filePath);
        logger.info('Executing file copy command:', command);
        return new Executor().execute(command);
      })
      .then(function () {
        return filePath;
      });
  };

  var copyCSVtoTable = function (dbConfig, uploadObject, fileObject) {
    var [columns] = escapeString([`"${fileObject.columns}"`], {
      backslashSupported: true
    });
    var command = util.format(queryHelper.copyTable, dbConfig.password, dbConfig.serverName, dbConfig.port, dbConfig.databaseName,
      dbConfig.username, uploadObject.scenarioId, uploadObject.dataTableName, columns, fileObject.filePath);
    logger.info('Executing file copy command:', command);
    return new Executor().execute(command)
      .catch(function(err) {
        throw {
          code: constants.httpCodes.internalServerError,
          message: err
        };
      });
  }

  return {
    countGridQuery: countGridQuery,
    generateLoadGridQuery: generateLoadGridQuery,
    generateLoadValue: generateLoadValue,
    getFilters: getFilters,
    processUploadFile: processUploadFile,
    getDependencyValues: getDependencyValues,
    getKeyRow: getKeyRow,
    getGridIdQuery: getGridIdQuery,
    createView: createView,
    getFileColumns: getFileColumns,
    getColumnsFromTable: getColumnsFromTable,
    downloadTables: downloadTables,
    copyCSVtoTable: copyCSVtoTable
  };

};



module.exports = GridManager;
