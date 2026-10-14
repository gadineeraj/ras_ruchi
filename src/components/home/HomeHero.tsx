import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { getHeroSwatches } from "@/lib/data";
import { NavLinks } from "../NavLinks";
import { SwatchCaption, SwatchChips, SwatchPicker, SwatchShopLink, SwatchWindow } from "../SwatchPicker";
import styles from "./HomeHero.module.css";

// The first card of the book: printed header rule with the navigation, the name
// across the card, and a row of real swatches that open a window onto the room.
export function HomeHero() {
  const swatches = getHeroSwatches();
  return (
    <section className={`wrap card ${styles.card}`} aria-labelledby="hero-title" data-hero>
      <span className="card-hole" style={{ top: 18, left: 18 }} aria-hidden="true" />
      <div className={styles.rule}>
        <p className="t-label">Shruchi Jaiswal, textile designer</p>
        <NavLinks />
      </div>

      <SwatchPicker items={swatches} label="Swatches from five collections">
        <h1 id="hero-title" className={`t-wordmark ${styles.mark}`}>
          ras<span className="wordmark-dot">.</span>ruchi
        </h1>
        <div className={styles.meta}>
          <span className={`t-deva ${styles.deva}`} lang="hi">
            रसरुचि
          </span>
          <p className="t-label">Design Lead at The Yellow Dwelling</p>
        </div>

        <div className={styles.intro}>
          <p className="t-lead">
            Shruchi Jaiswal draws motifs from craft, ritual and place, and turns them into cloth that people live with.
          </p>
          <Link href="/collections" className={styles.cta}>
            Open the collections
            <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <figure className={styles.viewer}>
          <SwatchWindow className={styles.window} sizes="(max-width: 860px) 92vw, 30vw" preload />
          <figcaption className={styles.caption}>
            <SwatchCaption />
            <SwatchShopLink />
          </figcaption>
        </figure>

        <SwatchChips className={styles.chips} sizes="(max-width: 860px) 30vw, 9vw" />
      </SwatchPicker>
    </section>
  );
}
