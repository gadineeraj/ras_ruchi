import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { getStudies } from "@/lib/data";
import styles from "./StudyIndex.module.css";
import { kern } from "./kern";

// Her studies as development sheets: card stock with a punched hole, a plate
// mounted on it, and the craft and client printed along the foot.
export function StudyIndex({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  const studies = getStudies();
  const featured = studies.filter((s) => s.featured);
  const rest = studies.filter((s) => !s.featured);

  return (
    <div className={styles.index}>
      <ul className={styles.featured}>
        {featured.map((s, i) => {
          const wide = i === 0 || i === 5;
          return (
            <li key={s.slug} className={wide ? styles.wide : undefined}>
              <Link href={`/studies/${s.slug}`} className={`card ${styles.sheet}`}>
                <span className="card-hole" style={{ top: 14, left: 14 }} aria-hidden="true" />
                <ViewTransition name={`study-${s.slug}`} share="morph" default="none">
                  <div className={styles.plate} style={{ backgroundColor: s.coverImage.color, aspectRatio: wide ? "3 / 2" : "4 / 5" }}>
                    <Image
                      src={s.coverImage.src}
                      alt=""
                      fill
                      sizes={wide ? "(max-width: 760px) 90vw, 46vw" : "(max-width: 760px) 90vw, 22vw"}
                      quality={82}
                      placeholder="blur"
                      blurDataURL={s.coverImage.blur}
                      unoptimized={s.coverImage.animated}
                    />
                  </div>
                </ViewTransition>
                <div className={styles.meta}>
                  <Heading className="t-title">{kern(s.title)}</Heading>
                  <p className={styles.hook}>{s.hook}</p>
                </div>
                <dl className={styles.credits}>
                  {s.credits.slice(0, 2).map((c) => (
                    <div key={c.label}>
                      <dt className="t-label">{c.label}</dt>
                      <dd>{c.value}</dd>
                    </div>
                  ))}
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className={styles.rest}>
        {rest.map((s) => (
          <li key={s.slug}>
            <Link href={`/studies/${s.slug}`} className={`card ${styles.small}`}>
              <ViewTransition name={`study-${s.slug}`} share="morph" default="none">
                <div className={styles.thumb} style={{ backgroundColor: s.coverImage.color }}>
                  <Image src={s.coverImage.src} alt="" fill sizes="(max-width: 760px) 30vw, 9vw" placeholder="blur" blurDataURL={s.coverImage.blur} />
                </div>
              </ViewTransition>
              <span className={styles.smallText}>
                <Heading className={styles.smallTitle}>{kern(s.title)}</Heading>
                <span className={styles.smallHook}>{s.hook}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
