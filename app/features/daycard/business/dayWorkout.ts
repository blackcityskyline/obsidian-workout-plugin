import { TFile } from "obsidian";
import { t } from "@app/i18n";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import { trainingDay } from "@app/services/history/TrainingHistory";
import {
  ensureDailyNote,
  type DailyCardPlugin,
} from "@app/features/daycard/business/dailyCardNote";

/** The template name of a day's workout: every set of that day without a name belongs to it */
export function dayWorkoutName(day: string): string {
  return t("dayCard.workoutName", { date: day });
}

/** A set keeps the workout it names, else it joins its day's workout */
export function withDayWorkout<T extends { date: string; workout?: string }>(
  entry: T,
): T {
  if (entry.workout && entry.workout.trim()) return entry;
  return { ...entry, workout: dayWorkoutName(trainingDay(entry.date)) };
}

/** Adds `- [[link]]` under the "Exercises" heading of the note once */
export function withExerciseLink(content: string, link: string): string {
  const line = `- [[${link}]]`;
  if (content.split(/\r?\n/).some((l) => l.trim() === line)) return content;
  const heading = `## ${t("dayCard.exercises")}`;
  const lines = content.split("\n");
  const at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) return [content.replace(/\s*$/, ""), "", heading, "", line, ""].join("\n");
  let end = at + 1;
  while (end < lines.length && !lines[end].startsWith("## ")) end++;
  let last = end - 1;
  while (last > at && lines[last].trim() === "") last--;
  lines.splice(last + 1, 0, line);
  return lines.join("\n");
}

export type DayWorkoutPlugin = DailyCardPlugin &
  AppPort &
  SettingsPort & {
    getExerciseLibrary(): { find(name: string): { file: TFile } | null | undefined };
  };

/**
 * The first set of a day creates the day's page (the daily note, never
 * overwritten); every set links its exercise page there.
 */
export async function attachSetToDay(
  plugin: DayWorkoutPlugin,
  entry: { date: string; exercise: string },
): Promise<TFile> {
  const { file } = await ensureDailyNote(plugin, trainingDay(entry.date));
  const page = plugin.getExerciseLibrary().find(entry.exercise);
  const link = page ? page.file.path.replace(/\.md$/, "") : entry.exercise;
  await plugin.app.vault.process(file, (text) => withExerciseLink(text, link));
  return file;
}
