import { App, TFile } from "obsidian";
import { parseCsv, stringifyCsvRow } from "@app/utils/data/CsvCodec";
import { PathUtils } from "@app/utils/PathUtils";
import type { WorkoutChartsSettings } from "@app/types/WorkoutLogData";
import type { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export function isMeal(value: unknown): value is Meal {
  return (MEALS as readonly string[]).includes(value as string);
}

/** One eaten food: the macros are those of `grams`, as they were when logged */
export interface FoodEntry {
  /** Local day, YYYY-MM-DD */
  date: string;
  meal: Meal;
  food: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  /** Unique per entry, orders the day and identifies it for delete */
  timestamp: number;
}

export type FoodEntryInput = Omit<FoodEntry, "timestamp">;

const HEADER = ["date", "meal", "food", "grams", "kcal", "protein", "fat", "carbs", "timestamp"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Where the food log CSV lives; tests use an in-memory string */
export interface FoodLogStorage {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
}

/** A food file next to the workout log; the food log is `food_log.csv` */
export function foodLogPath(csvLogFilePath: string, fileName = "food_log.csv"): string {
  const parts = csvLogFilePath.split("/");
  parts.pop();
  return [...parts, fileName].join("/");
}

export class VaultFoodLogStorage implements FoodLogStorage {
  constructor(
    private app: App,
    private settings: Pick<WorkoutChartsSettings, "csvLogFilePath">,
    private fileName = "food_log.csv",
  ) {}

  private get path(): string {
    return foodLogPath(this.settings.csvLogFilePath, this.fileName);
  }

  async read(): Promise<string | null> {
    const file = this.app.vault.getAbstractFileByPath(this.path);
    return file instanceof TFile ? this.app.vault.read(file) : null;
  }

  async write(content: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(this.path);
    if (file instanceof TFile) {
      await this.app.vault.process(file, () => content);
      return;
    }
    await PathUtils.ensureFolderExists(this.app, this.path);
    await this.app.vault.create(this.path, content);
  }
}

/**
 * The only module that knows the food log CSV (`food_log.csv`): one row per
 * eaten food with its macros as logged, so editing a food page later does not
 * rewrite history. Every change emits `food:changed`.
 */
export class FoodLog {
  constructor(
    private storage: FoodLogStorage,
    private eventBus?: WorkoutEventBus,
    private now: () => number = Date.now,
  ) {}

  /** Every entry, in the order eaten (day, then timestamp) */
  async read(): Promise<FoodEntry[]> {
    return this.parse(await this.storage.read()).sort(
      (a, b) => a.date.localeCompare(b.date) || a.timestamp - b.timestamp,
    );
  }

  async add(input: FoodEntryInput, timestamp?: number): Promise<FoodEntry> {
    const [entry] = await this.addMany([input], timestamp);
    return entry;
  }

  /**
   * Adds several entries in one write and one `food:changed` per day
   * (a saved meal); all are checked before any is written. A given timestamp
   * is the first entry's, the next ones follow it.
   */
  async addMany(inputs: readonly FoodEntryInput[], timestamp?: number): Promise<FoodEntry[]> {
    if (inputs.length === 0) return [];
    for (const input of inputs) this.check(input);
    const entries = this.parse(await this.storage.read());
    const used = new Set(entries.map((e) => e.timestamp));
    let stamp = timestamp ?? this.now();
    const added = inputs.map((input) => {
      while (used.has(stamp)) stamp++;
      used.add(stamp);
      return { ...input, food: input.food.trim(), timestamp: stamp };
    });
    await this.write([...entries, ...added]);
    for (const date of new Set(added.map((e) => e.date))) {
      this.eventBus?.emit({ type: "food:changed", payload: { date } });
    }
    return added;
  }

  private check(input: FoodEntryInput): void {
    if (!DAY.test(input.date)) throw new Error(`Invalid date: ${input.date}`);
    if (!isMeal(input.meal)) throw new Error(`Invalid meal: ${String(input.meal)}`);
    if (!input.food.trim()) throw new Error("Food name is empty");
    if (!(input.grams > 0) || !Number.isFinite(input.grams)) {
      throw new Error(`Invalid grams: ${input.grams}`);
    }
  }

  /** Removes an entry by its timestamp; false when there is none */
  async delete(timestamp: number): Promise<boolean> {
    return (await this.deleteMany([timestamp])) > 0;
  }

  /** Removes entries by timestamp in one write; returns how many were there */
  async deleteMany(timestamps: readonly number[]): Promise<number> {
    const entries = this.parse(await this.storage.read());
    const wanted = new Set(timestamps);
    const gone = entries.filter((e) => wanted.has(e.timestamp));
    if (gone.length === 0) return 0;
    await this.write(entries.filter((e) => !wanted.has(e.timestamp)));
    for (const date of new Set(gone.map((e) => e.date))) {
      this.eventBus?.emit({ type: "food:changed", payload: { date } });
    }
    return gone.length;
  }

  private parse(content: string | null): FoodEntry[] {
    if (!content) return [];
    const [header, ...rows] = parseCsv(content);
    if (!header) return [];
    const col = Object.fromEntries(HEADER.map((name) => [name, header.indexOf(name)]));
    const entries: FoodEntry[] = [];
    for (const row of rows) {
      const get = (name: string) => row[col[name]]?.trim() ?? "";
      const grams = Number(get("grams"));
      const meal = get("meal");
      if (!DAY.test(get("date")) || !isMeal(meal) || !get("food") || !(grams > 0)) continue;
      entries.push({
        date: get("date"),
        meal,
        food: row[col.food],
        grams,
        kcal: Number(get("kcal")) || 0,
        protein: Number(get("protein")) || 0,
        fat: Number(get("fat")) || 0,
        carbs: Number(get("carbs")) || 0,
        timestamp: Number(get("timestamp")) || 0,
      });
    }
    return entries;
  }

  private async write(entries: FoodEntry[]): Promise<void> {
    const lines = [
      stringifyCsvRow(HEADER),
      ...entries.map((e) =>
        stringifyCsvRow([
          e.date, e.meal, e.food, String(e.grams), String(e.kcal),
          String(e.protein), String(e.fat), String(e.carbs), String(e.timestamp),
        ]),
      ),
    ];
    await this.storage.write(lines.join("\n") + "\n");
  }
}
