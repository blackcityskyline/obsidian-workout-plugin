import { foodTargets } from "@app/features/food/business/foodTargets";
import type { NutritionGoal } from "@app/services/food/NutritionGoals";

const gain: NutritionGoal = {
  id: "gain",
  name: "Muscle gain",
  kcal: { mode: "perKg", value: 38 },
  protein: { mode: "perKg", value: 1.5 },
  fat: { mode: "perKg", value: 1 },
  carbs: { mode: "remainder" },
};
const cut: NutritionGoal = { ...gain, id: "cut", name: "Fat loss", protein: { mode: "perKg", value: 2 } };
const base = {
  goals: [gain, cut],
  activeGoal: "",
  weights: [{ date: "2026-11-01", weight: 80 }],
  day: "2026-11-07",
  unit: "kg" as const,
};

describe("foodTargets", () => {
  it("has no targets without a goal or a figure in the block", () => {
    expect(foodTargets({ ...base, params: {} })).toEqual({
      targets: {}, goal: undefined, weightKg: 80, needsWeight: false,
    });
  });

  it("works the active goal out from the weight", () => {
    const r = foodTargets({ ...base, params: {}, activeGoal: "gain" });
    expect(r.goal?.id).toBe("gain");
    expect(r.targets).toEqual({ kcal: 3040, protein: 120, fat: 80, carbs: 460 });
  });

  it("lets the block name its goal over the settings'", () => {
    const r = foodTargets({ ...base, params: { goal: "fat loss" }, activeGoal: "gain" });
    expect(r.goal?.id).toBe("cut");
    expect(r.targets.protein).toBe(160);
  });

  it("lets a figure written in the block win over the goal's, the rest stay from the goal", () => {
    const r = foodTargets({ ...base, params: { protein: 150 }, activeGoal: "gain" });
    expect(r.targets).toMatchObject({ protein: 150, kcal: 3040 });
    expect(foodTargets({ ...base, params: { protein: 150 } }).targets).toEqual({ protein: 150 });
  });

  it("follows the weight of that day", () => {
    const r = foodTargets({
      ...base,
      params: {},
      activeGoal: "gain",
      weights: [{ date: "2026-10-01", weight: 80 }, { date: "2026-11-05", weight: 82 }],
    });
    expect(r.targets.protein).toBe(123);
    expect(r.weightKg).toBe(82);
  });

  it("says so when the goal needs a weight and there is none", () => {
    const r = foodTargets({ ...base, params: {}, activeGoal: "gain", weights: [] });
    expect(r.needsWeight).toBe(true);
    expect(r.targets).toEqual({});
  });

  it("ignores an unknown goal", () => {
    expect(foodTargets({ ...base, params: { goal: "nope" }, activeGoal: "nope" }).goal).toBeUndefined();
  });
});
