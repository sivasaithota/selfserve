DROP TABLE IF EXISTS "powerbi_import_settings" CASCADE;

CREATE TABLE IF NOT EXISTS "powerbi_import_settings" (
    "id" SERIAL,
    "type" varchar(40) NOT NULL,
    "type_id" varchar(40),
    "type_name" text,
    "run_import" boolean DEFAULT false,
    "segment" varchar(10),
    "created_by" varchar(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_by" varchar(255) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
