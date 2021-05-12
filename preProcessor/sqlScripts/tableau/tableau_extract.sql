DROP TABLE IF EXISTS "tableauExtract";

CREATE TABLE IF NOT EXISTS "tableauExtract" (
  "id" SERIAL,
  "type" VARCHAR(40),
  "typeId" VARCHAR(40),
  "typeName" TEXT,
  "runExtract" BOOLEAN DEFAULT FALSE,
  "segment" VARCHAR(10),
  "createdBy" VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedBy" VARCHAR(255),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);