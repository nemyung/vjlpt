import { z } from "zod/v4";
import { Card } from "./model";

export const MeaningToKanji = z.object({
  readingId: z.string(),
  meaning: z.string(),
  answers: z.array(z.object({ readingId: z.string(), expression: z.string() })),
  fsrs: Card,
});
export type MeaningToKanji = z.infer<typeof MeaningToKanji>;

export const MeaningToKanjiDeck = z.object({
  type: z.literal("meaning-to-kanji"),
  cards: z.array(MeaningToKanji),
});
export type MeaningToKanjiDeck = z.infer<typeof MeaningToKanjiDeck>;
