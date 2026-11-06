import { MEALS, type FoodEntry, type Meal } from "@app/services/food/FoodLog";

export interface FoodTotals {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodDay {
  day: string;
  /** The day's entries per meal, in the order eaten; every meal is present */
  meals: Record<Meal, FoodEntry[]>;
  totals: FoodTotals;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The totals of entries (kcal whole, grams to 0.1) */
export function totalsOf(entries: readonly FoodEntry[]): FoodTotals {
  const sum = (pick: (e: FoodEntry) => number) =>
    entries.reduce((n, e) => n + pick(e), 0);
  return {
    kcal: Math.round(sum((e) => e.kcal)),
    protein: round(sum((e) => e.protein)),
    fat: round(sum((e) => e.fat)),
    carbs: round(sum((e) => e.carbs)),
  };
}

/** One day of the food log grouped by meal, with its totals. Pure. */
export function foodDay(day: string, entries: readonly FoodEntry[]): FoodDay {
  const ofDay = entries
    .filter((e) => e.date === day)
    .sort((a, b) => a.timestamp - b.timestamp);
  const meals = Object.fromEntries(
    MEALS.map((meal) => [meal, ofDay.filter((e) => e.meal === meal)]),
  ) as Record<Meal, FoodEntry[]>;
  return { day, meals, totals: totalsOf(ofDay) };
}

/** The meal a time of day usually is: before 11 breakfast, before 16 lunch, before 21 dinner, else snack */
export function mealAt(hour: number): Meal {
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}
