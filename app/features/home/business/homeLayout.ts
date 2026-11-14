import type { HomeLayout } from "@app/types/WorkoutLogData";
import type { EmbeddedDashboardParams } from "@app/features/dashboard/types";
import { DASHBOARD_WIDGET_IDS } from "@app/features/dashboard/types";
import { gridKey } from "@app/features/dashboard/layout/dashboardGrid";

/** The widgets of the home dashboard until the user edits it */
export const HOME_START_WIDGETS = [
  "summary",
  "trainingCalendar",
  "recentWorkouts",
  "volume",
] as const;

/** The dashboard block the home page draws: the saved grid, else the starting widgets */
export function homeParams(layout: HomeLayout | null): EmbeddedDashboardParams {
  if (!layout) return { widgets: [...HOME_START_WIDGETS] };
  const params: EmbeddedDashboardParams = { layout: "grid", columns: layout.columns };
  for (const id of DASHBOARD_WIDGET_IDS) {
    const cell = layout.cells[id];
    if (cell) params[gridKey(id)] = { ...cell };
  }
  return params;
}

/** The layout to save from the grid parameters the editor produced */
export function layoutFromParams(params: Partial<EmbeddedDashboardParams>): HomeLayout {
  const cells: HomeLayout["cells"] = {};
  for (const id of DASHBOARD_WIDGET_IDS) {
    const cell = params[gridKey(id)];
    if (cell) cells[id] = { ...cell };
  }
  return { columns: params.columns ?? 1, cells };
}
