import { defineCodeBlock } from "@app/services/codeblocks/CodeBlockSchema";
import type { BlockParams } from "@app/services/codeblocks/CodeBlockSchema";

/** The `workout-bodyweight` code block: log and review body weight */
export const bodyWeightBlock = defineCodeBlock("workout-bodyweight", {
  /** Written by the insert command so the block can be found again */
  id: { kind: "string" },
  title: { kind: "string" },
  /** Days of history shown in the list and the figures */
  dateRange: { kind: "number", default: 90, min: 7 },
  /** The weight over the period as a line; needs two weigh-ins */
  showChart: { kind: "boolean", default: true },
  /** The regression line of the period over the chart (the figure's "Trend" rule) */
  showTrendLine: { kind: "boolean", default: true },
});

export type EmbeddedBodyWeightParams = BlockParams<typeof bodyWeightBlock>;
