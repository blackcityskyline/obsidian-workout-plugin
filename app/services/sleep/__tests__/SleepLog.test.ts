import { SleepLog, hoursBetween, type SleepStorage } from "@app/services/sleep/SleepLog";
import { SleepHistory } from "@app/services/sleep/SleepHistory";

class Mem implements SleepStorage {
  text: string | null = null;
  async read() { return this.text; }
  async write(c: string) { this.text = c; }
}

describe("SleepLog", () => {
  it("stores one night per day and reads oldest first", async () => {
    const mem = new Mem();
    const log = new SleepLog(mem);
    await log.set("2026-11-02", { hours: 7, quality: 4, note: "a, \"b\"" });
    await log.set("2026-11-01", { hours: 6.5 });
    await log.set("2026-11-02", { hours: 8 });
    const all = await log.read();
    expect(all.map((e) => e.date)).toEqual(["2026-11-01", "2026-11-02"]);
    expect(all[1].hours).toBe(8);
    expect(all[1].quality).toBeUndefined();
  });
  it("keeps quotes and commas in notes", async () => {
    const log = new SleepLog(new Mem());
    await log.set("2026-11-02", { hours: 7, note: "a, \"b\"" });
    expect((await log.read())[0].note).toBe("a, \"b\"");
  });
  it("rejects bad input and emits", async () => {
    const emit = jest.fn();
    const log = new SleepLog(new Mem(), { emit } as never);
    await expect(log.set("x", { hours: 7 })).rejects.toThrow();
    await expect(log.set("2026-11-01", { hours: 0 })).rejects.toThrow();
    await log.set("2026-11-01", { hours: 7 });
    expect(emit).toHaveBeenCalledWith({ type: "sleep:changed", payload: { date: "2026-11-01" } });
    expect(await log.delete("2026-11-01")).toBe(true);
    expect(await log.delete("2026-11-01")).toBe(false);
  });
  it("computes hours across midnight", () => {
    expect(hoursBetween("23:30", "07:00")).toBe(7.5);
    expect(hoursBetween("01:00", "08:00")).toBe(7);
    expect(hoursBetween("x", "08:00")).toBeUndefined();
  });
  it("averages a period", () => {
    const h = new SleepHistory([
      { date: "2026-11-01", hours: 6, bedtime: "", wake: "", note: "" },
      { date: "2026-11-02", hours: 8, bedtime: "", wake: "", note: "" },
    ]);
    expect(h.averageHours(7, "2026-11-02")).toBe(7);
    expect(h.averageHours(1, "2026-11-02")).toBe(8);
  });
});
