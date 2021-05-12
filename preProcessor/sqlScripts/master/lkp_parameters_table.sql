DROP TABLE IF EXISTS "lkp_parameters";

CREATE TABLE IF NOT EXISTS "lkp_parameters" (
	"id" SERIAL,
	"scenario_template_id" INTEGER,
	"type" VARCHAR(255),
	"validation" VARCHAR(255),
	"displayname" TEXT,
	"parameter" VARCHAR(255),
	"tooltip" TEXT,
	"default_value" TEXT DEFAULT null,
  "dependency_id" INTEGER,
  "column_name" TEXT,
  "parent_id" INTEGER,
  "group_name" VARCHAR(255),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
