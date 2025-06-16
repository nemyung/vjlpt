import { differenceInDays } from "date-fns";
import { and, asc, eq, getTableColumns, lte, or, sql } from "drizzle-orm";
import {
  type Card,
  FSRS,
  State,
  createEmptyCard,
  generatorParameters,
} from "ts-fsrs";
import { ulid } from "ulid";
import type { orm } from "../db/drizzle";
import {
  type JLPTLevel,
  type RatingNumber,
  expressionsTable,
  meaningsTable,
  readingsTable,
  reviewLogsTable,
  vocabularyLearningProgressTable,
} from "../db/schema";
import { logDebug } from "../log";

const f = new FSRS(generatorParameters());

export const fetchDueReadings =
  (orm: orm) => async (limit: number, level: JLPTLevel) => {
    const now = new Date();

    return orm
      .select({
        ...getTableColumns(readingsTable),
        expression: expressionsTable.expression,
        meanings: sql<string[]>`json_agg(${meaningsTable.meaning})`,
      })
      .from(readingsTable)
      .innerJoin(
        expressionsTable,
        eq(readingsTable.expressionId, expressionsTable.id)
      )
      .innerJoin(meaningsTable, eq(readingsTable.id, meaningsTable.readingId))
      .leftJoin(
        vocabularyLearningProgressTable,
        eq(readingsTable.id, vocabularyLearningProgressTable.readingId)
      )
      .where(
        and(
          eq(readingsTable.levelId, level),
          lte(vocabularyLearningProgressTable.nextReviewDate, now)
        )
      )
      .groupBy(
        readingsTable.id,
        expressionsTable.expression,
        vocabularyLearningProgressTable.nextReviewDate
      )
      .orderBy(asc(vocabularyLearningProgressTable.nextReviewDate))
      .limit(limit);
  };

export const fetchNewReadings =
  (orm: orm) => async (limit: number, level: JLPTLevel) => {
    console.log(limit);
    return orm
      .select({
        ...getTableColumns(readingsTable),
        expression: expressionsTable.expression,
        meanings: sql<string[]>`json_agg(${meaningsTable.meaning})`,
      })
      .from(readingsTable)
      .innerJoin(
        expressionsTable,
        eq(readingsTable.expressionId, expressionsTable.id)
      )
      .innerJoin(meaningsTable, eq(readingsTable.id, meaningsTable.readingId))
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
      .groupBy(readingsTable.id, expressionsTable.expression)
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  };

export const rate =
  (db: orm) => async (readingId: string, userRating: RatingNumber) => {
    const now = new Date();

    const existingProgress =
      await db.query.vocabularyLearningProgressTable.findFirst({
        where: eq(vocabularyLearningProgressTable.readingId, readingId),
      });

    logDebug("readingId", readingId);
    logDebug("userRating", userRating);
    logDebug("existingProgress", existingProgress);

    let currentFSRSCard: Card;

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
          existingProgress.status === "new"
            ? State.New
            : existingProgress.status === "learning"
              ? State.Learning
              : State.Review,
        last_review: existingProgress.lastReviewDate,
      };
    }

    logDebug("currentFSRSCard", currentFSRSCard);

    const { card: newCard, log: reviewLogData } = f.next(
      currentFSRSCard,
      now,
      userRating
    );
    logDebug("newCard", newCard);
    logDebug("reviewLogData", reviewLogData);

    const newStatus =
      newCard.state === State.New
        ? "new"
        : newCard.state === State.Learning
          ? "learning"
          : "review";

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
      rating: reviewLogData.rating as RatingNumber,
      timeReviewed: reviewLogData.review,
      elapsedDays: reviewLogData.elapsed_days,
    });
  };
