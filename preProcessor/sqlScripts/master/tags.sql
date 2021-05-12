DROP TABLE IF EXISTS "tags";
CREATE TABLE IF NOT EXISTS "tags" (
	"id" SERIAL,
	"tag_name" VARCHAR(255),
	"type" VARCHAR(255),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255)
);
INSERT INTO "tags" ("tag_name","type","created_by") VALUES ('Untagged','scenario','Admin');
