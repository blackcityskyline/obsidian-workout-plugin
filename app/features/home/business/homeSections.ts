import { dashboardBlock } from "@app/features/dashboard/dashboardBlock";
import { dayCardBlock } from "@app/features/daycard/dayCardBlock";
import { exercisesBlock } from "@app/features/exercises/exercisesBlock";
import { foodBlock } from "@app/features/food/foodBlock";
import { bodyWeightBlock } from "@app/features/bodyweight/bodyWeightBlock";
import { tableBlock } from "@app/features/tables/tableBlock";

/** The pages of the home view, in navigation order */
export const HOME_SECTION_IDS = [
  "home",
  "diary",
  "notes",
  "exercises",
  "history",
  "food",
  "weight",
  "data",
] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export interface HomeSection {
  id: HomeSectionId;
  /** Lucide icon of the navigation entry */
  icon: string;
  /** en.json key of its name */
  label: string;
}

export const HOME_SECTIONS: readonly HomeSection[] = [
  { id: "home", icon: "layout-dashboard", label: "home.sections.home" },
  { id: "diary", icon: "calendar-days", label: "home.sections.diary" },
  { id: "notes", icon: "files", label: "home.sections.notes" },
  { id: "exercises", icon: "dumbbell", label: "home.sections.exercises" },
  { id: "history", icon: "history", label: "home.sections.history" },
  { id: "food", icon: "utensils", label: "home.sections.food" },
  { id: "weight", icon: "scale", label: "home.sections.weight" },
  { id: "data", icon: "bar-chart-3", label: "home.sections.data" },
];

/** A section's code blocks drawn by the plugin's own processors; "" = the section draws no blocks */
export function sectionMarkdown(id: HomeSectionId): string {
  switch (id) {
    case "home":
      // The dashboard above it is drawn by the view itself (its layout is editable on the page)
      return dayCardBlock.serialize({});
    case "diary":
      return dayCardBlock.serialize({});
    case "exercises":
      return exercisesBlock.serialize({});
    case "history":
      return tableBlock.serialize({ limit: 100, sortBy: "date", sortOrder: "desc", showAddButton: false });
    case "food":
      return foodBlock.serialize({});
    case "weight":
      return bodyWeightBlock.serialize({});
    case "data":
      return dashboardBlock.serialize({ widgets: ["quickStats", "volume", "heatMap", "protocolDistribution", "duration"] });
    case "notes":
      return "";
  }
}

/** The files the notes page lists: the newest edited first, at most `limit` */
export function recentNotes<T extends { stat: { mtime: number } }>(files: readonly T[], limit = 30): T[] {
  return [...files].sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, limit);
}

/** The id to open: an unknown or missing one gives the home page */
export function sectionOrHome(id: unknown): HomeSectionId {
  return HOME_SECTION_IDS.find((s) => s === id) ?? "home";
}
