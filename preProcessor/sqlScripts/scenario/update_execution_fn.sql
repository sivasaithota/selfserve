DROP FUNCTION IF EXISTS update_execution(INTEGER, TEXT);

CREATE OR REPLACE FUNCTION update_execution(scenario_id integer, username TEXT)

RETURNS void AS $$

DECLARE

	query TEXT;

	CNT BOOLEAN;

	executionUpdateMetaEnable BOOLEAN;

	table_cursor CURSOR FOR
		SELECT "tablename", "displayname", "visible", "columnlistwithtypes", "type"
		FROM public."lkp_data_upload_tables" l
		JOIN "projects" p ON p."scenario_template_id"=l."scenario_template_id" AND l."version" = p."version"
		WHERE p."id"=scenario_id AND l."type" IN ('input','output');

	table_record RECORD;

BEGIN

	SELECT value from public."setting" INTO executionUpdateMetaEnable WHERE "key"='executionUpdateMetaEnable';

	OPEN table_cursor;

			LOOP
					FETCH table_cursor INTO table_record;

					EXIT WHEN NOT FOUND;

			DECLARE

					_var1 TEXT;

					_var2 TEXT;

					newTableName TEXT;

			BEGIN

				query := CONCAT('SELECT id FROM "project_tables" WHERE "table_name" = ''',table_record.tablename,''' AND "pid"=''',scenario_id,'''');

				EXECUTE query INTO _var1;

				IF _var1 IS NULL THEN
					INSERT INTO "project_tables" ("pid", "table_name", "name", "visible", "columns", "status", "type")
						VALUES (scenario_id, table_record.tablename,
										table_record.displayname,
										table_record.visible,
										table_record.columnlistwithtypes,
										'Uploaded Successfully',
										table_record.type);

				ELSE

					UPDATE "project_tables" SET "updated_by"= username, "updated_at" = now() WHERE "table_name" = '' || table_record.tablename || '' AND "pid" = scenario_id;

				END IF;

				UPDATE "projects" SET "updated_by" = username, "updated_at" = now() WHERE "id" = scenario_id;

				query := CONCAT('SELECT table_name FROM information_schema.tables WHERE table_schema=''scenario_',scenario_id,''' AND table_name = ''',table_record.tablename,''';');

				EXECUTE query INTO _var2;

				IF _var2 IS NOT NULL THEN

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

					IF (table_record.type='output' AND executionUpdateMetaEnable='true') THEN

						query := CONCAT ('UPDATE scenario_',scenario_id,'."',table_record.tablename,'" SET "op_updated_by" = ''',username,''', "op_updated_at" = now()');

						EXECUTE query;

					END IF;

				END IF;

				EXECUTE 'ANALYZE scenario_' || scenario_id || '."' || table_record.tablename || '";';

			END;

		END LOOP;

	CLOSE table_cursor;

END;

$$  LANGUAGE plpgsql;
