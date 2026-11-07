import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import { createReferenceFoods, foodPageContent, type ReferenceFoodsPlugin } from "@app/services/food/ReferenceFoods";
import { REFERENCE_FOODS } from "@app/services/food/referenceFoodData";
import { REFERENCE_MICROS } from "@app/services/food/referenceFoodMicros";
import { defaultNutrients } from "@app/services/food/NutrientCatalog";

jest.mock("@app/i18n", () => ({ t: (key: string) => key }));

const pluginWith = (vault: FakeVault) =>
  ({ app: vault.app, settings: { exerciseFolderPath: "Workouts/Exercises" } }) as unknown as ReferenceFoodsPlugin;

describe("reference foods", () => {
  it("has plausible macros: kcal within 15% of 4P + 4C + 9F", () => {
    for (const f of REFERENCE_FOODS) {
      const estimate = 4 * f.protein + 4 * f.carbs + 9 * f.fat;
      expect(Math.abs(f.kcal - estimate)).toBeLessThanOrEqual(Math.max(40, f.kcal * 0.15));
    }
  });

  it("writes the nutrients as properties and the other language as alias", () => {
    const content = foodPageContent(REFERENCE_FOODS[0], "ru");
    expect(content).toContain(`food_name: ${JSON.stringify(REFERENCE_FOODS[0].name.ru)}`);
    expect(content).toContain(`aliases: [${JSON.stringify(REFERENCE_FOODS[0].name.en)}]`);
    expect(content).toContain(`kcal: ${REFERENCE_FOODS[0].kcal}`);
  });

  it("writes SR28 vitamins and minerals under the catalog keys, never as zero for a missing value", () => {
    const oats = REFERENCE_FOODS.find((f) => f.name.en === "Oats, dry")!;
    const content = foodPageContent(oats, "en");
    expect(content).toMatch(/\niron: 4\.72\n/);
    expect(content).toMatch(/\nvitamin_b1: 0\.763\n/);
    expect(content).not.toContain("vitamin_e:");
    const keys = new Set(defaultNutrients().map((n) => n.key));
    for (const [food, micros] of Object.entries(REFERENCE_MICROS)) {
      expect(REFERENCE_FOODS.some((f) => f.name.en === food)).toBe(true);
      for (const [key, value] of Object.entries(micros)) {
        expect(keys.has(key)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("creates every page once and never overwrites", async () => {
    const vault = new FakeVault();
    const first = await createReferenceFoods(pluginWith(vault), "en");
    expect(first).toMatchObject({ created: REFERENCE_FOODS.length, skipped: 0, updated: 0 });
    const again = await createReferenceFoods(pluginWith(vault), "en");
    // the fake vault does not parse the written content, so its pages look empty and `updated` is not asserted here
    expect(again).toMatchObject({ created: 0, skipped: REFERENCE_FOODS.length });
  });

  it("adds only the missing vitamins and minerals to a page that exists, keeping the user's values", async () => {
    const path = "Workouts/food.folder/grains/Oats, dry.md";
    const vault = new FakeVault({ [path]: { food_name: "Oats, dry", kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, iron: 9 } });
    const result = await createReferenceFoods(pluginWith(vault), "en");
    expect(result.created).toBe(REFERENCE_FOODS.length - 1);
    expect(result.updated).toBe(1);
    const page = vault.app.metadataCache.getFileCache(vault.app.vault.getAbstractFileByPath(path) as never)!.frontmatter!;
    expect(page.iron).toBe(9);
    expect(page.calcium).toBe(54);
    expect(page.kcal).toBe(389);
  });
});
