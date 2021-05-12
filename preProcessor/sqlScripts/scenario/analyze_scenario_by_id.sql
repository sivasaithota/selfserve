DROP FUNCTION IF EXISTS analyze_scenario_by_id(INTEGER);

CREATE OR REPLACE FUNCTION analyze_scenario_by_id(scenario_id INTEGER)

RETURNS VOID AS $$

DECLARE

  scenario_name TEXT :='';

BEGIN

  SELECT p."name",p."scenario_template_id",p."tag_id"
    INTO scenario_name
    FROM public."projects" p
    WHERE p."id"=scenario_id;

  IF (scenario_name <>'')

  THEN

    DECLARE

      scenario_cursor CURSOR FOR
        SELECT p."id", l."tablename"
        FROM "lkp_data_upload_tables" l
        JOIN "projects" p ON l."scenario_template_id" = p."scenario_template_id" AND l."version" = p."version"
        WHERE p."id"=scenario_id and l."type" NOT ILIKE '%view%';

      scenario_tables RECORD;

    BEGIN

      OPEN scenario_cursor;

      LOOP

        FETCH scenario_cursor INTO scenario_tables;

        EXIT WHEN NOT FOUND;

        EXECUTE 'ANALYZE scenario_' || scenario_id || '."' || scenario_tables.tablename || '";';

      END LOOP;

      CLOSE scenario_cursor;

    END;

  ELSE

    RAISE EXCEPTION 'scenario does not exist.';

  END IF;

END;

$$  LANGUAGE plpgsql;
