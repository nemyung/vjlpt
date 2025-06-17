import { z } from "zod/v4";
import { Card } from "./model";
import type { RawReading } from "./repo";
import { shuffle } from "./shuffle";

export const MeaningToKanji = z.object({
	type: z.literal("meaning-to-kanji"),
	readingId: z.string(),
	meaning: z.string(),
	answers: z.array(z.object({ readingId: z.string(), text: z.string() })),
	fsrs: Card.nullable(),
});
export type MeaningToKanji = z.infer<typeof MeaningToKanji>;

export const createMeaningToKanji = (
	answer: RawReading,
	meanings: RawReading[],
): MeaningToKanji => {
	// FIXME: REMOVE FSRS
	const fsrsCard: Card | null =
		answer.stability !== null &&
		answer.difficulty !== null &&
		answer.nextReviewDate !== null &&
		answer.lastReviewDate !== null &&
		answer.learningSteps !== null &&
		answer.reps !== null &&
		answer.lapses !== null
			? {
					due: answer.nextReviewDate,
					stability: answer.stability,
					difficulty: answer.difficulty,
					elapsed_days: 0, // 계산 필요시 추가
					scheduled_days: 0, // 계산 필요시 추가
					learning_steps: answer.learningSteps,
					reps: answer.reps,
					lapses: answer.lapses,
					state:
						answer.status === "new" ? 1 : answer.status === "learning" ? 2 : 3, // State enum 값
					last_review: answer.lastReviewDate,
				}
			: null;

	return MeaningToKanji.parse({
		type: "meaning-to-kanji",
		readingId: answer.readingId,
		meaning: answer.meanings.join(", "),
		answers: shuffle(meanings.concat(answer)).map((m) => ({
			readingId: m.readingId,
			text: m.expression,
		})),
		fsrs: fsrsCard,
	});
};
