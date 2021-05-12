DROP FUNCTION IF EXISTS get_resource_count(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_resource_count(scenario_id INTEGER, userId INTEGER)

RETURNS TABLE("resource" TEXT, "type" TEXT, "count" INTEGER) AS $$

DECLARE

	query TEXT;

BEGIN

	CREATE TEMP TABLE IF NOT EXISTS resource_count_table ("resource" TEXT, "type" TEXT, "count" INTEGER) ON COMMIT DROP;

	query := CONCAT('
		INSERT INTO resource_count_table ("resource", "type", "count")
			SELECT ''tables'', ldut."type", COUNT(ldut."type")
				FROM "lkp_data_upload_tables" ldut
				INNER JOIN "projects" c ON ldut."scenario_template_id" = c."scenario_template_id" AND c."id" = ',scenario_id,' AND ldut."version" = c."version"
				LEFT JOIN "project_tables" b ON ldut."tablename"= b."table_name" AND b."pid"=c."id"
				LEFT JOIN "lkp_row_view" r ON ldut."tablename" = r."tablename" AND ldut."scenario_template_id" = r."scenario_template_id"
				LEFT JOIN pg_stat_user_tables psut ON psut.relname=ldut."tablename" AND psut.schemaname=''scenario_', scenario_id, ' ''
	');

	IF userId IS NOT NULL THEN

		query := CONCAT(query, 'INNER JOIN "users_table_accesses" acc ON ldut."id" = acc."table_id" AND acc."user_id"=', userId);

	END IF;

	query := CONCAT(query, 'GROUP BY ldut."type";');

	EXECUTE query;

	query := CONCAT('
		INSERT INTO resource_count_table ("resource", "type", "count")
			SELECT ''tableau'', ltr."type", COUNT(ltr."type")
				FROM "lkp_tableau_report" ltr
				INNER JOIN "projects" p ON ltr."scenario_template_id"=p."scenario_template_id" AND p."id"=', scenario_id
	);

	IF userId IS NOT NULL THEN

		query := CONCAT(query, 'INNER JOIN "users_visualization_accesses" acc ON ltr."id" = acc."report_id" AND acc."user_id"=', userId);

	END IF;

	query := CONCAT(query, 'GROUP BY ltr."type";');

	EXECUTE query;

	query := CONCAT('
		INSERT INTO resource_count_table ("resource", "type", "count")
			SELECT ''powerbi'', lpr."type", COUNT(lpr."type")
				FROM "lkp_powerbi_report" lpr
				INNER JOIN "projects" p ON lpr."scenario_template_id"=p."scenario_template_id" AND p."id"=', scenario_id
	);

	IF userId IS NOT NULL THEN

		query := CONCAT(query, 'INNER JOIN "users_powerbi_accesses" acc ON lpr."id" = acc."powerbi_id" AND acc."user_id"=', userId);

	END IF;

	query := CONCAT(query, 'GROUP BY lpr."type";');

	EXECUTE query;

	RETURN QUERY SELECT rct."resource", rct."type", rct."count" FROM resource_count_table rct;

END;

$$  LANGUAGE plpgsql;
