import { z } from "zod/v4";
import { Card } from "./model";

export const FlashCard = z.object({
  readingId: z.string(),
  expression: z.string(),
  furigana: z.string(),
  meanings: z.array(z.string()),
  fsrs: Card,
});

export type FlashCard = z.infer<typeof FlashCard>;

export const FlashCardDeck = z.object({
  type: z.literal("flash-card"),
  cards: z.array(FlashCard),
});
export type FlashCardDeck = z.infer<typeof FlashCardDeck>;
