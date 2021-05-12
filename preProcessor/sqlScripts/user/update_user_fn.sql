DROP FUNCTION IF EXISTS update_user(INTEGER,TEXT,TEXT);

CREATE OR REPLACE FUNCTION update_user(userid INTEGER, user_role TEXT, updatedby TEXT)

RETURNS VOID AS $$

DECLARE

BEGIN
    UPDATE "users" SET "role"=user_role, "updated_by"=updatedby, "updated_at"=now() WHERE id=userid;
    DELETE FROM "users_scenario_accesses" WHERE user_id=userid;
    DELETE FROM "users_table_accesses" WHERE user_id=userid;
END;

$$  LANGUAGE plpgsql;