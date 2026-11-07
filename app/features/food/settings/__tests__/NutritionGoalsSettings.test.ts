/** @jest-environment jsdom */
import { Modal, mockSettingNamed, withHelpers } from "obsidian";
import type { App, SettingDefinitionItem, SettingDefinitionList } from "obsidian";
import { NutritionGoalsSettings, describeSpec } from "@app/features/food/settings/NutritionGoalsSettings";
import { defaultGoals, type NutritionGoal } from "@app/services/food/NutritionGoals";
import { t } from "@app/i18n";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";

const confirms: Array<() => Promise<void>> = [];
jest.mock("@app/features/modals/common/ConfirmModal", () => ({
  ConfirmModal: class {
    constructor(_app: unknown, _msg: string, onConfirm: () => Promise<void>) {
      confirms.push(onConfirm);
    }
    open() {}
  },
}));

beforeAll(() => {
  (globalThis as unknown as Record<string, unknown>).createFragment = () =>
    withHelpers(document.createDocumentFragment());
});

const listOf = (items: SettingDefinitionItem[]) =>
  items.find((i): i is SettingDefinitionList => "type" in i && i.type === "list")!;

function captureModal(run: () => void): Modal & { onOpen(): void } {
  let opened: (Modal & { onOpen(): void }) | undefined;
  const spy = jest.spyOn(Modal.prototype, "open").mockImplementation(function (this: Modal & { onOpen(): void }) {
    opened = this;
    this.onOpen();
  });
  run();
  spy.mockRestore();
  return opened!;
}

function setup(goals: NutritionGoal[] = defaultGoals()) {
  const emitted: unknown[] = [];
  const plugin = {
    settings: { nutritionGoals: goals, activeNutritionGoal: "gain" },
    saveSettings: jest.fn().mockResolvedValue(undefined),
    eventBus: { emit: (e: unknown) => emitted.push(e) },
  };
  const refresh = jest.fn();
  const section = new NutritionGoalsSettings({} as App, plugin as unknown as WorkoutPluginContext, refresh);
  return { plugin, refresh, emitted, list: listOf(section.definitions()) };
}

describe("describeSpec", () => {
  it("puts a figure's formula in words", () => {
    expect(describeSpec("protein", { mode: "perKg", value: 1.5 })).toBe(`${t("food.figures.protein")} 1.5 ${t("food.goals.units.gPerKg")}`);
    expect(describeSpec("kcal", { mode: "perKg", value: 33 })).toContain(t("food.goals.units.kcalPerKg"));
    expect(describeSpec("carbs", { mode: "remainder" })).toContain(t("food.goals.units.remainder"));
    expect(describeSpec("fat", { mode: "percentKcal", value: 25 })).toContain("25%");
    expect(describeSpec("fat", { mode: "none" })).toBeUndefined();
    expect(describeSpec("fat", { mode: "perKg" })).toBeUndefined();
  });
});

describe("nutrition goals list", () => {
  it("lists every goal with its formulas", () => {
    const { list } = setup();
    expect(list.heading).toBe(t("food.goals.settings.heading"));
    expect(list.items).toHaveLength(3);
    expect(String(list.items![1].desc)).toContain("1.5");
  });

  it("deletes a goal once confirmed, clears it when it was the active one and tells the blocks", async () => {
    const { plugin, refresh, emitted, list } = setup();
    confirms.length = 0;
    list.onDelete!(1);
    expect(plugin.settings.nutritionGoals).toHaveLength(3);
    await confirms[0]();
    expect(plugin.settings.nutritionGoals.map((g) => g.id)).toEqual(["maintain", "cut"]);
    expect(plugin.settings.activeNutritionGoal).toBe("");
    expect(plugin.saveSettings).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
    expect(emitted).toHaveLength(1);
  });

  it("adds a goal from the form with the formula the user picked", async () => {
    const { plugin, refresh, list } = setup([]);
    const modal = captureModal(() => list.addItem!.action(document.body));
    const form = modal.contentEl;
    expect(modal.titleEl.textContent).toBe(t("food.goals.editor.add"));

    await mockSettingNamed(form, t("food.goals.editor.name")).component("text").change("My cut" as never);
    await mockSettingNamed(form, t("food.figures.protein")).component("dropdown").change("fixed" as never);
    await mockSettingNamed(form, t("food.figures.protein")).component("text").change("180" as never);
    const save = Array.from(form.querySelectorAll("button")).find((b) => b.textContent === t("food.goals.editor.save"))!;
    save.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(plugin.settings.nutritionGoals).toHaveLength(1);
    expect(plugin.settings.nutritionGoals[0]).toMatchObject({ id: "my_cut", name: "My cut", protein: { mode: "fixed", value: 180 } });
    expect(refresh).toHaveBeenCalled();
  });

  it("refuses an empty name and a name already used", async () => {
    const { plugin, list } = setup();
    const modal = captureModal(() => list.addItem!.action(document.body));
    const save = Array.from(modal.contentEl.querySelectorAll("button")).find((b) => b.textContent === t("food.goals.editor.save"))!;
    save.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(plugin.settings.nutritionGoals).toHaveLength(3);

    await mockSettingNamed(modal.contentEl, t("food.goals.editor.name")).component("text").change(plugin.settings.nutritionGoals[0].name as never);
    save.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(plugin.settings.nutritionGoals).toHaveLength(3);
  });

  it("keeps a goal's id when it is renamed, so the active goal still finds it", async () => {
    const { plugin, list } = setup();
    const modal = captureModal(() => list.items![1].action!(document.body));
    expect(modal.titleEl.textContent).toBe(t("food.goals.editor.edit"));
    await mockSettingNamed(modal.contentEl, t("food.goals.editor.name")).component("text").change("Bulk" as never);
    Array.from(modal.contentEl.querySelectorAll("button")).find((b) => b.textContent === t("food.goals.editor.save"))!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(plugin.settings.nutritionGoals[1]).toMatchObject({ id: "gain", name: "Bulk" });
    expect(plugin.settings.nutritionGoals).toHaveLength(3);
  });
});
