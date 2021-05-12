DROP FUNCTION IF EXISTS edit_grid_data(INTEGER, INTEGER, TEXT, TEXT, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION edit_grid_data(jqgrid_id INTEGER, scenario_id INTEGER, table_value TEXT, column_values TEXT, username TEXT, single_cell BOOLEAN)

RETURNS VOID AS $$

DECLARE

  query_string TEXT;

  column_list TEXT;

  col TEXT;

  ttype TEXT;

  table_type TEXT;

  set_string TEXT := 'SET ';

BEGIN

  SELECT l."editablecolumns", l."type" INTO column_list, table_type
    FROM "lkp_data_upload_tables" l
    INNER JOIN "projects" p
      ON l."version" = p."version"
      AND p."id" = scenario_id
      AND l.scenario_template_id = p.scenario_template_id
    WHERE l."tablename" = table_value;

  IF (table_type=ANY ('{input,output}'::text[])) THEN

    query_string := CONCAT('ALTER TABLE scenario_', scenario_id, '."', table_value, '" ADD COLUMN IF NOT EXISTS "jqgrid_id" SERIAL, ADD COLUMN IF NOT EXISTS "op_created_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ADD COLUMN IF NOT EXISTS "op_updated_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();');

    EXECUTE query_string;

  END IF;

  query_string := CONCAT('UPDATE scenario_',scenario_id,'."',table_value,'" ');

  FOREACH col in ARRAY string_to_array(column_list,',')

  LOOP

      SELECT INTO ttype REGEXP_REPLACE(json_extract_path_text(column_values::JSON,col),'"','','gi');

      IF ttype != '' THEN
        set_string := CONCAT(set_string,'"',col,'"=''', ttype, ''',');
      END IF;

      IF ttype = '' AND single_cell IS NOT true THEN
        set_string := CONCAT(set_string,'"',col,'"=null,');
      END IF;

  END LOOP;

  IF (table_type=ANY ('{input,output}'::text[])) THEN

    set_string := CONCAT(set_string,' "op_updated_by" = ''',username,''', "op_updated_at" = now()');

  ELSE

    set_string := TRIM (TRAILING ',' FROM set_string);

  END IF;

  query_string := CONCAT(query_string,set_string,' WHERE "jqgrid_id"=',jqgrid_id);

  EXECUTE query_string;

  UPDATE "project_tables" SET "updated_by" = username, "updated_at" = now() WHERE "pid" = scenario_id AND "table_name" = table_value;

  UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

END;

$$  LANGUAGE plpgsql;
