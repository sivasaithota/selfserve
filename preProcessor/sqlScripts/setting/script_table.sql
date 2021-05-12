DROP TABLE IF EXISTS "script";

CREATE TABLE "script" (
  "id" SERIAL,
  "file_name" VARCHAR(200),
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "created_by" VARCHAR(255),
  "updated_by" VARCHAR(255)
);
