import { differenceInDays } from "date-fns";
import { and, asc, eq, getTableColumns, lte, or, sql } from "drizzle-orm";
import { FSRS, createEmptyCard, generatorParameters } from "ts-fsrs";
import { ulid } from "ulid";
import { z } from "zod/v4";
import type { orm } from "../db/drizzle";
import {
  FSRSStatus,
  JLPT_LEVELS,
  expressionsTable,
  meaningsTable,
  readingsTable,
  reviewLogsTable,
  vocabularyLearningProgressTable,
  type JLPTLevel,
} from "../db/schema";
import { logDebug } from "../log";

import { FSRSState, type FSRSMeta, type Grade } from "./model";

const f = new FSRS(generatorParameters());

export const RawReading = z
  .object({
    readingId: z.string(),
    expressionId: z.string(),
    levelId: z.enum(JLPT_LEVELS),
    furigana: z.string(),
    timeCreated: z.date(),
    timeUpdated: z.date(),
    expression: z.string(),
    meanings: z.array(z.string()),

    stability: z.number().nullable(),
    difficulty: z.number().nullable(),
    lastReviewDate: z.date().nullable(),
    nextReviewDate: z.date().nullable(),
    status: z.enum(Object.values(FSRSStatus)).nullable(),
    learningSteps: z.number().nullable(),
    reps: z.number().nullable(),
    lapses: z.number().nullable(),
  })
  .transform((data) => {
    const now = new Date();
    const {
      stability,
      difficulty,
      nextReviewDate,
      lastReviewDate,
      learningSteps,
      reps,
      lapses,
      status,
      ...rest
    } = data;
    return {
      ...rest,
      fsrs:
        stability !== null &&
        difficulty !== null &&
        nextReviewDate !== null &&
        lastReviewDate !== null &&
        learningSteps !== null &&
        reps !== null &&
        lapses !== null &&
        status !== null
          ? {
              due: nextReviewDate,
              stability,
              difficulty,
              elapsed_days: differenceInDays(now, lastReviewDate),
              scheduled_days: differenceInDays(nextReviewDate, lastReviewDate),
              learning_steps: learningSteps,
              reps,
              lapses,
              state:
                status === FSRSStatus.New
                  ? FSRSState.New
                  : status === FSRSStatus.Learning
                    ? FSRSState.Learning
                    : FSRSState.Review,
              last_review: lastReviewDate,
            }
          : null,
    };
  });

export type RawReading = z.infer<typeof RawReading>;

const createMeaningsSubquery = (orm: orm) =>
  orm
    .select({
      readingId: meaningsTable.readingId,
      meanings: sql<string[]>`json_agg(${meaningsTable.meaning})`.as(
        "meanings"
      ),
    })
    .from(meaningsTable)
    .groupBy(meaningsTable.readingId)
    .as("meanings_agg");

export const fetchNewReadings =
  (orm: orm) => async (limit: number, level: JLPTLevel) => {
    const meaningsSubquery = createMeaningsSubquery(orm);

    return orm
      .select({
        ...getTableColumns(vocabularyLearningProgressTable),
        readingId: readingsTable.id,
        expressionId: readingsTable.expressionId,
        levelId: readingsTable.levelId,
        furigana: readingsTable.furigana,
        timeCreated: readingsTable.timeCreated,
        timeUpdated: readingsTable.timeUpdated,
        expression: expressionsTable.expression,
        meanings: meaningsSubquery.meanings,
      })
      .from(readingsTable)
      .innerJoin(
        expressionsTable,
        eq(readingsTable.expressionId, expressionsTable.id)
      )
      .innerJoin(
        meaningsSubquery,
        eq(readingsTable.id, meaningsSubquery.readingId)
      )
      .leftJoin(
        vocabularyLearningProgressTable,
        eq(readingsTable.id, vocabularyLearningProgressTable.readingId)
      )
      .where(
        and(
          eq(readingsTable.levelId, level),
          or(
            // User doesn't study yet
            sql`${vocabularyLearningProgressTable.readingId} IS NULL`,
            // User just learned this word
            eq(vocabularyLearningProgressTable.status, "new")
          )
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  };

export const rate = (db: orm) => async (readingId: string, rating: Grade) => {
  const now = new Date();

  const existingProgress =
    await db.query.vocabularyLearningProgressTable.findFirst({
      where: eq(vocabularyLearningProgressTable.readingId, readingId),
    });

  logDebug("readingId", readingId);
  logDebug("existingProgress", existingProgress);

  let currentFSRSCard: FSRSMeta;

  // The user hasn't studied this word yet
  if (!existingProgress) {
    currentFSRSCard = createEmptyCard();
  } else {
    currentFSRSCard = {
      due: existingProgress.nextReviewDate,
      stability: existingProgress.stability,
      difficulty: existingProgress.difficulty,
      elapsed_days: differenceInDays(now, existingProgress.lastReviewDate),
      scheduled_days: differenceInDays(
        existingProgress.nextReviewDate,
        existingProgress.lastReviewDate
      ),
      learning_steps: existingProgress.learningSteps,
      reps: existingProgress.reps,
      lapses: existingProgress.lapses,
      state:
        existingProgress.status === FSRSStatus.New
          ? FSRSState.New
          : existingProgress.status === FSRSStatus.Learning
            ? FSRSState.Learning
            : FSRSState.Review,
      last_review: existingProgress.lastReviewDate,
    };
  }

  logDebug("currentFSRSCard", currentFSRSCard);

  const { card: newCard, log: reviewLogData } = f.next(
    currentFSRSCard,
    now,
    rating
  );
  logDebug("newCard", newCard);
  logDebug("reviewLogData", reviewLogData);

  const newStatus =
    newCard.state === FSRSState.New
      ? FSRSStatus.New
      : newCard.state === FSRSState.Learning
        ? FSRSStatus.Learning
        : FSRSStatus.Review;

  logDebug("newStatus", newStatus);
  await db
    .insert(vocabularyLearningProgressTable)
    .values({
      readingId: readingId,
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      lastReviewDate: now,
      nextReviewDate: newCard.due,
      status: newStatus,
      learningSteps: newCard.learning_steps,
      reps: newCard.reps,
      lapses: newCard.lapses,
    })
    .onConflictDoUpdate({
      target: vocabularyLearningProgressTable.readingId,
      set: {
        stability: newCard.stability,
        difficulty: newCard.difficulty,
        lastReviewDate: now,
        nextReviewDate: newCard.due,
        status: newStatus,
        learningSteps: newCard.learning_steps,
        reps: newCard.reps,
        lapses: newCard.lapses,
        timeUpdated: new Date(),
      },
    });

  await db.insert(reviewLogsTable).values({
    id: ulid(),
    readingId: readingId,
    rating: reviewLogData.rating,
    timeReviewed: reviewLogData.review,
    elapsedDays: reviewLogData.elapsed_days,
  });
};

export const fetchDueReadings =
  (orm: orm) => async (limit: number, level: JLPTLevel) => {
    const now = new Date();
    const meaningsSubquery = createMeaningsSubquery(orm);

    return orm
      .select({
        ...getTableColumns(vocabularyLearningProgressTable),
        expressionId: readingsTable.expressionId,
        levelId: readingsTable.levelId,
        furigana: readingsTable.furigana,
        timeCreated: readingsTable.timeCreated,
        timeUpdated: readingsTable.timeUpdated,
        expression: expressionsTable.expression,
        meanings: meaningsSubquery.meanings,
      })
      .from(vocabularyLearningProgressTable)
      .innerJoin(
        readingsTable,
        eq(vocabularyLearningProgressTable.readingId, readingsTable.id)
      )
      .innerJoin(
        expressionsTable,
        eq(readingsTable.expressionId, expressionsTable.id)
      )
      .innerJoin(
        meaningsSubquery,
        eq(readingsTable.id, meaningsSubquery.readingId)
      )
      .where(
        and(
          eq(readingsTable.levelId, level),
          lte(vocabularyLearningProgressTable.nextReviewDate, now)
        )
      )
      .orderBy(asc(vocabularyLearningProgressTable.nextReviewDate))
      .limit(limit);
  };
