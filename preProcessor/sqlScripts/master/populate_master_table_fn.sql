DROP FUNCTION IF EXISTS fn_populate_master_table(INTEGER, TEXT);

CREATE OR REPLACE FUNCTION fn_populate_master_table(pid INTEGER, table_name TEXT)
RETURNS BOOLEAN AS $$

DECLARE
  inputTableName TEXT;
  masterTableName TEXT;
  scenarioName TEXT;
  query TEXT;
  column_list TEXT;

BEGIN

  IF (check_master_setting()) THEN

		SELECT 'scenario_' || pid || '."' || table_name || '"'  INTO inputTableName;

    SELECT 'master_' || lower(table_name) INTO masterTableName;

    SELECT name into scenarioName from projects where id = pid;

    SELECT l."columnlist" INTO column_list
      FROM "lkp_data_upload_tables" l
      JOIN "projects" p ON l."version" = p."version" AND p."id" = pid
      WHERE l."tablename" = table_name;

    column_list := CONCAT('"', REPLACE(column_list,',','","'), '"');

    IF EXISTS(SELECT 1 FROM pg_tables WHERE  schemaname=CONCAT('scenario_',pid) AND tablename = table_name) THEN

      IF EXISTS(SELECT 1 FROM pg_class WHERE relname = masterTableName)
      THEN
        SELECT 'DELETE FROM "'|| masterTableName ||'" WHERE "scenario_id" = '
          || pid || '' INTO query;

        EXECUTE query;

        SELECT 'INSERT INTO "'|| masterTableName ||'" ("scenario_id", "scenario_name", ' || column_list ||', "jqgrid_id")
          SELECT ' || pid || ', ''' || scenarioName || ''',' || column_list || ',"jqgrid_id" FROM ' || inputTableName ||
          '' INTO query;

        EXECUTE query;

      ELSE

        SELECT 'CREATE TABLE "'|| masterTableName ||'" AS SELECT ' || pid || ' as "scenario_id", ''' || scenarioName || '''::text as "scenario_name", ' || column_list || ',"jqgrid_id" FROM ' || inputTableName || '' INTO query;

        EXECUTE query;

      END IF;

    END IF;

  END IF;

	return true;

END;

$$  LANGUAGE plpgsql;
