DROP SCHEMA IF EXISTS scenario_1;

CREATE SCHEMA IF NOT EXISTS scenario_1;

DROP TABLE IF EXISTS scenario_1."parameters";

CREATE TABLE IF NOT EXISTS scenario_1."parameters" (
	"id" SERIAL,
	"type" VARCHAR(255),
	"validation" VARCHAR(255),
	"displayname" TEXT,
	"parameter" VARCHAR(255),
	"value" TEXT,
	"tooltip" TEXT,
    "group_name" VARCHAR(255),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255)
);