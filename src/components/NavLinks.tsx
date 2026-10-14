"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

const LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/studies", label: "Studies" },
  { href: "/practice", label: "Practice" },
  { href: "#contact", label: "Contact" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className={styles.nav}>
        {LINKS.map(({ href, label }) => {
          const current = href !== "#contact" && (pathname === href || pathname.startsWith(`${href}/`));
          return (
            <li key={href}>
              <Link href={href} className={`t-label ${styles.link}`} aria-current={current ? "page" : undefined}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
