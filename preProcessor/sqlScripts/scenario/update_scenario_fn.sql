DROP FUNCTION IF EXISTS update_scenario(INTEGER, TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION update_scenario(scenarioId INTEGER, scenarioName TEXT, tagID INTEGER, username TEXT)

RETURNS TABLE("id" INTEGER, "name" VARCHAR(255), "tag" INTEGER, "updated_at" TIMESTAMP WITH TIME ZONE, "updated_by" VARCHAR(255)) AS $$

BEGIN

  RETURN QUERY UPDATE "projects" p
  SET ("name", "tag_id", "updated_by", "updated_at") = (scenarioName, tagID, username, now())
  WHERE p."id" = scenarioId
  RETURNING p."id", p."name", p."tag_id", p."updated_at", p."updated_by";

END;
$$  LANGUAGE plpgsql;