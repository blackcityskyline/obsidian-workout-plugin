import { Setting, type App } from "obsidian";
import { t } from "@app/i18n";
import { ModalBase } from "@app/features/modals/base/ModalBase";
import {
  FIGURE_KEYS,
  modesFor,
  type NutritionGoal,
  type TargetMode,
} from "@app/services/food/NutritionGoals";

/** The modes that carry a number */
const NEEDS_VALUE: ReadonlySet<TargetMode> = new Set(["perKg", "fixed", "percentKcal"]);

/** Form to add or edit a nutrition goal: a name and, per figure, how it is worked out */
export class NutritionGoalEditorModal extends ModalBase {
  constructor(
    app: App,
    private form: NutritionGoal,
    private isNew: boolean,
    /** Returns false to keep the form open (validation failed) */
    private save: () => Promise<boolean>,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl, form } = this;
    contentEl.empty();
    this.titleEl.setText(this.isNew ? t("food.goals.editor.add") : t("food.goals.editor.edit"));

    new Setting(contentEl)
      .setName(t("food.goals.editor.name"))
      .addText((text) =>
        text
          .setValue(form.name)
          .setPlaceholder(t("food.goals.editor.namePlaceholder"))
          .onChange((value) => {
            form.name = value;
          }),
      );

    for (const figure of FIGURE_KEYS) {
      const spec = form[figure];
      const row = new Setting(contentEl)
        .setName(t(`food.figures.${figure}`))
        .setDesc(t("food.goals.editor.figureDesc"));
      let valueInput: HTMLInputElement | undefined;
      row.addDropdown((dropdown) => {
        for (const mode of modesFor(figure)) {
          dropdown.addOption(mode, t(`food.goals.modes.${figure === "kcal" && mode === "perKg" ? "kcalPerKg" : mode}`));
        }
        dropdown.setValue(spec.mode).onChange((value) => {
          spec.mode = value as TargetMode;
          if (valueInput) valueInput.disabled = !NEEDS_VALUE.has(spec.mode);
        });
      });
      row.addText((text) => {
        valueInput = text.inputEl;
        valueInput.type = "number";
        valueInput.min = "0";
        valueInput.step = "any";
        valueInput.disabled = !NEEDS_VALUE.has(spec.mode);
        text
          .setValue(spec.value === undefined ? "" : String(spec.value))
          .setPlaceholder(t("food.goals.editor.value"))
          .onChange((value) => {
            const n = Number(value.replace(",", "."));
            spec.value = value.trim() !== "" && Number.isFinite(n) ? n : undefined;
          });
      });
    }

    new Setting(contentEl)
      .setClass("workout-modal-actions")
      .addButton((button) =>
        button
          .setButtonText(t("food.goals.editor.save"))
          .setCta()
          .onClick(async () => {
            if (await this.save()) this.close();
          }),
      )
      .addButton((button) =>
        button.setButtonText(t("common.cancel")).onClick(() => this.close()),
      );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
