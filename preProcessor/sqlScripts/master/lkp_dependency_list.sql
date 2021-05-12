DROP TABLE IF EXISTS "lkp_dependency_list";

CREATE TABLE IF NOT EXISTS "lkp_dependency_list" (
  "id" SERIAL,
  "custom_sql" TEXT,
  "dependent_schema_name" TEXT,
  "dependent_table_name" TEXT,
  "custom_values" BOOLEAN ,
  "dependent_column_name" TEXT,
   PRIMARY KEY ("id")
);
