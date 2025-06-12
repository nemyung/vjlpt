/**
 * @todo The UI when the query returns no flashcards, meaning that there are no more flashcards to learn on this session.
 */
import FlashCard from "@/components/flash-card";
import flashCardStyles from "@/components/flash-card.module.scss";
import type { db } from "@/lib/db/drizzle";
import { useDrizzle } from "@/lib/db/provider";
import {
	type JLPTLevel,
	expressionsTable,
	meaningsTable,
	readingsTable,
	sessionReadingInteractionsTable,
	sessionsTable,
} from "@/lib/db/schema";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { and, eq, getTableColumns, notInArray, sql } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ulid } from "ulid";
import styles from "./sess.module.scss";

async function query(
	db: db,
	levelId: JLPTLevel,
	sessionId: string,
	limit = 25,
) {
	return await db
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
		.groupBy(readingsTable.id, expressionsTable.expression)
		.orderBy(sql`random()`)
		.limit(limit)
		.where(
			and(
				eq(readingsTable.levelId, levelId),
				notInArray(
					readingsTable.id,
					db
						.select({ readingId: sessionReadingInteractionsTable.readingId })
						.from(sessionReadingInteractionsTable)
						.where(eq(sessionReadingInteractionsTable.sessionId, sessionId)),
				),
			),
		);
}

export const Route = createFileRoute("/$sess")({
	component: RouteComponent,
	staleTime: 0,
	gcTime: 0,
	loader: async ({ context: { db }, params }) => {
		const session = await db.query.sessionsTable.findFirst({
			where: eq(sessionsTable.id, params.sess),
		});
		if (session === undefined) {
			throw new Error("The session is not found");
		}
		const levelId = session.levelId;
		return { flashcards: await query(db, levelId, params.sess), levelId };
	},
});

type FlashCardWithInteractionStatus = Awaited<
	ReturnType<typeof query>
>[number] & {
	interactionStatus?: "unknown" | "known";
};

function RouteComponent() {
	const db = useDrizzle();

	const params = Route.useParams();
	const { flashcards: initialFlashCards, levelId } = Route.useLoaderData();
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

	const [flashcards, setFlashcards] =
		useState<FlashCardWithInteractionStatus[]>(initialFlashCards);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPending, startTransition] = useTransition();

	const progressFillRef = useRef<HTMLDivElement>(null);

	const totalCards = flashcards.length;

	const fetchNextFlashCards = async () => {
		navigator.vibrate(50);
		startTransition(async () => {
			setFlashcards(await query(db, levelId, params.sess));
			setCurrentIndex(0);
			progressFillRef.current?.style.setProperty("--current-progress", "0");
		});
	};

	const goToNext = (direction: "left" | "right") => {
		if (isPending) {
			return;
		}
		if (currentIndex >= totalCards) {
			return;
		}

		const progressFillElement = progressFillRef.current;
		if (progressFillElement === null) {
			return;
		}
		const status = direction === "left" ? "unknown" : "known";

		startTransition(async () => {
			navigator.vibrate(50);
			const nextIndex = currentIndex + 1;

			await Promise.all([
				Promise.resolve().then(() => {
					progressFillElement.style.setProperty(
						"--current-progress",
						(nextIndex / totalCards).toString(),
					);
				}),

				db
					.insert(sessionReadingInteractionsTable)
					.values({
						id: ulid(),
						sessionId: params.sess,
						readingId: flashcards[currentIndex].id,
						status,
					})
					.onConflictDoUpdate({
						target: [
							sessionReadingInteractionsTable.sessionId,
							sessionReadingInteractionsTable.readingId,
						],
						set: {
							status,
						},
					}),
			]);

			setFlashcards((prev) => {
				const newFlashcards = prev.slice();
				newFlashcards[currentIndex] = {
					...newFlashcards[currentIndex],
					interactionStatus: status,
				};
				return newFlashcards;
			});
			setCurrentIndex(nextIndex);
		});
	};

	const currentFlashCard = flashcards[currentIndex];

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<button type="button" className={styles.closeButton} onClick={goBack}>
					<ChevronLeft />
				</button>

				<div className={styles.progressSection}>
					<div className={styles.progressBarBackground}>
						<div ref={progressFillRef} className={styles.progressBarFill} />
					</div>
				</div>
			</header>
			<div className={styles.contentContainer}>
				{currentIndex < totalCards ? (
					<div className={styles.cardWrapper}>
						<div className={flashCardStyles.cardLayout} />
						<FlashCard
							// TODO: There is a better way to render with entering animations..
							key={currentFlashCard.id}
							onSwipeLeft={() => {
								goToNext("left");
							}}
							onSwipeRight={() => {
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
