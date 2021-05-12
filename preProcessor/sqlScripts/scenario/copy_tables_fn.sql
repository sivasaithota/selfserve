DROP FUNCTION IF EXISTS copy_tables(INTEGER, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION copy_tables(scenario_id INTEGER, fileName TEXT, username TEXT, segment TEXT)

RETURNS VOID AS $$

DECLARE

  query TEXT;

  tables CURSOR FOR
    SELECT l."tablename", l."columnlist"
    FROM public."lkp_data_upload_tables" l
    INNER JOIN "projects" p 
      ON l."version" = p."version"
      AND p."id" = scenario_id
      AND l.scenario_template_id = p.scenario_template_id
    WHERE l."type" = segment;

BEGIN


  DELETE FROM "project_tables" as pr WHERE pr."pid" = scenario_id AND pr."type" = segment;

  FOR table_record IN tables LOOP

    query := CONCAT('INSERT INTO "project_tables" ("pid", "name", "file_name", "status", "table_name", "type", "visible", "columns", "created_at","updated_at","created_by","updated_by") VALUES (',scenario_id,',''',table_record.tablename,''',''',fileName,''',''Uploaded successfully'',''',table_record.tablename,''',''',segment,''',true,''',table_record.columnlist,''',now(),now(),''',username,''',''',username,''');');

    EXECUTE query;

    IF (segment=ANY ('{input,output}'::text[])) THEN
      query := CONCAT ('ALTER TABLE scenario_',scenario_id,'."',table_record.tablename,'" ADD COLUMN IF NOT EXISTS "jqgrid_id" serial, ADD COLUMN IF NOT EXISTS "scenario_id" INTEGER DEFAULT ', scenario_id, ', ADD COLUMN IF NOT EXISTS "op_created_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ADD COLUMN IF NOT EXISTS "op_updated_by" VARCHAR(255) DEFAULT ''Administrator'', ADD COLUMN IF NOT EXISTS "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();');
      EXECUTE query;
      
      -- Adding PRIMARY KEY constraint to the jqgrid_id column of the table if constraint is not defined yet
	    IF NOT EXISTS (
	
	      SELECT 1
	      FROM information_schema.table_constraints
	      WHERE table_schema = CONCAT('scenario_', scenario_id)
	      AND table_name = table_record.tablename
	      AND constraint_type = 'PRIMARY KEY'
	
	    ) THEN
	
	      EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || table_record.tablename || '" ADD PRIMARY KEY ("jqgrid_id")';
	
	    END IF;
	
	    -- Make the table inherit from the appropriate table in scenario_parent schema if that inheritance is not defined yet
	    IF NOT EXISTS (
	
	      SELECT 1
	      FROM pg_catalog.pg_inherits
	      WHERE inhrelid = CONCAT('scenario_', scenario_id, '."', table_record.tablename, '"')::regclass
	
	    ) THEN
	
	      EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || table_record.tablename  ||
	      '" INHERIT scenario_parent."' || table_record.tablename || '";';
	
	    END IF;
      
    END IF;

  END LOOP;

  UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

END;

$$  LANGUAGE plpgsql;
