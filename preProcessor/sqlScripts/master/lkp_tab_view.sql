DROP TABLE IF EXISTS "lkp_tab_view";

CREATE TABLE IF NOT EXISTS "lkp_tab_view"(
  "id" SERIAL,
  "scenario_template_id" INTEGER,
  "type" VARCHAR(255),
  "value" VARCHAR(255)
);
