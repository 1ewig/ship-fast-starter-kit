CREATE TABLE "better_auth"."two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "better_auth"."rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text,
	"count" integer,
	"last_request" integer
);
--> statement-breakpoint
ALTER TABLE "better_auth"."user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
--> statement-breakpoint
ALTER TABLE "better_auth"."user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "better_auth"."user" ADD COLUMN "ban_reason" text;
--> statement-breakpoint
ALTER TABLE "better_auth"."user" ADD COLUMN "ban_expires" timestamp;
--> statement-breakpoint
ALTER TABLE "better_auth"."user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "better_auth"."session" ADD COLUMN "impersonated_by" text;
--> statement-breakpoint
ALTER TABLE "better_auth"."two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "better_auth"."user"("id") ON DELETE cascade ON UPDATE no action;