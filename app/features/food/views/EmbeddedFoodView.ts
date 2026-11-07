import { MarkdownRenderChild, Notice, TFile } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { StatCard } from "@app/components/molecules/StatCard";
import { ChipGroup } from "@app/components/molecules/ChipGroup";
import { NumberField, parseNumber } from "@app/components/molecules/NumberField";
import { UndoNotice } from "@app/components/molecules/UndoNotice";
import { ProgressMeter } from "@app/components/atoms/ProgressMeter";
import { Button, BUTTONSIZE, BUTTONVARIANT } from "@app/components/atoms/Button";
import { DeleteButton } from "@app/components/atoms/DeleteButton";
import { foodTargets, type FoodTargets } from "@app/features/food/business/foodTargets";
import { foodDay, mealAt, type FoodDay, type FoodTotals } from "@app/features/food/business/foodDay";
import { resolveDay } from "@app/features/daycard/business/dayReport";
import { nutrientsFor } from "@app/services/food/FoodLibrary";
import { MEALS, type FoodEntry, type Meal } from "@app/services/food/FoodLog";
import type { SavedMeal } from "@app/services/food/SavedMeals";
import { expandMeal, itemsOf, mealTotals } from "@app/features/food/business/savedMeal";
import { SaveMealModal } from "@app/features/food/modals/SaveMealModal";
import { localDay } from "@app/services/history/TrainingHistory";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedFoodParams } from "@app/features/food/foodBlock";
import { convertWeight } from "@app/utils/WeightUnitUtils";
import { DomUtils } from "@app/utils/DomUtils";
import { ErrorUtils } from "@app/utils/ErrorUtils";
import { t } from "@app/i18n";

const FIGURES = ["kcal", "protein", "fat", "carbs"] as const;
const FOOD_KEY = "food-name";

/** The `workout-food` block: add food to a meal, see the day's meals and totals */
export class EmbeddedFoodView extends BaseView {
  /** @param sourcePath - The note the block is written in: its `date` property or name gives the day */
  createFood(
    container: HTMLElement,
    params: EmbeddedFoodParams,
    sourcePath: string,
  ): MarkdownRenderChild {
    return this.track(
      new FoodRenderChild(container, this.plugin, params, sourcePath, (error) =>
        this.handleError(container, error),
      ),
    );
  }
}

class FoodRenderChild extends MarkdownRenderChild {
  /** The meal the form adds to; kept across redraws */
  private meal: Meal = mealAt(new Date().getHours());

  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedFoodParams,
    private sourcePath: string,
    private onError: (error: unknown) => void,
  ) {
    super(container);
  }

  onload(): void {
    this.register(this.plugin.eventBus.on("food:changed", () => void this.render()));
    this.register(this.plugin.eventBus.on("meals:changed", () => void this.render()));
    // A goal in grams per kg follows the body weight
    this.register(this.plugin.eventBus.on("bodyweight:changed", () => void this.render()));
    this.register(this.plugin.eventBus.on("settings:changed", () => void this.render()));
    void this.render();
  }

  private day(): string {
    const { app } = this.plugin;
    const file = app.vault.getAbstractFileByPath(this.sourcePath);
    const frontmatter =
      file instanceof TFile ? app.metadataCache.getFileCache(file)?.frontmatter : undefined;
    return resolveDay({
      param: this.params.date,
      property: frontmatter?.date,
      basename: file instanceof TFile ? file.basename : "",
      today: localDay(new Date()),
    });
  }

  async render(refocus = false): Promise<void> {
    try {
      const [entries, saved, weights] = await Promise.all([
        this.plugin.getFoodLog().read(),
        this.plugin.getSavedMeals().read(),
        this.plugin.getBodyWeightLog().read(),
      ]);
      const day = this.day();
      const { settings } = this.plugin;
      const goals = foodTargets({
        params: this.params,
        goals: settings.nutritionGoals ?? [],
        activeGoal: settings.activeNutritionGoal ?? "",
        weights,
        day,
        unit: settings.weightUnit,
      });
      this.draw(foodDay(day, entries), saved, goals);
      if (refocus) DomUtils.focusByKey(this.containerEl, FOOD_KEY);
    } catch (error) {
      this.onError(error);
    }
  }

  private draw(day: FoodDay, saved: SavedMeal[], goals: FoodTargets): void {
    const root = this.containerEl;
    root.empty();
    const card = BlockCard.create(root, {
      title: this.params.title ?? t("food.title", { day: day.day }),
      className: "workout-food",
    });

    this.drawGoal(card.el, goals);
    this.drawTotals(card.el, day.totals, goals.targets);
    this.drawForm(card.el, day.day);
    this.drawSaved(card.el, day.day, saved);

    const list = card.el.createDiv({ cls: "workout-food-list" });
    let any = false;
    for (const meal of MEALS) {
      const entries = day.meals[meal];
      if (entries.length === 0) continue;
      any = true;
      const section = list.createDiv({ cls: "workout-food-meal" });
      const head = section.createDiv({ cls: "workout-food-meal-head" });
      head.createSpan({
        cls: "workout-food-meal-title",
        text: `${t(`food.meals.${meal}`)}: ${t("food.kcal", { kcal: String(entries.reduce((n, e) => n + e.kcal, 0)) })}`,
      });
      const saveAs = Button.create(head, {
        text: t("food.sets.saveAs"),
        variant: BUTTONVARIANT.SECONDARY,
        size: BUTTONSIZE.SMALL,
        ariaLabel: t("food.sets.saveAsLabel", { meal: t(`food.meals.${meal}`) }),
      });
      Button.onClick(saveAs, () => this.askName(entries, saved));
      for (const entry of entries) this.drawEntry(section, entry);
    }
    if (!any) list.createDiv({ cls: "workout-food-empty", text: t("food.empty") });
  }

  /** The goal the targets come from: pick another here, and what it was worked out from */
  private drawGoal(parent: HTMLElement, goals: FoodTargets): void {
    const all = this.plugin.settings.nutritionGoals ?? [];
    if (all.length === 0) return;
    const box = parent.createDiv({ cls: "workout-food-goal" });
    // A block that names its goal keeps it; otherwise the pick is the settings'
    if (this.params.goal === undefined) {
      ChipGroup.create(box, {
        label: t("food.goals.label"),
        options: [{ id: "", label: t("food.goals.none") }, ...all.map((g) => ({ id: g.id, label: g.name }))],
        selected: goals.goal?.id ?? "",
        onPick: (id) => void this.pickGoal(id),
        focusKeyPrefix: "food-goal",
      });
    }
    if (goals.goal && goals.weightKg !== undefined && !goals.needsWeight) {
      const unit = this.plugin.settings.weightUnit;
      const shown = convertWeight(goals.weightKg, "kg", unit);
      box.createDiv({
        cls: "workout-food-goal-basis",
        text: t("food.goals.basis", { goal: goals.goal.name, weight: String(Math.round(shown * 10) / 10), unit }),
      });
    } else if (goals.needsWeight) {
      box.createDiv({ cls: "workout-food-goal-basis", text: t("food.goals.needsWeight") });
    }
  }

  private async pickGoal(id: string): Promise<void> {
    const { settings } = this.plugin;
    const previousValue = settings.activeNutritionGoal;
    if (previousValue === id) return;
    settings.activeNutritionGoal = id;
    try {
      await this.plugin.saveSettings();
      this.plugin.eventBus.emit({
        type: "settings:changed",
        payload: { key: "activeNutritionGoal", previousValue, newValue: id },
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }

  private drawTotals(parent: HTMLElement, totals: FoodTotals, targets: FoodTargets["targets"]): void {
    const row = StatCard.row(parent);
    for (const key of FIGURES) {
      const target = targets[key];
      const unit = key === "kcal" ? t("food.kcalUnit") : t("food.gramsUnit");
      const value = `${totals[key]} ${unit}`;
      const cell = StatCard.create(row, {
        label: t(`food.figures.${key}`),
        value,
        detail: target ? t("food.ofTarget", { target: String(target), unit }) : undefined,
      });
      if (target) {
        ProgressMeter.create(cell, {
          value: totals[key],
          max: target,
          label: t("food.progress", { name: t(`food.figures.${key}`), value: String(totals[key]), target: String(target) }),
        });
      }
    }
  }

  private drawForm(parent: HTMLElement, day: string): void {
    const library = this.plugin.getFoodLibrary();
    const log = this.plugin.getFoodLog();
    const form = parent.createDiv({ cls: "workout-food-form" });

    ChipGroup.create(form, {
      label: t("food.meal"),
      options: MEALS.map((id) => ({ id, label: t(`food.meals.${id}`) })),
      selected: this.meal,
      onPick: (id) => {
        this.meal = id as Meal;
      },
      focusKeyPrefix: "food-meal",
    });

    const listId = `workout-food-names-${Math.random().toString(36).slice(2, 8)}`;
    const name = form.createEl("input", {
      cls: "workout-food-name",
      attr: { type: "text", list: listId, placeholder: t("food.foodPlaceholder"), "aria-label": t("food.food") },
    });
    DomUtils.setFocusKey(name, FOOD_KEY);
    const options = form.createEl("datalist", { attr: { id: listId } });
    for (const page of library.pages()) options.createEl("option", { value: page.name });

    const submit = async () => {
      const page = library.find(name.value);
      if (!page) {
        new Notice(t("food.unknown", { name: name.value.trim() || "…" }));
        return;
      }
      const typed = parseNumber(grams.input.value);
      if (!(typed > 0)) {
        grams.setError(t("food.invalidGrams"));
        return;
      }
      grams.setError();
      try {
        const eaten = nutrientsFor(page.per100, typed);
        await log.add({
          date: day,
          meal: this.meal,
          food: page.name,
          grams: typed,
          kcal: eaten.kcal,
          protein: eaten.protein,
          fat: eaten.fat,
          carbs: eaten.carbs,
        });
        await this.render(true);
      } catch (error) {
        new Notice(ErrorUtils.getErrorMessage(error));
      }
    };
    name.addEventListener("keydown", (event) => {
      if (event.key === "Enter") void submit();
    });
    const grams = NumberField.create(form, {
      label: t("food.grams"),
      unit: t("food.gramsUnit"),
      step: 10,
      min: 1,
      enterKeyHint: "done",
      onEnter: () => void submit(),
    });
    const add = Button.create(form, { text: t("food.add"), variant: BUTTONVARIANT.PRIMARY });
    Button.onClick(add, () => void submit());
  }

  /** The saved meals: one tap adds a meal's foods to the chosen meal of the day */
  private drawSaved(parent: HTMLElement, day: string, saved: SavedMeal[]): void {
    const find = (name: string) => this.plugin.getFoodLibrary().find(name);
    const box = parent.createDiv({ cls: "workout-food-saved" });
    box.createDiv({ cls: "workout-food-saved-title", text: t("food.sets.title") });
    if (saved.length === 0) {
      box.createDiv({ cls: "workout-food-empty", text: t("food.sets.empty") });
      return;
    }
    for (const meal of saved) {
      const item = box.createDiv({ cls: "workout-food-saved-item" });
      const add = Button.create(item, {
        text: t("food.sets.chip", { name: meal.name, kcal: String(mealTotals(meal, find).kcal) }),
        variant: BUTTONVARIANT.SECONDARY,
        size: BUTTONSIZE.SMALL,
        ariaLabel: t("food.sets.addLabel", { name: meal.name, meal: t(`food.meals.${this.meal}`) }),
      });
      Button.onClick(add, () => void this.addSaved(meal, day));
      DeleteButton.create(item, {
        label: t("food.sets.remove", { name: meal.name }),
        onClick: () => void this.removeSaved(meal),
      });
    }
  }

  private async addSaved(saved: SavedMeal, day: string): Promise<void> {
    const log = this.plugin.getFoodLog();
    const { entries, missing } = expandMeal(
      saved,
      (name) => this.plugin.getFoodLibrary().find(name),
      day,
      this.meal,
    );
    if (missing.length > 0) {
      new Notice(t("food.sets.missing", { foods: missing.join(", ") }));
    }
    if (entries.length === 0) return;
    try {
      const added = await log.addMany(entries);
      UndoNotice.show({
        message: t("food.sets.added", { name: saved.name, count: String(added.length) }),
        onUndo: () => void log.deleteMany(added.map((e) => e.timestamp)),
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }

  private askName(entries: readonly FoodEntry[], saved: SavedMeal[]): void {
    new SaveMealModal(
      this.plugin.app,
      saved.map((m) => m.name),
      (name) => void this.saveMeal(name, entries),
    ).open();
  }

  private async saveMeal(name: string, entries: readonly FoodEntry[]): Promise<void> {
    try {
      const meal = await this.plugin.getSavedMeals().save(name, itemsOf(entries));
      new Notice(t("food.sets.saved", { name: meal.name }));
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }

  /** One tap deletes a saved meal; Undo saves it again */
  private async removeSaved(meal: SavedMeal): Promise<void> {
    const sets = this.plugin.getSavedMeals();
    try {
      const gone = await sets.delete(meal.name);
      if (!gone) return;
      UndoNotice.show({
        message: t("food.sets.removed", { name: gone.name }),
        onUndo: () => void sets.save(gone.name, gone.items),
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }

  private drawEntry(parent: HTMLElement, entry: FoodEntry): void {
    const row = parent.createDiv({ cls: "workout-food-row" });
    row.createSpan({ cls: "workout-food-row-name", text: entry.food });
    row.createSpan({ cls: "workout-food-row-grams", text: `${entry.grams} ${t("food.gramsUnit")}` });
    row.createSpan({
      cls: "workout-food-row-macros",
      text: t("food.macros", {
        kcal: String(entry.kcal),
        protein: String(entry.protein),
        fat: String(entry.fat),
        carbs: String(entry.carbs),
      }),
    });
    DeleteButton.create(row, {
      label: t("food.remove", { food: entry.food }),
      onClick: () => void this.remove(entry),
    });
  }

  /** One tap removes the entry; Undo puts it back with its timestamp */
  private async remove(entry: FoodEntry): Promise<void> {
    const log = this.plugin.getFoodLog();
    try {
      await log.delete(entry.timestamp);
      UndoNotice.show({
        message: t("food.removed", { food: entry.food }),
        onUndo: () => {
          const { timestamp, ...input } = entry;
          void log.add(input, timestamp);
        },
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }
}
