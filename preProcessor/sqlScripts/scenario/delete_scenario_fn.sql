DROP FUNCTION IF EXISTS delete_scenario(INTEGER[]);

CREATE OR REPLACE FUNCTION delete_scenario(scenarioIds INTEGER[])
RETURNS VOID AS $$

DECLARE

  query TEXT;
  scenarioId INTEGER;

BEGIN

  DELETE FROM "projects" as pr WHERE pr."id" = ANY(scenarioIds);
  
  DELETE FROM "project_tables" as prt WHERE prt."pid" = ANY(scenarioIds);
  
  DELETE FROM "users_scenario_accesses" as access WHERE access."scenario_id" = ANY(scenarioIds);
  
  DELETE FROM "users_scenario_accesses" as access WHERE access."scenario_id" = ANY(scenarioIds);
  
  FOREACH scenarioId in ARRAY scenarioIds

	LOOP

    SELECT 'DROP SCHEMA scenario_' || scenarioId || ' CASCADE ' || ';' INTO query;
    
    EXECUTE query;
    
  END LOOP;

END;
$$  LANGUAGE plpgsql;
