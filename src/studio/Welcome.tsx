"use client";

// The first time she opens the Studio: four things worth knowing.
import { useEffect } from "react";
import { useStudio } from "./state";
import { Button, Dialog } from "./ui";
import st from "./studio.module.css";

const KEY = "ras-studio-welcome-v1";

const CARDS = [
  ["Click words to change them", "Every heading and paragraph on the page can be typed into directly. Changes save themselves."],
  ["Hover between sections", "A round + Add section button appears. Pick a ready-made design and it lands right there."],
  ["Click a block for its settings", "The panel on the right holds its photo, colours, size and spacing. Hide it, move it or copy it from the dark bar above it."],
  ["Check, then publish", "Switch between Desktop, Tablet and Phone at the top. When it looks right, press Publish."],
];

export function Welcome() {
  const { dialog, setDialog } = useStudio();
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setDialog("welcome");
    } catch {}
  }, [setDialog]);
  const close = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setDialog(null);
  };
  return (
    <Dialog
      open={dialog === "welcome"}
      onClose={close}
      title="Welcome to your Studio"
      size="m"
      footer={
        <Button variant="primary" onClick={close} autoFocus>
          Start editing
        </Button>
      }
    >
      <p className={st.welcomeLead}>
        <strong>Your site, ready to change.</strong>
        Everything you see is the real page. Nothing goes live until you publish, and History keeps every earlier version.
      </p>
      <div className={st.welcome}>
        {CARDS.map(([title, body]) => (
          <div key={title} className={st.welcomeCard}>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
