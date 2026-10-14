import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { DesignRow } from "@/components/DesignRow";
import { colourwayCount, getCollection, getCollections } from "@/lib/data";
import styles from "./page.module.css";
import { kern } from "@/components/kern";

export function generateStaticParams() {
  return getCollections().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: `${c.name}, ${c.season}`, description: c.intro } : {};
}

// The page shell renders at once; the slug-specific content is prerendered for
// every known slug and streams behind the fallback only for unknown ones.
export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<div className={styles.pending} aria-busy="true" />}>
      <CollectionPageContent params={params} />
    </Suspense>
  );
}

async function CollectionPageContent({ params }: { params: PageProps<"/collections/[slug]">["params"] }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const all = getCollections();
  const at = all.findIndex((c) => c.slug === slug);
  const prev = all[(at - 1 + all.length) % all.length];
  const next = all[(at + 1) % all.length];

  return (
    <div className={`wrap ${styles.page}`}>
      <Link href="/collections" className={`t-label ${styles.back}`}>
        <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
        All collections
      </Link>

      <article className={`card ${styles.card}`} data-on={collection.onBand}>
        <ViewTransition name={`band-${collection.slug}`} share="morph" default="none">
          <header className={styles.band} style={{ backgroundColor: collection.band }}>
            <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
            <h1 className={`t-wordmark ${styles.name}`}>{kern(collection.name)}</h1>
            <p className={`t-label ${styles.season}`}>{collection.season}</p>
          </header>
        </ViewTransition>

        <div className={styles.intro}>
          {collection.line ? <p className={styles.line}>{collection.line}</p> : null}
          <p className="t-lead">{collection.intro}</p>
          <p className="t-shade">
            {collection.designs.length} designs, {colourwayCount(collection)} colourways. Designed by Shruchi as Design Lead at The
            Yellow Dwelling; descriptions are the shop&rsquo;s own.
          </p>
        </div>

        <nav className={styles.index} aria-label={`Designs in ${collection.name}`}>
          <ul>
            {collection.designs.map((d) => (
              <li key={d.slug}>
                <a href={`#${d.slug}`} className="t-label">
                  {d.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.rows}>
          {collection.designs.map((d, i) => (
            <DesignRow key={d.slug} collection={collection} design={d} index={i} />
          ))}
        </div>
      </article>

      <nav className={styles.pager} aria-label="Other collections">
        <Link href={`/collections/${prev.slug}`} className={styles.pagerLink}>
          <span className="t-label">
            <ArrowLeftIcon size={13} weight="bold" aria-hidden="true" /> Previous card
          </span>
          <span className={styles.pagerName}>
            <span className={styles.dot} style={{ backgroundColor: prev.band }} aria-hidden="true" />
            {kern(prev.name)}
          </span>
        </Link>
        <Link href={`/collections/${next.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
          <span className="t-label">
            Next card <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
          </span>
          <span className={styles.pagerName}>
            <span className={styles.dot} style={{ backgroundColor: next.band }} aria-hidden="true" />
            {kern(next.name)}
          </span>
        </Link>
      </nav>
    </div>
  );
}
