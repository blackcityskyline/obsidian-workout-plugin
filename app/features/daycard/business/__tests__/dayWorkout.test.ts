import { t } from "@app/i18n";
import { dayWorkoutName, withDayWorkout, withExerciseLink } from "@app/features/daycard/business/dayWorkout";

describe("dayWorkout", () => {
  it("names an unnamed set after its day", () => {
    const e = withDayWorkout({ date: "2026-11-13T10:00:00", workout: "" });
    expect(e.workout).toBe(dayWorkoutName("2026-11-13"));
  });
  it("keeps a named workout", () => {
    expect(withDayWorkout({ date: "2026-11-13", workout: "Push" }).workout).toBe("Push");
  });
  it("links an exercise once under its heading", () => {
    const note = `# d\n\n## ${t("dayCard.exercises")}\n\n- [[A]]\n\n## Notes\n\n`;
    const once = withExerciseLink(note, "B");
    expect(once).toContain("- [[A]]\n- [[B]]");
    expect(withExerciseLink(once, "B")).toBe(once);
  });
  it("adds the heading when missing", () => {
    expect(withExerciseLink("# d\n", "A")).toContain("## ");
  });
});
