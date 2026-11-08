import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-exercises` block: the exercise pages grouped by ranking tier, best first */
export const exercisesBlock = defineCodeBlock("workout-exercises", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** Only this category (`category` property: arms, back, chest, …); unset = chips to pick one */
  category: { kind: "string" },
  /** Only exercises with this muscle tag (chest, upper_chest, lats, …) */
  muscle: { kind: "string" },
  /** Hide exercises ranked below this tier (2-5); unset = all, ranked or not */
  minTier: { kind: "number", min: 2, max: 5 },
  /** Hide the exercises that carry a neck, spine or jerk warning */
  hideWarned: { kind: "boolean", default: false },
});

export type EmbeddedExercisesParams = BlockParams<typeof exercisesBlock>;
