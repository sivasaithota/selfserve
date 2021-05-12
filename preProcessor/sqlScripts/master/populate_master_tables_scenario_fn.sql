DROP FUNCTION IF EXISTS populate_master_tables_scenario(INTEGER[]);

CREATE OR REPLACE FUNCTION populate_master_tables_scenario(scenarioIds INTEGER[])

RETURNS VOID AS $$

DECLARE

  scenario_cursor CURSOR FOR
    SELECT p."id",l."tablename"
    FROM "lkp_data_upload_tables" l
    JOIN "projects" p ON l."scenario_template_id" = p."scenario_template_id" AND l."version" = p."version"
    WHERE p."id" = ANY(scenarioIds) and l."type" NOT ILIKE '%view%';

  scenario_tables RECORD;

  scenario_ids TEXT := '';

BEGIN

  OPEN scenario_cursor;

    LOOP

      FETCH scenario_cursor INTO scenario_tables;

      EXIT WHEN NOT FOUND;

      PERFORM fn_populate_master_table (scenario_tables.id,scenario_tables.tablename);

      PERFORM fn_populate_master_parameter(scenario_tables.id);

      scenario_ids := CONCAT(scenario_ids,scenario_tables.id,',');

    END LOOP;

  CLOSE scenario_cursor;

END;

$$  LANGUAGE plpgsql;
