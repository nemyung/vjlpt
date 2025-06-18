import { z } from "zod/v4";
import { FSRSMeta } from "./model";
import type { RawReading } from "./repo";

export const KanjiToMeaning = z.object({
  type: z.literal("kanji-to-meaning"),
  readingId: z.string(),
  expression: z.string(),
  answers: z.array(z.object({ readingId: z.string(), text: z.string() })),
  fsrs: FSRSMeta.nullable(),
});
export type KanjiToMeaning = z.infer<typeof KanjiToMeaning>;

export const createKanjiToMeaning = (
  answer: RawReading,
  expressions: RawReading[]
): KanjiToMeaning =>
  KanjiToMeaning.parse({
    type: "kanji-to-meaning",
    readingId: answer.readingId,
    expression: answer.expression,
    answers: expressions.concat(answer).map((e) => ({
      readingId: e.readingId,
      text: e.meanings.join(", "),
    })),
    fsrs: answer.fsrs,
  });
