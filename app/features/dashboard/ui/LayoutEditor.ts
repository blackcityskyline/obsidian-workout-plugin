import { Modal, App, setIcon } from "obsidian";
import { Button, BUTTONVARIANT } from "@app/components/atoms/Button";
import type { Placement } from "@app/features/dashboard/layout/gridLayout";
import {
  addWidget,
  removeWidget,
  reorder,
  resizeWidget,
} from "@app/features/dashboard/layout/layoutEdit";
import {
  minColumnsOf,
  widgetLabel,
} from "@app/features/dashboard/layout/dashboardGrid";
import { DASHBOARD_WIDGET_IDS } from "@app/features/dashboard/types";
import { t } from "@app/i18n";

/** What the editor needs to know about the dashboard it edits */
export interface LayoutEditorContext {
  app: App;
  /** The grid element, its direct children are the widgets (`data-widget`) */
  grid: HTMLElement;
  placements: Placement[];
  columns: number;
  /** The next placements: the caller saves and redraws */
  onChange: (placements: Placement[]) => void;
  /** Leave edit mode */
  onDone: () => void;
}

const ICON = {
  grip: "grip-vertical",
  up: "arrow-up",
  down: "arrow-down",
  narrower: "minimize-2",
  wider: "maximize-2",
  shorter: "chevrons-up",
  taller: "chevrons-down",
  remove: "trash-2",
  add: "plus",
} as const;

// How far a drag has to go to add one column / one row, relative to the widget
const MIN_STEP_PX = 24;

/**
 * Edits a dashboard on the page: a toolbar (done, add widget) and, on every
 * widget, a bar with a grip (drag it in front of another widget), earlier /
 * later, width and height, remove, and a corner to resize by dragging. Every
 * change is computed by layoutEdit.ts and handed to `onChange`.
 */
export class LayoutEditor {
  static render(ctx: LayoutEditorContext): void {
    LayoutEditor.toolbar(ctx);
    ctx.grid.addClass("is-editing");
    for (const el of Array.from(ctx.grid.children) as HTMLElement[]) {
      const id = el.dataset.widget;
      if (id) LayoutEditor.widgetBar(ctx, el, id);
    }
  }

  private static toolbar(ctx: LayoutEditorContext): void {
    const bar = createDiv({ cls: "workout-layout-toolbar" });
    ctx.grid.before(bar);
    const add = Button.create(bar, {
      text: t("dashboard.editMode.add"),
      icon: ICON.add,
      variant: BUTTONVARIANT.SECONDARY,
    });
    Button.onClick(add, () =>
      new AddWidgetModal(ctx.app, ctx.placements, (id) =>
        ctx.onChange(addWidget(ctx.placements, id, ctx.columns, minColumnsOf)),
      ).open(),
    );
    const done = Button.create(bar, {
      text: t("dashboard.editMode.done"),
      variant: BUTTONVARIANT.PRIMARY,
    });
    Button.onClick(done, ctx.onDone);
    bar.createSpan({ cls: "workout-layout-hint", text: t("dashboard.editMode.hint") });
  }

  private static widgetBar(
    ctx: LayoutEditorContext,
    el: HTMLElement,
    id: string,
  ): void {
    const cell = ctx.placements.find((p) => p.id === id);
    if (!cell) return;
    el.addClass("is-editable");
    const bar = createDiv({ cls: "workout-widget-edit" });
    el.prepend(bar);

    const grip = LayoutEditor.iconButton(bar, ICON.grip, t("dashboard.editMode.drag"));
    LayoutEditor.dragToReorder(ctx, grip, el, id);

    const order = ctx.placements
      .slice()
      .sort((a, b) => a.row - b.row || a.column - b.column);
    const index = order.findIndex((p) => p.id === id);
    const earlier = LayoutEditor.iconButton(bar, ICON.up, t("dashboard.editMode.earlier"));
    earlier.disabled = index <= 0;
    earlier.addEventListener("click", () =>
      ctx.onChange(reorder(ctx.placements, id, order[index - 1].id, ctx.columns)),
    );
    const later = LayoutEditor.iconButton(bar, ICON.down, t("dashboard.editMode.later"));
    later.disabled = index >= order.length - 1;
    later.addEventListener("click", () =>
      ctx.onChange(
        reorder(ctx.placements, id, order[index + 2]?.id ?? null, ctx.columns),
      ),
    );

    const resize = (dw: number, dh: number) =>
      ctx.onChange(
        resizeWidget(ctx.placements, id, cell.width + dw, cell.height + dh, ctx.columns, minColumnsOf),
      );
    LayoutEditor.iconButton(bar, ICON.narrower, t("dashboard.editMode.narrower")).addEventListener(
      "click",
      () => resize(-1, 0),
    );
    LayoutEditor.iconButton(bar, ICON.wider, t("dashboard.editMode.wider")).addEventListener(
      "click",
      () => resize(1, 0),
    );
    LayoutEditor.iconButton(bar, ICON.shorter, t("dashboard.editMode.shorter")).addEventListener(
      "click",
      () => resize(0, -1),
    );
    LayoutEditor.iconButton(bar, ICON.taller, t("dashboard.editMode.taller")).addEventListener(
      "click",
      () => resize(0, 1),
    );
    const remove = LayoutEditor.iconButton(bar, ICON.remove, t("dashboard.editMode.remove", { widget: widgetLabel(id) }));
    remove.addClass("is-danger");
    remove.addEventListener("click", () =>
      ctx.onChange(removeWidget(ctx.placements, id)),
    );

    LayoutEditor.cornerResize(ctx, el, id, cell, resize);
  }

  private static iconButton(
    parent: HTMLElement,
    icon: string,
    label: string,
  ): HTMLButtonElement {
    const btn = parent.createEl("button", {
      cls: "workout-widget-edit-btn clickable-icon",
      attr: { "aria-label": label, title: label, type: "button" },
    });
    setIcon(btn, icon);
    return btn;
  }

  /** Pointer drag of the grip: the widget under the pointer when released is the one to drop in front of */
  private static dragToReorder(
    ctx: LayoutEditorContext,
    grip: HTMLElement,
    el: HTMLElement,
    id: string,
  ): void {
    grip.addClass("is-grip");
    grip.addEventListener("pointerdown", (down) => {
      down.preventDefault();
      grip.setPointerCapture(down.pointerId);
      el.addClass("is-dragging");
      let target: HTMLElement | null = null;
      const move = (e: PointerEvent) => {
        const under = LayoutEditor.widgetAt(ctx.grid, e.clientX, e.clientY, el);
        if (under !== target) {
          target?.removeClass("is-drop-target");
          target = under;
          target?.addClass("is-drop-target");
        }
      };
      const end = (e: PointerEvent) => {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", end);
        grip.removeEventListener("pointercancel", end);
        grip.releasePointerCapture(e.pointerId);
        el.removeClass("is-dragging");
        target?.removeClass("is-drop-target");
        const before = target?.dataset.widget;
        if (before && e.type === "pointerup") {
          ctx.onChange(reorder(ctx.placements, id, before, ctx.columns));
        }
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", end);
      grip.addEventListener("pointercancel", end);
    });
  }

  private static widgetAt(
    grid: HTMLElement,
    x: number,
    y: number,
    except: HTMLElement,
  ): HTMLElement | null {
    for (const el of Array.from(grid.children) as HTMLElement[]) {
      if (el === except || !el.dataset.widget) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return el;
    }
    return null;
  }

  /** The corner handle: dragging it changes the widget's columns and rows */
  private static cornerResize(
    ctx: LayoutEditorContext,
    el: HTMLElement,
    id: string,
    cell: Placement,
    resize: (dw: number, dh: number) => void,
  ): void {
    const handle = el.createDiv({
      cls: "workout-widget-resize-handle",
      attr: { "aria-hidden": "true" },
    });
    handle.addEventListener("pointerdown", (down) => {
      down.preventDefault();
      handle.setPointerCapture(down.pointerId);
      const rect = el.getBoundingClientRect();
      const stepX = Math.max(MIN_STEP_PX, rect.width / cell.width);
      const stepY = Math.max(MIN_STEP_PX, rect.height / cell.height);
      const delta = (e: PointerEvent) => ({
        dw: Math.round((e.clientX - down.clientX) / stepX),
        dh: Math.round((e.clientY - down.clientY) / stepY),
      });
      const end = (e: PointerEvent) => {
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        handle.releasePointerCapture(e.pointerId);
        const { dw, dh } = delta(e);
        if (e.type === "pointerup" && (dw !== 0 || dh !== 0)) resize(dw, dh);
      };
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    });
  }
}

/** The widgets that are not on the dashboard, one tap adds one */
class AddWidgetModal extends Modal {
  constructor(
    app: App,
    private placements: Placement[],
    private onPick: (id: string) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(t("dashboard.editMode.addTitle"));
    const free = DASHBOARD_WIDGET_IDS.filter(
      (id) => !this.placements.some((p) => p.id === id),
    );
    if (free.length === 0) {
      this.contentEl.createEl("p", { text: t("dashboard.editMode.allPlaced") });
      return;
    }
    const list = this.contentEl.createDiv({ cls: "workout-widget-catalog" });
    for (const id of free) {
      const item = list.createEl("button", {
        cls: "workout-widget-catalog-item",
        text: widgetLabel(id),
      });
      item.addEventListener("click", () => {
        this.onPick(id);
        this.close();
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
