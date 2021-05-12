DROP FUNCTION IF EXISTS delete_grid_data(TEXT, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION delete_grid_data(jqgrid_ids TEXT, scenario_id INTEGER, table_value TEXT, username TEXT)

RETURNS VOID AS $$

DECLARE

	query_string TEXT;

BEGIN

	IF (jqgrid_ids = '') THEN

		query_string := CONCAT('DELETE FROM scenario_',scenario_id,'."',table_value,'";');

	ELSE

		query_string := CONCAT('DELETE FROM scenario_',scenario_id,'."',table_value,'" WHERE "jqgrid_id" IN (',jqgrid_ids,');');

	END IF;

	EXECUTE query_string;

	UPDATE "project_tables" SET "updated_by" = username, "updated_at" = now() WHERE "pid" = scenario_id AND "table_name" = table_value;

	UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

END;

$$  LANGUAGE plpgsql;
