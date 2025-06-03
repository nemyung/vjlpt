import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const LANG = ["ko", "en"] as const;
export type Lang = (typeof LANG)[number];

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const levelsTable = pgTable("levels", {
	id: text({ enum: JLPT_LEVELS }).notNull().primaryKey(),
});

export const chunksTable = pgTable("chunks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({
		startWith: 1,
		minValue: 1,
	}),
	expression: text().notNull().unique(),
	levelId: text({ enum: JLPT_LEVELS })
		.notNull()
		.references(() => levelsTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	furigana: text(),
});

export const chunkMeaningsTable = pgTable("chunk_meanings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	chunkId: integer()
		.notNull()
		.references(() => chunksTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	lang: text({ enum: LANG }).notNull(),
	meaning: text().notNull(),
});

export const sessionsTable = pgTable("sessions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	levelId: text({ enum: JLPT_LEVELS })
		.notNull()
		.references(() => levelsTable.id),
	startedAt: timestamp().notNull().defaultNow(),
	endedAt: timestamp(),
});

export const sessionChunkStatusTable = pgTable("session_chunk_statuses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	sessionId: integer()
		.notNull()
		.references(() => sessionsTable.id, { onDelete: "cascade" }),
	chunkId: integer()
		.notNull()
		.references(() => chunksTable.id, { onDelete: "cascade" }),
	createdAt: timestamp().notNull().defaultNow(),
	knownAt: timestamp(),
});
