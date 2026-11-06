import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import { createReferenceFoods, foodPageContent, type ReferenceFoodsPlugin } from "@app/services/food/ReferenceFoods";
import { REFERENCE_FOODS } from "@app/services/food/referenceFoodData";

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

  it("creates every page once and never overwrites", async () => {
    const vault = new FakeVault();
    const first = await createReferenceFoods(pluginWith(vault), "en");
    expect(first).toEqual({ created: REFERENCE_FOODS.length, skipped: 0 });
    const again = await createReferenceFoods(pluginWith(vault), "en");
    expect(again).toEqual({ created: 0, skipped: REFERENCE_FOODS.length });
  });
});
