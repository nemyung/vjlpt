import { useDrizzle } from "@/lib/db/provider";
import {
	type JLPTLevel,
	expressionsTable,
	JLPT_LEVELS as levels,
} from "@/lib/db/schema";
import { seedByLevel } from "@/lib/db/seed";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { count, eq } from "drizzle-orm";
import s from "./index.module.scss";

export const Route = createFileRoute("/")({
	component: App,
	loader: async ({ context: { db } }) => {
		const counts = await Promise.all(
			levels.map((level) => {
				return db
					.select({ count: count() })
					.from(expressionsTable)
					.where(eq(expressionsTable.levelId, level));
			}),
		);

		return Object.fromEntries(
			counts.map((count, index) => [levels[index], count[0].count]),
		);
	},
});

function App() {
	const db = useDrizzle();
	const countByLevel = Route.useLoaderData();

	const navigate = useNavigate();

	const onClick = (level: JLPTLevel) => async () => {
		const shouldFetch = countByLevel[level] === 0;

		if (shouldFetch) {
			if (!confirm("해당 레벨의 데이터가 없어요. 다운로드 받을까요?")) {
				return;
			}

			await seedByLevel(db, level);
		}

		navigate({ to: "/$level", params: { level } });
	};

	return (
		<main className={s.layout}>
			<div className={s.inner}>
				<h1 className={s.title}>JLPT 레벨 선택</h1>
				<nav className={s.levels}>
					{levels.map((level) => (
						<button
							type="button"
							key={level}
							className={s.levelItem}
							onClick={onClick(level)}
						>
							{level}
						</button>
					))}
				</nav>
			</div>
		</main>
	);
}
