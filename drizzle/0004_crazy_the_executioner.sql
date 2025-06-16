CREATE TABLE "review_logs" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"reading_id" char(26) NOT NULL,
	"rating" integer NOT NULL,
	"time_reviewed" timestamp DEFAULT now() NOT NULL,
	"elapsed_days" integer NOT NULL,
	CONSTRAINT "elapsed_days_non_negative" CHECK ("review_logs"."elapsed_days" >= 0)
);
--> statement-breakpoint
CREATE TABLE "vocabulary_learning_progress" (
	"reading_id" char(26) PRIMARY KEY NOT NULL,
	"stability" real NOT NULL,
	"difficulty" real NOT NULL,
	"last_review_date" timestamp NOT NULL,
	"next_review_date" timestamp NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"learning_steps" integer DEFAULT 0 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_reading_id_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."readings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_learning_progress" ADD CONSTRAINT "vocabulary_learning_progress_reading_id_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."readings"("id") ON DELETE cascade ON UPDATE no action;