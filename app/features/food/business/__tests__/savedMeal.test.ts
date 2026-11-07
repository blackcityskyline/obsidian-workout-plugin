import { expandMeal, itemsOf, mealTotals } from "@app/features/food/business/savedMeal";
import type { FoodEntry } from "@app/services/food/FoodLog";

const pages: Record<string, { name: string; per100: { kcal: number; protein: number; fat: number; carbs: number; fiber?: number } }> = {
  "oats, dry": { name: "Oats, dry", per100: { kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10 } },
  milk: { name: "Milk", per100: { kcal: 60, protein: 3.2, fat: 3.3, carbs: 4.8 } },
};
const find = (name: string) => pages[name.toLowerCase()];

const entry = (food: string, grams: number, timestamp: number): FoodEntry => ({
  date: "2026-11-06", meal: "breakfast", food, grams, kcal: 0, protein: 0, fat: 0, carbs: 0, timestamp,
});

describe("itemsOf", () => {
  it("lists foods with their grams and adds up the same food eaten twice", () => {
    expect(itemsOf([entry("Milk", 100, 1), entry("Oats, dry", 60, 2), entry("milk", 50, 3)])).toEqual([
      { food: "Milk", grams: 150 },
      { food: "Oats, dry", grams: 60 },
    ]);
  });
});

describe("expandMeal", () => {
  const saved = { name: "B", items: [{ food: "Oats, dry", grams: 60 }, { food: "Milk", grams: 200 }, { food: "Gone", grams: 10 }] };

  it("takes today's macros from the pages and lists foods without a page", () => {
    const { entries, missing } = expandMeal(saved, find, "2026-11-07", "lunch");
    expect(missing).toEqual(["Gone"]);
    expect(entries).toEqual([
      { date: "2026-11-07", meal: "lunch", food: "Oats, dry", grams: 60, kcal: 233, protein: 10.1, fat: 4.1, carbs: 39.8 },
      { date: "2026-11-07", meal: "lunch", food: "Milk", grams: 200, kcal: 120, protein: 6.4, fat: 6.6, carbs: 9.6 },
    ]);
  });

  it("does not leak fiber into the entries", () => {
    const { entries } = expandMeal(saved, find, "2026-11-07", "lunch");
    expect(entries[0]).not.toHaveProperty("fiber");
  });

  it("uses the page's current name", () => {
    const renamed = (n: string) => (n === "Old" ? pages.milk : undefined);
    const { entries } = expandMeal({ name: "X", items: [{ food: "Old", grams: 100 }] }, renamed, "2026-11-07", "snack");
    expect(entries[0].food).toBe("Milk");
  });
});

describe("mealTotals", () => {
  it("sums what the meal gives now", () => {
    expect(mealTotals({ name: "B", items: [{ food: "Oats, dry", grams: 60 }, { food: "Milk", grams: 200 }, { food: "Gone", grams: 10 }] }, find)).toEqual({
      kcal: 353, protein: 16.5, fat: 10.7, carbs: 49.4,
    });
  });
});
