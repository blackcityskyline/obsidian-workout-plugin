import { Setting, type App } from "obsidian";
import { t } from "@app/i18n";
import { ModalBase } from "@app/features/modals/base/ModalBase";
import {
  NUTRIENT_GROUPS,
  NUTRIENT_UNITS,
  nutrientKey,
  type NutrientDef,
  type NutrientGroup,
  type NutrientUnit,
} from "@app/services/food/NutrientCatalog";
import type { TargetMode } from "@app/services/food/NutritionGoals";

const TARGET_MODES: TargetMode[] = ["none", "fixed", "perKg"];

/** Form to add or edit a tracked nutrient: name, page property, unit, group and daily target */
export class NutrientEditorModal extends ModalBase {
  constructor(
    app: App,
    private form: NutrientDef,
    private isNew: boolean,
    /** Returns false to keep the form open (validation failed) */
    private save: () => Promise<boolean>,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl, form } = this;
    contentEl.empty();
    this.titleEl.setText(this.isNew ? t("food.nutrients.settings.editorAdd") : t("food.nutrients.settings.editorEdit"));

    new Setting(contentEl)
      .setName(t("food.nutrients.settings.name"))
      .addText((text) => text.setValue(form.name).onChange((v) => (form.name = v)));

    new Setting(contentEl)
      .setName(t("food.nutrients.settings.key"))
      .setDesc(t("food.nutrients.settings.keyDesc"))
      .addText((text) =>
        text.setValue(form.key).onChange((v) => {
          form.key = nutrientKey(v);
        }),
      );

    new Setting(contentEl).setName(t("food.nutrients.settings.unit")).addDropdown((d) => {
      for (const unit of NUTRIENT_UNITS) d.addOption(unit, unit);
      d.setValue(form.unit).onChange((v) => (form.unit = v as NutrientUnit));
    });

    new Setting(contentEl).setName(t("food.nutrients.settings.group")).addDropdown((d) => {
      for (const group of NUTRIENT_GROUPS) d.addOption(group, t(`food.nutrients.groups.${group}`));
      d.setValue(form.group).onChange((v) => (form.group = v as NutrientGroup));
    });

    const target = new Setting(contentEl).setName(t("food.nutrients.settings.target"));
    let valueInput: HTMLInputElement | undefined;
    target.addDropdown((d) => {
      for (const mode of TARGET_MODES) d.addOption(mode, t(`food.goals.modes.${mode}`));
      d.setValue(form.target.mode).onChange((v) => {
        form.target.mode = v as TargetMode;
        if (valueInput) valueInput.disabled = form.target.mode === "none";
      });
    });
    target.addText((text) => {
      valueInput = text.inputEl;
      valueInput.type = "number";
      valueInput.min = "0";
      valueInput.step = "any";
      valueInput.disabled = form.target.mode === "none";
      text
        .setValue(form.target.value === undefined ? "" : String(form.target.value))
        .setPlaceholder(t("food.goals.editor.value"))
        .onChange((v) => {
          const n = Number(v.replace(",", "."));
          form.target.value = v.trim() !== "" && Number.isFinite(n) ? n : undefined;
        });
    });

    new Setting(contentEl)
      .setClass("workout-modal-actions")
      .addButton((b) =>
        b
          .setButtonText(t("food.nutrients.settings.save"))
          .setCta()
          .onClick(async () => {
            if (await this.save()) this.close();
          }),
      )
      .addButton((b) => b.setButtonText(t("common.cancel")).onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
