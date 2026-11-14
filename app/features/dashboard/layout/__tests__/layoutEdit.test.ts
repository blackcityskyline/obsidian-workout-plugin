import {
  addWidget,
  listToGrid,
  nudge,
  removeWidget,
  reorder,
  resizeWidget,
} from "@app/features/dashboard/layout/layoutEdit";
import { gridProblems } from "@app/features/dashboard/layout/gridLayout";

const min = (id: string) => (id === "wide" ? 2 : 1);

describe("layoutEdit", () => {
  it("turns a list into a grid without overlaps", () => {
    const grid = listToGrid(["a", "wide", "b"], 3, min);
    expect(gridProblems(grid, 3, min)).toEqual([]);
    expect(grid.find((p) => p.id === "wide")?.width).toBe(2);
  });
  it("adds a widget once in a free spot and removes it", () => {
    const base = listToGrid(["a"], 2, min);
    const added = addWidget(base, "b", 2, min);
    expect(added).toHaveLength(2);
    expect(addWidget(added, "b", 2, min)).toHaveLength(2);
    expect(removeWidget(added, "a").map((p) => p.id)).toEqual(["b"]);
  });
  it("nudges into free cells only", () => {
    const grid = listToGrid(["a", "b"], 3, min); // a at 1,1 b at 2,1
    expect(nudge(grid, "a", 1, 0, 3)).toEqual(grid);
    const moved = nudge(grid, "b", 1, 0, 3);
    expect(moved.find((p) => p.id === "b")?.column).toBe(3);
  });
  it("resizes in place, or packs again when it would collide", () => {
    const grid = listToGrid(["a", "b"], 3, min);
    const wider = resizeWidget(grid, "a", 2, 1, 3, min);
    expect(gridProblems(wider, 3, min)).toEqual([]);
    expect(wider.find((p) => p.id === "a")?.width).toBe(2);
    expect(resizeWidget(grid, "wide", 1, 1, 3, min)).toEqual(grid); // not on the grid
    const narrow = resizeWidget(listToGrid(["wide"], 3, min), "wide", 1, 1, 3, min);
    expect(narrow[0].width).toBe(2); // never below its minimum
  });
  it("reorders by dropping in front of another widget", () => {
    const grid = listToGrid(["a", "b", "c"], 1, min);
    const next = reorder(grid, "c", "a", 1);
    expect(next.map((p) => p.id)).toEqual(["c", "a", "b"]);
    expect(reorder(grid, "a", null, 1).map((p) => p.id)).toEqual(["b", "c", "a"]);
    expect(gridProblems(next, 1, min)).toEqual([]);
  });
});
