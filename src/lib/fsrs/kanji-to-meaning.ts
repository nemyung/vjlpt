import { z } from "zod/v4";
import { Card } from "./model";
import type { RawReading } from "./repo";

export const KanjiToMeaning = z.object({
	type: z.literal("kanji-to-meaning"),
	readingId: z.string(),
	expression: z.string(),
	answers: z.array(z.object({ readingId: z.string(), text: z.string() })),
	fsrs: Card.nullable(),
});
export type KanjiToMeaning = z.infer<typeof KanjiToMeaning>;

export const createKanjiToMeaning = (
	answer: RawReading,
	expressions: RawReading[],
): KanjiToMeaning => {
	//FIXME: REMOVE FSRS
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
						answer.status === "new" ? 0 : answer.status === "learning" ? 1 : 2, // State enum 값
					last_review: answer.lastReviewDate,
				}
			: null;

	return KanjiToMeaning.parse({
		type: "kanji-to-meaning",
		readingId: answer.readingId,
		expression: answer.expression,
		answers: expressions.concat(answer).map((e) => ({
			readingId: e.readingId,
			text: e.meanings.join(", "),
		})),
		fsrs: fsrsCard,
	});
};
