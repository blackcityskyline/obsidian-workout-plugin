import { Notice, type App } from "obsidian";
import { t } from "@app/i18n";
import type { DefinitionItem } from "@app/features/settings/settingDefinitionTypes";
import { NutrientEditorModal } from "@app/features/food/settings/NutrientEditorModal";
import { ConfirmModal } from "@app/features/modals/common/ConfirmModal";
import { nutrientKey, type NutrientDef } from "@app/services/food/NutrientCatalog";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";

/** A nutrient's target in words: "90 mg", "39 mg/kg", or nothing */
export function describeTarget(def: NutrientDef): string {
  const { mode, value } = def.target;
  if (!value) return "";
  if (mode === "fixed") return `${value} ${def.unit}`;
  if (mode === "perKg") return `${value} ${def.unit}/${t("food.nutrients.kg")}`;
  return "";
}

/** Settings → Nutrients: the vitamins, minerals and amino acids the food block tracks */
export class NutrientsSettings {
  constructor(
    private app: App,
    private plugin: WorkoutPluginContext,
    private refresh: () => void,
  ) {}

  private get nutrients(): NutrientDef[] {
    return (this.plugin.settings.nutrients ??= []);
  }

  definitions(): DefinitionItem[] {
    const nutrients = this.nutrients;
    return [
      {
        type: "list",
        heading: t("food.nutrients.settings.heading"),
        emptyState: t("food.nutrients.settings.empty"),
        addItem: { name: t("food.nutrients.settings.add"), action: () => this.edit(null) },
        onDelete: (index) => this.confirmDelete(nutrients[index]?.key),
        deleteTooltip: t("food.nutrients.settings.delete"),
        items: nutrients.map((n) => ({
          name: n.name,
          desc: [t(`food.nutrients.groups.${n.group}`), n.key, describeTarget(n)].filter(Boolean).join(" · "),
          tooltip: t("food.nutrients.settings.edit"),
          action: () => this.edit(n),
        })),
      },
    ];
  }

  private edit(existing: NutrientDef | null): void {
    const form: NutrientDef = existing
      ? { ...existing, target: { ...existing.target } }
      : { key: "", name: "", unit: "mg", group: "vitamin", target: { mode: "none" } };
    new NutrientEditorModal(this.app, form, existing === null, () => this.saveNutrient(form, existing?.key ?? null)).open();
  }

  private async saveNutrient(nutrient: NutrientDef, originalKey: string | null): Promise<boolean> {
    nutrient.name = nutrient.name.trim();
    nutrient.key = nutrientKey(nutrient.key);
    if (!nutrient.name || !nutrient.key) {
      new Notice(t("food.nutrients.settings.nameRequired"));
      return false;
    }
    const list = this.nutrients;
    if (list.some((n) => n.key !== originalKey && n.key === nutrient.key)) {
      new Notice(t("food.nutrients.settings.keyExists"));
      return false;
    }
    const index = list.findIndex((n) => n.key === originalKey);
    if (index === -1) list.push(nutrient);
    else list[index] = nutrient;
    await this.plugin.saveSettings();
    this.notifyChanged(nutrient.key);
    new Notice(t("food.nutrients.settings.saved", { name: nutrient.name }));
    this.refresh();
    return true;
  }

  private confirmDelete(key: string | undefined): void {
    if (key === undefined) return;
    new ConfirmModal(this.app, t("food.nutrients.settings.confirmDelete"), async () => {
      const list = this.nutrients;
      const index = list.findIndex((n) => n.key === key);
      if (index === -1) return;
      list.splice(index, 1);
      await this.plugin.saveSettings();
      this.notifyChanged(key);
      new Notice(t("food.nutrients.settings.deleted"));
      this.refresh();
    }).open();
  }

  private notifyChanged(key: string): void {
    this.plugin.eventBus.emit({
      type: "settings:changed",
      payload: { key: "nutrients", previousValue: key, newValue: this.nutrients },
    });
  }
}
