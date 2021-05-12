DROP TABLE IF EXISTS "users";

CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL,
	"username" VARCHAR(255) UNIQUE,
	"email" VARCHAR(255) NOT NULL UNIQUE,
	"password" TEXT,
	"admin" BOOLEAN NOT NULL DEFAULT false,
	"companyName" VARCHAR(255),
	"lastLogin" TIMESTAMP WITH TIME ZONE,
	"role" VARCHAR(255),
	"home_page" VARCHAR(255),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"created_by" VARCHAR(255),
	"updated_by" VARCHAR(255),
	"attempt" INTEGER DEFAULT 0,
	PRIMARY KEY ("id")
);
