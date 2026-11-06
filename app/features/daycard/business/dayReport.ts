import { TrainingHistory, trainingDay } from "@app/services/history/TrainingHistory";
import type { WorkoutLogData } from "@app/types/WorkoutLogData";
import type { BodyWeightEntry } from "@app/services/body/BodyWeightFile";
import type { FoodEntry } from "@app/services/food/FoodLog";
import { totalsOf, type FoodTotals } from "@app/features/food/business/foodDay";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The day a note is about: the block's `date`, the note's `date` property, a date-named note, else today */
export function resolveDay(input: {
  param?: string;
  property?: unknown;
  basename: string;
  today: string;
}): string {
  const candidates = [
    input.param,
    typeof input.property === "string" ? input.property : undefined,
    input.property instanceof Date ? isoDay(input.property) : undefined,
    input.basename,
  ];
  for (const candidate of candidates) {
    const day = candidate?.trim().slice(0, 10);
    if (day && DAY.test(day)) return day;
  }
  return input.today;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface ExerciseSummary {
  name: string;
  sets: number;
  /** Heaviest weight of the sets, 0 for bodyweight or cardio sets */
  topWeight: number;
  volume: number;
}

export interface SessionSummary {
  workout?: string;
  exercises: ExerciseSummary[];
  /** Seconds, only when plausible (see Session.duration) */
  duration?: number;
}

export interface DayReport {
  day: string;
  sessions: SessionSummary[];
  totalSets: number;
  totalVolume: number;
  /** Sets of the day that beat the exercise's earlier best */
  records: number;
  bodyWeight?: BodyWeightEntry;
  /** What was eaten that day; undefined when nothing was logged */
  food?: FoodTotals;
}

/** The Daily Report Card of one training day. Pure. */
export function dayReport(
  day: string,
  logs: WorkoutLogData[],
  weights: readonly BodyWeightEntry[],
  meals: readonly FoodEntry[] = [],
): DayReport {
  const history = new TrainingHistory(logs);
  const sessions = history.sessions().filter((s) => s.day === day);
  const summaries: SessionSummary[] = sessions.map((session) => {
    const byExercise = new Map<string, ExerciseSummary>();
    for (const set of session.sets) {
      const entry = byExercise.get(set.exercise) ?? {
        name: set.exercise,
        sets: 0,
        topWeight: 0,
        volume: 0,
      };
      entry.sets++;
      entry.topWeight = Math.max(entry.topWeight, set.weight || 0);
      entry.volume += set.volume || 0;
      byExercise.set(set.exercise, entry);
    }
    return {
      workout: session.workout,
      exercises: Array.from(byExercise.values()),
      duration: session.duration,
    };
  });
  const eaten = meals.filter((e) => e.date === day);
  const all = summaries.flatMap((s) => s.exercises);
  return {
    day,
    sessions: summaries,
    totalSets: all.reduce((n, e) => n + e.sets, 0),
    totalVolume: Math.round(all.reduce((n, e) => n + e.volume, 0) * 100) / 100,
    records: history
      .newRecordSets()
      .filter((set) => trainingDay(set.date) === day).length,
    bodyWeight: weights.find((w) => w.date === day),
    food: eaten.length > 0 ? totalsOf(eaten) : undefined,
  };
}
