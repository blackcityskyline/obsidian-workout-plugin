import {
  FIGURE_KEYS,
  findGoal,
  resolveTargets,
  weightForDay,
  type FigureKey,
  type NutritionGoal,
} from "@app/services/food/NutritionGoals";
import type { WeightUnit } from "@app/utils/WeightUnitUtils";

export interface FoodTargets {
  /** The figures that have a target; a figure without one is absent */
  targets: Partial<Record<FigureKey, number>>;
  /** The goal the targets come from (a figure the block names itself overrides it) */
  goal?: NutritionGoal;
  /** The body weight (kg) the goal was worked out from */
  weightKg?: number;
  /** The goal has per-kg figures but there is no weigh-in yet */
  needsWeight: boolean;
}

/**
 * The targets a `workout-food` block shows for a day. A figure written in the
 * block (`protein: 150`) is that number; the others come from the goal (the
 * block's `goal`, else the one picked in the settings) worked out from the
 * body weight of that day. Pure.
 */
export function foodTargets(input: {
  /** The block's own figures and its `goal` */
  params: Partial<Record<FigureKey, number>> & { goal?: string };
  goals: readonly NutritionGoal[];
  /** Settings' active goal id */
  activeGoal: string;
  weights: readonly { date: string; weight: number }[];
  day: string;
  unit: WeightUnit;
}): FoodTargets {
  const goal = findGoal(input.goals, input.params.goal) ?? findGoal(input.goals, input.activeGoal);
  const weightKg = weightForDay(input.weights, input.day, input.unit);
  const fromGoal = goal ? resolveTargets(goal, weightKg) : undefined;
  const targets: FoodTargets["targets"] = {};
  for (const key of FIGURE_KEYS) {
    const own = input.params[key];
    const value = own !== undefined && own > 0 ? own : fromGoal?.[key];
    if (value !== undefined) targets[key] = value;
  }
  return { targets, goal, weightKg, needsWeight: fromGoal?.needsWeight ?? false };
}
