DROP FUNCTION IF EXISTS delete_user(INTEGER);

CREATE OR REPLACE FUNCTION delete_user(userid INTEGER)

RETURNS TABLE("user_name" TEXT) AS $$

DECLARE

  user_name TEXT;

BEGIN
    
    DELETE FROM "users" where "id" = userid RETURNING username INTO user_name;
    DELETE FROM "users_scenario_accesses" WHERE user_id=userid;
    DELETE FROM "users_table_accesses" WHERE user_id=userid;
    
    RETURN QUERY SELECT user_name;
END;

$$  LANGUAGE plpgsql;
