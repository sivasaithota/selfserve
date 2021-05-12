DROP TABLE IF EXISTS "lkp_commands_to_execute";

CREATE TABLE IF NOT EXISTS "lkp_commands_to_execute" (
	"id" SERIAL,
	"command" varchar(255),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255) DEFAULT 'Administrator',
	"updated_by" VARCHAR(255) DEFAULT 'Administrator'
);

INSERT INTO "lkp_commands_to_execute" ("command")
  VALUES
  ('python3'),
  ('Rscript'),
  ('sh'),
  ('python'),
	('node'),
  ('pandoc'),
	('r-py-gurobi'),
  ('python-tika'),
	('dotnetcore'),
	('java8'),
	('java14');
