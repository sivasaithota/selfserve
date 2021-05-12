DROP TABLE IF EXISTS "tableau_extract_status";

CREATE TABLE IF NOT EXISTS "tableau_extract_status" (
	"id" SERIAL,
	"scenario_id" INTEGER,
	"type" VARCHAR(40),
	"status" VARCHAR(30),
  "logs" TEXT,
  "created_by" VARCHAR(255),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_by" VARCHAR(255),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
