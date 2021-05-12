DROP FUNCTION IF EXISTS add_grid_data(INTEGER, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION add_grid_data(scenario_id INTEGER, table_value TEXT, column_values TEXT, username TEXT)

RETURNS VOID AS $$

DECLARE

  query_string TEXT;

  column_list TEXT;

  column_clause TEXT := '';

  value_clause TEXT := '';

  col TEXT;

  ttype TEXT;

  jqgrid_id INTEGER;

  file_var TEXT;

  table_type TEXT;

  query TEXT;

BEGIN

  SELECT l."columnlist", l."type" INTO column_list, table_type
    FROM "lkp_data_upload_tables" l
    INNER JOIN "projects" p
      ON l."version" = p."version"
      AND p."id" = scenario_id
      AND l.scenario_template_id = p.scenario_template_id
    WHERE l."tablename" = table_value;

  query_string := CONCAT('INSERT INTO SCENARIO_',scenario_id,'."',table_value,'"');

  FOREACH col in ARRAY string_to_array(column_list,',')

  LOOP

    column_clause := CONCAT(column_clause,'"',col,'",');

    SELECT INTO ttype REGEXP_REPLACE(json_extract_path_text(column_values::JSON,col),'"','','gi');

    IF ttype != '' THEN

      value_clause := CONCAT(value_clause,'''',ttype, ''',');

    ELSE

      value_clause := CONCAT(value_clause,'null,');

    END IF;

  END LOOP;

  column_clause := LEFT(column_clause,LENGTH(column_clause)-1);

  value_clause := LEFT(value_clause,LENGTH(value_clause)-1);

  IF (table_type=ANY ('{input,output}'::text[])) THEN

    column_clause := CONCAT(column_clause,', "op_created_by", "op_updated_by"');

    value_clause := CONCAT(value_clause,', ''',username,''',''',username,'''');
  END IF;

  query_string := CONCAT(query_string, '(', column_clause,') VALUES (',value_clause,') RETURNING "jqgrid_id"');

  EXECUTE query_string INTO jqgrid_id;

    SELECT "file_name" INTO file_var FROM "project_tables" WHERE "table_name"=table_value;

    IF EXISTS(SELECT 1 FROM "project_tables" WHERE "pid" = scenario_id and "table_name" = table_value) THEN

      query_string := CONCAT('UPDATE "project_tables" SET "updated_by"=''',username,''',"file_name"=''',file_var,''',"updated_at"=now() WHERE "pid"=',scenario_id,'and "table_name"=''',table_value,'''');

    EXECUTE query_string;

  ELSE

    query_string := CONCAT('INSERT INTO "project_tables" ("pid", "name", "file_name", "status", "table_name", "type", "columns", "visible","created_at","updated_at","created_by","updated_by") VALUES (',scenario_id,',''',table_value,''',''',file_var,''',''Uploaded successfully'',''',table_value,''',''input'',''',column_list,''',true,now(),now(),''',username,''',''',username,''');');

    EXECUTE query_string;

  END IF;

  UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

END;

$$  LANGUAGE plpgsql;
