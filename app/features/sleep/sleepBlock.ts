import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-sleep` code block: log and review nights of sleep */
export const sleepBlock = defineCodeBlock("workout-sleep", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** YYYY-MM-DD the form logs for; unset = the note's day (date property, date-named note, else today) */
  date: { kind: "string" },
  /** Days of history shown in the list and the figures */
  dateRange: { kind: "number", default: 30, min: 7 },
  /** Hours over the period as a line; needs two nights */
  showChart: { kind: "boolean", default: true },
});

export type EmbeddedSleepParams = BlockParams<typeof sleepBlock>;
