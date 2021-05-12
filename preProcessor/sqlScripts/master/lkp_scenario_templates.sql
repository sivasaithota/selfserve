DROP TABLE IF EXISTS "lkp_scenario_templates";

CREATE TABLE IF NOT EXISTS "lkp_scenario_templates"(
  "id" SERIAL,
  "name" VARCHAR(255),
  PRIMARY KEY ("id")
);
