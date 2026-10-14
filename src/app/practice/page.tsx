import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Swatch } from "@/components/Swatch";
import { getCollection, studyImage, type Img } from "@/lib/data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Practice",
  description: "How Shruchi Jaiswal works: looking at a place, ritual or object, drawing the motif out of it, and making it into cloth.",
};

const FACTS = [
  { label: "Now", value: "Design Lead, The Yellow Dwelling, Bangalore" },
  { label: "Trained", value: "National Institute of Design (NID)" },
  { label: "Earlier", value: "Collections for This and That, Ahmedabad" },
  { label: "Crafts", value: "Ajrak, Kalamkari, Tangaliya, Kantha, Ikat, Tholu Bommalata, zari, Arashi shibori" },
];

type Example = { image: Img; alt: string; text: string; href: string };

const WAYS: { verb: string; summary: string; examples: Example[] }[] = [
  {
    verb: "Look",
    summary: "Every project starts somewhere specific: a field, a festival, a dance, a mask.",
    examples: [
      { image: studyImage("kapaas", 2), alt: "A single cotton boll on its stem", text: "Kapaas began with a walk through a cotton farm.", href: "/studies/kapaas" },
      { image: studyImage("gangireddu", 0), alt: "A decorated ox and its handlers at the Gangireddu festival", text: "Gangireddu began with the decorated oxen of an Andhra harvest festival.", href: "/studies/gangireddu" },
      { image: studyImage("ikkat-weaving", 1), alt: "Odissi dancers in costume and headgear", text: "The ikats began with Odissi dancers: their headgear, waistband and stance.", href: "/studies/ikat" },
    ],
  },
  {
    verb: "Draw",
    summary: "The motif is drawn out of what she saw, until it can repeat.",
    examples: [
      { image: studyImage("sura", 3), alt: "Pencil motif explorations with hidden masks", text: "For Sura, masks hidden inside buta, bel and jaal motifs.", href: "/studies/sura" },
      { image: studyImage("tangaliya", 1), alt: "Motifs extracted from carved Bastar furniture", text: "For Tangaliya, motifs lifted from the carving on Bastar furniture.", href: "/studies/tangaliya" },
      { image: studyImage("chitrakatha-bag", 10), alt: "Character drawings of the river goddess for the comic", text: "For Chitrakatha, characters drawn in the style of Tholu Bommalata puppets.", href: "/studies/chitrakatha-bag" },
    ],
  },
  {
    verb: "Make",
    summary: "Then the material answers: carved, woven, stitched, printed.",
    examples: [
      { image: studyImage("tangaliya", 4), alt: "Woven Tangaliya cushions on a bed", text: "Woven by the Tangaliya weavers of Gujarat.", href: "/studies/tangaliya" },
      { image: studyImage("ikkat-weaving", 7), alt: "Woven ikat samples hanging in folds", text: "Tied, dyed and woven as ikat under traditional ikat experts.", href: "/studies/ikat" },
      { image: studyImage("chitrakatha-bag", 13), alt: "Kalamkari artisans printing the bags by hand", text: "Block printed in indigo by Kalamkari artisans.", href: "/studies/chitrakatha-bag" },
    ],
  },
];

const WORDS = [
  { quote: "The fragile cotton bolls push themselves out of their protecting layers to come out and bloom.", from: "Kapaas", href: "/studies/kapaas" },
  { quote: "It was my intention to make the guests take back memories and experience from this place.", from: "Chitrakatha bag", href: "/studies/chitrakatha-bag" },
  { quote: "Ikat being one of the famous Indian textiles, I wanted to combine it with another Indian art form.", from: "Ikat weaving", href: "/studies/ikat" },
];

export default function PracticePage() {
  const kadamba = getCollection("ratna")!.designs.find((d) => d.name === "Kadamba")!;
  const kadamb = studyImage("ikkat-weaving", 3);

  return (
    <div className={`wrap ${styles.page}`}>
      <header className={styles.header}>
        <h1 className="t-display">Practice</h1>
        <p className="t-lead">
          Shruchi Jaiswal is a textile designer trained at NID. As Design Lead at The Yellow Dwelling in Bangalore she designs its curtains,
          blinds, cushions and linen, collection after collection.
        </p>
        <dl className={styles.facts}>
          {FACTS.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt className="t-label">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {WAYS.map((way) => (
        <section key={way.verb} className={styles.way} aria-labelledby={`way-${way.verb}`}>
          <div className={styles.wayHead}>
            <h2 id={`way-${way.verb}`} className={styles.verb}>
              {way.verb}
            </h2>
            <p className={`t-lead ${styles.summary}`}>{way.summary}</p>
          </div>
          <ul className={styles.examples}>
            {way.examples.map((ex) => (
              <li key={ex.href + ex.text}>
                <Link href={ex.href} className={styles.example}>
                  <span className={styles.frame} style={{ backgroundColor: ex.image.color }}>
                    <Image src={ex.image.src} alt={ex.alt} fill sizes="(max-width: 760px) 92vw, 30vw" placeholder="blur" blurDataURL={ex.image.blur} unoptimized={ex.image.animated} />
                  </span>
                  <span className={styles.exText}>{ex.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className={styles.words} aria-labelledby="words-title">
        <h2 id="words-title" className="t-display">
          In her words
        </h2>
        <div className={styles.quotes}>
          {WORDS.map((w) => (
            <figure key={w.from} className={styles.quote}>
              <blockquote>
                <p>&ldquo;{w.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="t-label">
                <Link href={w.href}>{w.from}</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`card ${styles.thread}`} aria-labelledby="thread-title">
        <span className="card-hole" style={{ top: 16, left: 16 }} aria-hidden="true" />
        <div className={styles.threadText}>
          <h2 id="thread-title" className="t-title">
            A flower that came back
          </h2>
          <p className="t-body">
            Kadamb, the flower on an Odissi dancer&rsquo;s headgear, was the first concept in her ikat study. Years later Kadamba is a design in
            Ratna, the festive collection for 2025.
          </p>
          <Link href="/collections/ratna#kadamba" className={`t-label ${styles.threadLink}`}>
            Kadamba in Ratna
            <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        <figure className={styles.then}>
          <span className={styles.frame} style={{ backgroundColor: kadamb.color }}>
            <Image src={kadamb.src} alt="Kadamb: an ikat design from the Odissi headgear" fill sizes="(max-width: 760px) 92vw, 30vw" placeholder="blur" blurDataURL={kadamb.blur} />
          </span>
          <figcaption className="t-shade">Kadamb, ikat study</figcaption>
        </figure>
        <figure className={styles.now}>
          <ul className={styles.nowChips} aria-label="Kadamba colourways">
            {kadamba.colourways.map((cw, i) => (
              <li key={cw.name}>
                <Swatch chip={cw.chip} index={i + 2} sizes="(max-width: 760px) 30vw, 10vw" alt={`Kadamba in ${cw.name}`} />
              </li>
            ))}
          </ul>
          <figcaption className="t-shade">Kadamba, Ratna 2025</figcaption>
        </figure>
      </section>
    </div>
  );
}
