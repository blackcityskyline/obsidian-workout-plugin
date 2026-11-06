import { normalizePath, TFile, TFolder } from "obsidian";
import type { App } from "obsidian";
import { t } from "@app/i18n";
import type { WorkoutChartsSettings } from "@app/types/WorkoutLogData";

/** What a food holds per 100 g (kcal, grams); `fiber` is optional */
export interface Nutrients {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

/** A food page and its nutrients per 100 g. */
export interface FoodPage {
  file: TFile;
  /** `food_name` (else the file name) */
  name: string;
  /** Other names from `aliases` */
  aliases: string[];
  per100: Nutrients;
}

type FoodApp = {
  vault: Pick<App["vault"], "getAbstractFileByPath">;
  metadataCache: Pick<App["metadataCache"], "getFileCache">;
};

/** The folder of the food pages: "Food" next to the exercise folder */
export function foodFolder(exerciseFolderPath: string): string {
  const parts = normalizePath(exerciseFolderPath).split("/");
  parts.pop();
  return normalizePath([...parts, t("food.folder")].join("/"));
}

const same = (a: string, b: string) => key(a) === key(b);
const key = (name: string) => name.toLowerCase().replace(/\s+/g, " ").trim();

function number(raw: unknown): number | undefined {
  const n = typeof raw === "string" ? Number(raw.replace(",", ".")) : raw;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * The only place that finds a food's page: notes in the food folder (and
 * subfolders), found by `food_name`, file name or an alias, ignoring case and
 * spacing, never partially. A page needs `kcal`, `protein`, `fat` and `carbs`
 * per 100 g to count; frontmatter comes from the metadata cache, so there is
 * nothing to clear.
 */
export class FoodLibrary {
  constructor(
    private readonly app: FoodApp,
    private readonly settings: Pick<WorkoutChartsSettings, "exerciseFolderPath">,
  ) {}

  pages(): FoodPage[] {
    const root = this.app.vault.getAbstractFileByPath(
      foodFolder(this.settings.exerciseFolderPath),
    );
    const pages: FoodPage[] = [];
    const walk = (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFolder) walk(child);
        else if (child instanceof TFile && child.extension === "md") {
          const page = this.read(child);
          if (page) pages.push(page);
        }
      }
    };
    if (root instanceof TFolder) walk(root);
    return pages.sort((a, b) => a.name.localeCompare(b.name));
  }

  find(name: string): FoodPage | undefined {
    return this.pages().find((page) =>
      [page.name, page.file.basename, ...page.aliases].some((n) => same(n, name)),
    );
  }

  private read(file: TFile): FoodPage | undefined {
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!fm) return undefined;
    const kcal = number(fm.kcal);
    const protein = number(fm.protein);
    const fat = number(fm.fat);
    const carbs = number(fm.carbs);
    if (kcal === undefined || protein === undefined || fat === undefined || carbs === undefined) {
      return undefined;
    }
    const aliases = Array.isArray(fm.aliases)
      ? fm.aliases.filter((a): a is string => typeof a === "string")
      : typeof fm.aliases === "string"
        ? [fm.aliases]
        : [];
    const fiber = number(fm.fiber);
    return {
      file,
      name: typeof fm.food_name === "string" && fm.food_name.trim() ? fm.food_name.trim() : file.basename,
      aliases,
      per100: { kcal, protein, fat, carbs, ...(fiber !== undefined ? { fiber } : {}) },
    };
  }
}

/** The nutrients of `grams` of a food, rounded to 0.1 (kcal to whole) */
export function nutrientsFor(per100: Nutrients, grams: number): Nutrients {
  const scale = grams / 100;
  const round = (n: number) => Math.round(n * scale * 10) / 10;
  return {
    kcal: Math.round(per100.kcal * scale),
    protein: round(per100.protein),
    fat: round(per100.fat),
    carbs: round(per100.carbs),
    ...(per100.fiber !== undefined ? { fiber: round(per100.fiber) } : {}),
  };
}
