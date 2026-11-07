import {
  defaultNutrients,
  nutrientKey,
  nutrientRows,
  nutrientTarget,
  withDefaultNutrients,
  type NutrientDef,
} from "@app/services/food/NutrientCatalog";

const def = (over: Partial<NutrientDef> = {}): NutrientDef => ({
  key: "vitamin_c",
  name: "Vitamin C",
  unit: "mg",
  group: "vitamin",
  target: { mode: "fixed", value: 90 },
  ...over,
});

describe("nutrientTarget", () => {
  it("is the fixed amount, or per kg of body weight", () => {
    expect(nutrientTarget(def(), undefined)).toBe(90);
    const leucine = def({ key: "leucine", target: { mode: "perKg", value: 39 } });
    expect(nutrientTarget(leucine, 80)).toBe(3120);
    expect(nutrientTarget(leucine, undefined)).toBeUndefined();
  });

  it("is nothing without a mode, a value or a positive value", () => {
    expect(nutrientTarget(def({ target: { mode: "none" } }), 80)).toBeUndefined();
    expect(nutrientTarget(def({ target: { mode: "fixed" } }), 80)).toBeUndefined();
    expect(nutrientTarget(def({ target: { mode: "fixed", value: -1 } }), 80)).toBeUndefined();
  });
});

describe("nutrientRows", () => {
  const pages: Record<string, Record<string, number>> = {
    orange: { vitamin_c: 53 },
    kiwi: { vitamin_c: 93, vitamin_k: 40 },
    bread: {},
  };
  const extraOf = (food: string) => pages[food.toLowerCase()];
  const catalog = [def(), def({ key: "vitamin_k", name: "Vitamin K", unit: "µg", target: { mode: "fixed", value: 120 } }), def({ key: "iron", name: "Iron" })];

  it("adds grams times per-100 g values and says how many foods had data", () => {
    const rows = nutrientRows(
      [{ food: "Orange", grams: 200 }, { food: "Kiwi", grams: 100 }, { food: "Bread", grams: 50 }],
      extraOf,
      catalog,
      undefined,
    );
    expect(rows.map((r) => [r.def.key, r.total, r.covered, r.foods, r.target])).toEqual([
      ["vitamin_c", 199, 2, 3, 90],
      ["vitamin_k", 40, 1, 3, 120],
    ]);
  });

  it("leaves out a nutrient no food has data for and handles foods without a page", () => {
    expect(nutrientRows([{ food: "Bread", grams: 50 }, { food: "Unknown", grams: 10 }], extraOf, catalog, 80)).toEqual([]);
    expect(nutrientRows([], extraOf, catalog, 80)).toEqual([]);
  });

  it("counts the same food eaten twice once and sums its grams", () => {
    const [row] = nutrientRows([{ food: "Orange", grams: 100 }, { food: "orange", grams: 100 }], extraOf, catalog, undefined);
    expect(row).toMatchObject({ total: 106, covered: 1, foods: 1 });
  });
});

describe("catalog list", () => {
  it("starts with vitamins, minerals and the essential amino acids per kg", () => {
    const all = defaultNutrients();
    expect(all.filter((n) => n.group === "aminoAcid")).toHaveLength(9);
    expect(all.find((n) => n.key === "leucine")?.target).toEqual({ mode: "perKg", value: 39 });
    expect(all.find((n) => n.key === "vitamin_c")?.target).toEqual({ mode: "fixed", value: 90 });
    expect(new Set(all.map((n) => n.key)).size).toBe(all.length);
  });

  it("keeps the user's nutrients and adds only the starting ones they lack", () => {
    const mine = [def({ key: "leucine", name: "My leucine", target: { mode: "none" } })];
    const all = withDefaultNutrients(mine);
    expect(all[0].name).toBe("My leucine");
    expect(all.filter((n) => n.key === "leucine")).toHaveLength(1);
    expect(all.length).toBe(defaultNutrients().length);
    expect(withDefaultNutrients(undefined)).toHaveLength(defaultNutrients().length);
  });

  it("makes a page property from a name", () => {
    expect(nutrientKey(" Vitamin C ")).toBe("vitamin_c");
    expect(nutrientKey("Омега-3!")).toBe("омега3");
  });
});
