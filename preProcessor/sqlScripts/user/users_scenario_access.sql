DROP TABLE IF EXISTS "users_scenario_accesses";

CREATE TABLE IF NOT EXISTS "users_scenario_accesses" (
	"id" SERIAL,
	"user_id" INTEGER,
	"scenario_id" INTEGER,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	PRIMARY KEY ("id")
);
