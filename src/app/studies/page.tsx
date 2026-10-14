import type { Metadata } from "next";
import { StudyIndex } from "@/components/StudyIndex";
import styles from "../index.module.css";

export const metadata: Metadata = {
  title: "Studies",
  description: "Craft projects by Shruchi Jaiswal: Ajrak, Tangaliya, Kantha, Kalamkari, Ikat and more, in her own words.",
};

export default function StudiesPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.head}>
        <h1 className="t-display">Studies</h1>
        <p className={`t-lead ${styles.lede}`}>
          Earlier work, in her own words: projects with weavers, block printers and embroiderers, from Ajrak to Ikat.
        </p>
      </header>
      <StudyIndex headingLevel={2} />
    </div>
  );
}
