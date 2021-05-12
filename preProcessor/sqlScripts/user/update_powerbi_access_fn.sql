DROP FUNCTION IF EXISTS update_powerbi_access(INTEGER, INTEGER[]);

CREATE OR REPLACE FUNCTION update_powerbi_access(userid INTEGER, reports_ids INTEGER[])

RETURNS TABLE("id" INTEGER, "user_id" INTEGER, "powerbi_id" INTEGER, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE) AS $$

BEGIN

		IF EXISTS (SELECT 1 FROM public."users" u WHERE u."id"=userid)
		THEN

			DELETE FROM public."users_powerbi_accesses" u WHERE u."user_id" = userid;

			INSERT INTO  public."users_powerbi_accesses" ("user_id","powerbi_id") SELECT "userid", UNNEST(reports_ids);

			RETURN QUERY SELECT u."id", u."user_id", u."powerbi_id", u."created_at", u."updated_at" FROM public."users_powerbi_accesses" u WHERE u."user_id"=userid;

		ELSE

			RAISE EXCEPTION 'User id does not exist';

		END IF;
END;

$$  LANGUAGE plpgsql;
