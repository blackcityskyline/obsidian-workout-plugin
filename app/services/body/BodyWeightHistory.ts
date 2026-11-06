import type { BodyWeightEntry } from "@app/services/body/BodyWeightFile";
import { trendOf, type Trend } from "@app/services/history/TrainingHistory";

/**
 * Body weight read back as a story: latest, change over a period, trend.
 * Pure: `new BodyWeightHistory(entries)`, entries oldest first.
 */
export class BodyWeightHistory {
  constructor(private readonly entries: readonly BodyWeightEntry[]) {}

  latest(): BodyWeightEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /** Entries of the last `days` days up to and including `today` (YYYY-MM-DD) */
  since(days: number, today: string): BodyWeightEntry[] {
    const from = shiftDay(today, -(days - 1));
    return this.entries.filter((e) => e.date >= from && e.date <= today);
  }

  /** Weight now minus the first weigh-in of the period; undefined with fewer than two */
  change(days: number, today: string): number | undefined {
    const period = this.since(days, today);
    if (period.length < 2) return undefined;
    const delta = period[period.length - 1].weight - period[0].weight;
    return Math.round(delta * 100) / 100;
  }

  /** The regression trend of the period's weights (see trendOf) */
  trend(days: number, today: string): Trend | undefined {
    return trendOf(this.since(days, today).map((e) => e.weight));
  }
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}
