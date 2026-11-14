import { homeParams, layoutFromParams, HOME_START_WIDGETS } from "@app/features/home/business/homeLayout";

describe("homeLayout", () => {
  it("starts with the default widgets as a list", () => {
    expect(homeParams(null)).toEqual({ widgets: [...HOME_START_WIDGETS] });
  });
  it("round-trips a saved grid", () => {
    const layout = {
      columns: 3,
      cells: { summary: { column: 1, row: 1, width: 3, height: 1 }, volume: { column: 1, row: 2, width: 2, height: 2 } },
    };
    const params = homeParams(layout);
    expect(params.layout).toBe("grid");
    expect(params["grid.volume"]).toEqual(layout.cells.volume);
    expect(layoutFromParams(params)).toEqual(layout);
  });
  it("drops widgets removed in the editor", () => {
    const layout = layoutFromParams({ columns: 2, "grid.summary": { column: 1, row: 1, width: 2, height: 1 }, "grid.volume": undefined });
    expect(Object.keys(layout.cells)).toEqual(["summary"]);
  });
});
