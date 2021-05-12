CREATE OR REPLACE FUNCTION updateparametervalue()

RETURNS VOID AS $$

DECLARE

  scenario_cursor CURSOR FOR
    SELECT DISTINCT p."id"
    FROM "lkp_data_upload_tables" l
    JOIN "projects" p ON l."scenario_template_id" = p."scenario_template_id" AND l."version" = p."version"
    WHERE l."type" NOT ILIKE '%view%';

  scenario_tables RECORD;

  date_value TEXT;

  query TEXT;

  table_exists BOOL;

BEGIN

  OPEN scenario_cursor;

  CREATE OR REPLACE FUNCTION is_date(s varchar) RETURNS boolean as $inner$
  BEGIN
    PERFORM s::date;
    RETURN true;
  EXCEPTION WHEN others THEN
    RETURN false;
  END;
  $inner$ LANGUAGE plpgsql;

  LOOP

    FETCH scenario_cursor INTO scenario_tables;

    EXIT WHEN NOT FOUND;

    SELECT EXISTS into table_exists (
      SELECT FROM pg_tables
      WHERE  schemaname = 'scenario_' || scenario_tables.id
      AND    tablename  = 'parameters'
    );

    IF table_exists THEN
      query := 'UPDATE scenario_'|| scenario_tables.id ||'."parameters" SET "value" = to_char(value::date, ''MM/DD/YYYY'') WHERE "type" = ''1'' AND "validation" = ''date'' AND is_date(value) = true;';

      EXECUTE query;
    ELSE
      RAISE NOTICE 'Parameters table does not exist in schema %', scenario_tables.id;
    END IF;

  END LOOP;

  CLOSE scenario_cursor;

END;

$$  LANGUAGE plpgsql;
