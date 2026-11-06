/** @jest-environment jsdom */

import { EmbeddedBodyWeightView } from "@app/features/bodyweight/views/EmbeddedBodyWeightView";
import { BodyWeightLog, type BodyWeightStorage } from "@app/services/body/BodyWeightFile";
import { WorkoutEventBus } from "@app/services/events/WorkoutEventBus";
import { localDay } from "@app/services/history/TrainingHistory";
import { createObsidianContainer } from "@app/components/__tests__/obsidianDomMocks";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
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

function setup() {
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
  });
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
});
