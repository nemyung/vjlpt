import fs from "node:fs";
import path from "node:path";
import { ulid } from "ulid";

import n1 from "./n1.json";
import n2 from "./n2.json";
import n3 from "./n3.json";
import n4 from "./n4.json";
import n5 from "./n5.json";

// DatasourceElement[]

const data = [
	{
		elements: n5,
		level: "N5",
	},
	{
		elements: n4,
		level: "N4",
	},
	{
		elements: n3,
		level: "N3",
	},
	{
		elements: n2,
		level: "N2",
	},
	{
		elements: n1,
		level: "N1",
	},
];

const baseTimestamp = new Date("2025-06-07T03:00:00.000Z").getTime();

for (const [levelIndex, { elements, level }] of data.entries()) {
	// Stage generation
	const WORDS_PER_STAGE = 50;
	const numStages = Math.ceil(elements.length / WORDS_PER_STAGE);

	const levelStages: { id: string; levelId: string; order: number }[] = [];

	for (let i = 0; i < numStages; i++) {
		const order = i + 1;
		const seedTime = baseTimestamp + levelIndex * 1000 + order;
		levelStages.push({
			id: ulid(seedTime),
			levelId: level,
			order,
		});
	}

	const stagesPath = path.join(
		import.meta.dirname,
		`stages-${level.toLowerCase()}.json`,
	);

	fs.writeFileSync(stagesPath, JSON.stringify(levelStages, null, 2));

	const tobePath = path.join(
		import.meta.dirname,
		`data-${level.toLowerCase()}.json`,
	);

	const nextElements = elements.map((element, elementIndex) => {
		const stageIndex = Math.floor(elementIndex / WORDS_PER_STAGE);
		const stageId = levelStages[stageIndex].id;

		const nextExpression = {
			id: ulid(baseTimestamp + levelIndex * 1_000_000 + elementIndex * 16),
			expression: element.word,
		};

		const nextReading = {
			id: ulid(baseTimestamp + levelIndex * 1_000_000 + elementIndex * 32),
			stageId,
			expressionId: nextExpression.id,
			furigana: element.furigana,
		};

		const nextMeaningKo = element.meaning_ko.map((meaning, meaningIndex) => {
			const seedTime =
				baseTimestamp +
				levelIndex * 1_000_000 +
				elementIndex * 64 +
				meaningIndex * 16;
			return {
				id: ulid(seedTime),
				readingId: nextReading.id,
				meaning,
			};
		});

		return {
			expression: nextExpression,
			reading: nextReading,
			meanings: nextMeaningKo,
		};
	});

	fs.writeFileSync(tobePath, JSON.stringify(nextElements, null, 2));
}
