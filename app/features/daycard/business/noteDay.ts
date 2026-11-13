import { TFile } from "obsidian";
import type { AppPort } from "@app/types/PluginPorts";
import { resolveDay } from "@app/features/daycard/business/dayReport";
import { localDay } from "@app/services/history/TrainingHistory";

/** The day a block's note is about (block `date`, note `date` property, date-named note, else today) */
export function noteDay(plugin: AppPort, sourcePath: string, param?: string): string {
  const { app } = plugin;
  const file = app.vault.getAbstractFileByPath(sourcePath);
  const frontmatter =
    file instanceof TFile ? app.metadataCache.getFileCache(file)?.frontmatter : undefined;
  return resolveDay({
    param,
    property: frontmatter?.date,
    basename: file instanceof TFile ? file.basename : "",
    today: localDay(new Date()),
  });
}
