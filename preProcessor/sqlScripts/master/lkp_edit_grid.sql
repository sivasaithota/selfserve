DROP TABLE IF EXISTS "lkp_edit_grid";

CREATE TABLE IF NOT EXISTS "lkp_edit_grid" (
  "id" SERIAL,
  "scenario_template_id" INTEGER,
  "type" VARCHAR(255),
  "table_name" TEXT,
  "column_name" TEXT,
  "dependency_id" INTEGER,
  "parent_column_name" TEXT,
   PRIMARY KEY ("id")
);
