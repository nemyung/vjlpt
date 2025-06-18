import { z } from "zod/v4";
import { State, Rating, type Grade } from "ts-fsrs";

export const FSRSState = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
} as const;
export type FSRSState = (typeof FSRSState)[keyof typeof FSRSState];

export const FSRSMeta = z.object({
  due: z.date(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  learning_steps: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.enum(FSRSState),
  last_review: z.date().optional(),
});
export type FSRSMeta = z.infer<typeof FSRSMeta>;
export { Rating, type Grade };
