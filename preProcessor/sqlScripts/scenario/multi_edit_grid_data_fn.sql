DROP FUNCTION IF EXISTS multi_edit_grid_data(INTEGER, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION multi_edit_grid_data(scenario_id INTEGER, table_value TEXT, jqgrid_id TEXT, column_values json, username TEXT)

RETURNS VOID AS $$

DECLARE

  query_string TEXT;

  set_values TEXT :='';

  table_type TEXT;

  i JSON;

BEGIN

  SELECT  l."type" INTO  table_type
  FROM "lkp_data_upload_tables" l
  INNER JOIN "projects" p
    ON l."version" = p."version"
    AND p."id" = scenario_id
    AND l.scenario_template_id = p.scenario_template_id
  WHERE l."tablename" = table_value;

  IF (table_type=ANY ('{input,output}'::text[])) THEN

    query_string := CONCAT('ALTER TABLE scenario_', scenario_id, '."', table_value, '" ADD COLUMN IF NOT EXISTS "jqgrid_id" SERIAL, ADD COLUMN IF NOT EXISTS "scenario_id" INTEGER DEFAULT ', scenario_id, ', ADD COLUMN IF NOT EXISTS "op_created_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ADD COLUMN IF NOT EXISTS "op_updated_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();');

    EXECUTE query_string;

    -- Adding PRIMARY KEY constraint to the jqgrid_id column of the table if constraint is not defined yet
    IF NOT EXISTS (

      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = CONCAT('scenario_', scenario_id)
      AND table_name = table_value
      AND constraint_type = 'PRIMARY KEY'

    ) THEN

      EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || table_value || '" ADD PRIMARY KEY ("jqgrid_id")';

    END IF;

    -- Make the table inherit from the appropriate table in scenario_parent schema if that inheritance is not defined yet
    IF NOT EXISTS (

      SELECT 1
      FROM pg_catalog.pg_inherits
      WHERE inhrelid = CONCAT('scenario_', scenario_id, '."', table_value, '"')::regclass

    ) THEN

      EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || table_value  ||
      '" INHERIT scenario_parent."' || table_value || '";';

    END IF;

  END IF;

  FOR i IN SELECT * FROM json_array_elements(column_values)

  LOOP

	IF i->>'operator' != '=' THEN

		set_values := CONCAT(set_values, '"', i->>'id', '" = "', table_value ,'"."', i->>'name' ,'" ', i->>'rowValue',',');

	ELSE

		set_values := CONCAT(set_values, '"', i->>'id', '" = ''', i->>'rowValue',''',');

	END IF;

  END LOOP;

  set_values := LEFT(set_values,LENGTH(set_values)-1);

  IF (table_type=ANY ('{input,output}'::text[])) THEN

    set_values := CONCAT(set_values,', "op_updated_by" = ''',username,''', "op_updated_at" = now()');

  END IF;

  query_string := CONCAT('UPDATE scenario_', scenario_id,'."',table_value,'" SET ', set_values,' WHERE "jqgrid_id" IN (',jqgrid_id,');');

  EXECUTE query_string;

  UPDATE "project_tables" SET "updated_by" = username, "updated_at" = now() WHERE "pid" = scenario_id AND "table_name" = table_value;

  UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

END;

$$  LANGUAGE plpgsql;
