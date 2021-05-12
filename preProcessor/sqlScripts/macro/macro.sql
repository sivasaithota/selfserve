DROP TABLE IF EXISTS "macro" CASCADE;

CREATE TABLE IF NOT EXISTS "macro" (
	"id" SERIAL,
	"script" TEXT,
	"executor_id" INTEGER,
	"parameter" TEXT,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
