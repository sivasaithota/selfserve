DROP FUNCTION IF EXISTS lock_scenario (INTEGER, TEXT);

CREATE OR REPLACE FUNCTION lock_scenario(scenarioId INTEGER, user_name TEXT)

RETURNS TABLE("lockingId" INTEGER) AS $$

DECLARE

  lockingId INTEGER;
  
  lock_username TEXT;

BEGIN

  IF EXISTS(SELECT 1 FROM "projects" p WHERE p."id"=scenarioId) THEN
  
    SELECT "username" INTO lock_username FROM "locking" l WHERE l."scenario_id" = scenarioId;
    
    IF(lock_username IS NOT NULL) THEN
    
      RAISE EXCEPTION 'scenario is already locked by user %', lock_username;
    
    ELSE
    
      INSERT INTO "locking"("scenario_id", "username", "explicit_lock", "created_by", "updated_by") VALUES(scenarioId, user_name, true, user_name, user_name) RETURNING "id" INTO lockingId;
    
      RETURN QUERY SELECT lockingId;
      
    END IF;
    
  ELSE
  
    RAISE EXCEPTION 'scenario does not exist.';
  
  END IF;
	
END;

$$  LANGUAGE plpgsql;