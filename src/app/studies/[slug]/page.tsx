import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { getStudies, getStudy, type Img, type StudyBlock } from "@/lib/data";
import styles from "./page.module.css";
import { kern } from "@/components/kern";

export function generateStaticParams() {
  return getStudies().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/studies/[slug]">): Promise<Metadata> {
  const s = getStudy((await params).slug);
  return s ? { title: s.title, description: s.hook } : {};
}

function Figure({ img, sizes, alt }: { img: Img; sizes: string; alt: string }) {
  return (
    <Image
      src={img.src}
      alt={alt}
      width={img.width}
      height={img.height}
      sizes={sizes}
      quality={82}
      placeholder="blur"
      blurDataURL={img.blur}
      unoptimized={img.animated}
      className={styles.img}
      style={{ backgroundColor: img.color }}
    />
  );
}

// `title` names the images: the study plus the section they illustrate.
function Block({ block, title }: { block: StudyBlock; title: string }) {
  switch (block.type) {
    case "heading":
      return <h2 className={`t-title ${styles.heading}`}>{kern(block.text)}</h2>;
    case "para":
      return <p className={`t-body ${styles.para}`}>{block.text}</p>;
    case "keywords":
      return (
        <ul className={styles.keywords} aria-label="Keywords">
          {block.items.map((k) => (
            <li key={k} className="t-label">
              {k}
            </li>
          ))}
        </ul>
      );
    case "list":
      return (
        <div className={styles.para}>
          <p className="t-body">{block.lead}</p>
          <ol className={styles.list}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      );
    case "images": {
      const n = block.images.length;
      const cols = n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3;
      return (
        <div className={styles.images} data-cols={cols}>
          {block.images.map((img, i) => (
            <Figure key={img.src} img={img} alt={n > 1 ? `${title}, ${i + 1} of ${n}` : title} sizes={cols === 1 ? "(max-width: 900px) 94vw, 1100px" : `(max-width: 900px) 94vw, ${Math.round(100 / cols)}vw`} />
          ))}
        </div>
      );
    }
  }
}

// The page shell renders at once; the slug-specific content is prerendered for
// every known slug and streams behind the fallback only for unknown ones.
export default function StudyPage({ params }: PageProps<"/studies/[slug]">) {
  return (
    <Suspense fallback={<div className={styles.pending} aria-busy="true" />}>
      <StudyPageContent params={params} />
    </Suspense>
  );
}

async function StudyPageContent({ params }: { params: PageProps<"/studies/[slug]">["params"] }) {
  const { slug } = await params;
  const study = getStudy(slug);
  if (!study) notFound();

  const all = getStudies();
  const next = all[(all.findIndex((s) => s.slug === slug) + 1) % all.length];

  return (
    <article className={`wrap ${styles.page}`}>
      <Link href="/studies" className={`t-label ${styles.back}`}>
        <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
        All studies
      </Link>

      <header className={styles.header}>
        <div className={styles.titles}>
          <h1 className="t-display">{kern(study.title)}</h1>
          <p className={`t-lead ${styles.hook}`}>{study.hook}</p>
        </div>
        <dl className={styles.credits}>
          {study.credits.map((c) => (
            <div key={c.label} className={styles.credit}>
              <dt className="t-label">{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <ViewTransition name={`study-${study.slug}`} share="morph" default="none">
        <div className={styles.cover} style={{ backgroundColor: study.coverImage.color }}>
          <Image
            src={study.coverImage.src}
            alt={`${study.title}: ${study.hook}`}
            fill
            sizes="(max-width: 900px) 94vw, 1440px"
            quality={82}
            preload
            placeholder="blur"
            blurDataURL={study.coverImage.blur}
            unoptimized={study.coverImage.animated}
          />
        </div>
      </ViewTransition>

      <div className={styles.body}>
        {study.blocks.map((b, i) => {
          const section = study.blocks.slice(0, i).findLast((x) => x.type === "heading");
          const title = section?.type === "heading" ? `${study.title}, ${section.text.toLowerCase()}` : study.title;
          return <Block key={i} block={b} title={title} />;
        })}
      </div>

      <footer className={styles.foot}>
        <p className={styles.source}>
          Words and images from Shruchi&rsquo;s Behance.{" "}
          {study.behanceUrls.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noopener" className={styles.inline}>
              {study.behanceUrls.length > 1 ? `Part ${i + 1}` : "See the original"}
              <ArrowUpRightIcon size={12} weight="bold" aria-hidden="true" />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ))}
        </p>
        <Link href={`/studies/${next.slug}`} className={styles.next}>
          <span className="t-label">
            Next study <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
          </span>
          <span className={styles.nextName}>{kern(next.title)}</span>
        </Link>
      </footer>
    </article>
  );
}
