DROP TABLE IF EXISTS "lkp_pages";

CREATE TABLE IF NOT EXISTS "lkp_pages"(
  "id" SERIAL,
  "scenario_template_id" INTEGER,
  "type" VARCHAR(255),
  "value" VARCHAR(255),
  "visible" BOOLEAN,
  "is_default" BOOLEAN
);
