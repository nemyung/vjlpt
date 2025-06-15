import { addDays, differenceInDays } from "date-fns";
import {
	and,
	asc,
	eq,
	getTableColumns,
	isNull,
	lte,
	or,
	sql,
} from "drizzle-orm";
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
				eq(readingsTable.expressionId, expressionsTable.id),
			)
			.innerJoin(meaningsTable, eq(readingsTable.id, meaningsTable.readingId))
			.leftJoin(
				vocabularyLearningProgressTable,
				eq(readingsTable.id, vocabularyLearningProgressTable.readingId),
			)
			.where(
				and(
					eq(readingsTable.levelId, level),
					lte(vocabularyLearningProgressTable.nextReviewDate, now),
				),
			)
			.groupBy(readingsTable.id, expressionsTable.expression)
			.orderBy(asc(vocabularyLearningProgressTable.nextReviewDate)) // nextReviewDate가 빠른 순으로 정렬
			.limit(limit);
	};

export const rate =
	(db: orm) => async (readingId: string, userRating: RatingNumber) => {
		const reviewTime = new Date(); // 복습이 발생한 현재 시간

		// 1. 해당 단어의 현재 FSRS 학습 진행 상태 조회
		const existingProgress =
			await db.query.vocabularyLearningProgressTable.findFirst({
				where: eq(vocabularyLearningProgressTable.readingId, readingId),
			});

		let currentFSRSCard: Card;
		let elapsedDays: number;
		let actualLastReviewDate: Date | undefined; // FSRS Card의 last_review에 사용될 실제 마지막 복습 날짜

		if (!existingProgress) {
			// 1-1. 이 단어에 대한 첫 복습 (vocabularyLearningProgressTable에 기록이 없는 경우)
			currentFSRSCard = createEmptyCard();
			elapsedDays = 0; // 첫 복습이므로 경과 일수는 0
			actualLastReviewDate = undefined; // 새 카드이므로 마지막 복습일 없음
		} else {
			// 1-2. 기존 단어 (vocabularyLearningProgressTable에 기록이 있는 경우)
			// 데이터베이스에서 가져온 값을 FSRS Card 객체로 변환합니다.
			actualLastReviewDate = existingProgress.lastReviewDate;

			// 이전 복습 시간으로부터 실제로 경과한 일수 계산 (현재 시간 - 마지막 복습 시간)
			elapsedDays = differenceInDays(reviewTime, actualLastReviewDate);

			// FSRS Card 객체 재구성: DB의 모든 관련 필드를 FSRS Card 타입에 맞춰 매핑
			currentFSRSCard = {
				due: existingProgress.nextReviewDate,
				stability: existingProgress.stability,
				difficulty: existingProgress.difficulty,
				elapsed_days: elapsedDays, // 계산된 elapsedDays 적용
				scheduled_days: differenceInDays(
					existingProgress.nextReviewDate,
					actualLastReviewDate,
				), // 기존 스케줄된 간격
				learning_steps: 0, // DB에 이 필드가 없다면 0 또는 적절한 기본값
				reps: 0, // DB에 이 필드가 없다면 0 또는 적절한 기본값
				lapses: existingProgress.lapses,
				state:
					existingProgress.status === "new"
						? State.New
						: existingProgress.status === "learning"
							? State.Learning
							: State.Review, // DB status를 FSRS State로 매핑
				last_review: actualLastReviewDate,
			};
		}

		// FSRS 알고리즘 실행: 업데이트된 카드 상태와 현재 복습 시점을 전달
		// FSRS.repeat()는 Record<Rating, SchedulingCard>를 반환합니다.
		const scheduling_cards = f.repeat(currentFSRSCard, reviewTime);
		logDebug("scheduling_cards", scheduling_cards);
		logDebug("Arrayified", Array.from(scheduling_cards));

		// 사용자의 rating에 해당하는 최종 카드 상태 (newCard)와 로그 (log) 가져오기
		const { card: newCard, log: reviewLogData } =
			Array.from(scheduling_cards)[userRating];

		// FSRS State를 DB status enum에 맞게 변환
		const newStatus =
			newCard.state === State.New
				? "new"
				: newCard.state === State.Learning
					? "learning"
					: "review"; // 'relearning' 상태가 DB enum에 없다면 'review'로 간주

		// 2. vocabularyLearningProgressTable 업데이트 (Upsert: 삽입 또는 업데이트)
		await db
			.insert(vocabularyLearningProgressTable)
			.values({
				readingId: readingId,
				stability: newCard.stability,
				difficulty: newCard.difficulty,
				lastReviewDate: reviewTime, // 현재 복습 시간으로 업데이트
				nextReviewDate: addDays(reviewTime, newCard.scheduled_days), // FSRS가 계산한 다음 복습일
				status: newStatus,
				lapses: newCard.lapses, // FSRS가 계산한 lapses
				// timeCreated는 기존 레코드의 것을 사용하거나 새로 생성될 경우에만 현재 시간
				timeCreated: existingProgress
					? existingProgress.timeCreated
					: new Date(),
				timeUpdated: new Date(), // 항상 업데이트
			})
			.onConflictDoUpdate({
				target: vocabularyLearningProgressTable.readingId, // readingId가 충돌 시 업데이트
				set: {
					stability: newCard.stability,
					difficulty: newCard.difficulty,
					lastReviewDate: reviewTime,
					nextReviewDate: addDays(reviewTime, newCard.scheduled_days),
					status: newStatus,
					lapses: newCard.lapses,
					timeUpdated: new Date(),
				},
			});

		// 3. reviewLogsTable에 복습 기록 삽입
		// reviewLogData 객체를 활용하여 reviewLogsTable을 채웁니다.
		await db.insert(reviewLogsTable).values({
			id: ulid(), // 새로운 고유 ID 생성
			readingId: readingId,
			// reviewLogData에서 가져온 필드들
			rating: reviewLogData.rating,
			timeReviewed: reviewLogData.review, // reviewLogData의 'review' 필드가 실제 복습 시간
			elapsedDays: reviewLogData.elapsed_days, // reviewLogData의 'elapsed_days' 필드 사용
			timeCreated: new Date(),
			timeUpdated: new Date(),
		});
	};
