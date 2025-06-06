import { ulid } from "ulid";
import type { db, tx } from "./drizzle";
import {
	type JLPTLevel,
	JLPT_LEVELS,
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

const fetchJson = async (level: JLPTLevel) => {
	const r = await fetch(`/${level.toLowerCase()}.json`);
	const element: DataSourceElement[] = await r.json();
	return element;
};

const HashByLevel = {
	N5: "01JX2D79R86KZSMNQF4JAE3PQZ",
	N4: "01JX2D7TMC047CTP0E7ZDMWJ38",
	N3: "01JX2D7YRMDNMH24HDN6SQSGYV",
	N2: "01JX2D82D76RXSTY6SAJR6TF1B",
	N1: "01JX2D860FAC9KWQ0NVA9WZY18",
} satisfies Record<JLPTLevel, string>;

async function ensureSeedTable(db: db) {
	await db.execute(`
      create table if not exists seeds (
        hash text primary key,
        created_at timestamp not null default NOW()
      )
    `);
}

async function recordSeed(db: tx, level: JLPTLevel) {
	await db.execute(`
      insert into seeds (hash, created_at)
      values ('${HashByLevel[level]}', NOW())
      on conflict do nothing
    `);
}

async function getSeedByLevel(db: db, level: JLPTLevel) {
	const raw = await db.execute(`
      select hash from seeds where hash = '${HashByLevel[level]}'
    `);
	return raw.rows.map((row) => row.hash as string)[0];
}

export async function ensureLevels(db: db) {
	await db
		.insert(levelsTable)
		.values(JLPT_LEVELS.map((level) => ({ id: level })))
		.onConflictDoNothing();
}

export async function seedByLevel(db: db, level: JLPTLevel) {
	await ensureSeedTable(db);
	const seed = await getSeedByLevel(db, level);
	if (seed === HashByLevel[level]) {
		return;
	}
	const series = await fetchJson(level);

	await db.transaction(async (tx) => {
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
		await recordSeed(tx, level);
	});
}
