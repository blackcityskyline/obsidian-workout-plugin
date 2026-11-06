import { TFile, TFolder } from "obsidian";
import { dailyFolder } from "@app/features/daycard/business/dailyCardNote";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";

/** Days (YYYY-MM-DD) that carry more than training: a weigh-in, a daily note */
export interface CalendarMarks {
  weighed: ReadonlySet<string>;
  noted: ReadonlySet<string>;
}

export const NO_MARKS: CalendarMarks = {
  weighed: new Set(),
  noted: new Set(),
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The days daily notes are named after (`YYYY-MM-DD.md`) among a folder's file names */
export function noteDays(basenames: readonly string[]): Set<string> {
  return new Set(basenames.filter((name) => DAY.test(name)));
}

/** Weigh-in days from `BodyWeightLog` and daily-note days from the Days folder */
export async function calendarMarks(
  plugin: WorkoutPluginContext,
): Promise<CalendarMarks> {
  const weights = await plugin.getBodyWeightLog().read();
  const folder = plugin.app.vault.getAbstractFileByPath(
    dailyFolder(plugin.settings.exerciseFolderPath),
  );
  const basenames =
    folder instanceof TFolder
      ? folder.children
          .filter((child): child is TFile => child instanceof TFile && child.extension === "md")
          .map((file) => file.basename)
      : [];
  return {
    weighed: new Set(weights.map((entry) => entry.date)),
    noted: noteDays(basenames),
  };
}
