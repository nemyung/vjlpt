import { z } from "zod/v4";
import { FSRSMeta } from "./model";
import type { RawReading } from "./repo";
import { shuffle } from "./shuffle";

export const MeaningToKanji = z.object({
  type: z.literal("meaning-to-kanji"),
  readingId: z.string(),
  meaning: z.string(),
  answers: z.array(z.object({ readingId: z.string(), text: z.string() })),
  fsrs: FSRSMeta.nullable(),
});

export type MeaningToKanji = z.infer<typeof MeaningToKanji>;

export const createMeaningToKanji = (
  answer: RawReading,
  meanings: RawReading[]
): MeaningToKanji =>
  MeaningToKanji.parse({
    type: "meaning-to-kanji",
    readingId: answer.readingId,
    meaning: answer.meanings.join(", "),
    answers: shuffle(meanings.concat(answer)).map((m) => ({
      readingId: m.readingId,
      text: m.expression,
    })),
    fsrs: answer.fsrs,
  });
