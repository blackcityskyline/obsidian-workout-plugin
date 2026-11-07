import { t } from "@app/i18n";
import type { TargetSpec } from "@app/services/food/NutritionGoals";

export type NutrientGroup = "vitamin" | "mineral" | "aminoAcid" | "other";
export const NUTRIENT_GROUPS: readonly NutrientGroup[] = ["vitamin", "mineral", "aminoAcid", "other"];
export type NutrientUnit = "g" | "mg" | "µg";
export const NUTRIENT_UNITS: readonly NutrientUnit[] = ["g", "mg", "µg"];

/**
 * One nutrient the user tracks beyond calories and macros. `key` is the
 * property name on a food page (per 100 g, in `unit`): `vitamin_c: 4.6`.
 * `target` is the daily amount: fixed, or per kg of body weight (amino acids).
 */
export interface NutrientDef {
  key: string;
  name: string;
  unit: NutrientUnit;
  group: NutrientGroup;
  target: TargetSpec;
}

/** Property names of a food page that are not nutrients of the catalog */
export const FOOD_PAGE_KEYS: ReadonlySet<string> = new Set([
  "kcal", "protein", "fat", "carbs", "fiber", "food_name", "aliases", "category", "tags",
]);

/** A key written as a page property: lower case letters, digits and underscores */
export function nutrientKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, "");
}

/**
 * Starting catalog: vitamins and minerals with common adult reference intakes
 * (fixed per day) and the essential amino acids with the WHO 2007 requirement
 * (mg per kg of body weight). Ordinary entries of the settings list: change the
 * numbers, rename, delete, add your own.
 */
export function defaultNutrients(): NutrientDef[] {
  const fixed = (value: number): TargetSpec => ({ mode: "fixed", value });
  const perKg = (value: number): TargetSpec => ({ mode: "perKg", value });
  const def = (key: string, unit: NutrientUnit, group: NutrientGroup, target: TargetSpec): NutrientDef => ({
    key,
    name: t(`food.nutrients.defaults.${key}`),
    unit,
    group,
    target,
  });
  return [
    def("vitamin_a", "µg", "vitamin", fixed(900)),
    def("vitamin_c", "mg", "vitamin", fixed(90)),
    def("vitamin_d", "µg", "vitamin", fixed(15)),
    def("vitamin_e", "mg", "vitamin", fixed(15)),
    def("vitamin_k", "µg", "vitamin", fixed(120)),
    def("vitamin_b1", "mg", "vitamin", fixed(1.2)),
    def("vitamin_b2", "mg", "vitamin", fixed(1.3)),
    def("vitamin_b3", "mg", "vitamin", fixed(16)),
    def("vitamin_b6", "mg", "vitamin", fixed(1.3)),
    def("vitamin_b9", "µg", "vitamin", fixed(400)),
    def("vitamin_b12", "µg", "vitamin", fixed(2.4)),
    def("calcium", "mg", "mineral", fixed(1000)),
    def("iron", "mg", "mineral", fixed(8)),
    def("magnesium", "mg", "mineral", fixed(400)),
    def("potassium", "mg", "mineral", fixed(3400)),
    def("zinc", "mg", "mineral", fixed(11)),
    def("sodium", "mg", "mineral", { mode: "none" }),
    def("histidine", "mg", "aminoAcid", perKg(10)),
    def("isoleucine", "mg", "aminoAcid", perKg(20)),
    def("leucine", "mg", "aminoAcid", perKg(39)),
    def("lysine", "mg", "aminoAcid", perKg(30)),
    def("methionine", "mg", "aminoAcid", perKg(10.4)),
    def("phenylalanine", "mg", "aminoAcid", perKg(25)),
    def("threonine", "mg", "aminoAcid", perKg(15)),
    def("tryptophan", "mg", "aminoAcid", perKg(4)),
    def("valine", "mg", "aminoAcid", perKg(26)),
  ];
}

/** The user's nutrients plus the starting ones they lack (by key); run once per vault */
export function withDefaultNutrients(mine: NutrientDef[] | null | undefined): NutrientDef[] {
  const have = mine ?? [];
  const keys = new Set(have.map((n) => n.key));
  return [...have, ...defaultNutrients().filter((n) => !keys.has(n.key))];
}

/** The day's amount of a nutrient: fixed, or per kg of body weight; undefined when there is no target (or no weight) */
export function nutrientTarget(def: NutrientDef, weightKg: number | undefined): number | undefined {
  const { mode, value } = def.target;
  if (!(typeof value === "number" && value > 0)) return undefined;
  if (mode === "fixed") return value;
  if (mode === "perKg") return weightKg !== undefined && weightKg > 0 ? value * weightKg : undefined;
  return undefined;
}

export interface NutrientRow {
  def: NutrientDef;
  /** What was eaten, in the nutrient's unit (to 0.1) */
  total: number;
  target?: number;
  /** Foods eaten that have a value for it, of all foods eaten */
  covered: number;
  foods: number;
}

/**
 * The day's nutrients from what was eaten: each entry's grams times the food
 * page's per-100 g value, as the page says now (the log keeps macros only).
 * A nutrient no food has data for is left out; `covered` of `foods` tells how
 * complete a total is. Pure.
 */
export function nutrientRows(
  entries: readonly { food: string; grams: number }[],
  extraOf: (food: string) => Record<string, number> | undefined,
  catalog: readonly NutrientDef[],
  weightKg: number | undefined,
): NutrientRow[] {
  const foods = new Set(entries.map((e) => e.food.toLowerCase())).size;
  const rows: NutrientRow[] = [];
  for (const def of catalog) {
    let total = 0;
    const seen = new Set<string>();
    for (const e of entries) {
      const per100 = extraOf(e.food)?.[def.key];
      if (per100 === undefined) continue;
      total += (per100 * e.grams) / 100;
      seen.add(e.food.toLowerCase());
    }
    if (seen.size === 0) continue;
    rows.push({
      def,
      total: Math.round(total * 10) / 10,
      target: nutrientTarget(def, weightKg),
      covered: seen.size,
      foods,
    });
  }
  return rows;
}
