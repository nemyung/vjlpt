ALTER TABLE "sessions" ALTER COLUMN "levelId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_levelId_levels_id_fk" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session_reading_interactions" ADD CONSTRAINT "session_reading_unq" UNIQUE("session_id","reading_id");