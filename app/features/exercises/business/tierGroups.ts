import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";

/** Best first; 0 is "not ranked yet", always last */
export const TIER_ORDER = [5, 4, 3, 2, 0] as const;

export interface TierFilter {
  category?: string;
  muscle?: string;
  minTier?: number;
  hideWarned?: boolean;
}

export interface TierGroup {
  /** 5 Best … 2 Better, 0 = not ranked */
  tier: number;
  pages: ExercisePage[];
}

/** True when the page carries a neck, spine or jerk warning */
export function isWarned(page: ExercisePage): boolean {
  return page.neckWarning || page.jerkWarning || page.spineWarning;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Whether the page passes the filter; an unranked page fails any `minTier` */
export function matchesFilter(page: ExercisePage, filter: TierFilter): boolean {
  if (filter.category && !(page.category && same(page.category, filter.category))) return false;
  if (filter.muscle && !page.tags.some((tag) => same(tag, filter.muscle as string))) return false;
  if (filter.minTier !== undefined && (page.tier ?? 0) < filter.minTier) return false;
  if (filter.hideWarned && isWarned(page)) return false;
  return true;
}

/**
 * The one grouping of exercise pages by tier: best tier first, unranked last,
 * names in alphabetical order inside a group, empty groups left out.
 */
export function tierGroups(pages: readonly ExercisePage[], filter: TierFilter = {}): TierGroup[] {
  const kept = pages.filter((page) => matchesFilter(page, filter));
  return TIER_ORDER.map((tier) => ({
    tier,
    pages: kept
      .filter((page) => (page.tier ?? 0) === tier)
      .sort((a, b) => a.names[0].localeCompare(b.names[0])),
  })).filter((group) => group.pages.length > 0);
}

/** The categories the pages declare, in alphabetical order */
export function categoriesOf(pages: readonly ExercisePage[]): string[] {
  const found = new Set<string>();
  for (const page of pages) if (page.category) found.add(page.category);
  return [...found].sort();
}
