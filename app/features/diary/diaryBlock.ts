import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-diary` code block: a free-text diary entry of one day, kept in that day's page */
export const diaryBlock = defineCodeBlock("workout-diary", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** YYYY-MM-DD; unset = the note's day (date property, date-named note, else today) */
  date: { kind: "string" },
});

export type EmbeddedDiaryParams = BlockParams<typeof diaryBlock>;
