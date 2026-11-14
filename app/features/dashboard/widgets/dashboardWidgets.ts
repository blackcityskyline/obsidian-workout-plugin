import { calendarMarks } from "@app/features/dashboard/widgets/training-calendar/business/calendarMarks";
import { WorkoutLogData } from "@app/types/WorkoutLogData";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import {
  DASHBOARD_WIDGET_IDS,
  DashboardWidgetId,
  EmbeddedDashboardParams,
  ProtocolFilterCallback,
  SERIES_VARIANTS,
} from "@app/features/dashboard/types";
import { dashboardBlock } from "@app/features/dashboard/dashboardBlock";
import { SummaryWidget } from "@app/features/dashboard/widgets/summary/SummaryWidget";
import { QuickStatsCards } from "@app/features/dashboard/widgets/quick-stats/QuickStatsCards";
import { MuscleHeatMap } from "@app/features/dashboard/widgets/muscle-heat-map/MuscleHeatMap";
import { VolumeAnalytics } from "@app/features/dashboard/widgets/volume-analytics/VolumeAnalytics";
import { RecentWorkouts } from "@app/features/dashboard/widgets/recent-workouts/RecentWorkouts";
import { ProtocolDistribution } from "@app/features/dashboard/widgets/protocol-distribution/ProtocolDistribution";
import { ProtocolEffectiveness } from "@app/features/dashboard/widgets/protocol-effectiveness/ProtocolEffectiveness";
import { DurationComparison } from "@app/features/dashboard/widgets/duration-comparison/DurationComparison";
import { QuickActions } from "@app/features/dashboard/widgets/quick-actions/QuickActions";
import { WidgetsFileError } from "@app/features/dashboard/widgets/file-errors/WidgetsFileError";
import { MuscleTagsWidget } from "@app/features/dashboard/widgets/muscle-tags/MuscleTagsWidget";
import { TrainingCalendarWidget } from "@app/features/dashboard/widgets/training-calendar/TrainingCalendarWidget";
import { SeriesWidget } from "@app/features/dashboard/widgets/series/SeriesWidget";
import {
  foodSeries,
  seriesOf,
  sleepSeries,
  type Series,
} from "@app/features/dashboard/widgets/series/seriesData";
import { localDay } from "@app/services/history/TrainingHistory";
import { CONSTANTS } from "@app/constants";
import { t } from "@app/i18n";

/** What a widget can draw from */
export interface DashboardWidgetContext {
  grid: HTMLElement;
  /** Sets in the period, narrowed to the protocol chosen in the pie chart */
  data: WorkoutLogData[];
  /** Sets in the period, whatever the chosen protocol */
  periodData: WorkoutLogData[];
  params: EmbeddedDashboardParams;
  plugin: WorkoutPluginContext;
  /** Unique per rendered dashboard, so two dashboards keep separate charts */
  dashboardId: string;
  /** The protocol chosen in the distribution widget, if any */
  activeProtocolFilter: string | null;
  onProtocolFilterChange: ProtocolFilterCallback;
  /** Every logged set */
  history(): Promise<WorkoutLogData[]>;
}

/** A choice offered by an enum or list setting */
export interface WidgetSettingOption {
  value: string;
  label(): string;
}

/**
 * A block parameter that only one widget reads, edited from its own menu.
 * A number shows its schema default when unset; a choice needs its own
 * `default` (what the widget does when the parameter is absent) and a
 * multi setting starts as "every option".
 */
export type WidgetSetting =
  | {
      kind: "number";
      key:
        | "recentWorkoutsLimit"
        | "volumeTrendDays"
        | "volumeTopLimit"
        | "calendarWeeks"
        | "protocolDays"
        | "protocolMinEntries"
        | "durationRecentCount"
        | "durationRestSeconds"
        | "weightDays"
        | "sleepDays"
        | "caloriesDays"
        | "proteinDays"
        | "fileErrorsMaxItems"
        | "fileErrorsMaxTags";
      label(): string;
      /**
       * What the form accepts. `min` is the schema's; `max` only keeps the
       * form sensible, so a block already holding more still reads
       */
      min: number;
      max: number;
      /** What − and + add or take away */
      step: number;
      /** Shown at the end of the field ("days") */
      unit?(): string;
    }
  | {
      kind: "choice";
      key:
        | "heatMapTimeFrame"
        | "heatMapMetric"
        | "heatMapView"
        | "weightVariant"
        | "sleepVariant"
        | "caloriesVariant"
        | "proteinVariant"
        | "protocolChartType"
        | "protocolSortBy";
      label(): string;
      options: WidgetSettingOption[];
      default: string;
    }
  | {
      kind: "multi";
      key:
        | "quickStatsPeriods"
        | "quickStatsMetrics"
        | "summaryMetrics"
        | "quickActionsShown";
      label(): string;
      options: WidgetSettingOption[];
    }
  | {
      kind: "toggle";
      key:
        | "volumeShowBreakdown"
        | "calendarShowStats"
        | "heatMapShowImbalance"
        | "durationShowTrend"
        | "fileErrorsCheckSharedNames"
        | "muscleTagsGroupByMuscle";
      label(): string;
      default: boolean;
    };

/** The settings every measure widget has: how it is drawn and the days it covers */
function seriesSettings(
  variantKey: "weightVariant" | "sleepVariant" | "caloriesVariant" | "proteinVariant",
  daysKey: "weightDays" | "sleepDays" | "caloriesDays" | "proteinDays",
): WidgetSetting[] {
  return [
    {
      kind: "choice",
      key: variantKey,
      label: () => t("dashboard.widgetModal.seriesVariant"),
      default: "line",
      options: SERIES_VARIANTS.map((value) => ({
        value,
        label: () => t(`dashboard.series.variants.${value}`),
      })),
    },
    {
      kind: "number",
      key: daysKey,
      label: () => t("dashboard.widgetModal.seriesDays"),
      min: 2,
      max: 365,
      step: 7,
      unit: () => t("dashboard.widgetModal.units.days"),
    },
  ];
}

/** A measure widget: loads its series and draws it in the chosen variant */
function seriesWidget(
  id: "bodyWeight" | "sleep" | "calories" | "protein",
  title: () => string,
  unit: (ctx: DashboardWidgetContext) => string,
  variantKey: "weightVariant" | "sleepVariant" | "caloriesVariant" | "proteinVariant",
  daysKey: "weightDays" | "sleepDays" | "caloriesDays" | "proteinDays",
  load: (ctx: DashboardWidgetContext, days: number, today: string) => Promise<Series>,
): DashboardWidget {
  return {
    label: title,
    settings: seriesSettings(variantKey, daysKey),
    minColumns: 1,
    render: async (ctx) => {
      const days = ctx.params[daysKey] ?? dashboardBlock.defaults[daysKey];
      SeriesWidget.render(ctx.grid, {
        title: title(),
        series: await load(ctx, days, localDay(new Date())),
        variant: ctx.params[variantKey] ?? "line",
        unit: unit(ctx),
        chartId: `workout-series-${id}-${ctx.dashboardId}`,
        className: `workout-series-widget workout-series-${id}`,
      });
    },
  };
}

interface DashboardWidget {
  /** Shown in the dashboard modal */
  label(): string;
  /** The block parameters this widget reads; most have none */
  settings?: WidgetSetting[];
  /** Grid layout: the fewest columns its content reads well in */
  minColumns: number;
  render(ctx: DashboardWidgetContext): void | Promise<void>;
}

/** Every widget a `workout-dashboard` block can show, by id */
export const DASHBOARD_WIDGETS: Record<
  DashboardWidgetId,
  DashboardWidget
> = {
  summary: {
    label: () => t("dashboard.summary.title"),
    settings: [
      {
        kind: "multi",
        key: "summaryMetrics",
        label: () => t("dashboard.widgetModal.summaryMetrics"),
        options: [
          {
            value: "workouts",
            label: () => t("dashboard.summary.totalWorkouts"),
          },
          {
            value: "streak",
            label: () => t("dashboard.summary.currentStreak"),
          },
          {
            value: "volume",
            label: () => t("dashboard.summary.totalVolume"),
          },
          {
            value: "records",
            label: () => t("dashboard.summary.personalRecords"),
          },
        ],
      },
    ],
    minColumns: 1,
    // Records are judged against all history, not just this period
    render: async (ctx) =>
      SummaryWidget.render(
        ctx.grid,
        ctx.data,
        ctx.params,
        await ctx.history(),
        ctx.plugin.settings.weeklyGoal,
      ),
  },
  trainingCalendar: {
    label: () => t("dashboard.trainingCalendar.title"),
    settings: [
      {
        kind: "number",
        key: "calendarWeeks",
        label: () => t("dashboard.widgetModal.calendarWeeks"),
        min: 1,
        max: 53,
        step: 4,
        unit: () => t("dashboard.widgetModal.units.weeks"),
      },
      {
        kind: "toggle",
        key: "calendarShowStats",
        label: () => t("dashboard.widgetModal.calendarShowStats"),
        default: true,
      },
    ],
    minColumns: 2,
    // A year of training, whatever the dashboard's period
    render: async (ctx) =>
      TrainingCalendarWidget.render(
        ctx.grid,
        await ctx.history(),
        ctx.plugin.settings.weeklyGoal,
        undefined,
        {
          weeks: ctx.params.calendarWeeks,
          showStats: ctx.params.calendarShowStats,
          marks: await calendarMarks(ctx.plugin),
        },
      ),
  },
  quickStats: {
    label: () => t("dashboard.quickStats.title"),
    settings: [
      {
        kind: "multi",
        key: "quickStatsPeriods",
        label: () => t("dashboard.widgetModal.quickStatsPeriods"),
        options: [
          { value: "week", label: () => t("dashboard.quickStats.week") },
          { value: "month", label: () => t("dashboard.quickStats.month") },
          { value: "year", label: () => t("dashboard.quickStats.year") },
        ],
      },
      {
        kind: "multi",
        key: "quickStatsMetrics",
        label: () => t("dashboard.widgetModal.quickStatsMetrics"),
        options: [
          {
            value: "workouts",
            label: () => t("dashboard.quickStats.workouts"),
          },
          {
            value: "volume",
            label: () => CONSTANTS.WORKOUT.LABELS.GENERAL.TOTAL_VOLUME,
          },
          {
            value: "avgVolume",
            label: () => CONSTANTS.WORKOUT.LABELS.GENERAL.AVG_VOLUME,
          },
        ],
      },
    ],
    minColumns: 1,
    render: (ctx) =>
      QuickStatsCards.render(ctx.grid, ctx.data, ctx.params),
  },
  heatMap: {
    label: () => t("general.muscleHeatMap"),
    settings: [
      {
        kind: "choice",
        key: "heatMapTimeFrame",
        label: () => t("dashboard.widgetModal.heatMapTimeFrame"),
        options: [
          { value: "week", label: () => t("timeperiods.week") },
          { value: "month", label: () => t("timeperiods.month") },
          { value: "year", label: () => t("timeperiods.year") },
        ],
        default: "week",
      },
      {
        kind: "choice",
        key: "heatMapView",
        label: () => t("dashboard.widgetModal.heatMapView"),
        options: [
          { value: "front", label: () => t("general.front") },
          { value: "back", label: () => t("general.back") },
        ],
        default: "front",
      },
      {
        kind: "choice",
        key: "heatMapMetric",
        label: () => t("dashboard.widgetModal.heatMapMetric"),
        options: ["volume", "sets", "reps"].map((metric) => ({
          value: metric,
          label: () => t(`dashboard.muscleHeatMap.metrics.${metric}`),
        })),
        default: "volume",
      },
      {
        kind: "toggle",
        key: "heatMapShowImbalance",
        label: () => t("dashboard.widgetModal.heatMapShowImbalance"),
        default: true,
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      MuscleHeatMap.render(
        ctx.grid,
        ctx.data,
        ctx.params,
        ctx.plugin,
      ),
  },
  volume: {
    label: () => t("dashboard.volumeAnalytics.title"),
    settings: [
      {
        kind: "number",
        key: "volumeTrendDays",
        label: () => t("dashboard.widgetModal.volumeTrendDays"),
        min: 1,
        max: 365,
        step: 7,
        unit: () => t("dashboard.widgetModal.units.days"),
      },
      {
        kind: "toggle",
        key: "volumeShowBreakdown",
        label: () => t("dashboard.widgetModal.volumeShowBreakdown"),
        default: true,
      },
      {
        kind: "number",
        key: "volumeTopLimit",
        label: () => t("dashboard.widgetModal.volumeTopLimit"),
        min: 1,
        max: 20,
        step: 1,
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      VolumeAnalytics.render(ctx.grid, ctx.data, ctx.params, {
        chartId: `volume-analytics-${ctx.dashboardId}`,
      }),
  },
  recentWorkouts: {
    label: () => t("dashboard.recentWorkouts.title"),
    settings: [
      {
        kind: "number",
        key: "recentWorkoutsLimit",
        label: () => t("dashboard.widgetModal.recentWorkoutsLimit"),
        min: 1,
        max: 50,
        step: 1,
      },
    ],
    minColumns: 1,
    render: (ctx) =>
      RecentWorkouts.render(ctx.grid, ctx.data, ctx.params),
  },
  protocolDistribution: {
    label: () => t("dashboard.protocolDistribution.title"),
    settings: [
      {
        kind: "number",
        key: "protocolDays",
        label: () => t("dashboard.widgetModal.protocolDays"),
        min: 1,
        max: 365,
        step: 7,
        unit: () => t("dashboard.widgetModal.units.days"),
      },
      {
        kind: "choice",
        key: "protocolChartType",
        label: () => t("dashboard.widgetModal.protocolChartType"),
        options: [
          { value: "pie", label: () => t("dashboard.widgetModal.chartPie") },
          {
            value: "doughnut",
            label: () => t("dashboard.widgetModal.chartDoughnut"),
          },
        ],
        default: "pie",
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      ProtocolDistribution.render(
        ctx.grid,
        ctx.periodData,
        ctx.plugin,
        {
          chartId: `protocol-distribution-${ctx.dashboardId}`,
          onFilterChange: ctx.onProtocolFilterChange,
          activeFilter: ctx.activeProtocolFilter,
          days: ctx.params.protocolDays,
          chartType: ctx.params.protocolChartType,
        },
      ),
  },
  protocolEffectiveness: {
    label: () => t("dashboard.protocolEffectiveness.title"),
    settings: [
      {
        kind: "number",
        key: "protocolMinEntries",
        label: () => t("dashboard.widgetModal.protocolMinEntries"),
        min: 1,
        max: 100,
        step: 1,
      },
      {
        kind: "choice",
        key: "protocolSortBy",
        label: () => t("dashboard.widgetModal.protocolSortBy"),
        options: [
          {
            value: "progressionRate",
            label: () => t("dashboard.protocolEffectiveness.columnProgression"),
          },
          {
            value: "avgVolumeChange",
            label: () => t("dashboard.protocolEffectiveness.columnVolumeChange"),
          },
          {
            value: "entryCount",
            label: () => t("dashboard.widgetModal.sortMostSets"),
          },
        ],
        default: "progressionRate",
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      ProtocolEffectiveness.render(
        ctx.grid,
        ctx.periodData,
        ctx.params,
        ctx.plugin,
      ),
  },
  duration: {
    label: () => t("dashboard.durationComparison.title"),
    settings: [
      {
        kind: "number",
        key: "durationRecentCount",
        label: () => t("dashboard.widgetModal.durationRecentCount"),
        min: 1,
        max: 50,
        step: 1,
      },
      {
        kind: "number",
        key: "durationRestSeconds",
        label: () => t("dashboard.widgetModal.durationRestSeconds"),
        min: 0,
        max: 600,
        step: 15,
        unit: () => t("dashboard.widgetModal.units.seconds"),
      },
      {
        kind: "toggle",
        key: "durationShowTrend",
        label: () => t("dashboard.widgetModal.durationShowTrend"),
        default: true,
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      DurationComparison.render(
        ctx.grid,
        ctx.periodData,
        ctx.params,
        {
          setDuration: ctx.plugin.settings.setDuration,
        },
      ),
  },
  quickActions: {
    label: () => t("dashboard.quickActions.title"),
    settings: [
      {
        kind: "multi",
        key: "quickActionsShown",
        label: () => t("dashboard.widgetModal.quickActionsShown"),
        options: [
          {
            value: "addLog",
            label: () => t("dashboard.quickActions.addWorkoutLog"),
          },
          {
            value: "viewExercises",
            label: () => t("dashboard.quickActions.viewExercises"),
          },
        ],
      },
    ],
    minColumns: 1,
    render: (ctx) =>
      QuickActions.render(ctx.grid, ctx.params, ctx.plugin),
  },
  fileErrors: {
    label: () => t("dashboard.fileErrors.title"),
    settings: [
      {
        kind: "toggle",
        key: "fileErrorsCheckSharedNames",
        label: () => t("dashboard.widgetModal.fileErrorsCheckSharedNames"),
        default: true,
      },
      {
        kind: "number",
        key: "fileErrorsMaxItems",
        label: () => t("dashboard.widgetModal.fileErrorsMaxItems"),
        min: 1,
        max: 100,
        step: 1,
      },
      {
        kind: "number",
        key: "fileErrorsMaxTags",
        label: () => t("dashboard.widgetModal.fileErrorsMaxTags"),
        min: 1,
        max: 20,
        step: 1,
      },
    ],
    minColumns: 1,
    render: (ctx) =>
      WidgetsFileError.render(ctx.grid, ctx.plugin, ctx.params),
  },
  bodyWeight: seriesWidget(
    "bodyWeight",
    () => t("dashboard.series.bodyWeight"),
    (ctx) => ctx.plugin.settings.weightUnit,
    "weightVariant",
    "weightDays",
    async (ctx, days, today) => {
      const entries = await ctx.plugin.getBodyWeightLog().read();
      return seriesOf(entries, (e) => e.weight, days, today);
    },
  ),
  sleep: seriesWidget(
    "sleep",
    () => t("dashboard.series.sleep"),
    () => t("sleep.hoursUnit"),
    "sleepVariant",
    "sleepDays",
    async (ctx, days, today) =>
      sleepSeries(await ctx.plugin.getSleepLog().read(), days, today),
  ),
  calories: seriesWidget(
    "calories",
    () => t("dashboard.series.calories"),
    () => t("dashboard.series.kcalUnit"),
    "caloriesVariant",
    "caloriesDays",
    async (ctx, days, today) =>
      foodSeries(await ctx.plugin.getFoodLog().read(), "kcal", days, today),
  ),
  protein: seriesWidget(
    "protein",
    () => t("dashboard.series.protein"),
    () => t("dashboard.series.gramUnit"),
    "proteinVariant",
    "proteinDays",
    async (ctx, days, today) =>
      foodSeries(await ctx.plugin.getFoodLog().read(), "protein", days, today),
  ),
  muscleTags: {
    label: () => t("dashboard.muscleTags.title"),
    settings: [
      {
        kind: "toggle",
        key: "muscleTagsGroupByMuscle",
        label: () => t("dashboard.widgetModal.muscleTagsGroupByMuscle"),
        default: false,
      },
    ],
    minColumns: 2,
    render: (ctx) =>
      MuscleTagsWidget.render(ctx.grid, ctx.params, ctx.plugin),
  },
};

/**
 * The widgets a block shows, in order: its `widgets` list (each once) or,
 * without one, every widget.
 */
export function resolveWidgets(
  params: EmbeddedDashboardParams,
): DashboardWidgetId[] {
  return params.widgets
    ? [...new Set(params.widgets)]
    : [...DASHBOARD_WIDGET_IDS];
}
