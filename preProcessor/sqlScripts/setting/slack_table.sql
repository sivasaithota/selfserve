DROP TABLE IF EXISTS "slack_settings" CASCADE;

CREATE TABLE IF NOT EXISTS "slack_settings" (
	"id" SERIAL,
	"type" TEXT,
	"color" TEXT,
	"api_token" TEXT,
	"channel_id" TEXT,
	"support_name" TEXT,
	"box_header" TEXT,
	"bot_username" TEXT,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255)
);
