import FlashCard from "@/components/flash-card";
import { useDrizzle } from "@/lib/db/provider";
import {
	expressionsTable,
	meaningsTable,
	readingsTable,
	sessionReadingInteractionsTable,
	sessionsTable,
} from "@/lib/db/schema";
import {
	createFileRoute,
	useCanGoBack,
	useRouter,
} from "@tanstack/react-router";
import clsx from "clsx";
import { and, eq, getTableColumns, notInArray, sql } from "drizzle-orm";
import { Check, ChevronLeft, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ulid } from "ulid";
import styles from "./sess.module.scss";

export const Route = createFileRoute("/$sess")({
	component: RouteComponent,
	loader: async ({ context: { db }, params }) => {
		const session = await db.query.sessionsTable.findFirst({
			where: eq(sessionsTable.id, params.sess),
		});
		if (session === undefined) {
			throw new Error("The session is not found");
		}

		const levelId = session.levelId;

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
			.where(
				and(
					eq(readingsTable.levelId, levelId),
					notInArray(
						readingsTable.id,
						db
							.select({ readingId: sessionReadingInteractionsTable.readingId })
							.from(sessionReadingInteractionsTable)
							.where(
								eq(sessionReadingInteractionsTable.sessionId, params.sess),
							),
					),
				),
			);
	},
});

function RouteComponent() {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const flashcards = Route.useLoaderData();
	console.log(flashcards.length);
	const params = Route.useParams();
	const db = useDrizzle();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPending, startTransition] = useTransition();
	const currentCardRef = useRef<HTMLDivElement>(null);

	const totalCards = flashcards.length;

	const goToNext = (direction: "left" | "right") => {
		if (currentIndex < totalCards - 1 && !isPending) {
			startTransition(async () => {
				const currentCardElement = currentCardRef.current;

				if (currentCardElement) {
					// 애니메이션 설정
					const translateX = direction === "left" ? "-120%" : "120%";
					const rotate = direction === "left" ? "-15deg" : "15deg";

					// Web Animations API 사용
					const animation = currentCardElement.animate(
						[
							{
								transform: "translateX(0) rotate(0deg)",
								opacity: "1",
							},
							{
								transform: `translateX(${translateX}) rotate(${rotate})`,
								opacity: "0",
							},
						],
						{
							duration: 300,
							easing: "ease-out",
							fill: "forwards",
						},
					);

					// 애니메이션 완료까지 대기
					await Promise.all([
						animation.finished,
						db.insert(sessionReadingInteractionsTable).values({
							id: ulid(),
							sessionId: params.sess,
							readingId: flashcards[currentIndex].id,
							status: direction === "left" ? "unknown" : "known",
						}),
					]);

					// 상태 업데이트
					setCurrentIndex(currentIndex + 1);
				}
			});
		}
	};

	// 완료된 경우
	if (totalCards === 0) {
		return null;
	}

	// 마지막 카드까지 완료한 경우
	if (currentIndex >= totalCards) {
		return null;
	}

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				{canGoBack && (
					<button
						type="button"
						className={styles.closeButton}
						onClick={() => router.history.back()}
					>
						<ChevronLeft />
					</button>
				)}

				<div className={styles.progressSection}>
					<div className={styles.progressBarBackground}>
						<div
							className={styles.progressBarFill}
							style={{
								["--current-progress" as string]: currentIndex / totalCards,
							}}
						/>
					</div>
				</div>
			</header>
			<div className={styles.contentContainer}>
				{flashcards
					.slice(currentIndex, currentIndex + 3)
					.map((flashCard, relativeIndex) => {
						return (
							<div
								key={flashCard.id}
								className={styles.cardWrapper}
								ref={relativeIndex === 0 ? currentCardRef : null}
								style={{
									zIndex: 3 - relativeIndex,
								}}
							>
								<FlashCard {...flashCard} />
							</div>
						);
					})}
			</div>

			<div className={styles.actionRow}>
				<button
					type="button"
					onClick={() => {
						// TODO: "몰라요" 상태를 서버에 저장
						goToNext("left");
					}}
					className={clsx(styles.actionCTA, styles.study)}
					disabled={isPending}
				>
					<X />
				</button>
				<button
					type="button"
					onClick={() => {
						// TODO: "공부할래요" 상태를 서버에 저장
						goToNext("right");
					}}
					className={clsx(styles.actionCTA, styles.next)}
					disabled={isPending}
				>
					<Check />
				</button>
			</div>
		</div>
	);
}
