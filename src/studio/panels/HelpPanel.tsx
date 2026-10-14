"use client";

// Help: how the Studio works, in her words. First steps, answers to common
// questions, the keyboard shortcuts, and the welcome tour again.
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import type { ReactNode } from "react";
import { useStudio } from "../state";
import { Button, Kbd, PanelHead, Section } from "../ui";
import p from "./panels.module.css";

const STEPS: ReactNode[] = [
  "Click any words on the page and type.",
  <>Hover between sections and press &ldquo;+ Add section&rdquo;.</>,
  "Click a block to change its photo, colours and layout on the right.",
  "Use Desktop, Tablet and Phone at the top to check every screen size.",
  "Press Publish when you're happy.",
];

const QUESTIONS: { q: string; a: ReactNode }[] = [
  {
    q: "Change a photo",
    a: "Click the photo on the page. In the settings on the right, press the photo and choose another from Photos, or drop a new file onto it.",
  },
  {
    q: "Set the important part of a photo",
    a: "Click the photo, then in its settings click the spot that matters most, like a motif or a face. When the photo is cropped for a phone or a card, that spot stays in view.",
  },
  {
    q: "Add a new page",
    a: "Open Pages on the left and press New page. Give it a name, pick a starting point and press Create page. New pages stay hidden from the published site until you switch Draft off.",
  },
  {
    q: "Put a page in the menu",
    a: "In Pages, press the three dots next to the page and choose Show in menu. To change the menu's order or wording, open Site and look under Menu.",
  },
  {
    q: "Add a new collection or design",
    a: "Open Collections on the left to add a collection, its designs and their colourways. To give a collection its own page, press New page in Pages and choose Collection page.",
  },
  {
    q: "Change colours",
    a: "Click a section or card and choose a colour in its settings on the right. The colours on offer are your palette, which you can change in Site, under Colours.",
  },
  {
    q: "Move a section",
    a: (
      <>
        Click the section, then use the up and down arrows on its toolbar. You can also press <Kbd>⌘</Kbd> <Kbd>↑</Kbd> or <Kbd>⌘</Kbd> <Kbd>↓</Kbd>.
      </>
    ),
  },
  {
    q: "Hide something without deleting it",
    a: "Click it and press Hide on its toolbar. It stays in the Studio, faded, but visitors won't see it. In its Layout settings you can also show it only on phones or only on bigger screens.",
  },
  {
    q: "Go back to an earlier version",
    a: (
      <>
        For recent changes, press Undo at the top or <Kbd>⌘</Kbd> <Kbd>Z</Kbd>. For older ones, open History: go back to a saved version of the whole site, or to an earlier copy of the page you&rsquo;re on.
      </>
    ),
  },
  {
    q: "See the site on a phone",
    a: "Switch between Desktop, Tablet and Phone at the top of the Studio to see the page at each size. Press Preview to try it the way a visitor would.",
  },
  {
    q: "Publish my changes",
    a: "Press Publish at the top. It lists what changed since last time. Check the list, then publish, and the live site updates a few minutes later.",
  },
  {
    q: "Add a video",
    a: "Hover between sections, press + Add section and choose a video. Paste a link from YouTube, Vimeo or Instagram, or upload a clip of your own.",
  },
];

const SHORTCUTS: { what: string; keys: ReactNode }[] = [
  { what: "Undo", keys: <><Kbd>⌘</Kbd><Kbd>Z</Kbd></> },
  { what: "Redo", keys: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>Z</Kbd></> },
  { what: "Find anything", keys: <><Kbd>⌘</Kbd><Kbd>K</Kbd></> },
  { what: "Save now", keys: <><Kbd>⌘</Kbd><Kbd>S</Kbd></> },
  { what: "Duplicate the block", keys: <><Kbd>⌘</Kbd><Kbd>D</Kbd></> },
  {
    what: "Move the block up or down",
    keys: (
      <>
        <Kbd>⌘</Kbd>
        <Kbd>↑</Kbd>
        <span>or</span>
        <Kbd>⌘</Kbd>
        <Kbd>↓</Kbd>
      </>
    ),
  },
  { what: "Remove the selected block", keys: <Kbd>Delete</Kbd> },
  { what: "Deselect", keys: <Kbd>Esc</Kbd> },
];

export function HelpPanel() {
  const { setDialog } = useStudio();

  return (
    <div className={p.panel}>
      <PanelHead title="Help" />
      <div className={p.body}>
        <Section title="Getting started">
          <ol className={p.steps}>
            {STEPS.map((step, i) => (
              <li key={i}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="How do I…">
          <div className={p.faq}>
            {QUESTIONS.map(({ q, a }) => (
              <details key={q}>
                <summary>
                  <span>{q}</span>
                  <CaretDownIcon size={14} weight="bold" aria-hidden="true" />
                </summary>
                <p className={p.answer}>{a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section title="Keyboard shortcuts">
          <dl className={p.keys}>
            {SHORTCUTS.map(({ what, keys }) => (
              <div key={what}>
                <dt>{what}</dt>
                <dd>{keys}</dd>
              </div>
            ))}
          </dl>
          <p className={p.hint}>The block shortcuts work on the block you last clicked.</p>
        </Section>

        <Section>
          <Button block icon={<CompassIcon size={16} />} onClick={() => setDialog("welcome")}>
            Show the welcome tour again
          </Button>
        </Section>
      </div>
    </div>
  );
}
