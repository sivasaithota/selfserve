DROP FUNCTION IF EXISTS save_parameters(INTEGER, INTEGER[], TEXT[], TEXT);

CREATE OR REPLACE FUNCTION save_parameters(scenario_id INTEGER, param_id INTEGER[], param_value TEXT[], username TEXT )
RETURNS SMALLINT AS $$

DECLARE
i SMALLINT;
query TEXT;
CNT BOOLEAN;

BEGIN

	FOR i IN 1 .. ARRAY_UPPER(param_id,1)
	LOOP

		query := CONCAT ('UPDATE scenario_',scenario_id,'."parameters" SET "value"=''',param_value[i],''', "updated_by"=''',username,''', "updated_at"=now() WHERE "id"=''',param_id[i],'''');

		EXECUTE query;

	END LOOP;

	UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

	RETURN 0;
END;
$$  LANGUAGE plpgsql;
