DROP FUNCTION IF EXISTS update_visualization_access(INTEGER, INTEGER[]);

CREATE OR REPLACE FUNCTION update_visualization_access(userid INTEGER, reports_ids INTEGER[])

RETURNS TABLE("id" INTEGER, "user_id" INTEGER, "report_id" INTEGER, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE) AS $$

DECLARE
	user_role TEXT;

BEGIN

		IF EXISTS (SELECT 1 FROM public."users" u WHERE u."id"=userid)
		THEN

			DELETE FROM public."users_visualization_accesses" u WHERE u."user_id" = userid;

			INSERT INTO  public."users_visualization_accesses" ("user_id","report_id") SELECT "userid", UNNEST(reports_ids);

			RETURN QUERY SELECT u."id", u."user_id", u."report_id", u."created_at", u."updated_at" FROM public."users_visualization_accesses" u WHERE u."user_id"=userid;

		ELSE

			RAISE EXCEPTION 'User id does not exist';

		END IF;
END;

$$  LANGUAGE plpgsql;
