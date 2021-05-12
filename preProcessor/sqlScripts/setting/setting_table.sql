DROP TABLE IF EXISTS "setting" CASCADE;

CREATE TABLE IF NOT EXISTS "setting" (
	"id" SERIAL,
	"scenario_template_id" INTEGER,
	"key" VARCHAR(200),
	"value" TEXT,
	"data_type" VARCHAR(20),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	PRIMARY KEY ("id"),
	UNIQUE ("key")
);
