import { figuresOf, foodSeries, recentDays, sleepSeries } from "@app/features/dashboard/widgets/series/seriesData";

describe("seriesData", () => {
  it("lists the days oldest first across a month end", () => {
    expect(recentDays(3, "2026-03-01")).toEqual(["2026-02-27", "2026-02-28", "2026-03-01"]);
  });
  it("keeps only the nights of the period", () => {
    const s = sleepSeries(
      [
        { date: "2026-11-01", hours: 6, bedtime: "", wake: "", note: "" },
        { date: "2026-11-10", hours: 8, bedtime: "", wake: "", note: "" },
      ],
      7,
      "2026-11-12",
    );
    expect(s).toEqual({ dates: ["2026-11-10"], values: [8] });
  });
  it("sums food per day and fills empty days with 0", () => {
    const entry = (date: string, kcal: number) =>
      ({ date, meal: "lunch", food: "x", grams: 1, kcal, protein: 1, fat: 0, carbs: 0, timestamp: 1 }) as never;
    const s = foodSeries([entry("2026-11-12", 300), entry("2026-11-12", 200)], "kcal", 3, "2026-11-12");
    expect(s.values).toEqual([0, 0, 500]);
  });
  it("gives figures, none for an empty series", () => {
    expect(figuresOf([])).toBeUndefined();
    expect(figuresOf([2, 4, 9])).toEqual({ latest: 9, average: 5, min: 2, max: 9 });
  });
});
