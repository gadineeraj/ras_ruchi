"use client";

// Choosing from her own work: a collection, a study page, one colourway, or a
// whole design. Colourways and designs are chosen from their pinked chips.
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Collection, Colourway, Design } from "@/lib/content-types";
import { findPick } from "@/lib/library";
import { useStudio } from "../state";
import { Button, Dialog, Empty, ui } from "../ui";
import { FieldShell, matches, PinkedChip } from "./common";
import type { FieldProps } from "./types";
import css from "./fields.module.css";

// --------------------------------------------------------------- collection

export function CollectionField({ field, id, value, onChange, readOnly }: FieldProps<string | null | undefined, { allowPage?: boolean }>) {
  const { content, meta } = useStudio();
  const allowPage = Boolean(field.metadata?.allowPage);
  const current = value ?? "";
  const collections = content.collections;
  const chosen = collections.find((c) => c.slug === current);
  const missing = Boolean(current) && !chosen;
  const pageCollection = collections.find((c) => c.slug === meta.page.collection);
  const shown = chosen ?? (allowPage && !current ? pageCollection : undefined);

  return (
    <FieldShell
      label={field.label}
      labelId={`${id}-label`}
      htmlFor={id}
      readOnly={readOnly}
      error={missing ? "This collection is no longer in the library. Choose another." : null}
      hint={allowPage && !current ? (pageCollection ? `Shows ${pageCollection.name}, the collection this page is about.` : "This page isn't about a collection, so the first one shows.") : null}
    >
      <div className={css.selectRow}>
        <span className={css.band} style={{ backgroundColor: shown?.band }} data-empty={shown ? undefined : ""} aria-hidden="true" />
        <select id={id} className={ui.select} value={current} onChange={(e) => onChange(e.currentTarget.value)}>
          {allowPage ? <option value="">This page&rsquo;s collection</option> : !current ? <option value="">Choose a collection</option> : null}
          {missing ? <option value={current}>{current} (removed)</option> : null}
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name} · {c.season}
            </option>
          ))}
        </select>
      </div>
    </FieldShell>
  );
}

// -------------------------------------------------------------------- study

export function StudyField({ field, id, value, onChange, readOnly }: FieldProps<string | null | undefined>) {
  const { meta } = useStudio();
  const current = value ?? "";
  const studies = meta.studies;
  const missing = Boolean(current) && !studies.some((s) => s.id === current);
  return (
    <FieldShell label={field.label} labelId={`${id}-label`} htmlFor={id} readOnly={readOnly} error={missing ? "This study page no longer exists. Choose another." : null}>
      <select id={id} className={ui.select} value={current} onChange={(e) => onChange(e.currentTarget.value)}>
        {!current ? (
          <option value="" disabled>
            Choose a study
          </option>
        ) : null}
        {missing ? <option value={current}>{current} (removed)</option> : null}
        {studies.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      {!studies.length ? <p className={ui.hint}>No study pages yet. Add one from Pages.</p> : null}
    </FieldShell>
  );
}

// ------------------------------------------------------ colourway, design

type Level = "colourway" | "design";

export function ColourwayField(props: FieldProps<string | null | undefined>) {
  return <SwatchRefField {...props} level="colourway" />;
}

export function DesignField(props: FieldProps<string | null | undefined>) {
  return <SwatchRefField {...props} level="design" />;
}

function SwatchRefField({ field, id, value, onChange, readOnly, level }: FieldProps<string | null | undefined> & { level: Level }) {
  const { content } = useStudio();
  const [open, setOpen] = useState(false);
  const pick = value ?? "";
  const hit = pick ? findPick(content.collections, pick) : null;
  const labelId = `${id}-label`;
  const noun = level === "colourway" ? "colourway" : "design";

  return (
    <FieldShell label={field.label} labelId={labelId} readOnly={readOnly}>
      <div className={css.pickRow}>
        {hit ? <PinkedChip img={hit.colourway.chip} size={48} /> : <span className={css.chipEmpty} aria-hidden="true" />}
        <span className={css.pickText}>
          {hit ? (
            <>
              <strong>{hit.design.name}</strong>
              <span>{level === "colourway" ? hit.colourway.name : `${hit.design.colourways.length} ${hit.design.colourways.length === 1 ? "colourway" : "colourways"}`}</span>
              <span className={ui.hint}>{hit.collection.name}</span>
            </>
          ) : pick ? (
            <span className={css.warn}>
              <WarningIcon size={15} aria-hidden="true" />
              This {noun} is no longer in the collections.
            </span>
          ) : (
            <span className={ui.hint}>No {noun} chosen yet.</span>
          )}
        </span>
        <Button size="s" onClick={() => setOpen(true)} aria-describedby={labelId}>
          {hit ? "Change" : "Choose"}
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} size="l" title={level === "colourway" ? "Choose a colourway" : "Choose a design"}>
        <SwatchBrowser
          level={level}
          current={pick}
          onPick={(ref) => {
            onChange(ref);
            setOpen(false);
          }}
        />
      </Dialog>
    </FieldShell>
  );
}

type Group = { c: Collection; designs: { d: Design; cws: Colourway[] }[] };

/** Every colourway (or design) grouped by collection, filtered by a search. */
function SwatchBrowser({ level, current, onPick }: { level: Level; current: string; onPick: (ref: string) => void }) {
  const { content } = useStudio();
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    search.current?.focus();
    body.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: "center" });
  }, []);

  const groups = useMemo<Group[]>(
    () =>
      content.collections
        .map((c) => ({
          c,
          designs: c.designs
            .map((d) => ({
              d,
              cws:
                level === "colourway"
                  ? d.colourways.filter((cw) => matches(query, `${c.name} ${c.season} ${d.name} ${cw.name}`))
                  : matches(query, `${c.name} ${c.season} ${d.name} ${d.colourways.map((cw) => cw.name).join(" ")}`)
                    ? d.colourways
                    : [],
            }))
            .filter((x) => x.cws.length > 0),
        }))
        .filter((g) => g.designs.length > 0),
    [content.collections, level, query],
  );

  const placeholder = level === "colourway" ? "Search by design, colourway or collection" : "Search by design or collection";

  return (
    <div className={css.library} ref={body}>
      <div className={css.search}>
        <MagnifyingGlassIcon size={16} aria-hidden="true" />
        <input ref={search} className={ui.input} type="search" value={query} placeholder={placeholder} aria-label={placeholder} onChange={(e) => setQuery(e.currentTarget.value)} />
      </div>

      {groups.length === 0 ? (
        <Empty title="Nothing matches" action={<Button onClick={() => setQuery("")}>Show everything</Button>}>
          {content.collections.length ? "Try a design, colourway or collection name." : "There are no collections yet."}
        </Empty>
      ) : (
        groups.map(({ c, designs }) => (
          <section key={c.slug} className={css.libGroup} aria-labelledby={`lib-${c.slug}`}>
            <h3 className={css.libHead} id={`lib-${c.slug}`}>
              <span className={css.band} style={{ backgroundColor: c.band }} aria-hidden="true" />
              {c.name}
              <span className={ui.hint}>{c.season}</span>
            </h3>
            {level === "colourway" ? (
              <div className={css.libDesigns}>
                {designs.map(({ d, cws }) => (
                  <div key={d.slug} className={css.libDesign}>
                    <p className={css.libDesignName}>{d.name}</p>
                    <div className={css.libChips}>
                      {cws.map((cw) => {
                        const ref = `${c.slug}/${d.slug}/${cw.id}`;
                        return (
                          <button key={cw.id} type="button" className={css.libChip} aria-pressed={ref === current} title={`${d.name} in ${cw.name}`} onClick={() => onPick(ref)}>
                            <PinkedChip img={cw.chip} />
                            <span>{cw.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={css.libChips} data-level="design">
                {designs.map(({ d }) => {
                  const ref = `${c.slug}/${d.slug}`;
                  return (
                    <button key={d.slug} type="button" className={css.libChip} aria-pressed={ref === current} onClick={() => onPick(ref)}>
                      <PinkedChip img={d.colourways[0]?.chip} />
                      <span>{d.name}</span>
                      <span className={ui.hint}>
                        {d.colourways.length} {d.colourways.length === 1 ? "colourway" : "colourways"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
