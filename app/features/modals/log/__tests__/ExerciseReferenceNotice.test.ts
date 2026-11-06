import { referenceNoticeLines } from "@app/features/modals/log/ExerciseReferenceNotice";
import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";

jest.mock("@app/i18n", () => ({
  t: (key: string, params?: Record<string, unknown>) =>
    params
      ? `${key}(${Object.entries(params).map(([k, v]) => `${k}=${String(v)}`).join(",")})`
      : key,
}));

const page = (extra: Partial<ExercisePage>): ExercisePage => ({
  file: {} as ExercisePage["file"],
  names: ["x"],
  tags: [],
  parameters: [],
  neckWarning: false,
  jerkWarning: false,
  equipment: [],
  ...extra,
});

describe("referenceNoticeLines", () => {
  it("says nothing without a page or without reference data", () => {
    expect(referenceNoticeLines(undefined)).toEqual([]);
    expect(referenceNoticeLines(page({}))).toEqual([]);
  });

  it("lists rank, warnings and equipment", () => {
    expect(
      referenceNoticeLines(
        page({ tier: 4, neckWarning: true, jerkWarning: true, equipment: ["band", "sofa"] }),
      ),
    ).toEqual([
      "reference.notice.tier(tier=reference.notice.tier4)",
      "reference.notice.neck",
      "reference.notice.jerk",
      "reference.notice.equipment(items=reference.notice.band, sofa)",
    ]);
  });
});
