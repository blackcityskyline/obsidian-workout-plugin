import { Notice, type App } from "obsidian";
import { t } from "@app/i18n";
import type { DefinitionItem } from "@app/features/settings/settingDefinitionTypes";
import { NutritionGoalEditorModal } from "@app/features/food/settings/NutritionGoalEditorModal";
import { ConfirmModal } from "@app/features/modals/common/ConfirmModal";
import {
  FIGURE_KEYS,
  goalId,
  type FigureKey,
  type NutritionGoal,
  type TargetSpec,
} from "@app/services/food/NutritionGoals";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";

/** One figure of a goal in words: "Protein 1.5 g/kg", "Carbs the rest" */
export function describeSpec(figure: FigureKey, spec: TargetSpec): string | undefined {
  const name = t(`food.figures.${figure}`);
  const value = spec.value;
  switch (spec.mode) {
    case "perKg":
      return value ? `${name} ${value} ${figure === "kcal" ? t("food.goals.units.kcalPerKg") : t("food.goals.units.gPerKg")}` : undefined;
    case "fixed":
      return value ? `${name} ${value} ${figure === "kcal" ? t("food.kcalUnit") : t("food.gramsUnit")}` : undefined;
    case "percentKcal":
      return value ? `${name} ${value}% ${t("food.goals.units.ofCalories")}` : undefined;
    case "remainder":
      return `${name} ${t("food.goals.units.remainder")}`;
    default:
      return undefined;
  }
}

/** Settings → Nutrition goals: scenarios whose figures are formulas of body weight */
export class NutritionGoalsSettings {
  constructor(
    private app: App,
    private plugin: WorkoutPluginContext,
    /** Redraws the settings tab after the list changed */
    private refresh: () => void,
  ) {}

  private get goals(): NutritionGoal[] {
    return (this.plugin.settings.nutritionGoals ??= []);
  }

  definitions(): DefinitionItem[] {
    const goals = this.goals;
    return [
      {
        type: "list",
        heading: t("food.goals.settings.heading"),
        emptyState: t("food.goals.settings.empty"),
        addItem: {
          name: t("food.goals.settings.add"),
          action: () => this.edit(null),
        },
        onDelete: (index) => this.confirmDelete(goals[index]?.id),
        deleteTooltip: t("food.goals.settings.delete"),
        items: goals.map((goal) => ({
          name: goal.name,
          desc: FIGURE_KEYS.map((f) => describeSpec(f, goal[f])).filter(Boolean).join(" · "),
          tooltip: t("food.goals.settings.edit"),
          action: () => this.edit(goal),
        })),
      },
    ];
  }

  private edit(existing: NutritionGoal | null): void {
    const form: NutritionGoal = existing
      ? {
          ...existing,
          kcal: { ...existing.kcal },
          protein: { ...existing.protein },
          fat: { ...existing.fat },
          carbs: { ...existing.carbs },
        }
      : {
          id: "",
          name: "",
          kcal: { mode: "perKg" },
          protein: { mode: "perKg" },
          fat: { mode: "perKg" },
          carbs: { mode: "remainder" },
        };
    new NutritionGoalEditorModal(this.app, form, existing === null, () =>
      this.saveGoal(form, existing?.id ?? null),
    ).open();
  }

  private async saveGoal(goal: NutritionGoal, originalId: string | null): Promise<boolean> {
    const name = goal.name.trim();
    if (!name) {
      new Notice(t("food.goals.settings.nameRequired"));
      return false;
    }
    goal.name = name;
    // An edited goal keeps its id, so the active goal and blocks naming it still find it
    goal.id = originalId ?? goalId(name);
    if (!goal.id) goal.id = `goal_${Date.now()}`;
    const goals = this.goals;
    const clash = goals.some(
      (g) => g.id !== originalId && (g.id === goal.id || g.name.trim().toLowerCase() === name.toLowerCase()),
    );
    if (clash) {
      new Notice(t("food.goals.settings.nameExists"));
      return false;
    }
    const index = goals.findIndex((g) => g.id === originalId);
    if (index === -1) goals.push(goal);
    else goals[index] = goal;
    await this.plugin.saveSettings();
    this.notifyChanged(goal.id);
    new Notice(t("food.goals.settings.saved", { name }));
    this.refresh();
    return true;
  }

  private confirmDelete(id: string | undefined): void {
    if (id === undefined) return;
    new ConfirmModal(this.app, t("food.goals.settings.confirmDelete"), async () => {
      await this.deleteGoal(id);
    }).open();
  }

  private async deleteGoal(id: string): Promise<void> {
    const goals = this.goals;
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return;
    goals.splice(index, 1);
    if (this.plugin.settings.activeNutritionGoal === id) this.plugin.settings.activeNutritionGoal = "";
    await this.plugin.saveSettings();
    this.notifyChanged(id);
    new Notice(t("food.goals.settings.deleted"));
    this.refresh();
  }

  /** Food blocks work their targets out again */
  private notifyChanged(id: string): void {
    this.plugin.eventBus.emit({
      type: "settings:changed",
      payload: { key: "nutritionGoals", previousValue: id, newValue: this.goals },
    });
  }
}
