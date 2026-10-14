import Image from "next/image";
import type { CSSProperties } from "react";
import type { Img } from "@/lib/content-types";
import { asset } from "@/lib/paths";
import styles from "./Swatch.module.css";

// A square of cloth cut with pinking shears and glued to the card a little
// crooked, the way swatches sit on a hand-assembled shade card.
export function Swatch({ chip, index = 0, sizes, alt = "" }: { chip: Img; index?: number; sizes: string; alt?: string }) {
  const tilt = (((index * 37) % 7) - 3) * 0.35;
  return (
    <span data-lift className={styles.lift} style={{ "--tilt": `${tilt}deg`, "--i": index } as CSSProperties}>
      <span className={styles.cloth} style={{ backgroundColor: chip.color }}>
        <Image src={asset(chip.src)} alt={alt} fill sizes={sizes} quality={82} placeholder="blur" blurDataURL={chip.blur} />
      </span>
    </span>
  );
}
