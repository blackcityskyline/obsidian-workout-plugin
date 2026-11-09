import { MarkdownRenderChild } from "obsidian";
import { BaseView } from "@app/features/common/views/BaseView";
import { BlockCard } from "@app/components/molecules/BlockCard";
import { ChipGroup } from "@app/components/molecules/ChipGroup";
import { categoriesOf, tierGroups } from "@app/features/exercises/business/tierGroups";
import type { ExercisePage } from "@app/services/exercise/ExerciseLibrary";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import type { EmbeddedExercisesParams } from "@app/features/exercises/exercisesBlock";
import { t } from "@app/i18n";

const TIER_KEYS: Record<number, string> = {
  5: "reference.notice.tier5",
  4: "reference.notice.tier4",
  3: "reference.notice.tier3",
  2: "reference.notice.tier2",
  1: "reference.notice.tier1",
};

/** The `workout-exercises` block: the exercise pages grouped by ranking tier, best first */
export class EmbeddedExercisesView extends BaseView {
  createExercises(container: HTMLElement, params: EmbeddedExercisesParams, sourcePath: string): MarkdownRenderChild {
    return this.track(new ExercisesRenderChild(container, this.plugin, params, sourcePath));
  }
}

class ExercisesRenderChild extends MarkdownRenderChild {
  /** The category chip picked; "" = all. Kept across redraws */
  private category = "";

  constructor(
    container: HTMLElement,
    private plugin: WorkoutPluginContext,
    private params: EmbeddedExercisesParams,
    private sourcePath: string,
  ) {
    super(container);
  }

  onload(): void {
    // A page's rank or warning can change in its frontmatter; the library follows the metadata cache
    this.registerEvent(this.plugin.app.metadataCache.on("changed", () => this.render()));
    this.register(this.plugin.eventBus.on("settings:changed", () => this.render()));
    this.render();
  }

  private render(): void {
    const pages = this.plugin.getExerciseLibrary().pages();
    const root = this.containerEl;
    root.empty();
    const category = this.params.category ?? (this.category || undefined);
    const groups = tierGroups(pages, {
      category,
      muscle: this.params.muscle,
      minTier: this.params.minTier,
      hideWarned: this.params.hideWarned,
    });
    const total = groups.reduce((n, group) => n + group.pages.length, 0);
    const card = BlockCard.create(root, {
      title: this.params.title ?? t("exercises.title"),
      meta: t("exercises.count", { count: String(total) }),
      className: "workout-exercises",
    });

    // A block that names its category keeps it; otherwise the chips pick one
    const categories = categoriesOf(pages);
    if (this.params.category === undefined && categories.length > 1) {
      ChipGroup.create(card.el, {
        label: t("exercises.category"),
        options: [{ id: "", label: t("exercises.all") }, ...categories.map((id) => ({ id, label: capitalize(id) }))],
        selected: this.category,
        onPick: (id) => {
          this.category = id;
          this.render();
        },
        focusKeyPrefix: "exercises-category",
      });
    }

    if (groups.length === 0) {
      card.el.createDiv({ cls: "workout-exercises-empty", text: t("exercises.empty") });
      return;
    }
    for (const group of groups) {
      const section = card.el.createDiv({ cls: "workout-exercises-tier" });
      section.createEl("h4", {
        cls: `workout-exercises-tier-title workout-exercises-tier-${group.tier}`,
        text: group.tier ? `${group.tier > 1 ? "★" : "✕"} ${t(TIER_KEYS[group.tier])}` : t("exercises.unranked"),
      });
      const list = section.createDiv({ cls: "workout-exercises-list" });
      for (const page of group.pages) this.drawRow(list, page);
    }
  }

  private drawRow(list: HTMLElement, page: ExercisePage): void {
    const row = list.createDiv({ cls: "workout-exercises-row" });
    const name = row.createEl("a", { cls: "workout-exercises-name", text: page.names[0], href: "#" });
    name.addEventListener("click", (event) => {
      event.preventDefault();
      void this.plugin.app.workspace.openLinkText(page.file.path, this.sourcePath, false);
    });

    const kinds = [
      page.spineWarning && t("exercises.warning.spine"),
      page.neckWarning && t("exercises.warning.neck"),
      page.jerkWarning && t("exercises.warning.jerk"),
    ].filter((kind): kind is string => typeof kind === "string");
    if (kinds.length > 0) {
      row.createSpan({
        cls: "workout-exercises-warning",
        text: `⚠ ${kinds.join(", ")}`,
        attr: { "aria-label": t("exercises.warningLabel", { kinds: kinds.join(", ") }) },
      });
    }

    const muscles = page.tags.filter((tag) => tag !== page.category).map((tag) => tag.replace(/_/g, " "));
    if (muscles.length > 0) row.createSpan({ cls: "workout-exercises-muscles", text: muscles.join(", ") });
    if (page.equipment.length > 0) {
      row.createSpan({ cls: "workout-exercises-equipment", text: t("exercises.equipment", { items: page.equipment.join(", ") }) });
    }
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
