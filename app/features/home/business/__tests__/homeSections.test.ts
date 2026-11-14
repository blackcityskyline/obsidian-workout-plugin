import {
  HOME_SECTIONS,
  HOME_SECTION_IDS,
  recentNotes,
  sectionMarkdown,
  sectionOrHome,
} from "@app/features/home/business/homeSections";

describe("homeSections", () => {
  it("has one navigation entry per section, in order", () => {
    expect(HOME_SECTIONS.map((s) => s.id)).toEqual([...HOME_SECTION_IDS]);
  });

  it("writes each block section as the plugin's own code block", () => {
    expect(sectionMarkdown("home")).toContain("```workout-day");
    expect(sectionMarkdown("exercises")).toContain("```workout-exercises");
    expect(sectionMarkdown("history")).toContain("```workout-log");
    expect(sectionMarkdown("food")).toContain("```workout-food");
    expect(sectionMarkdown("weight")).toContain("```workout-bodyweight");
  });

  it("leaves the home dashboard to the view, so its layout is editable", () => {
    expect(sectionMarkdown("home")).not.toContain("workout-dashboard");
  });

  it("draws no blocks on the notes page", () => {
    expect(sectionMarkdown("notes")).toBe("");
  });

  it("falls back to the home page for an unknown id", () => {
    expect(sectionOrHome("food")).toBe("food");
    expect(sectionOrHome("nope")).toBe("home");
    expect(sectionOrHome(undefined)).toBe("home");
  });

  it("lists the newest notes first and no more than the limit", () => {
    const files = [1, 5, 3, 9].map((mtime) => ({ stat: { mtime } }));
    expect(recentNotes(files, 3).map((f) => f.stat.mtime)).toEqual([9, 5, 3]);
  });
});
