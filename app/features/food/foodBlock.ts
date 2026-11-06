import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-food` code block: log what was eaten on a day and see its totals */
export const foodBlock = defineCodeBlock("workout-food", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** YYYY-MM-DD; unset = the note's `date` property, else a date-named note, else today */
  date: { kind: "string" },
  /** Daily targets: a figure with a target shows its progress; none by default */
  kcal: { kind: "number", min: 0 },
  protein: { kind: "number", min: 0 },
  fat: { kind: "number", min: 0 },
  carbs: { kind: "number", min: 0 },
});

export type EmbeddedFoodParams = BlockParams<typeof foodBlock>;
