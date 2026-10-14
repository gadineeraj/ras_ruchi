import type { ReactNode } from "react";
import styles from "./Section.module.css";
import { kern } from "./kern";

export function Section({ id, title, lede, children }: { id?: string; title: string; lede?: ReactNode; children: ReactNode }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className={`wrap ${styles.section}`} aria-labelledby={headingId}>
      <header className={styles.head}>
        <h2 id={headingId} className="t-display">
          {kern(title)}
        </h2>
        {lede ? <p className={`t-lead ${styles.lede}`}>{lede}</p> : null}
      </header>
      {children}
    </section>
  );
}
