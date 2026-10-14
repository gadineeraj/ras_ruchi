"use client";

// The Studio's chrome around the editor: top bar, block toolbar, the
// "+ Add section" seam, the fields header, and the canvas frame.
import { ActionBar, createUsePuck, useGetPuck } from "@puckeditor/core";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { DeviceMobileIcon } from "@phosphor-icons/react/dist/ssr/DeviceMobile";
import { DeviceTabletIcon } from "@phosphor-icons/react/dist/ssr/DeviceTablet";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { RocketIcon } from "@phosphor-icons/react/dist/ssr/Rocket";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { blocks } from "@/blocks/config";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BlockIcon } from "./icons";
import { ROOT_ZONE, insertTarget, moveSelected, zoneItems } from "./puck-utils";
import { useStudio } from "./state";
import { Button, Dialog, IconButton, Kbd, Menu, type MenuItem } from "./ui";
import st from "./studio.module.css";
import ui from "./ui.module.css";

const usePuck = createUsePuck();

export const VIEWPORTS = [
  { width: 1440, height: "auto" as const, label: "Desktop", icon: "Monitor" as const },
  { width: 768, height: "auto" as const, label: "Tablet", icon: "Tablet" as const },
  { width: 390, height: "auto" as const, label: "Phone", icon: "Smartphone" as const },
];

const blockLabel = (type: string) => (blocks as Record<string, { label?: string }>)[type]?.label ?? type;
const blockDescription = (type: string) => (blocks as Record<string, { description?: string }>)[type]?.description ?? "";

/** Opens one of the left-rail panels. */
export function useOpenPanel() {
  const getPuck = useGetPuck();
  return (name: string) => getPuck().dispatch({ type: "setUi", ui: { plugin: { current: name }, leftSideBarVisible: true } });
}

// ----------------------------------------------------------------- top bar

function SaveState() {
  const { save, flush } = useStudio();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(t);
  }, []);
  const ago = save.savedAt ? Math.max(0, Math.round((now - save.savedAt) / 1000)) : null;
  const text =
    save.state === "error"
      ? "Couldn't save · retry"
      : save.state === "saving"
        ? "Saving"
        : save.state === "waiting"
          ? "Saving soon"
          : ago === null
            ? "All saved"
            : ago < 50
              ? "Saved just now"
              : `Saved ${Math.round(ago / 60) || 1} min ago`;
  return (
    <button type="button" className={st.saveState} data-state={save.state} onClick={() => save.state === "error" && void flush()} title={save.error ?? "Every change saves itself as you work."} aria-live="polite">
      <i aria-hidden="true" />
      {text}
    </button>
  );
}

function PagePicker() {
  const { pageList, currentId, openPage, current } = useStudio();
  const openPanel = useOpenPanel();
  const items: MenuItem[] = [
    ...pageList.filter((p) => p.kind === "page" && p.id !== "not-found").map((p) => ({ label: p.title, title: true, onSelect: () => openPage(p.id) })),
    "divider" as const,
    { label: "All pages, collections and studies…", onSelect: () => openPanel("pages") },
  ];
  return (
    <Menu
      label="Pages"
      items={items}
      trigger={(t) => (
        <button type="button" className={st.pagePicker} {...t} title="Choose a page to edit">
          <span>{pageList.find((p) => p.id === currentId)?.title ?? "Page"}</span>
          {current.root.props.draft ? <em className={st.draftTag}>Draft</em> : null}
          <CaretDownIcon size={14} />
        </button>
      )}
    />
  );
}

function Devices() {
  const width = usePuck((s) => s.appState.ui.viewports.current.width);
  const dispatch = usePuck((s) => s.dispatch);
  const icons = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: DeviceMobileIcon } as const;
  return (
    <div className={st.devices} role="group" aria-label="Screen size">
      {VIEWPORTS.map((v) => {
        const I = icons[v.label as keyof typeof icons];
        return (
          <button
            key={v.label}
            type="button"
            aria-pressed={width === v.width}
            title={`See the page on a ${v.label.toLowerCase()} (${v.width} wide)`}
            onClick={() => dispatch({ type: "setUi", ui: { viewports: { current: { width: v.width, height: "auto" }, controlsVisible: false, options: VIEWPORTS } } })}
          >
            <I size={17} />
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function UndoRedo() {
  const hasPast = usePuck((s) => s.history.hasPast);
  const hasFuture = usePuck((s) => s.history.hasFuture);
  const back = usePuck((s) => s.history.back);
  const forward = usePuck((s) => s.history.forward);
  return (
    <>
      <IconButton label="Undo (Cmd Z)" icon={<ArrowCounterClockwiseIcon size={18} />} disabled={!hasPast} onClick={back} />
      <IconButton label="Redo (Shift Cmd Z)" icon={<ArrowClockwiseIcon size={18} />} disabled={!hasFuture} onClick={forward} />
    </>
  );
}

export function TopBar() {
  const { content, current, flush, setDialog } = useStudio();
  const preview = async () => {
    await flush();
    const path = current.root.props.path === "/not-found" ? "/this-page-does-not-exist" : current.root.props.path;
    window.open(path.endsWith("/") ? path : `${path}/`, "_blank", "noopener");
  };
  return (
    <header className={`${ui.root} ${st.topbar}`}>
      <div className={st.topLeft}>
        <div className={st.brand}>
          <strong>{content.site.name}</strong>
          <span className={ui.caps + " " + st.hideSmall}>Studio</span>
        </div>
        <PagePicker />
      </div>
      <div className={st.topCenter}>
        <UndoRedo />
        <span className={st.divider} aria-hidden="true" />
        <Devices />
      </div>
      <div className={st.topRight}>
        <SaveState />
        <Button variant="ghost" className={st.hideSmall} icon={<MagnifyingGlassIcon size={17} />} onClick={() => setDialog("palette")} title="Find a page, block or action (Cmd K)">
          <span className={st.hideNarrow}>Find</span>
        </Button>
        <Button className={st.hideSmall} icon={<ArrowSquareOutIcon size={17} />} onClick={preview} title="Open this page in a new tab, as visitors will see it">
          Preview
        </Button>
        <Button variant="primary" icon={<RocketIcon size={17} />} onClick={() => setDialog("publish")}>
          Publish
        </Button>
      </div>
    </header>
  );
}

// ------------------------------------------------------------- action bar

export function StudioActionBar({ label, children, parentAction }: { label?: string; children: ReactNode; parentAction: ReactNode }) {
  const getPuck = useGetPuck();
  const selected = usePuck((s) => s.selectedItem);
  const hidden = Boolean(selected?.props?.layout?.hidden);
  const toggleHidden = () => {
    const api = getPuck();
    const sel = api.appState.ui.itemSelector;
    const item = api.selectedItem;
    if (!sel?.zone || !item) return;
    const layout = { ...(item.props.layout ?? {}), hidden: !hidden };
    api.dispatch({ type: "replace", destinationIndex: sel.index, destinationZone: sel.zone, data: { ...item, props: { ...item.props, layout } } });
  };
  return (
    <ActionBar label={label}>
      <ActionBar.Group>{parentAction}</ActionBar.Group>
      <ActionBar.Group>
        <ActionBar.Action label="Move up" onClick={() => moveSelected(getPuck() as never, -1)}>
          <ArrowUpIcon size={15} />
        </ActionBar.Action>
        <ActionBar.Action label="Move down" onClick={() => moveSelected(getPuck() as never, 1)}>
          <ArrowDownIcon size={15} />
        </ActionBar.Action>
        <ActionBar.Action label={hidden ? "Show on the site" : "Hide from the site"} onClick={toggleHidden} active={hidden}>
          {hidden ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
        </ActionBar.Action>
        {children}
      </ActionBar.Group>
    </ActionBar>
  );
}

// --------------------------------------------------- overlay with "+ Add"

export function StudioOverlay({ children, hover, isSelected, componentId }: { children: ReactNode; hover: boolean; isSelected: boolean; componentId: string; componentType: string }) {
  const { openGallery } = useStudio();
  const getPuck = useGetPuck();
  const hidden = usePuck((s) => {
    const sel = s.getSelectorForId(componentId);
    return sel ? Boolean(s.getItemBySelector(sel)?.props?.layout?.hidden) : false;
  });
  const show = hover || isSelected;
  const add = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sel = getPuck().getSelectorForId(componentId);
    if (sel) openGallery({ zone: sel.zone, index: sel.index + 1 });
  };
  const zone = show ? getPuck().getSelectorForId(componentId)?.zone : undefined;
  return (
    <>
      {children}
      {hidden ? (
        <span className={st.hiddenBadge}>
          <EyeSlashIcon size={12} /> Hidden from the site
        </span>
      ) : null}
      {show && zone ? (
        <button type="button" className={st.insert} data-small={zone !== ROOT_ZONE || undefined} onClick={add} onPointerDown={(e) => e.stopPropagation()}>
          <PlusIcon size={14} weight="bold" />
          {zone === ROOT_ZONE ? "Add section" : "Add here"}
        </button>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------- fields head

export function FieldsPanel({ children, itemSelector }: { children: ReactNode; isLoading: boolean; itemSelector?: { index: number; zone?: string } | null }) {
  const selected = usePuck((s) => s.selectedItem);
  const getPuck = useGetPuck();
  const { current } = useStudio();
  // Content first; Layout holds width, spacing, screens and entrance.
  const [tabFor, setTabFor] = useState<{ id: string; tab: "content" | "layout" }>({ id: "", tab: "content" });
  const selectedId = (selected?.props?.id as string | undefined) ?? "";
  const tab = tabFor.id === selectedId ? tabFor.tab : "content";
  const hasLayout = Boolean(selected && (blocks as Record<string, { fields?: Record<string, unknown> }>)[selected.type]?.fields?.layout);
  const crumbs = useMemo(() => {
    if (!itemSelector?.zone || !selected) return [];
    const out: { id: string; label: string }[] = [];
    let zone = itemSelector.zone;
    while (zone && zone !== ROOT_ZONE) {
      const parentId = zone.slice(0, zone.indexOf(":"));
      const api = getPuck();
      const sel = api.getSelectorForId(parentId);
      const parent = sel ? api.getItemBySelector(sel) : undefined;
      if (!parent || !sel) break;
      out.unshift({ id: parentId, label: blockLabel(parent.type) });
      zone = sel.zone;
    }
    return out;
  }, [itemSelector, selected, getPuck]);

  const selectParent = (id: string) => {
    const sel = getPuck().getSelectorForId(id);
    if (sel) getPuck().dispatch({ type: "setUi", ui: { itemSelector: sel } });
  };

  return (
    <div className={ui.root}>
      <div className={st.fieldsHead}>
        {selected ? (
          <>
            <nav className={st.crumbs} aria-label="Where this block sits">
              <button type="button" onClick={() => getPuck().dispatch({ type: "setUi", ui: { itemSelector: null } })}>
                {current.root.props.title}
              </button>
              {crumbs.map((c) => (
                <span key={c.id} className={st.crumb}>
                  <CaretRightIcon size={11} aria-hidden="true" />
                  <button type="button" onClick={() => selectParent(c.id)}>
                    {c.label}
                  </button>
                </span>
              ))}
            </nav>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BlockIcon name={selected.type} size={18} />
              {blockLabel(selected.type)}
            </h2>
            <p>{blockDescription(selected.type)}</p>
            {hasLayout ? (
              <div className={st.tabs} role="tablist" aria-label="Settings">
                {(["content", "layout"] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTabFor({ id: selectedId, tab: t })}>
                    {t === "content" ? "Content" : "Layout"}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h2>Page settings</h2>
            <p>The page&rsquo;s name, web address and how it appears in search and when shared. Click any block on the page to change it instead.</p>
          </>
        )}
      </div>
      <div className={st.fieldsBody} data-tab={selected && hasLayout ? tab : undefined} role={selected && hasLayout ? "tabpanel" : undefined}>
        {children}
        {selected ? <p className={st.fieldsTip}>Words on the page can be edited right there: click them and type.</p> : null}
      </div>
    </div>
  );
}

// --------------------------------------------------------- canvas framing

/** The page as visitors see it, with the shared header and footer, and room to add more. */
export function StudioCanvasRoot({ children }: { children: ReactNode }) {
  const { content, openGallery } = useStudio();
  const getPuck = useGetPuck();
  const empty = usePuck((s) => s.appState.data.content.length === 0);
  const openPanel = useOpenPanel();
  const addEnd = () => openGallery({ zone: ROOT_ZONE, index: zoneItems(getPuck().appState.data as never, ROOT_ZONE).length });
  return (
    <>
      <div className={st.canvasHeader}>
        <SiteHeader site={content.site} />
        <button type="button" className={st.globalEdit} onClick={() => openPanel("site")}>
          <span>
            <PencilSimpleIcon size={13} /> Edit name and menu
          </span>
        </button>
      </div>
      <main id="main">
        {children}
        {empty ? (
          <div className={st.emptyPage}>
            <h2>An empty page</h2>
            <p>Start with a section design, or drag blocks in from the Add panel on the left.</p>
          </div>
        ) : null}
        <button type="button" className={st.addEnd} onClick={addEnd}>
          <span>
            <PlusIcon size={16} weight="bold" /> Add a section to the end of the page
          </span>
        </button>
      </main>
      <div className={st.canvasFooter}>
        <SiteFooter site={content.site} />
        <button type="button" className={st.globalEdit} onClick={() => openPanel("site")}>
          <span>
            <PencilSimpleIcon size={13} /> Edit contact details
          </span>
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------ the canvas iframe

/** Inside the canvas: links don't navigate away while editing. */
export function CanvasFrame({ children, document: doc }: { children: ReactNode; document?: Document }) {
  useEffect(() => {
    if (!doc) return;
    doc.documentElement.setAttribute("data-studio-canvas", "");
    const stop = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (a && !a.closest("[data-puck-overlay-portal]")) e.preventDefault();
    };
    doc.addEventListener("click", stop, true);
    return () => doc.removeEventListener("click", stop, true);
  }, [doc]);
  return <>{children}</>;
}

// ---------------------------------------------------------------- toasts

export function Toasts() {
  const { toasts, dismiss } = useStudio();
  return (
    <div className={`${ui.root} ${ui.toasts}`} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={ui.toast} data-tone={t.tone}>
          <p>{t.message}</p>
          {t.action ? (
            <button
              type="button"
              onClick={() => {
                t.action!.run();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          ) : null}
          <button type="button" className={ui.close} aria-label="Dismiss" onClick={() => dismiss(t.id)}>
            <XIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog() {
  const { confirmRequest } = useStudio();
  return (
    <Dialog
      open={Boolean(confirmRequest)}
      size="s"
      title={confirmRequest?.title ?? ""}
      onClose={() => confirmRequest?.resolve(false)}
      footer={
        <>
          <Button onClick={() => confirmRequest?.resolve(false)}>Cancel</Button>
          <Button variant={confirmRequest?.danger ? "danger" : "primary"} onClick={() => confirmRequest?.resolve(true)} autoFocus>
            {confirmRequest?.confirm}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{confirmRequest?.body}</p>
    </Dialog>
  );
}

// ----------------------------------------------------------- keyboard

/** Shortcuts on top of Puck's own (undo, redo, delete). */
export function Shortcuts({ frameDoc }: { frameDoc?: Document | null }) {
  const getPuck = useGetPuck();
  const { setDialog, flush, toast } = useStudio();
  const openPanel = useOpenPanel();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDialog("palette");
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void flush().then(() => toast("Saved.", { tone: "success" }));
      } else if (mod && e.key.toLowerCase() === "d" && !typing) {
        const api = getPuck();
        const sel = api.appState.ui.itemSelector;
        if (sel?.zone) {
          e.preventDefault();
          api.dispatch({ type: "duplicate", sourceIndex: sel.index, sourceZone: sel.zone });
        }
      } else if (mod && (e.key === "ArrowUp" || e.key === "ArrowDown") && !typing) {
        if (moveSelected(getPuck() as never, e.key === "ArrowUp" ? -1 : 1)) e.preventDefault();
      } else if (e.key === "Escape" && !typing) {
        getPuck().dispatch({ type: "setUi", ui: { itemSelector: null } });
      } else if (e.key === "?" && !typing) {
        openPanel("help");
      }
    };
    window.addEventListener("keydown", onKey);
    frameDoc?.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      frameDoc?.removeEventListener("keydown", onKey);
    };
  }, [frameDoc, getPuck, setDialog, flush, toast, openPanel]);
  return null;
}

export function DropGuard({ frameDoc }: { frameDoc?: Document | null }) {
  const { upload, toast } = useStudio();
  const openPanel = useOpenPanel();
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const drop = (e: DragEvent) => {
      if (!hasFiles(e) || e.defaultPrevented) return;
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (!files.length) return;
      void upload(files).then((items) => {
        if (items.length) toast(items.length === 1 ? "Added to Photos." : `${items.length} files added to Photos.`, { action: { label: "Open Photos", run: () => openPanel("photos") } });
      });
    };
    const targets: (Window | Document)[] = [window, ...(frameDoc ? [frameDoc] : [])];
    targets.forEach((t) => {
      t.addEventListener("dragover", over as EventListener);
      t.addEventListener("drop", drop as EventListener);
    });
    return () =>
      targets.forEach((t) => {
        t.removeEventListener("dragover", over as EventListener);
        t.removeEventListener("drop", drop as EventListener);
      });
  }, [frameDoc, upload, toast, openPanel]);
  return null;
}

/** The editor's left rail draws its items as plain divs; make them real,
    keyboard-reachable buttons with the current panel announced. */
export function RailAccess() {
  useEffect(() => {
    const fix = () => {
      document.querySelectorAll<HTMLElement>('[class*="_NavItem-link"]').forEach((el) => {
        if (el.dataset.studioRail) {
          el.setAttribute("aria-pressed", String(/--active/.test(el.className) || /--active/.test(el.parentElement?.className ?? "")));
          return;
        }
        el.dataset.studioRail = "1";
        el.setAttribute("role", "button");
        el.tabIndex = 0;
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            el.click();
          }
        });
      });
    };
    fix();
    const nav = document.querySelector('[class*="_PuckLayout-nav"]') ?? document.body;
    const obs = new MutationObserver(fix);
    obs.observe(nav, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return null;
}

export function ShortcutsHelp() {
  const { dialog, setDialog } = useStudio();
  const rows: [string, ReactNode][] = [
    ["Undo", <Kbd key="a">⌘ Z</Kbd>],
    ["Redo", <Kbd key="b">⇧ ⌘ Z</Kbd>],
    ["Find anything", <Kbd key="c">⌘ K</Kbd>],
    ["Save now", <Kbd key="d">⌘ S</Kbd>],
    ["Duplicate the selected block", <Kbd key="e">⌘ D</Kbd>],
    ["Move it up or down", <Kbd key="f">⌘ ↑ ↓</Kbd>],
    ["Delete it", <Kbd key="g">Delete</Kbd>],
    ["Deselect", <Kbd key="h">Esc</Kbd>],
  ];
  return (
    <Dialog open={dialog === "shortcuts"} onClose={() => setDialog(null)} title="Keyboard shortcuts" size="s">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} style={{ borderBottom: "1px solid rgb(22 22 21 / 0.1)" }}>
              <td style={{ padding: "8px 0" }}>{k}</td>
              <td style={{ textAlign: "right" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dialog>
  );
}

export { insertTarget };
