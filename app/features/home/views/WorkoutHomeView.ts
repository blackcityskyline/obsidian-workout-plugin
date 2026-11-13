import { Component, ItemView, MarkdownRenderer, TFile, WorkspaceLeaf, setIcon } from "obsidian";
import {
  HOME_SECTIONS,
  recentNotes,
  sectionMarkdown,
  sectionOrHome,
  type HomeSectionId,
} from "@app/features/home/business/homeSections";
import { dailyFolder, ensureDailyNote } from "@app/features/daycard/business/dailyCardNote";
import { localDay } from "@app/services/history/TrainingHistory";
import type { WorkoutPluginContext } from "@app/types/PluginPorts";
import { t } from "@app/i18n";

export const HOME_VIEW_TYPE = "workout-home";

/**
 * The home page: a left navigation and the page of the picked section. Every
 * section draws the plugin's own code blocks through the markdown renderer, so
 * it shows exactly what the same block shows in a note.
 */
export class WorkoutHomeView extends ItemView {
  private section: HomeSectionId = "home";
  private page: Component | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: WorkoutPluginContext,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return HOME_VIEW_TYPE;
  }

  getDisplayText(): string {
    return t("home.title");
  }

  getIcon(): string {
    // eslint-disable-next-line i18next/no-literal-string -- icon name
    return "layout-dashboard";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  getState(): Record<string, unknown> {
    return { section: this.section };
  }

  async setState(state: unknown, result: Parameters<ItemView["setState"]>[1]): Promise<void> {
    this.section = sectionOrHome((state as { section?: unknown } | null)?.section);
    await super.setState(state, result);
    await this.render();
  }

  private async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass("workout-home");
    this.drawNav(root.createEl("nav", { cls: "workout-home-nav" }));
    const main = root.createDiv({ cls: "workout-home-main" });
    this.drawHeader(main.createDiv({ cls: "workout-home-header" }));
    await this.drawPage(main.createDiv({ cls: "workout-home-page" }));
  }

  private drawNav(nav: HTMLElement): void {
    for (const section of HOME_SECTIONS) {
      const item = nav.createEl("button", { cls: "workout-home-nav-item" });
      item.toggleClass("is-active", section.id === this.section);
      setIcon(item.createSpan({ cls: "workout-home-nav-icon" }), section.icon);
      item.createSpan({ text: t(section.label) });
      item.addEventListener("click", () => {
        this.section = section.id;
        void this.render();
      });
    }
  }

  private drawHeader(header: HTMLElement): void {
    const current = HOME_SECTIONS.find((s) => s.id === this.section);
    header.createEl("h2", { cls: "workout-home-title", text: t(current?.label ?? "home.title") });
    const add = header.createEl("button", { cls: "workout-home-add mod-cta" });
    setIcon(add.createSpan({ cls: "workout-home-nav-icon" }), "plus");
    add.createSpan({ text: t("home.add") });
    add.addEventListener("click", () => this.plugin.createLogModalHandler.openModal());
  }

  private async drawPage(body: HTMLElement): Promise<void> {
    // A fresh component per page: the blocks of the previous page are unloaded with it
    if (this.page) this.removeChild(this.page);
    this.page = this.addChild(new Component());

    if (this.section === "diary") this.drawDiaryActions(body);
    const markdown = sectionMarkdown(this.section);
    if (markdown) await MarkdownRenderer.render(this.app, markdown, body.createDiv(), "", this.page);
    if (this.section === "diary") this.drawFiles(body, this.dailyNotes(), t("home.diaryNotes"));
    if (this.section === "notes") this.drawFiles(body, recentNotes(this.app.vault.getMarkdownFiles()), t("home.recent"));
  }

  private drawDiaryActions(body: HTMLElement): void {
    const open = body.createEl("button", { cls: "workout-home-action", text: t("home.today") });
    open.addEventListener("click", () => {
      void ensureDailyNote(this.plugin, localDay(new Date())).then(({ file }) =>
        this.app.workspace.getLeaf().openFile(file),
      );
    });
  }

  private dailyNotes(): TFile[] {
    const folder = `${dailyFolder(this.plugin.settings.exerciseFolderPath)}/`;
    return this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(folder))
      .sort((a, b) => b.basename.localeCompare(a.basename))
      .slice(0, 30);
  }

  private drawFiles(body: HTMLElement, files: TFile[], title: string): void {
    body.createEl("h3", { text: title });
    if (!files.length) {
      body.createDiv({ cls: "workout-home-empty", text: t("home.empty") });
      return;
    }
    const list = body.createDiv({ cls: "workout-home-files" });
    for (const file of files) {
      const row = list.createEl("button", { cls: "workout-home-file", text: file.basename });
      row.addEventListener("click", () => void this.app.workspace.getLeaf().openFile(file));
    }
  }
}
