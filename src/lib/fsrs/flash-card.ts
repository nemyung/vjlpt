import { z } from "zod/v4";
import { Card } from "./model";
import type { RawReading } from "./repo";

export const FlashCard = z.object({
	type: z.literal("flash-card"),
	readingId: z.string(),
	expression: z.string(),
	furigana: z.string(),
	meanings: z.array(z.string()),
	fsrs: Card.nullable(),
});

export type FlashCard = z.infer<typeof FlashCard>;

export const createFlashCard = (rawReading: RawReading): FlashCard => {
	// FIXME
	const fsrsCard: Card | null =
		rawReading.stability !== null &&
		rawReading.difficulty !== null &&
		rawReading.nextReviewDate !== null &&
		rawReading.lastReviewDate !== null &&
		rawReading.learningSteps !== null &&
		rawReading.reps !== null &&
		rawReading.lapses !== null
			? {
					due: rawReading.nextReviewDate,
					stability: rawReading.stability,
					difficulty: rawReading.difficulty,
					elapsed_days: 0,
					scheduled_days: 0,
					learning_steps: rawReading.learningSteps,
					reps: rawReading.reps,
					lapses: rawReading.lapses,
					state:
						rawReading.status === "new"
							? 0
							: rawReading.status === "learning"
								? 1
								: 2, // State enum 값
					last_review: rawReading.lastReviewDate,
				}
			: null;

	return FlashCard.parse({
		type: "flash-card",
		readingId: rawReading.readingId,
		expression: rawReading.expression,
		furigana: rawReading.furigana,
		meanings: rawReading.meanings,
		fsrs: fsrsCard,
	});
};
