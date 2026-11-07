import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-food` code block: log what was eaten on a day and see its totals */
export const foodBlock = defineCodeBlock("workout-food", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** YYYY-MM-DD; unset = the note's `date` property, else a date-named note, else today */
  date: { kind: "string" },
  /** A nutrition goal (id or name from Settings → Nutrition goals); unset = the one picked in the block or the settings */
  goal: { kind: "string" },
  /** Daily targets written here win over the goal's; a figure with a target shows its progress */
  kcal: { kind: "number", min: 0 },
  protein: { kind: "number", min: 0 },
  fat: { kind: "number", min: 0 },
  carbs: { kind: "number", min: 0 },
});

export type EmbeddedFoodParams = BlockParams<typeof foodBlock>;
