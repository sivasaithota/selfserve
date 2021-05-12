DROP TABLE IF EXISTS "lkp_views";

CREATE TABLE IF NOT EXISTS "lkp_views" (
  "id" SERIAL,
  "table_id" INTEGER,
  "definition" TEXT,
  PRIMARY KEY ("id")
);
