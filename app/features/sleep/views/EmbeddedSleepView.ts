import { MarkdownRenderChild, Notice } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { StatCard } from "@app/components/molecules/StatCard";
import { NumberField, parseNumber } from "@app/components/molecules/NumberField";
import { ChipGroup } from "@app/components/molecules/ChipGroup";
import { UndoNotice } from "@app/components/molecules/UndoNotice";
import { Button, BUTTONVARIANT } from "@app/components/atoms/Button";
import { DeleteButton } from "@app/components/atoms/DeleteButton";
import { SleepHistory } from "@app/services/sleep/SleepHistory";
import { hoursBetween, type SleepEntry } from "@app/services/sleep/SleepLog";
import { localDay } from "@app/services/history/TrainingHistory";
import { noteDay } from "@app/features/daycard/business/noteDay";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedSleepParams } from "@app/features/sleep/sleepBlock";
import { ChartRenderer } from "@app/features/charts/components/ChartRenderer";
import { CHART_DATA_TYPE } from "@app/features/charts/types";
import { ErrorUtils } from "@app/utils/ErrorUtils";
import { t } from "@app/i18n";

const QUALITIES = ["1", "2", "3", "4", "5"];

/** The `workout-sleep` block: night form, figures and the list of nights */
export class EmbeddedSleepView extends BaseView {
  /** @param sourcePath - The note the block is written in: it gives the day the form logs for */
  createSleep(
    container: HTMLElement,
    params: EmbeddedSleepParams,
    sourcePath: string,
  ): MarkdownRenderChild {
    return this.track(
      new SleepRenderChild(container, this.plugin, params, sourcePath, (error) =>
        this.handleError(container, error),
      ),
    );
  }
}

class SleepRenderChild extends MarkdownRenderChild {
  private chartId = `workout-sleep-chart-${Math.random().toString(36).slice(2, 10)}`;

  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedSleepParams,
    private sourcePath: string,
    private onError: (error: unknown) => void,
  ) {
    super(container);
  }

  onload(): void {
    this.register(this.plugin.eventBus.on("sleep:changed", () => void this.render()));
    void this.render();
  }

  async render(): Promise<void> {
    try {
      this.draw(await this.plugin.getSleepLog().read());
    } catch (error) {
      this.onError(error);
    }
  }

  private draw(entries: SleepEntry[]): void {
    const root = this.containerEl;
    root.empty();
    const today = localDay(new Date());
    const day = noteDay(this.plugin, this.sourcePath, this.params.date);
    const range = this.params.dateRange ?? 30;
    const history = new SleepHistory(entries);
    const log = this.plugin.getSleepLog();
    const hoursUnit = t("sleep.hoursUnit");

    const card = BlockCard.create(root, {
      title: this.params.title ?? t("sleep.title"),
      className: "workout-sleep",
    });

    const latest = history.latest();
    const figures = StatCard.row(card.el);
    StatCard.create(figures, {
      label: t("sleep.latest"),
      value: latest ? `${latest.hours} ${hoursUnit}` : "—",
      detail: latest?.date,
    });
    const average = history.averageHours(range, today);
    StatCard.create(figures, {
      label: t("sleep.average", { days: String(range) }),
      value: average === undefined ? "—" : `${average} ${hoursUnit}`,
    });
    const trend = history.trend(range, today);
    StatCard.create(figures, {
      label: t("sleep.trend"),
      value: trend ? t(`bodyWeight.trendDirection.${trend.direction}`) : "—",
    });

    if (this.params.showChart !== false) {
      const { dates, hours } = history.series(range, today);
      if (hours.length >= 2) {
        const container = ChartRenderer.createChartContainer(card.el);
        container.id = this.chartId;
        ChartRenderer.renderChart(
          container,
          dates,
          [{ label: t("sleep.title"), data: hours }],
          { type: CHART_DATA_TYPE.REPS },
          { showTitle: false },
        );
      }
    }

    // The form: the day it logs for, hours (or bedtime and wake time), quality
    const form = card.el.createDiv({ cls: "workout-sleep-form" });
    const date = form.createEl("input", {
      cls: "workout-sleep-date",
      attr: { type: "date", "aria-label": t("sleep.date"), max: today },
    });
    date.value = day <= today ? day : today;
    const hours = NumberField.create(form, {
      label: t("sleep.hours"),
      unit: hoursUnit,
      step: 0.5,
      min: 0,
      max: 24,
      suggestion: latest ? String(latest.hours) : undefined,
      enterKeyHint: "done",
      onEnter: () => void submit(),
    });
    const times = form.createDiv({ cls: "workout-sleep-times" });
    const bedtime = times.createEl("input", {
      attr: { type: "time", "aria-label": t("sleep.bedtime") },
    });
    const wake = times.createEl("input", {
      attr: { type: "time", "aria-label": t("sleep.wake") },
    });
    let quality: string | undefined;
    ChipGroup.create(form, {
      label: t("sleep.quality"),
      options: QUALITIES.map((q) => ({ id: q, label: q })),
      selected: "",
      onPick: (id: string) => (quality = id),
    });
    const submit = async () => {
      const typed = parseNumber(hours.input.value);
      const fromTimes = hoursBetween(bedtime.value, wake.value);
      const value = Number.isNaN(typed) ? (fromTimes ?? latest?.hours) : typed;
      if (value === undefined || !(value > 0) || value > 24) {
        hours.setError(t("sleep.invalid"));
        return;
      }
      hours.setError();
      try {
        await log.set(date.value || today, {
          hours: value,
          quality: quality ? Number(quality) : undefined,
          bedtime: bedtime.value,
          wake: wake.value,
        });
        new Notice(t("sleep.saved", { hours: String(value) }));
      } catch (error) {
        new Notice(ErrorUtils.getErrorMessage(error));
      }
    };
    const add = Button.create(form, {
      text: t("sleep.add"),
      variant: BUTTONVARIANT.PRIMARY,
    });
    Button.onClick(add, () => void submit());

    const list = card.el.createDiv({ cls: "workout-sleep-list" });
    const shown = history.since(range, today).reverse();
    if (shown.length === 0) {
      list.createDiv({ cls: "workout-sleep-empty", text: t("sleep.empty") });
    }
    for (const entry of shown) {
      const row = list.createDiv({ cls: "workout-sleep-row" });
      row.createSpan({ cls: "workout-sleep-row-date", text: entry.date });
      row.createSpan({ cls: "workout-sleep-row-hours", text: `${entry.hours} ${hoursUnit}` });
      if (entry.quality) {
        row.createSpan({ cls: "workout-sleep-row-quality", text: `${entry.quality}/5` });
      }
      DeleteButton.create(row, {
        label: t("sleep.remove", { date: entry.date }),
        onClick: () => void this.remove(entry),
      });
    }
  }

  /** One tap removes the night; Undo puts it back exactly */
  private async remove(entry: SleepEntry): Promise<void> {
    const log = this.plugin.getSleepLog();
    try {
      await log.delete(entry.date);
      UndoNotice.show({
        message: t("sleep.removed", { date: entry.date }),
        onUndo: () =>
          void log.set(entry.date, {
            hours: entry.hours,
            quality: entry.quality,
            bedtime: entry.bedtime,
            wake: entry.wake,
            note: entry.note,
          }),
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }
}
