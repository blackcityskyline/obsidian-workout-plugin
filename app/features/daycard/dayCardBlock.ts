import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/**
 * The `workout-day` code block: the Daily Report Card of one day, built from
 * the log (sets, volume, records) and the body weight of that day.
 */
export const dayCardBlock = defineCodeBlock("workout-day", {
  /** Written by the insert/create command so the block can be found again */
  id: { kind: "string" },
  /** YYYY-MM-DD; unset = the note's `date` property, else a date-named note, else today */
  date: { kind: "string" },
});

export type EmbeddedDayCardParams = BlockParams<typeof dayCardBlock>;
