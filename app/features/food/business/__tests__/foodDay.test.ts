import { foodDay, mealAt, totalsOf } from "@app/features/food/business/foodDay";
import type { FoodEntry } from "@app/services/food/FoodLog";

const entry = (over: Partial<FoodEntry>): FoodEntry => ({
  date: "2026-11-06",
  meal: "breakfast",
  food: "Egg",
  grams: 100,
  kcal: 143,
  protein: 12.6,
  fat: 9.5,
  carbs: 0.7,
  timestamp: 1,
  ...over,
});

describe("foodDay", () => {
  const entries = [
    entry({ timestamp: 2, meal: "lunch", food: "Rice", kcal: 130, protein: 2.7, fat: 0.3, carbs: 28.2 }),
    entry({ timestamp: 1 }),
    entry({ timestamp: 3, date: "2026-11-07" }),
  ];

  it("groups the day's entries by meal in the order eaten and sums them", () => {
    const day = foodDay("2026-11-06", entries);
    expect(day.meals.breakfast.map((e) => e.food)).toEqual(["Egg"]);
    expect(day.meals.lunch.map((e) => e.food)).toEqual(["Rice"]);
    expect(day.meals.dinner).toEqual([]);
    expect(day.totals).toEqual({ kcal: 273, protein: 15.3, fat: 9.8, carbs: 28.9 });
  });

  it("is empty on a day without entries", () => {
    expect(foodDay("2026-01-01", entries).totals).toEqual({ kcal: 0, protein: 0, fat: 0, carbs: 0 });
  });

  it("totals without float noise", () => {
    expect(totalsOf([entry({ protein: 0.1 }), entry({ protein: 0.2 })]).protein).toBe(0.3);
  });
});

describe("mealAt", () => {
  it("picks the usual meal for the hour", () => {
    expect([8, 13, 19, 22].map(mealAt)).toEqual(["breakfast", "lunch", "dinner", "snack"]);
  });
});
