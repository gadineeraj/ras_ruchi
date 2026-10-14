"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/content-types";
import styles from "./SiteHeader.module.css";

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
const EXTERNAL = /^(https?:|mailto:)/;

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = trim(usePathname() ?? "/");
  return (
    <nav aria-label="Main">
      <ul className={styles.nav}>
        {links.map(({ href, label }) => {
          const internal = href.startsWith("/");
          const path = trim(href.split("#")[0]);
          const current = internal && path !== "/" && (pathname === path || pathname.startsWith(`${path}/`));
          return (
            <li key={`${href}-${label}`}>
              {EXTERNAL.test(href) ? (
                <a href={href} className={`t-label ${styles.link}`} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener">
                  {label}
                </a>
              ) : (
                <Link href={internal && !href.includes("#") && !href.endsWith("/") ? `${href}/` : href} className={`t-label ${styles.link}`} aria-current={current ? "page" : undefined}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
