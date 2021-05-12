var Bluebird = require('bluebird'),
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  escapeString = require('../../app/common/escapeString');

var logger = require('../../app/logger'),
  filesystemConfig = require('config').get('fileSystem');

var ACSQLGenerator = function (appConfig, fileConfig, lastId) {
  var user;
  var isRedeploy = lastId !== 0;
  if (appConfig.userInfo) {
    user = appConfig.userInfo.user.username;
  } else {
    user = 'demo@opexanalytics.com';
  }
  if (!appConfig.appSegments) {
    appConfig.appSegments = [{
        "type": "inputs",
        "value": "input data",
        "visible": true,
        "isDefault": true
      },
      {
        "type": "parameters",
        "value": "parameters",
        "visible": true,
        "isDefault": false
      },
      {
        "type": "outputs",
        "value": "output data",
        "visible": true,
        "isDefault": false
      }
    ];
  }

  var createTemplate = ({
    id,
    name
  }, sqlArray) => {
    sqlArray.push(`INSERT INTO "lkp_scenario_templates" ("id","name") VALUES(${id},'${name}') ON CONFLICT DO NOTHING;`);
  }

  var createScenario = function (scenarioName, templateId, sqlArray) {
    logger.info('common', 'Creating scenarios...');
    sqlArray.push(`SELECT create_scenario('${scenarioName}',${templateId},'${user}',1);`);
  };

  /*****
   Function to push query to insert data into insert parameter Table.
   *****/

  var generateInsertParameters = function (template_id, config, sqlArray) {
    logger.info('common', 'Generating insert parameters...');
    var colVal = template_id + ',';
    sqlArray.push('/**** Insert query for lkp_parameters ****/')
    sqlArray.push('CREATE TABLE if not exists lkp_parameters ("id" SERIAL, "scenario_template_id" INTEGER, "type" VARCHAR(255), "validation" VARCHAR(255), "displayname" TEXT, "parameter" VARCHAR(255), "value" TEXT, "dependency_id" INTEGER,"parent_id" INTEGER, "column_name" TEXT , "tooltip" TEXT, "group_name" VARCHAR(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" VARCHAR(255), "updated_by" VARCHAR(255));')
    sqlArray.push('CREATE TABLE IF NOT EXISTS scenario_parent."parameters" ("id" INTEGER NOT NULL, "type" VARCHAR(255), "validation" VARCHAR(255), "displayname" TEXT, "parameter" VARCHAR(255), "value" TEXT, "dependency_id" INTEGER, "parent_id" INTEGER, "column_name" TEXT, "tooltip" TEXT, "group_name" VARCHAR(255), "scenario_id" INTEGER);')
    sqlArray.push('CREATE VIEW "master_parameters" AS SELECT t.*, p.name scenario_name FROM scenario_parent."parameters" t, projects p WHERE p.id = t.scenario_id;');
    sqlArray.push('CREATE VIEW reports."parameters" AS SELECT t.*, p.name scenario_name FROM scenario_parent."parameters" t, projects p WHERE p.id = t.scenario_id;');
    if (config.parameters && config.parameters.length > 0) {
      logger.info('common', 'Parameters found.');
      config.parameters.forEach(function (param) {
        param.parameters.forEach(function (list) {
          var tooltip = list.tooltip ? list.tooltip : '';
          logger.info('common', 'Parameters found without dependency');
          sqlArray.push(util.format('INSERT INTO lkp_parameters ("scenario_template_id", "type","validation","displayname","parameter","tooltip","default_value","dependency_id","group_name","created_by","updated_by") VALUES (%s\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',\'%s\',null,\'%s\',\'%s\',\'%s\');',
            ...escapeString([colVal, list.type, list.validation, list.displayName, list.parameter.toString(), tooltip, list.defaultValue.toString(), param.groupName, user, user])))
        });
      });
    }
  };

  // /*****
  // Function to unescape customsql query.
  // *****/

  var _customSqlUnescape = function (query) {
    return query.split("'").join("$$"); // replaces ' to $$  and even ''  to $$$$ which inturn performs same functionality
  };

  // /*****
  // Function to push query to insert data into dependencylist Table.
  // *****/

  var generateDependencyList = function (template_id, config, tablename, sqlArray) {
    if (config.parameterOptions && config.parameterOptions.length > 0) {

      config.parameterOptions.forEach(function (list) {
        if (tablename == '"lkp_parameters"') {
          var query = 'WITH lkp_dependency_insert as (INSERT into "lkp_dependency_list" ("custom_sql","dependent_schema_name","dependent_table_name","custom_values","dependent_column_name")'
          query += 'VALUES(\'' + _customSqlUnescape(list.dependency.custom_sql) + '\',\'' + list.dependency.dependent_schema + '\',\'' + list.dependency.dependent_table + '\',' + list.dependency.custom_values + '\,\'' + list.dependency.dependent_column + '\') RETURNING id)'
          query += 'UPDATE ' + tablename + ' SET dependency_id = (select id from lkp_dependency_insert),column_name = \'' + list.dependency.parent_column_name + '\' , parent_id = (select id from ' + tablename + ' where group_name = \'' + list.dependency.parent_groupName + '\' and displayname = \'' + list.dependency.parent_displayName + '\' )  where group_name = \'' + list.groupName + '\' and displayname = \'' + list.displayName + '\';'
          logger.info('common', 'Parameters found with dependency Query', query);

        } else {
          var query = 'UPDATE ' + tablename + ' SET dependency_id = (select dependency_id from lkp_parameters where group_name = \'' + list.groupName + '\' and displayname = \'' + list.displayName + '\') ,column_name = \'' + list.dependency.parent_column_name + '\' , parent_id = (select id from ' + tablename + ' where group_name = \'' + list.dependency.parent_groupName + '\' and displayname = \'' + list.dependency.parent_displayName + '\' ) where group_name = \'' + list.groupName + '\' and displayname = \'' + list.displayName + '\';'
        }
        sqlArray.push(query);
      });
    }
  };

  /*****
  Function to push query to insert data into lkp_data_upload_tables
  *****/

  var generateLKPDataUploadTables = function (template_id, dataUploadObject, sqlArray) {
    logger.info('common', 'Generating lkp data upload tables...');
    sqlArray.push('/**** Inserting record into lkp_data_upload_tables ****/');
    logger.info('common', 'Data to insert found.');
    var query = 'INSERT INTO "lkp_data_upload_tables" ' +
      '("scenario_template_id","order_id","tablename","displayname","columnlist","displaylist","columnlistwithtypes",' +
      '"visible","type","unique_key","visiblecolumns","select_query","tag","editablecolumns","columnfloat","version","filter") VALUES (' +
      template_id + ',' + dataUploadObject.index + ',\'' + dataUploadObject.tableName + '\',\'' +
      dataUploadObject.displayName + '\',\'' + dataUploadObject.columnList + '\',\'' +
      JSON.stringify(dataUploadObject.displayList) + '\',\'' + dataUploadObject.columnListWithPlatType + '\',' +
      dataUploadObject.visible + ',\'' + dataUploadObject.type + '\',\'' + dataUploadObject.uniqueColumns + '\',\'' +
      dataUploadObject.visibleColumns + '\',\'' + dataUploadObject.columnSelectQuery + '\',\'' + dataUploadObject.tag + '\',\'' +
      dataUploadObject.editableColumns + '\',\'' + JSON.stringify(dataUploadObject.columnFloat) + '\',' +
      (!lastId ? 1 : '(SELECT MAX ("version") + 1 FROM "projects")') + ', \'' + dataUploadObject.columnFilter + '\');';
    sqlArray.push(query);
  };

  /*****
  Function to push queries to insert in bulk
  *****/

var generateBulkInsert = function (scenario_id, fileName, tableName, columnList, sortedColumnName, type, sqlArray) {
  logger.info('common', 'Queries to insert in bulk.', tableName);
  var filePath = util.format(filesystemConfig.appPath, appConfig.Application_id)  + '/' + type + '/' + fileName;
  if (fs.existsSync(filePath)) {
    sqlArray.push(`\\COPY scenario_${scenario_id}."${tableName}" ("${columnList.replace(/,/g,'","')}") from '${filePath}' WITH CSV HEADER encoding 'windows-1251';`);
    sqlArray.push(`select * from upload_grid_data(${scenario_id}, '${tableName}', '${filePath}', '${user}');`);
  }
};


  var generateRowView = function (template_id, config, sqlArray) {
    if (config.rowView && config.rowView.length > 0) {
      var query = 'INSERT INTO "lkp_row_view" ("tablename", "column_position", "column_order", "scenario_template_id") VALUES ';
      config.rowView.forEach(function (row) {
        if (row && row.columns.length > 0) {
          var columnPosition = {},
            columnOrder = {};
          row.columns.forEach(function (column) {
            columnPosition[column.name] = column.position;
            columnOrder[column.name] = column.order;
          });
          query += '(\'' + row.table + '\', \'' + JSON.stringify(columnPosition) + '\', \'' +
            JSON.stringify(columnOrder) + '\', \'' + template_id + '\'),';
        }
      });
      query = query.substring(0, query.length - 1);
      query += ';';
      sqlArray.push(query);
    }
  };

  /*****
  Function to generate columns for tables and views
  *****/

  var generateColumns = function (table, columnArrayName, scenario_id) {
    if (table[columnArrayName] && table[columnArrayName].length > 0) {
      var columnList = '',
        displayList = {},
        columnListWithType = '',
        uniqueColumns = '',
        editableColumns = '',
        visibleColumns = '',
        columnSelectQuery = '',
        columnFloat = {},
        columnListWithPlatType = '',
        columnFilter = '';
      table[columnArrayName].forEach(function (column) {
        var updatedType = column.type;
        columnList += column.columnName + ',';
        switch (column.type) {
          case 'numeric':
            if (column.precision) {
              updatedType += '(' + column.precision;
              if (column.scale) {
                columnFloat[column.columnName] = column.scale;
                updatedType += ',' + column.scale;
              }
              updatedType += ')';
            }
            break;
          case 'varchar':
            updatedType += '(' + (column.value ? column.value : 255) + ')';
            break;
          case 'double precision':
            if (column.float) columnFloat[column.columnName] = column.float;
            break;
        }
        columnListWithType += '"' + column.columnName + '" ' + (updatedType ? updatedType : 'text') + ',';
        columnListWithPlatType += '"' + column.columnName + '" ' + (column.type ? column.type : 'text') + ',';
        if (column.unique) {
          uniqueColumns += column.columnName + ',';
        }
        displayList[column.columnName] = column.displayName;
        if (column.visible.value) {
          visibleColumns += column.columnName + ',';
        }
        if (column.editable.value) {
          editableColumns += column.columnName + ',';
        }
        if (column.filter) {
          columnFilter += column.columnName + ',';
        }
        columnSelectQuery += '"' + column.columnName + '" AS "' + column.displayName + '",';
      });
      var sortedColumns = table[columnArrayName].sort(function (obj1, obj2) {
        return obj1.initOrder - obj2.initOrder
      });
      var sortedColumnName = sortedColumns.map(function (columnValue) {
        return columnValue.columnName;
      });
      var sortedColumnName = '"' + sortedColumnName.join('","') + '"';

      // Adding jqgrid_id and scenario_id columns to each scenario table
      columnListWithType += '"scenario_id" integer ';

      columnList = columnList.substring(0, columnList.length - 1);
      uniqueColumns = uniqueColumns.substring(0, uniqueColumns.length - 1);
      visibleColumns = visibleColumns.substring(0, visibleColumns.length - 1);
      editableColumns = editableColumns.substring(0, editableColumns.length - 1);
      columnSelectQuery = columnSelectQuery.substring(0, columnSelectQuery.length - 1);
      columnListWithPlatType = columnListWithPlatType.substring(0, columnListWithPlatType.length - 1);
      columnFilter = columnFilter.substring(0, columnFilter.length - 1);
      return {
        columnList: columnList,
        columnListWithType: columnListWithType,
        uniqueColumns: uniqueColumns,
        visibleColumns: visibleColumns,
        editableColumns: editableColumns,
        columnSelectQuery: columnSelectQuery,
        displayList: displayList,
        sortedColumnName: sortedColumnName,
        columnFloat: columnFloat,
        columnListWithPlatType: columnListWithPlatType,
        columnFilter: columnFilter
      };
    }
  };

  /*****
  Function to create master and report view
  *****/
  let createMasterAndReportViews = (tableName, sqlArray) => {
    sqlArray.push(`CREATE OR REPLACE VIEW "master_${tableName.toLowerCase()}" AS SELECT t.*, p.name scenario_name FROM scenario_parent."${tableName}" t, projects p WHERE p.id = t.scenario_id;`);
    sqlArray.push(`CREATE OR REPLACE VIEW reports."${tableName}" AS (select t.*, p.name scenario_name from scenario_parent."${tableName}" t, projects p WHERE p.id = t.scenario_id);`);
  }

  /*****
  Function to push queries to create tables.
  *****/

  var createTables = function (template_id, scenario_id, tableArray, tableType, colArrayName, sqlArray) {
    logger.info('common', 'Queries to create tables.');
    sqlArray.push('/**** Generating tables and inserting values ****/');
    let asdasda = [];
    if (tableArray && tableArray.length > 0) {
      tableArray.forEach(function (table, index) {
        var dataUploadObject = generateColumns(table, colArrayName, scenario_id);
        asdasda.push(dataUploadObject)
        if (dataUploadObject) {

          // Recreating scenario parent table
          sqlArray.push(`DROP TABLE IF EXISTS scenario_parent."${table.tableName}" CASCADE;`);
          sqlArray.push(`CREATE TABLE IF NOT EXISTS scenario_parent."${table.tableName}" (${dataUploadObject.columnListWithType.split(' DEFAULT')[0]});`);

          createMasterAndReportViews(table.tableName, sqlArray)

          dataUploadObject.index = index + 1;
          dataUploadObject.tableName = table.tableName;
          dataUploadObject.displayName = table.displayName;
          dataUploadObject.visible = table.visible !== undefined ? table.visible : true;
          dataUploadObject.type = tableType;
          dataUploadObject.tag = (table.tag && table.tag.tagName ? table.tag.tagName : 'Untagged');

          generateLKPDataUploadTables(template_id, dataUploadObject, sqlArray);
        }
      });
    }
    return asdasda;
  };

  var createViews = function (template_id, viewArray, viewType, colArrayName, sqlArray) {
    logger.info('common', 'Queries to create views.');
    sqlArray.push('/**** Generating views and inserting values ****/');
    if (viewArray && viewArray.length > 0) {
      viewArray.forEach(function (view, index) {
        var dataUploadObject = generateColumns(view, colArrayName);
        if (dataUploadObject && view.definition && view.definition.trim() !== '') {
          dataUploadObject.index = index + 1;
          dataUploadObject.tableName = view.viewName;
          dataUploadObject.displayName = view.displayName;
          dataUploadObject.visible = true;
          dataUploadObject.type = viewType;
          dataUploadObject.tag = (view.tag && view.tag.tagName ? view.tag.tagName : 'Untagged');
          generateLKPDataUploadTables(template_id, dataUploadObject, sqlArray);
          sqlArray.push('INSERT INTO "lkp_views" ("table_id", "definition") VALUES (currval(\'lkp_data_upload_tables_id_seq\'::regclass),\'' + view.definition + '\');');
          sqlArray.push('DROP VIEW IF EXISTS scenario_' + template_id + '."' + view.viewName + '";');
          sqlArray.push('CREATE OR REPLACE VIEW scenario_' + template_id + '."' + view.viewName + '" AS ' + view.definition + ';');
        }
      });
    }
  };

  /*****
  Function to push query to generate settings table.
  *****/

  var generateSetting = function (sqlArray) { // Insert all the settings which are independent of templates.
    logger.info('common', 'Queries to insert settings.');
    sqlArray.push('/**** Generating setting insert query ****/');
    // Delete settings that may be changed so that the new value can be inserted
    sqlArray.push('DELETE FROM "setting" WHERE scenario_template_id = 0 AND key IN (\'appName\', \'displayName\', \'appDescription\');');
    var insertStatement = 'INSERT INTO "setting" ("scenario_template_id","key", "value", "data_type", "created_by", "updated_by") VALUES ';
    var queryValues = [];
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'appId', appConfig.Application_id, 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'appName', appConfig.ApplicationName, 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'displayName', appConfig.ApplicationDisplayName, 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'appDescription', (appConfig.ApplicationDescription ? appConfig.ApplicationDescription : ''),
      'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'tableauTrusted', appConfig.tableau.tableauTrusted || 'false', 'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'tableauUsername', appConfig.tableau.tableauUsername || '', 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')',
      0, 'tableauFooter', appConfig.tableau.tableauFooter || 'true', 'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'locking', 'off', 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'helpPageStatus', 'false', 'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'executionUpdateMetaEnable', 'true', 'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'helpPageName', '', 'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', 0, 'hideOutdatedOutputWarning', 'false', 'boolean', user, user));
    var query = queryValues.map(values => insertStatement + values).join('; ') + ';';
    sqlArray.push(query);
  };

  /*****
  Function to push query to generate settings table.
  *****/

  var generateTemplateSetting = function (template_id, config, sqlArray) { // Insert template related settings.
    logger.info('common', 'Queries to insert template settings.');
    sqlArray.push('/**** Generating setting insert query ****/');
    // Delete settings that may be changed so that the new value can be inserted
    sqlArray.push(util.format('DELETE FROM "setting" WHERE scenario_template_id = %s AND key=\'html\';', template_id));
    var insertStatement = 'INSERT INTO "setting" ("scenario_template_id","key", "value", "data_type", "created_by", "updated_by") VALUES ';
    var queryValues = [];
    // if config.html is true and config.htmlUrl is provided, then html value = config.htmlUrl and data_type = text
    // else html value = config.html and data_type = boolean
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', template_id, 'html',
      config.html && config.htmlUrl ? config.htmlUrl : config.html,
      config.html && config.htmlUrl ? 'text' : 'boolean',
      user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', template_id, 'inputViz',
      config.reports.inputViz || 'false',
      'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', template_id, 'outputViz',
      config.reports.outputViz || 'false',
      'boolean', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', template_id, 'inputVizType',
      config.reports.inputVizType || 'tableau',
      'text', user, user));
    queryValues.push(util.format('(%s,\'%s\',\'%s\',\'%s\',\'%s\',\'%s\')', template_id, 'outputVizType',
      config.reports.outputVizType || 'tableau',
      'text', user, user));

    var query = queryValues.map(values => insertStatement + values).join('; ') + ';';
    sqlArray.push(query);
  };

  /*****
  Function to push query to generate tableau table.
  *****/
  
  var generateTableau = function (template_id, tableauList, type, sqlArray) {
    logger.info('Queries to insert lkp_tableau_report.');
    var query = 'INSERT INTO "lkp_tableau_report" ("scenario_template_id","type","url","label","project","workbook","created_at","updated_at") VALUES ';
    tableauList.forEach(function (tableau) {
      query += '(' + template_id + ',\'' + type + '\',\'' + tableau.url + '\',\'' + tableau.label + '\',\'' + tableau.project + '\',\'' + tableau.workbook + '\',now\(\),now\(\)' + '),';
    });
    query = query.substring(0, query.length - 1);
    query += ';';
    sqlArray.push(query);
  };
  
  /*****
  Function to push query to generate powerbi table.
  *****/
  
  var generatePowerbi = function (template_id, powerbiList, type, sqlArray) {
    logger.info('Queries to insert lkp_powerbi_report.');
    var query = 'INSERT INTO "lkp_powerbi_report" ("order_id","scenario_template_id","type","url","report_type","label","workspace_id","report_id","created_at","updated_at","created_by","updated_by") VALUES ';
    powerbiList.forEach(function (powerbi) {
      query += '(' + powerbi.order_id + ',' + template_id + ',\'' + type + '\',\'' + powerbi.url + '\',\'' + powerbi.report_type + '\',\'' + powerbi.label + '\',\'' + powerbi.workspace_id + '\',\'' + powerbi.report_id + '\',now\(\),now\(\)' + ',\'' + user + '\',\'' + user + '\'),';
    });
    query = query.substring(0, query.length - 1);
    query += ';';
    sqlArray.push(query);
  };

  /*****
  Function to get tables from another DB.
  *****/

  var generatePages = function (template_id, config, sqlArray) {
    sqlArray.push('/**** Insert query for lkp_pages ****/');
    config.appSegments.forEach(function (seg) {
      sqlArray.push('INSERT INTO "lkp_pages" ("scenario_template_id","type","value","visible","is_default") VALUES (' + template_id + ',\'' + seg.type + '\',\'' + seg.value + '\',' + seg.visible + ',' + seg.isDefault + ');');
    });
  };

  var generateTabView = function (template_id, config, sqlArray) {
    sqlArray.push('/**** Insert query for lkp_tab_view ****/');
    sqlArray.push('INSERT INTO "lkp_tab_view" ("scenario_template_id","type","value") VALUES (' + template_id + ',\'inputs\',\'table\'),(' + template_id + ',\'outputs\',\'tableau\');');
  };

  /*****
  Function to write all the queries to script_generated file.
  *****/

  var writeToFile = function (data) {
    logger.info('common', 'Writing to file...');
    fs.writeFileSync(path.resolve(__dirname, fileConfig.bundler.scriptGeneratedPath), data.join('\n'), 'utf-8');
  };

  var copyDatabase = function (sqlArray) {
    var scenarioPath = path.resolve(__dirname, util.format(filesystemConfig.dbFiles, appConfig.Application_id) + '/scenariodata.sql');
    if (fs.existsSync(scenarioPath)) {
      sqlArray.push('DROP SCHEMA scenario_' + (lastId + 1) + ' CASCADE;');
    }
  };

  var generateUsers = function (sqlArray) {
    if (appConfig.userInfo) {
      var newUser = appConfig.userInfo.user;
      sqlArray.push('SELECT insert_users(\'' + newUser.username + '\',\'' + newUser.useremail + '\',\'' + newUser.password + '\',\'Consultant\');');
      sqlArray.push('SELECT create_users_roles(\'' + newUser.username + '\');');
    } else {
      sqlArray.push('SELECT insert_users(\'demo@opexanalytics.com\',\'demo@opexanalytics.com\',\'4912ba79fdcd81814da707b3e1503f71\',\'Consultant\');');
      sqlArray.push('SELECT create_users_roles(\'demo@opexanalytics.com\');');
    }
  };

  var _insertEditOption = function (template_id, sqlArray, options, type) {
    options[type].forEach(function (option) {
      option.columns.forEach(function (entry) {
        var query = 'WITH lkp_dependency_insert as (INSERT into "lkp_dependency_list" ("custom_sql","dependent_schema_name","custom_values","dependent_table_name","dependent_column_name")'
        query += 'VALUES(\'' + _customSqlUnescape(entry.custom_sql) + '\',\'' + entry.dependent_schema + '\',' + entry.custom_values + '\,\'' + entry.dependent_table + '\',\'' + entry.dependent_column + '\') RETURNING id)'
        query += 'INSERT INTO "lkp_edit_grid" ("scenario_template_id","type","table_name","parent_column_name","column_name","dependency_id") ';
        query += 'VALUES(' + template_id + ',\'' + type + '\',\'' + option.tableName + '\',\'' + (entry.parent_column_name ? entry.parent_column_name : '') + '\',\'' + entry.columnName + '\',(select id from lkp_dependency_insert));';
        sqlArray.push(query);
      })
    })
  };

  /*****
  Function to populate edit grid options.
  *****/
  var generateEditOptions = function (template_id, config, sqlArray) {
    if (config.editOptions) {
      if (config.editOptions.input)
        _insertEditOption(template_id, sqlArray, config.editOptions, 'input'); // Insert all input table configurations.
      if (config.editOptions.output)
        _insertEditOption(template_id, sqlArray, config.editOptions, 'output'); // Insert all output table configurations.
    }
  };


var generatePgRoles = function (sqlArray, dbaRoleName, roles) {
  const { readWrite, readOnly, adhoc } = roles;

  sqlArray.push(`SELECT public.create_eds_user('${dbaRoleName}','rw','${readWrite.roleName}','${readWrite.dbusername}', '${readWrite.dbpassword}');\n`);
  sqlArray.push(`SELECT public.create_eds_user('${dbaRoleName}','ro','${readOnly.roleName}','${readOnly.dbusername}', '${readOnly.dbpassword}');\n`);
  sqlArray.push(`SELECT public.create_eds_user('${dbaRoleName}','adhoc','${adhoc.roleName}','${adhoc.dbusername}', '${adhoc.dbpassword}');\n`);
  sqlArray.push(`SELECT public.grant_schema_access('public');\n`);}

let createParentAndReportsSchema = (sqlArray, dbaRoleName, roles) => {
  const { readWrite, readOnly, adhoc } = roles;
  sqlArray.push('CREATE SCHEMA IF NOT EXISTS reports;');
  sqlArray.push(`SELECT public.grant_schema_access('reports');\n`);
  sqlArray.push('CREATE SCHEMA IF NOT EXISTS workspace;');
  sqlArray.push(`SELECT public.grant_schema_access('workspace');\n`);
  sqlArray.push('CREATE SCHEMA IF NOT EXISTS scenario_parent;');
  // No need to give grant_schema_access (dba only have access to scenario_parent)
  sqlArray.push('CREATE OR REPLACE VIEW reports.projects AS (select * from public.projects);');
}

  var postProcessing = function (sqlArray) {
    var queryProjects = 'DELETE FROM "projects" WHERE id';
    var queryProjectTable = 'DELETE FROM "project_tables" WHERE pid';
    var queryPostfix = ' NOT IN (select CAST(SUBSTRING(schema_name, 10) AS INT) \
      from information_schema.schemata WHERE schema_name SIMILAR TO \'scenario_[0-9]*\');'
    queryProjects += queryPostfix;
    queryProjectTable += queryPostfix;
    sqlArray.push(queryProjects);
    sqlArray.push(queryProjectTable);
  };

  var _generatePowerbiExtractSetting = function (sqlArray) {
    var username = appConfig.userInfo.user.username;
    sqlArray.push(util.format('INSERT INTO "powerbi_import_settings" ("type", "type_name","run_import","created_by", "updated_by") VALUES(\'script\',\'Execution\',false,\'%s\',\'%s\');', username, username));
    sqlArray.push(util.format('INSERT INTO "powerbi_import_settings" ("type", "type_name", "run_import","created_by", "updated_by") VALUES (\'scenario\',\'Copy\',false,\'%s\',\'%s\'),(\'scenario\',\'Edit\',false,\'%s\',\'%s\'),(\'scenario\',\'Delete\',false,\'%s\',\'%s\');;', username, username, username, username, username, username));
    sqlArray.push(util.format('INSERT INTO "powerbi_import_settings" ("type", "type_name", "run_import","segment", "created_by", "updated_by") VALUES (\'data\',\'Data Table\',false,\'input\',\'%s\',\'%s\'),(\'data\',\'Data Table\',false,\'output\',\'%s\',\'%s\');', username, username, username, username));
  };

  var _generateTableauExtractSetting = function (sqlArray) {
    var username = appConfig.userInfo.user.username;
    sqlArray.push(util.format('INSERT INTO "tableauExtract" ("type", "typeName","runExtract","createdBy", "updatedBy") VALUES (\'script\',\'Execution\',false,\'%s\',\'%s\');', username, username));
    sqlArray.push(util.format('INSERT INTO "tableauExtract" ("type", "typeName", "runExtract","createdBy", "updatedBy") VALUES (\'scenario\',\'Copy\',false,\'%s\',\'%s\'),(\'scenario\',\'Edit\',false,\'%s\',\'%s\'),(\'scenario\',\'Delete\',false,\'%s\',\'%s\');', username, username, username, username, username, username));
    sqlArray.push(util.format('INSERT INTO "tableauExtract" ("type", "typeName", "runExtract","segment", "createdBy", "updatedBy") VALUES (\'data\',\'Data Table\',false,\'input\',\'%s\',\'%s\'),(\'data\',\'Data Table\',false,\'output\',\'%s\',\'%s\');', username, username, username, username));
  };

  var _templateSetup = function (templateId, scenarioId, config, sqlArray) {
    if (!isRedeploy) generateTemplateSetting(templateId, config, sqlArray);
    generateDependencyList(templateId, config, '"lkp_parameters"', sqlArray);
    generateDependencyList(templateId, config, 'scenario_' + scenarioId + '."parameters"', sqlArray);
    generateEditOptions(templateId, config, sqlArray);
    generateTabView(templateId, config, sqlArray);
    generateRowView(templateId, config, sqlArray);

    if (!isRedeploy) {
      _generateTableauExtractSetting(sqlArray);
      _generatePowerbiExtractSetting(sqlArray);
      if (config.tableau.input && config.tableau.input.length > 0)
        generateTableau(templateId, config.tableau.input, 'input', sqlArray);
      if (config.tableau.output && config.tableau.output.length > 0)
        generateTableau(templateId, config.tableau.output, 'output', sqlArray);
      if (config.powerbi && config.powerbi.input && config.powerbi.input.length > 0)
        generatePowerbi(templateId, config.powerbi.input, 'input', sqlArray);
      if (config.powerbi && config.powerbi.output && config.powerbi.output.length > 0)
        generatePowerbi(templateId, config.powerbi.output, 'output', sqlArray);
    }
  };

  var cleanTemplateData = function (sqlArray) {
    var tables = ['lkp_edit_grid', 'lkp_data_upload_tables', 'lkp_pages', 'lkp_parameters', 'lkp_tableau_report', 'projects', 'setting'];
    if (appConfig.templateList && appConfig.templateList.templates.length > 0) // If template config exists, create one default scenario per template.
      appConfig.templateList.templates.forEach(function (template) {
        if (template.reset) {
          sqlArray.push('SELECT * FROM template_cleanup_fn(' + template.id + ',\'' + template.name + '\',\'' + user + '\');')
        }
      });
  };

  var generateRedeployConfig = function (sqlArray) {
    // ARCHIVE old scenarios
    sqlArray.push('SELECT * FROM archive_scenario((SELECT array_agg("id") FROM "projects" WHERE "status" <> \'archived\'),' +
      ' \'' + user + '\');');
  }

  var bulkInsert = (scenario_id, tableArray, dataUploadObject, tableType, sqlArray) => {
    if (tableArray && tableArray.length > 0) {
      sqlArray.push('CREATE SCHEMA IF NOT EXISTS scenario_parent;');
      tableArray.forEach(function (table, index) {
        generateBulkInsert(
          scenario_id,
          table.fileName,
          table.tableName,
          dataUploadObject[index].columnList,
          dataUploadObject[index].sortedColumnName,
          tableType,
          sqlArray
        );
      })
    }
  }

  let runTemplateSequence = (template, scenarioId, scenarioName, config, sqlArray, dbConfig) => {
    createTemplate(template, sqlArray)
    generatePages(template.id, config, sqlArray);
    createParentAndReportsSchema(sqlArray, dbConfig.roleName, dbConfig.roles);
    let inputTables = createTables(template.id, scenarioId, config.tables.input, 'input', 'inputColums', sqlArray);
    let outputTables = createTables(template.id, scenarioId, config.tables.output, 'output', 'outputColums', sqlArray);
    if (config.view) {
      if (config.view.input && config.view.input.length > 0) {
        createViews(template.id, config.view.input, 'input_view', 'columns', sqlArray);
      }
      if (config.view.output && config.view.output.length > 0) {
        createViews(template.id, config.view.output, 'output_view', 'columns', sqlArray);
      }
    }
    generateInsertParameters(template.id, config, sqlArray);
    createScenario(scenarioName, template.id, sqlArray);
    bulkInsert(scenarioId, config.tables.input, inputTables, 'input', sqlArray);
    bulkInsert(scenarioId, config.tables.output, outputTables, 'output', sqlArray);
    _templateSetup(template.id, scenarioId, config, sqlArray);
  }

  let analyzeScenario = (sqlArray) => {
    sqlArray.push('SELECT analyze_scenario_by_id("id") FROM "projects";');
  };

  var run = function (dbConfig) {
    return new Bluebird(function (resolve, reject) {
      var sqlArray = [];
      generatePgRoles(sqlArray, dbConfig.roleName, dbConfig.roles);
      generateRedeployConfig(sqlArray);
      if (appConfig.templateList && appConfig.templateList.templates.length > 0) {
        appConfig.templateList.templates.forEach(function (template) {
          const config = appConfig.templateDefinitions[template.id];
          const scenarioId = lastId + template.id;
          const scenarioName = lastId ? `${template.name} ${scenarioId}` : template.name;
          runTemplateSequence(template, scenarioId, scenarioName, config, sqlArray, dbConfig)
        });
      } else {
        const template = {
          id: 1,
          name: 'default'
        }
        const scenarioId = lastId ? (lastId + 1) : 1;
        const scenarioName = `Scenario ${scenarioId}`;
        runTemplateSequence(template, scenarioId, scenarioName, appConfig, sqlArray, dbConfig)
      }
      if (!isRedeploy) {
        generateSetting(sqlArray);
        copyDatabase(sqlArray);
        generateUsers(sqlArray);
      }
      analyzeScenario(sqlArray);
      writeToFile(sqlArray);
      resolve();
    });
  };

  var generateRestoreScripts = function (dbConfig) {
    var sqlArray = [];
    generatePgRoles(sqlArray, dbConfig.roleName, dbConfig.roles);
    postProcessing(sqlArray);
    writeToFile(sqlArray);
  };

  var partialDeploy = function () {
    var sqlArray = [];
    cleanTemplateData(sqlArray);
    generateSetting(sqlArray);
    if (appConfig.templateList && appConfig.templateList.templates.length > 0) { // If template config exist use the config specified.
      for (id in appConfig.templateDefinitions) {
        if (appConfig.templateList.templates[id - 1].reset) {
          logger.info('common', 'Setting up template with id: ', id);
          config = appConfig.templateDefinitions[id];
          _templateSetup(id, id, config, sqlArray)
        }
      }
    }
    writeToFile(sqlArray);
  };

  return {
    run: run,
    generateRestoreScripts: generateRestoreScripts,
    partialDeploy: partialDeploy
  }

};
module.exports = ACSQLGenerator;
