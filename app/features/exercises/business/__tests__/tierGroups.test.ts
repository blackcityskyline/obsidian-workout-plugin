import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";
import { categoriesOf, isWarned, tierGroups } from "@app/features/exercises/business/tierGroups";

const page = (name: string, extra: Partial<ExercisePage> = {}): ExercisePage => ({
  file: {} as ExercisePage["file"],
  names: [name],
  tags: [],
  parameters: [],
  neckWarning: false,
  jerkWarning: false,
  spineWarning: false,
  equipment: [],
  ...extra,
});

const pages = [
  page("Dips", { tier: 4, category: "chest", tags: ["chest"], spineWarning: true }),
  page("Dumbbell bench press", { tier: 5, category: "chest", tags: ["chest"] }),
  page("Incline press", { tier: 5, category: "chest", tags: ["chest", "upper_chest"] }),
  page("Pullover", { tier: 3, category: "chest", tags: ["chest"] }),
  page("Row", { tier: 4, category: "back", tags: ["lats"], neckWarning: true }),
  page("Plank"),
];

describe("tierGroups", () => {
  it("puts the best tier first and unranked last, names in order", () => {
    const groups = tierGroups(pages);
    expect(groups.map((g) => g.tier)).toEqual([5, 4, 3, 0]);
    expect(groups[0].pages.map((p) => p.names[0])).toEqual(["Dumbbell bench press", "Incline press"]);
    expect(groups[3].pages.map((p) => p.names[0])).toEqual(["Plank"]);
  });

  it("filters by category and muscle, ignoring case", () => {
    expect(tierGroups(pages, { category: "CHEST" }).flatMap((g) => g.pages).length).toBe(4);
    const upper = tierGroups(pages, { muscle: "Upper_Chest" });
    expect(upper).toHaveLength(1);
    expect(upper[0].pages[0].names[0]).toBe("Incline press");
  });

  it("hides what is ranked below minTier, unranked included", () => {
    expect(tierGroups(pages, { minTier: 4 }).map((g) => g.tier)).toEqual([5, 4]);
  });

  it("can hide the warned exercises", () => {
    expect(isWarned(pages[0])).toBe(true);
    expect(isWarned(pages[1])).toBe(false);
    const names = tierGroups(pages, { hideWarned: true }).flatMap((g) => g.pages.map((p) => p.names[0]));
    expect(names).not.toContain("Dips");
    expect(names).not.toContain("Row");
    expect(names).toContain("Plank");
  });

  it("is empty when nothing matches", () => {
    expect(tierGroups(pages, { category: "legs" })).toEqual([]);
    expect(tierGroups([])).toEqual([]);
  });
});

describe("categoriesOf", () => {
  it("lists the declared categories once, sorted", () => {
    expect(categoriesOf(pages)).toEqual(["back", "chest"]);
  });
});
