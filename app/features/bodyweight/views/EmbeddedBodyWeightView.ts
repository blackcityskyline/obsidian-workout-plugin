import { MarkdownRenderChild, Notice } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { StatCard } from "@app/components/molecules/StatCard";
import { NumberField, parseNumber } from "@app/components/molecules/NumberField";
import { UndoNotice } from "@app/components/molecules/UndoNotice";
import { Button, BUTTONVARIANT } from "@app/components/atoms/Button";
import { DeleteButton } from "@app/components/atoms/DeleteButton";
import { BodyWeightHistory } from "@app/services/body/BodyWeightHistory";
import { localDay } from "@app/services/history/TrainingHistory";
import type { BodyWeightEntry } from "@app/services/body/BodyWeightFile";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedBodyWeightParams } from "@app/features/bodyweight/bodyWeightBlock";
import { ChartRenderer } from "@app/features/charts/components/ChartRenderer";
import { CHART_DATA_TYPE } from "@app/features/charts/types";
import { ErrorUtils } from "@app/utils/ErrorUtils";
import { t } from "@app/i18n";

const DEFAULT_RANGE = 90;
const FIGURES_DAYS = 30;

/** The `workout-bodyweight` block: weigh-in form, figures and the list of entries */
export class EmbeddedBodyWeightView extends BaseView {
  createBodyWeight(
    container: HTMLElement,
    params: EmbeddedBodyWeightParams,
  ): MarkdownRenderChild {
    return this.track(
      new BodyWeightRenderChild(container, this.plugin, params, (error) =>
        this.handleError(container, error),
      ),
    );
  }
}

class BodyWeightRenderChild extends MarkdownRenderChild {
  /** One id per block, so a redraw replaces its chart instead of leaking it */
  private chartId = `workout-bodyweight-chart-${Math.random().toString(36).slice(2, 10)}`;

  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedBodyWeightParams,
    private onError: (error: unknown) => void,
  ) {
    super(container);
  }

  onload(): void {
    // The first draw happens here too, so a block fills in when a weigh-in
    // is logged from another block or the log changes unit
    this.register(this.plugin.eventBus.on("bodyweight:changed", () => void this.render()));
    this.register(this.plugin.eventBus.on("settings:changed", () => void this.render()));
    void this.render();
  }

  async render(): Promise<void> {
    try {
      const entries = await this.plugin.getBodyWeightLog().read();
      this.draw(entries);
    } catch (error) {
      this.onError(error);
    }
  }

  private draw(entries: BodyWeightEntry[]): void {
    const root = this.containerEl;
    root.empty();
    const unit = this.plugin.settings.weightUnit;
    const today = localDay(new Date());
    const range = this.params.dateRange ?? DEFAULT_RANGE;
    const history = new BodyWeightHistory(entries);
    const log = this.plugin.getBodyWeightLog();

    const card = BlockCard.create(root, {
      title: this.params.title ?? t("bodyWeight.title"),
      className: "workout-bodyweight",
    });

    const latest = history.latest();
    const figures = StatCard.row(card.el);
    StatCard.create(figures, {
      label: t("bodyWeight.latest"),
      value: latest ? `${latest.weight} ${unit}` : "—",
      detail: latest?.date,
    });
    const change = history.change(FIGURES_DAYS, today);
    StatCard.create(figures, {
      label: t("bodyWeight.change", { days: String(FIGURES_DAYS) }),
      value: change === undefined ? "—" : `${change > 0 ? "+" : ""}${change} ${unit}`,
      className: change === undefined || change === 0 ? "is-neutral" : change < 0 ? "is-up" : "",
    });
    const trend = history.trend(range, today);
    StatCard.create(figures, {
      label: t("bodyWeight.trend"),
      value: trend ? t(`bodyWeight.trendDirection.${trend.direction}`) : "—",
    });

    if (this.params.showChart !== false) this.drawChart(card.el, history, range, today);

    // The form: date and weight, suggestion = the latest weigh-in
    const form = card.el.createDiv({ cls: "workout-bodyweight-form" });
    const date = form.createEl("input", {
      cls: "workout-bodyweight-date",
      attr: { type: "date", "aria-label": t("bodyWeight.date"), max: today },
    });
    date.value = today;
    const submit = async () => {
      const typed = parseNumber(weight.input.value);
      const value = Number.isNaN(typed) ? latest?.weight : typed;
      if (value === undefined || !(value > 0)) {
        weight.setError(t("bodyWeight.invalid"));
        return;
      }
      weight.setError();
      try {
        await log.set(date.value || today, value);
        new Notice(t("bodyWeight.saved", { weight: String(value), unit }));
      } catch (error) {
        new Notice(ErrorUtils.getErrorMessage(error));
      }
    };
    const weight = NumberField.create(form, {
      label: t("bodyWeight.weight"),
      unit,
      step: 0.1,
      min: 20,
      suggestion: latest ? String(latest.weight) : undefined,
      enterKeyHint: "done",
      onEnter: () => void submit(),
    });
    const add = Button.create(form, {
      text: t("bodyWeight.add"),
      variant: BUTTONVARIANT.PRIMARY,
    });
    Button.onClick(add, () => void submit());

    // Entries of the period, newest first
    const list = card.el.createDiv({ cls: "workout-bodyweight-list" });
    const shown = history.since(range, today).reverse();
    if (shown.length === 0) {
      list.createDiv({ cls: "workout-bodyweight-empty", text: t("bodyWeight.empty") });
    }
    for (const entry of shown) {
      const row = list.createDiv({ cls: "workout-bodyweight-row" });
      row.createSpan({ cls: "workout-bodyweight-row-date", text: entry.date });
      row.createSpan({ cls: "workout-bodyweight-row-weight", text: `${entry.weight} ${unit}` });
      if (entry.note) row.createSpan({ cls: "workout-bodyweight-row-note", text: entry.note });
      DeleteButton.create(row, {
        label: t("bodyWeight.remove", { date: entry.date }),
        onClick: () => void this.remove(entry),
      });
    }
  }

  /** The weight over the period (two weigh-ins at least) with its trend line */
  private drawChart(
    parent: HTMLElement,
    history: BodyWeightHistory,
    range: number,
    today: string,
  ): void {
    const { dates, weights } = history.series(range, today);
    if (weights.length < 2) return;
    const container = ChartRenderer.createChartContainer(parent);
    container.id = this.chartId;
    const datasets = [{ label: t("bodyWeight.title"), data: weights }];
    if (this.params.showTrendLine !== false) ChartRenderer.addTrendLineToDatasets(datasets);
    ChartRenderer.renderChart(container, dates, datasets, { type: CHART_DATA_TYPE.WEIGHT }, { showTitle: false });
  }

  /** One tap removes the entry; Undo puts it back exactly */
  private async remove(entry: BodyWeightEntry): Promise<void> {
    const log = this.plugin.getBodyWeightLog();
    try {
      await log.delete(entry.date);
      UndoNotice.show({
        message: t("bodyWeight.removed", { date: entry.date }),
        onUndo: () => void log.set(entry.date, entry.weight, entry.note),
      });
    } catch (error) {
      new Notice(ErrorUtils.getErrorMessage(error));
    }
  }
}
