"use client";
// TEMPORARY check for the Photos and Collections panels and the artboard
// field. Every save is blocked here, so nothing is written to content/.
// Delete after review.
import "@puckeditor/core/no-external.css";
import { Puck } from "@puckeditor/core";
import { useState } from "react";
import type { Content } from "@/studio/api";
import { ConfirmDialog, Toasts } from "@/studio/chrome";
import { buildStudioConfig } from "@/studio/config";
import { PhotoPicker } from "@/studio/fields/PhotoPicker";
import { CollectionsPanel } from "@/studio/panels/CollectionsPanel";
import { PhotosPanel } from "@/studio/panels/PhotosPanel";
import { StudioProvider, useStudio } from "@/studio/state";
import ui from "@/studio/ui.module.css";

if (typeof window !== "undefined") {
  const w = window as unknown as { __writesBlocked?: boolean; __blocked?: string[] };
  if (!w.__writesBlocked) {
    const real = window.fetch.bind(window);
    w.__blocked = [];
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const method = (init.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      if (url.includes("/api/studio/") && method !== "GET") {
        w.__blocked?.push(`${method} ${url}`);
        const body = url.includes("/swatch/")
          ? { src: "/images/tyd/rasaa/kinari--brick-red--chip-25eae6de.webp", width: 720, height: 720, blur: "", color: "#a84838", shade: "#a34435" }
          : { ok: true, items: [], errors: [], changed: [] };
        return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));
      }
      return real(input, init);
    };
    w.__writesBlocked = true;
  }
}

const config = buildStudioConfig();

const DATA = {
  root: { props: { title: "Check", path: "/zz-check", kind: "page", description: "" } },
  content: [
    {
      type: "FreeCanvas",
      props: {
        id: "FreeCanvas-check",
        ratio: "16:9",
        background: "card",
        mobile: "scale",
        label: "",
        items: [
          { id: "t1", kind: "text", x: 6, y: 10, w: 44, h: 20, rotate: 0, z: 2, text: "A mood board", textStyle: "display", fontSize: 6, align: "start" },
          { id: "s1", kind: "shape", x: 58, y: 14, w: 30, h: 62, rotate: 2, z: 1, color: "#6a2222" },
          { id: "w1", kind: "swatch", x: 10, y: 50, w: 14, h: 24.89, rotate: -4, z: 3, pick: "rasaa/kinari/brick-red" },
          { id: "p1", kind: "photo", x: 64, y: 30, w: 20, h: 60, rotate: 0, z: 4, frame: "mounted", photo: { src: "/images/tyd/rasaa/kinari--brick-red--scene-de474d9d.webp", width: 1200, height: 1700, blur: "", color: "#a84838", alt: "" } },
        ],
        layout: { width: "wide", space: "m", show: "all", motion: "none" },
      },
    },
  ],
  zones: {},
};

function Inner() {
  const { meta } = useStudio();
  const [which, setWhich] = useState<"photos" | "collections">("photos");
  return (
    <div className={ui.root} style={{ display: "flex", height: "100vh", background: "#d6d6d1" }}>
      <nav style={{ width: 90, display: "grid", alignContent: "start", gap: 4, padding: 4 }}>
        <button type="button" id="tab-photos" onClick={() => setWhich("photos")}>photos</button>
        <button type="button" id="tab-collections" onClick={() => setWhich("collections")}>collections</button>
      </nav>
      <aside style={{ width: 320, height: "100vh", background: "#f4f4f1", borderRight: "1px solid rgb(0 0 0 / .13)" }}>{which === "photos" ? <PhotosPanel /> : <CollectionsPanel />}</aside>
      <Puck config={config} data={DATA as never} metadata={meta as never} ui={{ itemSelector: { index: 0, zone: "root:default-zone" } } as never} onChange={(d) => ((window as unknown as { __lastData: unknown }).__lastData = d)}>
        <section id="fields" style={{ width: 340, height: "100vh", overflow: "auto", background: "#f4f4f1", padding: 16 }}>
          <Puck.Fields />
        </section>
        <PhotoPicker />
        <ConfirmDialog />
        <Toasts />
      </Puck>
    </div>
  );
}

export function Harness({ initial }: { initial: Content }) {
  return (
    <StudioProvider initial={initial}>
      <Inner />
    </StudioProvider>
  );
}
