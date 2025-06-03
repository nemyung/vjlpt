CREATE TABLE "chunk_meanings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chunk_meanings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chunkId" integer NOT NULL,
	"lang" text NOT NULL,
	"meaning" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "chunks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"expression" text NOT NULL,
	"levelId" text NOT NULL,
	"hurigana" text,
	CONSTRAINT "chunks_expression_unique" UNIQUE("expression")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_chunk_statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_chunk_statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" integer NOT NULL,
	"chunkId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"knownAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"levelId" text NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "chunk_meanings" ADD CONSTRAINT "chunk_meanings_chunkId_chunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_levelId_levels_id_fk" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session_chunk_statuses" ADD CONSTRAINT "session_chunk_statuses_sessionId_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_chunk_statuses" ADD CONSTRAINT "session_chunk_statuses_chunkId_chunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_levelId_levels_id_fk" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;