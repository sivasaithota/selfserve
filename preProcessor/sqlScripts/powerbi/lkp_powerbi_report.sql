DROP TABLE IF EXISTS "lkp_powerbi_report" CASCADE;

CREATE TABLE IF NOT EXISTS "lkp_powerbi_report" (
    "id" SERIAL,
    "order_id" SERIAL,
    "scenario_template_id" INTEGER,
    "report_type" VARCHAR(20) NOT NULL,
    "workspace_id" VARCHAR(40) NOT NULL,
    "report_id" VARCHAR(40) NOT NULL,
    "url" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "label" TEXT NOT NULL,
    "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255) NOT NULL
);
