import { CollectionStack } from "@/components/CollectionStack";
import { HomeHero } from "@/components/home/HomeHero";
import { ProcessStrip } from "@/components/ProcessStrip";
import { Section } from "@/components/Section";
import { ShadeMosaic } from "@/components/ShadeMosaic";
import { StudyIndex } from "@/components/StudyIndex";
import { colourwayCount, getCollections } from "@/lib/data";

export default function Home() {
  const collections = getCollections();
  const designs = collections.reduce((n, c) => n + c.designs.length, 0);
  const colourways = collections.reduce((n, c) => n + colourwayCount(c), 0);

  return (
    <>
      <HomeHero />

      <Section
        id="collections"
        title="Collections"
        lede="Five collections designed as Design Lead at The Yellow Dwelling, Bangalore. Open a card to see every design in its colourways."
      >
        <CollectionStack />
      </Section>

      <Section
        id="studies"
        title="Studies"
        lede="Earlier work, in her own words: projects with weavers, block printers and embroiderers, from Ajrak to Ikat."
      >
        <StudyIndex />
      </Section>

      <Section title="From a mask to a motif to cloth" lede="Sura, followed from what she looked at to what she printed.">
        <ProcessStrip />
      </Section>

      <Section title="Every swatch on these cards" lede={`${colourways} colourways of ${designs} designs. Each one opens its card.`}>
        <ShadeMosaic />
      </Section>
    </>
  );
}
