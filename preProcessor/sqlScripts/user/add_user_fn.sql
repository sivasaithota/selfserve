DROP FUNCTION IF EXISTS add_user(TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION add_user(newusername TEXT, email TEXT, role TEXT, homePage TEXT, username TEXT)

RETURNS INTEGER AS $$

DECLARE

  new_user_id INTEGER;

BEGIN

  INSERT INTO "users" ("username","email","role","home_page","created_by","updated_by")
    VALUES (newusername,email,role,homePage,username,username)
    RETURNING "users"."id" INTO new_user_id;

  RETURN new_user_id as user_id;

END;

$$  LANGUAGE plpgsql;
