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
	"level" text NOT NULL,
	"hurigana" text,
	CONSTRAINT "chunks_expression_unique" UNIQUE("expression")
);
--> statement-breakpoint
ALTER TABLE "chunk_meanings" ADD CONSTRAINT "chunk_meanings_chunkId_chunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."chunks"("id") ON DELETE cascade ON UPDATE no action;