import { useDrizzle } from "@/lib/db/provider";
import { type JLPTLevel, JLPT_LEVELS, readingsTable } from "@/lib/db/schema";
import { seedByLevel } from "@/lib/db/seed";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { count, eq } from "drizzle-orm";
import s from "./index.module.scss";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const db = useDrizzle();
	const navigate = useNavigate();

	const onClick = async (level: JLPTLevel) => {
		const sessions = await db
			.select({ count: count() })
			.from(readingsTable)
			.where(eq(readingsTable.levelId, level));

		const shouldFetch = sessions.length === 0;

		if (shouldFetch) {
			if (!confirm("해당 레벨의 데이터가 없어요. 다운로드 받을까요?")) {
				return;
			}
			await seedByLevel(db, level);
		}

		navigator.vibrate(100);
		navigate({
			to: "/$level",
			params: { level },
			viewTransition: {
				types: ["slide-left"],
			},
		});
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
