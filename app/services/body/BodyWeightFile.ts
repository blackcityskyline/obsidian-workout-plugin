import { App, TFile } from "obsidian";
import { parseCsv, stringifyCsvRow } from "@app/utils/data/CsvCodec";
import { PathUtils } from "@app/utils/PathUtils";
import type { WorkoutChartsSettings } from "@app/types/WorkoutLogData";
import type { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import {
  convertWeight,
  isWeightUnit,
  type WeightUnit,
} from "@app/utils/WeightUnitUtils";

/** One weigh-in as it is read: the weight is in the settings unit */
export interface BodyWeightEntry {
  /** Local day, YYYY-MM-DD: one entry per day */
  date: string;
  weight: number;
  note: string;
}

const HEADER = ["date", "weight", "unit", "note"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Where the body weight CSV lives; tests use an in-memory string */
export interface BodyWeightStorage {
  /** The file's text, or null when it does not exist yet */
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
}

/** The body weight CSV next to the workout log: `body_weight.csv` */
export function bodyWeightPath(csvLogFilePath: string): string {
  const parts = csvLogFilePath.split("/");
  parts.pop();
  return [...parts, "body_weight.csv"].join("/");
}

export class VaultBodyWeightStorage implements BodyWeightStorage {
  constructor(
    private app: App,
    private settings: Pick<WorkoutChartsSettings, "csvLogFilePath">,
  ) {}

  private get path(): string {
    return bodyWeightPath(this.settings.csvLogFilePath);
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
 * The only module that knows the body weight CSV: `date,weight,unit,note`,
 * one row per day, the unit of each row kept so a later change of the
 * weight unit setting converts old weigh-ins instead of misreading them.
 * Every change emits `bodyweight:changed`.
 */
export class BodyWeightLog {
  constructor(
    private storage: BodyWeightStorage,
    private settings: Pick<WorkoutChartsSettings, "weightUnit">,
    private eventBus?: WorkoutEventBus,
  ) {}

  /** Every weigh-in, oldest first, in the settings unit */
  async read(): Promise<BodyWeightEntry[]> {
    const rows = this.parse(await this.storage.read());
    return rows
      .map((row) => ({
        date: row.date,
        weight: convertWeight(row.weight, row.unit, this.settings.weightUnit),
        note: row.note,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** Records the weight of a day (settings unit), replacing that day's entry */
  async set(date: string, weight: number, note = ""): Promise<void> {
    if (!DAY.test(date)) throw new Error(`Invalid date: ${date}`);
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error(`Invalid weight: ${weight}`);
    }
    const rows = this.parse(await this.storage.read()).filter(
      (row) => row.date !== date,
    );
    rows.push({ date, weight, unit: this.settings.weightUnit, note });
    await this.write(rows);
    this.eventBus?.emit({ type: "bodyweight:changed", payload: { date } });
  }

  /** Removes the entry of a day; false when there was none */
  async delete(date: string): Promise<boolean> {
    const rows = this.parse(await this.storage.read());
    const kept = rows.filter((row) => row.date !== date);
    if (kept.length === rows.length) return false;
    await this.write(kept);
    this.eventBus?.emit({ type: "bodyweight:changed", payload: { date } });
    return true;
  }

  private parse(content: string | null): StoredRow[] {
    if (!content) return [];
    const [header, ...rows] = parseCsv(content);
    if (!header) return [];
    const col = (name: string) => header.indexOf(name);
    const [iDate, iWeight, iUnit, iNote] = HEADER.map(col);
    const parsed: StoredRow[] = [];
    for (const row of rows) {
      const weight = Number(row[iWeight]);
      const date = row[iDate]?.trim();
      if (!date || !DAY.test(date) || !Number.isFinite(weight) || weight <= 0) {
        continue;
      }
      const unit = row[iUnit]?.trim();
      parsed.push({
        date,
        weight,
        unit: isWeightUnit(unit) ? unit : this.settings.weightUnit,
        note: iNote >= 0 ? (row[iNote] ?? "") : "",
      });
    }
    return parsed;
  }

  private async write(rows: StoredRow[]): Promise<void> {
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const lines = [
      stringifyCsvRow(HEADER),
      ...sorted.map((r) =>
        stringifyCsvRow([r.date, String(r.weight), r.unit, r.note]),
      ),
    ];
    await this.storage.write(lines.join("\n") + "\n");
  }
}

interface StoredRow {
  date: string;
  weight: number;
  unit: WeightUnit;
  note: string;
}
