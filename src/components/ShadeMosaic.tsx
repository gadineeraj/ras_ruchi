import Link from "next/link";
import { getCollections } from "@/lib/data";
import { Swatch } from "./Swatch";
import styles from "./ShadeMosaic.module.css";
import { kern } from "./kern";

// Every colourway on one mounted board, a printed row per collection. Each
// swatch opens its design on the collection's card.
export function ShadeMosaic() {
  let n = 0;
  return (
    <div className={`card ${styles.board}`}>
      <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
      {getCollections().map((c) => (
        <section key={c.slug} className={styles.group} aria-labelledby={`board-${c.slug}`}>
          <header className={styles.label}>
            <span className={styles.band} style={{ backgroundColor: c.band }} aria-hidden="true" />
            <h3 id={`board-${c.slug}`} className={styles.name}>
              <Link href={`/collections/${c.slug}`}>{kern(c.name)}</Link>
            </h3>
            <p className="t-shade">{c.season}</p>
          </header>
          <ul className={styles.chips}>
            {c.designs.flatMap((d) =>
              d.colourways.map((cw) => (
                <li key={`${d.slug}-${cw.name}`}>
                  <Link href={`/collections/${c.slug}#${d.slug}`} className={styles.link} aria-label={`${d.name} in ${cw.name}`} title={`${d.name}, ${cw.name}`}>
                    <Swatch chip={cw.chip} index={n++} sizes="72px" />
                  </Link>
                </li>
              )),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
