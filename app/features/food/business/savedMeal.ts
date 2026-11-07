import type { SavedMeal, SavedMealItem } from "@app/services/food/SavedMeals";
import type { FoodEntry, FoodEntryInput, Meal } from "@app/services/food/FoodLog";
import { nutrientsFor, type Nutrients } from "@app/services/food/FoodLibrary";
import { totalsOf, type FoodTotals } from "@app/features/food/business/foodDay";

/** What a food page offers: its per 100 g values (the library's `find` result) */
export type FindFood = (name: string) => { name: string; per100: Nutrients } | undefined;

/** The foods of a meal eaten so far, as a saved meal's items (the same food twice adds up) */
export function itemsOf(entries: readonly FoodEntry[]): SavedMealItem[] {
  const items = new Map<string, SavedMealItem>();
  for (const e of entries) {
    const key = e.food.trim().toLowerCase();
    const have = items.get(key);
    if (have) have.grams = Math.round((have.grams + e.grams) * 10) / 10;
    else items.set(key, { food: e.food, grams: e.grams });
  }
  return [...items.values()];
}

/**
 * A saved meal put on a day: entries with today's macros from the food pages.
 * Foods without a page (renamed or deleted) are listed in `missing`, not guessed.
 */
export function expandMeal(
  saved: SavedMeal,
  find: FindFood,
  day: string,
  meal: Meal,
): { entries: FoodEntryInput[]; missing: string[] } {
  const entries: FoodEntryInput[] = [];
  const missing: string[] = [];
  for (const item of saved.items) {
    const page = find(item.food);
    if (!page) {
      missing.push(item.food);
      continue;
    }
    const n = nutrientsFor(page.per100, item.grams);
    entries.push({
      date: day,
      meal,
      food: page.name,
      grams: item.grams,
      kcal: n.kcal,
      protein: n.protein,
      fat: n.fat,
      carbs: n.carbs,
    });
  }
  return { entries, missing };
}

/** The totals a saved meal gives now (foods without a page count as nothing) */
export function mealTotals(saved: SavedMeal, find: FindFood): FoodTotals {
  const { entries } = expandMeal(saved, find, "0000-00-00", "snack");
  return totalsOf(entries.map((e, i) => ({ ...e, timestamp: i })));
}
