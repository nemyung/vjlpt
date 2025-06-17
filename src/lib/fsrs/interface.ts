import { z } from "zod/v4";
import { FlashCard } from "./flash-card";
import { KanjiToMeaning } from "./kanji-to-meaning";
import { MeaningToKanji } from "./meaning-to-kanji";

export const Card = z.discriminatedUnion("type", [
	KanjiToMeaning,
	MeaningToKanji,
	FlashCard,
]);

export type Card = z.infer<typeof Card>;

export const Deck = z.array(Card);
export type Deck = z.infer<typeof Deck>;
