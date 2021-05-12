DROP FUNCTION IF EXISTS upload_grid_data(INTEGER, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION upload_grid_data(scenario_id INTEGER, input_table_name TEXT, fileName TEXT, username TEXT)

RETURNS TABLE("file_name" TEXT, "status" TEXT, "updated_by" TEXT, "updated_at" TIMESTAMP) AS $$

DECLARE

  query TEXT;

  new_updated_time TIMESTAMP;

  new_status TEXT;

BEGIN

  query :='ALTER TABLE scenario_' || scenario_id || '."' || input_table_name || '" ADD COLUMN IF NOT EXISTS "jqgrid_id" SERIAL, ' ||
    ' ADD COLUMN IF NOT EXISTS "scenario_id" integer DEFAULT ' || scenario_id || ', ADD COLUMN IF NOT EXISTS "op_created_by" VARCHAR(255) DEFAULT ''' || username || ''', ADD COLUMN IF NOT EXISTS "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ' ||
    ' ADD COLUMN IF NOT EXISTS "op_updated_by" VARCHAR(255) DEFAULT ''' || username || ''', ADD COLUMN IF NOT EXISTS "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();';

  EXECUTE query;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = CONCAT('scenario_', scenario_id)
    AND table_name = input_table_name
    AND constraint_type = 'PRIMARY KEY'
  ) THEN

    EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || input_table_name || '" ADD PRIMARY KEY ("jqgrid_id")';

  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = CONCAT('scenario_', scenario_id)
    AND table_name = input_table_name
    AND constraint_type = 'CHECK'
  ) THEN

    EXECUTE 'ALTER TABLE scenario_' || scenario_id || '."' || input_table_name || '" ADD CHECK ("scenario_id" = ' || scenario_id || ');' ;

  END IF;

  query := CONCAT('UPDATE scenario_', scenario_id, '."', input_table_name, '" SET "op_created_by" = ''',username,''', "op_updated_by" = ''',username,'''');

  EXECUTE query;

  query := CONCAT('WITH upsert AS (UPDATE "project_tables" SET "updated_by"=''',username,''',"file_name"=''',fileName,''',"updated_at"=now()
  WHERE "pid"=',scenario_id,'and "table_name"=''',input_table_name,''' RETURNING "status", "updated_at")
  INSERT INTO "project_tables" ("pid", "name", "file_name", "status", "table_name", "type", "visible","created_by","updated_by")
  SELECT ',scenario_id, ',''', input_table_name, ''',''', fileName,''',''Uploaded successfully'',''', input_table_name,''',''input'',true,''',username,''',''',username,'''
  WHERE NOT EXISTS (SELECT * FROM upsert ) RETURNING "status", "updated_at";');

  EXECUTE query INTO new_status,new_updated_time ;

  UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

  EXECUTE 'ANALYZE scenario_' || scenario_id || '."' || input_table_name || '";';

  RETURN QUERY SELECT fileName, new_status, username, new_updated_time;

END;

$$  LANGUAGE plpgsql;
