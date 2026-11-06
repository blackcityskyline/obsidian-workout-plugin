import { FakeVault } from "@app/services/exercise/__tests__/FakeVault";
import {
  dailyFolder,
  dailyNoteContent,
  ensureDailyNote,
  type DailyCardPlugin,
} from "@app/features/daycard/business/dailyCardNote";
import { readWorkoutNote } from "@app/services/notes/WorkoutNote";

jest.mock("@app/i18n", () => ({ t: (key: string) => key }));

const pluginWith = (vault: FakeVault) =>
  ({ app: vault.app, settings: { exerciseFolderPath: "Workouts/Exercises" } }) as unknown as DailyCardPlugin;

describe("daily note", () => {
  it("sits in a Days folder next to the exercise folder", () => {
    expect(dailyFolder("Workouts/Exercises")).toBe("Workouts/dayCard.folder");
  });

  it("has the date as a property and one day card block", () => {
    const content = dailyNoteContent("2026-11-06");
    expect(content).toContain("---\ndate: 2026-11-06\n---");
    const blocks = readWorkoutNote(content).blocks;
    expect(blocks.map((b) => b.type)).toEqual(["workout-day"]);
  });

  it("creates the note once and never overwrites it", async () => {
    const vault = new FakeVault();
    const first = await ensureDailyNote(pluginWith(vault), "2026-11-06");
    expect(first.created).toBe(true);
    expect(first.file.path).toBe("Workouts/dayCard.folder/2026-11-06.md");
    await vault.app.vault.process?.(first.file, () => "mine");
    const again = await ensureDailyNote(pluginWith(vault), "2026-11-06");
    expect(again.created).toBe(false);
  });
});
