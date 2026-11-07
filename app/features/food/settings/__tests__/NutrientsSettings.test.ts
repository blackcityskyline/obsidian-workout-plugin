/** @jest-environment jsdom */
import { Modal, mockSettingNamed, withHelpers } from "obsidian";
import type { App, SettingDefinitionItem, SettingDefinitionList } from "obsidian";
import { NutrientsSettings, describeTarget } from "@app/features/food/settings/NutrientsSettings";
import { defaultNutrients, type NutrientDef } from "@app/services/food/NutrientCatalog";
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

function setup(nutrients: NutrientDef[] = defaultNutrients()) {
  const emitted: unknown[] = [];
  const plugin = {
    settings: { nutrients },
    saveSettings: jest.fn().mockResolvedValue(undefined),
    eventBus: { emit: (e: unknown) => emitted.push(e) },
  };
  const refresh = jest.fn();
  const section = new NutrientsSettings({} as App, plugin as unknown as WorkoutPluginContext, refresh);
  return { plugin, refresh, emitted, list: listOf(section.definitions()) };
}

const press = (form: HTMLElement) =>
  Array.from(form.querySelectorAll("button")).find((b) => b.textContent === t("food.nutrients.settings.save"))!.click();
const tick = () => new Promise((r) => setTimeout(r, 0));

describe("describeTarget", () => {
  it("puts a target in words", () => {
    const base = { key: "k", name: "K", unit: "mg", group: "vitamin" } as const;
    expect(describeTarget({ ...base, target: { mode: "fixed", value: 90 } })).toBe("90 mg");
    expect(describeTarget({ ...base, target: { mode: "perKg", value: 39 } })).toBe(`39 mg/${t("food.nutrients.kg")}`);
    expect(describeTarget({ ...base, target: { mode: "none" } })).toBe("");
  });
});

describe("nutrients list", () => {
  it("lists every nutrient with its group, key and target", () => {
    const { list } = setup();
    expect(list.items).toHaveLength(defaultNutrients().length);
    expect(String(list.items![1].desc)).toContain("vitamin_c");
  });

  it("deletes a nutrient once confirmed and tells the blocks", async () => {
    const { plugin, refresh, emitted, list } = setup();
    confirms.length = 0;
    const before = plugin.settings.nutrients.length;
    list.onDelete!(0);
    await confirms[0]();
    expect(plugin.settings.nutrients).toHaveLength(before - 1);
    expect(plugin.saveSettings).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
    expect(emitted).toHaveLength(1);
  });

  it("adds a nutrient with the key, unit and target from the form", async () => {
    const { plugin, list } = setup([]);
    const modal = captureModal(() => list.addItem!.action(document.body));
    const form = modal.contentEl;
    await mockSettingNamed(form, t("food.nutrients.settings.name")).component("text").change("Omega 3" as never);
    await mockSettingNamed(form, t("food.nutrients.settings.key")).component("text").change("Omega 3" as never);
    await mockSettingNamed(form, t("food.nutrients.settings.unit")).component("dropdown").change("g" as never);
    await mockSettingNamed(form, t("food.nutrients.settings.target")).component("dropdown").change("fixed" as never);
    await mockSettingNamed(form, t("food.nutrients.settings.target")).component("text").change("1.6" as never);
    press(form);
    await tick();
    expect(plugin.settings.nutrients).toEqual([
      { key: "omega_3", name: "Omega 3", unit: "g", group: "vitamin", target: { mode: "fixed", value: 1.6 } },
    ]);
  });

  it("refuses a missing name or key and a key already used", async () => {
    const { plugin, list } = setup();
    const modal = captureModal(() => list.addItem!.action(document.body));
    press(modal.contentEl);
    await tick();
    expect(plugin.settings.nutrients).toHaveLength(defaultNutrients().length);
    await mockSettingNamed(modal.contentEl, t("food.nutrients.settings.name")).component("text").change("Again" as never);
    await mockSettingNamed(modal.contentEl, t("food.nutrients.settings.key")).component("text").change("vitamin_c" as never);
    press(modal.contentEl);
    await tick();
    expect(plugin.settings.nutrients).toHaveLength(defaultNutrients().length);
  });

  it("keeps the key's place when a nutrient is edited", async () => {
    const { plugin, list } = setup();
    const modal = captureModal(() => list.items![1].action!(document.body));
    await mockSettingNamed(modal.contentEl, t("food.nutrients.settings.target")).component("text").change("120" as never);
    press(modal.contentEl);
    await tick();
    expect(plugin.settings.nutrients[1]).toMatchObject({ key: "vitamin_c", target: { mode: "fixed", value: 120 } });
    expect(plugin.settings.nutrients).toHaveLength(defaultNutrients().length);
  });
});
