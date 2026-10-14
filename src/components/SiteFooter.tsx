import type { SiteSettings } from "@/lib/content-types";
import styles from "./SiteFooter.module.css";
import { kern } from "./kern";

// The back of the shade card: who to write to, and where the photographs come from.
export function SiteFooter({ site }: { site: SiteSettings }) {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`wrap card ${styles.card}`}>
        <span className="card-hole" style={{ top: 18, left: 18 }} aria-hidden="true" />
        <h2 className={`t-display ${styles.heading}`}>{kern(site.footer.heading)}</h2>
        {site.email ? (
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        ) : null}
        {site.links.length ? (
          <ul className={styles.links}>
            {site.links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <a className="t-label" href={l.href} rel="noopener" target="_blank">
                  {l.label}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.small}>
          {site.footer.credit ? <p>{site.footer.credit}</p> : null}
          {site.footer.copyright ? <p>{site.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p> : null}
        </div>
      </div>
    </footer>
  );
}
