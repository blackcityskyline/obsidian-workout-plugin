import {
  autoPack,
  moveTo,
  placeFirstFree,
  readingOrder,
  resizeTo,
  type Placement,
} from "@app/features/dashboard/layout/gridLayout";

/*
 * What editing a dashboard on the page does to its grid: each operation takes
 * the placements and gives the next ones (the rules stay in gridLayout.ts).
 * Pure: the on-page editor only calls these.
 */

type Size = { width: number; height: number };

/** The size a widget gets when it is added: its minimum width, one row */
export function defaultSize(minColumns: number, columns: number): Size {
  return { width: Math.min(Math.max(1, minColumns), columns), height: 1 };
}

/** A list dashboard as a grid: the widgets in order, each in the first cells that fit */
export function listToGrid(
  ids: string[],
  columns: number,
  minColumns: (id: string) => number,
): Placement[] {
  return autoPack(
    ids.map((id) => ({ id, ...defaultSize(minColumns(id), columns) })),
    columns,
  );
}

export function removeWidget(placements: Placement[], id: string): Placement[] {
  return placements.filter((p) => p.id !== id);
}

/** A widget added after the others, in the first cells that fit */
export function addWidget(
  placements: Placement[],
  id: string,
  columns: number,
  minColumns: (id: string) => number,
): Placement[] {
  if (placements.some((p) => p.id === id)) return placements;
  return placeFirstFree(
    placements,
    { id, ...defaultSize(minColumns(id), columns) },
    columns,
  );
}

/** One cell in a direction; the same grid when the cell is not free */
export function nudge(
  placements: Placement[],
  id: string,
  dColumn: number,
  dRow: number,
  columns: number,
): Placement[] {
  const current = placements.find((p) => p.id === id);
  if (!current) return placements;
  return (
    moveTo(
      placements,
      id,
      current.column + dColumn,
      current.row + dRow,
      columns,
    ) ?? placements
  );
}

/**
 * A widget of a new size in the same place; when it would not fit there the
 * widgets are packed again in reading order with the new size
 */
export function resizeWidget(
  placements: Placement[],
  id: string,
  width: number,
  height: number,
  columns: number,
  minColumns: (id: string) => number,
): Placement[] {
  const w = Math.max(Math.min(minColumns(id), columns), Math.min(width, columns));
  const h = Math.max(1, height);
  const direct = resizeTo(placements, id, w, h, columns, minColumns);
  if (direct) return direct;
  const resized = placements.map((p) =>
    p.id === id ? { ...p, width: w, height: h } : p,
  );
  return autoPack(readingOrder(resized), columns);
}

/**
 * Drops a widget in front of another (or last with `beforeId` null): the
 * order of the widgets changes and they are packed again
 */
export function reorder(
  placements: Placement[],
  id: string,
  beforeId: string | null,
  columns: number,
): Placement[] {
  const order = readingOrder(placements);
  const moving = order.find((p) => p.id === id);
  if (!moving || id === beforeId) return placements;
  const rest = order.filter((p) => p.id !== id);
  const at = beforeId ? rest.findIndex((p) => p.id === beforeId) : -1;
  rest.splice(at < 0 ? rest.length : at, 0, moving);
  return autoPack(rest, columns);
}
