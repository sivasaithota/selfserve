DROP FUNCTION IF EXISTS save_parameter(INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION save_parameter(scenario_id INTEGER, param_id INTEGER, param_value TEXT, username TEXT)
RETURNS SMALLINT AS $$

DECLARE
i SMALLINT;
query TEXT;
CNT BOOLEAN;

BEGIN

	query := CONCAT ('UPDATE scenario_',scenario_id,'."parameters" SET "value"=''',param_value,''', "updated_by"=''',username,''', "updated_at"=now() WHERE "id"=''',param_id,'''');

	EXECUTE query;

	UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

	RETURN 0;
END;
$$  LANGUAGE plpgsql;
