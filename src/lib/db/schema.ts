import { sql } from "drizzle-orm";
import {
  char,
  check,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

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
export const isJLPTLevel = (level: string): level is JLPTLevel =>
  JLPT_LEVELS.some((l) => l === level);

export const levelsTable = pgTable("levels", {
  id: text({ enum: JLPT_LEVELS }).notNull().primaryKey(),
});

export const expressionsTable = pgTable("expressions", {
  ...id,
  ...timestamps,
  expression: text().notNull(),
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
    levelId: text({ enum: JLPT_LEVELS })
      .notNull()
      .references(() => levelsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    furigana: text().notNull(),
  },
  (table) => [
    unique("expression_furigana_unq").on(table.expressionId, table.furigana),
  ]
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

/**
 * The current FSRS state of a reading
 */
export const vocabularyLearningProgressTable = pgTable(
  "vocabulary_learning_progress",
  {
    readingId: ulid("reading_id")
      .primaryKey()
      .references(() => readingsTable.id, { onDelete: "cascade" }),

    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    lastReviewDate: timestamp("last_review_date").notNull(),
    nextReviewDate: timestamp("next_review_date").notNull(),

    // Times the card was forgotten or remembered incorrectly
    lapses: integer("lapses").notNull().default(0),
    // Keeps track of the current step during the (re)learning stages
    learningSteps: integer("learning_steps").notNull().default(0),
    // Total number of times the card has been reviewed
    reps: integer("reps").notNull().default(0),

    status: text({ enum: ["new", "learning", "review"] })
      .notNull()
      .default("new"),

    ...timestamps,
  }
);

export const RATING_NUMBERS = [
  1, // again
  2, // hard
  3, // good
  4, // easy
] as const;
export type RatingNumber = (typeof RATING_NUMBERS)[number];

/**
 * The review history of a reading
 */
export const reviewLogsTable = pgTable(
  "review_logs",
  {
    ...id,
    ...timestamps,

    readingId: ulid("reading_id")
      .notNull()
      .references(() => readingsTable.id, { onDelete: "cascade" }),

    rating: integer().notNull().$type<RatingNumber>(),
    timeReviewed: timestamp("time_reviewed").notNull().defaultNow(),
    elapsedDays: integer("elapsed_days").notNull(),
  },
  (table) => [
    check("elapsed_days_non_negative", sql`${table.elapsedDays} >= 0`),
  ]
);
