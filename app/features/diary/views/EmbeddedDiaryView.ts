import { MarkdownRenderChild, Notice, TFile } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { dailyFolder, ensureDailyNote } from "@app/features/daycard/business/dailyCardNote";
import { noteDay } from "@app/features/daycard/business/noteDay";
import { readDiary, withDiary } from "@app/features/diary/business/diaryText";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedDiaryParams } from "@app/features/diary/diaryBlock";
import { ErrorUtils } from "@app/utils/ErrorUtils";
import { t } from "@app/i18n";

/** The `workout-diary` block: the day's free text, kept in the day's page under its Diary heading */
export class EmbeddedDiaryView extends BaseView {
  createDiary(
    container: HTMLElement,
    params: EmbeddedDiaryParams,
    sourcePath: string,
  ): MarkdownRenderChild {
    return this.track(new DiaryRenderChild(container, this.plugin, params, sourcePath));
  }
}

class DiaryRenderChild extends MarkdownRenderChild {
  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedDiaryParams,
    private sourcePath: string,
  ) {
    super(container);
  }

  onload(): void {
    void this.render();
  }

  /** The block draws once: typing is never redrawn under the cursor */
  private async render(): Promise<void> {
    const day = noteDay(this.plugin, this.sourcePath, this.params.date);
    const { vault } = this.plugin.app;
    const existing = vault.getAbstractFileByPath(
      `${dailyFolder(this.plugin.settings.exerciseFolderPath)}/${day}.md`,
    );
    const text = existing instanceof TFile ? readDiary(await vault.read(existing)) : "";

    const root = this.containerEl;
    root.empty();
    const card = BlockCard.create(root, {
      title: this.params.title ?? `${t("diary.title")} · ${day}`,
      className: "workout-diary",
    });
    const area = card.el.createEl("textarea", {
      cls: "workout-diary-text",
      attr: { rows: "5", "aria-label": t("diary.title"), placeholder: t("diary.placeholder") },
    });
    area.value = text;
    area.addEventListener("change", () => void this.save(day, area.value));
  }

  private async save(day: string, text: string): Promise<void> {
    try {
      const { file } = await ensureDailyNote(this.plugin, day);
      await this.plugin.app.vault.process(file, (content) => withDiary(content, text));
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }
}
