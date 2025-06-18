import { relations, sql } from "drizzle-orm";
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
import { Rating } from "@/lib/fsrs/model";

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

export const levelsRelations = relations(levelsTable, ({ many }) => ({
  readings: many(readingsTable),
}));

export const expressionsTable = pgTable("expressions", {
  ...id,
  ...timestamps,
  expression: text().notNull(),
});

export const expressionsRelations = relations(expressionsTable, ({ many }) => ({
  readings: many(readingsTable),
}));

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

export const meaningsRelations = relations(meaningsTable, ({ one }) => ({
  reading: one(readingsTable, {
    fields: [meaningsTable.readingId],
    references: [readingsTable.id],
  }),
}));

/**
 * The current FSRS state of a reading
 */

export const FSRSStatus = {
  New: "new",
  Learning: "learning",
  Review: "review",
} as const;

export type FSRSStatus = (typeof FSRSStatus)[keyof typeof FSRSStatus];
export const isFSRSStatus = (status: string): status is FSRSStatus =>
  Object.values(FSRSStatus).some((s) => s === status);

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

    status: text({
      enum: [FSRSStatus.New, FSRSStatus.Learning, FSRSStatus.Review],
    })
      .notNull()
      .default(FSRSStatus.New),

    ...timestamps,
  }
);

export const vocabularyLearningProgressRelations = relations(
  vocabularyLearningProgressTable,
  ({ one }) => ({
    reading: one(readingsTable, {
      fields: [vocabularyLearningProgressTable.readingId],
      references: [readingsTable.id],
    }),
  })
);

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

    rating: integer().notNull().$type<Rating>(),
    timeReviewed: timestamp("time_reviewed").notNull().defaultNow(),
    elapsedDays: integer("elapsed_days").notNull(),
  },
  (table) => [
    check("elapsed_days_non_negative", sql`${table.elapsedDays} >= 0`),
  ]
);

export const reviewLogsRelations = relations(reviewLogsTable, ({ one }) => ({
  reading: one(readingsTable, {
    fields: [reviewLogsTable.readingId],
    references: [readingsTable.id],
  }),
}));

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

export const readingsRelations = relations(readingsTable, ({ one, many }) => ({
  level: one(levelsTable, {
    fields: [readingsTable.levelId],
    references: [levelsTable.id],
  }),
  expression: one(expressionsTable, {
    fields: [readingsTable.expressionId],
    references: [expressionsTable.id],
  }),
  meanings: many(meaningsTable),
  reviewLogs: many(reviewLogsTable),
  vocabularyLearningProgress: one(vocabularyLearningProgressTable, {
    fields: [readingsTable.id],
    references: [vocabularyLearningProgressTable.readingId],
  }),
}));
