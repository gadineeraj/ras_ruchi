import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { studyImage } from "@/lib/data";
import styles from "./ProcessStrip.module.css";

// One project followed from the thing she looked at to the cloth it became.
const STEPS = [
  { verb: "Look", image: studyImage("sura", 1), alt: "A board of African masks, gathered as research for Sura", text: "African masks, each carrying an emotion, gathered on a board." },
  { verb: "Draw", image: studyImage("sura", 3), alt: "Pencil motif explorations with masks hidden in geometric pattern", text: "Motifs drawn so the faces hide inside the pattern." },
  { verb: "Make", image: studyImage("sura", 7), alt: "Carved wooden printing blocks resting on printed cloth", text: "Blocks carved, and the motifs printed as Ajrak." },
];

export function ProcessStrip() {
  return (
    <div className={styles.strip}>
      <ol className={styles.steps}>
        {STEPS.map((s) => (
          <li key={s.verb} className={styles.step}>
            <div className={styles.frame} style={{ backgroundColor: s.image.color }}>
              <Image src={s.image.src} alt={s.alt} fill sizes="(max-width: 760px) 92vw, 30vw" placeholder="blur" blurDataURL={s.image.blur} />
            </div>
            <p className={styles.verb}>{s.verb}</p>
            <p className={styles.text}>{s.text}</p>
          </li>
        ))}
      </ol>
      <Link href="/practice" className={`t-label ${styles.more}`}>
        How she works
        <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
      </Link>
    </div>
  );
}
