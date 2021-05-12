DROP FUNCTION IF EXISTS insert_users(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION insert_users(name TEXT, email TEXT, password TEXT, role TEXT)

RETURNS VOID AS $$

BEGIN

  INSERT INTO "users" (
    "username",
    "email",
    "password",
    "admin",
    "companyName",
    "lastLogin",
    "role",
    "home_page",
    "created_by",
    "updated_by") 
  VALUES (name,
    email,
    password,
    true,
    'Opex',
    now(),
    role,
    '/WSProjects',
    name,
    name);

END;

$$  LANGUAGE plpgsql;