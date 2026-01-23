CREATE TABLE "days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"wake_time" text NOT NULL,
	"sleep_time" text NOT NULL,
	"target_cigarettes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "days_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"time" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;