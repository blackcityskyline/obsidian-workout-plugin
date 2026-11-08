/** @jest-environment jsdom */

import { EmbeddedExercisesView } from "@app/features/exercises/views/EmbeddedExercisesView";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { createObsidianContainer } from "@app/components/__tests__/obsidianDomMocks";
import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import { t } from "@app/i18n";

const page = (name: string, extra: Partial<ExercisePage> = {}): ExercisePage => ({
  file: { path: `Exercises/${name}.md` } as ExercisePage["file"],
  names: [name],
  tags: [],
  parameters: [],
  neckWarning: false,
  jerkWarning: false,
  spineWarning: false,
  equipment: [],
  ...extra,
});

const pages = [
  page("Dumbbell bench press", { tier: 5, category: "chest", tags: ["chest", "triceps"] }),
  page("Dips", { tier: 4, category: "chest", tags: ["chest"], spineWarning: true, equipment: ["bar"] }),
  page("Row", { tier: 4, category: "back", tags: ["back"] }),
  page("Plank"),
];

function setup(params = {}) {
  const openLinkText = jest.fn().mockResolvedValue(undefined);
  const changed: Array<() => void> = [];
  const plugin = {
    eventBus: new WorkoutEventBus(),
    getExerciseLibrary: () => ({ pages: () => pages }),
    app: {
      workspace: { openLinkText },
      metadataCache: { on: (_: string, cb: () => void) => (changed.push(cb), { cb }) },
    },
  } as unknown as WorkoutPluginContext;
  const container = createObsidianContainer();
  const child = new EmbeddedExercisesView(plugin).createExercises(container, params, "Notes/List.md");
  child.load();
  return { container, openLinkText, changed };
}

const names = (container: HTMLElement) =>
  [...container.querySelectorAll(".workout-exercises-name")].map((el) => el.textContent);

describe("EmbeddedExercisesView", () => {
  it("lists the pages by tier, best first, unranked last", () => {
    const { container } = setup();
    expect(names(container)).toEqual(["Dumbbell bench press", "Dips", "Row", "Plank"]);
    const titles = [...container.querySelectorAll(".workout-exercises-tier-title")].map((el) => el.textContent);
    expect(titles).toEqual([`★ ${t("reference.notice.tier5")}`, `★ ${t("reference.notice.tier4")}`, t("exercises.unranked")]);
    expect(container.querySelector(".workout-block-meta")?.textContent).toBe(t("exercises.count", { count: "4" }));
  });

  it("marks the warned exercises and shows the other muscles and equipment", () => {
    const { container } = setup();
    const warnings = container.querySelectorAll(".workout-exercises-warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].textContent).toContain(t("exercises.warning.spine"));
    expect(container.textContent).toContain("triceps");
    expect(container.textContent).toContain(t("exercises.equipment", { items: "bar" }));
  });

  it("keeps the category a block names and draws no chips", () => {
    const { container } = setup({ category: "back" });
    expect(names(container)).toEqual(["Row"]);
    expect(container.querySelector(".workout-chip-group")).toBeNull();
  });

  it("filters by category chip and keeps the pick across redraws", () => {
    const { container, changed } = setup();
    const chip = [...container.querySelectorAll("button")].find((b) => b.textContent === "Back") as HTMLElement;
    chip.click();
    expect(names(container)).toEqual(["Row"]);
    changed.forEach((cb) => cb());
    expect(names(container)).toEqual(["Row"]);
  });

  it("hides the warned and the low-ranked on request, and explains an empty list", () => {
    expect(names(setup({ hideWarned: true }).container)).not.toContain("Dips");
    expect(names(setup({ minTier: 5 }).container)).toEqual(["Dumbbell bench press"]);
    expect(setup({ muscle: "legs" }).container.textContent).toContain(t("exercises.empty"));
  });

  it("opens a page from its name", () => {
    const { container, openLinkText } = setup();
    (container.querySelector(".workout-exercises-name") as HTMLElement).click();
    expect(openLinkText).toHaveBeenCalledWith("Exercises/Dumbbell bench press.md", "Notes/List.md", false);
  });
});
