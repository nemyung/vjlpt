import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const chunksTable = pgTable("chunks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({
		startWith: 1,
		minValue: 1,
	}),
	expression: text().notNull().unique(),
	level: text({ enum: ["N5", "N4", "N3", "N2", "N1"] }).notNull(),
	hurigana: text(),
});

export const chunkMeaningsTable = pgTable("chunk_meanings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	chunkId: integer()
		.notNull()
		.references(() => chunksTable.id, {
			onDelete: "cascade",
		}),
	lang: text({ enum: ["ko", "en"] }).notNull(),
	meaning: text().notNull(),
});
