import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import { FoodLibrary, foodFolder, nutrientsFor } from "@app/services/food/FoodLibrary";

jest.mock("@app/i18n", () => ({ t: (key: string) => key }));

const FOLDER = "Workouts/food.folder";
const oats = { food_name: "Oats, dry", aliases: ["Овсянка"], kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6 };

const library = (notes: ConstructorParameters<typeof FakeVault>[0]) => {
  const vault = new FakeVault(notes);
  return new FoodLibrary(vault.app as never, { exerciseFolderPath: "Workouts/Exercises" });
};

describe("foodFolder", () => {
  it("is next to the exercise folder", () => {
    expect(foodFolder("Workouts/Exercises")).toBe(FOLDER);
  });
});

describe("FoodLibrary", () => {
  it("finds a food by name, file name or alias, ignoring case and spacing", () => {
    const lib = library({ [`${FOLDER}/grains/Oats.md`]: oats });
    expect(lib.find("oats,  DRY")?.per100.kcal).toBe(389);
    expect(lib.find("oats")?.name).toBe("Oats, dry");
    expect(lib.find("овсянка")?.per100.fiber).toBe(10.6);
    expect(lib.find("Oat")).toBeUndefined();
  });

  it("ignores pages without the four macros and notes elsewhere", () => {
    const lib = library({
      [`${FOLDER}/Broken.md`]: { kcal: 100 },
      "Elsewhere/Egg.md": { kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7 },
      [`${FOLDER}/Egg.md`]: { kcal: "143", protein: "12,6", fat: 9.5, carbs: 0.7 },
    });
    expect(lib.pages().map((p) => p.name)).toEqual(["Egg"]);
    expect(lib.find("egg")?.per100.protein).toBe(12.6);
  });
});

describe("nutrientsFor", () => {
  it("scales per 100 g to the amount eaten", () => {
    expect(nutrientsFor({ kcal: 389, protein: 16.9, fat: 6.9, carbs: 66.3, fiber: 10.6 }, 60)).toEqual({
      kcal: 233,
      protein: 10.1,
      fat: 4.1,
      carbs: 39.8,
      fiber: 6.4,
    });
    expect(nutrientsFor({ kcal: 100, protein: 1, fat: 1, carbs: 1 }, 50)).not.toHaveProperty("fiber");
  });
});
