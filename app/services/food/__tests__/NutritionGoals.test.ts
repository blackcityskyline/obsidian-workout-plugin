import {
  defaultGoals,
  findGoal,
  goalId,
  resolveTargets,
  weightForDay,
  withDefaultGoals,
  modesFor,
  type NutritionGoal,
} from "@app/services/food/NutritionGoals";
import { t } from "@app/i18n";

const goal = (over: Partial<NutritionGoal> = {}): NutritionGoal => ({
  id: "gain",
  name: "Gain",
  kcal: { mode: "perKg", value: 38 },
  protein: { mode: "perKg", value: 1.5 },
  fat: { mode: "perKg", value: 1 },
  carbs: { mode: "remainder" },
  ...over,
});

describe("resolveTargets", () => {
  it("works grams per kg out from the body weight and gives carbs the rest of the calories", () => {
    // 80 kg: 3040 kcal, protein 120 g (480 kcal), fat 80 g (720 kcal), carbs (3040 - 1200) / 4
    expect(resolveTargets(goal(), 80)).toEqual({ kcal: 3040, protein: 120, fat: 80, carbs: 460, needsWeight: false });
  });

  it("takes fixed amounts and percentages of calories as they are", () => {
    const fixed = goal({
      kcal: { mode: "fixed", value: 2500 },
      protein: { mode: "percentKcal", value: 30 },
      fat: { mode: "percentKcal", value: 25 },
      carbs: { mode: "percentKcal", value: 45 },
    });
    expect(resolveTargets(fixed, undefined)).toEqual({ kcal: 2500, protein: 188, fat: 69, carbs: 281, needsWeight: false });
  });

  it("asks for a weight instead of guessing when a figure is per kg", () => {
    const r = resolveTargets(goal(), undefined);
    expect(r).toMatchObject({ needsWeight: true, kcal: undefined, protein: undefined, fat: undefined, carbs: undefined });
    expect(resolveTargets(goal(), 0).needsWeight).toBe(true);
  });

  it("leaves a figure out when there is nothing to work it from", () => {
    const noKcal = goal({ kcal: { mode: "none" }, protein: { mode: "percentKcal", value: 30 }, carbs: { mode: "remainder" } });
    expect(resolveTargets(noKcal, 80)).toMatchObject({ kcal: undefined, protein: undefined, carbs: undefined, fat: 80 });
    expect(resolveTargets(goal({ protein: { mode: "perKg" } }), 80).protein).toBeUndefined();
    expect(resolveTargets(goal({ protein: { mode: "perKg", value: -2 } }), 80).protein).toBeUndefined();
  });

  it("never lets the remainder go below zero", () => {
    expect(resolveTargets(goal({ kcal: { mode: "fixed", value: 1000 } }), 80).carbs).toBe(0);
  });

  it("a protein of 1 g per kg for maintenance and 1.5 for gain follows the weight", () => {
    const maintain = goal({ protein: { mode: "perKg", value: 1 } });
    expect(resolveTargets(maintain, 70).protein).toBe(70);
    expect(resolveTargets(goal(), 70).protein).toBe(105);
  });
});

describe("weightForDay", () => {
  const entries = [
    { date: "2026-10-01", weight: 80 },
    { date: "2026-10-20", weight: 79 },
  ];
  it("uses the last weigh-in on or before the day, else the first one", () => {
    expect(weightForDay(entries, "2026-10-25", "kg")).toBe(79);
    expect(weightForDay(entries, "2026-10-20", "kg")).toBe(79);
    expect(weightForDay(entries, "2026-09-01", "kg")).toBe(80);
    expect(weightForDay([], "2026-10-25", "kg")).toBeUndefined();
  });
  it("converts pounds to kilograms", () => {
    expect(weightForDay([{ date: "2026-10-01", weight: 176.37 }], "2026-10-02", "lb")).toBeCloseTo(80, 1);
  });
});

describe("goals list", () => {
  it("finds a goal by id or name, ignoring case", () => {
    const goals = [goal(), goal({ id: "cut", name: "Fat loss" })];
    expect(findGoal(goals, "GAIN")?.id).toBe("gain");
    expect(findGoal(goals, "fat loss")?.id).toBe("cut");
    expect(findGoal(goals, "")).toBeUndefined();
    expect(findGoal(goals, "nope")).toBeUndefined();
  });

  it("makes ids from names, Cyrillic included", () => {
    expect(goalId(" Muscle gain! ")).toBe("muscle_gain");
    expect(goalId("Набор массы")).toBe("набор_массы");
  });

  it("adds the starting goals once and keeps the user's own", () => {
    const mine = [goal({ id: "mine", name: "Mine" })];
    const all = withDefaultGoals(mine);
    expect(all[0].id).toBe("mine");
    expect(all.map((g) => g.id)).toEqual(["mine", "maintain", "gain", "cut"]);
    expect(withDefaultGoals(undefined)).toHaveLength(3);
  });

  it("skips a starting goal whose id or name the user already has", () => {
    const named = [goal({ id: "x", name: t("food.goals.defaults.gain") })];
    expect(withDefaultGoals(named).map((g) => g.id)).toEqual(["x", "maintain", "cut"]);
    expect(withDefaultGoals([goal()]).map((g) => g.id)).toEqual(["gain", "maintain", "cut"]);
  });

  it("starts with protein 1 g/kg to maintain, 1.5 to gain and more on a cut", () => {
    const [maintain, gain, cut] = defaultGoals();
    expect([maintain.protein.value, gain.protein.value]).toEqual([1, 1.5]);
    expect(cut.protein.value).toBeGreaterThan(gain.protein.value!);
  });

  it("limits the modes a figure can use", () => {
    expect(modesFor("kcal")).not.toContain("percentKcal");
    expect(modesFor("protein")).not.toContain("remainder");
    expect(modesFor("carbs")).toContain("remainder");
  });
});
