import type { App } from "obsidian";
import { parseCsv, stringifyCsvRow } from "@app/utils/data/CsvCodec";
import type { WorkoutChartsSettings } from "@app/types/WorkoutLogData";
import type { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { VaultFoodLogStorage, type FoodLogStorage } from "@app/services/food/FoodLog";

/** One food of a saved meal: the page it names and how much */
export interface SavedMealItem {
  food: string;
  grams: number;
}

/** A named, reusable list of foods ("My breakfast") */
export interface SavedMeal {
  name: string;
  items: SavedMealItem[];
}

const HEADER = ["name", "food", "grams"];

/** The file of saved meals next to the workout log: `food_meals.csv` */
export function savedMealsStorage(
  app: App,
  settings: Pick<WorkoutChartsSettings, "csvLogFilePath">,
): FoodLogStorage {
  return new VaultFoodLogStorage(app, settings, "food_meals.csv");
}

/** Names match ignoring case and spacing */
export function mealKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * The only module that knows `food_meals.csv` (`name,food,grams`, one row per
 * food, through `CsvCodec`). Saved meals hold names and grams only: the macros
 * come from the food pages when the meal is added to a day. Every change emits
 * `meals:changed`.
 */
export class SavedMeals {
  constructor(
    private storage: FoodLogStorage,
    private eventBus?: WorkoutEventBus,
  ) {}

  /** Every saved meal by name */
  async read(): Promise<SavedMeal[]> {
    return (await this.load()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Saves a meal; one with the same name is replaced */
  async save(name: string, items: readonly SavedMealItem[]): Promise<SavedMeal> {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) throw new Error("Meal name is empty");
    if (items.length === 0) throw new Error("A meal needs at least one food");
    for (const item of items) {
      if (!item.food.trim()) throw new Error("Food name is empty");
      if (!(item.grams > 0) || !Number.isFinite(item.grams)) {
        throw new Error(`Invalid grams: ${item.grams}`);
      }
    }
    const meal: SavedMeal = {
      name: clean,
      items: items.map((i) => ({ food: i.food.trim(), grams: i.grams })),
    };
    const others = (await this.load()).filter((m) => mealKey(m.name) !== mealKey(clean));
    await this.write([...others, meal]);
    this.eventBus?.emit({ type: "meals:changed", payload: { name: clean } });
    return meal;
  }

  /** Deletes a meal and returns it (to take the deletion back); undefined when there is none */
  async delete(name: string): Promise<SavedMeal | undefined> {
    const all = await this.load();
    const gone = all.find((m) => mealKey(m.name) === mealKey(name));
    if (!gone) return undefined;
    await this.write(all.filter((m) => m !== gone));
    this.eventBus?.emit({ type: "meals:changed", payload: { name: gone.name } });
    return gone;
  }

  private async load(): Promise<SavedMeal[]> {
    const content = await this.storage.read();
    if (!content) return [];
    const [header, ...rows] = parseCsv(content);
    if (!header) return [];
    const col = Object.fromEntries(HEADER.map((h) => [h, header.indexOf(h)]));
    const byKey = new Map<string, SavedMeal>();
    for (const row of rows) {
      const name = row[col.name]?.trim().replace(/\s+/g, " ") ?? "";
      const food = row[col.food]?.trim() ?? "";
      const grams = Number(row[col.grams]);
      if (!name || !food || !(grams > 0)) continue;
      const key = mealKey(name);
      const meal = byKey.get(key) ?? { name, items: [] };
      meal.items.push({ food, grams });
      byKey.set(key, meal);
    }
    return [...byKey.values()];
  }

  private async write(meals: readonly SavedMeal[]): Promise<void> {
    const lines = [
      stringifyCsvRow(HEADER),
      ...meals.flatMap((m) =>
        m.items.map((i) => stringifyCsvRow([m.name, i.food, String(i.grams)])),
      ),
    ];
    await this.storage.write(lines.join("\n") + "\n");
  }
}
