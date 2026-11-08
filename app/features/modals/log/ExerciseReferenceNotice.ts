import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";
import { t } from "@app/i18n";

const TIER_KEYS: Record<number, string> = {
  2: "reference.notice.tier2",
  3: "reference.notice.tier3",
  4: "reference.notice.tier4",
  5: "reference.notice.tier5",
};

/** The lines the exercise page tells about itself: rank, warnings, equipment */
export function referenceNoticeLines(page: ExercisePage | undefined): string[] {
  if (!page) return [];
  const lines: string[] = [];
  if (page.tier !== undefined) {
    lines.push(
      t("reference.notice.tier", { tier: t(TIER_KEYS[page.tier]) }),
    );
  }
  if (page.neckWarning) lines.push(t("reference.notice.neck"));
  if (page.jerkWarning) lines.push(t("reference.notice.jerk"));
  if (page.spineWarning) lines.push(t("reference.notice.spine"));
  if (page.equipment.length > 0) {
    const items = page.equipment.map((item) =>
      item === "band" || item === "bar"
        ? t(`reference.notice.${item}`)
        : item,
    );
    lines.push(t("reference.notice.equipment", { items: items.join(", ") }));
  }
  return lines;
}

/** Draws the exercise's reference lines into `container`, replacing what was there */
export function renderReferenceNotice(
  container: HTMLElement,
  page: ExercisePage | undefined,
): void {
  container.empty();
  const lines = referenceNoticeLines(page);
  container.classList.toggle("is-empty", lines.length === 0);
  for (const line of lines) container.createDiv({ text: line });
}
