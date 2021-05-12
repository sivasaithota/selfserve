DROP TABLE IF EXISTS "macro_parameters" CASCADE;

CREATE TABLE IF NOT EXISTS "macro_parameters" (
	"id" SERIAL,
	"macro_id" SERIAL,
	"key" TEXT,
	"value" TEXT,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
