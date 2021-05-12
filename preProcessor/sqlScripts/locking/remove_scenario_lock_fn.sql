DROP FUNCTION IF EXISTS remove_scenario_lock (INTEGER, TEXT);

CREATE OR REPLACE FUNCTION remove_scenario_lock(scenarioId INTEGER, user_name TEXT)

RETURNS TABLE("status" INTEGER) AS $$

DECLARE

  lockingId INTEGER;
  
  lock_scenarioId INTEGER;
  
  lock_username TEXT;

BEGIN

  IF EXISTS(SELECT 1 FROM "projects" p WHERE p."id"=scenarioId) THEN

    SELECT "scenario_id", "created_by" INTO lock_scenarioId, lock_username FROM "locking" l WHERE l."scenario_id"=scenarioId;

    IF lock_scenarioId IS NULL THEN 

      RAISE EXCEPTION 'Scenario is not locked';

    ELSEIF (lock_username <> user_name)  THEN

      RAISE EXCEPTION 'Scenario is locked by user - %', lock_username;

    ELSE 

      DELETE FROM "locking" l WHERE l."scenario_id" = scenarioId AND l."created_by" = user_name RETURNING "id" INTO lockingId;

      RETURN QUERY SELECT lockingId;

    END IF;
    
  ELSE
  
    RAISE EXCEPTION 'Scenario does not exist';
  
  END IF;
	
END;

$$  LANGUAGE plpgsql;