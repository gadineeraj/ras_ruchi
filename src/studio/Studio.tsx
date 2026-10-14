"use client";

// The Studio: her real site in the middle, a rail of panels on the left, the
// selected block's settings on the right, and the top bar above.
import "@puckeditor/core/no-external.css";
import { Puck, blocksPlugin, createUsePuck, outlinePlugin, useGetPuck, type Plugin } from "@puckeditor/core";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ClockCounterClockwise";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";
import { GearIcon } from "@phosphor-icons/react/dist/ssr/Gear";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { PlusSquareIcon } from "@phosphor-icons/react/dist/ssr/PlusSquare";
import { QuestionIcon } from "@phosphor-icons/react/dist/ssr/Question";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { SwatchesIcon } from "@phosphor-icons/react/dist/ssr/Swatches";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PageData } from "@/lib/content-types";
import { AddPanel } from "./AddPanel";
import type { Content } from "./api";
import { CanvasFrame, ConfirmDialog, DropGuard, FieldsPanel, RailAccess, Shortcuts, ShortcutsHelp, StudioActionBar, StudioOverlay, Toasts, TopBar, VIEWPORTS } from "./chrome";
import { CommandPalette } from "./CommandPalette";
import { buildStudioConfig } from "./config";
import { PhotoPicker } from "./fields/PhotoPicker";
import { CollectionsPanel } from "./panels/CollectionsPanel";
import { HelpPanel } from "./panels/HelpPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { PagesPanel } from "./panels/PagesPanel";
import { PhotosPanel } from "./panels/PhotosPanel";
import { SitePanel } from "./panels/SitePanel";
import { PublishDialog } from "./PublishDialog";
import { SectionGallery } from "./SectionGallery";
import { StudioProvider, useStudio } from "./state";
import { selectAndReveal } from "./puck-utils";
import { Welcome } from "./Welcome";
import st from "./studio.module.css";
import ui from "./ui.module.css";

const config = buildStudioConfig();

const plugins: Plugin[] = [
  { name: "pages", label: "Pages", icon: <FilesIcon size={20} />, render: () => <PagesPanel /> },
  blocksPlugin({ label: "Add", icon: <PlusSquareIcon size={20} /> }),
  outlinePlugin({ label: "Layers", icon: <StackIcon size={20} /> }),
  { name: "photos", label: "Photos", icon: <ImagesIcon size={20} />, render: () => <PhotosPanel /> },
  { name: "collections", label: "Collections", icon: <SwatchesIcon size={20} />, render: () => <CollectionsPanel /> },
  { name: "site", label: "Site", icon: <GearIcon size={20} />, render: () => <SitePanel /> },
  { name: "history", label: "History", icon: <ClockCounterClockwiseIcon size={20} />, render: () => <HistoryPanel /> },
  { name: "help", label: "Help", icon: <QuestionIcon size={20} />, render: () => <HelpPanel /> },
];

// The canvas iframe's document, for keyboard shortcuts typed inside the page.
const FrameDoc = createContext<{ doc: Document | null; setDoc: (d: Document | null) => void }>({ doc: null, setDoc: () => {} });

function Frame({ children, document: doc }: { children: ReactNode; document?: Document }) {
  const { setDoc } = use(FrameDoc);
  useEffect(() => {
    setDoc(doc ?? null);
  }, [doc, setDoc]);
  return <CanvasFrame document={doc}>{children}</CanvasFrame>;
}

type Remembered = { histories: unknown[]; index: number; revision: number };
type Layout = { width: number; plugin: string; left: boolean; right: boolean };

const EditorCtx = createContext<{ remember: (id: string, h: Remembered) => void; rememberLayout: (l: Layout) => void }>({ remember: () => {}, rememberLayout: () => {} });
const usePuck = createUsePuck();

/** Lets the rest of the Studio reach the open editor, and carries each page's undo
    history and the screen layout (panel, screen size) across page switches. */
function Bridge() {
  const getPuck = useGetPuck();
  const { currentId: pageId, revision, registerPuck, takePendingSelect } = useStudio();
  const { remember, rememberLayout } = use(EditorCtx);
  const width = usePuck((s) => s.appState.ui.viewports.current.width as number);
  const plugin = usePuck((s) => (s.appState.ui.plugin?.current as string) ?? "blocks");
  const left = usePuck((s) => Boolean(s.appState.ui.leftSideBarVisible));
  const right = usePuck((s) => Boolean(s.appState.ui.rightSideBarVisible));

  useEffect(() => rememberLayout({ width, plugin, left, right }), [width, plugin, left, right, rememberLayout]);

  useEffect(() => {
    registerPuck(getPuck as never);
    const want = takePendingSelect();
    const timer = want ? setTimeout(() => selectAndReveal(getPuck() as never, want), 300) : undefined;
    return () => {
      clearTimeout(timer);
      const api = getPuck();
      remember(pageId, { histories: api.history.histories, index: api.history.index, revision });
    };
  }, [pageId, revision, getPuck, registerPuck, takePendingSelect, remember]);
  return null;
}

function Dialogs() {
  const { doc } = use(FrameDoc);
  return (
    <>
      <Shortcuts frameDoc={doc} />
      <DropGuard frameDoc={doc} />
      <RailAccess />
      <SectionGallery />
      <PublishDialog />
      <CommandPalette />
      <ShortcutsHelp />
      <ConfirmDialog />
      <PhotoPicker />
      <Welcome />
      <Toasts />
    </>
  );
}

const IFRAME = { enabled: true, waitForStyles: true };

function uiFor(l: Layout) {
  return {
    leftSideBarVisible: l.left,
    rightSideBarVisible: l.right,
    plugin: { current: l.plugin },
    viewports: { current: { width: l.width, height: "auto" as const }, controlsVisible: false, options: VIEWPORTS },
    previewMode: "edit" as const,
  };
}

function Editor() {
  const studio = useStudio();
  const { currentId, current, meta, setPageData, revision, toast } = studio;
  const [histories, setHistories] = useState<Record<string, Remembered>>({});
  const [layout, setLayout] = useState<Layout>({ width: 1440, plugin: "blocks", left: false, right: true });
  const lastSaved = useRef<string>("");

  const remember = useCallback((id: string, h: Remembered) => setHistories((all) => ({ ...all, [id]: h })), []);
  const rememberLayout = useCallback(
    (l: Layout) => setLayout((prev) => (prev.width === l.width && prev.plugin === l.plugin && prev.left === l.left && prev.right === l.right ? prev : l)),
    [],
  );
  const editorCtx = useMemo(() => ({ remember, rememberLayout }), [remember, rememberLayout]);

  const onChange = useCallback(
    (data: unknown) => {
      const json = JSON.stringify(data);
      if (json === lastSaved.current) return;
      lastSaved.current = json;
      setPageData(currentId, data as PageData);
    },
    [currentId, setPageData],
  );

  useEffect(() => {
    lastSaved.current = JSON.stringify(current);
    // Only when a different page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, revision]);

  const onAction = useCallback(
    (action: { type: string }) => {
      if (action.type === "remove") {
        queueMicrotask(() => toast("Block deleted.", { action: { label: "Undo", run: () => studio.undo() } }));
      }
    },
    [toast, studio],
  );

  // A restore or discard replaced the page: undo steps from before it no longer apply.
  const saved = histories[currentId]?.revision === revision ? histories[currentId] : undefined;
  const [overrides] = useState(() => ({
    header: () => <TopBar />,
    actionBar: StudioActionBar as never,
    componentOverlay: StudioOverlay as never,
    drawer: () => <AddPanel />,
    fields: FieldsPanel as never,
    iframe: Frame as never,
    puck: ({ children }: { children: ReactNode }) => (
      <>
        <Bridge />
        {children}
        <Dialogs />
      </>
    ),
  }));

  return (
    <EditorCtx value={editorCtx}>
    <Puck
      key={`${currentId}:${revision}`}
      config={config}
      data={current}
      metadata={meta as unknown as Record<string, unknown>}
      onChange={onChange}
      onAction={onAction as never}
      plugins={plugins}
      overrides={overrides}
      viewports={VIEWPORTS}
      ui={uiFor(layout) as never}
      iframe={IFRAME}
      initialHistory={saved ? ({ histories: saved.histories, index: saved.index, appendData: false } as never) : undefined}
    />
    </EditorCtx>
  );
}

export function Studio({ initial, initialPage }: { initial: Content; initialPage: string }) {
  const [doc, setDoc] = useState<Document | null>(null);
  return (
    <div className={`${ui.root} ${st.studio}`}>
      <FrameDoc value={{ doc, setDoc }}>
        <StudioProvider initial={initial} initialPage={initialPage}>
          <Editor />
        </StudioProvider>
      </FrameDoc>
    </div>
  );
}
