DROP TABLE IF EXISTS "projects";

CREATE TABLE IF NOT EXISTS "projects" (
	"id" SERIAL,
	"scenario_template_id" INTEGER,
	"order_id" SERIAL,
	"name" VARCHAR(255) UNIQUE,
	"tag_id" INTEGER DEFAULT 1,
	"status" TEXT NOT NULL DEFAULT 'active',
	"version" INTEGER DEFAULT 1,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"archived_at" TIMESTAMP WITH TIME ZONE,
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	"archived_by" VARCHAR(255),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "project_tables" (
	"id" SERIAL,
	"pid" INTEGER,
	"name" VARCHAR(255),
	"file_name" VARCHAR(255),
	"table_name" TEXT,
	"status" VARCHAR(255),
	"visible" BOOLEAN,
	"type" VARCHAR(255),
	"columns" TEXT,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	PRIMARY KEY ("id")
);
