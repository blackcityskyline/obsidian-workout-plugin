import { StatCard } from "@app/components/molecules";
import { WidgetContainer } from "@app/features/dashboard/ui/WidgetContainer";
import { ChartRenderer } from "@app/features/charts/components/ChartRenderer";
import { CHART_DATA_TYPE } from "@app/features/charts/types";
import { figuresOf, type Series } from "@app/features/dashboard/widgets/series/seriesData";
import type { SeriesVariant } from "@app/features/dashboard/types";
import { t } from "@app/i18n";

export interface SeriesWidgetProps {
  title: string;
  series: Series;
  variant: SeriesVariant;
  /** Shown after every figure ("kg", "h", "kcal") */
  unit: string;
  /** Unique per widget, so charts of two dashboards never share a container */
  chartId: string;
  className: string;
}

/** The longest list the table variant shows */
const TABLE_ROWS = 14;

/**
 * One measure over time in the variant the user picked: a few figures, a line,
 * bars or a table. Weight, sleep, calories and protein all draw through it.
 */
export class SeriesWidget {
  static render(container: HTMLElement, props: SeriesWidgetProps): void {
    const card = WidgetContainer.create(container, {
      title: props.title,
      className: props.className,
    });
    const { series } = props;
    if (series.values.length === 0) {
      card.createDiv({ cls: "workout-series-empty", text: t("dashboard.series.empty") });
      return;
    }
    switch (props.variant) {
      case "number":
        SeriesWidget.numbers(card, props);
        break;
      case "line":
        SeriesWidget.line(card, props);
        break;
      case "bars":
        SeriesWidget.bars(card, props);
        break;
      case "table":
        SeriesWidget.table(card, props);
        break;
    }
  }

  private static numbers(card: HTMLElement, props: SeriesWidgetProps): void {
    const f = figuresOf(props.series.values);
    if (!f) return;
    const row = StatCard.row(card);
    const fmt = (n: number) => `${n} ${props.unit}`;
    StatCard.create(row, { label: t("dashboard.series.latest"), value: fmt(f.latest) });
    StatCard.create(row, { label: t("dashboard.series.average"), value: fmt(f.average) });
    StatCard.create(row, { label: t("dashboard.series.lowest"), value: fmt(f.min) });
    StatCard.create(row, { label: t("dashboard.series.highest"), value: fmt(f.max) });
  }

  private static line(card: HTMLElement, props: SeriesWidgetProps): void {
    const { dates, values } = props.series;
    if (values.length < 2) {
      SeriesWidget.numbers(card, props);
      return;
    }
    const container = ChartRenderer.createChartContainer(card);
    container.id = props.chartId;
    ChartRenderer.renderChart(
      container,
      dates,
      [{ label: props.title, data: values }],
      { type: CHART_DATA_TYPE.REPS },
      { showTitle: false },
    );
  }

  /** CSS bars (no chart library): the tallest fills the height, one bar per day */
  private static bars(card: HTMLElement, props: SeriesWidgetProps): void {
    const { dates, values } = props.series;
    const max = Math.max(...values, 0);
    const box = card.createDiv({ cls: "workout-series-bars" });
    values.forEach((value, i) => {
      const bar = box.createDiv({
        cls: "workout-series-bar",
        attr: { title: `${dates[i]}: ${value} ${props.unit}` },
      });
      bar.style.setProperty("--workout-series-bar", max > 0 ? String(value / max) : "0");
    });
    const f = figuresOf(values);
    if (f) {
      card.createDiv({
        cls: "workout-series-caption",
        text: t("dashboard.series.caption", {
          average: `${f.average} ${props.unit}`,
          latest: `${f.latest} ${props.unit}`,
        }),
      });
    }
  }

  private static table(card: HTMLElement, props: SeriesWidgetProps): void {
    const { dates, values } = props.series;
    const list = card.createDiv({ cls: "workout-series-table" });
    for (let i = values.length - 1; i >= Math.max(0, values.length - TABLE_ROWS); i--) {
      const row = list.createDiv({ cls: "workout-series-row" });
      row.createSpan({ text: dates[i] });
      row.createSpan({ cls: "workout-series-value", text: `${values[i]} ${props.unit}` });
    }
  }
}
