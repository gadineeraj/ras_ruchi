"use client";

// Pages: every page of the site in its group, in her order. Click to open one;
// the "…" menu holds settings, copying, the menu, moving and deleting. "New
// page" starts one from a ready-made starting point.
import { ArrowDownIcon } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { ArticleIcon } from "@phosphor-icons/react/dist/ssr/Article";
import { CopyIcon } from "@phosphor-icons/react/dist/ssr/Copy";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { FileIcon } from "@phosphor-icons/react/dist/ssr/File";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr/House";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ListDashesIcon } from "@phosphor-icons/react/dist/ssr/ListDashes";
import { ListPlusIcon } from "@phosphor-icons/react/dist/ssr/ListPlus";
import { NotebookIcon } from "@phosphor-icons/react/dist/ssr/Notebook";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { SwatchesIcon } from "@phosphor-icons/react/dist/ssr/Swatches";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { useId, useMemo, useRef, useState, type DragEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { blocks } from "@/blocks/config";
import type { BlockData, Collection, PageKind, PageRoot } from "@/lib/content-types";
import { slugify } from "@/lib/library";
import { normalisePath } from "@/lib/paths";
import { useStudio } from "../state";
import { Button, Empty, IconButton, Kbd, Menu, PanelHead, Section, Select, Spinner, Switch, TextArea, TextInput, type MenuItem } from "../ui";
import { checkPath, errorText, freePath } from "./shared";
import p from "./panels.module.css";

type Row = { id: string; title: string; path: string; kind: string; draft?: boolean };
type View = { name: "list" } | { name: "new" } | { name: "settings"; id: string };
type GroupKey = "main" | "collection" | "study" | "special";

const NOT_FOUND = "not-found";
const CONTACT = "#contact";

/** Pages whose web address can't change: home stays "/", and the 404 page. */
const fixedAddress = (id: string, path: string) => id === "home" || id === NOT_FOUND || normalisePath(path) === "/";

const displayTitle = (row: Row) => (row.id === NOT_FOUND ? "Page not found (404)" : row.title || "Untitled page");

export function PagesPanel() {
  const [view, setView] = useState<View>({ name: "list" });
  const newButtonId = useId();
  const rowButtons = useRef(new Map<string, HTMLButtonElement>());

  const backToList = (focusId?: string) => {
    setView({ name: "list" });
    requestAnimationFrame(() => (focusId ? rowButtons.current.get(focusId) : document.getElementById(newButtonId))?.focus());
  };

  if (view.name === "new") {
    return (
      <div className={p.panel}>
        <PanelHead title="New page" back={<IconButton label="Back to all pages" icon={<ArrowLeftIcon size={18} />} onClick={() => backToList()} />} />
        <NewPageForm onClose={() => backToList()} />
      </div>
    );
  }

  if (view.name === "settings") {
    return (
      <div className={p.panel}>
        <PageSettings key={view.id} id={view.id} onClose={() => backToList(view.id)} />
      </div>
    );
  }

  return (
    <div className={p.panel}>
      <PanelHead title="Pages">
        <Button id={newButtonId} size="s" variant="primary" icon={<PlusIcon size={14} weight="bold" />} onClick={() => setView({ name: "new" })}>
          New page
        </Button>
      </PanelHead>
      <PageList rowButtons={rowButtons} onSettings={(id) => setView({ name: "settings", id })} />
    </div>
  );
}

// ------------------------------------------------------------------ the list

function PageList({ rowButtons, onSettings }: { rowButtons: React.RefObject<Map<string, HTMLButtonElement>>; onSettings: (id: string) => void }) {
  const { content, currentId, pageList, openPage, duplicatePage, deletePage, movePage, setSite, toast, confirm } = useStudio();
  const [drag, setDrag] = useState<{ id: string; group: GroupKey } | null>(null);
  const [drop, setDrop] = useState<{ id: string; where: "before" | "after" } | null>(null);

  const groups = useMemo(() => {
    const of = (key: GroupKey) =>
      pageList.filter((r) => {
        if (r.id === NOT_FOUND) return key === "special";
        if (r.kind === "collection") return key === "collection";
        if (r.kind === "study") return key === "study";
        return key === "main";
      });
    return [
      { key: "main" as const, title: "Main pages", rows: of("main"), empty: "No pages yet. Press New page to make one." },
      { key: "collection" as const, title: "Collection pages", rows: of("collection"), empty: "No collection pages yet. Choose Collection page when you make a new page." },
      { key: "study" as const, title: "Study pages", rows: of("study"), empty: "No studies yet. Choose Study when you make a new page." },
      { key: "special" as const, title: "Special", rows: of("special"), empty: "" },
    ];
  }, [pageList]);

  const flat = useMemo(() => groups.flatMap((g) => g.rows), [groups]);
  const navPaths = useMemo(() => new Set(content.site.nav.map((n) => normalisePath(n.href))), [content.site.nav]);
  const at = (id: string) => pageList.findIndex((r) => r.id === id);

  const refocus = (id: string) => requestAnimationFrame(() => rowButtons.current.get(id)?.focus());

  const move = (row: Row, rows: Row[], dir: -1 | 1) => {
    const i = rows.findIndex((r) => r.id === row.id);
    const target = rows[i + dir];
    if (!target) return;
    // Up: take the place of the page above. Down: go just after the page below.
    movePage(row.id, at(target.id));
    refocus(row.id);
  };

  const addToMenu = (row: Row) => {
    setSite((s) => ({
      ...s,
      nav: [...s.nav.filter((n) => n.href !== CONTACT), { label: row.title, href: row.path }, ...s.nav.filter((n) => n.href === CONTACT)],
    }));
    toast(`"${row.title}" is in the menu now. Change the menu's order in Site.`);
  };

  const removeFromMenu = (row: Row) => {
    const before = content.site.nav;
    setSite((s) => ({ ...s, nav: s.nav.filter((n) => normalisePath(n.href) !== row.path) }));
    toast(`"${row.title}" is out of the menu.`, { action: { label: "Undo", run: () => setSite((s) => ({ ...s, nav: before })) } });
  };

  const duplicate = async (row: Row) => {
    try {
      const id = await duplicatePage(row.id);
      openPage(id);
      toast(`Made a copy of "${row.title}". It stays a draft until you switch Draft off.`, { tone: "success" });
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    }
  };

  const remove = async (row: Row) => {
    const ok = await confirm({
      title: `Delete "${row.title}"?`,
      body: "It comes off the site and out of the menu. You can bring it back from History.",
      confirm: "Delete page",
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePage(row.id);
      toast(`"${row.title}" was deleted. You can bring it back from History.`);
    } catch (e) {
      toast(errorText(e), { tone: "error" });
    }
  };

  const menuFor = (row: Row, rows: Row[]): MenuItem[] => {
    const i = rows.findIndex((r) => r.id === row.id);
    const inMenu = navPaths.has(row.path);
    const special = row.id === NOT_FOUND;
    const items: MenuItem[] = [
      { label: "Open", icon: <ArrowRightIcon size={16} />, onSelect: () => openPage(row.id) },
      { label: "Page settings", icon: <GearSixIcon size={16} />, onSelect: () => onSettings(row.id) },
    ];
    if (!special) items.push({ label: "Duplicate", icon: <CopyIcon size={16} />, onSelect: () => void duplicate(row) });
    if (!special) items.push(inMenu ? { label: "Remove from menu", icon: <ListDashesIcon size={16} />, onSelect: () => removeFromMenu(row) } : { label: "Show in menu", icon: <ListPlusIcon size={16} />, onSelect: () => addToMenu(row) });
    if (i > 0 || i < rows.length - 1) {
      items.push("divider");
      if (i > 0) items.push({ label: "Move up", icon: <ArrowUpIcon size={16} />, onSelect: () => move(row, rows, -1) });
      if (i < rows.length - 1) items.push({ label: "Move down", icon: <ArrowDownIcon size={16} />, onSelect: () => move(row, rows, 1) });
    }
    if (!fixedAddress(row.id, row.path)) {
      items.push("divider");
      items.push({ label: "Delete page", icon: <TrashIcon size={16} />, danger: true, onSelect: () => void remove(row) });
    }
    return items;
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, row: Row, rows: Row[]) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const dir = e.key === "ArrowUp" ? -1 : 1;
    if (e.altKey) {
      move(row, rows, dir);
      return;
    }
    const next = flat[flat.findIndex((r) => r.id === row.id) + dir];
    if (next) rowButtons.current.get(next.id)?.focus();
  };

  // ------------------------------------------------------------ drag to reorder
  const endDrag = () => {
    setDrag(null);
    setDrop(null);
  };
  const onDragOver = (e: DragEvent<HTMLLIElement>, row: Row, group: GroupKey) => {
    if (!drag || drag.group !== group || drag.id === row.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const box = e.currentTarget.getBoundingClientRect();
    const where = e.clientY < box.top + box.height / 2 ? "before" : "after";
    if (drop?.id !== row.id || drop.where !== where) setDrop({ id: row.id, where });
  };
  const onDrop = (e: DragEvent<HTMLLIElement>, row: Row) => {
    e.preventDefault();
    if (drag && drop && drop.id === row.id) {
      const from = at(drag.id);
      const t = at(row.id);
      const to = drop.where === "before" ? (t < from ? t : t - 1) : t < from ? t + 1 : t;
      if (to !== from) movePage(drag.id, to);
    }
    endDrag();
  };

  return (
    <div className={p.body}>
      {groups.map((g) => (
        <Section key={g.key} title={g.title}>
          {g.rows.length ? (
            <ul className={p.list} aria-label={g.title} onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDrop(null)}>
              {g.rows.map((row) => {
                const current = row.id === currentId;
                const inMenu = navPaths.has(row.path);
                const title = displayTitle(row);
                return (
                  <li
                    key={row.id}
                    className={p.row}
                    data-current={current || undefined}
                    data-dragging={drag?.id === row.id || undefined}
                    data-drop={drop?.id === row.id ? drop.where : undefined}
                    draggable={g.rows.length > 1}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", row.id);
                      setDrag({ id: row.id, group: g.key });
                    }}
                    onDragOver={(e) => onDragOver(e, row, g.key)}
                    onDrop={(e) => onDrop(e, row)}
                    onDragEnd={endDrag}
                  >
                    <button
                      ref={(el) => {
                        if (el) rowButtons.current.set(row.id, el);
                        else rowButtons.current.delete(row.id);
                      }}
                      type="button"
                      className={p.rowMain}
                      aria-current={current ? "page" : undefined}
                      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                      onClick={() => openPage(row.id)}
                      onKeyDown={(e) => onKey(e, row, g.rows)}
                    >
                      <span className={p.rowTitle}>
                        {normalisePath(row.path) === "/" ? <HouseIcon size={15} weight="bold" aria-hidden="true" /> : null}
                        <span>{title}</span>
                      </span>
                      <span className={p.rowMeta}>
                        <span className={p.rowPath}>{row.id === NOT_FOUND ? "Shown for addresses that don't exist" : row.path}</span>
                        {row.draft ? (
                          <span className={p.tag} data-tone="draft">
                            Draft
                          </span>
                        ) : null}
                        {inMenu ? <span className={p.tag}>In menu</span> : null}
                      </span>
                    </button>
                    <span className={p.rowTools}>
                      <Menu
                        label={`${title}: more`}
                        items={menuFor(row, g.rows)}
                        trigger={(t) => <IconButton {...t} size="s" label={`More for ${title}`} icon={<DotsThreeIcon size={18} weight="bold" />} />}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : g.empty ? (
            <p className={p.groupNote}>{g.empty}</p>
          ) : null}
        </Section>
      ))}
      <p className={p.hint}>
        Click a page to open it. To change the order, drag a page, or press <Kbd>Option</Kbd> with <Kbd>↑</Kbd> or <Kbd>↓</Kbd>. Deleted pages can be brought back from History.
      </p>
    </div>
  );
}

// ------------------------------------------------------------ page settings

function PageSettings({ id, onClose }: { id: string; onClose: () => void }) {
  const { content, updateRoot, setSite, toast, confirm } = useStudio();
  const root = content.pages[id]?.root.props;
  const [title, setTitle] = useState(root?.title ?? "");
  const [path, setPath] = useState(root?.path ?? "");
  const [description, setDescription] = useState(root?.description ?? "");
  const [draft, setDraft] = useState(Boolean(root?.draft));
  const [tried, setTried] = useState(false);

  if (!root) {
    return (
      <>
        <PanelHead title="Page settings" back={<IconButton label="Back to all pages" icon={<ArrowLeftIcon size={18} />} onClick={onClose} />} />
        <div className={p.body}>
          <Empty title="This page isn't here any more" action={<Button onClick={onClose}>Back to all pages</Button>}>
            It may have been deleted. Deleted pages can be brought back from History.
          </Empty>
        </div>
      </>
    );
  }

  const fixed = fixedAddress(id, root.path);
  const isHome = normalisePath(root.path) === "/";
  const titleError = title.trim() ? null : "Give the page a name.";
  const pathError = fixed ? null : checkPath(path, id, content.pages);
  const dirty = title !== root.title || (!fixed && path !== root.path) || description !== (root.description ?? "") || draft !== Boolean(root.draft);

  const leave = async () => {
    if (dirty && !(await confirm({ title: "Leave without saving?", body: "Your changes to this page's settings will be lost.", confirm: "Leave without saving", danger: true }))) return;
    onClose();
  };

  function save(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (titleError || pathError || !root) return;
    const oldPath = normalisePath(root.path);
    const newPath = fixed ? root.path : normalisePath(path);
    const patch: Partial<PageRoot> = { title: title.trim(), description: description.trim(), draft };
    if (!fixed) patch.path = newPath;
    updateRoot(id, patch);
    if (!fixed && newPath !== oldPath) {
      // Menu links follow the page to its new address.
      setSite((s) => ({ ...s, nav: s.nav.map((n) => (normalisePath(n.href) === oldPath ? { ...n, href: newPath } : n)) }));
      toast(`Saved. The page now lives at ${newPath}. Links in the menu were updated too.`, { tone: "success" });
    } else {
      toast("Page settings saved.", { tone: "success" });
    }
    onClose();
  }

  return (
    <>
      <PanelHead title="Page settings" back={<IconButton label="Back to all pages" icon={<ArrowLeftIcon size={18} />} onClick={() => void leave()} />} />
      <form className={`${p.body} ${p.form}`} onSubmit={save} noValidate>
        <TextInput label="Page name" value={title} onChange={setTitle} error={tried ? titleError : null} hint="Shown in the browser tab and here in the Studio." autoFocus />
        {fixed ? (
          <div className={p.readOnly}>
            <span className={p.readOnlyLabel}>Web address</span>
            <span className={p.readOnlyValue}>{id === NOT_FOUND ? "Any address that doesn't exist" : root.path}</span>
            <span className={p.hint}>{isHome ? "The home page always lives at the main address." : "Visitors see this page when they follow a broken link."}</span>
          </div>
        ) : (
          <TextInput label="Web address" value={path} onChange={setPath} error={pathError} placeholder="/about" hint="Small letters, numbers and hyphens, starting with /. Links in the menu follow along." />
        )}
        <TextArea label="Search description" value={description} onChange={setDescription} placeholder="One or two sentences about this page" hint="Shown by Google and when the page is shared." />
        {isHome ? null : <Switch label="Draft" checked={draft} onChange={setDraft} hint="Drafts stay hidden from the published site until you switch this off." />}
        <div className={p.actions}>
          <Button type="submit" variant="primary">
            Save settings
          </Button>
          <Button variant="ghost" onClick={() => void leave()}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}

// ------------------------------------------------------------------ new page

type Template = "blank" | "text" | "gallery" | "study" | "collection";

const TEMPLATES: { value: Template; title: string; text: string; icon: ReactNode }[] = [
  { value: "blank", title: "Blank page", text: "A title to start from. Add sections as you go.", icon: <FileIcon size={18} /> },
  { value: "text", title: "Text page", text: "A title and a block of writing.", icon: <ArticleIcon size={18} /> },
  { value: "gallery", title: "Gallery page", text: "A title and a grid of photos.", icon: <ImagesIcon size={18} /> },
  { value: "study", title: "Study", text: "A craft study with credits, writing, photos and a link to the next one. Listed under Studies.", icon: <NotebookIcon size={18} /> },
  { value: "collection", title: "Collection page", text: "A collection's colour band, then its designs and colourways.", icon: <SwatchesIcon size={18} /> },
];

const NEW_COLLECTION = "__new";

type Props = Record<string, unknown>;

/** A block with every one of its default settings, then the template's own. */
function block(type: string, props: Props = {}): BlockData {
  const defaults = ((blocks as unknown as Record<string, { defaultProps?: Props }>)[type]?.defaultProps ?? {}) as Props;
  return { type, props: { ...structuredClone(defaults), ...props, id: "" } };
}

function uniqueCollectionSlug(base: string, collections: Collection[]) {
  const root = base || "collection";
  let slug = root;
  for (let n = 2; collections.some((c) => c.slug === slug); n++) slug = `${root}-${n}`;
  return slug;
}

function NewPageForm({ onClose }: { onClose: () => void }) {
  const { content, createPage, setCollections, toast, openPage } = useStudio();
  const radioName = useId();
  const collections = content.collections;
  const pages = content.pages;

  const pageFor = (slug: string) => Object.values(pages).find((d) => d.root.props.kind === "collection" && d.root.props.collection === slug);
  const firstFree = collections.find((c) => !pageFor(c.slug))?.slug;

  const [name, setName] = useState("");
  const [template, setTemplate] = useState<Template>("blank");
  const [collection, setCollection] = useState<string>(firstFree ?? NEW_COLLECTION);
  const [inMenu, setInMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);

  const title = name.trim();
  const slug = slugify(title) || (template === "study" ? "study" : "page");
  const chosen = collections.find((c) => c.slug === collection);
  const collectionSlug = chosen ? chosen.slug : uniqueCollectionSlug(slugify(title), collections);

  const plan = (): { kind: PageKind; path: string; content: BlockData[]; collection: string } => {
    switch (template) {
      case "text":
        return { kind: "page", path: `/${slug}`, collection: "", content: [block("PageTitle", { title }), block("Text")] };
      case "gallery":
        return { kind: "page", path: `/${slug}`, collection: "", content: [block("PageTitle", { title }), block("Gallery")] };
      case "study":
        return {
          kind: "study",
          path: `/studies/${slug}`,
          collection: "",
          content: [
            block("BackLink", { label: "All studies", link: { href: "/studies" } }),
            block("StudyHeader", { title }),
            block("Text", { text: "<p>Tell the story of this study: the craft, the place and the people who made it.</p>" }),
            block("StudyImages"),
            block("StudyFooter"),
          ],
        };
      case "collection":
        return {
          kind: "collection",
          path: `/collections/${collectionSlug}`,
          collection: collectionSlug,
          content: [
            block("BackLink", { label: "All collections", link: { href: "/collections" } }),
            block("CollectionCard", { collection: collectionSlug, showIndex: true, extra: [] }),
            block("CollectionPager", { collection: collectionSlug }),
          ],
        };
      default:
        return { kind: "page", path: `/${slug}`, collection: "", content: [block("PageTitle", { title })] };
    }
  };

  const address = freePath(plan().path, pages);

  const chooseCollection = (next: string) => {
    const prevName = chosen?.name ?? "";
    const nextName = collections.find((c) => c.slug === next)?.name ?? "";
    // Fill in the page name from the collection unless she has typed her own.
    if (nextName && (!title || name === prevName)) setName(nextName);
    setCollection(next);
  };

  const chooseTemplate = (t: Template) => {
    setTemplate(t);
    if (t === "collection" && !title && chosen) setName(chosen.name);
  };

  async function create(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!title || busy) return;
    setBusy(true);
    try {
      const { kind, path, content: blocksFor, collection: slugFor } = plan();
      const id = await createPage({ title, path, kind, content: blocksFor, collection: slugFor, inMenu });
      if (template === "collection" && !chosen) {
        setCollections((list) => [...list, { slug: slugFor, name: title, season: "", band: "#6a2222", line: "", intro: "", designs: [] }]);
      }
      // The Studio opens it as soon as it has arrived, even after this form closes.
      openPage(id);
      toast(`"${title}" is ready. It stays a draft until you switch Draft off.`, { tone: "success" });
      onClose();
    } catch (err) {
      toast(errorText(err), { tone: "error" });
      setBusy(false);
    }
  }

  const taken = chosen ? pageFor(chosen.slug) : undefined;

  return (
    <form className={`${p.body} ${p.form}`} onSubmit={create} noValidate>
      <TextInput label="Page name" value={name} onChange={setName} placeholder="e.g. Indigo journal" autoFocus error={tried && !title ? "Give the page a name." : null} hint={`Its web address will be ${address}. You can change it later in Page settings.`} />

      <fieldset className={p.choices}>
        <legend>Starting point</legend>
        {TEMPLATES.map((t) => (
          <label key={t.value} className={p.choice}>
            <input type="radio" name={radioName} value={t.value} checked={template === t.value} onChange={() => chooseTemplate(t.value)} />
            {t.icon}
            <span className={p.choiceTitle}>{t.title}</span>
            <span className={p.choiceText}>{t.text}</span>
          </label>
        ))}
      </fieldset>

      {template === "collection" ? (
        <>
          <Select
            label="Which collection"
            value={collection}
            onChange={chooseCollection}
            options={[...collections.map((c) => ({ label: c.name || c.slug, value: c.slug })), { label: "A new collection", value: NEW_COLLECTION }]}
            hint={taken ? `"${taken.root.props.title}" already shows this collection.` : undefined}
          />
          {chosen ? null : (
            <p className={p.note}>
              {title ? `A new collection called "${title}" will be added.` : "A new collection with this page's name will be added."} Add its designs and colourways in Collections.
            </p>
          )}
        </>
      ) : null}

      <Switch label="Add to the menu" checked={inMenu} onChange={setInMenu} hint="Puts a link to it in the menu at the top of every page." />

      <p className={p.note}>New pages stay hidden from the published site until you switch Draft off.</p>

      <div className={p.actions}>
        <Button type="submit" variant="primary" disabled={busy} icon={busy ? <Spinner /> : null}>
          {busy ? "Creating page" : "Create page"}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
