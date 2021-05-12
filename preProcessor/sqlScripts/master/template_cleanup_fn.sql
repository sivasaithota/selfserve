DROP FUNCTION IF EXISTS template_cleanup_fn(INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION template_cleanup_fn(template_id INTEGER, template_name TEXT, user_name TEXT)

RETURNS void as $$

DECLARE

	query TEXT;

	table_cursor CURSOR FOR SELECT "id" FROM public."projects" WHERE "scenario_template_id"=template_id;

	table_record RECORD;

  tables TEXT[] := ARRAY['execution', 'lkp_edit_grid', 'lkp_data_upload_tables', 'lkp_pages', 'lkp_parameters', 'lkp_tableau_report', 'projects', 'setting'];

  table_name TEXT;

BEGIN

    OPEN table_cursor;

		LOOP

			FETCH table_cursor INTO table_record;

			EXIT WHEN NOT FOUND;

      query := CONCAT('DROP SCHEMA IF EXISTS scenario_',table_record.id,' CASCADE;');

      EXECUTE query;

      DELETE FROM "project_tables" WHERE "pid" = table_record.id;

		END LOOP;

    DELETE FROM "lkp_scenario_templates" WHERE "id" = template_id;

		DELETE FROM "setting" WHERE "scenario_template_id"=0;

    FOREACH table_name IN ARRAY tables

    LOOP

      query := CONCAT('DELETE FROM "',table_name,'" WHERE "scenario_template_id"=',template_id,';');

      EXECUTE query;

    END LOOP;

    query := CONCAT('CREATE SCHEMA IF NOT EXISTS scenario_',template_id,';');

    EXECUTE query;

    query := CONCAT('INSERT INTO "projects" ("id","scenario_template_id","name","created_by","updated_by") VALUES (',template_id,',',template_id,',''',template_name,''',''',user_name,''',''',user_name,''');');

    EXECUTE query;

    query := CONCAT('INSERT INTO "lkp_scenario_templates" ("id","name") VALUES(',template_id,',''',template_name,''');');

    EXECUTE query;

END;

$$  LANGUAGE plpgsql;
