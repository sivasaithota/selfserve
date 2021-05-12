DROP TABLE IF EXISTS "lkp_data_upload_tables";

CREATE TABLE IF NOT EXISTS "lkp_data_upload_tables" (
	"id" SERIAL,
	"scenario_template_id" INTEGER,
	"order_id" INTEGER,
	"tablename" varchar(255),
	"displayname" varchar(255),
	"columnlist" text,
	"displaylist" json,
	"columnlistwithtypes" text,
	"visible" boolean,
	"type" varchar(255),
	"unique_key" text,
	"visiblecolumns" text,
	"editablecolumns" text,
	"select_query" text,
	"tag" text DEFAULT 'Untagged',
	"columnfloat" JSON,
	"version" INTEGER DEFAULT 1,
	"filter" text,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
