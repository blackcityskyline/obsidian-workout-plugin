import type { App } from "obsidian";
import { ModalBase } from "@app/features/modals/base/ModalBase";
import { Button, BUTTONVARIANT } from "@app/components/atoms";
import { t } from "@app/i18n";

/** Asks for the name of a meal to save; a name already saved is replaced */
export class SaveMealModal extends ModalBase {
  constructor(
    app: App,
    private existing: readonly string[],
    private onSave: (name: string) => void,
    private initial = "",
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("workout-modal");
    contentEl.createEl("h2", { text: t("food.sets.saveTitle") });

    const listId = `workout-meal-names-${Math.random().toString(36).slice(2, 8)}`;
    const field = contentEl.createDiv({ cls: "workout-charts-form-group" });
    // eslint-disable-next-line i18next/no-literal-string -- element id, not UI text
    const id = `${listId}-input`;
    field.createEl("label", { text: t("food.sets.name"), attr: { for: id } });
    const input = field.createEl("input", {
      attr: { id, type: "text", list: listId, placeholder: t("food.sets.namePlaceholder") },
    });
    input.value = this.initial;
    const list = field.createEl("datalist", { attr: { id: listId } });
    for (const name of this.existing) list.createEl("option", { value: name });
    const hint = field.createDiv({ cls: "workout-field-error" });

    const save = () => {
      const name = input.value.trim();
      if (!name) {
        hint.setText(t("food.sets.nameRequired"));
        return;
      }
      this.close();
      this.onSave(name);
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") save();
    });

    const actions = Button.createModalActions(contentEl);
    const saveBtn = Button.create(actions, {
      text: t("food.sets.save"),
      variant: BUTTONVARIANT.PRIMARY,
    });
    Button.onClick(saveBtn, save);
    const cancel = Button.create(actions, {
      text: t("common.cancel"),
      variant: BUTTONVARIANT.SECONDARY,
    });
    Button.onClick(cancel, () => this.close());
    input.focus();
  }

  onClose() {
    this.contentEl.empty();
  }
}
