import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-bodyweight` code block: log and review body weight */
export const bodyWeightBlock = defineCodeBlock("workout-bodyweight", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** Days of history shown in the list and the figures */
  dateRange: { kind: "number", default: 90, min: 7 },
});

export type EmbeddedBodyWeightParams = BlockParams<typeof bodyWeightBlock>;
