import { z } from "zod/v4";
import { Card } from "./model";

export const KanjiToMeaning = z.object({
  readingId: z.string(),
  expression: z.string(),
  answers: z.array(z.object({ readingId: z.string(), meaning: z.string() })),
  fsrs: Card,
});
export type KanjiToMeaning = z.infer<typeof KanjiToMeaning>;

export const KanjiToMeaningDeck = z.object({
  type: z.literal("kanji-to-meaning"),
  cards: z.array(KanjiToMeaning),
});
export type KanjiToMeaningDeck = z.infer<typeof KanjiToMeaningDeck>;
