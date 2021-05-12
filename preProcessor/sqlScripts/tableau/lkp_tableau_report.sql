DROP TABLE IF EXISTS "lkp_tableau_report" CASCADE;

CREATE TABLE IF NOT EXISTS "lkp_tableau_report" (
	"id" SERIAL,
	"order_id" SERIAL,
	"scenario_template_id" INTEGER,
	"type" TEXT,
	"url" TEXT,
	"label" TEXT,
  "project" TEXT,
  "workbook" TEXT,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
