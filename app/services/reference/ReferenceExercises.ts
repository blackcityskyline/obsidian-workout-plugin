import { normalizePath } from "obsidian";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import {
  REFERENCE_PAGES,
  type ReferencePage,
} from "@app/services/reference/referencePages.generated";

/** What the reference exercises need from the plugin */
export type ReferencePluginPort = AppPort & SettingsPort;

export type ReferenceLanguage = ReferencePage["lang"];

export interface ReferencePagesResult {
  created: number;
  /** Pages whose file already existed (never overwritten) */
  skipped: number;
}

/** The reference language for an Obsidian UI language code: Russian, else English */
export function referenceLanguage(uiLanguage: string | null): ReferenceLanguage {
  return (uiLanguage ?? "").toLowerCase().startsWith("ru") ? "ru" : "en";
}

/**
 * "Create reference exercise pages": writes the curated, ranked exercise base
 * (technique, muscles, tier, warnings) as exercise pages into the exercise
 * folder, one subfolder per category. Adds only the pages that are missing and
 * never touches an existing file, so running it again is safe.
 */
export async function createReferenceExercisePages(
  plugin: ReferencePluginPort,
  lang: ReferenceLanguage,
): Promise<ReferencePagesResult> {
  const { vault } = plugin.app;
  const root = normalizePath(plugin.settings.exerciseFolderPath);
  const result: ReferencePagesResult = { created: 0, skipped: 0 };
  const made = new Set<string>();

  const ensureFolder = async (path: string): Promise<void> => {
    if (made.has(path) || vault.getAbstractFileByPath(path)) return;
    await vault.createFolder(path);
    made.add(path);
  };

  await ensureFolder(root);
  for (const page of REFERENCE_PAGES) {
    if (page.lang !== lang) continue;
    const folder = normalizePath(`${root}/${page.category}`);
    const path = normalizePath(`${folder}/${page.name}.md`);
    if (vault.getAbstractFileByPath(path)) {
      result.skipped++;
      continue;
    }
    await ensureFolder(folder);
    await vault.create(path, page.content);
    result.created++;
  }
  return result;
}
