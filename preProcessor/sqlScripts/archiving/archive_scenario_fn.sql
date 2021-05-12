DROP FUNCTION IF EXISTS archive_scenario (INTEGER[], TEXT);

CREATE OR REPLACE FUNCTION archive_scenario(scenarioIds INTEGER[], user_name TEXT)

RETURNS TABLE("id" INTEGER, "status" TEXT, "archived_by" VARCHAR(255), "archived_at" TIMESTAMP WITH TIME ZONE) AS $$

DECLARE

  scenarioId INTEGER;
  scenario_table RECORD;

BEGIN

  -- removing inheritance for all the tables of the passed scenario IDs

  FOREACH

    scenarioId in ARRAY scenarioIds

  LOOP

    FOR scenario_table IN

      SELECT tablename
      FROM lkp_data_upload_tables l, projects p
      WHERE p."scenario_template_id" = l."scenario_template_id"
      AND l."version" = p."version"
      AND p."id" = scenarioId
      AND l."type" NOT ILIKE '%view%'
      UNION SELECT 'parameters'

    LOOP

      -- If inheritance is defined for the table

      IF EXISTS (

        SELECT 1
        FROM pg_catalog.pg_inherits
        WHERE inhrelid = CONCAT('scenario_', scenarioId, '."', scenario_table.tablename, '"')::regclass

      ) THEN

        EXECUTE 'ALTER TABLE scenario_' || scenarioId || '."' || scenario_table.tablename ||
        '" NO INHERIT scenario_parent."' || scenario_table.tablename || '";';

      END IF;

    END LOOP;

  END LOOP;

  RETURN QUERY UPDATE "projects" p
    SET ("status", "archived_by", "archived_at") = ('archived', user_name, now())
    WHERE p."id" = ANY(scenarioIds)
    RETURNING p."id", p."status", p."archived_by", p."archived_at";

END;

$$  LANGUAGE plpgsql;
