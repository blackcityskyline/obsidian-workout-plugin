import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import {
  createProgramNotes,
  pageFileName,
  programFolder,
  programNoteContent,
  programNoteName,
  type ProgramPluginPort,
} from "@app/services/reference/ProgramNotes";
import { REFERENCE_PROGRAM } from "@app/services/reference/referenceProgram.generated";
import { REFERENCE_PAGES } from "@app/services/reference/referencePages.generated";
import { readWorkoutNote } from "@app/services/notes/WorkoutNote";
import { setsBlock } from "@app/features/tables/setsBlock";

// t() echoes key and params, so every day gets its own note name
jest.mock("@app/i18n", () => ({
  t: (key: string, params?: Record<string, unknown>) =>
    params
      ? `${key}(${Object.entries(params)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(",")})`
      : key,
}));

const pluginWith = (vault: FakeVault) =>
  ({
    app: vault.app,
    settings: { exerciseFolderPath: "Workouts/Exercises" },
  }) as unknown as ProgramPluginPort;

const day = (key: string) => REFERENCE_PROGRAM.find((d) => d.key === key)!;

describe("program notes", () => {
  it("puts the notes in a Program folder next to the exercise folder", () => {
    expect(programFolder("Workouts/Exercises")).toBe(
      "Workouts/reference.program.folder",
    );
  });

  it.each(["en", "ru"] as const)(
    "names only exercises that have a reference page (%s)",
    (lang) => {
      const names = new Set(
        REFERENCE_PAGES.filter((p) => p.lang === lang).map((p) => p.name),
      );
      for (const d of REFERENCE_PROGRAM)
        for (const b of d.blocks)
          for (const i of b.items) expect(names).toContain(pageFileName(i.name[lang]));
    },
  );

  it("writes a strength day as a session plus one workout-sets block per exercise", () => {
    const content = programNoteContent(day("A"), "en");
    const blocks = readWorkoutNote(content).blocks;
    expect(blocks[0].type).toBe("workout-session");
    const sets = blocks.filter((b) => b.type === "workout-sets");
    const expected = day("A").blocks.flatMap((b) => b.items).length;
    expect(sets).toHaveLength(expected);
    const first = setsBlock.parse(sets[0].body).params;
    expect(first.exercise).toBe(day("A").blocks[0].items[0].name.en);
    expect(first.workout).toBe(programNoteName(day("A")));
    expect(first.sets).toBe(3);
  });

  it("writes a cardio day with an interval timer and a log", () => {
    const content = programNoteContent(day("H1"), "en");
    const types = readWorkoutNote(content).blocks.map((b) => b.type);
    expect(types).toEqual([
      "workout-timer",
      "workout-timer",
      "workout-log",
    ]);
  });

  it("creates every day once and never overwrites a note", async () => {
    const vault = new FakeVault();
    const folder = programFolder("Workouts/Exercises");
    const mine = `${folder}/${programNoteName(day("B"))}.md`;
    await vault.app.vault.create(mine, "my own plan");
    const result = await createProgramNotes(pluginWith(vault), "ru");
    expect(result).toEqual({
      created: REFERENCE_PROGRAM.length - 1,
      skipped: 1,
      folder,
    });
    expect(
      await vault.app.vault.read(vault.app.vault.getFileByPath(mine)!),
    ).toBe("my own plan");
  });
});
