import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { colourwayCount, getCollections } from "@/lib/data";
import { Swatch } from "./Swatch";
import styles from "./CollectionStack.module.css";
import { kern } from "./kern";

// The collections as a swatch book on a ring: each card sticks as you scroll and
// the next slides over it, leaving its printed band showing like a tab.
export function CollectionStack({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <ol className={styles.stack}>
      {getCollections().map((c, n) => (
        <li key={c.slug} className={styles.item} style={{ "--n": n } as CSSProperties}>
          <Link href={`/collections/${c.slug}`} className={`card ${styles.card}`} data-on={c.onBand}>
            <ViewTransition name={`band-${c.slug}`} share="morph" default="none">
              <div className={styles.band} style={{ backgroundColor: c.band }}>
                <span className="card-hole" style={{ top: 14, left: 14 }} aria-hidden="true" />
                <Heading className={`t-display ${styles.name}`}>{kern(c.name)}</Heading>
                <span className={`t-label ${styles.season}`}>{c.season}</span>
              </div>
            </ViewTransition>
            <div className={styles.body}>
              <div className={styles.text}>
                {c.line ? <p className={styles.line}>{c.line}</p> : null}
                <p className="t-body">{c.intro}</p>
                <p className="t-shade">
                  {c.designs.length} designs, {colourwayCount(c)} colourways
                </p>
              </div>
              <ul className={styles.strip} aria-hidden="true">
                {c.designs.slice(0, 10).map((d, i) => (
                  <li key={d.slug}>
                    <Swatch chip={d.colourways[0].chip} index={i + n} sizes="(max-width: 700px) 18vw, 7vw" />
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
