import { site } from "@/lib/site";
import styles from "./SiteFooter.module.css";
import { kern } from "./kern";

// The back of the shade card: who to write to, and where the photographs come from.
export function SiteFooter() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={`wrap card ${styles.card}`}>
        <span className="card-hole" style={{ top: 18, left: 18 }} aria-hidden="true" />
        <h2 className={`t-display ${styles.heading}`}>{kern("Write to Shruchi")}</h2>
        <a className={styles.email} href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <ul className={styles.links}>
          <li>
            <a className="t-label" href={site.instagram.url} rel="noopener" target="_blank">
              Instagram {site.instagram.handle}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a className="t-label" href={site.behance.url} rel="noopener" target="_blank">
              Behance
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a className="t-label" href={site.employer.url} rel="noopener" target="_blank">
              {site.employer.name}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
        <div className={styles.small}>
          <p>Product photographs courtesy of The Yellow Dwelling. Study images from Shruchi&rsquo;s Behance.</p>
          <p>
            &copy; 2026 {site.person}
          </p>
        </div>
      </div>
    </footer>
  );
}
