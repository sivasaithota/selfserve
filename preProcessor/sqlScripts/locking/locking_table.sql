DROP TABLE IF EXISTS "locking";

CREATE TABLE IF NOT EXISTS "locking" (
  "id" SERIAL,
  "scenario_id" INTEGER,
  "username" TEXT,
  "locking_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "explicit_lock" BOOLEAN DEFAULT FALSE,
  "created_by" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_by" TEXT,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
); 