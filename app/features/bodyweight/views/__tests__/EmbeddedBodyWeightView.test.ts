/** @jest-environment jsdom */

import { EmbeddedBodyWeightView } from "@app/features/bodyweight/views/EmbeddedBodyWeightView";
import { BodyWeightLog, type BodyWeightStorage } from "@app/services/body/BodyWeightFile";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { localDay } from "@app/services/history/TrainingHistory";
import { createObsidianContainer } from "@app/components/__tests__/obsidianDomMocks";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import { ChartRenderer } from "@app/features/charts/components/ChartRenderer";
import { t } from "@app/i18n";

class MemoryStorage implements BodyWeightStorage {
  text: string | null = null;
  async read() {
    return this.text;
  }
  async write(content: string) {
    this.text = content;
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(params: Record<string, unknown> = {}) {
  const eventBus = new WorkoutEventBus();
  const settings = { weightUnit: "kg" as const };
  const log = new BodyWeightLog(new MemoryStorage(), settings, eventBus);
  const plugin = {
    eventBus,
    settings,
    getBodyWeightLog: () => log,
  } as unknown as WorkoutPluginContext;
  const container = createObsidianContainer();
  const child = new EmbeddedBodyWeightView(plugin).createBodyWeight(container, {
    dateRange: 90,
    ...params,
  } as never);
  child.load();
  return { log, container, child };
}

describe("EmbeddedBodyWeightView", () => {
  it("shows the empty state before the first weigh-in", async () => {
    const { container } = setup();
    await flush();
    expect(container.textContent).toContain(t("bodyWeight.empty"));
    expect(container.textContent).toContain(t("bodyWeight.title"));
  });

  it("redraws when a weigh-in is logged and lists it", async () => {
    const { container, log } = setup();
    await flush();
    await log.set(localDay(new Date()), 78.4);
    await flush();
    expect(container.textContent).not.toContain(t("bodyWeight.empty"));
    expect(container.textContent).toContain("78.4 kg");
  });

  it("stops listening once unloaded", async () => {
    const { container, log, child } = setup();
    await flush();
    child.unload();
    await log.set(localDay(new Date()), 70);
    await flush();
    expect(container.textContent).not.toContain("70 kg");
  });

  describe("chart", () => {
    const day = (ago: number) => {
      const d = new Date();
      d.setDate(d.getDate() - ago);
      return localDay(d);
    };
    let render: jest.SpyInstance;
    beforeEach(() => {
      render = jest.spyOn(ChartRenderer, "renderChart").mockReturnValue(true);
    });
    afterEach(() => render.mockRestore());

    it("draws the period's weights with a trend line once there are two weigh-ins", async () => {
      const { log } = setup();
      await flush();
      await log.set(day(5), 80);
      await flush();
      expect(render).not.toHaveBeenCalled();
      await log.set(day(0), 79);
      await flush();
      expect(render).toHaveBeenCalledTimes(1);
      const [, labels, datasets] = render.mock.calls[0];
      expect(labels).toEqual([day(5), day(0)]);
      expect(datasets[0].data).toEqual([80, 79]);
      expect(datasets).toHaveLength(2);
    });

    it("leaves out the trend line or the whole chart when the block says so", async () => {
      const noTrend = setup({ showTrendLine: false });
      await flush();
      await noTrend.log.set(day(5), 80);
      await noTrend.log.set(day(0), 79);
      await flush();
      expect(render.mock.calls.at(-1)?.[2]).toHaveLength(1);

      render.mockClear();
      const noChart = setup({ showChart: false });
      await flush();
      await noChart.log.set(day(5), 80);
      await noChart.log.set(day(0), 79);
      await flush();
      expect(render).not.toHaveBeenCalled();
    });

    it("keeps one chart id across redraws", async () => {
      const { log, container } = setup();
      await flush();
      await log.set(day(5), 80);
      await log.set(day(0), 79);
      await flush();
      const first = render.mock.calls[0][0].id;
      await log.set(day(1), 79.5);
      await flush();
      expect(render.mock.calls.at(-1)?.[0].id).toBe(first);
      expect(first).toMatch(/^workout-bodyweight-chart-/);
      expect(container.querySelectorAll(`[id="${first}"]`).length).toBe(1);
    });
  });
});
