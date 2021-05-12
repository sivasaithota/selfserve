DROP FUNCTION IF EXISTS create_scenario(TEXT, INTEGER, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION create_scenario(scenario_name TEXT, template_id INTEGER, user_name TEXT, tag_id INTEGER)
RETURNS TABLE("id" INTEGER, "name" TEXT, "tag" INTEGER, "updated_at" TIMESTAMP, "updated_by" TEXT, "status" TEXT) AS $$

DECLARE

	scenario_id INTEGER;

	query TEXT;

	updated_at TIMESTAMP;

	updated_by TEXT;

	status TEXT;

	showParameters BOOLEAN;
	
	app_version INTEGER;

	scenario_table RECORD;

	scenario_views RECORD;

	user_info RECORD;

BEGIN

	SELECT INTO app_version MAX ("version") FROM "lkp_data_upload_tables";

	INSERT INTO public."projects" ("scenario_template_id","name","tag_id","created_by","updated_by","version") VALUES (template_id,scenario_name,tag_id,user_name,user_name,app_version) RETURNING projects."id", projects."updated_at", projects."updated_by", projects."status" INTO scenario_id,updated_at,updated_by,status;

	query := CONCAT('CREATE SCHEMA IF NOT EXISTS scenario_',scenario_id);

	EXECUTE query;

	PERFORM public."grant_schema_access" (CONCAT('scenario_', scenario_id));
	
	SELECT c."visible" INTO showParameters FROM lkp_pages c WHERE c."type" = 'parameters' AND c."scenario_template_id" = template_id;

	IF showParameters IS TRUE THEN

		query := CONCAT('CREATE TABLE scenario_',scenario_id,'."parameters" (
      "id" INTEGER NOT NUll,
		  "type" VARCHAR(255),
      "validation" VARCHAR(255),
		  "displayname" TEXT,
      "parameter" VARCHAR(255),
      "value" TEXT,
      "dependency_id" INTEGER,
      "parent_id" INTEGER,
      "column_name" text,
		  "tooltip" TEXT,
      "group_name" VARCHAR(255),
			"scenario_id" integer DEFAULT ', scenario_id,' CHECK ("scenario_id" = ',scenario_id,'),
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
		  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "created_by" VARCHAR(255),
			"updated_by" VARCHAR(255))
      INHERITS (scenario_parent."parameters");');

		EXECUTE query;

		EXECUTE 'CREATE INDEX ON scenario_' || scenario_id || '."parameters" (scenario_id);';

		query := CONCAT('INSERT INTO scenario_',scenario_id,'."parameters"
    ("id","type","validation","displayname", "parameter", "tooltip", "value", "group_name", "dependency_id","parent_id","column_name", "created_by", "updated_by")
    SELECT "id","type","validation","displayname","parameter","tooltip","default_value","group_name","dependency_id","parent_id","column_name",''',user_name,''',''',user_name,''' FROM public."lkp_parameters" ORDER BY "id";');

		EXECUTE query;

	END IF;

	FOR scenario_table IN

		SELECT l."tablename", l."columnlistwithtypes",lv."definition", l."type"
		FROM public."lkp_data_upload_tables" l
		LEFT JOIN lkp_views lv ON
		l."id"=lv."table_id"
		INNER JOIN "projects" p
			ON l."version" = p."version"
			AND p."id" = scenario_id
			AND l.scenario_template_id = p.scenario_template_id
		WHERE l."scenario_template_id" = template_id

	LOOP
		raise notice 'view...%',scenario_table.type;
		IF (scenario_table.type IN ('input_view','output_view') ) THEN

		BEGIN

			EXECUTE 'CREATE OR REPLACE VIEW scenario_' || scenario_id || '."' || scenario_views.tablename || '" AS ' ||
			scenario_views.definition;

			EXCEPTION WHEN others THEN NULL;

		END;

		ELSE

			EXECUTE 'CREATE TABLE IF NOT EXISTS scenario_' || scenario_id || '."' || scenario_table.tablename ||
			'"(' || scenario_table.columnlistwithtypes || ', "jqgrid_id" SERIAL PRIMARY KEY, ' ||
			'"scenario_id" integer DEFAULT ' || scenario_id || ' CHECK ("scenario_id" = ' || scenario_id ||
			'), "op_created_by" VARCHAR(255) DEFAULT ''Administrator'', "op_created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), ' ||
			'"op_updated_by" VARCHAR(255) DEFAULT ''Administrator'', "op_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now())' ||
			' INHERITS (scenario_parent."' || scenario_table.tablename || '");';

			EXECUTE 'CREATE INDEX ON scenario_' || scenario_id || '."' || scenario_table.tablename  || '" (scenario_id);';

		END IF;

	END LOOP;

  SELECT INTO user_info p."id", p."role" FROM "users" p WHERE p."username" = user_name;

  IF user_info.role <> 'Consultant' THEN
    PERFORM * FROM update_scenario_access(user_info.id,ARRAY[scenario_id],true);
  END IF;

	RETURN QUERY SELECT scenario_id,scenario_name,tag_id,updated_at,updated_by,status;

END;

$$  LANGUAGE plpgsql;
