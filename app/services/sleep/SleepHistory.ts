import type { SleepEntry } from "@app/services/sleep/SleepLog";
import { trendOf, type Trend } from "@app/services/history/TrainingHistory";

/** Sleep read back as a story. Pure: entries oldest first. */
export class SleepHistory {
  constructor(private readonly entries: readonly SleepEntry[]) {}

  latest(): SleepEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /** Nights of the last `days` days up to and including `today` */
  since(days: number, today: string): SleepEntry[] {
    const [y, m, d] = today.split("-").map(Number);
    const from = new Date(y, m - 1, d - (days - 1));
    const key = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(from.getDate()).padStart(2, "0")}`;
    return this.entries.filter((e) => e.date >= key && e.date <= today);
  }

  /** Average hours of the period, 1 decimal; undefined without nights */
  averageHours(days: number, today: string): number | undefined {
    const period = this.since(days, today);
    if (period.length === 0) return undefined;
    const sum = period.reduce((a, e) => a + e.hours, 0);
    return Math.round((sum / period.length) * 10) / 10;
  }

  series(days: number, today: string): { dates: string[]; hours: number[] } {
    const period = this.since(days, today);
    return { dates: period.map((e) => e.date), hours: period.map((e) => e.hours) };
  }

  trend(days: number, today: string): Trend | undefined {
    return trendOf(this.since(days, today).map((e) => e.hours));
  }
}
