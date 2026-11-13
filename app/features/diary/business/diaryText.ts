import { t } from "@app/i18n";

/** The heading of the diary section in a day's page */
export function diaryHeading(): string {
  return `## ${t("diary.heading")}`;
}

function bounds(lines: string[]): { at: number; end: number } | null {
  const heading = diaryHeading();
  const at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) return null;
  let end = at + 1;
  while (end < lines.length && !lines[end].startsWith("## ")) end++;
  return { at, end };
}

/** The diary text of a day's page ("" when there is none) */
export function readDiary(content: string): string {
  const lines = content.split(/\r?\n/);
  const b = bounds(lines);
  if (!b) return "";
  return lines.slice(b.at + 1, b.end).join("\n").trim();
}

/** The page with its diary section set to `text` (the section is added at the end when missing) */
export function withDiary(content: string, text: string): string {
  const lines = content.split("\n");
  const body = text.trim();
  const b = bounds(lines);
  if (!b) {
    if (!body) return content;
    return [content.replace(/\s*$/, ""), "", diaryHeading(), "", body, ""].join("\n");
  }
  const section = body ? ["", body, ""] : [""];
  lines.splice(b.at + 1, b.end - b.at - 1, ...section);
  return lines.join("\n");
}
