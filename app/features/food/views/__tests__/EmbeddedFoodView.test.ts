/** @jest-environment jsdom */

import { EmbeddedFoodView } from "@app/features/food/views/EmbeddedFoodView";
import { FoodLog, type FoodLogStorage } from "@app/services/food/FoodLog";
import { SavedMeals } from "@app/services/food/SavedMeals";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { createObsidianContainer } from "@app/components/__tests__/obsidianDomMocks";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import { t } from "@app/i18n";

class MemoryStorage implements FoodLogStorage {
  text: string | null = null;
  async read() {
    return this.text;
  }
  async write(content: string) {
    this.text = content;
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const oats = { name: "Oats, dry", per100: { kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3 } };

function setup(params = {}) {
  const eventBus = new WorkoutEventBus();
  const log = new FoodLog(new MemoryStorage(), eventBus);
  const savedMeals = new SavedMeals(new MemoryStorage(), eventBus);
  const plugin = {
    eventBus,
    settings: {},
    app: { vault: { getAbstractFileByPath: () => null }, metadataCache: { getFileCache: () => null } },
    getFoodLog: () => log,
    getSavedMeals: () => savedMeals,
    getFoodLibrary: () => ({
      pages: () => [oats],
      find: (name: string) => (name.toLowerCase() === "oats, dry" ? oats : undefined),
    }),
  } as unknown as WorkoutPluginContext;
  const container = createObsidianContainer();
  const child = new EmbeddedFoodView(plugin).createFood(
    container,
    { date: "2026-11-06", ...params },
    "Days/2026-11-06.md",
  );
  child.load();
  return { container, log, savedMeals };
}

describe("EmbeddedFoodView", () => {
  it("shows the empty state and the totals at zero", async () => {
    const { container } = setup({ kcal: 2200 });
    await flush();
    expect(container.textContent).toContain(t("food.empty"));
    expect(container.textContent).toContain(`${t("food.figures.kcal")}0`);
    expect(container.querySelector(".workout-progress-meter")).not.toBeNull();
  });

  it("redraws with the entry when food is logged, macros of the amount eaten", async () => {
    const { container, log } = setup();
    await flush();
    await log.add({ date: "2026-11-06", meal: "lunch", food: "Oats, dry", grams: 60, kcal: 233, protein: 10.1, fat: 4.1, carbs: 39.8 });
    await flush();
    expect(container.textContent).toContain("Oats, dry");
    expect(container.textContent).toContain(`${t("food.figures.kcal")}233`);
  });

  it("adds food through the form and clears the empty state", async () => {
    const { container, log } = setup();
    await flush();
    (container.querySelector(".workout-food-name") as HTMLInputElement).value = "Oats, dry";
    (container.querySelector(".workout-number-field input") as HTMLInputElement).value = "60";
    (container.querySelector(".workout-food-form button.mod-cta, .workout-food-form .workout-btn") as HTMLElement | null)?.click();
    await flush();
    const entries = await log.read();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ food: "Oats, dry", grams: 60, kcal: 233, date: "2026-11-06" });
  });

  it("does not log a food without a page", async () => {
    const { container, log } = setup();
    await flush();
    (container.querySelector(".workout-food-name") as HTMLInputElement).value = "Mystery";
    (container.querySelector(".workout-number-field input") as HTMLInputElement).value = "60";
    (container.querySelector(".workout-food-form button.mod-cta, .workout-food-form .workout-btn") as HTMLElement | null)?.click();
    await flush();
    expect(await log.read()).toEqual([]);
  });

  it("shows the empty hint when no meal is saved", async () => {
    const { container } = setup();
    await flush();
    expect(container.textContent).toContain(t("food.sets.empty"));
  });

  it("adds a saved meal with today's macros in one tap, skipping foods without a page", async () => {
    const { container, log, savedMeals } = setup();
    await savedMeals.save("My breakfast", [
      { food: "Oats, dry", grams: 60 },
      { food: "Gone", grams: 10 },
    ]);
    await flush();
    const chip = container.querySelector(".workout-food-saved-item .workout-btn") as HTMLElement;
    expect(chip).not.toBeNull();
    chip.click();
    await flush();
    const entries = await log.read();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ food: "Oats, dry", grams: 60, kcal: 233, date: "2026-11-06" });
    expect(container.querySelector(".workout-food-saved-item")).not.toBeNull();
  });

  it("deletes a saved meal with the delete button", async () => {
    const { container, savedMeals } = setup();
    await savedMeals.save("My breakfast", [{ food: "Oats, dry", grams: 60 }]);
    await flush();
    (container.querySelector(".workout-food-saved-item button:last-child") as HTMLElement).click();
    await flush();
    expect(await savedMeals.read()).toEqual([]);
    expect(container.textContent).toContain(t("food.sets.empty"));
  });
});
