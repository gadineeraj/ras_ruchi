import type { ReactNode } from "react";
import type { SiteMeta } from "@/lib/content-types";
import type { LayoutProps } from "./shared";

/** What Puck hands every block besides its own props. */
export type PuckBits = {
  id: string;
  puck: {
    metadata: SiteMeta;
    isEditing: boolean;
    dragRef?: ((el: Element | null) => void) | null;
  };
};

export type WithLayout<P> = P & { layout: LayoutProps };

/** A slot prop renders as a component in the block. */
export type SlotRender = (props: { className?: string; style?: React.CSSProperties; minEmptyHeight?: number; allow?: string[] }) => ReactNode;

export type Meta = SiteMeta;
