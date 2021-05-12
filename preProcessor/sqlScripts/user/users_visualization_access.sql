DROP TABLE IF EXISTS "users_visualization_accesses";

CREATE TABLE IF NOT EXISTS "users_visualization_accesses" (
	"id" SERIAL,
	"user_id" INTEGER,
	"report_id" INTEGER,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	PRIMARY KEY ("id")
);
