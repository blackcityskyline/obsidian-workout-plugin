import { SavedMeals, mealKey } from "@app/services/food/SavedMeals";
import { foodLogPath, type FoodLogStorage } from "@app/services/food/FoodLog";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";

class MemoryStorage implements FoodLogStorage {
  constructor(public text: string | null = null) {}
  async read() {
    return this.text;
  }
  async write(content: string) {
    this.text = content;
  }
}

function setup(text: string | null = null) {
  const storage = new MemoryStorage(text);
  const bus = new WorkoutEventBus();
  const events: unknown[] = [];
  bus.on("meals:changed", (p) => events.push(p));
  return { storage, events, meals: new SavedMeals(storage, bus) };
}

describe("SavedMeals", () => {
  it("sits next to the workout log", () => {
    expect(foodLogPath("Gym/Log/workout_logs.csv", "food_meals.csv")).toBe("Gym/Log/food_meals.csv");
  });

  it("writes one row per food and reads the meal back", async () => {
    const { meals, storage, events } = setup();
    await meals.save("My breakfast", [
      { food: "Oats, dry", grams: 60 },
      { food: "Milk", grams: 200 },
    ]);
    expect(storage.text).toBe('name,food,grams\nMy breakfast,"Oats, dry",60\nMy breakfast,Milk,200\n');
    expect(await meals.read()).toEqual([
      { name: "My breakfast", items: [{ food: "Oats, dry", grams: 60 }, { food: "Milk", grams: 200 }] },
    ]);
    expect(events).toEqual([{ name: "My breakfast" }]);
  });

  it("replaces a meal with the same name, ignoring case and spacing", async () => {
    const { meals } = setup();
    await meals.save("My breakfast", [{ food: "Oats, dry", grams: 60 }]);
    await meals.save("  my   BREAKFAST ", [{ food: "Milk", grams: 100 }]);
    const all = await meals.read();
    expect(all).toHaveLength(1);
    expect(all[0].items).toEqual([{ food: "Milk", grams: 100 }]);
  });

  it("sorts by name and keeps Cyrillic names", async () => {
    const { meals } = setup();
    await meals.save("Ужин", [{ food: "Рис", grams: 150 }]);
    await meals.save("Завтрак", [{ food: "Овсянка", grams: 60 }]);
    expect((await meals.read()).map((m) => m.name)).toEqual(["Завтрак", "Ужин"]);
  });

  it("rejects an empty name, no foods and bad grams without writing", async () => {
    const { meals, storage } = setup();
    await expect(meals.save(" ", [{ food: "Milk", grams: 1 }])).rejects.toThrow();
    await expect(meals.save("A", [])).rejects.toThrow();
    await expect(meals.save("A", [{ food: "Milk", grams: 0 }])).rejects.toThrow();
    await expect(meals.save("A", [{ food: " ", grams: 5 }])).rejects.toThrow();
    expect(storage.text).toBeNull();
  });

  it("deletes a meal and returns it so the deletion can be undone", async () => {
    const { meals, events } = setup();
    await meals.save("A", [{ food: "Milk", grams: 100 }]);
    await meals.save("B", [{ food: "Rice", grams: 100 }]);
    const gone = await meals.delete("a");
    expect(gone).toEqual({ name: "A", items: [{ food: "Milk", grams: 100 }] });
    expect((await meals.read()).map((m) => m.name)).toEqual(["B"]);
    expect(await meals.delete("missing")).toBeUndefined();
    expect(events).toHaveLength(3);
    await meals.save(gone!.name, gone!.items);
    expect((await meals.read()).map((m) => m.name)).toEqual(["A", "B"]);
  });

  it("skips malformed rows and handles an empty or header-only file", async () => {
    const { meals } = setup("name,food,grams\nA,Milk,100\n,Milk,5\nA,,5\nA,Rice,abc\n");
    expect(await meals.read()).toEqual([{ name: "A", items: [{ food: "Milk", grams: 100 }] }]);
    expect(await setup("").meals.read()).toEqual([]);
    expect(await setup("name,food,grams\n").meals.read()).toEqual([]);
  });

  it("keeps quotes, commas and newlines in names", async () => {
    const { meals } = setup();
    await meals.save('Mom\'s "big", lunch', [{ food: 'Bread "rye", sliced', grams: 40 }]);
    expect(await meals.read()).toEqual([
      { name: 'Mom\'s "big", lunch', items: [{ food: 'Bread "rye", sliced', grams: 40 }] },
    ]);
  });

  it("mealKey ignores case and spacing", () => {
    expect(mealKey("  My  Breakfast ")).toBe(mealKey("my breakfast"));
  });
});
