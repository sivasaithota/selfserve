DROP TABLE IF EXISTS "execution";

CREATE TABLE "execution"
(
  "id" SERIAL,
  "scenario_template_id" INTEGER,
  "type" VARCHAR(50),
  "segment" VARCHAR(20),
  "action_desc" VARCHAR(80),
  "command_to_execute" VARCHAR(60),
  "script_id" SMALLINT,
  "scenario_specific" BOOLEAN DEFAULT FALSE,
  "tooltip" TEXT,
  "instance_type" TEXT DEFAULT 'default',
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "last_accessed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "created_by" VARCHAR(255),
  "updated_by" VARCHAR(255),
  "last_accessed_by" VARCHAR(255),
  "file_name" TEXT
);