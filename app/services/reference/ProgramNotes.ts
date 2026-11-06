import { normalizePath } from "obsidian";
import { t } from "@app/i18n";
import type { AppPort, SettingsPort } from "@app/types/PluginPorts";
import { setsBlock } from "@app/features/tables/setsBlock";
import { tableBlock } from "@app/features/tables/tableBlock";
import { timerBlock } from "@app/features/timer/timerBlock";
import { TIMER_TYPE } from "@app/features/timer/types";
import { sessionBlock } from "@app/features/session/sessionBlock";
import { generateCodeBlockId } from "@app/utils/IdUtils";
import {
  REFERENCE_PROGRAM,
  type ProgramBlock,
  type ProgramDay,
} from "@app/services/reference/referenceProgram.generated";
import type { ReferenceLanguage } from "@app/services/reference/ReferenceExercises";

export type ProgramPluginPort = AppPort & SettingsPort;

const STRENGTH_SETS = 3;
const REST_SINGLE = 90;
const REST_SUPERSET = 45;

/** The folder of the program notes: "Program" next to the exercise folder */
export function programFolder(exerciseFolderPath: string): string {
  const parts = normalizePath(exerciseFolderPath).split("/");
  parts.pop();
  return normalizePath([...parts, t("reference.program.folder")].join("/"));
}

export function programNoteName(day: ProgramDay): string {
  return t("reference.program.noteName", { key: day.key });
}

function strengthBlock(
  name: string,
  workout: string,
  rest: number,
): string {
  return setsBlock.serialize({
    id: generateCodeBlockId(),
    exercise: name,
    workout,
    sets: STRENGTH_SETS,
    rest,
  });
}

/** The file name of an exercise page: the characters Obsidian forbids become "-" (as the page exporter writes it) */
export function pageFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ").trim();
}

function link(name: string): string {
  const file = pageFileName(name);
  return file === name ? `[[${name}]]` : `[[${file}|${name}]]`;
}

function strengthSection(
  block: ProgramBlock,
  lang: ReferenceLanguage,
  workout: string,
): string {
  const names = block.items.map((item) => item.name[lang]);
  const rest = block.kind === "superset" ? REST_SUPERSET : REST_SINGLE;
  const hint =
    block.kind === "superset"
      ? t("reference.program.superset")
      : block.kind === "alt"
        ? t("reference.program.alt")
        : null;
  return [
    `## ${names.join(block.kind === "alt" ? " / " : " + ")}`,
    hint,
    ...names.map((name) => `- ${link(name)}`),
    ...names.map((name) => strengthBlock(name, workout, rest)),
  ]
    .filter((part): part is string => part !== null)
    .join("\n\n");
}

function cardioNote(day: ProgramDay, lang: ReferenceLanguage, workout: string): string {
  const timer = day.timer;
  const names = day.blocks.flatMap((b) => b.items.map((i) => i.name[lang]));
  const parts: (string | null)[] = [];
  if (timer) {
    parts.push(
      t("reference.program.circuit", {
        work: String(timer.work),
        rest: String(timer.rest),
        rounds: `${timer.rounds[0]}–${timer.rounds[1]}`,
        roundRest: String(timer.roundRest),
      }),
      "## " + t("reference.program.exercises"),
      names.map((n) => `- ${link(n)}`).join("\n"),
      "## " + t("reference.program.timer"),
      timerBlock.serialize({
        id: generateCodeBlockId(),
        type: TIMER_TYPE.INTERVAL,
        work: timer.work,
        rest: timer.rest,
        rounds: names.length,
        showControls: true,
        sound: true,
      }),
      t("reference.program.roundRest", { seconds: String(timer.roundRest) }),
      timerBlock.serialize({
        id: generateCodeBlockId(),
        type: TIMER_TYPE.COUNTDOWN,
        duration: timer.roundRest,
        showControls: true,
        sound: true,
      }),
    );
  }
  parts.push(
    "## " + t("reference.program.log"),
    tableBlock.serialize({
      id: generateCodeBlockId(),
      workout,
      exactMatch: true,
      limit: 30,
    }),
  );
  return parts.filter((p): p is string => p !== null).join("\n\n");
}

/** The note's text for one program day, in the exercise names of `lang` */
export function programNoteContent(day: ProgramDay, lang: ReferenceLanguage): string {
  const workout = programNoteName(day);
  const body = day.cardio
    ? cardioNote(day, lang, workout)
    : [
        sessionBlock.serialize({}),
        ...day.blocks.map((block) => strengthSection(block, lang, workout)),
      ].join("\n\n");
  return `# ${workout}\n\n${body}\n`;
}

export interface ProgramNotesResult {
  created: number;
  skipped: number;
  folder: string;
}

/** Writes one note per program day; an existing note is never touched */
export async function createProgramNotes(
  plugin: ProgramPluginPort,
  lang: ReferenceLanguage,
): Promise<ProgramNotesResult> {
  const { vault } = plugin.app;
  const folder = programFolder(plugin.settings.exerciseFolderPath);
  const result: ProgramNotesResult = { created: 0, skipped: 0, folder };
  if (!vault.getAbstractFileByPath(folder)) await vault.createFolder(folder);
  for (const day of REFERENCE_PROGRAM) {
    const path = normalizePath(`${folder}/${programNoteName(day)}.md`);
    if (vault.getAbstractFileByPath(path)) {
      result.skipped++;
      continue;
    }
    await vault.create(path, programNoteContent(day, lang));
    result.created++;
  }
  return result;
}
