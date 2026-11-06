import { noteDays } from "@app/features/dashboard/widgets/training-calendar/business/calendarMarks";

describe("noteDays", () => {
  it("keeps only date-named notes", () => {
    expect(
      noteDays(["2026-11-05", "2026-11-06", "Readme", "2026-1-2", "2026-11-06 copy"]),
    ).toEqual(new Set(["2026-11-05", "2026-11-06"]));
  });
});
