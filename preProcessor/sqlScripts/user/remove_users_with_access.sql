DROP FUNCTION IF EXISTS remove_users_with_access(INTEGER);

CREATE OR REPLACE FUNCTION remove_users_with_access(userid INTEGER)

RETURNS VOID AS $$

BEGIN
    DELETE FROM "users" where "id" != userid;
    DELETE FROM "users_scenario_accesses";
    DELETE FROM "users_table_accesses";
    DELETE FROM "users_visualization_accesses";
    DELETE FROM "users_powerbi_accesses";
END;

$$  LANGUAGE plpgsql;
