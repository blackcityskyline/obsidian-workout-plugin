import { MarkdownRenderChild, TFile } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { StatCard } from "@app/components/molecules/StatCard";
import { dayReport, resolveDay, type DayReport } from "@app/features/daycard/business/dayReport";
import { localDay } from "@app/services/history/TrainingHistory";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedDayCardParams } from "@app/features/daycard/dayCardBlock";
import { t } from "@app/i18n";

/** The `workout-day` block: the Daily Report Card of the note's day */
export class EmbeddedDayCardView extends BaseView {
  /** @param sourcePath - The note the block is written in: its `date` property or name gives the day */
  createDayCard(
    container: HTMLElement,
    params: EmbeddedDayCardParams,
    sourcePath: string,
  ): MarkdownRenderChild {
    return this.track(
      new DayCardRenderChild(container, this.plugin, params, sourcePath, (error) =>
        this.handleError(container, error),
      ),
    );
  }
}

const SEPARATOR = " · ";

const REFRESH_EVENTS = [
  "log:added",
  "log:updated",
  "log:deleted",
  "log:bulk-changed",
  "bodyweight:changed",
  "settings:changed",
] as const;

class DayCardRenderChild extends MarkdownRenderChild {
  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedDayCardParams,
    private sourcePath: string,
    private onError: (error: unknown) => void,
  ) {
    super(container);
  }

  onload(): void {
    for (const type of REFRESH_EVENTS) {
      this.register(this.plugin.eventBus.on(type, () => void this.render()));
    }
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

  async render(): Promise<void> {
    try {
      const [logs, weights] = await Promise.all([
        this.plugin.getWorkoutLogData(),
        this.plugin.getBodyWeightLog().read(),
      ]);
      this.draw(dayReport(this.day(), logs, weights));
    } catch (error) {
      this.onError(error);
    }
  }

  private draw(report: DayReport): void {
    const root = this.containerEl;
    root.empty();
    const unit = this.plugin.settings.weightUnit;
    const card = BlockCard.create(root, { title: report.day, className: "workout-daycard" });

    const figures = StatCard.row(card.el);
    StatCard.create(figures, { label: t("dayCard.sets"), value: report.totalSets });
    StatCard.create(figures, {
      label: t("dayCard.volume"),
      value: report.totalSets > 0 ? `${report.totalVolume} ${unit}` : "—",
    });
    StatCard.create(figures, {
      label: t("dayCard.bodyWeight"),
      value: report.bodyWeight ? `${report.bodyWeight.weight} ${unit}` : "—",
    });
    if (report.records > 0) {
      StatCard.create(figures, { label: t("dayCard.records"), value: report.records });
    }

    if (report.sessions.length === 0) {
      card.el.createDiv({ cls: "workout-daycard-empty", text: t("dayCard.rest") });
      return;
    }
    for (const session of report.sessions) {
      const block = card.el.createDiv({ cls: "workout-daycard-session" });
      const title = [session.workout ?? t("dayCard.unnamedWorkout")];
      if (session.duration) {
        title.push(
          t("dayCard.minutes", { minutes: String(Math.round(session.duration / 60)) }),
        );
      }
      block.createDiv({
        cls: "workout-daycard-session-title",
        text: title.join(SEPARATOR),
      });
      for (const exercise of session.exercises) {
        const parts = [t("dayCard.setsCount", { count: String(exercise.sets) })];
        if (exercise.topWeight > 0) {
          parts.push(
            t("dayCard.topWeight", { weight: String(exercise.topWeight), unit }),
          );
        }
        block.createDiv({
          cls: "workout-daycard-exercise",
          text: `${exercise.name}: ${parts.join(SEPARATOR)}`,
        });
      }
    }
  }
}
