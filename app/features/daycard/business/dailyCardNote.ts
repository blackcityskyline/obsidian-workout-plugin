import { normalizePath, TFile } from "obsidian";
import { t } from "@app/i18n";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import { dayCardBlock } from "@app/features/daycard/dayCardBlock";
import { generateCodeBlockId } from "@app/utils/IdUtils";

export type DailyCardPlugin = AppPort & SettingsPort;

/** The folder of the daily notes: "Days" next to the exercise folder */
export function dailyFolder(exerciseFolderPath: string): string {
  const parts = normalizePath(exerciseFolderPath).split("/");
  parts.pop();
  return normalizePath([...parts, t("dayCard.folder")].join("/"));
}

/** The text of a new daily note: its date as a property, the card, a place for notes */
export function dailyNoteContent(day: string): string {
  return [
    "---",
    `date: ${day}`,
    "---",
    "",
    `# ${day}`,
    "",
    dayCardBlock.serialize({ id: generateCodeBlockId() }),
    "",
    `## ${t("dayCard.notes")}`,
    "",
    "",
  ].join("\n");
}

/**
 * The daily note of a day, created when missing (never overwritten): returns
 * the file and whether it was just created.
 */
export async function ensureDailyNote(
  plugin: DailyCardPlugin,
  day: string,
): Promise<{ file: TFile; created: boolean }> {
  const { vault } = plugin.app;
  const folder = dailyFolder(plugin.settings.exerciseFolderPath);
  const path = normalizePath(`${folder}/${day}.md`);
  const existing = vault.getAbstractFileByPath(path);
  if (existing instanceof TFile) return { file: existing, created: false };
  if (!vault.getAbstractFileByPath(folder)) await vault.createFolder(folder);
  return { file: await vault.create(path, dailyNoteContent(day)), created: true };
}
