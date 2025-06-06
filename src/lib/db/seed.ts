import { ulid } from "ulid";
import type { db } from "./drizzle";
import {
	expressionsTable,
	levelsTable,
	meaningsTable,
	readingsTable,
} from "./schema";

type DataSourceElement = {
	id: string;
	word: string;
	meaning_en: string;
	furigana: string;
	meaning_ko: string[];
};

const fetchJson = async (name: string, level: string) => {
	const r = await fetch(`/${name}.json`);
	const element: DataSourceElement[] = await r.json();
	return { series: element, level };
};

const HASH = "01JX223Q9WHVT76026Q61BJ6W4";

async function ensureSeedTable(db: db) {
	await db.execute(`
      create table if not exists seeds (
        hash text primary key,
        created_at timestamp not null default NOW()
      )
    `);
}

async function recordSeed(db: db) {
	await db.execute(`
      insert into seeds (hash, created_at)
      values ('${HASH}', NOW())
      on conflict do nothing
    `);
}

async function getSeed(db: db) {
	const raw = await db.execute(`
      select hash from seeds
    `);
	return raw.rows.map((row) => row.hash as string);
}

export async function seed(db: db) {
	await ensureSeedTable(db);
	const seeds = await getSeed(db);
	if (seeds.includes(HASH)) {
		return;
	}

	const data = await Promise.all([
		fetchJson("n1", "N1"),
		fetchJson("n2", "N2"),
		fetchJson("n3", "N3"),
		fetchJson("n4", "N4"),
		fetchJson("n5", "N5"),
	]);

	await db.transaction(async (tx) => {
		await tx
			.insert(levelsTable)
			.values([
				{ id: "N5" },
				{ id: "N4" },
				{ id: "N3" },
				{ id: "N2" },
				{ id: "N1" },
			])
			.onConflictDoNothing();

		for (const { series, level } of data) {
			const expressions = series.map((item) => ({
				id: item.id,
				expression: item.word,
				levelId: level,
			}));

			const readings: (typeof readingsTable.$inferInsert)[] = [];
			const meanings: (typeof meaningsTable.$inferInsert)[] = [];

			for (const item of series) {
				const readingId = ulid();
				readings.push({
					id: readingId,
					expressionId: item.id,
					furigana: item.furigana,
				});

				for (const meaning of item.meaning_ko) {
					meanings.push({
						id: ulid(),
						readingId: readingId,
						meaning: meaning,
					});
				}
			}

			if (expressions.length > 0) {
				await tx
					.insert(expressionsTable)
					.values(expressions)
					.onConflictDoNothing();
			}
			if (readings.length > 0) {
				await tx.insert(readingsTable).values(readings).onConflictDoNothing();
			}
			if (meanings.length > 0) {
				await tx.insert(meaningsTable).values(meanings).onConflictDoNothing();
			}
		}
	});

	await recordSeed(db);
}
