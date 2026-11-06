import { dayReport, resolveDay } from "@app/features/daycard/business/dayReport";
import type { WorkoutLogData } from "@app/types/WorkoutLogData";

const set = (over: Partial<WorkoutLogData>): WorkoutLogData =>
  ({
    date: "2026-11-02T10:00:00",
    exercise: "Squat",
    reps: 5,
    weight: 60,
    volume: 300,
    timestamp: 1,
    workout: "Day A",
    ...over,
  }) as WorkoutLogData;

describe("resolveDay", () => {
  const base = { basename: "Notes", today: "2026-11-06" };
  it("prefers the block date, then the property, then a date-named note", () => {
    expect(resolveDay({ ...base, param: "2026-01-02", property: "2026-02-03" })).toBe("2026-01-02");
    expect(resolveDay({ ...base, property: "2026-02-03T08:00" })).toBe("2026-02-03");
    expect(resolveDay({ ...base, basename: "2026-03-04" })).toBe("2026-03-04");
    expect(resolveDay({ ...base, property: new Date("2026-05-06T00:00:00Z") })).toBe("2026-05-06");
  });
  it("falls back to today and ignores invalid dates", () => {
    expect(resolveDay({ ...base, param: "soon" })).toBe("2026-11-06");
  });
});

describe("dayReport", () => {
  const logs = [
    set({ timestamp: 1 }),
    set({ timestamp: 2, weight: 70, volume: 350 }),
    set({ timestamp: 3, exercise: "Row", weight: 40, volume: 200 }),
    set({ timestamp: 4, date: "2026-11-03T10:00:00", workout: "Day B" }),
  ];
  const weights = [{ date: "2026-11-02", weight: 78.4, note: "" }];

  it("sums the day's sets per exercise", () => {
    const report = dayReport("2026-11-02", logs, weights);
    expect(report.totalSets).toBe(3);
    expect(report.totalVolume).toBe(850);
    expect(report.sessions).toHaveLength(1);
    expect(report.sessions[0].workout).toBe("Day A");
    expect(report.sessions[0].exercises).toEqual([
      { name: "Squat", sets: 2, topWeight: 70, volume: 650 },
      { name: "Row", sets: 1, topWeight: 40, volume: 200 },
    ]);
    expect(report.bodyWeight?.weight).toBe(78.4);
  });

  it("is empty on a rest day", () => {
    const report = dayReport("2026-11-05", logs, weights);
    expect(report).toMatchObject({ sessions: [], totalSets: 0, totalVolume: 0, records: 0 });
    expect(report.bodyWeight).toBeUndefined();
  });

  it("adds what was eaten that day, and nothing without entries", () => {
    const meals = [
      { date: "2026-11-02", meal: "lunch", food: "Rice", grams: 200, kcal: 260, protein: 5.4, fat: 0.6, carbs: 56.4, timestamp: 1 },
      { date: "2026-11-03", meal: "lunch", food: "Egg", grams: 50, kcal: 72, protein: 6.3, fat: 4.8, carbs: 0.4, timestamp: 2 },
    ] as const;
    expect(dayReport("2026-11-02", logs, weights, meals).food).toEqual({
      kcal: 260,
      protein: 5.4,
      fat: 0.6,
      carbs: 56.4,
    });
    expect(dayReport("2026-11-05", logs, weights, meals).food).toBeUndefined();
    expect(dayReport("2026-11-02", logs, weights).food).toBeUndefined();
  });
});
