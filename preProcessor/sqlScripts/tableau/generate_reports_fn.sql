DROP FUNCTION IF EXISTS public.generate_reports();

CREATE OR REPLACE FUNCTION public.generate_reports()
	RETURNS BOOLEAN AS 
$BODY$
DECLARE 
	user_query TEXT;
	create_view_stmt TEXT;
	table_name TEXT;
BEGIN
	/* SCHEMA CREATION */
	CREATE SCHEMA IF NOT EXISTS reports;

	/* TABLE ITERATION AND VIEW CREATION */
	BEGIN
		FOR table_name IN
			SELECT DISTINCT tablename FROM public.lkp_data_upload_tables WHERE (type='input' OR type='output') AND version = (SELECT MAX (version) FROM lkp_data_upload_tables) UNION SELECT 'parameters' 
		LOOP
			create_view_stmt := 'CREATE OR REPLACE VIEW reports."' || table_name || '" AS (select t.*, p.name scenario_name from scenario_parent."' || table_name || '" t, projects p WHERE p.id = t.scenario_id)';
			EXECUTE create_view_stmt;
		END LOOP;

		CREATE OR REPLACE VIEW reports.projects AS (select * from public.projects);
		RETURN TRUE;
	END;
END;
$BODY$
LANGUAGE plpgsql;