import { toSwatchItem, type Collection, type Design } from "@/lib/data";
import { SwatchChips, SwatchPicker, SwatchShopLink, SwatchWindow } from "./SwatchPicker";
import styles from "./DesignRow.module.css";
import { kern } from "./kern";

// One design on the shade card: its name and technique, the shop's note on it,
// every colourway as a swatch, and a window onto whichever one is lifted.
export function DesignRow({ collection, design, index }: { collection: Collection; design: Design; index: number }) {
  const items = design.colourways.map((cw) => toSwatchItem(collection, design, cw));
  const many = items.length > 1;
  return (
    <article id={design.slug} className={styles.row} data-single={many ? undefined : ""} aria-labelledby={`${design.slug}-name`}>
      <SwatchPicker items={items} label={`${design.name} colourways`}>
        <div className={styles.text}>
          <header className={styles.head}>
            <h2 id={`${design.slug}-name`} className="t-title">
              {kern(design.name)}
            </h2>
            <p className="t-label">
              {design.technique}
              {many ? `, ${items.length} colourways` : null}
            </p>
          </header>
          {design.story ? <p className={`t-body ${styles.story}`}>{design.story}</p> : null}
          <SwatchChips className={styles.chips} sizes={many ? "(max-width: 860px) 26vw, 8vw" : "260px"} labels="colourway" />
          <SwatchShopLink />
        </div>
        <SwatchWindow className={styles.window} sizes="(max-width: 860px) 92vw, 40vw" preload={index === 0} />
      </SwatchPicker>
    </article>
  );
}
