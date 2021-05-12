DROP TABLE IF EXISTS "lkp_script_instance";

CREATE TABLE "lkp_script_instance" (
  "id" SERIAL,
  "display_name" VARCHAR(200),
  "description" VARCHAR(255)
);

INSERT INTO "lkp_script_instance" ("display_name", "description")
  VALUES
  ('default', 'Runs on the same machine'),
  ('small', 'Small (4 core / 16 GB Machine)'),
  ('medium', 'Medium (8 Core / 32 GB Machine)'),
  ('large', 'Large (16 Core / 64 GB Machine)'),
  ('xlarge', 'X-Large (96 Core / 192 GB Machine');
