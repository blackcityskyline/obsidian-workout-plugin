/** @jest-environment jsdom */

import { EmbeddedDayCardView } from "@app/features/daycard/views/EmbeddedDayCardView";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { createObsidianContainer } from "@app/components/__tests__/obsidianDomMocks";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { WorkoutLogData } from "@app/types/WorkoutLogData";
import { t } from "@app/i18n";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(logs: WorkoutLogData[], food: unknown[] = []) {
  const eventBus = new WorkoutEventBus();
  const plugin = {
    eventBus,
    settings: { weightUnit: "kg" },
    app: {
      vault: { getAbstractFileByPath: () => null },
      metadataCache: { getFileCache: () => null },
    },
    getWorkoutLogData: async () => logs,
    getFoodLog: () => ({ read: async () => food }),
    getBodyWeightLog: () => ({
      read: async () => [{ date: "2026-11-02", weight: 78.4, note: "" }],
    }),
  } as unknown as WorkoutPluginContext;
  const container = createObsidianContainer();
  const child = new EmbeddedDayCardView(plugin).createDayCard(
    container,
    { date: "2026-11-02" },
    "Days/2026-11-02.md",
  );
  child.load();
  return { container, eventBus, logs };
}

const set = {
  date: "2026-11-02T10:00:00",
  exercise: "Squat",
  reps: 5,
  weight: 60,
  volume: 300,
  timestamp: 1,
  workout: "Day A",
} as WorkoutLogData;

describe("EmbeddedDayCardView", () => {
  it("shows the day's sets, volume and body weight", async () => {
    const { container } = setup([set]);
    await flush();
    expect(container.textContent).toContain("2026-11-02");
    expect(container.textContent).toContain("Squat");
    expect(container.textContent).toContain("300 kg");
    expect(container.textContent).toContain("78.4 kg");
  });

  it("says so on a day without training, and redraws on a log change", async () => {
    const logs: WorkoutLogData[] = [];
    const { container, eventBus } = setup(logs);
    await flush();
    expect(container.textContent).toContain(t("dayCard.rest"));
    logs.push(set);
    eventBus.emit({
      type: "log:added",
      payload: { entry: set, context: { exercise: "Squat", workout: "Day A" } },
    });
    await flush();
    expect(container.textContent).not.toContain(t("dayCard.rest"));
    expect(container.textContent).toContain("Squat");
  });

  it("shows calories and macros when food was logged that day", async () => {
    const { container } = setup([set], [
      { date: "2026-11-02", meal: "lunch", food: "Rice", grams: 200, kcal: 260, protein: 5.4, fat: 0.6, carbs: 56.4, timestamp: 1 },
    ]);
    await flush();
    expect(container.textContent).toContain(`${t("dayCard.calories")}260`);
  });
});
