import { FoodLog, foodLogPath, type FoodLogStorage } from "@app/services/food/FoodLog";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";

class MemoryStorage implements FoodLogStorage {
  constructor(public text: string | null = null) {}
  async read() {
    return this.text;
  }
  async write(content: string) {
    this.text = content;
  }
}

const eaten = {
  date: "2026-11-06",
  meal: "breakfast" as const,
  food: "Oats, dry",
  grams: 60,
  kcal: 233,
  protein: 10.1,
  fat: 4.1,
  carbs: 39.8,
};

function setup(text: string | null = null) {
  const storage = new MemoryStorage(text);
  const bus = new WorkoutEventBus();
  const events: unknown[] = [];
  bus.on("food:changed", (p) => events.push(p));
  let clock = 1000;
  return { storage, events, log: new FoodLog(storage, bus, () => clock) };
}

describe("foodLogPath", () => {
  it("sits next to the workout log", () => {
    expect(foodLogPath("theGYM/Log/workout_logs.csv")).toBe("theGYM/Log/food_log.csv");
  });
});

describe("FoodLog", () => {
  it("writes the header and the entry with the macros as logged", async () => {
    const { log, storage } = setup();
    const entry = await log.add(eaten);
    expect(entry.timestamp).toBe(1000);
    expect(storage.text).toBe(
      "date,meal,food,grams,kcal,protein,fat,carbs,timestamp\n" +
        "2026-11-06,breakfast,\"Oats, dry\",60,233,10.1,4.1,39.8,1000\n".replace('"Oats, dry"', '"Oats, dry"'),
    );
    expect(await log.read()).toEqual([entry]);
  });

  it("gives entries made in the same millisecond their own timestamp", async () => {
    const { log } = setup();
    const a = await log.add(eaten);
    const b = await log.add({ ...eaten, food: "Egg" });
    expect(b.timestamp).toBe(a.timestamp + 1);
  });

  it("orders by day, then by when it was eaten", async () => {
    const { log } = setup();
    await log.add({ ...eaten, date: "2026-11-07" }, 5);
    await log.add({ ...eaten, food: "Egg" }, 9);
    await log.add({ ...eaten, food: "Apple" }, 3);
    expect((await log.read()).map((e) => e.food)).toEqual(["Apple", "Egg", "Oats, dry"]);
  });

  it("deletes by timestamp and emits food:changed once per change", async () => {
    const { log, events } = setup();
    const entry = await log.add(eaten);
    expect(await log.delete(12345)).toBe(false);
    expect(await log.delete(entry.timestamp)).toBe(true);
    expect(await log.read()).toEqual([]);
    expect(events).toEqual([{ date: "2026-11-06" }, { date: "2026-11-06" }]);
  });

  it("restores a deleted entry exactly with its timestamp (undo)", async () => {
    const { log } = setup();
    const entry = await log.add(eaten);
    await log.delete(entry.timestamp);
    await log.add(
      { date: entry.date, meal: entry.meal, food: entry.food, grams: entry.grams, kcal: entry.kcal, protein: entry.protein, fat: entry.fat, carbs: entry.carbs },
      entry.timestamp,
    );
    expect(await log.read()).toEqual([entry]);
  });

  it("rejects an invalid date, meal, name or amount", async () => {
    const { log } = setup();
    await expect(log.add({ ...eaten, date: "6.11" })).rejects.toThrow();
    await expect(log.add({ ...eaten, meal: "brunch" as never })).rejects.toThrow();
    await expect(log.add({ ...eaten, food: " " })).rejects.toThrow();
    await expect(log.add({ ...eaten, grams: 0 })).rejects.toThrow();
  });

  it("skips malformed rows when reading", async () => {
    const { log } = setup(
      "date,meal,food,grams,kcal,protein,fat,carbs,timestamp\n" +
        "bad,lunch,Egg,50,1,1,1,1,1\n2026-11-06,lunch,Egg,50,72,6,5,0.4,2\n2026-11-06,brunch,Egg,50,1,1,1,1,3\n",
    );
    expect((await log.read()).map((e) => e.timestamp)).toEqual([2]);
  });

  it("adds several entries in one write with distinct timestamps and one event per day", async () => {
    const { log, storage, events } = setup();
    const added = await log.addMany([eaten, { ...eaten, food: "Milk", grams: 200 }, { ...eaten, date: "2026-11-07" }]);
    expect(added.map((e) => e.timestamp)).toEqual([1000, 1001, 1002]);
    expect(storage.text?.trim().split("\n")).toHaveLength(4);
    expect(events).toEqual([{ date: "2026-11-06" }, { date: "2026-11-07" }]);
  });

  it("writes nothing when one of several entries is invalid", async () => {
    const { log, storage, events } = setup();
    await expect(log.addMany([eaten, { ...eaten, grams: 0 }])).rejects.toThrow();
    expect(storage.text).toBeNull();
    expect(events).toEqual([]);
    expect(await log.addMany([])).toEqual([]);
  });

  it("deletes several entries in one write", async () => {
    const { log, events } = setup();
    const [a, b, c] = await log.addMany([eaten, eaten, eaten]);
    events.length = 0;
    expect(await log.deleteMany([a.timestamp, c.timestamp, 999])).toBe(2);
    expect((await log.read()).map((e) => e.timestamp)).toEqual([b.timestamp]);
    expect(events).toEqual([{ date: "2026-11-06" }]);
    expect(await log.deleteMany([999])).toBe(0);
  });
});
