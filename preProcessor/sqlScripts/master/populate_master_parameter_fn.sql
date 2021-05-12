DROP FUNCTION IF EXISTS fn_populate_master_parameter(INTEGER);

CREATE OR REPLACE FUNCTION fn_populate_master_parameter(pid INTEGER)
RETURNS BOOLEAN AS $$

  DECLARE paramTableName TEXT;
  DECLARE masterTableName TEXT;
  DECLARE scenarioName TEXT;
  DECLARE query TEXT;

BEGIN

  SELECT 'scenario_' || pid || '."parameters"'  INTO paramTableName;

  SELECT 'master_parameters' INTO masterTableName;

  SELECT lower(name) into scenarioName from projects where id = pid;

  IF EXISTS(SELECT 1 FROM pg_tables WHERE  schemaname=CONCAT('scenario_',pid) AND tablename = 'parameters') THEN

    IF EXISTS(SELECT 1 FROM pg_class WHERE relname = masterTableName)
    THEN

      SELECT 'DELETE FROM "'|| masterTableName ||'" WHERE "scenario_id" = '
        || pid || '' INTO query;

      EXECUTE query;

      SELECT 'INSERT INTO "'|| masterTableName ||'" ("scenario_id", "scenario_name", "id", "type", "validation", "displayname", "parameter", "value", "tooltip", "group_name")
        SELECT ' || pid || ', ''' || scenarioName || ''', "id", "type", "validation", "displayname", "parameter", "value", "tooltip", "group_name" FROM ' || paramTableName ||
        '' INTO query;

      EXECUTE query;

    ELSE

      SELECT 'CREATE TABLE "'|| masterTableName ||'" AS SELECT ' || pid || ' as "scenario_id", ''' || scenarioName ||
        '''::text as "scenario_name", "id", "type", "validation", "displayname", "parameter", "value", "tooltip", "group_name" FROM ' || paramTableName || '' INTO query;

      EXECUTE query;

    END IF;

  END IF;

	return true;

END;

$$  LANGUAGE plpgsql;
