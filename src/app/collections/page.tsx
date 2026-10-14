import type { Metadata } from "next";
import { CollectionStack } from "@/components/CollectionStack";
import styles from "../index.module.css";

export const metadata: Metadata = {
  title: "Collections",
  description: "Rasaa, Entwine, Ratna, Pause and earlier seasons: the home collections Shruchi Jaiswal designs at The Yellow Dwelling.",
};

export default function CollectionsPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="t-display">Collections</h1>
        <p className={`t-lead ${styles.lede}`}>
          Five collections designed as Design Lead at The Yellow Dwelling, Bangalore. Each card holds every design in its colourways.
        </p>
      </header>
      <CollectionStack headingLevel={2} />
    </div>
  );
}
