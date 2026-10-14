"use client";

// The "Add" panel: every block she can place, searchable, each with a line on
// what it is for. Drag a tile onto the page, or press + to add it after the
// selected block. A link at the top opens the gallery of ready-made sections.
import { Drawer, useGetPuck } from "@puckeditor/core";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { useState } from "react";
import { blocks, categories } from "@/blocks/config";
import { BlockIcon } from "./icons";
import { insertTarget, selectAndReveal } from "./puck-utils";
import { useStudio } from "./state";
import { Empty, PanelHead, ui } from "./ui";
import st from "./studio.module.css";

type Info = { label?: string; description?: string; keywords?: string[] };

const info = (name: string) => (blocks as unknown as Record<string, Info>)[name] ?? {};

function matches(name: string, q: string) {
  if (!q) return true;
  const i = info(name);
  const hay = [name, i.label, i.description, ...(i.keywords ?? [])].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

export function AddPanel() {
  const [q, setQ] = useState("");
  const getPuck = useGetPuck();
  const { openGallery, currentId, content } = useStudio();
  const kind = content.pages[currentId]?.root.props.kind;

  const add = (name: string) => {
    const api = getPuck();
    const target = insertTarget(api as never);
    const id = `${name}-${crypto.randomUUID()}`;
    api.dispatch({ type: "insert", componentType: name, destinationZone: target.zone, destinationIndex: target.index, id });
    selectAndReveal(api as never, id, true, target);
  };

  const groups = Object.entries(categories)
    .map(([key, cat]) => ({ key, title: cat.title, names: cat.components.filter((n) => matches(n, q)).filter((n) => key !== "pageParts" || kind !== "page" || n === "PageTitle" || n === "BackLink") }))
    .filter((g) => g.names.length);

  return (
    <div className={`${ui.root} ${st.panel}`}>
      <PanelHead title="Add" />
      <div className={st.panelScroll}>
        <div className={ui.panelBody}>
          <button type="button" className={st.galleryButton} onClick={() => openGallery(insertTarget(getPuck() as never))}>
            <SquaresFourIcon size={24} />
            <span>
              <strong>Section designs</strong>
              <small>Ready-made arrangements of photos and words</small>
            </span>
          </button>

          <label className={st.search}>
            <MagnifyingGlassIcon size={16} />
            <input className={ui.input} type="search" placeholder="Find a block: photo, quote, swatch…" value={q} onChange={(e) => setQ(e.currentTarget.value)} aria-label="Find a block" />
          </label>

          {groups.length ? (
            groups.map((g) => (
              <section key={g.key} className={ui.section}>
                <h3 className={ui.caps}>{g.title}</h3>
                <Drawer>
                  <div className={st.tiles}>
                    {g.names.map((name) => (
                      <Drawer.Item key={name} name={name} label={info(name).label ?? name}>
                        {() => (
                          <div className={st.tile} title="Drag onto the page, or press + to add it after the selected block">
                            <BlockIcon name={name} size={20} />
                            <strong>{info(name).label ?? name}</strong>
                            <small>{info(name).description}</small>
                            <button
                              type="button"
                              className={st.tileAdd}
                              aria-label={`Add ${info(name).label ?? name}`}
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                add(name);
                              }}
                            >
                              <PlusIcon size={14} weight="bold" />
                            </button>
                          </div>
                        )}
                      </Drawer.Item>
                    ))}
                  </div>
                </Drawer>
              </section>
            ))
          ) : (
            <Empty title={`Nothing called “${q}”`} action={<button type="button" className={ui.button} onClick={() => setQ("")}>Show every block</button>}>
              Try a simpler word, like photo, text or colour.
            </Empty>
          )}
          <p className={ui.hint}>Drag a block onto the page to place it exactly, or press + on a tile to add it after the selected block.</p>
        </div>
      </div>
    </div>
  );
}
