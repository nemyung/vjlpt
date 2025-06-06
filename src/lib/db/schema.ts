import { char, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const timestamps = {
	timeCreated: timestamp("time_created").notNull().defaultNow(),
	timeUpdated: timestamp("time_updated").notNull().defaultNow(),
};

export const ulid = (name: string) => char(name, { length: 26 });

export const id = {
	get id() {
		return ulid("id").primaryKey();
	},
};

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const levelsTable = pgTable("levels", {
	id: text({ enum: JLPT_LEVELS }).notNull().primaryKey(),
});

export const expressionsTable = pgTable("expressions", {
	...id,
	...timestamps,
	expression: text().notNull(),
	levelId: ulid("level_id")
		.notNull()
		.references(() => levelsTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
});

export const readingsTable = pgTable(
	"readings",
	{
		...id,
		...timestamps,
		expressionId: ulid("expression_id")
			.notNull()
			.references(() => expressionsTable.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		furigana: text().notNull(),
	},
	(table) => [
		unique("expression_furigana_unq").on(table.expressionId, table.furigana),
	],
);

export const meaningsTable = pgTable("meanings", {
	...id,
	...timestamps,
	readingId: ulid("reading_id")
		.notNull()
		.references(() => readingsTable.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	meaning: text().notNull(),
});

export const sessionsTable = pgTable("sessions", {
	...id,
	...timestamps,
	levelId: ulid("level_id")
		.notNull()
		.references(() => levelsTable.id),
	endedAt: timestamp("ended_at"),
});

export const sessionReadingStatusTable = pgTable("session_reading_statuses", {
	...id,
	...timestamps,
	sessionId: ulid("session_id")
		.notNull()
		.references(() => sessionsTable.id, { onDelete: "cascade" }),
	readingId: ulid("reading_id")
		.notNull()
		.references(() => readingsTable.id, { onDelete: "cascade" }),
	knownAt: timestamp("known_at").notNull().defaultNow(),
});
