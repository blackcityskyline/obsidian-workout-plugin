import { t } from "@app/i18n";
import { convertWeight, type WeightUnit } from "@app/utils/WeightUnitUtils";

/** How one figure of a goal is worked out */
export type TargetMode =
  /** No target for this figure */
  | "none"
  /** `value` per kg of body weight (g/kg; kcal/kg for calories) */
  | "perKg"
  /** `value` as it is (g, or kcal for calories) */
  | "fixed"
  /** `value` % of the goal's calories */
  | "percentKcal"
  /** What is left of the calories after protein and fat (carbs only) */
  | "remainder";

export interface TargetSpec {
  mode: TargetMode;
  value?: number;
}

export const FIGURE_KEYS = ["kcal", "protein", "fat", "carbs"] as const;
export type FigureKey = (typeof FIGURE_KEYS)[number];

/** A named scenario ("Muscle gain"): every figure is a formula the user can change */
export interface NutritionGoal {
  id: string;
  name: string;
  kcal: TargetSpec;
  protein: TargetSpec;
  fat: TargetSpec;
  carbs: TargetSpec;
}

/** Which modes a figure can use: calories cannot be a share of themselves, only carbs can be the remainder */
export function modesFor(figure: FigureKey): TargetMode[] {
  if (figure === "kcal") return ["none", "perKg", "fixed"];
  if (figure === "carbs") return ["none", "perKg", "fixed", "percentKcal", "remainder"];
  return ["none", "perKg", "fixed", "percentKcal"];
}

export interface ResolvedTargets {
  kcal?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  /** A per-kg figure could not be worked out: there is no body weight yet */
  needsWeight: boolean;
}

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

function positive(spec: TargetSpec): number | undefined {
  return typeof spec.value === "number" && Number.isFinite(spec.value) && spec.value > 0
    ? spec.value
    : undefined;
}

/**
 * The day's targets of a goal for a body weight in kg. Pure: calories first,
 * then protein and fat, then carbs (so "remainder" sees them). A figure that
 * cannot be worked out (no weight, no calories to take a share of) is left out.
 */
export function resolveTargets(goal: NutritionGoal, weightKg: number | undefined): ResolvedTargets {
  let needsWeight = false;
  const perKg = (spec: TargetSpec): number | undefined => {
    const value = positive(spec);
    if (value === undefined) return undefined;
    if (weightKg === undefined || !(weightKg > 0)) {
      needsWeight = true;
      return undefined;
    }
    return value * weightKg;
  };

  const kcal = ((): number | undefined => {
    const spec = goal.kcal;
    if (spec.mode === "perKg") return perKg(spec);
    if (spec.mode === "fixed") return positive(spec);
    return undefined;
  })();

  const grams = (figure: "protein" | "fat" | "carbs"): number | undefined => {
    const spec = goal[figure];
    if (spec.mode === "perKg") return perKg(spec);
    if (spec.mode === "fixed") return positive(spec);
    if (spec.mode === "percentKcal") {
      const share = positive(spec);
      return share !== undefined && kcal !== undefined
        ? (kcal * share) / 100 / KCAL_PER_G[figure]
        : undefined;
    }
    return undefined;
  };

  const protein = grams("protein");
  const fat = grams("fat");
  const carbs =
    goal.carbs.mode === "remainder"
      ? kcal === undefined
        ? undefined
        : Math.max(0, (kcal - (protein ?? 0) * KCAL_PER_G.protein - (fat ?? 0) * KCAL_PER_G.fat) / KCAL_PER_G.carbs)
      : grams("carbs");

  const whole = (n: number | undefined) => (n === undefined ? undefined : Math.round(n));
  return {
    kcal: whole(kcal),
    protein: whole(protein),
    fat: whole(fat),
    carbs: whole(carbs),
    needsWeight,
  };
}

/** Finds a goal by id or name (case ignored) */
export function findGoal(goals: readonly NutritionGoal[], idOrName: string | undefined): NutritionGoal | undefined {
  const key = idOrName?.trim().toLowerCase();
  if (!key) return undefined;
  return goals.find((g) => g.id.toLowerCase() === key || g.name.trim().toLowerCase() === key);
}

/**
 * The body weight (kg) a day's targets are worked out from: the last weigh-in
 * on or before the day, else the first one after it. Entries are oldest first
 * in `unit`.
 */
export function weightForDay(
  entries: readonly { date: string; weight: number }[],
  day: string,
  unit: WeightUnit,
): number | undefined {
  const upTo = entries.filter((e) => e.date <= day);
  const pick = upTo[upTo.length - 1] ?? entries[0];
  return pick ? convertWeight(pick.weight, unit, "kg") : undefined;
}

/** An id from a name: lower case letters, digits and underscores */
export function goalId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\p{L}\p{N}_]/gu, "");
}

/**
 * Starting scenarios, ordinary entries of the settings list the user edits or
 * deletes. The numbers are common sports-nutrition starting points (protein
 * about 1 g/kg to keep muscle, 1.5 to build it, 2 on a cut), not rules.
 */
export function defaultGoals(): NutritionGoal[] {
  const perKg = (value: number): TargetSpec => ({ mode: "perKg", value });
  const remainder: TargetSpec = { mode: "remainder" };
  return [
    { id: "maintain", name: t("food.goals.defaults.maintain"), kcal: perKg(33), protein: perKg(1), fat: perKg(1), carbs: remainder },
    { id: "gain", name: t("food.goals.defaults.gain"), kcal: perKg(38), protein: perKg(1.5), fat: perKg(1), carbs: remainder },
    { id: "cut", name: t("food.goals.defaults.cut"), kcal: perKg(27), protein: perKg(2), fat: perKg(0.8), carbs: remainder },
  ];
}

/**
 * The user's goals followed by the starting scenarios they do not have yet
 * (by id or name). Run once per vault (`nutritionGoalDefaultsAdded`), so a
 * scenario the user deletes stays deleted.
 */
export function withDefaultGoals(mine: NutritionGoal[] | null | undefined): NutritionGoal[] {
  const have = mine ?? [];
  const ids = new Set(have.map((g) => g.id));
  const names = new Set(have.map((g) => g.name.trim().toLowerCase()));
  return [
    ...have,
    ...defaultGoals().filter((g) => !ids.has(g.id) && !names.has(g.name.trim().toLowerCase())),
  ];
}
