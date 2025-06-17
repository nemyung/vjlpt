import { z } from "zod/v4";
import { KanjiToMeaningDeck } from "./kanji-to-meaning";
import { MeaningToKanjiDeck } from "./meaning-to-kanji";
import { FlashCardDeck } from "./flash-card";

export const Deck = z.discriminatedUnion("type", [
  KanjiToMeaningDeck,
  MeaningToKanjiDeck,
  FlashCardDeck,
]);

export type Deck = z.infer<typeof Deck>;
