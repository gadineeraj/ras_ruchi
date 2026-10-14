import Link from "next/link";
import type { SiteSettings } from "@/lib/content-types";
import { NavLinks } from "./NavLinks";
import { Wordmark } from "./Wordmark";
import styles from "./SiteHeader.module.css";

export function SiteHeader({ site }: { site: SiteSettings }) {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <Link href="/" className={styles.mark} aria-label={`${site.name}, home`}>
          <span className={styles.word}>
            <Wordmark name={site.name} />
          </span>
          {site.nameDevanagari ? (
            <span className={`t-deva ${styles.deva}`} lang="hi" aria-hidden="true">
              {site.nameDevanagari}
            </span>
          ) : null}
        </Link>
        <NavLinks links={site.nav} />
      </div>
    </header>
  );
}
