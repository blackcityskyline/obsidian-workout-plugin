import { normalizePath } from "obsidian";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import { foodFolder } from "@app/services/food/FoodLibrary";
import { REFERENCE_FOODS, type ReferenceFood } from "@app/services/food/referenceFoodData";
import type { ReferenceLanguage } from "@app/services/reference/ReferenceExercises";
import { pageFileName } from "@app/services/reference/ProgramNotes";

export type ReferenceFoodsPlugin = AppPort & SettingsPort;

/** The text of a food page: nutrients per 100 g as properties, the name in both languages as aliases */
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
    "---",
    "",
    `# ${food.name[lang]}`,
    "",
  ].join("\n");
}

/** Writes the reference foods as pages in the food folder, one subfolder per category; never overwrites */
export async function createReferenceFoods(
  plugin: ReferenceFoodsPlugin,
  lang: ReferenceLanguage,
): Promise<{ created: number; skipped: number }> {
  const { vault } = plugin.app;
  const root = foodFolder(plugin.settings.exerciseFolderPath);
  const result = { created: 0, skipped: 0 };
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
    if (vault.getAbstractFileByPath(path)) {
      result.skipped++;
      continue;
    }
    await ensure(folder);
    await vault.create(path, foodPageContent(food, lang));
    result.created++;
  }
  return result;
}
