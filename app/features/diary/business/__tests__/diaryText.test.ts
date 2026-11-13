import { readDiary, withDiary, diaryHeading } from "@app/features/diary/business/diaryText";

describe("diaryText", () => {
  it("adds the section once and rewrites it", () => {
    const a = withDiary("# d\n", "felt strong");
    expect(a).toContain(diaryHeading());
    expect(readDiary(a)).toBe("felt strong");
    const b = withDiary(a, "tired");
    expect(readDiary(b)).toBe("tired");
    expect(b.split(diaryHeading()).length).toBe(2);
  });
  it("leaves the other sections alone", () => {
    const note = `# d\n\n${diaryHeading()}\n\nold\n\n## Notes\n\nkeep\n`;
    const out = withDiary(note, "new");
    expect(out).toContain("## Notes\n\nkeep");
    expect(readDiary(out)).toBe("new");
  });
  it("does not create an empty section", () => {
    expect(withDiary("# d\n", "  ")).toBe("# d\n");
  });
});
