DROP FUNCTION IF EXISTS update_scenario_access(INTEGER,INTEGER[],BOOLEAN);

CREATE OR REPLACE FUNCTION update_scenario_access(userid INTEGER,scenario_ids INTEGER [], is_unique BOOLEAN)

RETURNS TABLE("id" INTEGER, "user_id" INTEGER, "scenario_id" INTEGER, "created_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE) AS $$

DECLARE
	user_role TEXT;

BEGIN

		IF EXISTS (SELECT 1 FROM public."users" u WHERE u."id"=userid)
		THEN


			SELECT "role" INTO user_role FROM public."users" u WHERE u."id"=userid;

			IF (user_role = 'BusinessUser') THEN
				UPDATE public."users" as us SET "home_page" = CONCAT('/project/',scenario_ids[1]) WHERE us."id" = userid;
			END IF;

			IF is_unique IS NOT TRUE THEN
			  DELETE FROM public."users_scenario_accesses" u WHERE u."user_id" = userid;
			END IF;

			INSERT INTO  public."users_scenario_accesses" ("user_id","scenario_id") SELECT "userid", UNNEST(scenario_ids);

			RETURN QUERY SELECT u."id", u."user_id", u."scenario_id", u."created_at", u."updated_at" FROM public."users_scenario_accesses" u WHERE u."user_id"=userid;

		ELSE

			RAISE EXCEPTION 'User id does not exist';

		END IF;
END;

$$  LANGUAGE plpgsql;
