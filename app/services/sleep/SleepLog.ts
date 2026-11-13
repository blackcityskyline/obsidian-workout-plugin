import { App, TFile } from "obsidian";
import { parseCsv, stringifyCsvRow } from "@app/utils/data/CsvCodec";
import { PathUtils } from "@app/utils/PathUtils";
import type { WorkoutChartsSettings } from "@app/types/WorkoutLogData";
import type { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";

/** One night, filed under the day you woke up */
export interface SleepEntry {
  /** Local day, YYYY-MM-DD: one entry per day */
  date: string;
  /** Hours slept */
  hours: number;
  /** 1 (bad) to 5 (great); undefined = not rated */
  quality?: number;
  /** "HH:MM" or "" */
  bedtime: string;
  wake: string;
  note: string;
}

export interface SleepInput {
  hours: number;
  quality?: number;
  bedtime?: string;
  wake?: string;
  note?: string;
}

const HEADER = ["date", "hours", "quality", "bedtime", "wake", "note"];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;

export interface SleepStorage {
  read(): Promise<string | null>;
  write(content: string): Promise<void>;
}

/** `sleep_log.csv` next to the workout log */
export function sleepPath(csvLogFilePath: string): string {
  const parts = csvLogFilePath.split("/");
  parts.pop();
  return [...parts, "sleep_log.csv"].join("/");
}

export class VaultSleepStorage implements SleepStorage {
  constructor(
    private app: App,
    private settings: Pick<WorkoutChartsSettings, "csvLogFilePath">,
  ) {}

  private get path(): string {
    return sleepPath(this.settings.csvLogFilePath);
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

/** Hours between a bedtime and a wake time ("23:30" → "07:00" = 7.5), crossing midnight */
export function hoursBetween(bedtime: string, wake: string): number | undefined {
  if (!TIME.test(bedtime) || !TIME.test(wake)) return undefined;
  const minutes = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return h * 60 + m;
  };
  let span = minutes(wake) - minutes(bedtime);
  if (span <= 0) span += 24 * 60;
  return Math.round((span / 60) * 100) / 100;
}

/** The only module that knows the sleep CSV. Every change emits `sleep:changed`. */
export class SleepLog {
  constructor(
    private storage: SleepStorage,
    private eventBus?: WorkoutEventBus,
  ) {}

  /** Every night, oldest first */
  async read(): Promise<SleepEntry[]> {
    return this.parse(await this.storage.read()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  /** Records a night, replacing that day's entry */
  async set(date: string, input: SleepInput): Promise<void> {
    if (!DAY.test(date)) throw new Error(`Invalid date: ${date}`);
    if (!Number.isFinite(input.hours) || input.hours <= 0 || input.hours > 24) {
      throw new Error(`Invalid hours: ${input.hours}`);
    }
    const quality =
      input.quality !== undefined && input.quality >= 1 && input.quality <= 5
        ? Math.round(input.quality)
        : undefined;
    const rows = (await this.read()).filter((r) => r.date !== date);
    rows.push({
      date,
      hours: input.hours,
      quality,
      bedtime: input.bedtime && TIME.test(input.bedtime) ? input.bedtime : "",
      wake: input.wake && TIME.test(input.wake) ? input.wake : "",
      note: input.note ?? "",
    });
    await this.write(rows);
    this.eventBus?.emit({ type: "sleep:changed", payload: { date } });
  }

  async delete(date: string): Promise<boolean> {
    const rows = await this.read();
    const kept = rows.filter((r) => r.date !== date);
    if (kept.length === rows.length) return false;
    await this.write(kept);
    this.eventBus?.emit({ type: "sleep:changed", payload: { date } });
    return true;
  }

  private parse(content: string | null): SleepEntry[] {
    if (!content) return [];
    const [header, ...rows] = parseCsv(content);
    if (!header) return [];
    const [iDate, iHours, iQuality, iBed, iWake, iNote] = HEADER.map((n) => header.indexOf(n));
    const out: SleepEntry[] = [];
    for (const row of rows) {
      const date = row[iDate]?.trim();
      const hours = Number(row[iHours]);
      if (!date || !DAY.test(date) || !Number.isFinite(hours) || hours <= 0) continue;
      const q = Number(row[iQuality]);
      out.push({
        date,
        hours,
        quality: q >= 1 && q <= 5 ? q : undefined,
        bedtime: iBed >= 0 ? (row[iBed] ?? "") : "",
        wake: iWake >= 0 ? (row[iWake] ?? "") : "",
        note: iNote >= 0 ? (row[iNote] ?? "") : "",
      });
    }
    return out;
  }

  private async write(rows: SleepEntry[]): Promise<void> {
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const lines = [
      stringifyCsvRow(HEADER),
      ...sorted.map((r) =>
        stringifyCsvRow([r.date, String(r.hours), r.quality ? String(r.quality) : "", r.bedtime, r.wake, r.note]),
      ),
    ];
    await this.storage.write(lines.join("\n") + "\n");
  }
}
