DROP FUNCTION IF EXISTS check_lock(BOOLEAN, TEXT, INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION check_lock(release_lock BOOLEAN, user_name TEXT, scenarioId INTEGER, lock_timeout INTEGER, explicitlock BOOLEAN)

RETURNS TABLE("has_access" BOOLEAN, "username" TEXT) AS $$

DECLARE

  l_id INTEGER := 0;
  
  l_username TEXT := '';
  
  locking_time TIMESTAMP;
  
  l_explicit_lock BOOLEAN;
  
  lock_status TEXT;

BEGIN

  SELECT "value" INTO lock_status FROM "setting" WHERE "key" = 'locking';
  
  IF (lock_status IS NULL) OR (lock_status = 'off') THEN
  
    RETURN QUERY SELECT true , user_name;
  
  ELSE
  
    IF ( release_lock IS TRUE ) THEN 

      DELETE FROM "locking" s WHERE s."username" = user_name AND (s."explicit_lock" =false OR s."explicit_lock" IS NULL);

      RETURN QUERY SELECT true, user_name;

    ELSE

      SELECT INTO l_id, l_username, locking_time, l_explicit_lock s."id", s."username", s."locking_time", s."explicit_lock" FROM "locking" s WHERE s."scenario_id" = scenarioId;  

      IF (l_id > 0 ) THEN

        IF ( l_username <> user_name ) THEN

          IF ((locking_time +  CONCAT(lock_timeout, ' seconds')::INTERVAL) < now() AND (l_explicit_lock IS FALSE OR l_explicit_lock IS NULL)) THEN

            DELETE FROM "locking" s WHERE s."username" = l_username AND s."scenario_id" = scenarioId;

            INSERT INTO "locking" ("scenario_id", "username", "created_by", "updated_by", "explicit_lock") VALUES (scenarioId, user_name, user_name, user_name, explicitlock);

            RETURN QUERY SELECT true , user_name;

          ELSE
            
            RETURN QUERY SELECT false , l_username;

          END IF;

        ELSE

          UPDATE "locking" s  SET "locking_time"=now(), "explicit_lock" = explicitlock  WHERE s."scenario_id" = scenarioId AND s."username" = user_name;

          RETURN QUERY SELECT true , l_username;

        END IF;

      ELSE
        
        DELETE FROM "locking" s WHERE s."username" = user_name AND ( s."explicit_lock" = false OR s."explicit_lock" IS NULL ) ;

        INSERT INTO "locking" ("scenario_id", "username", "created_by", "updated_by", "explicit_lock") VALUES (scenarioId, user_name, user_name, user_name, explicitlock);

        RETURN QUERY SELECT true , l_username;

      END IF;

    END IF; 
  
  END IF;

END;

$$  LANGUAGE plpgsql;