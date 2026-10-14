"use client";

// "+ Add section": a gallery of ready-made section designs, each drawn as a
// small sketch in the site's materials. Choosing one deals it onto the page.
import { useGetPuck } from "@puckeditor/core";
import { useState, type CSSProperties } from "react";
import { insertTree } from "./puck-utils";
import { presetGroups, presets, type Sketch } from "./presets";
import { useStudio } from "./state";
import { Dialog } from "./ui";
import st from "./studio.module.css";

const SWATCH_TONES = ["#a34435", "#6a2222", "#0c213c", "#6a727d", "#4a6963", "#e4bb6b", "#ad6554", "#e2d9c7"];

function SketchRow({ row }: { row: Sketch }) {
  const spans = row.map((c) => c.span ?? Math.floor(12 / row.length));
  return (
    <div className={st.sketchRow}>
      {row.map((c, i) => {
        const style = { gridColumn: `span ${spans[i]}` } as CSSProperties;
        switch (c.kind) {
          case "bars":
            return (
              <div key={i} className={st.skBars} data-tone={c.tone} style={style}>
                {Array.from({ length: c.n ?? 2 }, (_, j) => (
                  <i key={j} />
                ))}
              </div>
            );
          case "photo":
            return <div key={i} className={st.skPhoto} data-tone={c.tone} style={style} />;
          case "band":
            return <div key={i} className={st.skBand} data-tone={c.tone} style={style} />;
          case "swatches":
            return (
              <div key={i} className={st.skSwatches} style={style}>
                {Array.from({ length: c.n ?? 4 }, (_, j) => (
                  <i key={j} style={{ background: SWATCH_TONES[j % SWATCH_TONES.length], rotate: `${((j * 37) % 7) - 3}deg` }} />
                ))}
              </div>
            );
          case "quote":
            return (
              <div key={i} className={st.skQuote} style={style}>
                <i />
                <i style={{ width: "70%" }} />
              </div>
            );
          case "button":
            return <div key={i} className={st.skButton} style={{ ...style, gridColumn: "4 / span 6" }} />;
          case "cols":
            return (
              <div key={i} className={st.skCols} style={{ ...style, "--n": c.n ?? 2 } as CSSProperties}>
                {Array.from({ length: c.n ?? 2 }, (_, j) => (
                  <div key={j} className={st.skBars}>
                    <i style={{ height: 8, background: "#161615", width: "60%" }} />
                    <i />
                    <i />
                  </div>
                ))}
              </div>
            );
          case "grid":
            return (
              <div key={i} className={st.skGrid} style={style}>
                {Array.from({ length: c.n ?? 6 }, (_, j) => (
                  <i key={j} style={{ aspectRatio: j % 2 ? "4 / 5" : "1" }} />
                ))}
              </div>
            );
          case "board":
            return (
              <div key={i} className={st.skBoard} style={{ ...style, gridColumn: "1 / -1" }}>
                <i style={{ left: "8%", top: "14%", width: "34%", height: "62%" }} />
                <i style={{ left: "38%", top: "30%", width: "26%", height: "50%", background: "#6a2222", rotate: "3deg" }} />
                <i style={{ left: "68%", top: "12%", width: "22%", height: "22%", background: "#e4bb6b", rotate: "-4deg" }} />
                <i style={{ left: "10%", top: "82%", width: "30%", height: "6%", background: "#161615" }} />
              </div>
            );
          case "word":
            return <div key={i} className={st.skWord} style={style} />;
        }
      })}
    </div>
  );
}

export function SectionGallery() {
  const { gallery, closeGallery } = useStudio();
  const getPuck = useGetPuck();
  const [group, setGroup] = useState<string>("All");
  const list = presets.filter((p) => group === "All" || p.group === group);

  const choose = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset || !gallery) return;
    closeGallery();
    insertTree(getPuck() as never, preset.tree as never, gallery);
  };

  return (
    <Dialog open={Boolean(gallery)} onClose={closeGallery} title="Add a section" size="l">
      <div className={st.galleryGrid}>
        <nav className={st.galleryNav} aria-label="Kinds of section">
          {["All", ...presetGroups].map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
        </nav>
        <div className={st.presets}>
          {list.map((p) => (
            <button key={p.id} type="button" className={st.preset} onClick={() => choose(p.id)}>
              <span className={st.sketch} aria-hidden="true">
                {p.sketch.map((row, i) => (
                  <SketchRow key={i} row={row} />
                ))}
              </span>
              <strong>{p.title}</strong>
              <small>{p.description}</small>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
