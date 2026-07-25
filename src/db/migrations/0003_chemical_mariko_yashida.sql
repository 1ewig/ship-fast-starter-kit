CREATE TABLE "better_auth"."email_budget_bucket" (
	"id" text PRIMARY KEY NOT NULL,
	"tokens" integer NOT NULL,
	"max_tokens" integer DEFAULT 5 NOT NULL,
	"last_refilled_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
