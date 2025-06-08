import { createID } from "@/lib/db/helper";
import { useDrizzle } from "@/lib/db/provider";
import { type JLPTLevel, JLPT_LEVELS, sessionsTable } from "@/lib/db/schema";
import { seedByLevel } from "@/lib/db/seed";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { and, count, eq, isNull } from "drizzle-orm";
import s from "./index.module.scss";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const db = useDrizzle();
	const navigate = useNavigate();

	const onClick = async (level: JLPTLevel) => {
		const sessions = await db
			.select({ count: count(), finishedAt: sessionsTable.finishedAt })
			.from(sessionsTable)
			.where(eq(sessionsTable.levelId, level))
			.groupBy(sessionsTable.finishedAt);

		const shouldFetch = sessions.length === 0;

		if (shouldFetch) {
			if (!confirm("해당 레벨의 데이터가 없어요. 다운로드 받을까요?")) {
				return;
			}
			await seedByLevel(db, level);
		}

		const onProgressSession = sessions.find(
			(session) => session.finishedAt === null,
		);

		if (onProgressSession) {
			const sessIds = await db
				.select({ id: sessionsTable.id })
				.from(sessionsTable)
				.where(
					and(
						eq(sessionsTable.levelId, level),
						isNull(sessionsTable.finishedAt),
					),
				)
				.limit(1);
			navigate({
				to: "/$sess",
				params: { sess: sessIds[0].id },
				viewTransition: {
					types: ["slide-left"],
				},
			});
		} else {
			const newSession = await db
				.insert(sessionsTable)
				.values({ levelId: level, id: createID() })
				.returning({ id: sessionsTable.id });
			navigate({
				to: "/$sess",
				params: { sess: newSession[0].id },
				viewTransition: {
					types: ["slide-left"],
				},
			});
		}
	};

	return (
		<main className={s.layout}>
			<div className={s.inner}>
				<h1 className={s.title}>JLPT 레벨 선택</h1>
				<nav className={s.levels}>
					{JLPT_LEVELS.map((level) => (
						<button
							type="button"
							key={level.toString()}
							className={s.levelItem}
							onClick={() => onClick(level)}
						>
							{level}
						</button>
					))}
				</nav>
			</div>
		</main>
	);
}
