DROP TABLE IF EXISTS "lkp_row_view";

CREATE TABLE IF NOT EXISTS "lkp_row_view" (
	"id" SERIAL,
	"scenario_template_id" INTEGER,
	"tablename" varchar(255),
  "column_position" JSON,
  "column_order" JSON
);
