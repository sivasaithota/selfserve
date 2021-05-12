DROP FUNCTION IF EXISTS copy_scenario(INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION copy_scenario(scenario_id INTEGER, scenario_name TEXT, user_name TEXT)

RETURNS TABLE("id" INTEGER, "name" TEXT, "updated_at" TIMESTAMP, "created_at" TIMESTAMP, "updated_by" TEXT, "created_by" TEXT, "tag_id" INTEGER, "status" TEXT) AS $$

DECLARE

  old_scenario_name TEXT :='';

  new_scenario_id INTEGER;

  template_id INTEGER;

  tag_id INTEGER;

  query TEXT;

  new_scenario_updated_time TIMESTAMP;

  new_scenario_created_time TIMESTAMP;

  new_scenario_updated_user TEXT;

  new_scenario_created_user TEXT;

  new_scenario_tag_id INTEGER;

  new_scenario_status TEXT;

  app_version INTEGER;

  columnlist TEXT;

  user_info RECORD;

BEGIN

  SELECT INTO app_version MAX ("version") FROM "projects";

  SELECT p."name",p."scenario_template_id",p."tag_id"
    INTO old_scenario_name,template_id,tag_id
    FROM public."projects" p
    WHERE p."id"=scenario_id;

  IF (old_scenario_name <>'')

  THEN

    IF scenario_name = '' OR scenario_name = old_scenario_name THEN

      scenario_name := CONCAT(old_scenario_name,'-copy',floor(random()*(2500-1000+1))+1000);

    END IF;

    INSERT INTO public."projects"
      ("scenario_template_id","name", "created_at", "updated_at", "created_by", "updated_by","tag_id","version")
      VALUES
      (template_id,scenario_name,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,user_name,user_name,tag_id,app_version)
      RETURNING projects."id", projects."updated_at", projects."created_at", projects."updated_by", projects."created_by", projects."tag_id", projects."status" INTO new_scenario_id,
      new_scenario_updated_time, new_scenario_created_time, new_scenario_updated_user, new_scenario_created_user,
      new_scenario_tag_id, new_scenario_status;

    query := CONCAT('CREATE SCHEMA scenario_',new_scenario_id);

    EXECUTE query;

    PERFORM public."grant_schema_access" (CONCAT('scenario_', new_scenario_id));

    DECLARE

      scenario_cursor CURSOR FOR
        SELECT p."id", l."tablename"
        FROM "lkp_data_upload_tables" l
        JOIN "projects" p ON l."scenario_template_id" = p."scenario_template_id" AND l."version" = p."version"
        WHERE p."id"=scenario_id and l."type" NOT ILIKE '%view%';

      scenario_tables RECORD;

        scenario_view_cursor CURSOR FOR
        SELECT viewname, definition
        FROM pg_views
        WHERE schemaname=CONCAT('scenario_',scenario_id);

      scenario_views RECORD;

      column_arr TEXT;

    BEGIN

      OPEN scenario_cursor;

      LOOP

        FETCH scenario_cursor INTO scenario_tables;

        EXIT WHEN NOT FOUND;

          IF EXISTS(SELECT 1 FROM pg_tables WHERE tablename = scenario_tables.tablename AND schemaname=CONCAT('scenario_',scenario_id)) THEN

            EXECUTE 'CREATE TABLE scenario_' || new_scenario_id || '."' || scenario_tables.tablename ||
            '" AS TABLE scenario_' || scenario_id || '."' || scenario_tables.tablename ||'";';

            query := CONCAT('ALTER TABLE scenario_',new_scenario_id,'."',scenario_tables.tablename,'" DROP COLUMN IF  EXISTS "jqgrid_id",
            DROP COLUMN IF EXISTS "scenario_id", DROP COLUMN IF EXISTS "op_created_by", DROP COLUMN IF EXISTS "op_created_at", DROP COLUMN IF EXISTS "op_updated_by",
            DROP COLUMN IF EXISTS "op_updated_at";');
            EXECUTE query;

            query :='ALTER TABLE scenario_' || new_scenario_id || '."' || scenario_tables.tablename || '" ADD COLUMN "jqgrid_id" SERIAL PRIMARY KEY, ' ||
		        ' ADD COLUMN "scenario_id" integer DEFAULT ' || new_scenario_id || ' CHECK ("scenario_id" = ' || new_scenario_id ||
            '), ADD COLUMN IF NOT EXISTS "op_created_by" VARCHAR(255) DEFAULT ''' || user_name || ''', ADD COLUMN IF NOT EXISTS "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ' ||
		        ' ADD COLUMN IF NOT EXISTS "op_updated_by" VARCHAR(255) DEFAULT ''' || user_name || ''', ADD COLUMN IF NOT EXISTS "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            INHERIT scenario_parent."' || scenario_tables.tablename || '";';
            EXECUTE query;

            EXECUTE 'CREATE INDEX ON scenario_' || new_scenario_id || '."' || scenario_tables.tablename  || '" (scenario_id);';
            
            EXECUTE 'ANALYZE scenario_' || new_scenario_id || '."' || scenario_tables.tablename || '";';

          END IF;

      END LOOP;

      CLOSE scenario_cursor;

      OPEN scenario_view_cursor;

      LOOP

        FETCH scenario_view_cursor INTO scenario_views;

        EXIT WHEN NOT FOUND;

        query := CONCAT('CREATE OR REPLACE VIEW scenario_',new_scenario_id,'."',scenario_views.viewname,'" AS ',scenario_views.definition);

        EXECUTE query;

      END LOOP;

      CLOSE scenario_view_cursor;

      INSERT INTO public."project_tables" ("pid", "name", "file_name", "table_name", "status", "visible",
	    "type", "columns", "created_by", "updated_by") SELECT new_scenario_id, pt."name", pt."file_name", pt."table_name",
      pt."status", pt."visible", pt."type", pt."columns", user_name, user_name FROM public."project_tables" pt
      WHERE pt."pid"=scenario_id;

    END;

    /***copying  parameters table***/
    EXECUTE 'CREATE TABLE scenario_'|| new_scenario_id ||'."parameters" AS (SELECT * FROM scenario_' || scenario_id || '."parameters");';

    EXECUTE 'ALTER TABLE scenario_' || new_scenario_id || '."parameters" ALTER COLUMN id SET NOT NULL, ALTER COLUMN scenario_id SET DEFAULT ' ||
    new_scenario_id || ', INHERIT scenario_parent."parameters";';

    EXECUTE 'UPDATE scenario_' || new_scenario_id || '."parameters" SET scenario_id = ' || new_scenario_id;

    /***update scenario access***/
    SELECT INTO user_info p."id", p."role" FROM "users" p WHERE p."username" = user_name;

    IF user_info.role <> 'Consultant' THEN
      PERFORM * FROM update_scenario_access(user_info.id,ARRAY[new_scenario_id],true);
    END IF;

    RETURN QUERY SELECT new_scenario_id,scenario_name,new_scenario_updated_time,new_scenario_created_time,new_scenario_updated_user,new_scenario_created_user,new_scenario_tag_id, new_scenario_status;

  ELSE

    RAISE EXCEPTION 'scenario does not exist.';

  END IF;

END;

$$  LANGUAGE plpgsql;
