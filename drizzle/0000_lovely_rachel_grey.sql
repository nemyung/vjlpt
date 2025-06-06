CREATE TABLE "expressions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"expression" text NOT NULL,
	"level_id" char(26) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meanings" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"reading_id" char(26) NOT NULL,
	"meaning" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "readings" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"expression_id" char(26) NOT NULL,
	"furigana" text NOT NULL,
	CONSTRAINT "expression_furigana_unq" UNIQUE("expression_id","furigana")
);
--> statement-breakpoint
CREATE TABLE "session_reading_statuses" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"session_id" char(26) NOT NULL,
	"reading_id" char(26) NOT NULL,
	"known_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT now() NOT NULL,
	"level_id" char(26) NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "expressions" ADD CONSTRAINT "expressions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "meanings" ADD CONSTRAINT "meanings_reading_id_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."readings"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "readings" ADD CONSTRAINT "readings_expression_id_expressions_id_fk" FOREIGN KEY ("expression_id") REFERENCES "public"."expressions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session_reading_statuses" ADD CONSTRAINT "session_reading_statuses_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reading_statuses" ADD CONSTRAINT "session_reading_statuses_reading_id_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."readings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;