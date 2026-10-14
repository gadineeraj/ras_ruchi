"use client";

// Cmd K: type to find any page, block, panel or action.
import { useGetPuck } from "@puckeditor/core";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText";
import { GearIcon } from "@phosphor-icons/react/dist/ssr/Gear";
import { RocketIcon } from "@phosphor-icons/react/dist/ssr/Rocket";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { useMemo, useState, type ReactNode } from "react";
import { blocks } from "@/blocks/config";
import { VIEWPORTS, useOpenPanel } from "./chrome";
import { BlockIcon } from "./icons";
import { insertTarget, selectAndReveal } from "./puck-utils";
import { useStudio } from "./state";
import { Dialog } from "./ui";
import st from "./studio.module.css";

type Command = { id: string; label: string; group: string; icon: ReactNode; run: () => void; words?: string };

export function CommandPalette() {
  const studio = useStudio();
  const { dialog, setDialog, pageList, openPage, openGallery, flush, current } = studio;
  const open = dialog === "palette";
  const getPuck = useGetPuck();
  const openPanel = useOpenPanel();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(() => {
    if (!open) return [];
    const close = (fn: () => void) => () => {
      setDialog(null);
      setQ("");
      fn();
    };
    const pages: Command[] = pageList.map((p) => ({ id: `page-${p.id}`, group: "Pages", label: p.title, words: p.path, icon: <FileTextIcon size={18} />, run: close(() => openPage(p.id)) }));
    const add: Command[] = Object.entries(blocks as unknown as Record<string, { label?: string; keywords?: string[] }>).map(([name, b]) => ({
      id: `add-${name}`,
      group: "Add a block",
      label: `Add ${b.label ?? name}`,
      words: (b.keywords ?? []).join(" "),
      icon: <BlockIcon name={name} size={18} />,
      run: close(() => {
        const api = getPuck();
        const t = insertTarget(api as never);
        const id = `${name}-${crypto.randomUUID()}`;
        api.dispatch({ type: "insert", componentType: name, destinationZone: t.zone, destinationIndex: t.index, id });
        selectAndReveal(api as never, id, true, t);
      }),
    }));
    const panels: Command[] = [
      ["pages", "Pages"],
      ["blocks", "Add blocks"],
      ["outline", "Layers"],
      ["photos", "Photos"],
      ["collections", "Collections"],
      ["site", "Site settings, menu and colours"],
      ["history", "History and saved versions"],
      ["help", "Help"],
    ].map(([name, label]) => ({ id: `panel-${name}`, group: "Open", label, icon: <GearIcon size={18} />, run: close(() => openPanel(name)) }));
    const actions: Command[] = [
      { id: "gallery", group: "Do", label: "Add a section design", icon: <SquaresFourIcon size={18} />, run: close(() => openGallery(insertTarget(getPuck() as never))) },
      { id: "publish", group: "Do", label: "Publish", icon: <RocketIcon size={18} />, run: () => setDialog("publish") },
      {
        id: "preview",
        group: "Do",
        label: "Preview this page in a new tab",
        icon: <ArrowSquareOutIcon size={18} />,
        run: close(() => void flush().then(() => window.open(`${current.root.props.path.replace(/\/?$/, "/")}`, "_blank", "noopener"))),
      },
      { id: "undo", group: "Do", label: "Undo", icon: <GearIcon size={18} />, run: close(() => getPuck().history.back()) },
      { id: "redo", group: "Do", label: "Redo", icon: <GearIcon size={18} />, run: close(() => getPuck().history.forward()) },
      { id: "shortcuts", group: "Do", label: "Keyboard shortcuts", icon: <GearIcon size={18} />, run: () => setDialog("shortcuts") },
      { id: "welcome", group: "Do", label: "Show the welcome tour", icon: <GearIcon size={18} />, run: () => setDialog("welcome") },
      ...VIEWPORTS.map((v) => ({
        id: `vp-${v.label}`,
        group: "Do",
        label: `See it on a ${v.label.toLowerCase()}`,
        icon: <GearIcon size={18} />,
        run: close(() => getPuck().dispatch({ type: "setUi", ui: { viewports: { current: { width: v.width, height: "auto" }, controlsVisible: false, options: VIEWPORTS } } })),
      })),
    ];
    return [...actions, ...panels, ...pages, ...add];
  }, [open, pageList, openPage, setDialog, getPuck, openPanel, openGallery, flush, current]);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = words.length ? commands.filter((c) => words.every((w) => `${c.label} ${c.words ?? ""} ${c.group}`.toLowerCase().includes(w))) : commands.filter((c) => c.group !== "Add a block");
    return list.slice(0, 60);
  }, [q, commands]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(shown.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      shown[active]?.run();
    }
  };

  return (
    <Dialog open={open} onClose={() => setDialog(null)} title="Find anything" size="m">
      <div className={st.palette}>
        <input
          className={st.paletteInput}
          autoFocus
          placeholder="Type a page, a block, or what you want to do"
          value={q}
          onChange={(e) => {
            setQ(e.currentTarget.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          aria-label="Search"
          aria-controls="palette-list"
        />
        <ul className={st.paletteList} id="palette-list" role="listbox">
          {shown.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active}>
              <button type="button" data-active={i === active || undefined} onMouseEnter={() => setActive(i)} onClick={c.run}>
                {c.icon}
                <span>{c.label}</span>
                <small>{c.group}</small>
              </button>
            </li>
          ))}
          {!shown.length ? <li style={{ padding: 12, color: "#4d4d48" }}>Nothing matches. Try one word, like photo or practice.</li> : null}
        </ul>
      </div>
    </Dialog>
  );
}
