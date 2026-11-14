import type { SleepEntry } from "@app/services/sleep/SleepLog";
import type { FoodEntry } from "@app/services/food/FoodLog";

/** One measure over time, ready for any of the variants (number, line, bars, table) */
export interface Series {
  /** YYYY-MM-DD, oldest first */
  dates: string[];
  values: number[];
}

export interface SeriesFigures {
  latest: number;
  average: number;
  min: number;
  max: number;
}

const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The `days` days up to and including `today`, oldest first */
export function recentDays(days: number, today: string): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(key(new Date(y, m - 1, d - i)));
  return out;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The measures of the days that have one (weigh-ins, nights of sleep) */
export function seriesOf<T extends { date: string }>(
  entries: readonly T[],
  pick: (e: T) => number,
  days: number,
  today: string,
): Series {
  const wanted = new Set(recentDays(days, today));
  const kept = entries.filter((e) => wanted.has(e.date));
  return { dates: kept.map((e) => e.date), values: kept.map((e) => pick(e)) };
}

export const sleepSeries = (entries: readonly SleepEntry[], days: number, today: string) =>
  seriesOf(entries, (e) => e.hours, days, today);

/** A food total per day, every day of the period (a day without entries is 0) */
export function foodSeries(
  entries: readonly FoodEntry[],
  field: "kcal" | "protein" | "fat" | "carbs",
  days: number,
  today: string,
): Series {
  const dates = recentDays(days, today);
  const perDay = new Map<string, number>();
  for (const e of entries) perDay.set(e.date, (perDay.get(e.date) ?? 0) + e[field]);
  return { dates, values: dates.map((d) => round(perDay.get(d) ?? 0)) };
}

/** Latest, average, lowest and highest value; undefined for an empty series */
export function figuresOf(values: readonly number[]): SeriesFigures | undefined {
  if (values.length === 0) return undefined;
  const sum = values.reduce((a, v) => a + v, 0);
  return {
    latest: values[values.length - 1],
    average: round(sum / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
