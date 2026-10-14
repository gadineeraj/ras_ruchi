"use client";

// The Studio's shared state: all of her content, which page is open, saving,
// and the pop-ups any part of the Studio can ask for (photo picker, section
// gallery, publish, confirmations, notices).
import { createContext, use, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Collection, MediaItem, PageData, Photo, SiteMeta, SiteSettings } from "@/lib/content-types";
import { orderPages, pageIndex, studySummaries } from "@/lib/content-utils";
import { normalisePath } from "@/lib/paths";
import { slugify } from "@/lib/library";
import { api, type Content } from "./api";

export type SaveStatus = { state: "saved" | "saving" | "waiting" | "error"; error?: string; savedAt: number | null };

export type Toast = { id: number; message: string; tone?: "info" | "error" | "success"; action?: { label: string; run: () => void } };

export type PhotoRequest = { title?: string; current?: Photo | null; allowVideo?: boolean; resolve: (photo: Photo | null) => void };

export type InsertTarget = { zone: string; index: number };

type PuckGetter = () => {
  dispatch: (action: Record<string, unknown>) => void;
  appState: { data: PageData; ui: Record<string, unknown> };
  history: { back: () => void; forward: () => void; hasPast: boolean; hasFuture: boolean; histories: unknown[]; index: number };
  selectedItem: { type: string; props: Record<string, unknown> } | null;
  getSelectorForId: (id: string) => { index: number; zone: string } | undefined;
  resolveDataById?: (id: string, trigger?: string) => void;
};

type Studio = {
  content: Content;
  currentId: string;
  current: PageData;
  meta: SiteMeta;
  pageList: { id: string; title: string; path: string; kind: string; draft?: boolean }[];
  revision: number;
  save: SaveStatus;

  openPage: (id: string, opts?: { select?: string }) => void;
  pendingSelect: React.RefObject<string | null>;
  takePendingSelect: () => string | null;
  registerPuck: (get: PuckGetter) => void;
  undo: () => void;
  setPageData: (id: string, data: PageData) => void;
  replaceCurrent: (data: PageData) => void;
  createPage: (input: { title: string; path?: string; kind?: PageData["root"]["props"]["kind"]; content?: PageData["content"]; collection?: string; inMenu?: boolean }) => Promise<string>;
  duplicatePage: (id: string) => Promise<string>;
  deletePage: (id: string) => Promise<void>;
  updateRoot: (id: string, patch: Partial<PageData["root"]["props"]>) => void;
  movePage: (id: string, toIndex: number) => void;

  setSite: (fn: (s: SiteSettings) => SiteSettings) => void;
  setCollections: (fn: (c: Collection[]) => Collection[]) => void;
  setMedia: (fn: (m: MediaItem[]) => MediaItem[]) => void;
  reloadAll: (content: Content) => void;

  upload: (files: File[], folder?: string) => Promise<MediaItem[]>;
  flush: () => Promise<void>;

  toasts: Toast[];
  toast: (message: string, opts?: Omit<Toast, "id" | "message">) => void;
  dismiss: (id: number) => void;

  photoRequest: PhotoRequest | null;
  pickPhoto: (opts?: Omit<PhotoRequest, "resolve">) => Promise<Photo | null>;
  closePhotoPicker: (photo: Photo | null) => void;

  gallery: InsertTarget | null;
  openGallery: (target: InsertTarget) => void;
  closeGallery: () => void;

  dialog: "publish" | "palette" | "welcome" | "shortcuts" | null;
  setDialog: (d: Studio["dialog"]) => void;

  confirm: (opts: { title: string; body?: string; confirm: string; danger?: boolean }) => Promise<boolean>;
  confirmRequest: { title: string; body?: string; confirm: string; danger?: boolean; resolve: (ok: boolean) => void } | null;

  puck: React.RefObject<PuckGetter | null>;
};

const Ctx = createContext<Studio | null>(null);

export function useStudio() {
  const s = use(Ctx);
  if (!s) throw new Error("useStudio must be used inside <StudioProvider>.");
  return s;
}

const SAVE_DELAY = 700;
const newId = (type: string) => `${type}-${crypto.randomUUID()}`;

/** New ids for a copied block tree, so the copy and the original never share one. */
export function freshIds<T>(node: T): T {
  if (Array.isArray(node)) return node.map(freshIds) as T;
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.type === "string" && o.props && typeof o.props === "object") {
      const props = Object.fromEntries(Object.entries(o.props as Record<string, unknown>).map(([k, v]) => [k, freshIds(v)]));
      return { ...o, props: { ...props, id: newId(o.type) } } as T;
    }
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, freshIds(v)])) as T;
  }
  return node;
}

export function StudioProvider({ initial, children }: { initial: Content; children: ReactNode }) {
  const [content, setContent] = useState<Content>(initial);
  const contentRef = useRef(content);
  useLayoutEffect(() => {
    contentRef.current = content;
  }, [content]);
  const [currentId, setCurrentId] = useState(() => {
    if (typeof window === "undefined") return "home";
    const want = new URLSearchParams(window.location.search).get("page");
    return want && initial.pages[want] ? want : "home";
  });
  const [revision, setRevision] = useState(0);
  const currentIdRef = useRef(currentId);
  useLayoutEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  const pendingSelect = useRef<string | null>(null);
  const puck = useRef<PuckGetter | null>(null);

  // ------------------------------------------------------------- saving
  const [save, setSave] = useState<SaveStatus>({ state: "saved", savedAt: null });
  const queue = useRef(new Map<string, { data: unknown; timer: ReturnType<typeof setTimeout> }>());
  const inflight = useRef(0);

  const write = useCallback(async (name: string, data: unknown) => {
    inflight.current++;
    setSave((s) => ({ ...s, state: "saving" }));
    try {
      if (name.startsWith("pages/")) await api.savePage(name.slice(6), data as PageData);
      else await api.saveFile(name as "site" | "collections" | "media", data);
      inflight.current--;
      if (!inflight.current && !queue.current.size) setSave({ state: "saved", savedAt: Date.now() });
    } catch (e) {
      inflight.current--;
      setSave({ state: "error", error: (e as Error).message, savedAt: null });
      // Keep it queued so the next change or a retry saves it.
      queue.current.set(name, { data, timer: setTimeout(() => {}, 0) });
    }
  }, []);

  const schedule = useCallback(
    (name: string, data: unknown) => {
      const prev = queue.current.get(name);
      if (prev) clearTimeout(prev.timer);
      setSave((s) => (s.state === "error" ? s : { ...s, state: "waiting" }));
      const timer = setTimeout(() => {
        queue.current.delete(name);
        void write(name, data);
      }, SAVE_DELAY);
      queue.current.set(name, { data, timer });
    },
    [write],
  );

  const flush = useCallback(async () => {
    const jobs = [...queue.current.entries()];
    queue.current.clear();
    await Promise.all(
      jobs.map(([name, { data, timer }]) => {
        clearTimeout(timer);
        return write(name, data);
      }),
    );
  }, [write]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (queue.current.size || inflight.current) {
        void flush();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  // ------------------------------------------------------------ toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message: string, opts: Omit<Toast, "id" | "message"> = {}) => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-3), { id, message, ...opts }]);
      setTimeout(() => dismiss(id), opts.action ? 8000 : opts.tone === "error" ? 9000 : 4500);
    },
    [dismiss],
  );

  // --------------------------------------------------------------- pages
  const setPageData = useCallback(
    (id: string, data: PageData) => {
      setContent((c) => ({ ...c, pages: { ...c.pages, [id]: data } }));
      schedule(`pages/${id}`, data);
    },
    [schedule],
  );

  const pendingOpen = useRef<{ id: string; select?: string } | null>(null);
  const openPage = useCallback(
    (id: string, opts: { select?: string } = {}) => {
      if (!contentRef.current.pages[id]) {
        pendingOpen.current = { id, select: opts.select };
        return;
      }
      pendingOpen.current = null;
      pendingSelect.current = opts.select ?? null;
      void flush();
      setCurrentId(id);
      const url = new URL(window.location.href);
      url.searchParams.set("page", id);
      window.history.replaceState(null, "", url);
    },
    [flush],
  );

  useEffect(() => {
    const want = pendingOpen.current;
    if (want && content.pages[want.id]) openPage(want.id, { select: want.select });
  }, [content.pages, openPage]);

  /** Swaps in new data for the open page (after a restore), starting a fresh editor. */
  const replaceCurrent = useCallback(
    (data: PageData) => {
      setContent((c) => ({ ...c, pages: { ...c.pages, [currentIdRef.current]: data } }));
      setRevision((r) => r + 1);
    },
    [],
  );

  const setSite = useCallback(
    (fn: (s: SiteSettings) => SiteSettings) => {
      setContent((c) => {
        const site = fn(c.site);
        schedule("site", site);
        return { ...c, site };
      });
    },
    [schedule],
  );

  const setCollections = useCallback(
    (fn: (c: Collection[]) => Collection[]) => {
      setContent((c) => {
        const collections = fn(c.collections);
        schedule("collections", collections);
        return { ...c, collections };
      });
    },
    [schedule],
  );

  const setMedia = useCallback(
    (fn: (m: MediaItem[]) => MediaItem[]) => {
      setContent((c) => {
        const media = fn(c.media);
        schedule("media", media);
        return { ...c, media };
      });
    },
    [schedule],
  );

  const uniqueId = (base: string) => {
    const root = slugify(base) || "page";
    let id = root;
    for (let n = 2; contentRef.current.pages[id]; n++) id = `${root}-${n}`;
    return id;
  };
  const uniquePath = (base: string) => {
    const taken = new Set(Object.values(contentRef.current.pages).map((p) => normalisePath(p.root.props.path)));
    let p = normalisePath(base);
    for (let n = 2; taken.has(p); n++) p = `${normalisePath(base)}-${n}`;
    return p;
  };

  const createPage: Studio["createPage"] = useCallback(
    async ({ title, path, kind = "page", content: blocks = [], collection = "", inMenu = false }) => {
      const id = uniqueId(kind === "study" ? `study-${title}` : kind === "collection" ? `collection-${collection || title}` : title);
      const data: PageData = {
        root: { props: { title, path: uniquePath(path || `/${slugify(title)}`), kind, description: "", draft: true, shareImage: null, collection } },
        content: freshIds(blocks),
        zones: {},
      };
      await api.createPage(id, data);
      setContent((c) => ({ ...c, pages: { ...c.pages, [id]: data } }));
      setSite((s) => ({
        ...s,
        pageOrder: [...(s.pageOrder ?? []), id],
        nav: inMenu ? [...s.nav.filter((n) => n.href !== "#contact"), { label: title, href: data.root.props.path }, ...s.nav.filter((n) => n.href === "#contact")] : s.nav,
      }));
      return id;
    },
    [setSite],
  );

  const duplicatePage = useCallback(
    async (id: string) => {
      const src = contentRef.current.pages[id];
      const title = `${src.root.props.title} (copy)`;
      const newIdV = uniqueId(`${id}-copy`);
      const data: PageData = { ...freshIds(src), root: { props: { ...src.root.props, title, path: uniquePath(`${src.root.props.path}-copy`), draft: true } } };
      await api.createPage(newIdV, data);
      setContent((c) => ({ ...c, pages: { ...c.pages, [newIdV]: data } }));
      setSite((s) => {
        const order = [...(s.pageOrder ?? [])];
        order.splice(order.indexOf(id) + 1, 0, newIdV);
        return { ...s, pageOrder: order };
      });
      return newIdV;
    },
    [setSite],
  );

  const deletePage = useCallback(
    async (id: string) => {
      const path = contentRef.current.pages[id]?.root.props.path;
      await flush();
      await api.deletePage(id);
      setContent((c) => {
        const pages = { ...c.pages };
        delete pages[id];
        return { ...c, pages };
      });
      setSite((s) => ({ ...s, pageOrder: (s.pageOrder ?? []).filter((x) => x !== id), nav: s.nav.filter((n) => normalisePath(n.href) !== normalisePath(path ?? "")) }));
      if (currentIdRef.current === id) openPage("home");
    },
    [flush, openPage, setSite],
  );

  const updateRoot = useCallback(
    (id: string, patch: Partial<PageData["root"]["props"]>) => {
      if (id === currentIdRef.current && puck.current) {
        const root = puck.current().appState.data.root;
        puck.current().dispatch({ type: "replaceRoot", root: { ...root, props: { ...root.props, ...patch } } });
        return;
      }
      const page = contentRef.current.pages[id];
      if (!page) return;
      setPageData(id, { ...page, root: { ...page.root, props: { ...page.root.props, ...patch } } });
    },
    [setPageData],
  );

  const movePage = useCallback(
    (id: string, toIndex: number) => {
      setSite((s) => {
        const order = orderPages(
          Object.keys(contentRef.current.pages).map((pid) => ({ id: pid, data: contentRef.current.pages[pid] })),
          s.pageOrder ?? [],
        ).map((p) => p.id);
        const from = order.indexOf(id);
        if (from < 0) return s;
        order.splice(from, 1);
        order.splice(Math.max(0, Math.min(order.length, toIndex)), 0, id);
        return { ...s, pageOrder: order };
      });
    },
    [setSite],
  );

  const reloadAll = useCallback((next: Content) => {
    setContent(next);
    setRevision((r) => r + 1);
  }, []);

  // --------------------------------------------------------------- media
  const upload = useCallback(
    async (files: File[], folder?: string) => {
      if (!files.length) return [];
      toast(files.length === 1 ? `Adding ${files[0].name}…` : `Adding ${files.length} files…`);
      const { items, errors } = await api.upload(files, folder);
      if (items.length) {
        setContent((c) => ({ ...c, media: [...items, ...c.media.filter((m) => !items.some((i) => i.src === m.src))] }));
        toast(items.length === 1 ? "Added to Photos." : `${items.length} files added to Photos.`, { tone: "success" });
      }
      errors.forEach((e) => toast(e, { tone: "error" }));
      return items;
    },
    [toast],
  );

  // -------------------------------------------------------------- pop-ups
  const [photoRequest, setPhotoRequest] = useState<PhotoRequest | null>(null);
  const pickPhoto = useCallback((opts: Omit<PhotoRequest, "resolve"> = {}) => new Promise<Photo | null>((resolve) => setPhotoRequest({ ...opts, resolve })), []);
  const closePhotoPicker = useCallback(
    (photo: Photo | null) => {
      photoRequest?.resolve(photo);
      setPhotoRequest(null);
    },
    [photoRequest],
  );

  const [gallery, setGallery] = useState<InsertTarget | null>(null);
  const [dialog, setDialog] = useState<Studio["dialog"]>(null);
  const [confirmRequest, setConfirmRequest] = useState<Studio["confirmRequest"]>(null);
  const confirm = useCallback(
    (opts: { title: string; body?: string; confirm: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) =>
        setConfirmRequest({
          ...opts,
          resolve: (ok) => {
            setConfirmRequest(null);
            resolve(ok);
          },
        }),
      ),
    [],
  );

  const takePendingSelect = useCallback(() => {
    const id = pendingSelect.current;
    pendingSelect.current = null;
    return id;
  }, []);
  const registerPuck = useCallback((get: PuckGetter) => {
    puck.current = get;
  }, []);
  const undo = useCallback(() => puck.current?.().history.back(), []);

  // ------------------------------------------------------------- derived
  const pages = useMemo(() => orderPages(Object.entries(content.pages).map(([id, data]) => ({ id, data })), content.site.pageOrder ?? []), [content.pages, content.site.pageOrder]);
  const studies = useMemo(() => studySummaries(pages, true), [pages]);
  const studiesKey = JSON.stringify(studies);
  const pageList = useMemo(() => pageIndex(pages), [pages]);
  const pagesKey = JSON.stringify(pageList);
  const currentRoot = content.pages[currentId]?.root.props;

  const meta: SiteMeta = useMemo(
    () => ({
      site: content.site,
      collections: content.collections,
      studies: JSON.parse(studiesKey),
      pages: JSON.parse(pagesKey),
      page: { id: currentId, path: normalisePath(currentRoot?.path ?? "/"), kind: currentRoot?.kind ?? "page", collection: currentRoot?.collection },
      editing: true,
    }),
    [content.site, content.collections, studiesKey, pagesKey, currentId, currentRoot?.path, currentRoot?.kind, currentRoot?.collection],
  );

  const value: Studio = {
    content,
    currentId,
    current: content.pages[currentId] ?? content.pages.home,
    meta,
    pageList,
    revision,
    save,
    openPage,
    pendingSelect,
    setPageData,
    replaceCurrent,
    createPage,
    duplicatePage,
    deletePage,
    updateRoot,
    movePage,
    setSite,
    setCollections,
    setMedia,
    reloadAll,
    upload,
    flush,
    toasts,
    toast,
    dismiss,
    photoRequest,
    pickPhoto,
    closePhotoPicker,
    gallery,
    openGallery: setGallery,
    closeGallery: () => setGallery(null),
    dialog,
    setDialog,
    confirm,
    confirmRequest,
    puck,
    takePendingSelect,
    registerPuck,
    undo,
  };

  return <Ctx value={value}>{children}</Ctx>;
}
