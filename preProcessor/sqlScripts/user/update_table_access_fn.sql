DROP FUNCTION IF EXISTS update_table_access(INTEGER, JSON);

CREATE OR REPLACE FUNCTION update_table_access(userid INTEGER, table_ids JSON)

RETURNS TABLE("id" INTEGER, "user_id" INTEGER, "table_id" INTEGER, "editable" BOOLEAN, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE) AS $$

DECLARE
	user_role TEXT;

BEGIN

		IF EXISTS (SELECT 1 FROM public."users" u WHERE u."id"=userid)
		THEN

			DELETE FROM public."users_table_accesses" u WHERE u."user_id" = userid;

			INSERT INTO  public."users_table_accesses" ("user_id","table_id","editable") SELECT "userid", (json_each(table_ids)).key::int, (json_each(table_ids)).value::text::bool;

			RETURN QUERY SELECT u."id", u."user_id", u."table_id", u."editable", u."created_at", u."updated_at" FROM public."users_table_accesses" u WHERE u."user_id"=userid;

		ELSE

			RAISE EXCEPTION 'User id does not exist';

		END IF;
END;

$$  LANGUAGE plpgsql;
