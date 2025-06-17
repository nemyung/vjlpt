import { z } from "zod/v4";

enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export const Card = z.object({
  due: z.date(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  learning_steps: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.enum(State),
  last_review: z.date().optional(),
});
export type Card = z.infer<typeof Card>;
