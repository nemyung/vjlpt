import { z } from "zod/v4";
import { FSRSMeta } from "./model";
import type { RawReading } from "./repo";

export const FlashCard = z.object({
  type: z.literal("flash-card"),
  readingId: z.string(),
  expression: z.string(),
  furigana: z.string(),
  meanings: z.array(z.string()),
  fsrs: FSRSMeta.nullable(),
});

export type FlashCard = z.infer<typeof FlashCard>;

export const createFlashCard = (rawReading: RawReading): FlashCard =>
  FlashCard.parse({
    type: "flash-card",
    readingId: rawReading.readingId,
    expression: rawReading.expression,
    furigana: rawReading.furigana,
    meanings: rawReading.meanings,
    fsrs: rawReading.fsrs,
  });
