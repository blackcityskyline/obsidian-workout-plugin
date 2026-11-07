import {
  BodyWeightLog,
  bodyWeightPath,
  type BodyWeightStorage,
} from "@app/services/body/BodyWeightFile";
import { BodyWeightHistory } from "@app/services/body/BodyWeightHistory";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";

class MemoryStorage implements BodyWeightStorage {
  constructor(public text: string | null = null) {}
  async read() {
    return this.text;
  }
  async write(content: string) {
    this.text = content;
  }
}

const setup = (text: string | null = null, weightUnit: "kg" | "lb" = "kg") => {
  const storage = new MemoryStorage(text);
  const settings = { weightUnit };
  const eventBus = new WorkoutEventBus();
  const events: unknown[] = [];
  eventBus.on("bodyweight:changed", (p) => events.push(p));
  return { storage, settings, events, log: new BodyWeightLog(storage, settings, eventBus) };
};

describe("bodyWeightPath", () => {
  it("sits next to the workout log", () => {
    expect(bodyWeightPath("theGYM/Log/workout_logs.csv")).toBe("theGYM/Log/body_weight.csv");
    expect(bodyWeightPath("workout_logs.csv")).toBe("body_weight.csv");
  });
});

describe("BodyWeightLog", () => {
  it("starts empty and writes the header with the first entry", async () => {
    const { log, storage } = setup();
    expect(await log.read()).toEqual([]);
    await log.set("2026-11-01", 78.4);
    expect(storage.text).toBe("date,weight,unit,note\n2026-11-01,78.4,kg,\n");
  });

  it("keeps one entry per day and sorts by date", async () => {
    const { log } = setup();
    await log.set("2026-11-03", 78);
    await log.set("2026-11-01", 79, "morning, fasted");
    await log.set("2026-11-03", 77.6);
    expect(await log.read()).toEqual([
      { date: "2026-11-01", weight: 79, note: "morning, fasted" },
      { date: "2026-11-03", weight: 77.6, note: "" },
    ]);
  });

  it("emits bodyweight:changed on set and delete, not on a miss", async () => {
    const { log, events } = setup();
    await log.set("2026-11-01", 78);
    expect(await log.delete("2026-11-09")).toBe(false);
    expect(await log.delete("2026-11-01")).toBe(true);
    expect(events).toEqual([{ date: "2026-11-01" }, { date: "2026-11-01" }]);
  });

  it("converts entries written in another unit to the settings unit", async () => {
    const { log } = setup("date,weight,unit,note\n2026-11-01,176.37,lb,\n");
    expect((await log.read())[0].weight).toBeCloseTo(80, 1);
  });

  it("skips malformed rows and reads quoted notes", async () => {
    const { log } = setup(
      'date,weight,unit,note\nbad,80,kg,\n2026-11-02,abc,kg,\n2026-11-03,80,kg,"a, ""b"""\n',
    );
    expect(await log.read()).toEqual([{ date: "2026-11-03", weight: 80, note: 'a, "b"' }]);
  });

  it("rejects an invalid date or weight", async () => {
    const { log } = setup();
    await expect(log.set("1/2/2026", 80)).rejects.toThrow();
    await expect(log.set("2026-11-01", 0)).rejects.toThrow();
    await expect(log.set("2026-11-01", NaN)).rejects.toThrow();
  });
});

describe("BodyWeightHistory", () => {
  const entries = [
    { date: "2026-10-01", weight: 80, note: "" },
    { date: "2026-10-20", weight: 79, note: "" },
    { date: "2026-11-01", weight: 77.5, note: "" },
  ];
  const history = new BodyWeightHistory(entries);

  it("gives the latest entry", () => {
    expect(history.latest()?.weight).toBe(77.5);
    expect(new BodyWeightHistory([]).latest()).toBeUndefined();
  });

  it("limits a period to its days, today included", () => {
    expect(history.since(30, "2026-11-01").map((e) => e.date)).toEqual([
      "2026-10-20",
      "2026-11-01",
    ]);
    expect(history.since(1, "2026-11-01")).toHaveLength(1);
  });

  it("gives a period as chart series, oldest first", () => {
    expect(history.series(30, "2026-11-01")).toEqual({
      dates: ["2026-10-20", "2026-11-01"],
      weights: [79, 77.5],
    });
    expect(new BodyWeightHistory([]).series(30, "2026-11-01")).toEqual({ dates: [], weights: [] });
  });

  it("measures the change and the trend over a period", () => {
    expect(history.change(60, "2026-11-01")).toBe(-2.5);
    expect(history.change(1, "2026-11-01")).toBeUndefined();
    // the project's one trend rule: within 5% of the mean is stable
    expect(history.trend(60, "2026-11-01")?.direction).toBe("stable");
    const big = new BodyWeightHistory([
      { date: "2026-10-01", weight: 90, note: "" },
      { date: "2026-11-01", weight: 80, note: "" },
    ]);
    expect(big.trend(60, "2026-11-01")?.direction).toBe("down");
  });
});
