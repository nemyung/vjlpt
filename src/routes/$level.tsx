import FlashCard from "@/components/flash-card";
import flashCardStyles from "@/components/flash-card.module.scss";
import type { db } from "@/lib/db/drizzle";
import { useDrizzle } from "@/lib/db/provider";
import { type JLPTLevel, JLPT_LEVELS, isJLPTLevel } from "@/lib/db/schema";
import { fetchDueReadings, rate } from "@/lib/fsrs/repo";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { ulid } from "ulid";
import styles from "./level.module.scss";

async function query(
	db: db,
	levelId: JLPTLevel,
	sessionId: string,
	limit = 25,
) {
	return [];
	// return await db
	// 	.select({
	// 		...getTableColumns(readingsTable),
	// 		expression: expressionsTable.expression,
	// 		meanings: sql<string[]>`json_agg(${meaningsTable.meaning})`,
	// 	})
	// 	.from(readingsTable)
	// 	.innerJoin(
	// 		expressionsTable,
	// 		eq(readingsTable.expressionId, expressionsTable.id),
	// 	)
	// 	.innerJoin(meaningsTable, eq(readingsTable.id, meaningsTable.readingId))
	// 	.groupBy(readingsTable.id, expressionsTable.expression)
	// 	.orderBy(sql`random()`)
	// 	.limit(limit)
	// 	.where(
	//	eq(readingsTable.levelId, levelId)
	// 	);
}

export const Route = createFileRoute("/$level")({
	component: RouteComponent,
	staleTime: 0,
	gcTime: 0,
	loader: async ({ context: { db }, params }) => {
		const levelId = params.level;
		if (!isJLPTLevel(levelId)) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		return {
			levelId,
			flashCards: await fetchDueReadings(db)(10, levelId),
		} as const;
	},
});

// type N = Awaited<ReturnType<ReturnType<typeof fetchDueReadings>>>;

type FlashCardWithInteractionStatus = Awaited<
	ReturnType<ReturnType<typeof fetchDueReadings>>
>[number] & {
	interactionStatus?: "unknown" | "known";
};

function RouteComponent() {
	const db = useDrizzle();
	const d = Route.useLoaderData();
	const params = Route.useParams();
	const router = useRouter();

	const goBack = () => {
		navigator.vibrate(50);
		router.navigate({
			to: "/",
			replace: true,
			viewTransition: {
				types: ["slide-right"],
			},
		});
	};

	const [flashcards, setFlashcards] = useState<
		FlashCardWithInteractionStatus[]
	>(d.flashCards);
	const [currentIndex, setCurrentIndex] = useState(0);

	const fetchNextFlashCards = async () => {
		setFlashcards(await fetchDueReadings(db)(10, d.levelId));
		setCurrentIndex(0);
	};

	const onSwipeStart = async (direction: "left" | "right") => {
		const status = direction === "left" ? "unknown" : "known";
		await rate(db)(flashcards[currentIndex].id, status === "unknown" ? 1 : 3);
	};

	const goToNext = async (direction: "left" | "right") => {
		const status = direction === "left" ? "unknown" : "known";
		const nextIndex = currentIndex + 1;
		setFlashcards((prev) => {
			const newFlashcards = prev.slice();
			newFlashcards[currentIndex] = {
				...newFlashcards[currentIndex],
				interactionStatus: status,
			};
			return newFlashcards;
		});
		setCurrentIndex(nextIndex);
	};

	const totalCards = flashcards.length;
	const currentFlashCard = flashcards[currentIndex];
	const progress =
		totalCards === 0 ? "0" : (currentIndex / totalCards).toString();

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<button type="button" className={styles.closeButton} onClick={goBack}>
					<ChevronLeft />
				</button>

				<div className={styles.progressSection}>
					<div className={styles.progressBarBackground}>
						<div
							style={{ ["--current-progress" as string]: progress }}
							className={styles.progressBarFill}
						/>
					</div>
				</div>
			</header>
			<div className={styles.contentContainer}>
				{currentIndex < totalCards ? (
					<div className={styles.cardWrapper}>
						<div className={flashCardStyles.cardLayout} />
						<FlashCard
							key={currentFlashCard.id}
							onSwipeLeftStart={() => {
								onSwipeStart("left");
							}}
							onSwipeLeftDone={() => {
								goToNext("left");
							}}
							onSwipeRightStart={() => {
								console.log("onSwipeRightStart");
								onSwipeStart("right");
							}}
							onSwipeRightDone={() => {
								console.log("onSwipeRightDone");
								goToNext("right");
							}}
							{...currentFlashCard}
						/>
					</div>
				) : (
					<div className={styles.empty}>
						<div className={styles.currentProgressSummary}>
							<p>이번 학습을 모두 마쳤습니다</p>
							<p>총 {totalCards}개의 카드를 학습했어요.</p>
							<p>
								그중{" "}
								<b>
									{
										flashcards.filter(
											(card) => card.interactionStatus === "known",
										).length
									}
									개
								</b>
								를 안다고 체크했고,
								<br />
								<b>
									{
										flashcards.filter(
											(card) => card.interactionStatus === "unknown",
										).length
									}
									개
								</b>
								를 모른다고 체크했어요.
							</p>
						</div>

						<div className={styles.ctaRow}>
							<button type="button" className={styles.cta} onClick={goBack}>
								그만하기
							</button>
							<button
								type="button"
								className={styles.cta}
								onClick={fetchNextFlashCards}
							>
								계속 학습하기
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
