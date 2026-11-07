import { normalizePath, TFile } from "obsidian";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import { foodFolder } from "@app/services/food/FoodLibrary";
import { REFERENCE_FOODS, type ReferenceFood } from "@app/services/food/referenceFoodData";
import { REFERENCE_MICROS } from "@app/services/food/referenceFoodMicros";
import type { ReferenceLanguage } from "@app/services/reference/ReferenceExercises";
import { pageFileName } from "@app/services/reference/ProgramNotes";

export type ReferenceFoodsPlugin = AppPort & SettingsPort;

/** Adds the SR28 vitamins and minerals a page does not have yet; true when the page changed */
async function addMissingMicros(plugin: ReferenceFoodsPlugin, file: TFile, food: ReferenceFood): Promise<boolean> {
  const micros = REFERENCE_MICROS[food.name.en] ?? {};
  let changed = false;
  await plugin.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
    const have = new Set(Object.keys(frontmatter).map((key) => key.toLowerCase()));
    for (const [key, value] of Object.entries(micros)) {
      if (have.has(key)) continue;
      frontmatter[key] = value;
      changed = true;
    }
  });
  return changed;
}

/** The text of a food page: nutrients and (where USDA SR28 has them) vitamins and minerals per 100 g as properties, the name in both languages as aliases */
export function foodPageContent(food: ReferenceFood, lang: ReferenceLanguage): string {
  const other = lang === "ru" ? food.name.en : food.name.ru;
  return [
    "---",
    `food_name: ${JSON.stringify(food.name[lang])}`,
    `aliases: [${JSON.stringify(other)}]`,
    `category: ${food.category}`,
    `kcal: ${food.kcal}`,
    `protein: ${food.protein}`,
    `fat: ${food.fat}`,
    `carbs: ${food.carbs}`,
    `fiber: ${food.fiber}`,
    ...Object.entries(REFERENCE_MICROS[food.name.en] ?? {}).map(([key, value]) => `${key}: ${value}`),
    "---",
    "",
    `# ${food.name[lang]}`,
    "",
  ].join("\n");
}

/**
 * Writes the reference foods as pages in the food folder, one subfolder per category; never overwrites a page.
 * A page that already exists only gets the vitamins and minerals it lacks (`updated`), no value of the user is touched.
 */
export async function createReferenceFoods(
  plugin: ReferenceFoodsPlugin,
  lang: ReferenceLanguage,
): Promise<{ created: number; skipped: number; updated: number }> {
  const { vault } = plugin.app;
  const root = foodFolder(plugin.settings.exerciseFolderPath);
  const result = { created: 0, skipped: 0, updated: 0 };
  const made = new Set<string>();
  const ensure = async (path: string) => {
    if (made.has(path) || vault.getAbstractFileByPath(path)) return;
    await vault.createFolder(path);
    made.add(path);
  };
  await ensure(root);
  for (const food of REFERENCE_FOODS) {
    const folder = normalizePath(`${root}/${food.category}`);
    const path = normalizePath(`${folder}/${pageFileName(food.name[lang])}.md`);
    const existing = vault.getAbstractFileByPath(path);
    if (existing) {
      result.skipped++;
      if (existing instanceof TFile && (await addMissingMicros(plugin, existing, food))) result.updated++;
      continue;
    }
    await ensure(folder);
    await vault.create(path, foodPageContent(food, lang));
    result.created++;
  }
  return result;
}
