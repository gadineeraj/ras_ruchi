import Link from "next/link";
import { NavLinks } from "./NavLinks";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.mark} aria-label="ras.ruchi, home">
          <span className={styles.word}>
            ras<span className="wordmark-dot">.</span>ruchi
          </span>
          <span className={`t-deva ${styles.deva}`} lang="hi" aria-hidden="true">
            रसरुचि
          </span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
