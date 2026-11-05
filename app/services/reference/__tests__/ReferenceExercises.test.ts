import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import {
  createReferenceExercisePages,
  referenceLanguage,
  type ReferencePluginPort,
} from "@app/services/reference/ReferenceExercises";
import { REFERENCE_PAGES } from "@app/services/reference/referencePages.generated";

function pluginWith(vault: FakeVault): ReferencePluginPort {
  return {
    app: vault.app,
    settings: { exerciseFolderPath: "Workouts/Exercises" },
  } as unknown as ReferencePluginPort;
}

describe("referenceLanguage", () => {
  it("uses Russian for ru locales and English otherwise", () => {
    expect(referenceLanguage("ru")).toBe("ru");
    expect(referenceLanguage("RU-ru")).toBe("ru");
    expect(referenceLanguage("it")).toBe("en");
    expect(referenceLanguage(null)).toBe("en");
  });
});

describe("createReferenceExercisePages", () => {
  const count = (lang: string) =>
    REFERENCE_PAGES.filter((p) => p.lang === lang).length;

  it("creates every page of the language under the exercise folder", async () => {
    const vault = new FakeVault();
    const result = await createReferenceExercisePages(pluginWith(vault), "en");
    expect(result).toEqual({ created: count("en"), skipped: 0 });
    expect(vault.app.vault.getMarkdownFiles()).toHaveLength(count("en"));
    const first = REFERENCE_PAGES.find((p) => p.lang === "en")!;
    expect(
      vault.app.vault.getAbstractFileByPath(
        `Workouts/Exercises/${first.category}/${first.name}.md`,
      ),
    ).not.toBeNull();
  });

  it("never overwrites an existing page and is safe to repeat", async () => {
    const vault = new FakeVault();
    const first = REFERENCE_PAGES.find((p) => p.lang === "ru")!;
    const path = `Workouts/Exercises/${first.category}/${first.name}.md`;
    await vault.app.vault.create(path, "my own notes");
    const result = await createReferenceExercisePages(pluginWith(vault), "ru");
    expect(result).toEqual({ created: count("ru") - 1, skipped: 1 });
    const file = vault.app.vault.getFileByPath(path)!;
    expect(await vault.app.vault.read(file)).toBe("my own notes");
    const again = await createReferenceExercisePages(pluginWith(vault), "ru");
    expect(again).toEqual({ created: 0, skipped: count("ru") });
  });
});
